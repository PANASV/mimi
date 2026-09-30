# PC first-run visual candidate v2

Status: isolated visual candidate, not mounted or approved. Based on PR #85 commit `37164df1f428b055d041a9e7982bdc43cce25af2`. Integration owns installation, merging, shared host files and final preview scheduling.

Scope: new `FirstRunVisualCandidate.tsx` and `visual-candidate.css` only. Existing `FirstRunGuide`, `FirstRunHost`, native evidence/IPC, Settings, provider data and assets remain unchanged. The candidate accepts the current guide's existing props, so the integration can mount it by changing its import after inspecting the candidate. It is currently a Chinese visual proposal; English/Japanese strings must be added before replacing the production guide for those locales.

Three screens: connect a service → play system sound → start and see subtitles. Service selection includes every service supplied by the existing host. No unofficial relay or new provider is introduced. Official setup fields and billing links remain next to the service, inside an expandable section. Configuration save does not claim authorization. Missing configuration at Start calls the existing editor callback. Permission/audio evidence and actual-caption completion continue to use `guideComplete`; skipping only calls dismissal. The diagram explicitly says it is a position illustration. It never changes `captionVisible`.

Brand: the actual `src-tauri/icons/app-icon-source.png` was inspected. The unmodified original logo supplies the pink twin-tail/purple-bow/M-heart character in the candidate header. No cat, unrelated mascot, generated sheet, fabricated pose or bitmap edit is included. This reuse is an interim visual candidate; reviewed clean pose assets can replace the original later without changing behavior.

Validation: TypeScript and candidate ESLint passed. A standalone HTML three-screen layout was rendered from the actual React candidate through ReactDOMServer with synthetic absent credentials, unknown audio and waiting-caption states. It has no interactive handlers; use the mounted React component for behavior QA. No browser, dev server, native app or build was started. Runtime screenshot/viewport verification remains pending the sole integration preview slot. The current execution environment has no browser/CUA tool and no working cross-thread message tool; an attempted message to the integration thread was rejected as an unknown agent. No ownership bypass was attempted.

Before integration: confirm current baseline and file ownership; use a single scheduled lightweight preview to inspect narrow viewport, service menu, details expansion, keyboard/focus, skip/reopen/back and missing-configuration Start. Preserve native evidence callbacks; never use illustrative subtitles to report completion. Character/visual direction has not received final user approval.

## Local morning candidate integration

This candidate lives on `feat/local-morning-preview`, separate from PR88's production integration branch. PR85 remains on hold for visual acceptance; this branch is for the user-authorized local development experience, not a main merge or release.

The actual existing brand artwork is retained. Three screens show provider key → settings, video → playback output, and video → caption window position. Field requirements and pricing are expandable. Chinese/English/Japanese copy uses the existing locale mechanism; selected controls also use explicit classes for WKWebView repaint compatibility. A legacy combined DeepLX profile points to Alibaba speech setup without offering a new unsupported guide combination.

Merge conflicts preserve PR89 audio activity/endpoint handling and PR88 export fixtures, add the separate session-scoped caption evidence, and retain the new temporary preferences-only restart fixture. No real profile or credential migration occurs in UI-only mode. Synthetic subtitles cannot complete first-run evidence.

Browser inspection: actual mounted App and guide, 1280×900 at 2×, private browser profile, empty synthetic settings, three languages × three screens. No horizontal overflow; eight providers listed; skip dismisses. These are browser screenshots, not native Mac/Linux screenshots or real first-caption success. Native verification remains required for the installed candidate. Artwork is the existing logo, not new character poses; final visual approval remains with the user.
