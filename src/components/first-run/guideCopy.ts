import { effectiveUiLanguage } from "../../lib/i18n";
const copy: Record<string, [string, string]> = {
  "使用引导": ["Getting started", "使い方"],
  "在这里填好，保存后继续。": ["Enter your details here, then save to continue.", "ここで入力し、保存して次へ進みます。"],
  "字幕在浮窗里，这里可以调整观看方式。": ["Captions appear in a floating window. Choose how you watch here.", "字幕はフローティングウィンドウに表示されます。ここで表示を切り替えられます。"],
  "打开权限设置": ["Open access settings", "権限の設定を開く"],
  "打开声音设置": ["Open sound settings", "サウンド設定を開く"],
  "重新检查": ["Check again", "もう一度確認"],
  "修改服务": ["Edit service", "サービスを編集"],
  "检查声音与权限": ["Check audio and access", "音声と権限を確認"],
  "停止字幕": ["Stop captions", "字幕を停止"],
  "还没开始字幕": ["Captions have not started", "字幕はまだ開始していません"],
  "试试沉浸模式": ["Try immersive mode", "没入モードを試す"],
  "只留字幕，鼠标可以穿过去。": ["Keep just the captions. Clicks pass through them.", "字幕だけを残し、クリックは字幕を通過します。"],
  "进入沉浸模式": ["Enter immersive mode", "没入モードに切り替える"],
  "退出沉浸模式": ["Exit immersive mode", "没入モードを終了"],
  "现在是沉浸模式": ["Immersive mode is on", "没入モードです"],
  "现在是普通模式": ["Standard mode is on", "通常モードです"],
  "也可以点菜单栏或托盘的 mimi 图标切换。": ["You can also switch from the mimi menu-bar or tray icon.", "メニューバーまたはトレイの mimi アイコンからも切り替えられます。"],
  "开始 / 停止": ["Start / stop", "開始 / 停止"],
  "切换字幕显示": ["Switch caption display", "字幕表示を切り替える"],
  "在系统设置中绑定快捷键": ["Set shortcuts in desktop settings", "デスクトップの設定でショートカットを割り当てる"],
  "查看字幕": ["View captions", "字幕を見る"],
  "请在 mimi 应用中打开系统设置。": ["Open system settings from the mimi app.", "mimi アプリからシステム設定を開いてください。"],
  "请在系统声音设置中检查播放设备。": ["Check your playback device in sound settings.", "サウンド設定で再生デバイスを確認してください。"],
  "系统设置暂时打不开，请手动打开。": ["Could not open system settings. Please open them manually.", "システム設定を開けませんでした。手動で開いてください。"],
  "先连接一个翻译服务": ["Connect a translation service", "翻訳サービスを接続"],
  "让视频的声音播放出来": ["Play your video with sound", "動画の音声を再生"],
  "字幕出现了": ["Your captions are showing", "字幕が表示されました"],
  "字幕会显示在这里": ["Your captions appear here", "字幕はここに表示されます"],
  "用你已经开通的账号就好。": ["Use a provider account you already have.", "お使いのサービスのアカウントで接続できます。"],
  "mimi 听的是电脑声音，不是麦克风。": ["mimi listens to computer playback, not your microphone.", "mimi はパソコンの再生音声を聞きます。マイクは使いません。"],
  "接下来可以继续看视频。": ["You can keep watching.", "そのまま視聴できます。"],
  "字幕会显示在独立浮窗里。": ["Captions appear in a separate floating window.", "字幕は独立したフローティングウィンドウに表示されます。"],
  "链接暂时打不开，请稍后重试。": ["Could not open the link. Please try again.", "リンクを開けませんでした。あとでお試しください。"],
  "首次使用：在系统设置中允许 mimi 录制屏幕与系统音频。": ["Allow screen and system audio recording in System Settings.", "システム設定で画面とシステム音声の録音を許可してください。"],
  "视频要从当前选中的播放设备输出。": ["Play the video through your selected output device.", "選択した出力デバイスで動画の音声を再生してください。"],
  "确认系统有可用的播放设备与输出监视器。": ["Check that a playback device and output monitor are available.", "再生デバイスと出力モニターが利用できることを確認してください。"],
  "mimi 初次使用引导": ["Getting started with mimi", "mimi の初期設定"],
  "稍后设置": ["Set up later", "あとで設定"],
  "连接服务": ["Connect", "接続"],
  "播放声音": ["Play audio", "音声"],
  "显示字幕": ["Captions", "字幕"],
  "从官方账号获取密钥，填入 mimi 配置": ["Get your key from your provider and enter it in mimi", "サービスのキーを取得して mimi に入力"],
  "你的服务账号": ["Provider account", "サービスのアカウント"],
  "获取 API Key": ["Get an API key", "API Key を取得"],
  "mimi 配置": ["mimi setup", "mimi の設定"],
  "填写并保存": ["Enter and save", "入力して保存"],
  "翻译服务": ["Translation service", "翻訳サービス"],
  "选择服务": ["Choose a service", "サービスを選択"],
  "官方开通与获取密钥 ↗": ["Provider setup and API key ↗", "公式の設定とキー取得 ↗"],
  "填写配置 →": ["Set up →", "設定する →"],
  "配置已保存。": ["Setup saved.", "設定を保存しました。"],
  "先填写服务配置。": ["Enter your service settings first.", "まずサービスを設定してください。"],
  "需要哪些信息？费用怎么算？": ["Setup details and pricing", "設定の詳細と料金"],
  "填写：": ["Fields: ", "入力項目："],
  "播放视频，声音从电脑的当前输出设备播放": ["Play video audio through your current output device", "現在の出力デバイスで動画の音声を再生"],
  "当前播放设备": ["Audio output", "出力デバイス"],
  "打开一段有人说话的视频，点播放。": ["Open a video with speech and press play.", "話し声のある動画を開いて再生してください。"],
  "确认能听到声音，音量没有静音。": ["Check that you can hear it and sound is not muted.", "音声が聞こえることと、ミュートされていないことを確認してください。"],
  "声音权限已就绪。": ["Audio access is ready.", "音声の権限を確認済みです。"],
  "已收到播放声音。": ["Playback audio detected.", "再生音声を検出しました。"],
  "目前没有声音，请检查音量。": ["No sound detected. Check the volume.", "音声が届いていません。音量を確認してください。"],
  "开始字幕后，mimi 会检查播放声音。": ["Start captions to check playback audio.", "字幕を開始すると再生音声を確認します。"],
  "字幕浮窗位置示意": ["Caption window position example", "字幕ウィンドウの配置例"],
  "正在播放的视频": ["Your video", "再生中の動画"],
  "字幕会出现在这里": ["Captions appear here", "字幕はここに表示されます"],
  "位置示意": ["Position example", "配置例"],
  "已看到本次字幕": ["Captions are showing", "字幕が表示されています"],
  "没有出现？检查服务和声音 →": ["No captions? Check setup and audio →", "字幕が出ない場合は設定と音声を確認 →"],
  "字幕开始后会使用你的翻译服务，可能产生费用。": ["Starting captions uses your translation service and may incur charges.", "字幕を開始すると翻訳サービスを使用し、料金がかかる場合があります。"],
  "继续 →": ["Next →", "次へ →"],
  "完成": ["Done", "完了"],

  "选服务": [
    "Service",
    "サービス"
  ],
  "配置": [
    "Setup",
    "設定"
  ],
  "权限": [
    "Access",
    "権限"
  ],
  "声音": [
    "Audio",
    "音声"
  ],
  "字幕": [
    "Captions",
    "字幕"
  ],
  "先把字幕准备好。": [
    "Get your captions ready.",
    "字幕の準備をしましょう。"
  ],
  "连接你的服务。": [
    "Connect your service.",
    "サービスを接続しましょう。"
  ],
  "允许获取系统播放声音。": [
    "Allow system audio capture.",
    "再生音声の取得を許可しましょう。"
  ],
  "播放一小段有人说话的声音。": [
    "Play a short clip with speech.",
    "話し声のある動画を再生しましょう。"
  ],
  "字幕出现了。": [
    "Your captions are showing.",
    "字幕が表示されました。"
  ],
  "正在等待翻译": [
    "Waiting for translation",
    "翻訳を待っています"
  ],
  "初次使用": [
    "Getting started",
    "はじめに"
  ],
  "稍后再说": [
    "Later",
    "あとで"
  ],
  "引导步骤": [
    "Setup steps",
    "準備の手順"
  ],
  "mimi 首次使用引导": [
    "Getting started with mimi",
    "mimi の初期設定"
  ],
  "选你已经开通的服务就好。还没开通？下一步有官方入口。": [
    "Choose a service you already use. The next step links to official setup.",
    "お使いのサービスを選んでください。次の手順に公式の案内があります。"
  ],
  "共 8 项服务，向下滚动查看。": [
    "8 services available. Scroll to see more.",
    "全8サービス。スクロールして確認できます。"
  ],
  "需要填写": [
    "Fields to fill in",
    "入力する項目"
  ],
  "去官方获取与配置 ↗": [
    "Official setup ↗",
    "公式の設定案内 ↗"
  ],
  "官方计费 ↗": [
    "Official pricing ↗",
    "公式の料金案内 ↗"
  ],
  "官方资料核对：": [
    "Sources checked: ",
    "公式資料の確認日："
  ],
  "凭据已保存。实际服务授权将在启动时确认。": [
    "Credentials saved. Service authorization is checked when you start.",
    "認証情報は保存済みです。サービスの認証は開始時に確認されます。"
  ],
  "还没有保存凭据。填写后，回来继续。": [
    "Credentials are missing. Fill them in, then return here.",
    "認証情報は未保存です。入力後、ここに戻って続けられます。"
  ],
  "打开配置": [
    "Open setup",
    "設定を開く"
  ],
  "检查配置与网络": [
    "Check setup and network",
    "設定とネットワークを確認"
  ],
  "权限已确认": [
    "Access confirmed",
    "権限を確認済み"
  ],
  "权限尚未确认": [
    "Access not confirmed",
    "権限は未確認"
  ],
  "启动时如有系统提示，请按提示操作。连接服务可能产生费用。": [
    "Follow any system prompt when starting. Connecting may incur charges.",
    "開始時にシステムの案内が出た場合は確認してください。接続には料金がかかる場合があります。"
  ],
  "打开一段视频，让声音从当前输出设备播放。": [
    "Play a video through your current output device.",
    "現在の出力デバイスで動画の音声を再生してください。"
  ],
  "已观测到系统播放声音。": [
    "System playback audio detected.",
    "再生音声を検出しました。"
  ],
  "尚未确认捕获到声音。请检查音量、权限和播放设备。": [
    "Audio has not been detected. Check volume, access and output device.",
    "音声はまだ未確認です。音量、権限、再生デバイスをご確認ください。"
  ],
  "开始会连接你的服务，可能产生费用。检查权限本身不会启动服务。": [
    "Starting connects your service and may incur charges. Checking access does not start it.",
    "開始するとサービスに接続し、料金がかかる場合があります。権限の確認だけでは接続しません。"
  ],
  "开始字幕": [
    "Start captions",
    "字幕を開始"
  ],
  "可以继续看视频了。": [
    "You can keep watching.",
    "そのまま視聴できます。"
  ],
  "← 返回": [
    "← Back",
    "← 戻る"
  ],
  "去看视频吧": [
    "Watch your video",
    "動画を見る"
  ],
  "检查并开始": [
    "Check and start",
    "確認して開始"
  ],
  "下一步 →": [
    "Next →",
    "次へ →"
  ],
  "暂时无法打开链接，请稍后再试。": [
    "Could not open the link. Please try again later.",
    "リンクを開けませんでした。あとでお試しください。"
  ],
  "允许显示字幕浮窗，再授权本次屏幕与音频捕获。录音权限用于捕获应用播放声音；mimi 不使用麦克风。拒绝后可以回来继续。": [
    "Allow the caption overlay, then approve this session’s screen/audio capture. Recording access is for app playback; mimi does not use your microphone. You can return after declining.",
    "字幕の重ね表示と今回の画面・音声取得を許可してください。録音権限はアプリの再生音声用で、マイクは使いません。拒否後も戻って続けられます。"
  ],
  "在系统设置里允许 mimi 录制屏幕与系统音频。mimi 只听系统声音，不使用麦克风。": [
    "Allow mimi to record screen and system audio in System Settings. mimi captures playback, not your microphone.",
    "システム設定で mimi の画面とシステム音声の録音を許可してください。マイクは使用しません。"
  ],
  "mimi 捕获当前输出设备的播放声音。确认视频正在你使用的输出设备上播放。": [
    "mimi captures your current output device. Make sure your video plays through it.",
    "mimi は現在の出力デバイスの再生音声を取得します。動画の出力先を確認してください。"
  ],
  "需要可用的 PulseAudio 或 PipeWire 输出监视器。确认选中的输出设备正在播放。": [
    "A PulseAudio or PipeWire output monitor is required. Check that your chosen output is playing.",
    "PulseAudio または PipeWire の出力モニターが必要です。選んだデバイスの再生を確認してください。"
  ],
  "合成空配置：未发送凭据、音频或网络请求。认证未验证。": [
    "Synthetic empty configuration: no credentials, audio or requests sent. Authentication is not verified.",
    "合成の空設定です。認証情報、音声、リクエストは送信していません。認証は未確認です。"
  ],
  "浏览器预览不会启动服务；没有实际字幕，尚未完成。": [
    "Browser preview does not start services; no actual subtitle has been verified.",
    "ブラウザープレビューではサービスを開始しません。実際の字幕は未確認です。"
  ],
  "初次使用？": [
    "Getting started",
    "はじめに"
  ],
  "mimi 初次使用": [
    "Getting started with mimi",
    "mimi の初期設定"
  ],
  "取消": [
    "Cancel",
    "キャンセル"
  ],
  "只留下字幕，安心看。": [
    "Just subtitles. Settle in.",
    "字幕だけで、動画に集中。"
  ],
  "沉浸模式会隐藏字幕背景、控制面板和拖拽/缩放入口，鼠标可以穿过字幕。字幕本身仍然显示。": [
    "Immersive mode hides the background, controls and drag/resize handles. Clicks pass through the subtitles; caption text stays visible.",
    "没入モードでは字幕の背景、操作パネル、移動とサイズ変更の操作を隠します。クリックは字幕を通過します。字幕の文字は表示されます。"
  ],
  "怎么回来？": [
    "How do I get back?",
    "元に戻すには？"
  ],
  "点菜单栏或托盘里的 mimi 图标，再关闭“沉浸模式”。": [
    "Click the mimi menu-bar or tray icon and turn off Immersive mode.",
    "メニューバーまたはトレイの mimi アイコンから「没入モード」をオフにしてください。"
  ],
  "系统支持且注册成功时，也可按 ⌘⇧M（macOS）或 Ctrl+Shift+M。Wayland 请使用桌面绑定。": [
    "When registered successfully, use ⌘⇧M on macOS or Ctrl+Shift+M elsewhere. Wayland uses desktop bindings.",
    "登録に成功した環境では macOS の ⌘⇧M、その他の環境の Ctrl+Shift+M も使えます。Wayland ではデスクトップのキー割り当てを使ってください。"
  ],
  "先保持原样": [
    "Keep current mode",
    "今の表示を保つ"
  ],
  "浏览器仅预览，不更改原生沉浸状态。": [
    "Browser preview does not change native presentation.",
    "ブラウザーはプレビューのみで、アプリの表示状態は変更しません。"
  ],
  "知道了，开启": [
    "Enable immersive",
    "没入モードをオン"
  ],
  "已有配置 · 可返回编辑": [
    "Existing profile · editable",
    "既存の設定・編集可能"
  ],
  "使用自己的官方账号": [
    "Use your own provider account",
    "ご自身の公式アカウントを使用"
  ],
  "去哪里获取密钥？": [
    "Where do I get my key?",
    "キーはどこで取得しますか？"
  ],
  "填写": [
    "Fields",
    "入力する項目"
  ],
  "官方获取与配置": [
    "Official setup",
    "公式の設定案内"
  ],
  "官方计费": [
    "Official pricing",
    "公式の料金案内"
  ],
  "资料核对": [
    "Sources checked",
    "資料の確認日"
  ],
  "无法打开官方页面，请稍后重试。": [
    "Could not open the official page. Please try again.",
    "公式ページを開けませんでした。あとでお試しください。"
  ],
  "开通百炼模型服务，创建北京地域的 API Key。": [
    "Enable Model Studio and create a Beijing-region API key.",
    "Model Studio を有効にし、北京リージョンの API Key を作成してください。"
  ],
  "在 OpenAI API 平台创建项目与 API Key，确认可使用 Realtime 模型。ChatGPT 订阅不包含 API 用量。": [
    "Create an OpenAI API project and key with Realtime access. ChatGPT subscriptions do not include API usage.",
    "OpenAI API のプロジェクトと API Key を作成し、Realtime を利用できることを確認してください。ChatGPT の契約に API 利用料は含まれません。"
  ],
  "在 Google AI Studio 的项目里创建 Gemini API Key，确认项目可使用 Live API。": [
    "Create a Gemini API key in Google AI Studio and check Live API availability for your project.",
    "Google AI Studio のプロジェクトで Gemini API Key を作成し、Live API の利用可否を確認してください。"
  ],
  "创建支持 Realtime 的 Azure OpenAI 资源，部署实时模型与转写模型。部署名称由你设置。": [
    "Create an Azure OpenAI resource supporting Realtime. Deploy realtime and transcription models; use your own deployment names.",
    "Realtime 対応の Azure OpenAI リソースを作成し、リアルタイムモデルと文字起こしモデルをデプロイしてください。名前にはご自身のデプロイ名を使います。"
  ],
  "在新版豆包语音控制台实名认证、开通同声传译 2.0，再创建 API Key。mimi 使用新版 API Key，不使用旧版 AppID / Access Token。": [
    "Verify your account and enable Simultaneous Interpretation 2.0 in the new Doubao Voice console. Mimi uses the new API key, not the legacy AppID/access token.",
    "新しい Doubao Voice コンソールで本人確認と同時通訳 2.0 の有効化を行い、API Key を作成してください。mimi は新しい API Key を使い、旧 AppID / Access Token は使いません。"
  ],
  "开通腾讯云 ASR 的实时语音翻译，获取账号 AppID 与 API 密钥。后付费需自行开通。": [
    "Enable realtime speech translation in Tencent Cloud ASR. Obtain your account AppID and API secret pair; pay-as-you-go must be enabled explicitly.",
    "Tencent Cloud ASR のリアルタイム音声翻訳を有効にし、AppID と API キーのペアを取得してください。従量課金は別途有効化が必要です。"
  ],
  "在百度智能云机器翻译中创建应用，勾选实时语音翻译权限。AppKey 填应用的 API Key，不是 Secret Key。": [
    "Create a Machine Translation app in Baidu AI Cloud with realtime speech translation access. AppKey means the app's API Key, not Secret Key.",
    "Baidu AI Cloud の機械翻訳でアプリを作成し、リアルタイム音声翻訳を許可してください。AppKey にはアプリの API Key を入力します。Secret Key ではありません。"
  ],
  "在 xAI 控制台创建 API Key，并确认账号有实时语音服务额度与访问权限。": [
    "Create an API key in the xAI console and check realtime voice access and available credits.",
    "xAI コンソールで API Key を作成し、リアルタイム音声の利用権限と残高を確認してください。"
  ],
  "按所用音频模型及翻译模型计费；各模式计量不同。": [
    "Audio and translation models have separate, mode-specific meters.",
    "音声モデルと翻訳モデルごとに課金され、モードによって計量方法が異なります。"
  ],
  "实时翻译按音频时长计费，实际价格以当前模型为准。": [
    "Realtime translation is billed by audio duration; check the current model rate.",
    "リアルタイム翻訳は音声の時間に応じて課金されます。現在のモデル料金をご確認ください。"
  ],
  "按 Live 模型的音频与文本 token 用量计费；免费额度视项目而定。": [
    "Live audio and text tokens are metered; free-tier availability depends on your project.",
    "Live モデルの音声とテキストのトークン使用量で課金されます。無料枠はプロジェクトによって異なります。"
  ],
  "按部署模型的音频/文本用量计费，区域与转写模型也影响费用。": [
    "Audio/text usage is billed per deployed model; region and transcription also affect cost.",
    "デプロイしたモデルの音声・テキスト使用量で課金されます。リージョンと文字起こしモデルでも料金が変わります。"
  ],
  "按音频输入、文本输出 token 用量分别计费；不固定按小时收费。": [
    "Audio input and text output tokens are metered separately, not at a fixed hourly rate.",
    "音声入力とテキスト出力のトークン使用量が別々に課金されます。固定の時間料金ではありません。"
  ],
  "按音频时长计费，最低计量 1 秒；实时语音翻译没有免费额度。": [
    "Billed by audio duration, with a minimum of one second. Realtime speech translation has no free quota.",
    "音声の時間で課金され、最低計量は1秒です。リアルタイム音声翻訳に無料枠はありません。"
  ],
  "实时语音翻译按音频时长计费；免费时长依认证类型与当前额度而定。": [
    "Realtime speech translation is billed by audio duration; trial duration depends on verification and current quota.",
    "リアルタイム音声翻訳は音声の時間で課金されます。無料時間は本人確認の種類と現在の枠によって異なります。"
  ],
  "实时 Voice Agent 按分钟计费；请先检查余额与当前价格。": [
    "Realtime Voice Agent is billed per minute; check your balance and current rate.",
    "リアルタイム Voice Agent は分単位で課金されます。残高と現在の料金をご確認ください。"
  ],
  "收到的是静音。请检查音量和播放设备。": [
    "Silent audio received. Check volume and output device.",
    "無音の音声を受信しています。音量と再生デバイスを確認してください。"
  ],
  "还没有收到音频。请检查权限和播放设备。": [
    "No audio received yet. Check access and output device.",
    "音声はまだ届いていません。権限と再生デバイスを確認してください。"
  ]
};
export function guideText(text: string): string { const language = effectiveUiLanguage(); return language === "zh" ? text : copy[text]?.[language === "ja" ? 1 : 0] ?? text; }
