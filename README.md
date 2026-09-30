# Android guide copy — real API35 UI

Source: integration `08766d354be56ffedc2883da75754ec609a4beda`. The Android source tree exactly matches the local `ff17d26095d75f03d249abb8048adf3033bb02ab` from which these APKs were built. Desktop preview changes are unrelated.

- App APK SHA256: `5fc214db00643c6a9c9a0f6b7303f319abdad8e71e6bc9da9b005b06b20235b0`
- Instrumentation APK SHA256: `6584d9126563f1d6c5b9e572182b68ddf8f0307df194c761aa3e1e75c6f3a313`
- Dedicated blank headless API35 Google APIs ARM64 Pixel7 emulator. Actual native Android screenshots, 1080×2400, density420, light theme, Chinese/English/Japanese.
- Each locale: open permission page, open waiting page, inject a stopped-sharing label in instrumentation only, refresh, inspect and click the reopen button. Three native frames per locale; nine total. All three runs passed.
- This also exposed a real repeated-open dialog ownership race: delayed dismissal of the old dialog cleared the new one. The callback now clears only its own dialog. The failing result was investigated, fixed and re-run successfully; failed frames are excluded here.
- No credentials saved, no overlay/audio permissions requested, no MediaProjection session, no provider network/paid use. State was synthetic. The dedicated app data was cleared and this emulator normally stopped afterward.
- Not a real audio, permission revocation, Android10/14 physical, Bluetooth or first-real-caption test. It does not re-run the previous 48-frame guide suite.

Reproduce on a dedicated blank API35 emulator after installing the app and instrumentation APK:

```sh
adb shell am instrument -w -e guide_copy true -e locale zh -e theme light app.yuxino.mimi.android.test/app.yuxino.mimi.android.UiSmokeInstrumentation
# Repeat locale en and ja; images are in the fixture app's external files/ui-preview.
```

The previous wording is in [source guide evidence](https://github.com/yuxino/mimi/blob/f1ca9db23532d4c5ec5c8a1ee5b0eb0242791a0e/README.md). These images are the updated wording, not reused previous after shots. `hashes.json` lists public asset SHA256 values.
