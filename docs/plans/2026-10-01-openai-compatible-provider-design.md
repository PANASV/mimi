# OpenAI-compatible (custom endpoint) provider

## Problem

Every built-in provider pins a vendor endpoint and needs a vendor account
(Alibaba, OpenAI, Google, Azure, Volcano, Tencent, Baidu, xAI). Users who
already route their AI traffic through an OpenAI-compatible relay
(OpenRouter, self-hosted gateways, regional relays) cannot use mimi without
registering with one of those vendors.

## Decision

Add one provider, `openAICompatible`, built on the existing high-quality
pipeline (ASR finals -> serial text translation). It talks only to two
de-facto standard HTTP endpoints, each with its own base URL, key and model:

| Stage | Endpoint | Example |
|---|---|---|
| Recognition | `POST {asrBaseUrl}/audio/transcriptions` (multipart, OpenAI shape) | `https://openrouter.ai/api/v1`, `qwen/qwen3-asr-1.7b` |
| Translation | `POST {mtBaseUrl}/chat/completions` (non-streaming) | any relay, any chat model |

Translation fields are optional; empty values reuse the recognition base URL
and key, so a single OpenRouter key is enough.

### Recognition without a streaming ASR API

`/audio/transcriptions` is request/response, so mimi segments locally:

- `core::utterance_segmenter` is a pure, bounded energy segmenter over the
  16 kHz PCM16 capture: 20 ms frames, adaptive noise floor, 200 ms pre-roll,
  an utterance closes after 600 ms of silence or at 12 s, and segments
  shorter than 300 ms of speech are dropped.
- Each closed segment is WAV-encoded in memory and uploaded by one worker
  with a bounded queue (depth 4). Results are emitted as `SourceFinal`, so
  the existing ordered final-translation queue, dedup, cancellation and
  overload recovery apply unchanged. No drafts are produced; subtitle latency
  is the utterance length plus one round trip.
- Overflow of the upload queue fails the pipeline with the existing overload
  error, which triggers the existing reconnect path instead of growing memory.

### Constraints kept

- Credentials (all six fields, including URLs) live only in the OS keychain
  as one tagged JSON value, like DeepLX and Azure.
- Base URLs must be HTTPS (HTTP only for localhost), without userinfo, query
  or fragment. Redirects are disabled. Response bodies are size-capped.
- Diagnostics log lengths, durations, status codes and queue depth only,
  never recognized or translated text.
- No new crate or crate feature: the multipart body is built in
  `core::protocols::openai_compatible` and unit-tested.

## Not in scope

Streaming ASR over relays, partial (draft) subtitles, and per-model prompt
tuning. These can follow if a relay exposes a realtime transcription API.
