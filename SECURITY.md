# Security Policy

## Supported versions

| Plugin version | DeepSeek Harness version | Status |
| --- | --- | --- |
| 1.0.0 | 0.2.1-rc.5 (Desktop, Windows) | Supported |

Only the combination above has been built and verified. Other plugin versions or other Harness
versions are not claimed supported; the bundle declares `"engines": { "dsh": "0.2.1-rc.5" }` so an
untested runtime is refused rather than loaded blindly.

## Reporting a vulnerability

Please report security issues **privately**:

- Preferred: GitHub **private vulnerability reporting** on
  <https://github.com/jalilahmad/deepseek-peak-indicator/security/advisories/new>
- If that is unavailable: email **jalilahmad.fazeli@gmail.com**

Please do not open a public issue for a suspected vulnerability. Include a description, the plugin
version and DSH version, reproduction steps and any relevant files. This is a small volunteer
project with no bug-bounty programme; reports are handled on a best-effort basis, and you will
receive an acknowledgement when the report is read.

## Security design of this plugin

- **No API key.** The plugin never requests, stores or transmits a DeepSeek (or any other) API key.
- **No backend, no database, no storage.** There is no server component, no account access and no
  data written outside the plugin bundle.
- **No network requests, no polling.** The Client half contains no `fetch`, `XMLHttpRequest`,
  `WebSocket`, `EventSource` or dynamic `import()`. It reads the local wall clock and the bundled
  holiday table only.
- **No telemetry.** Nothing is collected or sent.
- **Clean unload.** Timers, event listeners, observers, styles and locale dictionaries are disposed
  when the plugin unloads.
- **No secrets in the repository.** The repository is audited for API keys, tokens, personal paths
  and machine-specific state before release.

## General plugin caveat

Like any DeepSeek Harness plugin, installed plugin code executes with the local permissions of the
Harness application. Listing or installing a plugin is not a security audit. Review the source in
this repository, and prefer the official GitHub source over republished copies. A plugin can only
run while the profile that installed it is active; disabling or removing it stops it.
