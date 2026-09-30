import { guideText as t } from "./guideCopy";
import { useState } from "react";
import type { ServiceProvider } from "../../lib/types";
import { providerHelp } from "./providerHelp";
import { openGuideLink } from "./guideIpc";
import "./first-run.css";
export function ProviderHelp({ provider }: { provider: ServiceProvider }) {
  const help = providerHelp(provider);
  const [error, setError] = useState(false);
  const open = (url: string) => { setError(false); void openGuideLink(url).catch(() => setError(true)); };
  return <details className="provider-help"><summary>{t("去哪里获取密钥？")}</summary>
    <p>{help.setup}</p><p>{t("填写")}: {help.fields}</p>
    <a href={help.documentationUrl} onClick={event => { event.preventDefault(); open(help.documentationUrl); }}>{t("官方获取与配置")} ↗</a>
    <p>{help.cost} <a href={help.billingUrl} onClick={event => { event.preventDefault(); open(help.billingUrl); }}>{t("官方计费")} ↗</a></p>
    <small>{t("资料核对")}: {help.checkedAt}</small>
    {error && <p role="alert">{t("无法打开官方页面，请稍后重试。")}</p>}
  </details>;
}
