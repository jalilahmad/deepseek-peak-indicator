# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Nothing yet. Planned work is tracked in GitHub Issues.

## [1.0.0] - 2026-10-30

First public release of DeepSeek Peak Indicator for DeepSeek Harness Desktop.

### Added

- Global, root-scoped indicator in the `sidebar.footer.action` slot (the permanent sidebar footer
  beside Settings), visible from application start without a Session or Conversation.
- Three states: **OFF-PEAK** (green dot), **PEAK** (red dot) and **UNKNOWN** (gray dot), with the
  literal labels `PEAK`, `OFF-PEAK` and `UNKNOWN`.
- Minimal two-line click popover:
  - PEAK → `Off-Peak starts in: Xh Ym`
  - OFF-PEAK → `Peak starts in: Xh Ym`
  - UNKNOWN → `Next transition cannot be reliably determined.`
- Countdown limited to hours and minutes (no seconds), refreshed once a minute, plus an exact timer
  at the next schedule transition.
- Official DeepSeek schedule implementation: Monday–Friday `01:00–04:00` and `06:00–10:00` UTC,
  excluding Chinese public holidays; weekends and holidays off-peak in full.
- Verified Chinese public holiday data for **2025** and **2026** from the State Council notices, in
  the editable [`holidays.json`](holidays.json), inlined into the bundle by
  [`tools/sync-holidays.mjs`](tools/sync-holidays.mjs).
- Honest **UNKNOWN** state for unverified holiday years: 2027 is intentionally unverified because
  its annual arrangement was not published when this release was prepared.
- IANA timezone handling through `Intl` (no hardcoded UTC offsets, DST-safe), with the default
  display zone kept as `Asia/Kabul`; the China-midnight boundary is derived from the calendar zone.
- Clean unload/reload lifecycle: the slot registration, timers, listeners, observers and styles are
  all disposed on unload; re-enabling creates exactly one registration.
- 22 Node tests (`node --test test/schedule.test.mjs`) covering both peak windows, off-peak periods,
  weekends and makeup workdays, holiday overrides, the unknown-year fallback, exact transitions,
  countdown formatting, the minimal view model, the wide/compact forms, registration, the derived
  China-midnight boundary and malformed-date rejection.
- Documentation in three languages: [English](README.md), [Persian](README.fa.md) and
  [Simplified Chinese](README.zh-CN.md); architecture notes in
  [`docs/architecture.md`](docs/architecture.md).
- Release preparation: MIT license, contributing guide, security policy, marketplace submission
  notes and screenshot capture instructions.

### Verified

- DeepSeek Harness Desktop **v0.2.1-rc.5** on Windows: bundle installed through the official plugin
  manager, the live client slot registration active, unload/reload clean, no duplicate indicators.
- 22/22 schedule tests passing.
- No API key, no backend, no network requests, no polling, no telemetry.

### Known limitations

- On the Windows Desktop titlebar layout the sidebar shell hides its entire footer when the sidebar
  is collapsed (including the shipped Settings control), so the indicator is not visible in that
  specific collapsed state.
- Only DSH v0.2.1-rc.5 is tested; other versions are not claimed compatible and the bundle pins the
  tested version in `engines.dsh`.
- 2027 weekday peak windows show UNKNOWN until the official 2027 holiday notice is published and
  the calendar is updated.
