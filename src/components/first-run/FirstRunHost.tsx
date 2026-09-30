import { guideText as t } from "./guideCopy";
import { useEffect, useRef, useState } from "react";
import { FirstRunGuide } from "./FirstRunGuide";
import { providerDisplayName } from "../../lib/i18n";
import { isTauri, testProfileConnection } from "../../lib/ipc";
import { connectionDiagnosticMessage, profileErrorMessage } from "../../lib/connectionDiagnostics";
import { SERVICE_PROVIDERS, activeServiceProfile } from "../../lib/providerCapabilities";
import { useStore } from "../../lib/store";
import type { ServiceProvider } from "../../lib/types";
import { providerHelp } from "./providerHelp";
import { EMPTY_GUIDE_STATUS, enableGuideImmersive, getGuideStatus } from "./guideIpc";
import { consumeGuideNavigation, requestGuideEdit } from "./guideNavigation";
import type { GuideEvidence } from "./guideModel";

const DISMISS_KEY = "mimi-first-run-later-v1";
function dismissed() { try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; } }

/** Settings-only host. Browser fixture never starts providers or reports success. */
export function FirstRunHost() {
  const settings = useStore(state => state.settings);
  const sessionActive = useStore(state => state.session.isActive);
  const sessionStatus = useStore(state => state.session.status.kind);
  const sessionError = useStore(state => state.session.status.kind === "error" ? state.session.status.message : "");
  const initialized = useStore(state => state.initialized);
  const profile = activeServiceProfile(settings);
  const [open, setOpen] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [later, setLater] = useState(dismissed);
  const [status, setStatus] = useState(EMPTY_GUIDE_STATUS);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const modal = useRef<HTMLDivElement>(null);
  const launch = useRef<HTMLButtonElement>(null);
  const evidence: GuideEvidence = {
    serviceSelected: !!profile,
    credentials: profile?.credentialState === "present" ? "ready" : profile?.credentialState === "missing" ? "missing" : "unknown",
    permissions: status.permissionGranted === false ? "missing" : status.permissionGranted === true || status.captureRunning ? "ready" : "unknown",
    audio: status.nonSilentAudio ? "ready" : status.audioFramesObserved ? "silent" : "unknown",
    captionVisible: !status.synthetic && status.captionVisible,
  };
  // Native snapshots must hydrate before interpreting missing credentials.
  const automatic = initialized && profile?.credentialState === "missing" && !later;
  const visible = open || immersive || automatic;

  const close = () => {
    setOpen(false); setImmersive(false); setLater(true); setFeedback("");
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* dismissal still works this run */ }
    launch.current?.focus();
  };
  useEffect(() => {
    const consume = () => {
      const target = consumeGuideNavigation();
      if (target === "immersiveHelp") { setImmersive(true); setOpen(false); }
      if (target === "guide") { setOpen(true); setImmersive(false); setRevision(value => value + 1); }
    };
    window.addEventListener("mimi-guide-navigation", consume);
    consume();
    return () => window.removeEventListener("mimi-guide-navigation", consume);
  }, []);
  useEffect(() => {
    if (!visible) return;
    let disposed = false;
    const refresh = () => { void getGuideStatus().then(value => { if (!disposed) setStatus(value); }).catch(() => { if (!disposed) setStatus(EMPTY_GUIDE_STATUS); }); };
    refresh();
    const timer = setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [visible]);
  useEffect(() => {
    if (visible) modal.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [visible]);

  const run = async (operation: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setFeedback("");
    try { await operation(); } catch (error) { setFeedback(profileErrorMessage(error)); }
    finally { setBusy(false); }
  };
  const edit = () => {
    close();
    // The Settings listener switches category before the next animation frame.
    requestGuideEdit(profile?.id);
  };
  const select = (id: string) => void run(async () => {
    const provider = id as ServiceProvider;
    const existing = useStore.getState().settings.profiles.find(item => item.provider === provider);
    if (existing) await useStore.getState().selectProfile(existing.id);
    else {
      const snapshot = await useStore.getState().createProfile(provider, providerDisplayName(provider));
      const added = snapshot.profiles.find(item => item.provider === provider);
      if (added) await useStore.getState().selectProfile(added.id);
    }
  });
  const check = () => void run(async () => {
    if (!profile) return;
    if (!isTauri) { setFeedback(t("合成空配置：未发送凭据、音频或网络请求。认证未验证。")); return; }
    setFeedback(connectionDiagnosticMessage(await testProfileConnection(profile.id)));
  });
  const start = () => {
    if (evidence.credentials !== "ready") { edit(); return; }
    void run(async () => {
      if (!isTauri) { setFeedback(t("浏览器预览不会启动服务；没有实际字幕，尚未完成。")); return; }
      if (!sessionActive) await useStore.getState().start();
    });
  };

  return <>
    <button ref={launch} className="first-run-launch" onClick={() => { setOpen(true); setImmersive(false); setRevision(value => value + 1); }}>{t("初次使用？")}</button>
    {visible && <div className="first-run-backdrop" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={modal} role="dialog" aria-modal="true" aria-label={t("mimi 初次使用")} aria-busy={busy} onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); close(); }
        if (event.key === "Tab") {
          const buttons = modal.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]");
          if (!buttons?.length) return;
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }}>
        {immersive ? <section className="first-run"><header><span className="first-run__wordmark">mimi</span><button className="first-run__quiet" onClick={close}>{t("取消")}</button></header>
          <div className="first-run__body"><h1>{t("只留下字幕，安心看。")}</h1><p>{t("沉浸模式会隐藏字幕背景、控制面板和拖拽/缩放入口，鼠标可以穿过字幕。字幕本身仍然显示。")}</p>
          <div className="first-run__note"><strong>{t("怎么回来？")}</strong><p>{t("点菜单栏或托盘里的 mimi 图标，再关闭“沉浸模式”。")}</p><p>{t("系统支持且注册成功时，也可按 ⌘⇧M（macOS）或 Ctrl+Shift+M。Wayland 请使用桌面绑定。")}</p></div></div>
          <footer><button className="first-run__quiet" onClick={close}>{t("先保持原样")}</button><button disabled={busy} className="first-run__primary" onClick={() => void run(async () => {
            if (!isTauri) { setFeedback(t("浏览器仅预览，不更改原生沉浸状态。")); return; }
            await enableGuideImmersive(); close();
          })}>{t("知道了，开启")}</button></footer>
        </section> : <FirstRunGuide key={revision} evidence={evidence} selectedService={profile?.provider ?? "alibabaCloud"} services={SERVICE_PROVIDERS.map(provider => ({ id: provider, name: providerDisplayName(provider), description: settings.profiles.some(item => item.provider === provider) ? t("已有配置 · 可返回编辑") : t("使用自己的官方账号") }))} help={providerHelp(profile?.provider ?? "alibabaCloud")} platform={/Mac/.test(navigator.userAgent) ? "macos" : /Windows/.test(navigator.userAgent) ? "windows" : "linux"} onSelect={select} onEdit={edit} onCheck={check} onStart={start} onLater={close} busy={busy || sessionActive} />}
        {feedback && <p className="first-run-feedback" role="status">{feedback}</p>}
        {isTauri && sessionStatus === "error" && <p className="first-run-feedback" role="alert">{profileErrorMessage(sessionError)}</p>}
      </div>
    </div>}
  </>;
}
