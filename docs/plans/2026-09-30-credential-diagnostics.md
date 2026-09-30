# Credential and connection diagnostics

The service editor exposes one explicit Test connection action. It reads only the selected profile's keychain item and reports secure storage, credential configuration, and an independent bounded (8 seconds) credential-free HTTPS HEAD probe. Every HTTP status, including unauthenticated 401/403/405, means server reachability; none proves authentication, WebSocket upgrade, model access or account balance. Redirects are disabled. No audio, provider session, auth header, response body or raw error crosses this path. Azure is reported as not tested because its resource endpoint is stored with private credentials. UI-test mode never contacts providers.

Stable storage and authentication labels are localized in settings, tray and shortcut-triggered overlay. Unknown settings errors use generic safe copy. Saved credential presence is never described as a valid key. Storage failures cannot fall back to plaintext.

Debian installation promotes the existing Secret Service recommendation to a GNOME Keyring dependency (the Secret Service implementation exercised by the Linux smoke test) so normal package installation supplies a password store without manual command instructions. This does not guarantee an unlocked desktop session: existing GNOME/KDE sessions, user authorization and headless/AppImage hosts still vary. Mimi does not install services, alter PAM or bypass unlock prompts. A complete zero-interaction cross-distribution workflow is outside this change.

Tests use synthetic values and mocked results. Actual provider authentication is deliberately deferred to an explicitly started subtitle session, whose possible billing is explained before the check; no paid long-running test is automatic.

Native package readiness in UI-test mode must invoke the diagnostic from the settings window and validate its safe fixture response before marking the frontend ready. This exercises command registration and Tauri ACL in the actual installed binary. Only app-settings permits the command; other window capabilities cannot invoke it.
