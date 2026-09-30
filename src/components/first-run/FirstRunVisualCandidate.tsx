import { guideText as t } from "./guideCopy";
import { useState } from "react";
import { KeyRound, MonitorPlay, Volume2, Captions, ArrowRight, Check, Settings2 } from "lucide-react";
import type { FirstRunGuide } from "./FirstRunGuide";
import { guideComplete } from "./guideModel";
import { openGuideLink } from "./guideIpc";
import logo from "../../../src-tauri/icons/app-icon-source.png";
import "./visual-candidate.css";

type Props = Parameters<typeof FirstRunGuide>[0];
type Screen = 0 | 1 | 2;

/** Visual candidate only. Uses the existing host callbacks/evidence, never invents completion. */
export function FirstRunVisualCandidate(props: Props) {
  const { evidence, services, selectedService, help, platform, onSelect, onEdit, onStart, onLater, busy } = props;
  const [screen, setScreen] = useState<Screen>(evidence.credentials !== "ready" ? 0 : evidence.audio !== "ready" ? 1 : 2);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const complete = guideComplete(evidence);
  const selected = services.find(item => item.id === selectedService);
  const titles = [t("先连接一个翻译服务"), t("让视频的声音播放出来"), complete ? t("字幕出现了") : t("字幕会显示在这里")];
  const descriptions = [t("用你已经开通的账号就好。"), t("mimi 听的是电脑声音，不是麦克风。"), complete ? t("接下来可以继续看视频。") : t("字幕会显示在独立浮窗里。")];
  const link = (url: string) => { setError(""); void openGuideLink(url).catch(() => setError(t("链接暂时打不开，请稍后重试。"))); };
  const missingPermission = evidence.permissions !== "ready";
  const permission = platform === "macos" ? t("首次使用：在系统设置中允许 mimi 录制屏幕与系统音频。") : platform === "windows" ? t("视频要从当前选中的播放设备输出。") : t("确认系统有可用的播放设备与输出监视器。");
  return <section className="mimi-visual-guide" aria-label={t("mimi 初次使用引导")}>
    <header><span className="mvg-wordmark">mimi <span>{t("初次使用")}</span></span><button className="mvg-later" onClick={onLater}>{t("稍后设置")}</button></header>
    <nav aria-label={t("引导步骤")}>{[t("连接服务"), t("播放声音"), t("显示字幕")].map((label, index) => <button key={label} className={screen === index ? "selected" : undefined} aria-current={screen === index ? "step" : undefined} onClick={() => setScreen(index as Screen)}><span>{index + 1}</span>{label}</button>)}</nav>
    <div className="mvg-content">
      <div className="mvg-heading"><div><h1>{titles[screen]}</h1><p>{descriptions[screen]}</p></div><img src={logo} alt="" className="mvg-character" /></div>
      {screen === 0 && <>
        <div className="mvg-diagram mvg-connect" aria-label={t("从官方账号获取密钥，填入 mimi 配置")}>
          <div><KeyRound size={25}/><strong>{t("你的服务账号")}</strong><span>{t("获取 API Key")}</span></div><ArrowRight className="mvg-arrow" size={20}/><div><Settings2 size={25}/><strong>{t("mimi 配置")}</strong><span>{t("填写并保存")}</span></div>
        </div>
        <div className="mvg-service-row"><span>{t("翻译服务")}</span><button className="mvg-select" onClick={() => setMore(value => !value)} aria-expanded={more}>{selected?.name ?? t("选择服务")}<span>⌄</span></button></div>
        {more && <div className="mvg-options">{services.map(service => <button key={service.id} disabled={busy} className={selectedService === service.id ? "selected" : undefined} aria-pressed={selectedService === service.id} onClick={() => { onSelect(service.id); setMore(false); }}>{service.name}{selectedService === service.id && <Check size={14}/>}</button>)}</div>}
        <div className="mvg-inline-actions"><button onClick={() => link(help.documentationUrl)}>{t("官方开通与获取密钥 ↗")}</button><button onClick={onEdit} disabled={busy}>{t("填写配置 →")}</button></div>
        <p className="mvg-status" role="status">{evidence.credentials === "ready" ? t("配置已保存。") : t("先填写服务配置。")}</p>
        <details className="mvg-details"><summary>{t("需要哪些信息？费用怎么算？")}</summary><p>{help.setup}</p><p>{t("填写：")}{help.fields}</p><p>{help.cost} <button onClick={() => link(help.billingUrl)}>{t("官方计费 ↗")}</button></p><small>{t("官方资料核对：")}{help.checkedAt}</small></details>
      </>}
      {screen === 1 && <>
        <div className="mvg-diagram mvg-audio" aria-label={t("播放视频，声音从电脑的当前输出设备播放")}>
          <div className="mvg-player"><div className="mvg-player-top"><span/><span/><span/></div><MonitorPlay size={38}/><div className="mvg-player-track"><i/></div></div><div className="mvg-wave" aria-hidden="true">{[12,22,34,18,28,38,20].map((height,index)=><i key={index} style={{height}}/>)}</div><div className="mvg-output"><Volume2 size={28}/><strong>{t("当前播放设备")}</strong></div>
        </div>
        <div className="mvg-instruction"><span>1</span><p>{t("打开一段有人说话的视频，点播放。")}</p></div><div className="mvg-instruction"><span>2</span><p>{t("确认能听到声音，音量没有静音。")}</p></div>
        <aside className="mvg-permission">{missingPermission ? permission : t("声音权限已就绪。")}</aside>
        <p className="mvg-status" role="status">{evidence.audio === "ready" ? t("已收到播放声音。") : evidence.audio === "silent" ? t("目前没有声音，请检查音量。") : t("开始字幕后，mimi 会检查播放声音。")}</p>
      </>}
      {screen === 2 && <>
        <div className="mvg-diagram mvg-caption" aria-label={t("字幕浮窗位置示意")}><div className="mvg-video"><MonitorPlay size={40}/><span>{t("正在播放的视频")}</span><div className="mvg-subtitle"><Captions size={17}/><span>{t("字幕会出现在这里")}</span></div></div><small>{t("位置示意")}</small></div>
        <p className="mvg-caption-status" role="status">{complete ? <><Check size={18}/>{t("已看到本次字幕")}</> : t("正在等待翻译")}</p>
        {!complete && <button className="mvg-troubleshoot" onClick={() => setScreen(evidence.credentials !== "ready" ? 0 : 1)}>{t("没有出现？检查服务和声音 →")}</button>}
        <aside className="mvg-permission">{t("字幕开始后会使用你的翻译服务，可能产生费用。")}</aside>
      </>}
      {error && <p className="mvg-status" role="alert">{error}</p>}
    </div>
    <footer><button className="mvg-back" disabled={screen === 0} onClick={() => setScreen((screen - 1) as Screen)}>{t("← 返回")}</button><button className="mvg-primary" disabled={busy && screen === 2 && !complete} onClick={() => { if(screen < 2) setScreen((screen + 1) as Screen); else if(complete) onLater(); else if(evidence.credentials !== "ready") { setScreen(0); onEdit(); } else onStart(); }}>{screen < 2 ? t("继续 →") : complete ? t("完成") : t("开始字幕")}</button></footer>
  </section>;
}
