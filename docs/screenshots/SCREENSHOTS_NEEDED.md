# Screenshots — status and remaining captures

Real screenshots are captured from the **actual running DeepSeek Harness Desktop v0.2.1-rc.5**
(Windows) with **DeepSeek Peak Indicator 1.0.0** installed and active. No mockups or recreated UI
were used.

Captured on **2026-10-30** from the live application window.

---

## 1. Captured (shipped in the repository)

All images are `1920 × 951` PNG, captured at the application's native resolution (125% display
scale, physical pixels) and cropped to the application content area.

| File | Status | What it shows |
| --- | --- | --- |
| `01-indicator-sidebar.png` | ✅ Captured | Full Harness window on a clean New Session page; the green-dot **OFF-PEAK** indicator sits in the expanded sidebar footer. |
| `03-popover-offpeak.png` | ✅ Captured | The real **OFF-PEAK** state with its minimal two-line popover open: `● OFF-PEAK` / `Peak starts in: 60h 35m`. |
| `05-plugin-manager.png` | ✅ Captured | The Harness **Plugins** page (`Installed plugins`) showing **DeepSeek Peak Indicator** switched **on**, with its icon and description. |

### Privacy handling in these captures

The captures are genuine, but user content is redacted:

- workspace names and session titles in the sidebar are blurred;
- the `New folder` workspace chip above the composer is blurred;
- the bottom account/status strip is cropped out;
- a Windows notification that happened to be on screen was dismissed before capture.

No API keys, account identifiers, unrelated desktop content or private files appear in the images.

---

## 2. Still pending (not reproducible at capture time)

The remaining two screenshots require **real schedule states**. They must not be forced by changing
the system clock, the plugin schedule or the holiday data.

### `02-popover-peak.png` — PEAK with the popover

- **Required real condition:** a Monday–Friday inside **01:00–04:00 UTC** or **06:00–10:00 UTC**,
  on a date that is **not** a verified Chinese public holiday.
- **At capture time (2026-10-30):** the real state was OFF-PEAK; the next real peak window is
  **Monday 2026-11-02, 01:00 UTC** (= 05:30 Asia/Kabul).
- **Target content:** `🔴 PEAK` / `Off-Peak starts in: Xh Ym` (hours and minutes only).
- **How to capture later:** at that time, with the plugin installed, click the indicator in the
  sidebar footer, wait until the popover shows `PEAK`, then capture the window. Use the same crop
  and privacy rules as above and save as `02-popover-peak.png`.

### `04-popover-unknown.png` — UNKNOWN state

- **Required real condition:** a weekday inside a peak window in a year whose Chinese public-holiday
  calendar is **not verified** in `holidays.json`.
- **At capture time:** 2025 and 2026 are verified; 2027 is deliberately unverified (its State
  Council notice is not published yet). The UNKNOWN state is therefore expected in **2027 weekday
  peak windows** unless the 2027 calendar is verified before then.
- **Target content:** `⚪ UNKNOWN` / `Next transition cannot be reliably determined.`
- **How to capture later:** wait for 2027 (or ship a release with an unverified current year),
  open the popover during a weekday peak window and capture it. Do not flip a verified year to
  unverified just to force the state.

---

## 3. When the two pending captures are added

1. Save the files here with the exact names `02-popover-peak.png` and `04-popover-unknown.png`
   (same `1920 × 951` content crop is recommended).
2. Restore their image references in all three READMEs (`README.md`, `README.fa.md`,
   `README.zh-CN.md`) in the Screenshots section, replacing the current “pending” paragraph.
3. Add both paths to [`../../screenshots.json`](../../screenshots.json) so marketplace storefronts
   show them (1–8 images allowed).
4. Update this file's status table and the `CHANGELOG.md` entry.
5. Commit the images to the repository — no other code change is needed.
