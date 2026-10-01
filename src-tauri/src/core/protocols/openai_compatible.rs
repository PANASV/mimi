//! OpenAI-compatible HTTP shapes used by the custom-endpoint provider:
//! `POST {base}/audio/transcriptions` (multipart) and
//! `POST {base}/chat/completions` (JSON). Works with OpenRouter and other
//! relays that mirror the OpenAI API.

use crate::core::models::{SourceLanguage, TargetLanguage};
use serde_json::{json, Value};

pub const MAXIMUM_RESPONSE_BYTES: usize = 1024 * 1024;
const MAXIMUM_MODEL_LENGTH: usize = 200;

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum OpenAICompatibleError {
    #[error("Check the base URL in Settings. Use HTTPS (or HTTP on localhost) without credentials, query or fragment, e.g. https://openrouter.ai/api/v1.")]
    Endpoint,
    #[error("Check the model name in Settings.")]
    Model,
    #[error("The {0} service took too long to respond.")]
    Timeout(&'static str),
    #[error("Could not connect to the {0} service. Check the base URL and network.")]
    Connection(&'static str),
    #[error("The {0} service returned an invalid or empty response.")]
    Response(&'static str),
    #[error("The {0} service returned too much data.")]
    TooLarge(&'static str),
    #[error("The {stage} service rejected the request (HTTP {status}). Check the API key, model and account balance.")]
    Rejected { stage: &'static str, status: u16 },
    #[error("Speech recognition fell behind live audio. mimi is reconnecting.")]
    Backlog,
}

impl OpenAICompatibleError {
    pub fn retryable(&self) -> bool {
        matches!(
            self,
            Self::Timeout(_)
                | Self::Connection(_)
                | Self::Rejected {
                    status: 408 | 429 | 500..=599,
                    ..
                }
        )
    }

    pub fn authentication_failure(&self) -> bool {
        matches!(
            self,
            Self::Rejected {
                status: 401 | 403,
                ..
            }
        )
    }

    pub fn diagnostic_label(&self) -> String {
        match self {
            Self::Endpoint => "openai_compatible.endpoint".into(),
            Self::Model => "openai_compatible.model".into(),
            Self::Timeout(stage) => format!("openai_compatible.{stage}.timeout"),
            Self::Connection(stage) => format!("openai_compatible.{stage}.connection"),
            Self::Response(stage) => format!("openai_compatible.{stage}.response"),
            Self::TooLarge(stage) => format!("openai_compatible.{stage}.too_large"),
            Self::Rejected { stage, status } => {
                format!("openai_compatible.{stage}.rejected(code={status})")
            }
            Self::Backlog => "openai_compatible.asr.backlog".into(),
        }
    }
}

/// Validates a base URL such as `https://openrouter.ai/api/v1` and returns it
/// normalized without a trailing slash. A full endpoint path pasted by the
/// user (`.../chat/completions`, `.../audio/transcriptions`) is reduced to
/// its base so both endpoints can be derived from one value.
pub fn base_url(value: &str) -> Result<String, OpenAICompatibleError> {
    let value = value.trim();
    if value.is_empty() || value.len() > 2048 || value.chars().any(char::is_control) {
        return Err(OpenAICompatibleError::Endpoint);
    }
    let url = url::Url::parse(value).map_err(|_| OpenAICompatibleError::Endpoint)?;
    let local = matches!(url.host_str(), Some("localhost" | "127.0.0.1" | "[::1]"));
    if !(url.scheme() == "https" || url.scheme() == "http" && local)
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
        || url.query().is_some()
        || url.fragment().is_some()
    {
        return Err(OpenAICompatibleError::Endpoint);
    }
    let mut text = url.as_str().trim_end_matches('/').to_string();
    for suffix in ["/chat/completions", "/audio/transcriptions"] {
        if let Some(stripped) = text.strip_suffix(suffix) {
            text = stripped.to_string();
        }
    }
    Ok(text)
}

pub fn transcriptions_url(base: &str) -> Result<url::Url, OpenAICompatibleError> {
    url::Url::parse(&format!("{}/audio/transcriptions", base_url(base)?))
        .map_err(|_| OpenAICompatibleError::Endpoint)
}

pub fn chat_completions_url(base: &str) -> Result<url::Url, OpenAICompatibleError> {
    url::Url::parse(&format!("{}/chat/completions", base_url(base)?))
        .map_err(|_| OpenAICompatibleError::Endpoint)
}

pub fn model_name(value: &str) -> Result<String, OpenAICompatibleError> {
    let value = value.trim();
    if value.is_empty()
        || value.len() > MAXIMUM_MODEL_LENGTH
        || value.chars().any(|c| c.is_control() || c.is_whitespace())
    {
        return Err(OpenAICompatibleError::Model);
    }
    Ok(value.to_string())
}

/// Wraps mono PCM16 samples in a minimal RIFF/WAVE container.
pub fn wav_bytes(samples: &[i16], sample_rate_hz: u32) -> Vec<u8> {
    let data_len = (samples.len() * 2) as u32;
    let mut out = Vec::with_capacity(44 + data_len as usize);
    out.extend_from_slice(b"RIFF");
    out.extend_from_slice(&(36 + data_len).to_le_bytes());
    out.extend_from_slice(b"WAVEfmt ");
    out.extend_from_slice(&16u32.to_le_bytes()); // fmt chunk size
    out.extend_from_slice(&1u16.to_le_bytes()); // PCM
    out.extend_from_slice(&1u16.to_le_bytes()); // mono
    out.extend_from_slice(&sample_rate_hz.to_le_bytes());
    out.extend_from_slice(&(sample_rate_hz * 2).to_le_bytes()); // byte rate
    out.extend_from_slice(&2u16.to_le_bytes()); // block align
    out.extend_from_slice(&16u16.to_le_bytes()); // bits per sample
    out.extend_from_slice(b"data");
    out.extend_from_slice(&data_len.to_le_bytes());
    for sample in samples {
        out.extend_from_slice(&sample.to_le_bytes());
    }
    out
}

/// A `multipart/form-data` body for `/audio/transcriptions`.
pub struct TranscriptionForm {
    pub boundary: String,
    pub body: Vec<u8>,
}

impl TranscriptionForm {
    pub fn content_type(&self) -> String {
        format!("multipart/form-data; boundary={}", self.boundary)
    }
}

pub fn transcription_form(
    boundary: &str,
    model: &str,
    language: SourceLanguage,
    wav: &[u8],
) -> TranscriptionForm {
    let mut body = Vec::with_capacity(wav.len() + 512);
    let mut text_field = |name: &str, value: &str| {
        body.extend_from_slice(
            format!(
                "--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n"
            )
            .as_bytes(),
        );
    };
    text_field("model", model);
    text_field("response_format", "json");
    if let Some(code) = iso_639_1(language) {
        text_field("language", code);
    }
    body.extend_from_slice(
        format!(
            "--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"audio.wav\"\r\nContent-Type: audio/wav\r\n\r\n"
        )
        .as_bytes(),
    );
    body.extend_from_slice(wav);
    body.extend_from_slice(format!("\r\n--{boundary}--\r\n").as_bytes());
    TranscriptionForm {
        boundary: boundary.to_string(),
        body,
    }
}

/// `{"text": "..."}`; a plain-text body is accepted for relays that ignore
/// `response_format`.
pub fn parse_transcription(body: &[u8]) -> Result<String, OpenAICompatibleError> {
    let raw = std::str::from_utf8(body).map_err(|_| OpenAICompatibleError::Response("speech"))?;
    let text = match serde_json::from_str::<Value>(raw) {
        Ok(value) => value
            .get("text")
            .and_then(Value::as_str)
            .ok_or(OpenAICompatibleError::Response("speech"))?
            .to_string(),
        Err(_) if !raw.trim_start().starts_with(['{', '[']) => raw.to_string(),
        Err(_) => return Err(OpenAICompatibleError::Response("speech")),
    };
    Ok(text.trim().to_string())
}

pub fn chat_translation_request(
    model: &str,
    text: &str,
    source: SourceLanguage,
    target: TargetLanguage,
) -> Value {
    let source_name = match source {
        SourceLanguage::Automatic => "the detected source language".to_string(),
        other => english_name(other.raw_value()).to_string(),
    };
    let target_name = english_name(target.raw_value());
    json!({
        "model": model,
        "temperature": 0.2,
        "stream": false,
        "messages": [
            {
                "role": "system",
                "content": format!(
                    "You translate live speech subtitles from {source_name} into {target_name}. \
                     Reply with the translation only: no quotes, notes, romanization or explanations. \
                     Keep it natural and concise. If the text is already in {target_name}, return it unchanged."
                )
            },
            { "role": "user", "content": text }
        ]
    })
}

pub fn parse_chat_completion(body: &[u8]) -> Result<String, OpenAICompatibleError> {
    let value: Value =
        serde_json::from_slice(body).map_err(|_| OpenAICompatibleError::Response("translation"))?;
    let content = value
        .pointer("/choices/0/message/content")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|text| !text.is_empty())
        .ok_or(OpenAICompatibleError::Response("translation"))?;
    Ok(strip_reasoning(content))
}

/// Some relayed reasoning models inline `<think>...</think>` before the answer.
fn strip_reasoning(text: &str) -> String {
    match text.rfind("</think>") {
        Some(end) => text[end + "</think>".len()..].trim().to_string(),
        None => text.to_string(),
    }
}

fn iso_639_1(language: SourceLanguage) -> Option<&'static str> {
    match language.raw_value() {
        "zh" => Some("zh"),
        "en" => Some("en"),
        "ja" => Some("ja"),
        "ko" => Some("ko"),
        _ => None,
    }
}

fn english_name(code: &str) -> &'static str {
    match code {
        "zh" => "Simplified Chinese",
        "en" => "English",
        "ja" => "Japanese",
        "ko" => "Korean",
        _ => "the target language",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base_url_accepts_relays_and_reduces_pasted_endpoints() {
        assert_eq!(
            base_url(" https://openrouter.ai/api/v1/ ").unwrap(),
            "https://openrouter.ai/api/v1"
        );
        assert_eq!(
            base_url("https://relay.example.com/v1/chat/completions").unwrap(),
            "https://relay.example.com/v1"
        );
        assert_eq!(
            transcriptions_url("https://openrouter.ai/api/v1")
                .unwrap()
                .as_str(),
            "https://openrouter.ai/api/v1/audio/transcriptions"
        );
        assert_eq!(
            chat_completions_url("http://localhost:11434/v1")
                .unwrap()
                .as_str(),
            "http://localhost:11434/v1/chat/completions"
        );
    }

    #[test]
    fn base_url_rejects_unsafe_values() {
        for bad in [
            "",
            "openrouter.ai/api/v1",
            "http://relay.example.com/v1",
            "https://user:pw@relay.example.com/v1",
            "https://relay.example.com/v1?key=secret",
            "https://relay.example.com/v1#x",
            "ftp://relay.example.com",
        ] {
            assert!(base_url(bad).is_err(), "{bad}");
        }
    }

    #[test]
    fn model_names_allow_vendor_prefixes_but_not_whitespace() {
        assert_eq!(
            model_name(" qwen/qwen3-asr-1.7b ").unwrap(),
            "qwen/qwen3-asr-1.7b"
        );
        assert!(model_name("gpt 4").is_err());
        assert!(model_name("").is_err());
    }

    #[test]
    fn wav_header_describes_mono_pcm16() {
        let wav = wav_bytes(&[0, 1, -1], 16_000);
        assert_eq!(&wav[0..4], b"RIFF");
        assert_eq!(&wav[8..16], b"WAVEfmt ");
        assert_eq!(u32::from_le_bytes(wav[24..28].try_into().unwrap()), 16_000);
        assert_eq!(u32::from_le_bytes(wav[40..44].try_into().unwrap()), 6);
        assert_eq!(wav.len(), 44 + 6);
    }

    #[test]
    fn multipart_body_contains_model_language_and_file() {
        let form = transcription_form(
            "b0undary",
            "qwen/qwen3-asr-1.7b",
            SourceLanguage::English,
            b"WAVDATA",
        );
        let body = String::from_utf8_lossy(&form.body);
        assert!(body.contains("name=\"model\"\r\n\r\nqwen/qwen3-asr-1.7b\r\n"));
        assert!(body.contains("name=\"language\"\r\n\r\nen\r\n"));
        assert!(
            body.contains("filename=\"audio.wav\"\r\nContent-Type: audio/wav\r\n\r\nWAVDATA\r\n")
        );
        assert!(body.ends_with("--b0undary--\r\n"));
        assert_eq!(
            form.content_type(),
            "multipart/form-data; boundary=b0undary"
        );

        let auto = transcription_form("b", "m", SourceLanguage::Automatic, b"x");
        assert!(!String::from_utf8_lossy(&auto.body).contains("name=\"language\""));
    }

    #[test]
    fn parses_transcription_json_and_plain_text() {
        assert_eq!(
            parse_transcription(br#"{"text":" Hello there. "}"#).unwrap(),
            "Hello there."
        );
        assert_eq!(parse_transcription(b"plain words").unwrap(), "plain words");
        assert!(parse_transcription(br#"{"error":"x"}"#).is_err());
    }

    #[test]
    fn builds_and_parses_chat_translation() {
        let request = chat_translation_request(
            "deepseek/deepseek-chat",
            "Good morning",
            SourceLanguage::English,
            TargetLanguage::SimplifiedChinese,
        );
        assert_eq!(request["model"], "deepseek/deepseek-chat");
        assert_eq!(request["messages"][1]["content"], "Good morning");
        assert!(request["messages"][0]["content"]
            .as_str()
            .unwrap()
            .contains("from English into Simplified Chinese"));

        let body =
            r#"{"choices":[{"message":{"content":"<think>hmm</think>\n早上好"}}]}"#.as_bytes();
        assert_eq!(parse_chat_completion(body).unwrap(), "早上好");
        assert!(parse_chat_completion(br#"{"choices":[]}"#).is_err());
    }

    #[test]
    fn classifies_errors_for_retry_and_reauthentication() {
        let rejected = |status| OpenAICompatibleError::Rejected {
            stage: "speech",
            status,
        };
        assert!(rejected(429).retryable());
        assert!(rejected(503).retryable());
        assert!(!rejected(400).retryable());
        assert!(rejected(401).authentication_failure());
        assert_eq!(
            rejected(402).diagnostic_label(),
            "openai_compatible.speech.rejected(code=402)"
        );
    }
}
