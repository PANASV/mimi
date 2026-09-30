# Desktop three-screen visual candidate

Exact local preview source: `47ae4c51c0f15a3fd6943d633d25531e06843db0`, branch `feat/local-morning-preview`. This is separate from PR88 production integration (`08766d3`); PR85 remains held for user visual acceptance. Do not merge or release this candidate based on these images.

Actual mounted React App/FirstRunVisualCandidate, Mac ARM64 headless Chromium, 1280×900 logical at 2× (2560×1800 original PNGs), light theme, private browser profile, empty synthetic configuration. Each language has connect/audio/caption-position screens. Existing official Mimi brand artwork, no new character poses. Candidate origin `b8cdca62` from task12, then localized/mounted on the integration baseline; no generated HTML screenshots.

Observed: nine screen renders; no horizontal overflow at this viewport; eight provider options; skip dismisses. Chinese/English/Japanese pixels inspected. No provider, keychain or native recording access. Supporting caption position is an illustration, not evidence of a real caption. These are browser images, not native macOS or Linux package screenshots. Native install/interaction, short-window scrolling, focus/keyboard and final user aesthetic review remain separate acceptance.

Reproduce on this branch: one frontend `node_modules/.bin/vite --host 127.0.0.1 --port 5196 --strictPort`; open `/first-run-fixture.html?lang=zh` (or en/ja), use three step buttons. This browser fixture explicitly opens the guide and never starts a provider or reports real completion. End the frontend afterward.

The temporary frontend and headless browser were normally terminated after capture. `hashes.json` lists fixed public PNG SHA256 values; `browser-checks.json` records measured titles/layout. Previous text-heavy guide images remain historical baseline evidence, not the new after.
