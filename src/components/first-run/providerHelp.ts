import { guideText as t } from "./guideCopy";
import type { ServiceProvider } from "../../lib/types";
import type { GuideHelp } from "./FirstRunGuide";

// Official sources reviewed 2026-09-30. No numeric rates or relay endorsements.
const help: Record<Exclude<ServiceProvider, "deepLX">, [string, string, string, string, string]> = {
  alibabaCloud: ["开通百炼模型服务，创建北京地域的 API Key。", "Enable Model Studio and create a Beijing-region API key.", "API Key", "https://help.aliyun.com/zh/model-studio/get-api-key", "https://help.aliyun.com/zh/model-studio/model-pricing"],
  openAIRealtime: ["在 OpenAI API 平台创建项目与 API Key，确认可使用 Realtime 模型。ChatGPT 订阅不包含 API 用量。", "Create an OpenAI API project and key with Realtime access. ChatGPT subscriptions do not include API usage.", "API Key", "https://developers.openai.com/api/docs/guides/realtime", "https://developers.openai.com/api/docs/pricing"],
  googleGeminiLive: ["在 Google AI Studio 的项目里创建 Gemini API Key，确认项目可使用 Live API。", "Create a Gemini API key in Google AI Studio and check Live API availability for your project.", "API Key", "https://ai.google.dev/gemini-api/docs/api-key", "https://ai.google.dev/gemini-api/docs/pricing"],
  azureOpenAIRealtime: ["创建支持 Realtime 的 Azure OpenAI 资源，部署实时模型与转写模型。部署名称由你设置。", "Create an Azure OpenAI resource supporting Realtime. Deploy realtime and transcription models; use your own deployment names.", "Endpoint · Realtime deployment · Transcription deployment · API Key", "https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio", "https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/"],
  volcanoEngine: ["在新版豆包语音控制台实名认证、开通同声传译 2.0，再创建 API Key。mimi 使用新版 API Key，不使用旧版 AppID / Access Token。", "Verify your account and enable Simultaneous Interpretation 2.0 in the new Doubao Voice console. Mimi uses the new API key, not the legacy AppID/access token.", "API Key", "https://docs.volcengine.com/docs/DoubaoVoice/SimultaneousInterpretation20APIAccessDocumentation?lang=zh", "https://docs.volcengine.com/docs/DoubaoVoice/BillingOverview-15?lang=zh"],
  tencentCloud: ["开通腾讯云 ASR 的实时语音翻译，获取账号 AppID 与 API 密钥。后付费需自行开通。", "Enable realtime speech translation in Tencent Cloud ASR. Obtain your account AppID and API secret pair; pay-as-you-go must be enabled explicitly.", "AppID · SecretID · SecretKey", "https://cloud.tencent.com/document/api/1093/127565", "https://cloud.tencent.com/document/product/1093/35686"],
  baiduTranslate: ["在百度智能云机器翻译中创建应用，勾选实时语音翻译权限。AppKey 填应用的 API Key，不是 Secret Key。", "Create a Machine Translation app in Baidu AI Cloud with realtime speech translation access. AppKey means the app's API Key, not Secret Key.", "AppID · AppKey (API Key)", "https://ai.baidu.com/ai-doc/MT/2l317egif", "https://ai.baidu.com/ai-doc/MT/Tl9pjqsym"],
  xAIRealtime: ["在 xAI 控制台创建 API Key，并确认账号有实时语音服务额度与访问权限。", "Create an API key in the xAI console and check realtime voice access and available credits.", "API Key", "https://docs.x.ai/developers/quickstart", "https://docs.x.ai/developers/pricing"],
};
const costs: Record<Exclude<ServiceProvider, "deepLX">, [string, string]> = {
  alibabaCloud: ["按所用音频模型及翻译模型计费；各模式计量不同。", "Audio and translation models have separate, mode-specific meters."],
  openAIRealtime: ["实时翻译按音频时长计费，实际价格以当前模型为准。", "Realtime translation is billed by audio duration; check the current model rate."],
  googleGeminiLive: ["按 Live 模型的音频与文本 token 用量计费；免费额度视项目而定。", "Live audio and text tokens are metered; free-tier availability depends on your project."],
  azureOpenAIRealtime: ["按部署模型的音频/文本用量计费，区域与转写模型也影响费用。", "Audio/text usage is billed per deployed model; region and transcription also affect cost."],
  volcanoEngine: ["按音频输入、文本输出 token 用量分别计费；不固定按小时收费。", "Audio input and text output tokens are metered separately, not at a fixed hourly rate."],
  tencentCloud: ["按音频时长计费，最低计量 1 秒；实时语音翻译没有免费额度。", "Billed by audio duration, with a minimum of one second. Realtime speech translation has no free quota."],
  baiduTranslate: ["实时语音翻译按音频时长计费；免费时长依认证类型与当前额度而定。", "Realtime speech translation is billed by audio duration; trial duration depends on verification and current quota."],
  xAIRealtime: ["实时 Voice Agent 按分钟计费；请先检查余额与当前价格。", "Realtime Voice Agent is billed per minute; check your balance and current rate."],
};
export function providerHelp(provider: ServiceProvider): GuideHelp {
  // Legacy combined DeepLX profiles share Alibaba speech recognition setup.
  const guidedProvider = provider === "deepLX" ? "alibabaCloud" : provider;
  const row = help[guidedProvider];
  return { setup: t(row[0]), fields: row[2], cost: t(costs[guidedProvider][0]), documentationUrl: row[3], billingUrl: row[4], checkedAt: "2026-09-30" };
}
