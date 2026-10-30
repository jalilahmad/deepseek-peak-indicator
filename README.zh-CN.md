<p align="center">
  <img src="https://raw.githubusercontent.com/jalilahmad/deepseek-peak-indicator/main/assets/readme-banner.png" alt="DeepSeek 峰谷时段指示器 —— 随时了解 DeepSeek API 处于峰时还是谷时定价。" />
</p>

# DeepSeek 峰谷时段指示器

[English](README.md) · [فارسی](README.fa.md) · **简体中文**

![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-0.2.1--rc.5-0f2a44)
![Tests](https://img.shields.io/badge/tests-22%2F22-16a34a)
![License](https://img.shields.io/badge/license-MIT-0d9488)

一个轻量的 DeepSeek Harness 插件，直接在侧边栏底部显示**当前 DeepSeek API 定价时段**——峰时（Peak）
或谷时（Off-Peak）——从应用启动即可见，无需打开任何 Session。点击它可查看**距离下次定价切换的
倒计时**。

插件不需要 API 密钥，不发起网络请求，也不轮询任何内容：时段完全由本地时钟和一个内置且已核实的
中国节假日日历在本地计算得出。

> **Peak 指的是官方 API 定价时段，与服务器拥塞或服务健康状况无关。**
> 指示器只报告 DeepSeek 规定的计费时段，不对 API 负载、延迟或可用性作任何说明。峰时适用较高的
> **峰时**费率，谷时则为半价费率。

---

## 安装

**需要 DeepSeek Harness Desktop v0.2.1-rc.5**——本版本正是针对该版本构建并验证的。无需额外的
运行时、构建步骤或 npm 依赖。

包名为 `@jalilahmad.fazeli/deepseek-peak-indicator`。可从 npm 或直接从 GitHub 安装：

### 从 npm 安装

```powershell
dsh plugin --profile web add @jalilahmad.fazeli/deepseek-peak-indicator
```

### 从 GitHub 安装

```powershell
dsh plugin --profile web add github:jalilahmad/deepseek-peak-indicator
```

安装后重新加载 Harness Web GUI（或重启 DeepSeek Harness Desktop）。在支持 HMR 的 harness 上，
通常刷新页面即可。

<details>
<summary>改用插件管理器安装</summary>

1. 在 Harness 侧边栏打开 **Plugins**。
2. 选择 **Add plugin** → **Install a third-party plugin**。
3. 输入 npm 包名 `@jalilahmad.fazeli/deepseek-peak-indicator`，或 GitHub 规格
   `github:jalilahmad/deepseek-peak-indicator` 并安装。
4. 确认该 bundle 已切换为 **On**，然后重新加载页面。

</details>

---

## 功能特性

- **一眼即知，三种状态**——🟢 `OFF-PEAK`、🔴 `PEAK`、⚪ `UNKNOWN`。
- **下次切换倒计时**——弹出层以整小时和整分钟显示剩余时间。
- **边界准确**——状态恰好在官方时段边界切换；倒计时每分钟刷新一次，切换本身由精确定时器完成。
- **始终在场**——位于 root 作用域的侧边栏底部条目，在任何 Session、Conversation 或 Composer
  打开之前就已存在。
- **感知节假日**——2025 与 2026 年的中国法定节假日日期均已核实；未核实的年份会如实报告为
  **UNKNOWN**，绝不猜测。
- **时区安全**——时段按 UTC 判定，节假日日期按中国标准时间判定，所有换算都使用浏览器的 IANA
  `Intl` 数据库（无硬编码偏移，对夏令时安全）。
- **小巧且私密**——一个客户端 bundle、一个 Host 行、一个 60 秒定时器外加一个切换定时器；无 API
  密钥、无后端、无数据库、无遥测、无网络轮询。
- **生命周期干净**——定时器、监听器、观察器和样式在卸载时全部释放；重新加载只会创建一个指示器。

---

## 截图

以下截图均来自运行本插件的 DeepSeek Harness Desktop v0.2.1-rc.5 的真实画面。为保护隐私，工作区名称
与会话标题已做模糊处理。

**完整应用——侧边栏底部的指示器**

![DeepSeek Harness 完整窗口，侧边栏底部显示 OFF-PEAK 指示器](docs/screenshots/01-indicator-sidebar.png)

**带极简弹出层的 OFF-PEAK**

![OFF-PEAK 指示器及两行弹出层，内容为“Peak starts in: 60h 35m”](docs/screenshots/03-popover-offpeak.png)

**插件管理器中的插件条目**

![Harness Plugins 页面中的 DeepSeek Peak Indicator 条目，已启用](docs/screenshots/05-plugin-manager.png)

**PEAK** 与 **UNKNOWN** 截图仍待补充，因为这两种状态需要拍摄时并不存在的真实时段条件：PEAK 只出现
在官方工作日峰时窗口内，UNKNOWN 只在当年中国法定节假日日历尚未核实时出现。它们将在下一个真实 PEAK
时段之后补充；具体条件与拍摄步骤见
[docs/screenshots/SCREENSHOTS_NEEDED.md](docs/screenshots/SCREENSHOTS_NEEDED.md)。

---

## 工作原理

指示器注册在 **`sidebar.footer.action`** 中——这是随附的 `@deepseek-ai/dsh-client-ui-sidebar` 包
所声明的、位于 Settings 旁边的 root 作用域列表插槽。它属于常驻的应用外壳，因此不依赖 Session、
Conversation 或 Composer。侧边栏展开时显示一个小胶囊（圆点 + 标签）；56 px 窄栏则显示只有圆点的
紧凑形态。

### 状态

| 状态 | 含义 |
| --- | --- |
| 🔴 **PEAK** | 处于官方峰时窗口内、日期为周一至周五，且该日期不是已核实的中国法定节假日。适用较高的 API 价格。 |
| 🟢 **OFF-PEAK** | 其他所有情况：不在两个每日峰时窗口内、处于周末，或处于已核实的中国法定节假日。适用半价 API 价格。 |
| ⚪ **UNKNOWN** | 处于工作日峰时窗口内，但该年份的本地节假日日历未核实（缺失、未发布或格式错误）。插件拒绝猜测。 |

周末全天为谷时，包括周末调休上班日，这遵循 DeepSeek 关于周末和节假日“全天”谷时的表述。

### 极简弹出层

点击指示器；再次点击、按 `Escape`，或点击外部即可关闭。弹出层恰好只有两行：

```text
🔴 PEAK
Off-Peak starts in: 2h 13m
```

```text
🟢 OFF-PEAK
Peak starts in: 61h 29m
```

```text
⚪ UNKNOWN
Next transition cannot be reliably determined.
```

倒计时仅显示整小时和整分钟（绝不显示秒）。它每分钟刷新一次，而一个精确的切换定时器会在官方边界翻转
状态。如果当前时段的结束时间会落在节假日日历尚未核实的年份，插件会显示 UNKNOWN 那一行，而不是
编造一个倒计时。

### 时区处理

- 峰时窗口按 **UTC** 的当日分钟数比较。
- 中国节假日日期按该时刻的 **`Asia/Shanghai`** 日历日期查表。
- 中国午夜边界由该时区经 `Intl` 推导（对 `Asia/Shanghai` 而言即 16:00 UTC）——是计算得出的，
  而非硬编码。
- bundle 保留了基于 IANA 的夏令时安全辅助函数，并以 **`Asia/Kabul`** 作为默认显示时区
  （[`client.js`](client.js) 中的 `DISPLAY_TIME_ZONE`）；当前的极简弹出层有意只显示时长，因此
  时区处理不影响显示内容，只影响正确性。

---

## 定价时段

依据官方 DeepSeek 定价文档：

| 时段 | 时间（UTC） | 价格 |
| --- | --- | --- |
| **峰时** | 周一至周五，**01:00–04:00** 与 **06:00–10:00**——不含中国法定节假日 | 完整峰时价格 |
| **谷时** | 其他所有小时、周末，以及中国法定节假日全天 | 峰时价格的一半 |

对应北京时间：**09:00–12:00** 与 **14:00–18:00**。根据官方变更日志，峰谷定价自 **2026-08-16
16:00 UTC** 起引入；请始终在官方定价页面确认当前数值。

官方来源：[DeepSeek 定价](https://api-docs.deepseek.com/quick_start/pricing/) ·
[中文定价页面](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) ·
[变更日志](https://api-docs.deepseek.com/updates)。

---

## 中国法定节假日

节假日日期保存在可编辑的 [`holidays.json`](holidays.json) 中，并由
[`tools/sync-holidays.mjs`](tools/sync-holidays.mjs) 内联进浏览器 bundle（浏览器 bundle 在运行时
无法读取同级文件）。

- **2025** 与 **2026** 已依据国务院公告核实
  （[2025 年](https://www.gov.cn/zhengce/content/202411/content_6986382.htm)、
  [2026 年](https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm)）。
- 仅当存在 `verified: true`、非空的官方 `source`，且包含格式良好、真实的日历日期时，该年才计为
  已核实。
- **2027 被有意设为未核实**——本版本准备时，年度节假日安排尚未公布。因此 2027 年的工作日峰时窗口会
  显示 **UNKNOWN**；周末和谷时小时仍然确定。
- 没有已核实数据的年份绝不会产生错误的 PEAK。

要新增年份：编辑 `holidays.json`，运行 `node tools/sync-holidays.mjs`，然后运行测试。

---

## 隐私与架构

- **无 API 密钥。** 插件从不请求、存储或使用 API 密钥。
- **无后端、无数据库、无存储。** 没有服务器组件，也没有账户访问。
- **无网络请求、无轮询、无遥测。** `client.js` 中不含 `fetch`、`XMLHttpRequest`、`WebSocket`、
  `EventSource` 或动态 `import()`；它只读取本地时钟和内置的节假日表。
- **仓库中无密文。** 不含密钥、令牌、个人路径或机器相关状态。
- **插件通用提示。** 与所有 DSH 插件一样，插件代码以 Harness 应用的本地权限运行。安装前请审阅
  源代码；详情与问题报告见 [SECURITY.md](SECURITY.md)。

该插件是一个 DSH bundle，Host 一半为空，浏览器侧为 Client 一半：

1. `package.json` 声明 `dsh.bundle`（插入 Loader 行的 Cordis patch）与 `dsh.client`（浏览器入口）。
2. `cordis.patch.yml` 插入该插件行；[`index.js`](index.js) 是一个有意为空的 `apply()`。
3. `client.js` 注册惰性模块工厂，添加语言词典，并通过 `ctx.slots` 把指示器注册进
   `sidebar.footer.action`。
4. 一个墙钟状态、一个 60 秒间隔和一个精确切换定时器驱动 UI；它们都在插槽条目卸载时被清理。

完整设计、状态算法、切换搜索和清理规则见 [`docs/architecture.md`](docs/architecture.md)。

---

## 兼容性与已知限制

- **仅测试过 DeepSeek Harness Desktop v0.2.1-rc.5（Windows）。** 不声称兼容其他 DSH 版本、客户端
  和平台；`engines.dsh` 固定了已测试的版本，因此未经测试的运行时会被拒绝，而不是盲目加载。
- **Windows 折叠侧边栏。** 在 Windows 标题栏布局下，随附的侧边栏外壳在侧边栏折叠时会隐藏其整个
  页脚（包括随附的 Settings 控件），因此指示器在默认展开的侧边栏中可见，但在折叠状态下不可见。
  在外壳确实渲染页脚的 56 px 窄栏中，会使用只有圆点的紧凑形态。
- **2027 年节假日数据。** 在官方公告发布并更新日历之前，2027 年的工作日峰时窗口会显示
  **UNKNOWN**。周末和非峰时小时仍然确定。
- **包标识。** 公开包名为 `@jalilahmad.fazeli/deepseek-peak-indicator`；它也是 npm 与 GitHub
  安装共同使用的 Harness 模块/包标识。重命名前安装的旧包（`@local/deepseek-peak-indicator`）应先
  卸载再重新安装。插件行 id `deepseek-peak-indicator` 与所有运行时行为保持不变。
- **截图。** 已提供三张真实截图；PEAK 与 UNKNOWN 截图需要真实的时段条件，仍待补充。见
  [截图](#截图) 与
  [SCREENSHOTS_NEEDED.md](docs/screenshots/SCREENSHOTS_NEEDED.md)。

---

## 更新与卸载

**更新**——DeepSeek Harness 不会就地更新任意已安装的 bundle：

1. 打开 **Plugins**，找到 **DeepSeek Peak Indicator**，选择 **Remove**
   （或执行 `dsh plugin --profile web remove @jalilahmad.fazeli/deepseek-peak-indicator`）。
2. 用[安装](#安装)中的同一条命令重新安装。
3. 重新加载 Web GUI。

如果你安装过 npm 发布之前的旧版本，请先卸载旧包：
`dsh plugin --profile web remove @local/deepseek-peak-indicator`。

**卸载**——**Plugins** → **DeepSeek Peak Indicator** → **Remove**，或：

```powershell
dsh plugin --profile web remove @jalilahmad.fazeli/deepseek-peak-indicator
```

该插件除自身 bundle 之外不存储任何内容，因此卸载后不会留下数据。

---

## 开发

没有构建步骤，也没有依赖。仓库中仅有的 Node.js 脚本是测试套件和节假日同步工具。

```text
deepseek-peak-indicator/
├── client.js                 # 浏览器一半：时段核心、侧边栏指示器、弹出层、定时器
├── index.js                  # 空的 Host 一半（Loader 行）
├── package.json              # bundle 清单，dsh.bundle / dsh.client，元数据
├── cordis.patch.yml          # 插入插件行的 Loader patch
├── holidays.json             # 可编辑的中国法定节假日日历
├── icon.svg                  # 上一版插件图标（保留作备份）
├── locale/                   # 插件显示元数据（en、zh）
├── tools/sync-holidays.mjs   # 把 holidays.json 内联进 client.js
├── test/schedule.test.mjs    # 22 个 Node 测试（时段、弹出层、注册）
├── docs/                     # 架构、marketplace 说明、截图指引
├── assets/                   # README 横幅、运行时插件图标、marketplace 图标
├── screenshots.json          # marketplace 商店截图列表
├── README.md · README.fa.md · README.zh-CN.md
├── CHANGELOG.md · CONTRIBUTING.md · SECURITY.md · LICENSE
└── .gitignore · .gitattributes
```

其中 `assets/readme-banner.png` 是 README 头图横幅。`assets/icon-512.png`（512×512 PNG，58.6 KiB，
低于 DSH 的 256 KiB 插件图标上限）是**运行时插件图标**，通过现有的 `./icon` 清单导出提供，并已在
Plugin Manager 中实时验证。`icon.svg` 保留为上一版图标/备份，`assets/icon-180.png` 仍作为较小的
marketplace 备用图标。

运行测试：

```powershell
node --test test/schedule.test.mjs
```

预期结果：**22 个测试，22 通过，0 失败**（已在 Node.js v24.21.0 上验证，这是 DeepSeek Harness
Desktop v0.2.1-rc.5 内置的运行时）。该测试套件覆盖两个峰时窗口、谷时小时、周末与调休上班日、
节假日覆盖、2027 年未发布时的 UNKNOWN 状态、精确的切换时刻、倒计时格式、两行弹出层模型、
宽/紧凑两种形态、单一插槽注册、由 Intl 推导的中国午夜边界，以及对畸形日期的拒绝。

本地开发安装：

```powershell
git clone https://github.com/jalilahmad/deepseek-peak-indicator.git
dsh plugin --profile web add <absolute-path-to-checkout>
```

欢迎贡献——见 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [SECURITY.md](SECURITY.md)。架构说明见
[`docs/architecture.md`](docs/architecture.md)；marketplace/提交说明见
[`docs/marketplaces.md`](docs/marketplaces.md)。

---

## 许可证、作者与致谢

[MIT](LICENSE) © 2026 **Jalil Ahmad Fazeli** · [@jalilahmad](https://github.com/jalilahmad) ·
[仓库](https://github.com/jalilahmad/deepseek-peak-indicator) ·
[问题反馈](https://github.com/jalilahmad/deepseek-peak-indicator/issues)

这是一个独立的社区插件，与 DeepSeek 无隶属关系。

致谢与官方来源：

- 插件遵循官方 DeepSeek Harness 的 bundle/Cordis 插件模型
  （`dsh.bundle` patch + `dsh.client` 浏览器一半 + `ctx.slots` 注册）。
- 定价规则：[DeepSeek API 定价](https://api-docs.deepseek.com/quick_start/pricing/) 与
  [中文版](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)；
  引入日期：[变更日志](https://api-docs.deepseek.com/updates)。
- 中国法定节假日安排：2025 与 2026 年国务院公告（链接见上）。
- `Intl`/IANA 时区数据来自浏览器运行时；`react` 与 `react-dom` 由 Harness 浏览器模块表提供。
  未内置任何第三方源代码。
- 图标与 README 横幅均为本插件原创素材。
