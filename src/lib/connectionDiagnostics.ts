import { effectiveUiLanguage, I18N } from "./i18n";
import type { ConnectionDiagnostic } from "./ipc";

const copy = {
  en: {
    storage: "Mimi cannot securely save or read your key. If your system asks to unlock password storage, allow it, then test again. On Linux, the Mimi .deb installer supplies password storage; an AppImage needs a desktop with password storage available.",
    missing: "No credentials configured. Save this service's credentials in Settings, then start subtitles to verify authentication.",
    invalid: "The saved credentials could not be read. Save them again.",
    auth: "The service rejected authentication. Check the key, service region, account permissions and expiry in the provider console, then replace the saved credentials.",
    reachable: "Network: server reachable (DNS/TLS/HTTP). Authentication and model access have not been tested; an HTTP 401 without credentials is expected. Starting subtitles may incur provider charges.",
    timeout: "Network: connection timed out. Check your network, proxy and firewall, then test again.",
    unreachable: "Network: secure connection failed. Check your network, proxy, firewall and system clock, then test again.",
    notTested: "Network: not tested. Azure requires its configured resource endpoint. UI test mode never contacts providers.",
    present: "Secure storage: credentials configured; validity has not been verified.",
    test: "Test connection",
    testing: "Checking…",
    note: "Checks secure storage and server reachability without sending credentials or audio. Does not start a translation session or verify authentication.",
  },
  zh: {
    storage: "Mimi 暂时无法安全保存或读取密钥。如果系统询问是否解锁密码存储，请允许后重新测试。Linux 的 Mimi .deb 安装包会提供密码存储；AppImage 需要桌面已支持密码存储。",
    missing: "尚未配置凭据。请在设置中保存此服务的凭据，再启动字幕验证认证。",
    invalid: "无法读取已保存的凭据，请重新保存。",
    auth: "服务拒绝了认证。请在服务商控制台检查密钥、服务区域、账号权限和有效期，再替换已保存的凭据。",
    reachable: "网络：服务器可达（DNS/TLS/HTTP）。尚未验证认证或模型权限；未携带凭据时返回 HTTP 401 属于预期结果。启动字幕可能产生服务商费用。",
    timeout: "网络：连接超时。请检查网络、代理和防火墙，然后重新测试。",
    unreachable: "网络：安全连接失败。请检查网络、代理、防火墙和系统时间，然后重新测试。",
    notTested: "网络：未测试。Azure 需要已配置的资源地址；界面测试模式不会连接服务商。",
    present: "安全存储：已配置凭据，尚未验证有效性。",
    test: "测试连接",
    testing: "正在检查…",
    note: "检查安全存储和服务器可达性，不发送凭据或音频，不启动翻译会话，也不验证认证。",
  },
  ja: {
    storage: "安全なストレージを利用できません。Linux では GNOME Keyring などの Secret Service をデスクトップセッションでインストールして解除してください。macOS/Windows では資格情報ストアを解除し Mimi のアクセスを許可して再テストしてください。平文では保存しません。",
    missing: "認証情報が未設定です。設定で保存してから字幕を開始し認証を確認してください。",
    invalid: "保存された認証情報を読めません。もう一度保存してください。",
    auth: "認証が拒否されました。プロバイダーでキー、リージョン、権限、有効期限を確認し、保存した認証情報を更新してください。",
    reachable: "ネットワーク：サーバーに到達できました（DNS/TLS/HTTP）。認証とモデル権限は未確認です。認証情報なしの HTTP 401 は正常です。字幕の開始には料金が発生する場合があります。",
    timeout: "ネットワーク：タイムアウト。接続、プロキシ、ファイアウォールを確認して再テストしてください。",
    unreachable: "ネットワーク：安全な接続に失敗。接続、プロキシ、ファイアウォール、システム時刻を確認してください。",
    notTested: "ネットワーク：未確認。Azure は設定されたリソース URL が必要です。UI テストでは通信しません。",
    present: "安全なストレージ：認証情報は設定済み、有効性は未確認です。",
    test: "接続をテスト",
    testing: "確認中…",
    note: "認証情報や音声を送信せずストレージと到達性を確認します。翻訳セッションの開始や認証確認は行いません。",
  },
};
export function diagnosticCopy() { return copy[effectiveUiLanguage()]; }
export function connectionDiagnosticMessage(result: ConnectionDiagnostic): string {
  const labels = diagnosticCopy();
  return `${result.credential === "unavailable" ? labels.storage : labels[result.credential]} ${labels[result.network]}`;
}
/** Match only sanitized backend labels; never interpolate arbitrary native errors. */
export function credentialErrorMessage(error: unknown): string | null {
  if (typeof error !== "string") return null;
  if (error === "credential_store_unavailable" || error === "The system credential store is unavailable.") return diagnosticCopy().storage;
  if (["The live translation transport failed.", "The OpenAI Realtime Translation connection failed."].includes(error)) return diagnosticCopy().unreachable;
  if (["The live translation connection could not be established in time.", "The live translation connection stopped responding.", "The OpenAI Realtime Translation connection stopped responding."].includes(error)) return diagnosticCopy().timeout;
  if (error === "credential_authentication_failed") return diagnosticCopy().auth;
  if (/^Add the connection credentials for .+ in Settings\.$/.test(error)) return diagnosticCopy().missing;
  if (/^(The saved credentials could not be read\.|The saved credentials do not match the selected service\.|One or more credential fields are invalid\.)$/.test(error)) return diagnosticCopy().invalid;
  return null;
}
export function profileErrorMessage(error: unknown): string {
  return credentialErrorMessage(error) ?? I18N.settings.profileActionFailed;
}
