//! Bounded energy-based utterance segmentation for request/response ASR.
//!
//! Splits a mono PCM16LE stream into speech utterances so each one can be
//! uploaded to an `/audio/transcriptions` endpoint. Memory is bounded by
//! `max_utterance` plus the pre-roll; no audio is retained after a segment is
//! emitted or discarded.

use std::collections::VecDeque;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SegmenterConfig {
    pub sample_rate_hz: u32,
    pub frame_ms: u32,
    /// Audio kept before the first speech frame so word onsets survive.
    pub pre_roll_ms: u32,
    /// Trailing silence that closes an utterance.
    pub end_silence_ms: u32,
    /// Hard cap; long monologues are cut here.
    pub max_utterance_ms: u32,
    /// Utterances with less speech than this are dropped (clicks, coughs).
    pub min_speech_ms: u32,
    /// Absolute RMS floor (0..=32767) below which a frame is never speech.
    pub min_rms: f32,
    /// A frame is speech when its RMS exceeds `noise_floor * speech_ratio`.
    pub speech_ratio: f32,
}

impl Default for SegmenterConfig {
    fn default() -> Self {
        Self {
            sample_rate_hz: 16_000,
            frame_ms: 20,
            pre_roll_ms: 200,
            end_silence_ms: 600,
            max_utterance_ms: 12_000,
            min_speech_ms: 300,
            min_rms: 220.0,
            speech_ratio: 2.5,
        }
    }
}

impl SegmenterConfig {
    fn samples_per_frame(&self) -> usize {
        (self.sample_rate_hz as usize * self.frame_ms as usize) / 1_000
    }
    fn frames(&self, ms: u32) -> usize {
        (ms / self.frame_ms).max(1) as usize
    }
}

/// One closed utterance: mono PCM16 samples at the configured rate.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Utterance {
    pub samples: Vec<i16>,
}

impl Utterance {
    pub fn duration_ms(&self, sample_rate_hz: u32) -> u64 {
        (self.samples.len() as u64 * 1_000) / u64::from(sample_rate_hz.max(1))
    }
}

pub struct UtteranceSegmenter {
    config: SegmenterConfig,
    /// Incomplete frame carried between `push` calls.
    partial: Vec<i16>,
    /// Odd trailing byte carried between `push` calls.
    odd_byte: Option<u8>,
    pre_roll: VecDeque<Vec<i16>>,
    current: Vec<i16>,
    in_utterance: bool,
    speech_frames: usize,
    silence_frames: usize,
    noise_floor: f32,
}

impl UtteranceSegmenter {
    pub fn new(config: SegmenterConfig) -> Self {
        Self {
            config,
            partial: Vec::new(),
            odd_byte: None,
            pre_roll: VecDeque::new(),
            current: Vec::new(),
            in_utterance: false,
            speech_frames: 0,
            silence_frames: 0,
            noise_floor: config.min_rms,
        }
    }

    pub fn config(&self) -> SegmenterConfig {
        self.config
    }

    /// Feeds PCM16LE bytes and returns every utterance closed by them.
    pub fn push(&mut self, pcm16le: &[u8]) -> Vec<Utterance> {
        let mut bytes = pcm16le;
        let mut samples = Vec::with_capacity(pcm16le.len() / 2 + 1);
        if let Some(low) = self.odd_byte.take() {
            if let Some((&high, rest)) = bytes.split_first() {
                samples.push(i16::from_le_bytes([low, high]));
                bytes = rest;
            } else {
                self.odd_byte = Some(low);
            }
        }
        let (pairs, remainder) = bytes.as_chunks::<2>();
        samples.extend(pairs.iter().map(|pair| i16::from_le_bytes(*pair)));
        if let [last] = remainder {
            self.odd_byte = Some(*last);
        }

        let frame_len = self.config.samples_per_frame();
        let mut closed = Vec::new();
        self.partial.extend_from_slice(&samples);
        let mut offset = 0;
        while self.partial.len() - offset >= frame_len {
            let frame = self.partial[offset..offset + frame_len].to_vec();
            offset += frame_len;
            if let Some(utterance) = self.process_frame(frame) {
                closed.push(utterance);
            }
        }
        self.partial.drain(..offset);
        closed
    }

    /// Closes any in-progress utterance (session finish).
    pub fn flush(&mut self) -> Option<Utterance> {
        self.partial.clear();
        self.odd_byte = None;
        self.pre_roll.clear();
        if self.in_utterance {
            return self.close();
        }
        None
    }

    pub fn reset(&mut self) {
        *self = Self::new(self.config);
    }

    fn process_frame(&mut self, frame: Vec<i16>) -> Option<Utterance> {
        let rms = rms(&frame);
        let threshold = (self.noise_floor * self.config.speech_ratio).max(self.config.min_rms);
        let is_speech = rms >= threshold;

        if !is_speech {
            // Track the ambient level only from non-speech frames, slowly.
            self.noise_floor =
                (self.noise_floor * 0.95 + rms * 0.05).max(self.config.min_rms / 4.0);
        }

        if !self.in_utterance {
            if is_speech {
                self.in_utterance = true;
                self.speech_frames = 1;
                self.silence_frames = 0;
                self.current = self.pre_roll.drain(..).flatten().collect();
                self.current.extend_from_slice(&frame);
            } else {
                self.pre_roll.push_back(frame);
                while self.pre_roll.len() > self.config.frames(self.config.pre_roll_ms) {
                    self.pre_roll.pop_front();
                }
            }
            return None;
        }

        self.current.extend_from_slice(&frame);
        if is_speech {
            self.speech_frames += 1;
            self.silence_frames = 0;
        } else {
            self.silence_frames += 1;
        }

        let length_ms =
            (self.current.len() as u64 * 1_000) / u64::from(self.config.sample_rate_hz.max(1));
        if self.silence_frames >= self.config.frames(self.config.end_silence_ms)
            || length_ms >= u64::from(self.config.max_utterance_ms)
        {
            return self.close();
        }
        None
    }

    fn close(&mut self) -> Option<Utterance> {
        let enough_speech = self.speech_frames >= self.config.frames(self.config.min_speech_ms);
        let samples = std::mem::take(&mut self.current);
        self.in_utterance = false;
        self.speech_frames = 0;
        self.silence_frames = 0;
        enough_speech.then_some(Utterance { samples })
    }
}

fn rms(frame: &[i16]) -> f32 {
    if frame.is_empty() {
        return 0.0;
    }
    let sum: f64 = frame.iter().map(|&s| f64::from(s) * f64::from(s)).sum();
    (sum / frame.len() as f64).sqrt() as f32
}

#[cfg(test)]
mod tests {
    use super::*;

    const RATE: u32 = 16_000;

    fn tone(ms: u32, amplitude: f32) -> Vec<u8> {
        let count = (RATE * ms / 1_000) as usize;
        (0..count)
            .flat_map(|i| {
                let phase = i as f32 * 2.0 * std::f32::consts::PI * 440.0 / RATE as f32;
                ((phase.sin() * amplitude) as i16).to_le_bytes()
            })
            .collect()
    }

    fn silence(ms: u32) -> Vec<u8> {
        tone(ms, 0.0)
    }

    #[test]
    fn closes_an_utterance_after_trailing_silence_with_pre_roll() {
        let mut seg = UtteranceSegmenter::new(SegmenterConfig::default());
        assert!(seg.push(&silence(1_000)).is_empty());
        assert!(seg.push(&tone(1_000, 8_000.0)).is_empty());
        let closed = seg.push(&silence(800));
        assert_eq!(closed.len(), 1);
        let ms = closed[0].duration_ms(RATE);
        // 200 ms pre-roll + 1000 ms speech + 600 ms closing silence.
        assert!((1_700..=1_900).contains(&ms), "duration {ms}");
    }

    #[test]
    fn drops_blips_shorter_than_minimum_speech() {
        let mut seg = UtteranceSegmenter::new(SegmenterConfig::default());
        seg.push(&silence(500));
        seg.push(&tone(100, 8_000.0));
        assert!(seg.push(&silence(1_000)).is_empty());
    }

    #[test]
    fn cuts_long_monologues_at_the_maximum_length() {
        let mut seg = UtteranceSegmenter::new(SegmenterConfig::default());
        let closed = seg.push(&tone(30_000, 8_000.0));
        assert_eq!(closed.len(), 2);
        for utterance in &closed {
            assert!(utterance.duration_ms(RATE) <= 12_000);
        }
        let tail = seg.flush().expect("remaining speech is flushed");
        assert!(tail.duration_ms(RATE) > 5_000);
    }

    #[test]
    fn ignores_quiet_background_noise() {
        let mut seg = UtteranceSegmenter::new(SegmenterConfig::default());
        assert!(seg.push(&tone(5_000, 150.0)).is_empty());
        assert!(seg.flush().is_none());
    }

    #[test]
    fn handles_byte_and_frame_boundaries_across_pushes() {
        let mut seg = UtteranceSegmenter::new(SegmenterConfig::default());
        let mut audio = silence(300);
        audio.extend(tone(800, 8_000.0));
        audio.extend(silence(900));
        let mut closed = Vec::new();
        for chunk in audio.chunks(333) {
            closed.extend(seg.push(chunk));
        }
        assert_eq!(closed.len(), 1);
    }

    #[test]
    fn reset_discards_buffered_audio() {
        let mut seg = UtteranceSegmenter::new(SegmenterConfig::default());
        seg.push(&tone(2_000, 8_000.0));
        seg.reset();
        assert!(seg.flush().is_none());
    }
}
