# Architecture

This document explains how **DeepSeek Peak Indicator** is built, how it plugs into DeepSeek
Harness, how the status and countdown are computed, and why the plugin needs neither a backend nor
an API key. It is written for both plugin users and developers.

For the user-facing guide (installation, states, popover, limitations), see [`README.md`](../README.md).

---

## 1. Overview

DeepSeek Peak Indicator is a **DSH bundle** with two halves:

| Half | File | Role |
| --- | --- | --- |
| Host (Cordis plugin) | [`index.js`](../index.js) | An empty `apply()` that exists only so the Loader has a row for the package. |
| Client (browser) | [`client.js`](../client.js) | The only real implementation: schedule engine, sidebar indicator, minimal popover, timers, cleanup. |

All logic runs locally in the browser. There is no server, no database, no network request and no
API key. The plugin reads the local wall clock and a bundled Chinese holiday table.

---

## 2. How a DSH bundle is connected to the Harness

A plugin repository becomes installable when its `package.json` declares a `dsh.bundle` manifest.
The install command (`dsh plugin --profile web add github:…`) adds the repository as a profile
dependency, and the Loader reads the manifest and the patch layer.

### `package.json` — the bundle manifest

```jsonc
{
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },   // required: makes it a bundle
    "client": {                                     // the browser half
      "platform": "web",
      "immediately": true,
      "inject": ["@deepseek-ai/dsh-client-ui-sidebar"]
    }
  }
}
```

- `dsh.bundle.patch` points at the Cordis patch file below.
- `dsh.client` tells the client module system that this package has a browser entry
  (`exports["./client"] → ./client.js`), may load it eagerly (`immediately: true`), and depends on
  the shipped sidebar package, which declares the slot this plugin uses.
- `engines.dsh` pins the tested Harness version (`0.2.1-rc.5`), so DSH can refuse an untested
  runtime instead of loading the plugin blindly.

### `cordis.patch.yml` — the Loader patch

```yaml
- insert:
    - id: deepseek-peak-indicator
      name: '@local/deepseek-peak-indicator'
```

The patch inserts one Loader row. The row id is the plugin's identity in the inventory and in the
profile patch; the `name` is the package. There is no configuration schema and no config block
because the plugin has nothing to configure.

### `index.js` — the Host half

The Host half exports a deliberately empty `apply()`. DeepSeek Peak Indicator has nothing to
compute, persist or serve on the Host: the browser already has the clock and the holiday table.

### `client.js` — the browser half

The Harness client module system serves `client.js` as a lazy client module. The file registers a
factory in the official module-loader shape:

```js
window.__ModuleLoader__.load({
  id: '@local/deepseek-peak-indicator',
  factory(require) {
    const React = require('react');
    const createPortal = require('react-dom').createPortal;
    // … schedule core, component, registration …
    return { inject: ['slots'], apply };
  },
});
```

- `id` equals the package name; the module system uses it to attach the browser half to the Loader
  row.
- `react` and `react-dom` are resolved from the Harness's shared browser module table. They are not
  bundled or declared as npm dependencies.
- The factory only defines code. Side effects (slot registration, locale dictionaries) run in
  `apply`, which is bound to the plugin's lifetime.

---

## 3. UI registration in the global sidebar footer

`apply(ctx)` receives the Client Cordis context. It does two things:

1. Registers the popover copy dictionaries through the Client locale service
   (`ctx.get('locale')` + `locale.register(ns, locale, dict)`), and obtains a bound translator
   (`locale.bind(ns)`). Every dictionary registration is wrapped in `ctx.effect`, so it is disposed
   with the plugin. The English copy is also the built-in fallback when the locale service is
   unavailable.
2. Registers the indicator component into the global sidebar footer slot:

```js
ctx.slots.inject('sidebar.footer.action', () =>
  ctx.slots.register(
    { name: 'sidebar.footer.action', id: 'deepseek-peak-indicator', order: 10, locale: NS },
    DeepSeekPeakIndicator,
  ),
);
```

- `ctx.slots.inject(...)` waits for the slot to be declared. The slot is declared by the shipped
  `@deepseek-ai/dsh-client-ui-sidebar` package, so the plugin does not depend on load order.
- `ctx.slots.register(...)` is the official slot registration API. The registration is a Cordis
  effect owned by the plugin's fiber: when the plugin unloads, the entry is removed and the React
  component unmounts.
- `id: 'deepseek-peak-indicator'` is this plugin's own list cell. It is fresh, so the entry is added
  beside the shipped footer actions instead of replacing one.
- `order: 10` places it after the shipped entries, and `locale: NS` lets the renderer supply the
  standard `t` prop.

### Why a root-scoped slot is required

The indicator must exist **before a Session exists** and must survive opening, switching and closing
Sessions. That rules out any Session- or Conversation-scoped slot (for example
`conversation.header.leading`, which lives in the conversation panel and is not part of the permanent
application chrome in every panel state).

`sidebar.footer.action` is a **root-scoped list slot** in the sidebar shell:

- scope `root` — not tied to a Session, Conversation or Composer;
- declared and rendered unconditionally by the sidebar shell, so it is present from application
  start;
- additive (`replaceRisk: none`), unlike replacement seats such as `sidebar.brand.mark`, which is a
  single seat already occupied by the shipped brand mark;
- the owner passes `{ wide: boolean }`, which the component uses to choose between the labelled pill
  (expanded sidebar) and the compact dot (56 px rail).

The component therefore depends on exactly one owner prop, `wide`, and on no Session data.

### Rendered forms

| Sidebar state | Element | Contents |
| --- | --- | --- |
| Expanded (`wide: true`) | `button.dspi-pill` | colored dot + `PEAK` / `OFF-PEAK` / `UNKNOWN` |
| Rail (`wide: false`) | `button.dspi-compact` | colored dot only; status in `title` / `aria-label` |

Both forms open the same two-line popover, rendered through a React portal to `document.body` and
positioned from the button's bounding rectangle, so the sidebar's overflow/clipping cannot cut it off.
The popover opens above the button (it lives in the footer) and is clamped to the viewport.

---

## 4. How the status is calculated

`resolveState(now)` is the single source of truth. It is pure and testable.

```text
resolveState(now):
    if now is outside both peak windows (UTC minutes):
        return OFF_PEAK            # certain, holidays cannot matter here
    if UTC weekday is Saturday or Sunday:
        return OFF_PEAK            # weekends are off-peak in full
    holiday = holidayStatus(now)   # looks up the Asia/Shanghai calendar date
    if holiday is not known (year not verified):
        return UNKNOWN             # never guess PEAK without a calendar
    if date is inside a verified holiday range:
        return OFF_PEAK            # holiday: off-peak all day
    return PEAK
```

- **Peak windows:** `[01:00, 04:00)` and `[06:00, 10:00)` UTC, Monday–Friday.
- **Weekends:** off-peak regardless of window hours. This includes weekend makeup workdays (调休):
  DeepSeek documents weekends and holidays as off-peak “in full”, and the docs do not state that a
  makeup Saturday becomes peak.
- **Holidays:** checked only when the instant is inside a weekday peak window, because the holiday
  calendar cannot change the answer anywhere else. The date is the **China Standard Time** calendar
  date (`Asia/Shanghai`), which also makes the check independent of the user's timezone.

---

## 5. Timezone conversion

The plugin performs all timezone work through the browser's built-in **IANA `Intl`** database. No
UTC offset is hardcoded and no timezone library is used.

- Peak windows are compared against **UTC** hours/minutes (`Date#getUTCHours`, `getUTCMinutes`,
  `getUTCDay`).
- `zonedDateKey(ms, timeZone)` converts an instant into a `YYYY-MM-DD` date in a given IANA zone
  using `Intl.DateTimeFormat(...).formatToParts`, and `holidayStatus` uses it with the calendar zone
  from `holidays.json` (`Asia/Shanghai`).
- `offsetMinutes(ms, timeZone)` derives the zone's UTC offset at that instant from formatted parts;
  `formatOffset` renders it (for example `UTC+04:30`) without assuming any fixed offset. These
  helpers are DST-correct for zones that observe daylight saving.
- The boundary where a Chinese holiday day starts or ends (China midnight) is computed as
  `((24*60 - offset) mod 24*60)` UTC minutes-of-day — 16:00 UTC for `Asia/Shanghai`, but derived, not
  hardcoded.
- `DISPLAY_TIME_ZONE` defaults to **`Asia/Kabul`**. The verified `formatZoned` / `formatOffset`
  helpers use it and are covered by tests for Kabul (`UTC+04:30`, no DST) and for the
  `America/New_York` spring-forward and `Europe/London` fall-back transitions. The current minimal
  popover intentionally displays only durations, so it does not show the current time; the timezone
  machinery still governs correctness and is ready for any future display use.

---

## 6. How Chinese holiday overrides are applied

Holiday data is editable in [`holidays.json`](../holidays.json):

```jsonc
"2026": {
  "verified": true,
  "published": true,
  "source": "https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm",
  "ranges": [
    { "name": "National Day", "nameZh": "国庆节", "start": "2026-10-01", "end": "2026-10-07" }
  ],
  "makeupWorkdays": ["2026-10-10"]
}
```

A browser bundle cannot read a sibling file at runtime, so
[`tools/sync-holidays.mjs`](../tools/sync-holidays.mjs) inlines the table into `client.js` between
the `HOLIDAY_CALENDAR` markers. Editing the JSON without running the sync script has no runtime
effect; the tests fail if the two copies drift apart.

`calendarYear(year)` validates a year before using it:

- the year block exists;
- `verified === true` (a year explicitly marked unpublished or unverified is not trusted);
- a non-empty official `source` string exists;
- `ranges` is an array of real, well-formed ISO dates (`start <= end`, no impossible dates such as
  `2026-02-30`).

If any check fails, `holidayStatus` returns “not known”, and `resolveState` returns **UNKNOWN** inside
weekday peak windows. This is the “never silently assume an unknown calendar is complete” rule.

The shipped data includes verified **2025** and **2026** ranges from the State Council notices.
**2027 is intentionally unverified** (the annual arrangement was not published when this release was
prepared), so 2027 weekday peak windows show UNKNOWN until a maintainer updates the file.

---

## 7. How the next transition is calculated

The status can only change at a small set of instants:

- the four peak-window edges: `01:00`, `04:00`, `06:00`, `10:00` UTC;
- `00:00` UTC, where the UTC weekday changes;
- the calendar zone's midnight (a holiday starts or ends) — derived as described above
  (`16:00` UTC for `Asia/Shanghai`).

`nextTransition(now)` generates these candidate instants for the next 21 days, evaluates the status
at each candidate in order, and returns the first instant whose status differs from the status just
before it. The 21-day horizon is more than enough: the longest holiday block is under ten days, and
every weekend produces a transition within three days.

`describe(now)` then uses that instant to build the popover:

- current `PEAK` and next status `OFF_PEAK` → `Off-Peak starts in: Xh Ym`;
- current `OFF_PEAK` and next status `PEAK` → `Peak starts in: Xh Ym`;
- current `UNKNOWN`, or a next status that is not the expected opposite period
  (for example leaving a known 2026 period into an unverified 2027 peak window), or no transition
  found → `Next transition cannot be reliably determined.`

The plugin never invents a countdown towards a period whose classification it cannot verify.

---

## 8. How the countdown updates

The component keeps one `now` state (a millisecond timestamp). Two effects drive it:

1. **Minute refresh** — `setInterval(refresh, 60000)`. The countdown is recomputed from
   `nextTransition(now).at - now` and formatted as whole **hours and minutes** only
   (`formatHoursMinutes`, rounded up so a running period never shows `0h 0m`). Seconds are never
   displayed.
2. **Exact transition timer** — after each refresh, one `setTimeout` is scheduled for
   `next transition + 200 ms`. When it fires, it re-reads the clock, flips the status exactly at the
   boundary, and schedules the next one. This keeps the indicator correct without a fast polling
   loop.

Opening the popover also refreshes `now` immediately so the countdown is current the moment it is
shown. Both timers are local wall-clock reads: there is no polling channel, no network and no work
when the value has not changed.

---

## 9. Cleanup during unload and reload

Every resource is created inside an effect with a matching cleanup:

| Resource | Created in | Removed by |
| --- | --- | --- |
| 60 s interval | component effect | `clearInterval` in the effect cleanup |
| Transition timeout | component effect | `clearTimeout` in the effect cleanup (also re-cleared on each refresh) |
| `resize` / capture `scroll` listeners | popover placement effect | `removeEventListener` in cleanup |
| `ResizeObserver` | popover placement effect | `observer.disconnect()` in cleanup |
| `keydown` / `pointerdown` listeners | popover dismissal effect | `removeEventListener` in cleanup |
| `<style>` element | rendered as a React element inside the component | React removes it when the component unmounts |
| Locale dictionaries | `apply` via `ctx.effect` | Cordis disposes the returned disposers |
| Slot registration | `ctx.slots.register` through `ctx.slots.inject` | Cordis disposes the registration with the plugin fiber |

Plugin unload (disabling the row or removing the bundle) disposes the slot registration, which
unmounts the React component and therefore runs every effect cleanup above. Re-enabling calls
`apply` again and creates exactly one registration. The release verification exercised this cycle on
the running GUI and confirmed that the indicator disappears on disable and returns once on enable,
with no duplicate entry.

---

## 10. Why there is no backend and no API key

Everything the plugin needs is already on the client:

- the current instant, from the browser clock;
- the official peak windows, a constant in the code;
- the Chinese holiday calendar, bundled in the plugin.

Therefore the plugin does not need to authenticate, call the DeepSeek API, cache data, or synchronize
with a server. A network fetch would also defeat two of its design goals: it would require
credentials or an unauthenticated endpoint, and it would make the indicator fragile and slow. The
holiday table changes roughly once a year, so shipping it with the plugin and updating it through a
normal release is simpler and more private than fetching it at runtime.

Consequence: there is no API key to leak, no server to operate, no polling traffic, no telemetry and
no stored user data. The only data the plugin reads is the local clock and the bundled table.

---

## 11. Source file responsibilities

| File | Responsibility |
| --- | --- |
| [`package.json`](../package.json) | Bundle manifest: identity, `dsh.bundle` / `dsh.client`, tested `engines.dsh`, exports and the runtime `files` list. |
| [`cordis.patch.yml`](../cordis.patch.yml) | One `insert` row connecting the package to the Loader. |
| [`index.js`](../index.js) | Empty Host half; intentionally does nothing. |
| [`client.js`](../client.js) | The whole feature: inline holiday table, schedule core, timezone helpers, minimal view model, React indicator/popover, timers, slot registration, locale dictionaries, test seam. |
| [`holidays.json`](../holidays.json) | Editable, human-reviewed Chinese public holiday calendar (verified years and sources). |
| [`tools/sync-holidays.mjs`](../tools/sync-holidays.mjs) | Zero-dependency script that regenerates the inline calendar block from `holidays.json`. |
| [`locale/en.json`](../locale/en.json), [`locale/zh.json`](../locale/zh.json) | Plugin display metadata (title/description) shown by the Plugin Manager and Settings. |
| [`icon.svg`](../icon.svg) | Previous plugin icon, retained as a backup after the runtime icon moved to the new PNG. |
| [`assets/readme-banner.png`](../assets/readme-banner.png) | README hero banner (GitHub presentation only; never loaded by the Harness runtime). |
| [`assets/icon-512.png`](../assets/icon-512.png) | **Runtime plugin icon**, exported as `./icon` (512×512 PNG, 58.6 KiB), plus GitHub/marketplace brand use. |
| [`assets/icon-180.png`](../assets/icon-180.png) | Smaller 180×180 raster marketplace icon, retained as a fallback. |
| [`test/schedule.test.mjs`](../test/schedule.test.mjs) | 22 Node tests: schedule, transitions, formatting, popover model, rendered forms and registration. |
| [`docs/architecture.md`](architecture.md) | This document. |
| [`docs/marketplaces.md`](marketplaces.md) | Marketplace releases/submission preparation. |
| [`docs/screenshots/`](screenshots/) | Screenshot capture instructions and the expected real captures. |

### Runtime plugin icon

DSH reads the package-root manifest `icon` or the exported `./icon` for plugin cards, details and
component rows. This package declares no top-level `icon`; it exports `./icon → ./assets/icon-512.png`,
a 512×512 PNG of 58.6 KiB — inside the package and well under the documented 256 KiB icon limit.
The icon was verified live in the Plugin Manager after reinstalling the same bundle.

`icon.svg` is retained as the previous runtime icon and backup. `assets/icon-180.png` remains a
smaller raster fallback for storefronts that want a 180×180 tile. `assets/readme-banner.png` is
GitHub documentation only and is not part of the runtime icon path.

---

## 12. Testing strategy

`test/schedule.test.mjs` imports `client.js` as a plain module, shims `window.__ModuleLoader__` to
capture the lazy factory, and materializes the factory with a stub React. The factory exposes a
guarded test seam (`globalThis.__DSPI_TEST__`) with the pure functions (`resolveState`,
`nextTransition`, `holidayStatus`, `calendarYear`, `boundaryMinutesUtc`, `formatZoned`,
`formatOffset`, `formatHoursMinutes`, `describe`, `renderPanel`, …). The browser never sets that
global, so production behavior is unchanged.

Because the schedule core is pure and the clock is injected as a parameter, the suite can assert
exact behavior at exact instants: both peak windows, off-peak hours, weekends and makeup workdays,
holiday overrides, the 2027 UNKNOWN case, Friday→Monday transitions, the National Day block, the
two-line popover model, the wide/compact rendered forms, registration uniqueness, and the derived
China-midnight boundary. It also asserts that the inline holiday table matches `holidays.json`, so
the sync step cannot silently drift.

Run it with:

```sh
node --test test/schedule.test.mjs
```
