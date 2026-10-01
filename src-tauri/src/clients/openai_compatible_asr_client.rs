//! Request/response speech recognition over an OpenAI-compatible
//! `/audio/transcriptions` endpoint (OpenRouter, relays, local servers).
//!
//! Audio is segmented locally into utterances; each closed utterance is
//! uploaded by a single worker through a bounded queue and reported as a
//! `SourceFinal`, preserving spoken order. Mirrors `Audio3ASRClient`'s
//! surface so the high-quality pipeline can drive either recognizer.

use crate::clients::provider_events::ProviderEventSender;
use crate::core::models::SourceLanguage;
use crate::core::protocols::live_translate::LiveTranslateServerEvent;
use crate::core::protocols::openai_compatible::{
    self as protocol, OpenAICompatibleError, MAXIMUM_RESPONSE_BYTES,
};
use crate::core::utterance_segmenter::{SegmenterConfig, Utterance, UtteranceSegmenter};
use crate::pipeline_log;
use futures_util::StreamExt;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{mpsc, Mutex};
use tokio::task::JoinHandle;
use uuid::Uuid;

const UPLOAD_QUEUE_DEPTH: usize = 4;
const REQUEST_TIMEOUT: Duration = Duration::from_secs(20);
const MAX_ATTEMPTS: usize = 2;

struct Worker {
    queue: mpsc::Sender<Utterance>,
    task: JoinHandle<()>,
}

#[derive(Clone)]
pub struct OpenAICompatibleASRClient {
    endpoint: url::Url,
    api_key: String,
    model: String,
    source_language: SourceLanguage,
    client: reqwest::Client,
    segmenter: Arc<Mutex<UtteranceSegmenter>>,
    events: Arc<Mutex<Option<ProviderEventSender>>>,
    worker: Arc<Mutex<Option<Worker>>>,
    terminal_error: Arc<Mutex<Option<OpenAICompatibleError>>>,
}

impl OpenAICompatibleASRClient {
    pub fn new(
        base_url: &str,
        api_key: &str,
        model: &str,
        source_language: SourceLanguage,
    ) -> Result<Self, OpenAICompatibleError> {
        let _ = rustls::crypto::ring::default_provider().install_default();
        Ok(Self {
            endpoint: protocol::transcriptions_url(base_url)?,
            api_key: api_key.trim().to_string(),
            model: protocol::model_name(model)?,
            source_language,
            client: reqwest::Client::builder()
                .redirect(reqwest::redirect::Policy::none())
                .build()
                .map_err(|_| OpenAICompatibleError::Connection("speech"))?,
            segmenter: Arc::new(Mutex::new(UtteranceSegmenter::new(
                SegmenterConfig::default(),
            ))),
            events: Arc::new(Mutex::new(None)),
            worker: Arc::new(Mutex::new(None)),
            terminal_error: Arc::new(Mutex::new(None)),
        })
    }

    pub async fn set_event_sender(&self, sender: ProviderEventSender) {
        *self.events.lock().await = Some(sender);
    }

    /// Starts the upload worker. No network round trip happens here; the
    /// first utterance surfaces authentication or endpoint errors.
    pub async fn connect(&self) -> Result<(), OpenAICompatibleError> {
        self.disconnect().await;
        let (queue, mut receiver) = mpsc::channel::<Utterance>(UPLOAD_QUEUE_DEPTH);
        let this = self.clone();
        let task = tokio::spawn(async move {
            while let Some(utterance) = receiver.recv().await {
                this.recognize(utterance).await;
            }
            // Queue closed by finish(): tell the pipeline recognition ended.
            this.emit(LiveTranslateServerEvent::SessionFinished).await;
        });
        *self.worker.lock().await = Some(Worker { queue, task });
        pipeline_log!(
            "openai-compatible asr connected host={} model={}",
            self.endpoint.host_str().unwrap_or("-"),
            self.model
        );
        Ok(())
    }

    pub async fn send_audio(&self, pcm_data: &[u8]) -> Result<(), OpenAICompatibleError> {
        if pcm_data.is_empty() || self.terminal_error.lock().await.is_some() {
            return Ok(());
        }
        let closed = self.segmenter.lock().await.push(pcm_data);
        for utterance in closed {
            self.enqueue(utterance).await?;
        }
        Ok(())
    }

    /// Healthy while the worker runs and no terminal error was reported.
    pub async fn ping(&self, _timeout: Duration) -> Result<(), OpenAICompatibleError> {
        if let Some(error) = self.terminal_error.lock().await.clone() {
            return Err(error);
        }
        match self.worker.lock().await.as_ref() {
            Some(worker) if !worker.task.is_finished() => Ok(()),
            _ => Err(OpenAICompatibleError::Connection("speech")),
        }
    }

    /// Uploads the in-progress utterance, then waits (bounded) for the queue
    /// to drain before stopping the worker.
    pub async fn finish(&self, timeout: Duration) {
        if let Some(tail) = self.segmenter.lock().await.flush() {
            let _ = self.enqueue(tail).await;
        }
        let worker = self.worker.lock().await.take();
        if let Some(Worker { queue, mut task }) = worker {
            drop(queue);
            if tokio::time::timeout(timeout, &mut task).await.is_err() {
                task.abort();
            }
        }
        self.segmenter.lock().await.reset();
    }

    pub async fn disconnect(&self) {
        if let Some(worker) = self.worker.lock().await.take() {
            worker.task.abort();
        }
        self.segmenter.lock().await.reset();
        *self.terminal_error.lock().await = None;
    }

    async fn enqueue(&self, utterance: Utterance) -> Result<(), OpenAICompatibleError> {
        let worker = self.worker.lock().await;
        let Some(worker) = worker.as_ref() else {
            return Err(OpenAICompatibleError::Connection("speech"));
        };
        worker.queue.try_send(utterance).map_err(|_| {
            pipeline_log!("openai-compatible asr upload queue full depth={UPLOAD_QUEUE_DEPTH}");
            OpenAICompatibleError::Backlog
        })
    }

    async fn recognize(&self, utterance: Utterance) {
        let sample_rate = self.segmenter.lock().await.config().sample_rate_hz;
        let duration_ms = utterance.duration_ms(sample_rate);
        let wav = protocol::wav_bytes(&utterance.samples, sample_rate);
        let started = tokio::time::Instant::now();

        let mut attempt = 0;
        let result = loop {
            attempt += 1;
            match self.upload(&wav).await {
                Err(error) if error.retryable() && attempt < MAX_ATTEMPTS => {
                    tokio::time::sleep(Duration::from_millis(400)).await;
                }
                other => break other,
            }
        };

        match result {
            Ok(text) => {
                pipeline_log!(
                    "openai-compatible asr final audioMs={} latencyMs={} length={}",
                    duration_ms,
                    started.elapsed().as_millis(),
                    text.chars().count()
                );
                if !text.is_empty() {
                    self.emit(LiveTranslateServerEvent::SourceFinal {
                        text,
                        language: None,
                    })
                    .await;
                }
            }
            Err(error) => {
                pipeline_log!(
                    "openai-compatible asr failed label={} audioMs={}",
                    error.diagnostic_label(),
                    duration_ms
                );
                // Authentication and configuration errors are terminal; a
                // transient failure only loses this utterance.
                if error.authentication_failure()
                    || matches!(
                        error,
                        OpenAICompatibleError::Endpoint
                            | OpenAICompatibleError::Model
                            | OpenAICompatibleError::Rejected {
                                status: 400 | 402 | 404,
                                ..
                            }
                    )
                {
                    *self.terminal_error.lock().await = Some(error.clone());
                    self.emit(LiveTranslateServerEvent::Error {
                        code: error.diagnostic_label(),
                        message: error.to_string(),
                    })
                    .await;
                }
            }
        }
    }

    async fn upload(&self, wav: &[u8]) -> Result<String, OpenAICompatibleError> {
        let boundary = format!("mimi-{}", Uuid::new_v4().simple());
        let form = protocol::transcription_form(&boundary, &self.model, self.source_language, wav);
        let operation = async {
            let mut request = self
                .client
                .post(self.endpoint.clone())
                .header(reqwest::header::CONTENT_TYPE, form.content_type())
                .body(form.body);
            if !self.api_key.is_empty() {
                request = request.bearer_auth(&self.api_key);
            }
            let response = request
                .send()
                .await
                .map_err(|_| OpenAICompatibleError::Connection("speech"))?;
            let status = response.status();
            if !status.is_success() {
                return Err(OpenAICompatibleError::Rejected {
                    stage: "speech",
                    status: status.as_u16(),
                });
            }
            let body = read_capped(response, "speech").await?;
            protocol::parse_transcription(&body)
        };
        tokio::time::timeout(REQUEST_TIMEOUT, operation)
            .await
            .map_err(|_| OpenAICompatibleError::Timeout("speech"))?
    }

    async fn emit(&self, event: LiveTranslateServerEvent) {
        if let Some(events) = self.events.lock().await.as_ref() {
            let _ = events.send(event);
        }
    }
}

pub(crate) async fn read_capped(
    response: reqwest::Response,
    stage: &'static str,
) -> Result<Vec<u8>, OpenAICompatibleError> {
    if response
        .content_length()
        .is_some_and(|length| length as usize > MAXIMUM_RESPONSE_BYTES)
    {
        return Err(OpenAICompatibleError::TooLarge(stage));
    }
    let mut body = Vec::new();
    let mut stream = response.bytes_stream();
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|_| OpenAICompatibleError::Connection(stage))?;
        if body.len() + chunk.len() > MAXIMUM_RESPONSE_BYTES {
            return Err(OpenAICompatibleError::TooLarge(stage));
        }
        body.extend_from_slice(&chunk);
    }
    Ok(body)
}
