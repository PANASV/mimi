# 在 Dock 中显示：设置界面对照

- Before源：861f1598b34811ddde3b8ee8d83ffc5780aa4a19；After源：01b298a74f14984658dca8ecfa66195fd89e959f。
- 实际Mac Chromium headless React设置页，中文/浅色、1280×900逻辑、2560×1800原图；同一画布/依赖，合成内存profile，无真实密钥、历史或连接。
- before-general：尚无开关；after-default-off：新增开关默认关闭，保留原菜单栏运行方式；after-choice-on：浏览器内存fixture选择开启。
- 实际浏览器操作：默认关闭→开启→切换设置页面→返回仍开启→关闭通过。组件测试覆盖非Mac隐藏、保存中防重复、失败提示；共享设置协调器保留乐观更新/失败回退。
- 原生实现只在Mac：启动偏好与运行中Regular/Accessory activation policy、Dock点击恢复设置、保持菜单栏设置/退出；旧配置缺字段默认false；持久化和序列化测试、运行请求/写盘失败回滚测试在远程CI。
- **没有操作实际Mac Dock，也没有重启或安装用户应用**。本图不能证明原生Dock/Cmd-Tab、焦点、菜单栏操作、完整重启/全屏浮层通过；这些仍须隔离UI-only包原生验收。
- Windows/Linux不显示该设置；后端拒绝Dock更改，不改系统Dock固定项、身份签名、Keychain或权限。

原PNG可放大，SHA256见hashes.json。当前Linux引导修复包ad51bcc不含此Dock提交，不应混作同包验收。
