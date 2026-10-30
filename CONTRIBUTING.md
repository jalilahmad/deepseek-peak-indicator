# Contributing

Thanks for taking the time to improve DeepSeek Peak Indicator. This is a small, intentionally
dependency-free DSH plugin, and the contribution process is kept accordingly small.

## Before you start

- Read [`docs/architecture.md`](docs/architecture.md) to understand how the bundle, the Client half
  and the sidebar slot registration fit together.
- The project targets **DeepSeek Harness Desktop v0.2.1-rc.5**. Compatibility with other DSH
  versions is not claimed; changes that depend on another runtime API need a verified environment
  and an update to `engines.dsh` plus documentation.
- Keep the scope tight: this plugin shows the official DeepSeek pricing period and nothing else.
  Charts, dashboards, analytics, model switching and network polling are out of scope.

## Repository model

There is no build step and there are no npm dependencies. The browser bundle [`client.js`](client.js)
is served as-is, and the Host half [`index.js`](index.js) is intentionally empty. The only Node.js
scripts are the test suite and the holiday sync tool.

## Local workflow

1. Install the checkout as a local bundle in a DSH profile (for example through
   **Plugins → Add plugin** → local directory, or
   `dsh plugin --profile web add /absolute/path/to/this/repository`).
2. Edit [`client.js`](client.js) (or other files) and reload the Web GUI.
3. Run the tests:

   ```sh
   node --test test/schedule.test.mjs
   ```

   The expected result is 22 passing tests. Only Node.js built-ins are used; Node.js 24.21.0 (the
   version bundled with DSH Desktop v0.2.1-rc.5) is the verified runtime.

## Updating the Chinese public holiday calendar

Holiday data must come from the official State Council notices published on gov.cn
(`国务院办公厅关于XXXX年部分节假日安排的通知`).

1. Edit [`holidays.json`](holidays.json): add or update the year block with `verified`, `published`,
   `source`, `ranges` (real ISO dates, inclusive) and optionally `makeupWorkdays`.
2. Run:

   ```sh
   node tools/sync-holidays.mjs
   ```

   This rewrites the inline `HOLIDAY_CALENDAR` block in [`client.js`](client.js) from the JSON.
3. Run the tests. The suite fails if the inline calendar and `holidays.json` drift apart.

Never mark a year `verified: true` without a published official notice. If the notice is not
available, set `verified: false` (or omit the year) so the indicator shows UNKNOWN inside weekday
peak windows instead of guessing.

## Documentation

- User documentation exists in three complete, equivalent languages:
  [`README.md`](README.md) (English), [`README.fa.md`](README.fa.md) (Persian) and
  [`README.zh-CN.md`](README.zh-CN.md) (Simplified Chinese). A user-visible change must be reflected
  in all three; keep them structurally equivalent.
- Developer documentation lives in [`docs/architecture.md`](docs/architecture.md).
- Record user-visible changes in [`CHANGELOG.md`](CHANGELOG.md) under `[Unreleased]`.
- Screenshots and their capture instructions are documented in
  [`docs/screenshots/`](docs/screenshots/). Only genuine captures from the running GUI are accepted;
  never mock or fabricate UI screenshots.

## Code guidelines

- Plain JavaScript, no new runtime dependencies. `react` and `react-dom` come from the Harness
  browser module table; do not add them to `package.json`.
- Use the documented DSH extension APIs only (`dsh.bundle`, `dsh.client`, `ctx.slots`,
  `ctx.get('locale')`, `ctx.effect`). Do not invent slots, services or registration options.
- Style with Harness theme tokens (`--dsw-alias-*`), not hardcoded colors; keep light and dark
  themes working.
- Register every timer, listener, observer and style inside a cleanup-aware effect; plugin unload
  must leave nothing behind.
- Keep the schedule logic deterministic and covered by tests. A behavioural change requires test
  updates in the same pull request.
- Do not add network requests, API keys, telemetry, storage or a backend to this plugin.

## Pull request checklist

- [ ] Tests pass: `node --test test/schedule.test.mjs` → 22/22.
- [ ] The inline holiday calendar matches `holidays.json` (covered by the tests).
- [ ] All three READMEs are updated for user-visible changes.
- [ ] `CHANGELOG.md` has an entry under `[Unreleased]`.
- [ ] No secrets, API keys, personal paths or machine-specific data were added.
- [ ] No unrelated files or formatting-only churn.
- [ ] The plugin still registers exactly one indicator in `sidebar.footer.action`.

## Security

Please do not report security issues in public pull requests or issues; see
[`SECURITY.md`](SECURITY.md).

## License

By contributing, you agree that your contribution is licensed under the project's
[MIT License](LICENSE).
