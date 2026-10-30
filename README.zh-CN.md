# DeepSeek 峰谷时段指示器

[English](README.md) · [فارسی](README.fa.md) · **简体中文**

![DSH](https://img.shields.io/badge/DeepSeek%20Harness-0.2.1--rc.5-blue)
![Tests](https://img.shields.io/badge/tests-22%2F22-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

一个小型 DeepSeek Harness 插件，用于在全局侧边栏底部直接显示官方 **DeepSeek API 定价时段**
当前处于峰时还是谷时——从应用启动即可见，无需打开任何 Session 或 Conversation。

> Peak 是指官方 API 价格适用较高的 **峰时** 费率。它**并非**在描述服务器负载或拥塞，
> 只报告 DeepSeek 规定的计费时段。

- 插件包：`@local/deepseek-peak-indicator` · 版本 `1.0.0`
- 验证环境：**DeepSeek Harness Desktop v0.2.1-rc.5**（Windows）
- UI 插槽：**`sidebar.footer.action`**（root 作用域，常驻侧边栏底部）
- 无需 API 密钥，无后端，无网络请求，无遥测。

---

## 目录

1. [简介与用途](#1-简介与用途)
2. [主要特性](#2-主要特性)
3. [界面位置](#3-界面位置)
4. [PEAK, OFF-PEAK 与 UNKNOWN](#4-peak-off-peak-与-unknown)
5. [极简弹出层](#5-极简弹出层)
6. [DeepSeek 官方定价时段](#6-deepseek-官方定价时段)
7. [中国法定节假日覆盖](#7-中国法定节假日覆盖)
8. [Asia/Kabul 时区处理](#8-asiakabul-时区处理)
9. [架构与插件生命周期](#9-架构与插件生命周期)
10. [项目结构](#10-项目结构)
11. [安装](#11-安装)
12. [更新与卸载](#12-更新与卸载)
13. [测试](#13-测试)
14. [已知限制](#14-已知限制)
15. [隐私与安全](#15-隐私与安全)
16. [截图](#16-截图)
17. [作者与仓库](#17-作者与仓库)
18. [许可证](#18-许可证)
19. [致谢与官方来源](#19-致谢与官方来源)

---

## 1. 简介与用途

DeepSeek 的 API 依据一天中的时段（以及中国法定节假日）收取 **峰时价格** 与 **半价谷时价格**。
规则发布在官方定价页面上，但你需要自己记住它们、换算成所在时区，并随时查看时间。

**DeepSeek 峰谷时段指示器** 正是把这件事做到一眼可见：Harness 侧边栏底部的一个彩色小圆点和
一个标签。点击它，插件只告诉你需要知道的信息——当前时段以及该时段还剩多久：

- 它是 **定价时段指示器**，不是负载监视器；
- 它在 **打开任何 Session 之前** 即可工作；
- 它 **不使用 API 密钥，也不发起网络请求**；
- 它从不猜测：如果某一年的中国节假日日历尚未核实，指示器只在节假日日历真正起作用的那些
  小时里显示 **UNKNOWN**。

## 2. 主要特性

- 🟢/🔴/⚪ **一眼可见，三种状态**：OFF-PEAK、PEAK、UNKNOWN。
- 📍 **全局位置**：常驻侧边栏底部，独立于 Session、Conversation 和 Composer。
- 🖱️ **极简两行弹出层**：状态，外加当前时段的剩余时间。
- ⏱️ **准确**：状态恰好在官方时段边界切换；倒计时每分钟刷新一次，仅以小时和分钟显示
  （绝不显示秒）。
- 🇨🇳 **官方中国法定节假日**：2025 与 2026 已依据国务院公告核实；未核实的年份会报告为
  UNKNOWN，而不是“没有节假日”。
- 🌐 **时区安全**：时段按 UTC 计算，节假日日期按中国标准时间判定，所有换算都通过浏览器的
  IANA `Intl` 数据库完成——没有硬编码的 UTC 偏移，且对夏令时安全。
- 🪶 **轻量、零依赖**：一个客户端 bundle，一个 60 秒定时器外加一个切换定时器；没有 npm
  运行时依赖；没有图表、仪表盘、分析或模型切换。
- 🔒 **设计上保护隐私**：无 API 密钥、无后端、无数据库、无轮询、无遥测。
- 🧹 **干净的生命周期**：卸载时会移除每一个定时器、监听器、观察器和样式表；插件可以干净地
  卸载并重新加载，且始终只有一次注册。

## 3. 界面位置

指示器注册在 **`sidebar.footer.action`** 中——这是一个 root 作用域的列表插槽，即随附的侧边栏
包 `@deepseek-ai/dsh-client-ui-sidebar` 所声明的“侧边栏底部 Settings 旁的可选操作”。

为什么选择这个插槽：

- 它是 **root 作用域** 的，因此不依赖 Session、Conversation 或 Composer；
- 它属于 **常驻的应用外壳**，因此应用启动后立即存在；
- 它是一个 **可累加的列表插槽**（`replaceRisk: none`），因此它位于随附的 Settings 控件旁边，
  而不会替换任何东西；
- 所有者会传入 `wide` 标志，因此指示器可以在 56 px 宽的窄栏中渲染为紧凑形式。

插件也考察过 `sidebar.brand.mark`（品牌区域）并放弃了它：在 v0.2.1-rc.5 中，该插槽是
**一个仅供替换、且已被随附品牌标识占用的座位**（`replaceRisk: shadows-shipped-ui`）。使用它
会遮蔽产品品牌，而不是增加一个状态指示器；而且在 Windows 标题栏布局下，它不会在折叠窄栏中渲染。

侧边栏展开时会渲染一个紧凑胶囊——`● OFF-PEAK`、`● PEAK` 或 `● UNKNOWN`——而折叠窄栏（外壳
在那里以 `wide: false` 渲染底部操作）会渲染一个 28 px 的纯圆点按钮，其 tooltip 和无障碍名称
承载状态。Windows 折叠侧边栏下的行为见[已知限制](#14-已知限制)。

## 4. PEAK, OFF-PEAK 与 UNKNOWN

| 状态 | 含义 |
| --- | --- |
| 🔴 **PEAK** | 当前时刻位于官方 DeepSeek 峰时窗口内、日期为周一至周五，且该日期 **不是** 已核实的中国法定节假日。适用较高的 API 价格。 |
| 🟢 **OFF-PEAK** | 其他所有情况：不在两个每日峰时窗口内、处于周末，或处于已核实的中国法定节假日。适用半价 API 价格。 |
| ⚪ **UNKNOWN** | 当前时刻位于工作日峰时窗口内，但该年份的本地节假日日历 **尚未核实**（缺失、未发布或格式错误）。在缺少已核实节假日数据的情况下，插件拒绝断言为 PEAK 或 OFF-PEAK。 |

周末全天保持谷时，包括国务院宣布为调休上班日的周末日期，这遵循 DeepSeek 关于周末和节假日
“全天”谷时的表述。极简弹出层对 UNKNOWN 从不显示倒计时。

## 5. 极简弹出层

点击指示器；再次点击、按 `Escape`，或点击外部即可关闭。弹出层恰好只有 **两行**：

**PEAK**

```
🔴 PEAK
Off-Peak starts in: 2h 13m
```

**OFF-PEAK**

```
🟢 OFF-PEAK
Peak starts in: 61h 29m
```

**UNKNOWN**

```
⚪ UNKNOWN
Next transition cannot be reliably determined.
```

- 倒计时是当前时段结束前的剩余时间，仅以整小时和分钟显示（绝不显示秒）。
- 它每分钟刷新一次；一个精确的切换定时器会在官方边界翻转状态。
- 如果当前时段的结束时间会落在节假日日历尚未核实的年份，插件会显示 UNKNOWN 那一行，而不是
  编造一个倒计时。
- 弹出层不显示当前时间、其他时区、定价解释、时段表格、来源链接或节假日细节。

## 6. DeepSeek 官方定价时段

依据官方定价文档：

- **峰时：** 周一至周五，**01:00–04:00 UTC** 与 **06:00–10:00 UTC**
  （= 北京时间 09:00–12:00 和 14:00–18:00），**不含中国法定节假日**。
- **谷时：** 其他所有小时，外加周末和中国法定节假日全天。
- **谷时价格是峰时价格的一半。**

根据官方变更日志，DeepSeek 于 2026-08-16 16:00 UTC 引入峰谷定价；在依赖这些数字之前，
请始终核对当前的官方页面。

来源：[DeepSeek 定价](https://api-docs.deepseek.com/quick_start/pricing/) ·
[中文定价页面](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) ·
[变更日志](https://api-docs.deepseek.com/updates)。

## 7. 中国法定节假日覆盖

节假日日期保存在可编辑的本地文件 [`holidays.json`](holidays.json) 中，并由
[`tools/sync-holidays.mjs`](tools/sync-holidays.mjs) 内联进浏览器 bundle（浏览器 bundle 在
运行时无法读取同级文件）。

- 每一年是一个区块，包含 `verified`、`published`、`source`、`ranges`，以及（供参考的）
  `makeupWorkdays`。
- 仅当存在 `verified: true`、非空的官方 `source`，且包含格式良好、真实的日历日期时，该年才
  计为 **已核实**。
- 随附的表格包含 **2025** 与 **2026**，两者均取自国务院公告
  （[2025 年公告](https://www.gov.cn/zhengce/content/202411/content_6986382.htm)、
  [2026 年公告](https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm)）。
- **2027 被有意设为未核实：** 本版本准备时（2026-10-30）年度节假日安排尚未公布。因此在
  2027 年，工作日峰时窗口会显示 **UNKNOWN**；周末和窗口之外的小时仍然确定（OFF-PEAK），
  `holidays.json` 中的条目也说明了这是“UNKNOWN，而不是没有节假日”。

要新增年份：编辑 `holidays.json`，运行 `node tools/sync-holidays.mjs`，然后运行测试。没有
已核实数据的年份绝不会产生错误的 PEAK。

## 8. Asia/Kabul 时区处理

时段本身以 UTC 和中国标准时间定义，插件用 IANA 时区规则实现它，从不使用固定偏移：

- 峰时窗口按 **UTC** 的当日分钟数比较。
- 节假日日期按该时刻的 **`Asia/Shanghai`** 日历日期查表，因此节假日是按“中国的日期”判定，
  而不是靠 UTC 偏移去猜。
- 中国节假日开始或结束的边界（中国午夜）**由配置的日历时区经 `Intl` 推导**——对
  `Asia/Shanghai` 来说即 16:00 UTC；这个数字是计算出来的，而非硬编码。
- 该 bundle 保留了时区感知的 `Intl` 辅助函数（`formatZoned`、`formatOffset`），它们通过
  `DISPLAY_TIME_ZONE` 常量默认使用 **`Asia/Kabul`**。它们对任何 IANA 时区都能正确处理
  夏令时，并有测试覆盖喀布尔（`UTC+04:30`，无夏令时）以及 `America/New_York` 和
  `Europe/London` 的夏令时切换。
- 注意：当前的极简弹出层有意 **只显示时长**，因此不会显示当前的喀布尔时间。上述时区机制
  仍然正确地决定了时段。在 [`client.js`](client.js) 中修改 `DISPLAY_TIME_ZONE`，即可为这些
  辅助函数的任何未来用途选择不同的默认显示时区。

## 9. 架构与插件生命周期

该插件是一个 **DSH bundle，包含浏览器侧（Client）的一半和一个空的 Host 一半**。Host 行存在
只是为了让 Loader 知道这个包；所有工作都在浏览器中完成。

总体流程：

1. profile 依赖从 GitHub 安装（`dsh plugin add github:…`），因此 Loader 会读取
   [`package.json`](package.json)。
2. `dsh.bundle.patch` 指向 [`cordis.patch.yml`](cordis.patch.yml)，后者为该包插入 Loader 行
   `deepseek-peak-indicator`。
3. `index.js` 导出一个空的 `apply()`——Host 一半没有任何需要计算、存储或提供的内容。
4. `dsh.client` 声明浏览器一半：`platform: "web"`、`immediately: true`，以及对随附侧边栏包的
   `inject` 依赖。Harness 会把 [`client.js`](client.js) 作为惰性客户端模块提供。
5. `client.js` 通过 `window.__ModuleLoader__.load({ id, factory })` 注册其工厂，从共享模块表
   引入 `react` / `react-dom`，并返回 `{ inject: ['slots'], apply }`。
6. `apply(ctx)` 用一个 effect 注册语言词典，然后通过 `ctx.slots.inject(...)` /
   `ctx.slots.register(...)` 把指示器组件注册进 `sidebar.footer.action`。
7. 组件维护一个墙钟状态、一个 60 秒间隔和一个切换定时器。当插件被禁用或页面卸载时，插槽注册
   被释放，React 卸载该组件，每个 effect 的清理逻辑都会移除其定时器/监听器/观察器/样式。
8. 重新启用时会再次注册恰好一个指示器；不会产生重复注册。

完整设计、状态算法、切换搜索和清理规则见 [`docs/architecture.md`](docs/architecture.md)。

## 10. 项目结构

```text
deepseek-peak-indicator/
├── client.js                 # browser half: schedule core + sidebar indicator + popover
├── index.js                  # empty Host half (Loader row / plugin inventory)
├── package.json              # bundle manifest, dsh.bundle / dsh.client, metadata
├── cordis.patch.yml          # Loader patch inserting the plugin row
├── holidays.json             # editable Chinese public holiday calendar
├── icon.svg                  # plugin icon (exported as ./icon)
├── locale/
│   ├── en.json               # display metadata (English)
│   └── zh.json               # display metadata (Chinese)
├── tools/
│   └── sync-holidays.mjs     # inlines holidays.json into client.js
├── test/
│   └── schedule.test.mjs     # 22 Node tests (schedule, popover, registration)
├── docs/
│   ├── architecture.md       # how the plugin works
│   ├── marketplaces.md       # listing/submission preparation
│   └── screenshots/          # real screenshots + capture instructions
├── assets/
│   └── icon-180.png          # 180×180 marketplace icon (raster)
├── screenshots.json          # marketplace storefront screenshot list
├── README.md                 # this file
├── README.fa.md              # Persian/Dari
├── README.zh-CN.md           # Simplified Chinese
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── .gitignore
```

## 11. 安装

### 环境要求

- **DeepSeek Harness Desktop v0.2.1-rc.5** ——本版本正是针对该版本构建并验证的。不声称兼容
  其他版本；清单声明了 `"engines": { "dsh": "0.2.1-rc.5" }`，因此 DSH 可以拒绝未经测试的
  运行时，而不是盲目加载它。
- 随附的侧边栏插件（`@deepseek-ai/dsh-client-ui-sidebar`）——属于常规 Web profile 的一部分，
  无需单独安装。
- 安装该插件不需要额外的 Node.js 工具链、构建步骤或 npm 依赖；DeepSeek Harness 会提供其自身使用的
  运行时。（测试和节假日同步工具是仓库中仅有的 Node.js 脚本。）

### 从 GitHub 安装（CLI）

```sh
dsh plugin --profile web add github:jalilahmad/deepseek-peak-indicator
```

然后重新加载 Harness Web GUI（或重启 DeepSeek Harness Desktop），使客户端模块图加载。在支持
HMR 的 harness 上，通常刷新页面即可。

### 从插件管理器安装（GUI）

1. 在 Harness 侧边栏打开 **Plugins**。
2. 选择 **Add plugin** → **Install a third-party plugin**。
3. 输入 GitHub 规格 `github:jalilahmad/deepseek-peak-indicator` 并安装。
4. 确认新 bundle 已切换为 **On**，然后重新加载页面。

### 从本地检出安装（开发）

```sh
git clone https://github.com/jalilahmad/deepseek-peak-indicator.git
dsh plugin --profile web add /absolute/path/to/deepseek-peak-indicator
```

或者使用 **Plugins → Add plugin** 指向本地目录。没有构建步骤。

## 12. 更新与卸载

### 更新

DeepSeek Harness 不会就地更新任意从 GitHub 安装的 bundle。要更新：

1. 打开 **Plugins**，找到 **DeepSeek Peak Indicator**，使用 **Remove**（或者在终端执行
   `dsh plugin --profile web remove @local/deepseek-peak-indicator`）。
2. 用相同的 GitHub 规格重新安装（见[安装](#11-安装)）。
3. 重新加载 Web GUI。

### 卸载

- **插件管理器：** **Plugins** → **DeepSeek Peak Indicator** → **Remove**。这会移除依赖并
  卸载该行；不影响任何其他插件或设置。
- **CLI：** `dsh plugin --profile web remove @local/deepseek-peak-indicator`。

该插件除自身 bundle 之外不存储任何内容，因此卸载后不会留下数据。

## 13. 测试

仓库随附 22 个 Node 测试，覆盖时段核心、极简弹出层模型、两种渲染出的侧边栏形态（宽胶囊 /
窄栏圆点）、注册契约，以及保留的时区辅助函数：

```sh
node --test test/schedule.test.mjs
```

预期结果（已验证）：

```text
tests 22
pass 22
fail 0
```

已在 Node.js **v24.21.0**（DeepSeek Harness Desktop v0.2.1-rc.5 内置的运行时）上验证。测试
只使用 Node 内置的 `node:test` 和 `node:assert`，无需安装任何依赖。该测试套件验证的内容包括：

- 两个官方峰时窗口、谷时小时、周末以及周末调休上班日；
- 已核实的中国节假日覆盖，以及 2027 年未发布时的 UNKNOWN 行为；
- 精确的下一次切换时刻（包括周五 → 周一以及国庆假期区块）；
- 两行弹出层的视图模型（恰好四个字段，UNKNOWN 时不编造倒计时）；
- 仅含小时与分钟的倒计时格式；
- `sidebar.footer.action` 中恰好一次全局注册；
- 由 Intl 推导的中国午夜边界，以及对畸形日期的拒绝；
- 对夏令时安全的 `Intl` 格式化辅助函数。

## 14. 已知限制

- **Windows 桌面版折叠侧边栏：** 当 Windows 标题栏布局折叠该列时，随附的侧边栏外壳会用 CSS
  隐藏其整个页脚（`[data-windows-titlebar] .wtg9ga_collapsed .wtg9ga_footArea { display: none }`），
  随附的 Settings 控件也在其中。因此指示器在默认展开的侧边栏中可见，但在该特定布局下折叠
  侧边栏时不可见。当外壳确实渲染页脚时（Web / 非标题栏折叠），56 px 宽栏中会使用紧凑的纯
  圆点形态。这是外壳行为，不是插件缺陷；在该状态下没有任何可累加的 root 插槽能保持可见。
- **2027 年节假日数据：** 本版本准备时，中国 2027 年法定节假日安排尚未公布，因此 2027 年的
  工作日峰时窗口会显示 **UNKNOWN**，直到维护者更新 `holidays.json`。周末和非峰时小时仍然
  确定。
- **兼容性：** 仅测试过 **DeepSeek Harness Desktop v0.2.1-rc.5**。不声称兼容其他 DSH 版本、
  其他客户端和其他平台；清单固定了已测试的 DSH 版本。
- **截图：** [截图](#16-截图) 中的视觉截图在当前检出版本中尚待补充；见
  [`docs/screenshots/SCREENSHOTS_NEEDED.md`](docs/screenshots/SCREENSHOTS_NEEDED.md)。
- **包名：** 包保留了其创建时的名称 `@local/deepseek-peak-indicator`。`@local/` 作用域表示
  这是来源（GitHub）bundle，而不是 npm 发布的包；上面的安装命令使用的是仓库规格，而非包名。
  重命名会改变现有安装的已安装身份，因此留待单独、审慎的发布决定。
- **节假日更新是手动的：** 插件从不从网络获取节假日数据。过时的表格不会为未核实的年份产生
  错误的 PEAK（它会显示 UNKNOWN），但已核实的年份必须依据官方公告刷新。
- **视觉外观：** 实时注册与各状态均已验证；生成此版本的环境中未捕获像素级截图。

## 15. 隐私与安全

- **无 API 密钥。** 插件从不请求、存储或使用 DeepSeek API 密钥。
- **无后端、无数据库。** 没有服务器组件、没有存储、没有账户访问。
- **无网络请求。** `client.js` 中不含 `fetch`、`XMLHttpRequest`、`WebSocket`、`EventSource`
  或 `import()`；一切都由本地时钟和内置的节假日表计算得出。
- **无轮询。** 唯一的定时器是一个 60 秒倒计时刷新和一个精确的切换定时器；两者都只是读取
  本地墙钟。
- **无遥测。** 不收集、不记录、不发送任何内容。
- **仓库中无密文。** bundle 中不含密钥、令牌、个人路径或机器状态；针对这些内容的 CI 式检查
  是发布审计的一部分。
- **标准的代码执行注意事项：** 与每个 DSH 插件一样，已安装插件的代码以 Harness 应用的本地
  权限运行。安装第三方构建之前，请审阅本仓库中的源代码。
- 详情与报告：[SECURITY.md](SECURITY.md)。

## 16. 截图

> **截图待补充：** 下面的图片正是本版本所期望的文件。它们未在准备此版本的环境中捕获。一旦
> 在 [`docs/screenshots/`](docs/screenshots/) 下添加真实截图，这些引用即可解析，无需再修改
> README。捕获说明：[`docs/screenshots/SCREENSHOTS_NEEDED.md`](docs/screenshots/SCREENSHOTS_NEEDED.md)。

**完整应用——侧边栏底部的指示器**

![DeepSeek Harness 完整窗口，侧边栏底部显示 OFF-PEAK 指示器](docs/screenshots/01-indicator-sidebar.png)

**带极简弹出层的 PEAK**

![PEAK 指示器及两行弹出层，内容为“Off-Peak starts in: 2h 13m”](docs/screenshots/02-popover-peak.png)

**带极简弹出层的 OFF-PEAK**

![OFF-PEAK 指示器及两行弹出层，内容为“Peak starts in: 61h 29m”](docs/screenshots/03-popover-offpeak.png)

**UNKNOWN 状态**

![UNKNOWN 指示器及两行弹出层，内容为“Next transition cannot be reliably determined.”](docs/screenshots/04-popover-unknown.png)

**插件管理器中的插件条目（可选）**

![Harness Plugins 页面中的 DeepSeek Peak Indicator 条目](docs/screenshots/05-plugin-manager.png)

## 17. 作者与仓库

- **作者：** Jalil Ahmad Fazeli
- **GitHub：** [@jalilahmad](https://github.com/jalilahmad)
- **仓库：** [jalilahmad/deepseek-peak-indicator](https://github.com/jalilahmad/deepseek-peak-indicator)
- **问题与功能请求：** [GitHub Issues](https://github.com/jalilahmad/deepseek-peak-indicator/issues)

基于 DeepSeek Harness Desktop v0.2.1-rc.5 构建并验证。这是一个独立的社区插件；与 DeepSeek
无隶属关系。

## 18. 许可证

[MIT](LICENSE) © 2026 Jalil Ahmad Fazeli。

## 19. 致谢与官方来源

- 插件架构遵循官方 DeepSeek Harness 的 bundle/Cordis 插件模型（`dsh.bundle` patch +
  `dsh.client` 浏览器一半 + `ctx.slots` 注册）。
- 官方定价规则与峰谷窗口：
  [DeepSeek API 定价](https://api-docs.deepseek.com/quick_start/pricing/) 以及
  [中文版](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)。
- 定价推出时间与生效日期：[DeepSeek API 变更日志](https://api-docs.deepseek.com/updates)。
- 中国法定节假日安排：
  [2025 年国务院公告](https://www.gov.cn/zhengce/content/202411/content_6986382.htm) 以及
  [2026 年国务院公告](https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm)。
- `Intl`/IANA 时区数据：浏览器运行时（无第三方时区库）。
- 图标：为本插件创作的原始图形。
- 未内置任何第三方源代码；`react` 与 `react-dom` 在运行时由 Harness 浏览器模块表提供。
