# Android public regression evidence — #86 / #76

These are original screenshots from the Android emulator, not design mockups. This evidence-only branch contains no implementation changes, APKs, credentials, audio, or personal content. All comparisons use the same isolated Pixel 7 emulator: Android 15 / API 35, Google APIs arm64-v8a, 1080×2400, density 420, portrait, light theme, empty app configuration. Status-bar time and system connectivity icons can differ. No Google account was signed in.

## #86: first-run onboarding (issue #82)

Before: `2471629c4a8917a16179e71633fa4b33f7b4f413` (#76 base), `android-first-run/before.png`. After UI: `b84705042000afe7b1d2568a64576d40b0805b31`. Final implementation/build: `1e7de491646929871cfd1854f46b1ce3dd3c7c6a`; the final delta only corrects the xAI pricing URL, so does not alter the screens. APK hashes and check counts are in [verification.json](android-first-run/verification.json).

The same fresh-install, Chinese/light comparison now opens the five-step guide. Full galleries: [Chinese/light](android-first-run/zh-light), [Japanese/light](android-first-run/ja-light), [English/dark](android-first-run/en-dark). Each has 16 screenshots. English/dark is a locale/theme regression, not the before/after pair.

Observed on the actual emulator: first-run entry, keyboard focus, missing/saved credentials, permission unknown, Android overlay settings, overlay denial, Android RECORD_AUDIO prompt/refusal, test-shell permission grants, real MediaProjection dialog cancellation, overlay revocation, no-session audio, incomplete caption, and upgraded-install suppression. The credential fixture is the synthetic string `synthetic-ui-fixture-never-sent`. Saving it tests encrypted persistence only; authentication was not performed. Shell grants are test setup, not a user permission flow. MediaProjection was canceled; no provider or playback capture session started. The sample caption on the home screen never counts as completion.

Reproduce in a disposable checkout of the UI SHA and a dedicated API 35 emulator:

```sh
cd android
./gradlew --max-workers=2 -Pkotlin.compiler.execution.strategy=in-process testDebugUnitTest testReleaseUnitTest lintDebug assembleDebug assembleRelease assembleDebugAndroidTest
adb -s emulator-5582 install -r app/build/outputs/apk/debug/app-debug.apk
adb -s emulator-5582 install -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb -s emulator-5582 shell am instrument -w -e first_run true -e locale zh -e theme light app.yuxino.mimi.android.test/app.yuxino.mimi.android.UiSmokeInstrumentation
```

Repeat with `locale ja/theme light`, then `locale en/theme dark`. Retrieve the instrumentation screenshots from the path reported by the harness. Run without `first_run` for the existing settings smoke (8 screens). Clear fixture app data and restore appops on the dedicated emulator afterward. Baseline: install the exact #76 debug APK on the same clean emulator, launch MainActivity and capture the home screen without configuring a provider.

Debug and release unit tests: 39 each, zero failures. Android lint: zero errors. Debug APK and unsigned release APK built. Synthetic state tests cover PCM and caption evidence boundaries; screenshots deliberately show an incomplete session.

## #76: capture-health home affordance (issue #78)

Before source: `5f2a595cbc276d6f45ec016ebbef08f6a01d27cb`. After source: `2471629c4a8917a16179e71633fa4b33f7b4f413`. Both debug APKs were rebuilt from exact source archives for this evidence, then installed and app data cleared separately on the same emulator. See [capture-health evidence](android-capture-health) and its provenance JSON. The emulator initially had a slow startup and a System UI ANR, then recovered; its dialog was dismissed before these captures. The screenshots compare the idle home diagnostics affordance. They do not prove live capture or provider health.

Reproduce for each SHA: build `assembleDebug`, install its debug APK, `adb shell pm clear app.yuxino.mimi.android`, launch `app.yuxino.mimi.android/.MainActivity`, and capture with `adb exec-out screencap -p` after layout settles. Do not enter credentials or start capture. #76's recorded checks: debug/release unit tests 38 each; five synthetic CaptureHealth tests; lint zero errors (12 warnings); API 35 settings smoke 8 light / 8 dark. These earlier checks are distinct from the evidence refresh, which rebuilt APKs and captured fresh idle UI only.

## Untested scope

No real key, paid provider session, user audio, real non-silent provider PCM, or actual live caption completion was tested. Synthetic PCM/model tests do not establish end-to-end transcription. No physical Android 10/14/15 device or Bluetooth route was tested. Source opt-out, DRM, voice-call exclusions and lock-screen/session-stop behavior have not been proven with real-device capture here. No release, merge or distribution occurred. The character sheet remains a review reference and is not shipped.
