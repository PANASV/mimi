# 设置精简和连续引导候选：2026-10-01

集成源码：083bb30d74a93f99d185a181f16629bdb3c8489d。独立引导候选：58a48aba8c7fcd56338fc40167d691f3ad58cd3a。before：47ae4c51c0f15a3fd6943d633d25531e06843db0。

实际 macOS Chromium headless 组件截图，非 WKWebView/native 安装包。1280×900 逻辑、2× 2560×1800 原图；小引导窗口 430×620、2×。所有配置仅测试浏览器内存，无真实密钥、音频、用户历史或服务请求。不能据此宣称新候选原生权限、首次真实字幕或钥匙串恢复已通过。用户安装包仍47ae4c5，未覆盖。

## 同条件设置 before/after

settings/：同两条合成 profile、Alibaba active、credentialState unavailable；点击翻译服务、编辑当前配置、检查连接。仅在本地 Vite transform 中将 testProfileConnection 返回固定 unavailable/reachable；before/after 使用同一替代返回，不执行 IPC/网络/安全存储。截图错误是故意模拟，非实际服务恢复证据。中文另展开配置名称；删除确认及会话保护仍保留，未点击删除。三语实际正文与布局已检查，无横向溢出；新页头引导入口实际打开并关闭。

去掉常驻检查说明与重复认证段落，结果放到按钮旁，详细排障默认折叠、按平台给对应入口；名称与删除分开。仅独立候选的使用引导入口移到设置标题旁。实际凭据安全存储逻辑不变。

## 连续引导候选

guide/：中英日各三屏+中文小窗口三屏。第1屏空配置，第2/3屏之前在真正服务表单输入 synthetic-not-a-real-key、仅保存浏览器内存。实际检查表单跨步骤草稿、保存状态、8个服务选项、沉浸按钮的浏览器边界、Tab/Shift+Tab焦点循环、稍后关闭；小窗口滚动后保存可点、底部动作可见。未注册快捷键不显示。PC#85仍是未纳入生产的候选，不表示用户最终视觉或新版原生验收已通过。

## 贡献者墙

settings/contributors-wall.png 是实际渲染4个已验证公开 GitHub 头像的文档预览，不是应用界面。原公开头像 bytes 不变，仅 SVG circle clip；链接为本人公开 GitHub profile。083bb30独立文档提交保留已有归属，待合并PR67/89单列，未冒称已进main。

复现：对应源码启动单个 Vite + 隔离 Chromium headless，按上述合成 fixture 与交互步骤用 CDP Page.captureScreenshot 取 PNG。browser-checks.json记录实际正文、布局与交互结果；hashes.json记录公开材料SHA256。私有用户截图未复制进此目录。

已过：候选完整前端248测试/37文件、typecheck、production build、lint0 errors/1既有SoftwareUpdate warning；7项CI范围规则测试及actionlint。远程CI见#88准确head链接；本材料不替代新版安装包原生测试。
