# Screenshots needed

This release was prepared **without browser/screenshot control**, so no screenshots have been
captured. No mock, simulated or fabricated UI images are committed. The READMEs already reference
the exact files below; once the real captures are saved here, the image references resolve and no
documentation edit is needed.

Capture from the **actual running DeepSeek Harness GUI** (Web GUI or Desktop window) with the plugin
installed and active. Screenshots must show the real plugin UI, not a mockup or a manually drawn
image.

---

## Files to create

Save all files in this directory (`docs/screenshots/`) with exactly these names:

| File | What it must show | Suggested state |
| --- | --- | --- |
| `01-indicator-sidebar.png` | Full application window with the expanded sidebar; the indicator pill with its colored dot is visible in the sidebar footer beside Settings. No popover open. | Any current state (OFF-PEAK is the easiest) |
| `02-popover-peak.png` | The indicator in **PEAK** state with the minimal two-line popover open: `🔴 PEAK` / `Off-Peak starts in: Xh Ym`. | A weekday inside 01:00–04:00 or 06:00–10:00 UTC that is not a verified Chinese holiday |
| `03-popover-offpeak.png` | The indicator in **OFF-PEAK** state with the minimal two-line popover open: `🟢 OFF-PEAK` / `Peak starts in: Xh Ym`. | A weekend, a Chinese public holiday, or any hour outside the peak windows |
| `04-popover-unknown.png` | The indicator in **UNKNOWN** state with the popover open: `⚪ UNKNOWN` / `Next transition cannot be reliably determined.` | A weekday inside a peak window while the current year's holiday calendar is not verified (see below) |
| `05-plugin-manager.png` | The **Plugins** page showing the “DeepSeek Peak Indicator” bundle/row installed and switched on. | Any time after installation |

The four primary captures (01–04) are required. `05-plugin-manager.png` is optional but recommended
for the Plugin Manager section.

---

## Capture rules

- Use genuine screenshots of the running application. Do not recreate the UI in an editor.
- PNG, preferably at the display's native scale (2× is fine); keep the width reasonable
  (roughly 1200–2000 px). Crop to the application window.
- Show both the pill and the popover clearly; do not crop the popover text.
- **Remove personal information** before saving: session titles, workspace names/paths, account
  e-mail, API keys, the remote-access token, and any other private content visible in the window.
  Use a fresh blank Session or a throw-away workspace.
- Do not add arrows, callouts or edited text over the screenshot; the README caption explains it.
- Keep the UI language consistent within a capture (English is fine and matches the default
  README examples).

## How to produce each state

The plugin computes everything locally from the clock and `holidays.json`.

1. **OFF-PEAK (easiest):** capture on a Saturday/Sunday, on a Chinese public holiday, or on a
   weekday before 01:00 UTC, between 04:00–06:00 UTC, or after 10:00 UTC. Click the pill.
2. **PEAK:** capture on a Monday–Friday between 01:00–04:00 UTC or 06:00–10:00 UTC, on a date that is
   not a verified Chinese public holiday (for example a normal working day in November 2026). Click
   the pill.
3. **UNKNOWN (real, reproducible):** UNKNOWN appears in a weekday peak window when the
   **current year's holiday calendar is not verified**. The repository ships 2027 unverified, so
   during 2027 weekday peak windows the state appears naturally. To capture it before then, in a
   local development checkout:
   1. In `holidays.json`, temporarily set the current year block to `"verified": false`
      (keep a copy of the file or use git to restore it afterwards).
   2. Run `node tools/sync-holidays.mjs`.
   3. Reload the Harness GUI and wait for the next weekday peak window (01:00–04:00 or
      06:00–10:00 UTC).
   4. Take the screenshot, then restore `holidays.json` and re-run `node tools/sync-holidays.mjs`.
   This is a genuine capture of the plugin's real UNKNOWN behaviour — only the local holiday data is
   temporarily changed; no UI is mocked.
4. **Plugin Manager (optional):** open **Plugins** in the Harness sidebar, find the bundle, and
   capture the card with the On switch visible.

## After capturing

1. Verify the files exist and are valid PNGs:

   ```sh
   # from the repository root
   ls -la docs/screenshots/
   ```

2. Make sure the names match exactly (they are already referenced by `README.md`,
   `README.fa.md`, `README.zh-CN.md` and `screenshots.json`).
3. Commit the images:

   ```sh
   git add docs/screenshots/*.png
   git commit -m "docs: add real GUI screenshots"
   ```

4. No README edits are required. The `screenshots.json` at the repository root already lists the
   five files for marketplace storefronts.
