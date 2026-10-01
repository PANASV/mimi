import "./first-run.css";
import { guideFocusControls } from "./guideFocus";
import { guideText as t } from "./guideCopy";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FirstRunVisualCandidate } from "./FirstRunVisualCandidate";
import { providerDisplayName } from "../../lib/i18n";
import { isTauri } from "../../lib/ipc";
import { profileErrorMessage } from "../../lib/connectionDiagnostics";
import { SERVICE_PROVIDERS, activeServiceProfile } from "../../lib/providerCapabilities";
import { useStore } from "../../lib/store";
import type { ServiceProvider } from "../../lib/types";
import { ServiceProfiles } from "../../windows/settings/ServiceProfiles";
import { providerHelp } from "./providerHelp";
import { EMPTY_GUIDE_STATUS, EMPTY_GUIDE_SHORTCUTS, enableGuideImmersive, getGuideShortcuts, getGuideStatus, openGuideAudioSettings } from "./guideIpc";
import { consumeGuideNavigation } from "./guideNavigation";
import type { GuideEvidence } from "./guideModel";

const DISMISS_KEY = "mimi-first-run-later-v1";
function dismissed() { try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; } }

/** Settings-only host. Browser fixture never starts providers or reports success. */
export function FirstRunHost() {
  const settings = useStore(state => state.settings);
  const sessionActive = useStore(state => state.session.isActive);
  const sessionError = useStore(state => state.session.status.kind === "error" ? state.session.status.message : "");
  const initialized = useStore(state => state.initialized);
  const profile = activeServiceProfile(settings);
  const [open, setOpen] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [later, setLater] = useState(dismissed);
  const [status, setStatus] = useState(EMPTY_GUIDE_STATUS);
  const [shortcuts, setShortcuts] = useState(EMPTY_GUIDE_SHORTCUTS);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const formPending = useRef(false);
  const operationPending = useRef(false);
  const [revision, setRevision] = useState(0);
  const [entryTarget, setEntryTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntryTarget(document.getElementById("mimi-guide-entry")));
    return () => cancelAnimationFrame(frame);
  }, []);
  const modal = useRef<HTMLDivElement>(null);
  const launch = useRef<HTMLButtonElement>(null);
  const evidence: GuideEvidence = {
    serviceSelected: !!profile,
    credentials: profile?.credentialState === "present" ? "ready" : profile?.credentialState === "missing" ? "missing" : "unknown",
    permissions: status.permissionGranted === false ? "missing" : status.permissionGranted === true || status.captureRunning ? "ready" : "unknown",
    audio: status.nonSilentAudio ? "ready" : status.audioFramesObserved ? "silent" : "unknown",
    captionVisible: !status.synthetic && status.captionVisible,
  };
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
    const refresh = () => {
      void getGuideStatus().then(value => { if (!disposed) setStatus(value); }).catch(() => { if (!disposed) setStatus(EMPTY_GUIDE_STATUS); });
      void getGuideShortcuts().then(value => { if (!disposed) setShortcuts(value); }).catch(() => { if (!disposed) setShortcuts(EMPTY_GUIDE_SHORTCUTS); });
    };
    refresh();
    const timer = setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [visible]);
  useEffect(() => { if (visible) modal.current?.querySelector<HTMLButtonElement>("button")?.focus(); }, [visible, immersive, revision]);

  const run = async (operation: () => Promise<void>) => {
    if (operationPending.current || formPending.current) return;
    operationPending.current = true; setBusy(true); setFeedback("");
    try { await operation(); } catch (error) { setFeedback(profileErrorMessage(error)); }
    finally { operationPending.current = false; setBusy(false); }
  };
  const edit = () => requestAnimationFrame(() => modal.current?.querySelector<HTMLInputElement>(".mvg-configuration input:not(:disabled)")?.focus());
  const select = (id: string) => {
    if (sessionActive) return;
    void run(async () => {
      const provider = id as ServiceProvider;
      const existing = useStore.getState().settings.profiles.find(item => item.provider === provider);
      if (existing) await useStore.getState().selectProfile(existing.id);
      else {
        const previousIds = new Set(useStore.getState().settings.profiles.map(item => item.id));
        const snapshot = await useStore.getState().createProfile(provider, providerDisplayName(provider));
        const added = snapshot.profiles.find(item => !previousIds.has(item.id));
        if (added) await useStore.getState().selectProfile(added.id);
      }
    });
  };
  const start = () => {
    if (evidence.credentials !== "ready") { setFeedback(t("先填写服务配置。")); edit(); return; }
    void run(async () => {
      if (!isTauri) { setFeedback(t("浏览器预览不会启动服务；没有实际字幕，尚未完成。")); return; }
      if (!useStore.getState().session.isActive) await useStore.getState().start();
    });
  };
  const permissionSettings = () => void run(async () => {
    try { await openGuideAudioSettings(); }
    catch (error) {
      const code = String(error);
      setFeedback(code.includes("guide.permissions_preview") ? t("请在 mimi 应用中打开系统设置。") : code.includes("guide.permissions_manual") ? t("请在系统声音设置中检查播放设备。") : t("系统设置暂时打不开，请手动打开。"));
    }
  });
  const enableImmersive = () => void run(async () => {
    if (!isTauri) { setFeedback(t("浏览器仅预览，不更改原生沉浸状态。")); return; }
    await enableGuideImmersive();
  });
  const exitImmersive = () => void run(async () => {
    if (!isTauri) { setFeedback(t("浏览器仅预览，不更改原生沉浸状态。")); return; }
    await useStore.getState().saveSettings({ subtitleBlendsWithBackground: false });
  });
  const launchButton = <button ref={launch} className="first-run-launch settings-button settings-button--quiet settings-button--compact" onClick={() => { setOpen(true); setImmersive(false); setRevision(value => value + 1); }}>{t("使用引导")}</button>;
  return <>
    {entryTarget ? createPortal(launchButton, entryTarget) : launchButton}
    {visible && <div className="first-run-backdrop" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={modal} role="dialog" aria-modal="true" aria-label={t("mimi 初次使用")} aria-busy={busy || formBusy} onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); close(); }
        if (event.key === "Tab") {
          const controls = modal.current ? guideFocusControls(modal.current) : [];
          if (!controls.length) return;
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }}>
        {immersive ? <section className="first-run"><header><span className="first-run__wordmark">mimi</span><button className="first-run__quiet" onClick={close}>{t("取消")}</button></header>
          <div className="first-run__body"><h1>{t("只留下字幕，安心看。")}</h1><p>{t("沉浸模式会隐藏字幕背景、控制面板和拖拽/缩放入口，鼠标可以穿过字幕。字幕本身仍然显示。")}</p>
          <div className="first-run__note"><strong>{t("怎么回来？")}</strong><p>{t("点菜单栏或托盘里的 mimi 图标，再关闭“沉浸模式”。")}</p>{shortcuts.immersive && <p>{/Mac/.test(navigator.userAgent) ? "⌘⇧M" : "Ctrl+Shift+M"}</p>}</div>
          {feedback && <p role="alert">{feedback}</p>}</div>
          <footer><button className="first-run__quiet" onClick={close}>{t("先保持原样")}</button><button disabled={busy} className="first-run__primary" onClick={() => void run(async () => {
            if (!isTauri) { setFeedback(t("浏览器仅预览，不更改原生沉浸状态。")); return; }
            await enableGuideImmersive(); close();
          })}>{t("知道了，开启")}</button></footer>
        </section> : <FirstRunVisualCandidate key={revision} evidence={evidence} selectedService={profile?.provider ?? "alibabaCloud"} services={SERVICE_PROVIDERS.map(provider => ({ id: provider, name: providerDisplayName(provider), description: "" }))} help={providerHelp(profile?.provider ?? "alibabaCloud")} platform={/Mac/.test(navigator.userAgent) ? "macos" : /Windows/.test(navigator.userAgent) ? "windows" : "linux"} onSelect={select} onEdit={edit} onStart={start} onLater={close} busy={busy || formBusy} sessionActive={sessionActive} configuration={<ServiceProfiles settings={settings} sessionIsActive={sessionActive || busy} embedded onPendingChange={pending => { formPending.current = pending; setFormBusy(pending); }} />} onStop={() => void run(() => useStore.getState().stop())} onPermissionSettings={permissionSettings} onPermissionRefresh={() => void run(async () => setStatus(await getGuideStatus()))} isImmersive={settings.subtitleBlendsWithBackground} onImmersive={enableImmersive} onExitImmersive={exitImmersive} shortcuts={shortcuts} feedback={feedback || (isTauri && sessionError ? profileErrorMessage(sessionError) : "")} />}
      </div>
    </div>}
  </>;
}
