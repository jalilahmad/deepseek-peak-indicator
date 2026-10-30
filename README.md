# DeepSeek Peak Indicator

**English** · [فارسی](README.fa.md) · [简体中文](README.zh-CN.md)

![DSH](https://img.shields.io/badge/DeepSeek%20Harness-0.2.1--rc.5-blue)
![Tests](https://img.shields.io/badge/tests-22%2F22-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

A small DeepSeek Harness plugin that shows whether the official **DeepSeek API pricing period**
is currently peak or off-peak — right in the global sidebar footer, from application start,
with no Session or Conversation open.

> Peak means the official API price is the higher **peak** rate. It is **not** a claim about
> server load or congestion; it only reports the billing period defined by DeepSeek.

- Plugin package: `@local/deepseek-peak-indicator` · Version `1.0.0`
- Verified on: **DeepSeek Harness Desktop v0.2.1-rc.5** (Windows)
- UI slot: **`sidebar.footer.action`** (root-scoped, permanent sidebar footer)
- No API key, no backend, no network requests, no telemetry.

---

## Table of contents

1. [Introduction and purpose](#1-introduction-and-purpose)
2. [Main features](#2-main-features)
3. [Interface placement](#3-interface-placement)
4. [PEAK, OFF-PEAK and UNKNOWN](#4-peak-off-peak-and-unknown)
5. [The minimal popover](#5-the-minimal-popover)
6. [Official DeepSeek pricing schedule](#6-official-deepseek-pricing-schedule)
7. [Chinese public holiday overrides](#7-chinese-public-holiday-overrides)
8. [Asia/Kabul timezone handling](#8-asiakabul-timezone-handling)
9. [Architecture and plugin lifecycle](#9-architecture-and-plugin-lifecycle)
10. [Project structure](#10-project-structure)
11. [Installation](#11-installation)
12. [Updating and uninstalling](#12-updating-and-uninstalling)
13. [Tests](#13-tests)
14. [Known limitations](#14-known-limitations)
15. [Privacy and security](#15-privacy-and-security)
16. [Screenshots](#16-screenshots)
17. [Author and repository](#17-author-and-repository)
18. [License](#18-license)
19. [Credits and official sources](#19-credits-and-official-sources)

---

## 1. Introduction and purpose

DeepSeek's API charges a **peak price** and a **half-price off-peak price** depending on the time
of day (and on Chinese public holidays). The rules are published in the official pricing page, but
you have to remember them, convert them to your own timezone, and check the clock.

**DeepSeek Peak Indicator** does exactly that, in one glance: a small colored dot and a label in the
Harness sidebar footer. Click it and the plugin tells you only what you need — the current period
and how long it lasts:

- it is a **pricing-period indicator**, not a load monitor;
- it works **before any Session is opened**;
- it uses **no API key and makes no network requests**;
- it never guesses: if the Chinese holiday calendar for a year is not verified, the indicator shows
  **UNKNOWN** during the only hours where the holiday calendar matters.

## 2. Main features

- 🟢/🔴/⚪ **One glance, three states**: OFF-PEAK, PEAK, UNKNOWN.
- 📍 **Global placement**: permanent sidebar footer, independent of Sessions, Conversations and the
  Composer.
- 🖱️ **Minimal two-line popover**: status plus the time remaining in the current period.
- ⏱️ **Accurate**: the status flips exactly at the official period boundary; the countdown refreshes
  once a minute in hours and minutes (never seconds).
- 🇨🇳 **Official Chinese public holidays**: 2025 and 2026 verified from State Council notices; a year
  that is not verified is reported as UNKNOWN instead of "no holidays".
- 🌐 **Timezone-safe**: schedule evaluated in UTC, holiday dates in China Standard Time, all
  conversions through the browser's IANA `Intl` database — no hardcoded UTC offsets, DST-safe.
- 🪶 **Tiny and dependency-free**: one client bundle, one 60-second timer plus one transition timer;
  no npm runtime dependencies; no charts, dashboards, analytics or model switching.
- 🔒 **Private by design**: no API key, no backend, no database, no polling, no telemetry.
- 🧹 **Clean lifecycle**: every timer, listener, observer and style sheet is removed on unload; the
  plugin unloads and reloads cleanly with exactly one registration.

## 3. Interface placement

The indicator registers in **`sidebar.footer.action`** — the root-scoped list slot
“Optional actions beside Settings at the sidebar foot”, declared by the shipped sidebar package
`@deepseek-ai/dsh-client-ui-sidebar`.

Why this slot:

- it is **root-scoped**, so it does not depend on a Session, Conversation or Composer;
- it is part of the **permanent application shell**, so it is present immediately after start;
- it is an **additive list slot** (`replaceRisk: none`), so it sits beside the shipped Settings
  control without replacing anything;
- the owner passes a `wide` flag, so the indicator can render a compact form in the 56 px rail.

The plugin also inspected `sidebar.brand.mark` (the brand area) and rejected it: in
v0.2.1-rc.5 that slot is a **single, replace-only seat already occupied by the shipped brand mark**
(`replaceRisk: shadows-shipped-ui`). Using it would shadow the product brand rather than add a
status indicator, and on the Windows titlebar layout it is not rendered in the collapsed rail.

The expanded sidebar renders a compact pill — `● OFF-PEAK`, `● PEAK` or `● UNKNOWN` — and the
collapsed rail (where the shell renders the footer action with `wide: false`) renders a 28 px
dot-only button whose tooltip and accessible name carry the status. See
[Known limitations](#14-known-limitations) for the Windows collapsed-sidebar behaviour.

## 4. PEAK, OFF-PEAK and UNKNOWN

| State | Meaning |
| --- | --- |
| 🔴 **PEAK** | The current instant is inside an official DeepSeek peak window, on a Monday–Friday, and the date is **not** a verified Chinese public holiday. Higher API price applies. |
| 🟢 **OFF-PEAK** | Everything else: outside the two daily peak windows, on a weekend, or on a verified Chinese public holiday. Half-price API price applies. |
| ⚪ **UNKNOWN** | The current instant is inside a weekday peak window, but the local holiday calendar for that year is **not verified** (missing, unpublished or malformed). The plugin refuses to claim PEAK or OFF-PEAK without verified holiday data. |

Weekends stay off-peak for the whole day, including weekend days that the Chinese State Council
declares as makeup workdays (调休), following DeepSeek's wording that weekends and holidays are
off-peak “in full”. The minimal popover never shows a countdown for UNKNOWN.

## 5. The minimal popover

Click the indicator; click it again, press `Escape`, or click outside to close it. The popover has
exactly **two lines**:

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

- The countdown is the time remaining until the current period ends, shown in whole hours and
  minutes only (never seconds).
- It refreshes once a minute; an exact transition timer flips the status at the official boundary.
- If the current period's end would land in a year whose holiday calendar is not verified, the
  plugin shows the UNKNOWN line instead of inventing a countdown.
- No current time, no other timezones, no pricing explanations, no schedule tables, no source links
  and no holiday details are displayed in the popover.

## 6. Official DeepSeek pricing schedule

Per the official pricing documentation:

- **Peak hours:** Monday to Friday, **01:00–04:00 UTC** and **06:00–10:00 UTC**
  (= 09:00–12:00 and 14:00–18:00 Beijing time), **excluding Chinese public holidays**.
- **Off-peak:** all other hours, plus weekends and Chinese public holidays in full.
- **Off-peak prices are half of peak prices.**

Peak/off-peak pricing was introduced by DeepSeek at 16:00 UTC on 2026-08-16 according to the
official change log; always check the current official page before relying on the numbers.

Sources: [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing/) ·
[Chinese pricing page](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) ·
[Change log](https://api-docs.deepseek.com/updates).

## 7. Chinese public holiday overrides

Holiday dates are stored in the editable local file [`holidays.json`](holidays.json) and inlined
into the browser bundle by [`tools/sync-holidays.mjs`](tools/sync-holidays.mjs) (a browser bundle
cannot read a sibling file at runtime).

- Each year is a block with `verified`, `published`, `source`, `ranges` and (for reference)
  `makeupWorkdays`.
- A year counts as **verified** only when `verified: true`, a non-empty official `source` and
  well-formed, real calendar dates are present.
- The shipped table contains **2025** and **2026**, both taken from the State Council notices
  ([2025 notice](https://www.gov.cn/zhengce/content/202411/content_6986382.htm),
  [2026 notice](https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm)).
- **2027 is deliberately unverified:** the annual holiday arrangement had not been published when
  this release was prepared (2026-10-30). In 2027, weekday peak windows therefore show **UNKNOWN**;
  weekends and hours outside the windows stay certain (OFF-PEAK), and the `holidays.json` entry
  explains that this is “UNKNOWN, not no holidays”.

To add a year: edit `holidays.json`, run `node tools/sync-holidays.mjs`, and run the tests. A year
without verified data never produces a false PEAK.

## 8. Asia/Kabul timezone handling

The schedule itself is defined in UTC and in China Standard Time, and the plugin implements it with
IANA timezone rules, never with fixed offsets:

- Peak windows are compared against **UTC** minutes-of-day.
- Holiday dates are looked up against the **`Asia/Shanghai`** calendar date of the instant, so a
  holiday is evaluated as “the date in China”, not as a UTC offset guess.
- The boundary where a Chinese holiday starts or ends (China midnight) is **derived from the
  configured calendar zone with `Intl`** — for `Asia/Shanghai` that is 16:00 UTC; the number is
  computed, not hardcoded.
- The bundle keeps timezone-aware `Intl` helpers (`formatZoned`, `formatOffset`) that default to
  **`Asia/Kabul`** through the `DISPLAY_TIME_ZONE` constant. They are DST-correct for any IANA zone
  and are covered by tests for Kabul (`UTC+04:30`, no DST) and for the `America/New_York` and
  `Europe/London` DST transitions.
- Note: the current minimal popover intentionally shows **only durations**, so it does not display
  the current Kabul time. The timezone machinery above still determines the schedule correctly.
  Changing `DISPLAY_TIME_ZONE` in [`client.js`](client.js) selects a different default display zone
  for any future use of those helpers.

## 9. Architecture and plugin lifecycle

The plugin is a **DSH bundle with a browser-side (Client) half and an empty Host half**. The Host
row exists only so the Loader knows the package; all work happens in the browser.

At a high level:

1. The profile dependency is installed from GitHub (`dsh plugin add github:…`), so the Loader reads
   [`package.json`](package.json).
2. `dsh.bundle.patch` points at [`cordis.patch.yml`](cordis.patch.yml), which inserts the Loader row
   `deepseek-peak-indicator` for the package.
3. `index.js` exports an empty `apply()` — the Host half has nothing to compute, store or serve.
4. `dsh.client` declares the browser half: `platform: "web"`, `immediately: true`, and an `inject`
   dependency on the shipped sidebar package. The Harness serves [`client.js`](client.js) as a lazy
   client module.
5. `client.js` registers its factory with `window.__ModuleLoader__.load({ id, factory })`, requires
   `react` / `react-dom` from the shared module table, and returns `{ inject: ['slots'], apply }`.
6. `apply(ctx)` registers the locale dictionaries with an effect, then registers the indicator
   component into `sidebar.footer.action` via `ctx.slots.inject(...)` / `ctx.slots.register(...)`.
7. The component keeps one wall-clock state, one 60-second interval and one transition timer. When
   the plugin is disabled or the page unloads, the slot registration is disposed, React unmounts the
   component, and every effect cleanup removes its timer/listener/observer/style.
8. Re-enabling registers exactly one indicator again; no duplicate registration is created.

The full design, the status algorithm, the transition search and the cleanup rules are described in
[`docs/architecture.md`](docs/architecture.md).

## 10. Project structure

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

## 11. Installation

### Requirements

- **DeepSeek Harness Desktop v0.2.1-rc.5** — the version this release was built and verified
  against. Other versions are not claimed compatible; the manifest declares
  `"engines": { "dsh": "0.2.1-rc.5" }` so DSH can refuse an untested runtime instead of loading it
  blindly.
- The shipped sidebar plugin (`@deepseek-ai/dsh-client-ui-sidebar`) — part of the normal Web
  profile, no separate installation needed.
- No extra Node.js toolchain, build step or npm dependencies are needed to install the plugin;
  DeepSeek Harness supplies the runtime it already uses. (The tests and the holiday sync tool are the
  only Node.js scripts in the repository.)

### Install from GitHub (CLI)

```sh
dsh plugin --profile web add github:jalilahmad/deepseek-peak-indicator
```

Then reload the Harness Web GUI (or restart DeepSeek Harness Desktop) so the client module graph
loads. On a harness with HMR, a page refresh is usually enough.

### Install from the Plugin Manager (GUI)

1. Open **Plugins** in the Harness sidebar.
2. Choose **Add plugin** → **Install a third-party plugin**.
3. Enter the GitHub spec `github:jalilahmad/deepseek-peak-indicator` and install.
4. Make sure the new bundle is switched **On**, then reload the page.

### Install from a local checkout (development)

```sh
git clone https://github.com/jalilahmad/deepseek-peak-indicator.git
dsh plugin --profile web add /absolute/path/to/deepseek-peak-indicator
```

or use **Plugins → Add plugin** and point it at the local directory. There is no build step.

## 12. Updating and uninstalling

### Update

DeepSeek Harness does not update arbitrary GitHub-installed bundles in place. To update:

1. Open **Plugins**, find **DeepSeek Peak Indicator**, and use **Remove** (or, from a terminal,
   `dsh plugin --profile web remove @local/deepseek-peak-indicator`).
2. Reinstall from the same GitHub spec (see [Installation](#11-installation)).
3. Reload the Web GUI.

### Uninstall

- **Plugin Manager:** **Plugins** → **DeepSeek Peak Indicator** → **Remove**. This removes the
  dependency and unloads the row; no other plugin or setting is affected.
- **CLI:** `dsh plugin --profile web remove @local/deepseek-peak-indicator`.

The plugin stores nothing outside its own bundle, so uninstalling leaves no data behind.

## 13. Tests

The repository ships 22 Node tests covering the schedule core, the minimal popover model, the two
rendered sidebar forms (wide pill / compact rail dot), the registration contract, and the preserved
timezone helpers:

```sh
node --test test/schedule.test.mjs
```

Expected result (verified):

```text
tests 22
pass 22
fail 0
```

Verified with Node.js **v24.21.0** (the runtime bundled with DeepSeek Harness Desktop
v0.2.1-rc.5). The tests use only Node's built-in `node:test` and `node:assert`, and need no
installed dependencies. The suite verifies, among other things:

- both official peak windows, off-peak hours, weekends and weekend makeup workdays;
- verified Chinese holiday overrides and the unpublished-2027 UNKNOWN behaviour;
- exact next-transition instants (including Friday → Monday and the National Day block);
- the two-line popover view model (exactly four fields, no invented countdown for UNKNOWN);
- hours-and-minutes-only countdown formatting;
- exactly one global registration in `sidebar.footer.action`;
- the Intl-derived China-midnight boundary and malformed-date rejection;
- DST-safe `Intl` formatting helpers.

## 14. Known limitations

- **Windows Desktop collapsed sidebar:** the shipped sidebar shell CSS-hides its entire footer when
  the Windows titlebar layout collapses the column
  (`[data-windows-titlebar] .wtg9ga_collapsed .wtg9ga_footArea { display: none }`), including the
  shipped Settings control. The indicator is therefore visible in the default expanded sidebar but
  not while the sidebar is collapsed on that specific layout. The compact dot-only form is used in
  the 56 px rail where the shell does render the footer (Web / non-titlebar collapse). This is shell
  behaviour, not a plugin defect; no additive root slot remains visible in that state.
- **2027 holiday data:** the Chinese 2027 public-holiday arrangement was not published when this
  release was prepared, so weekday peak windows in 2027 show **UNKNOWN** until a maintainer updates
  `holidays.json`. Weekends and off-hours remain certain.
- **Compatibility:** only **DeepSeek Harness Desktop v0.2.1-rc.5** has been tested. Other DSH
  versions, other clients and other platforms are not claimed compatible; the manifest pins the
  tested DSH version.
- **Screenshots:** the visual captures in [Screenshots](#16-screenshots) are pending in this
  checkout; see [`docs/screenshots/SCREENSHOTS_NEEDED.md`](docs/screenshots/SCREENSHOTS_NEEDED.md).
- **Package name:** the package keeps the name `@local/deepseek-peak-indicator` it was created
  with. The `@local/` scope indicates a source (GitHub) bundle rather than an npm-published package;
  the install command above uses the repository spec, not the package name. Renaming it would change
  the installed identity of existing installations and is therefore left for a deliberate,
  separate release decision.
- **Holiday updates are manual:** the plugin never fetches holiday data from the network. An
  outdated table cannot produce a wrong PEAK for an unverified year (it shows UNKNOWN), but a
  verified year must be refreshed from the official notice.
- **Visual appearance:** the live registration and states are verified; pixel-level screenshots
  were not captured in the environment that produced this release.

## 15. Privacy and security

- **No API key.** The plugin never asks for, stores or uses a DeepSeek API key.
- **No backend, no database.** There is no server component, no storage, no account access.
- **No network requests.** `client.js` contains no `fetch`, `XMLHttpRequest`, `WebSocket`,
  `EventSource` or `import()`; it computes everything from the local clock and the bundled holiday
  table.
- **No polling.** The only timers are one 60-second countdown refresh and one exact transition timer;
  both are local wall-clock reads.
- **No telemetry.** Nothing is collected, logged or sent.
- **No secrets in the repository.** The bundle contains no keys, tokens, personal paths or machine
  state; CI-style checks for those are part of the release audit.
- **Standard code-execution caveat:** like every DSH plugin, installed plugin code runs with the
  Harness application's local permissions. Review the source in this repository before installing
  third-party builds.
- Details and reporting: [SECURITY.md](SECURITY.md).

## 16. Screenshots

> **Capture pending:** the images below are the exact files the release expects. They were not
> captured in the environment that prepared this release. Once the real captures are added under
> [`docs/screenshots/`](docs/screenshots/), these references resolve and no README edit is needed.
> Capture instructions: [`docs/screenshots/SCREENSHOTS_NEEDED.md`](docs/screenshots/SCREENSHOTS_NEEDED.md).

**Full application — indicator in the sidebar footer**

![Full DeepSeek Harness window with the OFF-PEAK indicator in the sidebar footer](docs/screenshots/01-indicator-sidebar.png)

**PEAK with the minimal popover**

![PEAK indicator with the two-line popover reading “Off-Peak starts in: 2h 13m”](docs/screenshots/02-popover-peak.png)

**OFF-PEAK with the minimal popover**

![OFF-PEAK indicator with the two-line popover reading “Peak starts in: 61h 29m”](docs/screenshots/03-popover-offpeak.png)

**UNKNOWN state**

![UNKNOWN indicator with the two-line popover reading “Next transition cannot be reliably determined.”](docs/screenshots/04-popover-unknown.png)

**Plugin entry in the Plugin Manager (optional)**

![DeepSeek Peak Indicator entry in the Harness Plugins page](docs/screenshots/05-plugin-manager.png)

## 17. Author and repository

- **Author:** Jalil Ahmad Fazeli
- **GitHub:** [@jalilahmad](https://github.com/jalilahmad)
- **Repository:** [jalilahmad/deepseek-peak-indicator](https://github.com/jalilahmad/deepseek-peak-indicator)
- **Issues and feature requests:** [GitHub Issues](https://github.com/jalilahmad/deepseek-peak-indicator/issues)

Built and verified against DeepSeek Harness Desktop v0.2.1-rc.5. This is an independent community
plugin; it is not affiliated with DeepSeek.

## 18. License

[MIT](LICENSE) © 2026 Jalil Ahmad Fazeli.

## 19. Credits and official sources

- The plugin architecture follows the official DeepSeek Harness bundle/Cordis plugin model
  (`dsh.bundle` patch + `dsh.client` browser half + `ctx.slots` registration).
- Official pricing rules and peak/off-peak windows:
  [DeepSeek API pricing](https://api-docs.deepseek.com/quick_start/pricing/) and the
  [Chinese version](https://api-docs.deepseek.com/zh-cn/quick_start/pricing).
- Pricing introduction and effective date: [DeepSeek API change log](https://api-docs.deepseek.com/updates).
- Chinese public holiday arrangements:
  [2025 State Council notice](https://www.gov.cn/zhengce/content/202411/content_6986382.htm) and
  [2026 State Council notice](https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm).
- `Intl`/IANA timezone data: the browser runtime (no third-party timezone library).
- Icon: original artwork created for this plugin.
- No third-party source code is vendored; `react` and `react-dom` are provided by the Harness
  browser module table at runtime.
