//! Text translation over an OpenAI-compatible `/chat/completions` endpoint.
//! Bounded, cancellable, no redirects, no server-message logging.

use crate::clients::openai_compatible_asr_client::read_capped;
use crate::core::models::{SourceLanguage, TargetLanguage};
use crate::core::protocols::openai_compatible::{self as protocol, OpenAICompatibleError};
use std::time::Duration;

pub struct OpenAICompatibleChatClient {
    endpoint: url::Url,
    api_key: String,
    model: String,
    source: SourceLanguage,
    target: TargetLanguage,
    client: reqwest::Client,
    timeout: Duration,
}

impl OpenAICompatibleChatClient {
    pub fn new(
        base_url: &str,
        api_key: &str,
        model: &str,
        source: SourceLanguage,
        target: TargetLanguage,
    ) -> Result<Self, OpenAICompatibleError> {
        let _ = rustls::crypto::ring::default_provider().install_default();
        Ok(Self {
            endpoint: protocol::chat_completions_url(base_url)?,
            api_key: api_key.trim().to_string(),
            model: protocol::model_name(model)?,
            source,
            target,
            client: reqwest::Client::builder()
                .redirect(reqwest::redirect::Policy::none())
                .build()
                .map_err(|_| OpenAICompatibleError::Connection("translation"))?,
            timeout: Duration::from_secs(12),
        })
    }

    /// Connection test: translates one short word to verify URL, key and model.
    pub async fn probe(&self) -> Result<(), OpenAICompatibleError> {
        self.translate("Hello", Some(SourceLanguage::English))
            .await
            .map(|_| ())
    }

    pub async fn translate(
        &self,
        text: &str,
        source: Option<SourceLanguage>,
    ) -> Result<String, OpenAICompatibleError> {
        let body = protocol::chat_translation_request(
            &self.model,
            text,
            source.unwrap_or(self.source),
            self.target,
        );
        let operation = async {
            let mut request = self.client.post(self.endpoint.clone()).json(&body);
            if !self.api_key.is_empty() {
                request = request.bearer_auth(&self.api_key);
            }
            let response = request.send().await.map_err(|error| {
                if error.is_timeout() {
                    OpenAICompatibleError::Timeout("translation")
                } else {
                    OpenAICompatibleError::Connection("translation")
                }
            })?;
            let status = response.status();
            if !status.is_success() {
                return Err(OpenAICompatibleError::Rejected {
                    stage: "translation",
                    status: status.as_u16(),
                });
            }
            let body = read_capped(response, "translation").await?;
            protocol::parse_chat_completion(&body)
        };
        tokio::time::timeout(self.timeout, operation)
            .await
            .map_err(|_| OpenAICompatibleError::Timeout("translation"))?
    }
}
