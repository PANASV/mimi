# Linux 原生：状态灯选择与诊断详情

实际包：`f4c208cdf7aa752a26ccee949386a72e49c8e5d1`。集成 PR88 当前 `26894aebc4264ee563fd679a001f048e118587c0` 与此包的桌面代码完全相同，仅另改三份 Android 引导 XML；图片仍标实际 f4c208c，不冒称新 head 实拍。

固定构建：https://github.com/yuxino/mimi/actions/runs/36744844840/artifacts/11111973243 。artifact ZIP SHA256 `48b0da22254a65f9fc8939e563d87d0a6d318eaf39cf0fa96dae5fe2ee916fb6`（不是内部可执行文件哈希）。

平台：云 Linux 原生桌面窗口；设置英文/浅色，字幕预览为应用样例，悬浮窗为 UI-only Listening 空态。隔离合成配置，无真实音频、provider、计费或用户凭据。图片原始 JPEG，无重绘/裁剪/修改；设置图1180×812，浮层图640×136。

## 六张实拍

| 图片 | 拍摄状态 |
| --- | --- |
| original-preview.jpg | 原样式，状态灯动效关闭，界面显示会话运行 |
| a-preview.jpg | A 音节设置预览，动效开启，会话尚未启动 |
| a-overlay.jpg | A 音节悬浮窗，Listening 空态 |
| b-preview.jpg | B 声带设置预览，动效开启，会话暂停 |
| b-overlay.jpg | B 声带悬浮窗，Listening 空态 |
| diagnostic-details.jpg | 诊断“查看详情”展开，常驻两行说明已移入详情；B样式、状态灯动效关闭 |

设置页来自不同操作阶段，不冒称三张同一会话状态的精确 before/after。动效通过记录来自连续操作观察，静图本身不证明时间连续性。

## 本轮实际通过（云QA交接）

原/A/B三样式选择；设置预览与Listening浮层同步；暂停恢复；关闭动效保持静态形状；切页保留选择；诊断说明仅在详情展开时显示。此处“保留”指同进程切页，不等于重启持久化验收。整合者读取全部原图并确认上述画面，行为结果按云QA交接记录。

## 可操作回归

使用固定Linux包和全新隔离XDG目录，开启已有UI-only合成入口，不使用正式配置：

1. 设置→字幕，依次选原样式、A音节、B声带；核对设置预览，并查看Listening浮层，两处样式一致。
2. 暂停后恢复；关闭“状态灯动效”，确认形状保留、动态停止，文字动效开关不被改变；切到其他设置页再返回，选择仍在。
3. 看“遇到问题？”常驻区，只保留按钮和“查看详情”；展开后才显示脱敏/公开反馈说明，实际脱敏未削弱。

## 尚未覆盖

重启持久化、系统减少动态效果、全七态时序、真实音频/provider、Android新文案图。用户仅授权证据回填，本次未合并、发版、安装或再次运行包。

## 原始文件 SHA256

- `original-preview.jpg`：`25c86d5271fcbac3f5a2d241818d46ff33f872c3a85139a3ad6e00be1c213d79`，73393 bytes
- `a-preview.jpg`：`f36610118094f1eff23177a41807fbb662786dca16e54d05f34250c36c77ec62`，73371 bytes
- `a-overlay.jpg`：`85c8d6adc4dca874628d1f214c1b5bfb48147e32b4348e818e9fa42384bededa`，6776 bytes
- `b-preview.jpg`：`013972fd88c7d36f1a0970fe71a6ed569448c384e0ff9d3df26b8a9ab63fd1d2`，73589 bytes
- `b-overlay.jpg`：`0f06997f469cf013673d202d690f9d1e1135a55d1de5dabee7d50625efde9d6b`，8434 bytes
- `diagnostic-details.jpg`：`88a9cb801508ca37d0081404cd5fa1d3df982ba41a72af013279660ed556f78b`，79251 bytes
