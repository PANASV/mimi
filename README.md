# Linux 原生 UI-only 验收：db44d57

Source: `db44d57b48d4bbba8330b4d651b182f9fb9671fb`。
Ubuntu 22.04 / X11 的实际原生安装包，隔离私有临时偏好目录，安全合成字幕/服务配置；无真实密钥、provider 请求、系统采音或用户历史。

Artifact `11147771895`，ZIP SHA256 `52a5833b27e06aa3770d2810ee42684fcb5feb456cc0a80b8aaeb63de5fb1c80`；下载与包摘要已核对。保留 QA 原始 JPG，不放大或改写像素。

- `bilingual-visible-without-scroll.jpg`：640×136 浮窗、18px、居中、字幕动效关，多次原文/译文/双语循环两行立即可见，无需滚轮。#91 已修正的单句原生回归，不证明多句流式/历史锚点。
- `settings-motion-off-bilingual.jpg`：#93 修正前，快捷键改双语后实际预览双语，已打开设置页标签仍“仅译文”。
- `settings-label-after-navigation.jpg`：同一 db44 包切通用再回字幕页，标签恢复双语；这是重挂载恢复路径，不是新修正 after。
- `guide-save-regression.jpg`：自动打开的 PC 候选，合成服务配置保存后引导保持并可继续；界面的“凭据已保存”来自 UI-only 内存 fixture，不是 OS 安全存储认证证据。此 PC 视觉仍为独立待确认候选，不表示 #85 已批准/合入 #88。

后续 #93 修正为集成 `b9d124c220cb90e43ef98618d13e247d50de03b4`、独立候选 `d68dd02b6797f04c21ae159f53f1042bec40cdb4`；这些图片都不是新包修正后的原生实拍。

Refs [#88](https://github.com/yuxino/mimi/pull/88)、[#91](https://github.com/yuxino/mimi/issues/91)、[#93](https://github.com/yuxino/mimi/issues/93)、[#82](https://github.com/yuxino/mimi/issues/82)。

## 可复现回归

隔离 UI-only 配置，注入一条已确认合成中英字幕；固定 640×136 / 18px / 居中，循环原文→译文→双语。保持字幕设置页打开，用 Ctrl+Shift+B 改模式，比较选择框、预览和浮窗；不要通过切页掩盖标签旧值。另以首次引导 fixture 保存合成服务配置，确认引导保持并能继续。不用合成字幕判定真实首字幕完成。

未测：新 #93 包原生修正、流式多句/长句/历史跟随、七态/系统 reduce、正常凭据/权限/真实音频/provider、物理 Windows/Android。
