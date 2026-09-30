//! First-run evidence is content-free and never starts capture or a provider.
use crate::commands::{AppState, SettingsNavigationTarget};
use crate::settings_store::{CredentialState, SettingsStore};
use serde::Serialize;
use tauri::{AppHandle, Manager, State, WebviewWindow};
use tauri_plugin_opener::OpenerExt;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GuideStatus {
    generation: String,
    capture_running: bool,
    non_silent_audio: bool,
    audio_frames_observed: bool,
    caption_visible: bool,
    synthetic: bool,
    permission_granted: Option<bool>,
}

pub fn start_is_configured(app: &AppHandle, settings: &SettingsStore) -> bool {
    let configured = settings
        .active_profile()
        .is_ok_and(|profile| settings.credential_state(&profile) == CredentialState::Present);
    if !configured {
        let _ =
            crate::commands::app_show_settings(app.clone(), Some(SettingsNavigationTarget::Guide));
    }
    configured
}

#[tauri::command]
pub fn guide_status(state: State<'_, AppState>) -> GuideStatus {
    let (generation, capture_running, non_silent_audio, caption_visible, audio_frames_observed) =
        state.session.guide_capture_state();
    let synthetic = crate::commands::app_is_ui_test();
    GuideStatus {
        generation: generation.to_string(),
        capture_running: capture_running && !synthetic,
        non_silent_audio: non_silent_audio && !synthetic,
        audio_frames_observed: audio_frames_observed && !synthetic,
        caption_visible: caption_visible && !synthetic,
        synthetic,
        permission_granted: if synthetic {
            None
        } else {
            permission_granted()
        },
    }
}

#[tauri::command]
pub fn guide_caption_visible(
    app: AppHandle,
    window: WebviewWindow,
    state: State<'_, AppState>,
    generation: String,
) -> Result<(), String> {
    if window.label() != "overlay" || crate::commands::app_is_ui_test() {
        return Ok(());
    }
    let Some(overlay) = app.get_webview_window("overlay") else {
        return Ok(());
    };
    if !overlay.is_visible().unwrap_or(false) {
        return Ok(());
    }
    let snapshot = state.session.current_state_event();
    if snapshot.is_overlay_collapsed
        || (snapshot.subtitles.source.text.trim().is_empty()
            && snapshot.subtitles.translation.text.trim().is_empty())
    {
        return Ok(());
    }
    if let Ok(generation) = generation.parse::<u64>() {
        state.session.guide_mark_caption_visible(generation);
    }
    Ok(())
}

#[tauri::command]
pub async fn guide_enable_immersive(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // The explicit Settings button is the only acknowledgment command. The
    // ordinary mutation stays guarded for tray, overlay and global shortcuts.
    let _lifecycle = state.session.settings_mutation_guard(false).await?;
    let previous_seen = state.settings.preferences().immersive_help_seen;
    state
        .settings
        .save_preferences(|prefs| prefs.immersive_help_seen = true)?;
    if let Err(error) = crate::commands::apply_settings_draft_guarded(
        &app,
        &state,
        crate::commands::SettingsDraft {
            subtitle_blends_with_background: Some(true),
            ..Default::default()
        },
    ) {
        let _ = state
            .settings
            .save_preferences(|prefs| prefs.immersive_help_seen = previous_seen);
        return Err(error);
    }
    Ok(())
}

/// Only fixed verified docs are accepted; arbitrary caller URLs are rejected.
#[tauri::command]
pub fn guide_open_link(app: AppHandle, url: String) -> Result<(), String> {
    const ALLOWED: &[&str] = &[
        "https://help.aliyun.com/zh/model-studio/get-api-key",
        "https://help.aliyun.com/zh/model-studio/model-pricing",
        "https://developers.openai.com/api/docs/guides/realtime",
        "https://developers.openai.com/api/docs/pricing",
        "https://ai.google.dev/gemini-api/docs/api-key",
        "https://ai.google.dev/gemini-api/docs/pricing",
        "https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio",
        "https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/",
        "https://docs.volcengine.com/docs/DoubaoVoice/SimultaneousInterpretation20APIAccessDocumentation?lang=zh",
        "https://docs.volcengine.com/docs/DoubaoVoice/BillingOverview-15?lang=zh",
        "https://cloud.tencent.com/document/product/1093/134682",
        "https://cloud.tencent.com/document/api/1093/127565",
        "https://cloud.tencent.com/document/product/1093/35686",
        "https://ai.baidu.com/ai-doc/MT/2l317egif",
        "https://ai.baidu.com/ai-doc/MT/Tl9pjqsym",
        "https://docs.x.ai/developers/quickstart",
        "https://docs.x.ai/developers/pricing",
    ];
    if !ALLOWED.contains(&url.as_str()) {
        return Err("Unknown official documentation link.".into());
    }
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|_| "Could not open official documentation.".into())
}

#[cfg(target_os = "macos")]
fn permission_granted() -> Option<bool> {
    #[link(name = "CoreGraphics", kind = "framework")]
    extern "C" {
        fn CGPreflightScreenCaptureAccess() -> bool;
    }
    // Read-only preflight; never requests permission or starts a stream.
    Some(unsafe { CGPreflightScreenCaptureAccess() })
}
#[cfg(not(target_os = "macos"))]
fn permission_granted() -> Option<bool> {
    None
}
