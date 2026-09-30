# Mimi 本机候选与 Linux 同包回归

这些是实际原生窗口原图。Mac 由唯一整合者操作；Linux 由父线程协调的原 QA 操作，结果及原图交接后核对。字幕、凭据状态及服务状态都是合成 fixture，没有真实音频/provider/付费调用。静图不证明完整动效时序。

## Mac 本地安装候选

- 源码：`47ae4c51c0f15a3fd6943d633d25531e06843db0`，独立 `feat/local-morning-preview`。包含 #88 的 `08766d3` 和另行保留的桌面图示候选；后者尚未纳入 #88 生产分支，等待用户最终视觉确认。
- 安装位置 `/Applications/mimi-dev.app`，标识 `app.yuxino.mimi.dev`。正式 mimi.app 的二进制前后 SHA256 校验一致；正式配置和 Keychain 未读写。
- 安装后二进制 SHA256：`3b0566a94dd719a4f8013d8556e75b909b82c4aa2db43eb271877e5007d7bfa0`。
- `codesign --verify --deep --strict` 通过。安装前后 designated requirement 完全相同：`identifier "app.yuxino.mimi.dev" and certificate root = H"c45731ee0170184a7542cbb1972420e319ac9d56"`。沿用现有自签名 dev 身份，不改 ACL/TCC；这不能证明正式凭据重装认证问题已修复。
- canonical check：535 Rust passed / 1 ignored；234 前端测试 / 33 文件；fmt、strict Clippy、production build、签名恢复及其余脚本通过；lint 0 errors / 1 既有 Fast Refresh warning。
- [exact 候选跨平台 CI](https://github.com/yuxino/mimi/actions/runs/36765984084)：9 项适用检查成功；发布步骤跳过。

实际通过：私有临时偏好目录内样式切换和两个独立动效开关保存；完整退出进程再重启后 B 样式、两开关及英文语言保留，切回中文生效；恢复原样式；合成字幕仅译文→双语、暂停保留及恢复；沉浸模式说明/开启/从设置退出；停止保留合成归档；原生保存框取消后仍可再导出，实际 TXT 含中英合成文字及时间戳；合成记录搜索无匹配、清空当前记录；引导重复打开、三屏切换、稍后关闭；760×721 与放大后的 940×793 设置窗口实际操作。

Mac 自动化限制：原生 HTML select 菜单的键盘/鼠标注入未成功完成 DeepLX 切换，未记为通过，也没有确认它是产品缺陷。常规空配置与手动合成表单保存已通过。小窗口长内容需要滚动；没有宣称所有最小尺寸/全局快捷键焦点/七态时序全部通过。WebView 沿用隔离 dev 身份已有非敏感浏览器存储，不宣称全新 WebView 首次自动弹出已验。真实凭据、权限、音频和首字幕均未验。

图：`mac/guide-native-[1-3].png` 是同一已安装包、中文浅色、合成内存配置，940×793 逻辑窗口、2×原图附系统阴影。人物使用现有官方图，没有新姿势。`style-classic/style-a/style-b-same-window.png` 在同一窗口/语言/双语示例/idle 会话下仅切样式，状态灯动效开启、字幕动效关闭。字幕两图是同一合成句的 Listening/Paused，对应早前 640×136 浮层，非真实服务字幕。

## Linux 集成包

- 源码 `08766d354be56ffedc2883da75754ec609a4beda`，artifact `11120362032`。
- ZIP SHA256 `c3ea69fd26df47bb6699a9042fe7653c00af2636ff8552337d0e69a5bbfc1c44`。
- 英文浅色实际 GTK/WebKit 原生窗口 1180×812；明确私有临时偏好目录，测试进程 TMPDIR=/tmp，无真实 key/provider。
- 原/A/B 均正常退出→完整进程重启保留，关闭动效保留，设置预览与 Listening 浮层同步，暂停/恢复及连续切换最后选择通过。归档停止保留、GTK 导出取消后再保存、实际 TXT 内容通过。四张图为交接的 Library version 0 原图，重启样式图同条件仅改变样式，状态灯动效关闭、字幕动效开启。
- 未覆盖 reset/延迟旧响应、系统 reduce、全七态、真实音频/provider、PC 图示。QA 已正常退出并释放 GUI。

## 安全复现

先正常退出其他 dev 实例。启用 `MIMI_UI_TEST=1`；创建系统临时目录下以 `mimi-ui-test-` 开头、权限 0700 的目录，只写非敏感 `preferences.json`；设置 `MIMI_UI_TEST_PREFERENCES_DIR` 为它。

普通演示用 `MIMI_UI_TEST_FIRST_RUN=0`、`MIMI_AUTO_START=1`、`MIMI_UI_TEST_EXPORT=1`，已有测试分支提供仅内存假凭据/合成字幕，不请求服务。缺凭据表单验收用 FIRST_RUN=1/AUTO_START=0，在表单输入明确无效的合成 key；只在 UI-only 内存保存。打开保存字幕再开始会生成一对合成文字；停止→导出→取消→重开→保存到空测试目录→检查文件内容；搜索无匹配再清空当前记录。

改样式/动效/语言→正常退出→同包同目录重启→核对 UI 和测试 preferences。不要复制真实用户目录或输入真实 key。两个 TXT 仅包含公开合成句。所有原图哈希见 `hashes.json`。没有 merge main、tag、release 或关闭 issue。
