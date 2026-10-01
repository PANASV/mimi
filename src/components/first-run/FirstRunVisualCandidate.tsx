import { guideText as t } from "./guideCopy";
import { useState, type ReactNode } from "react";
import { MonitorPlay, Volume2, Captions, Check } from "lucide-react";
import type { FirstRunGuide } from "./FirstRunGuide";
import { guideComplete } from "./guideModel";
import { EMPTY_GUIDE_SHORTCUTS, openGuideLink, type GuideShortcuts } from "./guideIpc";
import logo from "../../../src-tauri/icons/app-icon-source.png";
import "./visual-candidate.css";

type Props = Parameters<typeof FirstRunGuide>[0] & {
  configuration?: ReactNode; sessionActive?: boolean; isImmersive?: boolean;
  onPermissionSettings?: () => void; onPermissionRefresh?: () => void;
  onStop?: () => void; onImmersive?: () => void; onExitImmersive?: () => void;
  shortcuts?: GuideShortcuts; feedback?: string;
};
type Screen = 0 | 1 | 2;

/** Continuous setup candidate. Only real host evidence can complete it. */
export function FirstRunVisualCandidate(props: Props) {
  const { evidence, services, selectedService, help, platform, onSelect, onEdit, onStart, onLater, busy, configuration, sessionActive = false, isImmersive = false, shortcuts = EMPTY_GUIDE_SHORTCUTS, feedback } = props;
  const [screen, setScreen] = useState<Screen>(evidence.credentials !== "ready" ? 0 : evidence.audio !== "ready" ? 1 : 2);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const complete = guideComplete(evidence);
  const selected = services.find(item => item.id === selectedService);
  const titles = [t("先连接一个翻译服务"), t("让视频的声音播放出来"), complete ? t("字幕出现了") : sessionActive ? t("正在等待翻译") : t("显示字幕")];
  const descriptions = [t("在这里填好，保存后继续。"), t("mimi 听的是电脑声音，不是麦克风。"), t("字幕在浮窗里，这里可以调整观看方式。")];
  const link = (url: string) => { setError(""); void openGuideLink(url).catch(() => setError(t("链接暂时打不开，请稍后重试。"))); };
  const permission = platform === "macos" ? t("首次使用：在系统设置中允许 mimi 录制屏幕与系统音频。") : platform === "windows" ? t("视频要从当前选中的播放设备输出。") : t("确认系统有可用的播放设备与输出监视器。");
  const start = () => {
    if (evidence.credentials !== "ready") { setScreen(0); onEdit(); return; }
    setScreen(2); onStart();
  };
  const shortcut = (key: string) => platform === "macos" ? `⌘⇧${key}` : `Ctrl+Shift+${key}`;
  return <section className="mimi-visual-guide" aria-label={t("mimi 初次使用引导")}>
    <header><span className="mvg-wordmark">mimi <span>{t("初次使用")}</span></span><button className="mvg-later" onClick={onLater}>{t("稍后设置")}</button></header>
    <nav aria-label={t("引导步骤")}>{[t("连接服务"), t("播放声音"), t("显示字幕")].map((label, index) => <button key={label} className={screen === index ? "selected" : undefined} aria-current={screen === index ? "step" : undefined} onClick={() => setScreen(index as Screen)}><span>{index + 1}</span>{label}</button>)}</nav>
    <div className="mvg-content">
      <div className="mvg-heading"><div><h1>{titles[screen]}</h1><p>{descriptions[screen]}</p></div><img src={logo} alt="" className="mvg-character" /></div>
      <div hidden={screen !== 0}>
        <div className="mvg-service-row"><span>{t("翻译服务")}</span><button className="mvg-select" disabled={busy || sessionActive} onClick={() => setMore(value => !value)} aria-expanded={more}>{selected?.name ?? t("选择服务")}<span>⌄</span></button></div>
        {more && <div className="mvg-options">{services.map(service => <button key={service.id} disabled={busy || sessionActive} className={selectedService === service.id ? "selected" : undefined} aria-pressed={selectedService === service.id} onClick={() => { onSelect(service.id); setMore(false); }}>{service.name}{selectedService === service.id && <Check size={14}/>}</button>)}</div>}
        <div className="mvg-configuration">{configuration ?? <button onClick={onEdit} disabled={busy}>{t("填写配置 →")}</button>}</div>
        <div className="mvg-inline-actions"><button onClick={() => link(help.documentationUrl)}>{t("官方开通与获取密钥 ↗")}</button></div>
        <p className="mvg-status" role="status">{evidence.credentials === "ready" ? t("配置已保存。") : t("先填写服务配置。")}</p>
        <details className="mvg-details"><summary>{t("需要哪些信息？费用怎么算？")}</summary><p>{help.setup}</p><p>{t("填写：")}{help.fields}</p><p>{help.cost} <button onClick={() => link(help.billingUrl)}>{t("官方计费 ↗")}</button></p><small>{t("官方资料核对：")}{help.checkedAt}</small></details>
      </div>
      {screen === 1 && <>
        <div className="mvg-diagram mvg-audio" aria-label={t("播放视频，声音从电脑的当前输出设备播放")}>
          <MonitorPlay size={38}/><div className="mvg-wave" aria-hidden="true">{[12,22,34,18,28,38,20].map((height,index)=><i key={index} style={{height}}/>)}</div><div className="mvg-output"><Volume2 size={28}/><strong>{t("当前播放设备")}</strong></div>
        </div>
        <div className="mvg-instruction"><span>1</span><p>{t("打开一段有人说话的视频，点播放。")}</p></div><div className="mvg-instruction"><span>2</span><p>{t("确认能听到声音，音量没有静音。")}</p></div>
        <aside className="mvg-permission">{evidence.permissions === "ready" ? t("声音权限已就绪。") : permission}
          <div className="mvg-inline-actions">{platform !== "linux" && <button disabled={busy} onClick={props.onPermissionSettings}>{platform === "macos" ? t("打开权限设置") : t("打开声音设置")}</button>}<button disabled={busy} onClick={props.onPermissionRefresh}>{t("重新检查")}</button></div>
        </aside>
        <p className="mvg-status" role="status">{evidence.audio === "ready" ? t("已收到播放声音。") : evidence.audio === "silent" ? t("目前没有声音，请检查音量。") : t("开始字幕后，mimi 会检查播放声音。")}</p>
        <p className="mvg-cost">{t("字幕开始后会使用你的翻译服务，可能产生费用。")}</p>
      </>}
      {screen === 2 && <>
        <div className="mvg-diagram mvg-caption" aria-label={t("字幕浮窗位置示意")}><div className="mvg-video"><MonitorPlay size={30}/><span>{t("正在播放的视频")}</span><div className="mvg-subtitle"><Captions size={17}/><span>{t("字幕会出现在这里")}</span></div></div><small>{t("位置示意")}</small></div>
        <p className="mvg-caption-status" role="status">{complete ? <><Check size={18}/>{t("已看到本次字幕")}</> : sessionActive ? t("正在等待翻译") : t("还没开始字幕")}</p>
        {!complete && <div className="mvg-inline-actions"><button onClick={() => { setScreen(0); onEdit(); }}>{t("修改服务")}</button><button onClick={() => setScreen(1)}>{t("检查声音与权限")}</button>{sessionActive && <button disabled={busy} onClick={props.onStop}>{t("停止字幕")}</button>}</div>}
        <div className="mvg-viewing"><h2>{t("试试沉浸模式")}</h2><p>{t("只留字幕，鼠标可以穿过去。")}</p>
          <div className="mvg-mode-actions"><button disabled={busy || isImmersive} onClick={props.onImmersive}>{t("进入沉浸模式")}</button><button disabled={busy || !isImmersive} onClick={props.onExitImmersive}>{t("退出沉浸模式")}</button>{shortcuts.immersive && <kbd>{shortcut("M")}</kbd>}</div>
          <p className="mvg-status">{isImmersive ? t("现在是沉浸模式") : t("现在是普通模式")}</p>
          <p>{t("也可以点菜单栏或托盘的 mimi 图标切换。")}</p>
        </div>
        {(shortcuts.startStop || shortcuts.subtitleDisplay) && <div className="mvg-shortcuts">{shortcuts.startStop && <span>{t("开始 / 停止")} <kbd>{shortcut("Space")}</kbd></span>}{shortcuts.subtitleDisplay && <span>{t("切换字幕显示")} <kbd>{shortcut("B")}</kbd></span>}</div>}
        {shortcuts.systemCommands && <details className="mvg-details"><summary>{t("在系统设置中绑定快捷键")}</summary>{[shortcuts.systemCommands.toggleSession, shortcuts.systemCommands.toggleImmersive, shortcuts.systemCommands.cycleSubtitleDisplay].map(command => <code key={command}>{command}</code>)}</details>}
        {!sessionActive && !complete && <p className="mvg-cost">{t("字幕开始后会使用你的翻译服务，可能产生费用。")}</p>}
      </>}
      {(error || feedback) && <p className="mvg-error" role="alert">{error || feedback}</p>}
    </div>
    <footer><button className="mvg-back" disabled={screen === 0 || busy} onClick={() => setScreen((screen - 1) as Screen)}>{t("← 返回")}</button><button className="mvg-primary" disabled={busy || (screen === 0 && evidence.credentials !== "ready") || (screen === 2 && sessionActive && !complete)} onClick={() => { if (screen === 0) setScreen(1); else if (complete && screen === 2) onLater(); else if (sessionActive) setScreen(2); else start(); }}>{screen === 0 ? t("继续 →") : complete && screen === 2 ? t("完成") : sessionActive ? t("查看字幕") : t("开始字幕")}</button></footer>
  </section>;
}
