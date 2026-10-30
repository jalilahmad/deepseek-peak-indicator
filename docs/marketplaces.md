# Marketplace and distribution preparation

This file records the research and the prepared metadata for distributing **DeepSeek Peak
Indicator** through the DSH community channels. Nothing here has been submitted yet. Listing is not
claimed until a maintainer has actually reviewed and merged a submission.

---

## 1. Channels and how they relate

| Channel | How it is fed | What is needed |
| --- | --- | --- |
| **DSH Market — dshplugin.io** | Its catalog is synchronized from the curated [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) registry; it also accepts a plugin-submission issue. | A GitHub repository with a `dsh.bundle` manifest and a merged awesome-dsh-plugin entry (or a submission issue). |
| **Community DSH Marketplace — dsh-market (dshmarket.com)** | The market plugin reads the same awesome-dsh-plugin catalog and renders storefronts with screenshots. | The same registry entry; screenshots can be declared in the plugin repository through `screenshots.json`. |
| **GitHub topic discovery** | Browsing <https://github.com/topics/dsh-plugin>. | The `dsh-plugin` topic on the repository. |
| **npm** (optional) | Storefronts use npm download counts when a package exists. | A published npm package whose `repository` points back to the GitHub repository. Not required for listing. |

Sources checked on 2026-10-30:

- DSH Market site: <https://dshplugin.io/>
- DSH Market catalog source: <https://github.com/tjsdyy/dshplugin> (its sync script reads
  `https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/main/docs/plugins.json`)
- Curated registry and contribution rules:
  <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin> and
  <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md>
- dsh-market plugin: <https://github.com/dsh-market/dsh-market> (its README says the catalog comes
  from the awesome-dsh-plugin registry; submissions are PRs there, not to the market app).

---

## 2. Prepared metadata

### Repository

- Repository: `https://github.com/jalilahmad/deepseek-peak-indicator`
- npm package name: `@jalilahmad.fazeli/deepseek-peak-indicator` (public release prepared; not yet published)
- Version: `1.0.0`
- License: MIT
- Author: Jalil Ahmad Fazeli — `https://github.com/jalilahmad`
- Tested runtime: DeepSeek Harness Desktop `0.2.1-rc.5` (Windows)
- Install commands:
  - npm: `dsh plugin --profile web add @jalilahmad.fazeli/deepseek-peak-indicator`
  - GitHub: `dsh plugin --profile web add github:jalilahmad/deepseek-peak-indicator`

### GitHub repository description

> DeepSeek API peak/off-peak pricing indicator for DeepSeek Harness: a sidebar-footer pill with a two-line hours-and-minutes countdown popover and an offline verified Chinese holiday calendar.

### Topic list

Required for the curated registry: `dsh-plugin`

Suggested full set:

```text
deepseek-harness
dsh-plugin
deepseek
peak-indicator
usage-pricing
```

### Tagline (short)

> Know when the DeepSeek API is at peak or off-peak price — at a glance, without a Session.

### Short description (English)

> DeepSeek API peak/off-peak pricing indicator in the Harness sidebar footer. A click shows a minimal
> two-line popover with the hours-and-minutes countdown. The Chinese public-holiday calendar is
> bundled and verified offline; unverified years show UNKNOWN instead of guessing. No API key, no
> backend, no network requests.

### Short description (Simplified Chinese)

> 在 DeepSeek Harness 侧边栏底部显示 DeepSeek API 当前处于高峰还是空闲计价时段。点击显示两行极简
> 弹窗与小时/分钟倒计时。内置离线且经过核验的中国法定节假日日历；未核验年份显示 UNKNOWN 而不是猜测。
> 无需 API Key，无后端，不发起网络请求。

### Marketplace category

- awesome-dsh-plugin category: **`usage`** (Usage & Billing)
- Rationale: the plugin reports the official API pricing period; it is not a theme, a tool or a
  chat feature.

---

## 3. Curated registry submission (awesome-dsh-plugin)

The registry keeps one YAML file per plugin. A submission is **one new file** (no README edits):

`data/plugins/jalilahmad__deepseek-peak-indicator.yml`

```yaml
url: https://github.com/jalilahmad/deepseek-peak-indicator
name: jalilahmad/deepseek-peak-indicator
category: usage
description:
  en: "DeepSeek API peak/off-peak pricing indicator in the sidebar footer with a minimal hours-and-minutes countdown popover; the Chinese holiday calendar is bundled and verified offline, and unverified years show UNKNOWN instead of guessing."
  zh: "侧边栏底部的 DeepSeek API 峰谷时段指示器，点击显示极简的小时/分钟倒计时；内置离线且经过核验的中国法定节假日日历，未核验年份显示 UNKNOWN 而不是猜测。"
icon: https://raw.githubusercontent.com/jalilahmad/deepseek-peak-indicator/main/assets/icon-512.png
```

Notes:

- The description contains `: ` after the repository is live? No — the YAML above quotes the
  descriptions, so it is safe either way. Keep the quotes.
- `icon` is optional. A raster image (`png`/`jpg`/`webp`) hosted on GitHub is required; the SVG
  plugin icon is not accepted for the storefront tile. The current brand tile is the 512×512
  [`assets/icon-512.png`](../assets/icon-512.png); the earlier 180×180
  [`assets/icon-180.png`](../assets/icon-180.png) is retained as a smaller fallback. Remove the
  `icon` line if you prefer the author avatar fallback.
- The README hero banner [`assets/readme-banner.png`](../assets/readme-banner.png) is GitHub
  presentation only; it is not used as a plugin or marketplace icon.
- A `tarball:` field is optional and only needed if the repository cannot install from source. This
  repository installs from source, so it is omitted. If a GitHub Release with a prebuilt `.tgz` is
  added later, it may be declared here.
- Repository requirements checked by their CI:
  - `package.json` declares `dsh.bundle` (this repository declares
    `"bundle": { "patch": "./cordis.patch.yml" }` and ships the patch file);
  - the repository is at least **1 day old**;
  - the `dsh-plugin` topic is set;
  - it contains real working code (this repository ships the implementation and tests).
- Do not edit the generated READMEs in that repository; add only the YAML file.

### Screenshots for storefronts

The repository declares [`screenshots.json`](../screenshots.json) with the three **already
committed** captures under `docs/screenshots/` (`01-indicator-sidebar.png`,
`03-popover-offpeak.png`, `05-plugin-manager.png`). Two further captures (PEAK and UNKNOWN) require
real schedule conditions and are still pending; add them to `screenshots.json` later (1–8 images are
allowed). See
[`docs/screenshots/SCREENSHOTS_NEEDED.md`](screenshots/SCREENSHOTS_NEEDED.md).

---

## 4. DSH Market (dshplugin.io) submission

- Primary path: the merged awesome-dsh-plugin entry above is picked up by the scheduled catalog sync.
- Alternative/announcement path: open a plugin submission issue:
  <https://github.com/tjsdyy/dshplugin/issues/new?labels=plugin-submission>

  Include, as the repository requests:
  - repository URL: `https://github.com/jalilahmad/deepseek-peak-indicator`
  - category: the upstream registry category is **`usage`** (Usage & Billing). DSH Market derives
    its own catalogue categories from that registry; if its issue form does not offer a pricing
    category, use **UI** (the plugin is a sidebar UI element).
  - English and Chinese descriptions (above)
  - the tested install command:
    `dsh plugin --profile web add github:jalilahmad/deepseek-peak-indicator`

Do not claim the plugin is listed on dshplugin.io until the site shows it.

---

## 5. Community DSH Marketplace (dsh-market / dshmarket.com)

- The market plugin reads the same curated catalog, so no separate submission is required.
- Its README asks authors **not** to submit plugin entries to the market app repository.
- Storefront screenshots are read from the plugin repository's `screenshots.json` (1–8 images,
  GitHub-hosted raster images, relative paths inside the plugin directory). This repository
  prepares that file.

---

## 6. npm publication (prepared, not performed)

The package is prepared for public npm release as
`@jalilahmad.fazeli/deepseek-peak-indicator`, but **no publish has been performed**.

- The name is syntactically valid and was free on the public registry when checked (2026-10-30).
  Scope ownership is tied to the npm account that publishes; confirm the logged-in account is
  `jalilahmad.fazeli` (`npm whoami`) before publishing. Do not expose tokens.
- The package name is also the Harness module/package identity: `package.json`,
  `cordis.patch.yml` and the `client.js` module id were updated together. The plugin row id
  `deepseek-peak-indicator` and all runtime behaviour are unchanged.
- `private` was removed and `publishConfig.access` is `public` (required for a scoped package).
- Both install methods resolve the same package: npm name or GitHub spec.
- Pre-npm installations under `@local/deepseek-peak-indicator` must be removed before installing the
  renamed package.
- The `repository`, `homepage`, `bugs`, `license`, `author` and `keywords` fields are set.
- The `files` list contains only runtime files plus the runtime icon; tests, tools, docs, the README
  banner and screenshots are excluded (npm still includes the READMEs, LICENSE and package.json).
- Publish only after explicit approval, for example:
  `npm publish --access public --registry https://registry.npmjs.org/`
  (never run by this release preparation).

No npm publication has been performed.

---

## 7. Manual steps (in order)

1. Review and commit the npm-release changes locally (not pushed by the preparation).
2. Publish to npm **after explicit approval** (see section 6); confirm `npm whoami` first and never
   expose tokens.
3. Verify the published package page and the exact install command
   (`dsh plugin --profile web add @jalilahmad.fazeli/deepseek-peak-indicator`).
4. Push the commit to GitHub (both install methods then point at the same package).
5. Confirm the repository **description** and topics: `deepseek-harness`, `dsh-plugin`,
   `deepseek`, `peak-indicator`, `usage-pricing`.
6. Add the remaining PEAK and UNKNOWN screenshots when the real states occur (see the screenshot
   instructions), and add their paths back to `screenshots.json`. This is optional for listing.
7. Optionally create a GitHub Release for `v1.0.0` (source zip/tarball is enough; a prebuilt `.tgz`
   is optional).
8. After the repository is at least 1 day old, open the awesome-dsh-plugin PR with the single YAML
   file from section 3.
9. Optionally open the dshplugin.io submission issue for visibility.
10. Do not announce that the plugin is listed until the registry PR is merged and the site shows it.
