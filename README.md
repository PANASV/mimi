# 双语切换滚动回归 / Bilingual display scroll regression

## 图片版本与条件

- `browser-before-ad51.png`：精确候选源码 **ad51bcc6d15fecaffa659140c3a6cbb7d2771f42**，实际 Mac Chromium OverlayWindow / Timeline 组件；中文设置、640×136逻辑浮层、1280×272高清截图、18px字幕、居中、动效关闭。从只看翻译切到双语，原文在可视区上方。
- `browser-after-db44.png`：精确候选源码 **db44d57b48d4bbba8330b4d651b182f9fb9671fb**，同组件、窗口、字号、字幕与操作。两行实际文字均完全进入可视区；只修滚动锚点，不加高窗口、不改句块和行数预算。
- `linux-ad51-clipped.jpg`：云 Linux 原生640×136 UI-only浮层，ad51bcc，切双语后原文不可见；**旧版本失败证据，不是新包 after**。
- `linux-ad51-manual-scroll-top.jpg`：同旧包、同窗口手动向上滚动后原文和译文都可见，说明数据已在浮层；**手动操作诊断图，不是自动修复结果**。

所有文字均为已授权安全合成 fixture，无真实音频、密钥、用户字幕或历史。Mac图真实运行产品React/CSS组件；不能替代 Linux WebKit 或 Mac 原生新包验收。

## 回归步骤

1. UI-only 隔离配置，默认640×136浮层与18px字号，输出一条合成英文/中文字幕。
2. 翻译 → 双语：无需滚轮，英文原文与中文译文应同时可见；原文/翻译/双语反复切换仍正确。
3. 连续到来合成句子时默认跟随末尾；真实滚轮向上阅读旧句，再来一条新句不应拉回末尾。
4. 阅读期间切显示模式，保留同一句；若减少一条语言使旧负偏移越过整句，显示这句起点而不是下一句。
5. 回到末尾后继续新字幕，再测动效开启/关闭、暂停/恢复、调整窗口尺寸。

实际 Mac Chromium 已操作通过步骤1–4（对应 `browser-checks.json`）；最终候选263项前端测试/41文件、typecheck/build、Rust fmt与diff检查通过；lint0错误/1既有SoftwareUpdate警告。新 Linux 包原生1–5待复验；真实 provider、采音、费用、系统权限和 Keychain 未测试/未操作。

集成修复提交：3ff08b4ef02d2f5715a4b331e4f68fff73c44287 + a389905b8c7fde8b6f252e992a5d3df3e1548145。独立候选含此前引导保存修复及 Dock 偏好，不代表其 Mac Dock 已原生通过。没有合并 main、发布版本或替换本机47包。
