# First-run guide — review checkpoint (Refs #82)

## Latest copy correction; visual redesign remains on hold

At the user's request, the incomplete-caption page now only says “正在等待翻译”
(`Waiting for translation` / `翻訳を待っています`), keeping the existing action
and internal real-caption completion proof. The repeated acceptance-rule and
“actual caption” explanatory paragraphs are removed; the completion line is
shortened in the same three languages. Provider configuration, permission,
billing and immersion recovery information remains. This is a copy-only patch,
not the requested three-screen illustration redesign or character integration.
PR85 remains held and outside PR88. The old browser/e96 native screenshots are
previous-version evidence; new exact-head screenshots are pending and must not
be called the new after state. No local native build, install or launch occurred.

## Confirmed source behavior, baseline 5f2a595 (#71)

Initial local `origin/main` was stale at 979e351. Before production changes,
this isolated checkout moved to the already-present 5f2a595. Its three intervening
commits are 951e69e, 6d2e15a (#69), and 5f2a595 (#71). No remote or user's
working tree was changed. Before/after evidence must use 5f2a595 on both sides.

- Native settings select the service category when the resolved credential state is missing (`SettingsView.tsx`). The unavailable startup placeholder is resolved later. No first-run guide exists.
- Settings' start control is disabled for missing credentials (`settingsSessionControlModel.ts:103`); the tray instead offers Configure and opens Services (`trayModel.ts`, `TrayPanel.tsx`). Thus “Start always fails with a missing key” would be an inaccurate blanket claim.
- The global session shortcut directly calls native `session.start(true)`; configuration validation runs before provider setup (`lib.rs`, `settings_store.rs`, `session_manager.rs`). No shared first-run navigation is attached to that path.
- Native startup connects the provider **before** starting audio capture (`session_manager.rs:connect_and_listen`). An ordinary start is not a free permission or credential check. This change must not claim otherwise.
- #71 already supplies `profile_test_connection`: credential storage diagnostics and credential-free HEAD reachability only, never authentication. Azure skips the network test rather than reading the private resource URL; UI-test mode skips all provider network access. Reuse its exact result and copy instead of introducing another probe or calling Start for a check.
- Browser store defaults to a present mock credential; browser Start injects sample subtitles (`store.ts`). The dedicated preview deliberately bypasses this store. Browser examples cannot establish a real successful first subtitle.
- Immersive mode hides the background, native overlay controls and drag/resize chrome and enables mouse passthrough (`OverlayWindow.tsx`, `windows.rs`, `commands.rs`). The tray's Immersive toggle remains an actual restoration path. Cmd+Shift+M (macOS), Ctrl+Shift+M (other desktop) is registered in `lib.rs`; registration can fail and Wayland uses desktop bindings. Never promise that every machine has an active shortcut.
- Android currently checks overlay permission, requests RECORD_AUDIO, and requests MediaProjection consent from `MainActivity.kt`. RECORD_AUDIO is for playback capture, not microphone input. Platform consent and revocation need their own page.

These are source-confirmed findings, not a clean native run. Canonical native app remains reserved for #72. No user config, credential, recording, or subtitle data has been read.

## Minimal UI and shared state contract

One compact, optional card. Five directly navigable steps: service → credentials → permissions → audio → caption. An unfilled illustration slot and neutral palette; mimi means Japanese “ear”, never a cat; no forced tour, overlays pointing at every control, or large terminology blocks. Back and Later never mark a step complete. Reopen recomputes missing evidence. Start with missing state targets the earliest missing step.

`GuideEvidence` is deliberately secret-free: serviceSelected, credentials/permissions/audio evidence (`unknown`, `missing`, `denied`, `revoked`, `ready`), captionVisible. Saved credentials prove local storage only. Reachability proves network access only. A usable permission and observed non-silent captured audio require native evidence. Completion requires current-session, nonempty subtitles actually rendered by the subtitle window; a backend connection, historical subtitle, mock content, and skipped guide are insufficient.

Platform adapters own the evidence. macOS shows system-audio/screen permission instructions; Windows uses output loopback; Linux requires an output monitor; Android has separate overlay, playback RECORD_AUDIO and per-session MediaProjection consent. Revalidate on return from system settings and permission revocation. Android implementation stays outside this desktop branch to avoid #76 overlap.

Before first immersion: describe the hidden background and controls, mouse passthrough, and verified tray restoration. Provide Cancel/Enable, keep acknowledgment only after successful mutation; shortcuts cannot bypass this native guard. This needs a small backend preference/guard, not only a front-end toast.

## Provider sources (2026-09-30)

All eight existing adapters are represented in `src/components/first-run/providerHelp.ts`.
The adjacent credential help and guide use the same data. URLs were checked against
primary documentation on 2026-09-30; no rates, free-quota promises or relay suggestions
are hardcoded.

| Provider | Official setup | Official pricing | Actual Mimi fields / meter |
| --- | --- | --- | --- |
| Alibaba | https://help.aliyun.com/zh/model-studio/get-api-key | https://help.aliyun.com/zh/model-studio/model-pricing | Beijing-region API Key; audio and translation models have mode-specific meters |
| OpenAI | https://developers.openai.com/api/docs/guides/realtime | https://developers.openai.com/api/docs/pricing | API Key; realtime translation audio duration; API usage is separate from ChatGPT subscriptions |
| Gemini | https://ai.google.dev/gemini-api/docs/api-key | https://ai.google.dev/gemini-api/docs/pricing | Project API Key; Live audio/text tokens, project-dependent quota |
| Azure | https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio | https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/ | Endpoint, realtime deployment, transcription deployment, API Key; deployed model and region-specific usage |
| Volcano | https://docs.volcengine.com/docs/DoubaoVoice/SimultaneousInterpretation20APIAccessDocumentation?lang=zh | https://docs.volcengine.com/docs/DoubaoVoice/BillingOverview-15?lang=zh | New console API Key via X-Api-Key; audio input and text output tokens, not a fixed hourly rate |
| Tencent | https://cloud.tencent.com/document/api/1093/127565 | https://cloud.tencent.com/document/product/1093/35686 | AppID, SecretID, SecretKey; ASR realtime translation audio duration, minimum one second, no free quota; PAYG requires explicit activation |
| Baidu | https://ai.baidu.com/ai-doc/MT/2l317egif | https://ai.baidu.com/ai-doc/MT/Tl9pjqsym | AppID and AppKey = API Key, not Secret Key; realtime speech translation duration, quota depends on verification |
| xAI | https://docs.x.ai/developers/quickstart | https://docs.x.ai/developers/pricing | API Key; Voice Agent per-minute pricing, not standalone STT pricing |

Protocol checks: Volcano uses the new X-Api-Key header and fixed resource rather than
legacy AppID/access token. Baidu uses `aip.baidubce.com/ws/realtime_speech_trans` and
START AppID/API Key rather than text-translation access-token instructions. Tencent
uses ASR speech_translate rather than TRTC AI billing. xAI's current model page lists
Voice Agent separately from TTS and streaming/batch STT.

## Implementation and evidence

`first-run-fixture.html` mounts the actual App with empty synthetic credential states.
It never reads OS credentials or starts a provider. `?scenario=immersive` previews the
same mounted immersion explanation without changing native state. `?lang=en|ja`
exercises guide translations. The superseded standalone two-provider prototype and
cat screenshot were removed.

Settings auto-opens the optional guide after a missing-credential snapshot hydrates.
Later is persisted independently of completion; the bottom-right entry always reopens
and recomputes the earliest missing step. Editing switches to Services and retains
intent through lazy mounting, then focuses the first visible credential input. Native
cold-window guide navigation is queued behind the existing Settings readiness handshake.

`guide_status` is content-free and read-only. macOS permission preflight does not prompt
or capture. Other platforms retain unknown until actual capture is active. Permission
false takes precedence over capture, so revocation cannot appear ready. Audio evidence
comes from a per-pipeline non-silent PCM measurement; new pipelines reset it. No-frame and silent-frame states are distinguished. First-caption
acknowledgment requires a new text event in the current generation, two animation frames
of actual visible timeline text, a visible/non-collapsed native overlay, and an active
capture generation. Old retained subtitles, stopped sessions and synthetic fixtures
cannot satisfy it. No subtitle text is transmitted by the acknowledgment command.

The native immersion guard covers ordinary Settings changes, tray toggles and the global
shortcut. Its explicit acknowledgment holds the same settings lock, requests enabled=true
instead of toggling, and restores the prior acknowledgment if the mutation fails. Existing
users can still disable immersion without a prompt.

Safe native first-run fixture: `MIMI_UI_TEST=1 MIMI_UI_TEST_FIRST_RUN=1`. It resolves a new
process-specific temporary config path, provides no demo credentials, does not persist
writes and never reads user catalog/preferences/keychain. Ordinary UI-test fixtures mark the immersion explanation as previously seen, staying
compatible with existing smoke scripts; the first-run fixture explicitly does not. The development bundle is built from this branch
at base 5f2a595; no release build or user session is used for this audit.

### Browser verification, 1280 × 720, base 5f2a595

- Baseline: actual Settings/App with only browser fixture replacing default credential state;
  missing service, disabled Start, no guide.
- After: actual mounted guide; all eight services available, official setup/cost next to fields.
- Later and Escape close; focus returns to reopen entry. Reopen recomputes missing configuration.
- Back and direct step navigation do not invent evidence. Shift+Tab from the first button cycles
  to the last button.
- From the Subtitle category, “Check and start” with missing credentials switches to Services,
  opens the correct editor and focuses the API Key input. No key was entered.
- Configuration check explicitly reports synthetic/no request/no authentication verification.
- Caption page remains waiting even though Settings has its own display example.
- Immersion preview offers Cancel, the actual tray restoration path and conditional shortcut;
  clicking Enable in a browser reports preview-only and leaves native state unchanged.

Screenshots in `docs/evidence/first-run/` contain synthetic data only. They establish
first-run behavior and layout, not a real provider authorization or actual-subtitle success.
No paid session was triggered; actual end-to-end provider/capture success remains unclaimed.

Ownership: independent `src/components/first-run/*` and minimal Settings/App/ServiceProfiles,
subtitle-evidence and native-guard hunks. No toast/panel styles, DeepLX, fonts or Android
implementation. Android shares the contract and owns platform-specific consent separately
under issue #82. Character artwork awaits the user's logo-derived pose approval and is not
included in this branch.

## Native clean fixture acceptance (2026-09-30)

Canonical `/Applications/mimi-dev.app` was built from `e96aba459ecf15d2f03d4eed66cc9792ead1b6c5` on this branch and launched with `MIMI_UI_TEST=1 MIMI_UI_TEST_FIRST_RUN=1`. The process uses isolated temporary settings with absent credentials; it does not read user service keys or connect to providers.

Verified in the native WKWebView: automatic missing-credential guide; skip and reopen returning to the missing step; editor navigation focused the actual empty API Key field; diagnostic explicitly reported missing credentials, untested network and unverified authorization; caption step stayed waiting; first Settings immersion toggle opened an explanation before changing mode; explicit confirmation enabled immersion; Settings restored it; repeated enable/disable did not repeat the first-time explanation. Normal menu Quit completed and both formal/dev apps were confirmed stopped. App-scoped screenshots use only this synthetic fixture. Native shortcut/Escape injection did not produce an observable change in this run, so keyboard behavior is only browser-tested/source-verified, not claimed as native acceptance. No live sound, permission denial/revocation, paid provider or actual first caption was exercised.

CI for that tested behavior commit: all applicable jobs passed in run `36705359033`, including Windows x64/ARM64 smoke and installed Linux package smoke. A later documentation-only billing wording/URL correction avoids implying that xAI's per-minute meter necessarily means all connected time; see the current official pricing link.
