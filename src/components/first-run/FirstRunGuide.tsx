import { guideText as t } from "./guideCopy";
import { useState } from "react";
import type { GuideEvidence, GuideStep } from "./guideModel";
import { firstMissingStep, guideComplete } from "./guideModel";
import "./first-run.css";
import { openGuideLink } from "./guideIpc";

const steps: GuideStep[] = ["service", "credentials", "permissions", "audio", "caption"];
const labels: Record<GuideStep, string> = { service: t("选服务"), credentials: t("配置"), permissions: t("权限"), audio: t("声音"), caption: t("字幕") };
export interface GuideService { id: string; name: string; description: string; }
export interface GuideHelp { setup: string; fields: string; cost: string; documentationUrl: string; billingUrl: string; checkedAt: string; }

/** Controlled evidence: navigation and dismissal can never invent success. */
export function FirstRunGuide({ evidence, services, selectedService, help, platform, onSelect, onEdit, onCheck, onStart, onLater, busy = false }: {
  evidence: GuideEvidence;
  services: GuideService[];
  selectedService: string;
  help: GuideHelp;
  platform: "macos" | "windows" | "linux" | "android";
  onSelect: (id: string) => void;
  onEdit: () => void;
  onCheck?: () => void;
  busy?: boolean;
  onStart: () => void;
  onLater: () => void;
}) {
  const [step, setStep] = useState<GuideStep>(() => firstMissingStep(evidence));
  const complete = guideComplete(evidence);
  const [linkError, setLinkError] = useState("");
  const openLink = (url: string) => { setLinkError(""); void openGuideLink(url).catch(() => setLinkError(t("暂时无法打开链接，请稍后再试。"))); };
  const titles: Record<GuideStep, string> = { service: t("先把字幕准备好。"), credentials: t("连接你的服务。"), permissions: t("允许获取系统播放声音。"), audio: t("播放一小段有人说话的声音。"), caption: complete ? t("字幕出现了。") : t("正在等待翻译") };
  const permissionCopy = platform === "android" ? t("允许显示字幕浮窗，再授权本次屏幕与音频捕获。录音权限用于捕获应用播放声音；mimi 不使用麦克风。拒绝后可以回来继续。") : platform === "macos" ? t("在系统设置里允许 mimi 录制屏幕与系统音频。mimi 只听系统声音，不使用麦克风。") : platform === "windows" ? t("mimi 捕获当前输出设备的播放声音。确认视频正在你使用的输出设备上播放。") : t("需要可用的 PulseAudio 或 PipeWire 输出监视器。确认选中的输出设备正在播放。");
  const advance = () => setStep(steps[Math.min(steps.indexOf(step) + 1, steps.length - 1)]);
  return <section className="first-run" aria-label={t("mimi 首次使用引导")}>
    <header><span className="first-run__wordmark">mimi <span>{t("初次使用")}</span></span><button onClick={onLater} className="first-run__quiet">{t("稍后再说")}</button></header>
    <nav aria-label={t("引导步骤")}>{steps.map((item, index) => <button key={item} aria-current={step === item ? "step" : undefined} onClick={() => setStep(item)}><span>{index + 1}</span>{labels[item]}</button>)}</nav>
    <div className="first-run__body">
      <div className="first-run__art" aria-hidden="true" />
      <h1>{titles[step]}</h1>
      {step === "service" && <><p>{t("选你已经开通的服务就好。还没开通？下一步有官方入口。")}</p><small>{t("共 8 项服务，向下滚动查看。")}</small><div className="first-run__services">{services.map(service => <button disabled={busy} key={service.id} aria-pressed={selectedService === service.id} onClick={() => onSelect(service.id)}><strong>{service.name}</strong><small>{service.description}</small><span aria-hidden="true">{selectedService === service.id ? "●" : "○"}</span></button>)}</div></>}
      {step === "credentials" && <><p>{help.setup}</p><div className="first-run__note"><strong>{t("需要填写")}</strong><p>{help.fields}</p><a href={help.documentationUrl} target="_blank" rel="noreferrer" onClick={event => { event.preventDefault(); openLink(event.currentTarget.href); }}>{t("去官方获取与配置 ↗")}</a></div><p className="first-run__cost">{help.cost} <a href={help.billingUrl} target="_blank" rel="noreferrer" onClick={event => { event.preventDefault(); openLink(event.currentTarget.href); }}>{t("官方计费 ↗")}</a></p><small>{t("官方资料核对：")}{help.checkedAt}</small><p role="status">{evidence.credentials === "ready" ? t("凭据已保存。实际服务授权将在启动时确认。") : t("还没有保存凭据。填写后，回来继续。")}</p><button className="first-run__secondary" disabled={busy} onClick={onEdit}>{t("打开配置")}</button> {onCheck && <button className="first-run__quiet" disabled={busy} onClick={onCheck}>{t("检查配置与网络")}</button>}</>}
      {step === "permissions" && <><p>{permissionCopy}</p><div className="first-run__note"><strong>{evidence.permissions === "ready" ? t("权限已确认") : t("权限尚未确认")}</strong><p>{t("启动时如有系统提示，请按提示操作。连接服务可能产生费用。")}</p></div></>}
      {step === "audio" && <><p>{t("打开一段视频，让声音从当前输出设备播放。")}</p><div className="first-run__sound" aria-hidden="true">{[12, 22, 32, 18, 27, 38, 22, 14, 25].map((height, index) => <i key={index} style={{ height }} />)}</div><p role="status">{evidence.audio === "ready" ? t("已观测到系统播放声音。") : evidence.audio === "silent" ? t("收到的是静音。请检查音量和播放设备。") : t("还没有收到音频。请检查权限和播放设备。")}</p></>}
      {(step === "permissions" || step === "audio") && <><p>{t("开始会连接你的服务，可能产生费用。检查权限本身不会启动服务。")}</p><button className="first-run__secondary" disabled={busy} onClick={onStart}>{t("开始字幕")}</button></>}
      {step === "caption" && complete && <p>{t("可以继续看视频了。")}</p>}
    </div>
    {linkError && <p role="alert" className="first-run-feedback">{linkError}</p>}
    <footer><button className="first-run__quiet" disabled={step === "service"} onClick={() => setStep(steps[Math.max(0, steps.indexOf(step) - 1)])}>{t("← 返回")}</button><button className="first-run__primary" disabled={busy && step === "caption" && !complete} onClick={step === "caption" ? () => { if (complete) onLater(); else { setStep(firstMissingStep(evidence)); onStart(); } } : advance}>{step === "caption" ? complete ? t("去看视频吧") : t("检查并开始") : t("下一步 →")}</button></footer>
  </section>;
}
