# 连续引导 · 浏览器候选

源码 `0dfb1189e443377b538cefc4b6dca2e7458e7057`，独立 `feat/local-morning-preview`，尚未安装或纳入 #88 生产分支。此前 PC #85 视觉 HOLD 不因这些图片自动解除。

实际运行 App/React 组件的 Mac Chromium headless 原图，中英日浅色，合成空配置；没有真实 Keychain、权限、音频、provider 或付费请求。人物沿用官方 logo，无新姿势。不是 HTML 生成图片，也不是原生安装包实拍。

## 版本与场景

- `zh/en/ja-step-1/2/3.png` 共 9 张，1280×900 逻辑窗口，2× 2560×1800 PNG。
- 第一屏为未保存的空配置；拍完第一屏后在教程内真实的同一 ServiceProfiles 表单输入无效合成 key 并保存到浏览器内存，再拍第二、三屏。字段不展示真实 key，也没有读取系统凭据。
- `zh-small-step-1/2/3.png` 共 3 张，430×620 逻辑，2× 860×1240 PNG。第一屏内容区滚动后确认真实保存按钮可达；底栏保持可见。
- 同条件前版：源码47ae4c5浏览器空配置，公开固定证据 `caebb135df6511d3777267f53effe015506e31c4`，同1280×900/2×，用于 PR 正文 before/after。旧原生图不能称为此新候选 after。

## 实际检查

三语三屏无横向溢出；实际内存表单保存、跨步骤保留草稿、8 个服务选择、稍后关闭、无原生能力的浏览器沉浸入口留在教程内报简洁反馈。实际 CDP Tab/Shift+Tab 正反向焦点循环通过，折叠内容不进循环。没有把未注册快捷键显示为可用；小窗口滚动可达保存按钮，底栏在屏幕内。细节见 `browser-checks.json`。

canonical：Rust536 passed/1ignored，完整前端最终244 passed/36files；fmt/strictClippy/build通过，lint0errors/1既有SoftwareUpdate warning。最终前端焦点修正后再次完整lint/test/build通过。远程CI另跟准确源码，不用旧结果替代。

原生新包、系统权限设置跳转、真实首次字幕/计费服务、Windows物理设备、LinuxWayland快捷键实机仍待验。本轮没有替换用户正在运行的47ae4c5，没有操作系统授权弹窗、ACL/TCC或签名，也没有合并main/tag/release。

## 安全复现

在此源码运行一个轻量 Vite，使用隔离无窗口浏览器打开 `first-run-fixture.html?lang=zh`（en/ja同样），仅用明显无效合成字段。此页面拒绝Tauri运行；浏览器启动不会连接provider，沉浸按钮不会修改原生偏好。完成后退出浏览器与前端，清理其临时profile。检查原图SHA256见 `hashes.json`。
