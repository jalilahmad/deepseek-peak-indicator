/**
 * Unit tests for the DeepSeek Peak Indicator bundle.
 *
 * These tests exercise the pure schedule core from client.js (no DOM, no React
 * renderer) plus the manifest/configuration checks and the two rendered forms of
 * the indicator. The Client bundle is a classic script, so the test shims
 * `window.__ModuleLoader__`, imports the file, and materializes its factory with
 * a stub React.
 *
 * Run from the bundle directory:  node --test test/schedule.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const clientUrl = new URL('../client.js', import.meta.url);
const clientPath = new URL('../client.js', import.meta.url);
const manifestUrl = new URL('../package.json', import.meta.url);

let captured = null;
globalThis.window = {
  __ModuleLoader__: {
    load(definition) {
      captured = definition;
    },
  },
};
globalThis.__DSPI_TEST__ = {};

await import(clientUrl.href);

const at = (iso) => Date.parse(iso);
const core = () => globalThis.__DSPI_TEST__.core;
const statusAt = (iso) => core().resolveState(at(iso)).status;
const t = (key, params) => core().fallbackTranslate(key, params);

function createElement(type, props, ...children) {
  return { type: type, props: props || {}, children: children };
}

const ReactStub = {
  createElement: createElement,
  Fragment: Symbol('Fragment'),
  useState(initial) {
    return [typeof initial === 'function' ? initial() : initial, function () {}];
  },
  useEffect() {},
  useRef() {
    return { current: null };
  },
};
const requireStub = (id) => {
  if (id === 'react') return ReactStub;
  if (id === 'react-dom') return { createPortal: (child) => child };
  throw new Error('unexpected module request: ' + id);
};

/** Collect class names and text from a stub React element tree. */
function inspectTree(node, out) {
  const result = out || { classes: [], text: [] };
  if (node === null || node === undefined) return result;
  if (Array.isArray(node)) {
    for (const child of node) inspectTree(child, result);
    return result;
  }
  if (typeof node !== 'object') {
    result.text.push(String(node));
    return result;
  }
  const className = node.props === undefined ? undefined : node.props.className;
  if (typeof className === 'string') result.classes.push(className);
  for (const child of node.children || []) inspectTree(child, result);
  return result;
}

/** Apply the plugin against a fake Client context and return its registration. */
function registerWith(locale) {
  const plugin = captured.factory(requireStub);
  const registrations = [];
  const ctx = {
    get(name) {
      return name === 'locale' ? locale : undefined;
    },
    effect(callback) {
      const dispose = callback();
      assert.equal(typeof dispose, 'function');
      return () => dispose();
    },
    slots: {
      inject(key, callback) {
        return callback();
      },
      register(options, component) {
        registrations.push({ options: options, component: component });
        return () => {};
      },
    },
  };
  plugin.apply(ctx);
  assert.equal(registrations.length, 1, 'exactly one slot registration');
  return { options: registrations[0].options, component: registrations[0].component };
}

function renderAt(component, props, ms) {
  const originalNow = Date.now;
  Date.now = () => ms;
  try {
    return inspectTree(component(props));
  } finally {
    Date.now = originalNow;
  }
}

test('the bundle registers one lazy client factory with the expected id', () => {
  assert.ok(captured !== null, 'client.js must call window.__ModuleLoader__.load');
  assert.equal(captured.id, '@local/deepseek-peak-indicator');
  assert.equal(typeof captured.factory, 'function');
  const plugin = captured.factory(requireStub);
  assert.equal(typeof plugin.apply, 'function');
  assert.deepEqual(plugin.inject, ['slots']);
});

test('the pure schedule core is exposed by the materialized factory', () => {
  captured.factory(requireStub);
  const api = core();
  for (const name of [
    'resolveState',
    'nextTransition',
    'holidayStatus',
    'describe',
    'fallbackView',
    'formatZoned',
    'formatOffset',
    'formatHoursMinutes',
  ]) {
    assert.equal(typeof api[name], 'function', name + ' must be exposed');
  }
  assert.equal(api.DISPLAY_TIME_ZONE, 'Asia/Kabul');
  assert.equal(api.SLOT_NAME, 'sidebar.footer.action');
  assert.equal(api.ENTRY_ID, 'deepseek-peak-indicator');
  assert.equal(api.SOURCE_URL, 'https://api-docs.deepseek.com/quick_start/pricing/');
});

test('manifest, patch, locales and icon are well-formed', () => {
  const pkg = JSON.parse(readFileSync(manifestUrl, 'utf8'));
  assert.equal(pkg.name, '@local/deepseek-peak-indicator');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.equal(pkg.dsh.client.platform, 'web');
  assert.equal(pkg.dsh.client.immediately, true);
  assert.deepEqual(pkg.dsh.client.inject, ['@deepseek-ai/dsh-client-ui-sidebar']);
  assert.equal(pkg.exports['./client'], './client.js');
  assert.ok(pkg.files.includes('client.js'));

  const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8');
  assert.match(patch, /id: deepseek-peak-indicator/);
  assert.match(patch, /name: '@local\/deepseek-peak-indicator'/);

  const en = JSON.parse(readFileSync(new URL('../locale/en.json', import.meta.url), 'utf8'));
  const zh = JSON.parse(readFileSync(new URL('../locale/zh.json', import.meta.url), 'utf8'));
  assert.ok(en.meta.title.length > 0 && en.meta.description.length > 0);
  assert.ok(zh.meta.title.length > 0 && zh.meta.description.length > 0);

  const icon = readFileSync(new URL('../icon.svg', import.meta.url), 'utf8');
  assert.match(icon, /<svg[\s\S]*<\/svg>/);
  assert.ok(Buffer.byteLength(icon) < 256 * 1024);
});

test('the indicator targets the global sidebar foot and no Session/Conversation slot', () => {
  const source = readFileSync(clientPath, 'utf8');
  assert.match(source, /SLOT_NAME = 'sidebar\.footer\.action'/);
  assert.doesNotMatch(source, /conversation\.header\.leading/);
  assert.doesNotMatch(source, /conversation\.composer\.dock/);
  assert.doesNotMatch(source, /conversation\.session/);
});

test('the inline HOLIDAY_CALENDAR matches the editable holidays.json', () => {
  const source = readFileSync(clientPath, 'utf8');
  const match = source.match(/const HOLIDAY_CALENDAR = ([\s\S]*?);\n\s*\/\/ <<< HOLIDAY_CALENDAR/);
  assert.ok(match, 'HOLIDAY_CALENDAR block must be present');
  const inline = JSON.parse(match[1]);
  const json = JSON.parse(readFileSync(new URL('../holidays.json', import.meta.url), 'utf8'));
  assert.deepEqual(inline.years, json.years);
  assert.equal(inline.timeZone, json.timeZone);
  // Run `node tools/sync-holidays.mjs` after editing holidays.json.
});

test('holiday calendar validation: 2025/2026 verified, 2027 UNKNOWN', () => {
  const api = core();
  assert.equal(api.calendarYear(2025).known, true);
  assert.equal(api.calendarYear(2026).known, true);
  const unknown = api.calendarYear(2027);
  assert.equal(unknown.known, false);
  assert.equal(unknown.reason, 'unpublished');
});

test('both official peak windows are PEAK on a plain weekday', () => {
  // Wednesday 2026-10-28, after the National Day holiday.
  assert.equal(statusAt('2026-10-28T01:00:00Z'), 'PEAK');
  assert.equal(statusAt('2026-10-28T02:30:00Z'), 'PEAK');
  assert.equal(statusAt('2026-10-28T03:59:59Z'), 'PEAK');
  assert.equal(statusAt('2026-10-28T06:00:00Z'), 'PEAK');
  assert.equal(statusAt('2026-10-28T08:15:00Z'), 'PEAK');
  assert.equal(statusAt('2026-10-28T09:59:59Z'), 'PEAK');
});

test('everything outside the windows is OFF-PEAK', () => {
  assert.equal(statusAt('2026-10-28T00:00:00Z'), 'OFF_PEAK');
  assert.equal(statusAt('2026-10-28T00:59:59Z'), 'OFF_PEAK');
  assert.equal(statusAt('2026-10-28T04:00:00Z'), 'OFF_PEAK');
  assert.equal(statusAt('2026-10-28T05:59:59Z'), 'OFF_PEAK');
  assert.equal(statusAt('2026-10-28T10:00:00Z'), 'OFF_PEAK');
  assert.equal(statusAt('2026-10-28T23:59:59Z'), 'OFF_PEAK');
});

test('weekends are OFF-PEAK even inside window hours, including makeup workdays', () => {
  assert.equal(statusAt('2026-10-31T02:00:00Z'), 'OFF_PEAK'); // Saturday
  assert.equal(statusAt('2026-11-01T07:00:00Z'), 'OFF_PEAK'); // Sunday
  assert.equal(statusAt('2026-10-10T02:00:00Z'), 'OFF_PEAK'); // Saturday, official makeup workday
  assert.equal(statusAt('2026-10-11T07:00:00Z'), 'OFF_PEAK'); // Sunday, official makeup workday
});

test('official Chinese public holidays override the peak windows', () => {
  const nationalDay = core().resolveState(at('2026-10-01T02:00:00Z'));
  assert.equal(nationalDay.status, 'OFF_PEAK');
  assert.equal(nationalDay.basis, 'holiday');
  assert.equal(nationalDay.holiday.name, 'National Day');

  assert.equal(statusAt('2026-10-07T09:00:00Z'), 'OFF_PEAK'); // last National Day day (Wed)
  assert.equal(statusAt('2026-10-08T02:00:00Z'), 'PEAK'); // Thursday after the holiday
  assert.equal(statusAt('2026-02-16T02:00:00Z'), 'OFF_PEAK'); // Spring Festival Monday
  assert.equal(statusAt('2026-06-19T02:00:00Z'), 'OFF_PEAK'); // Dragon Boat Festival Friday
  assert.equal(statusAt('2026-09-25T02:00:00Z'), 'OFF_PEAK'); // Mid-Autumn Festival Friday

  // Holiday classification uses the China calendar date, not a fixed offset.
  const beforeChinaMidnight = core().holidayStatus(at('2026-09-30T15:30:00Z'));
  const afterChinaMidnight = core().holidayStatus(at('2026-09-30T16:30:00Z'));
  assert.equal(beforeChinaMidnight.holiday, false);
  assert.equal(afterChinaMidnight.holiday, true);
  assert.equal(afterChinaMidnight.name, 'National Day');
});

test('an unverified holiday year is UNKNOWN only inside weekday peak windows', () => {
  // 2027-01-04 is a Monday; the 2027 State Council notice is not published.
  const unknown = core().resolveState(at('2027-01-04T02:00:00Z'));
  assert.equal(unknown.status, 'UNKNOWN');
  assert.equal(unknown.basis, 'holiday-calendar');
  assert.equal(unknown.holiday.reason, 'unpublished');
  assert.equal(unknown.holiday.year, 2027);

  assert.equal(statusAt('2027-01-04T07:00:00Z'), 'UNKNOWN');
  // Certain off-peak answers stay off-peak without the calendar.
  assert.equal(statusAt('2027-01-02T02:00:00Z'), 'OFF_PEAK'); // Saturday
  assert.equal(statusAt('2027-01-04T05:00:00Z'), 'OFF_PEAK'); // outside both windows
  assert.equal(statusAt('2027-01-04T10:00:00Z'), 'OFF_PEAK'); // window ends exactly at 10:00
});

test('next transition lands on the exact official boundary', () => {
  const api = core();
  const cases = [
    ['2026-10-28T00:30:00Z', '2026-10-28T01:00:00Z', 'PEAK'],
    ['2026-10-28T02:00:00Z', '2026-10-28T04:00:00Z', 'OFF_PEAK'],
    ['2026-10-28T05:00:00Z', '2026-10-28T06:00:00Z', 'PEAK'],
    ['2026-10-28T09:30:00Z', '2026-10-28T10:00:00Z', 'OFF_PEAK'],
    ['2026-10-30T10:30:00Z', '2026-11-02T01:00:00Z', 'PEAK'], // Friday after peak -> Monday
    ['2026-10-01T00:30:00Z', '2026-10-08T01:00:00Z', 'PEAK'], // National Day week -> next Thursday
    ['2026-10-07T02:00:00Z', '2026-10-08T01:00:00Z', 'PEAK'], // still holiday on Wednesday
    ['2027-01-04T00:30:00Z', '2027-01-04T01:00:00Z', 'UNKNOWN'], // calendar becomes undeterminable
  ];
  for (const [from, expectedAt, expectedTo] of cases) {
    const change = api.nextTransition(at(from));
    assert.ok(change !== null, 'a transition must exist from ' + from);
    assert.equal(change.at, at(expectedAt), 'transition instant from ' + from);
    assert.equal(change.to, expectedTo, 'transition target from ' + from);
  }
});

test('formatting is timezone-aware (Kabul default, DST-correct zones)', () => {
  const api = core();
  assert.equal(api.formatZoned(at('2026-10-30T10:40:34Z'), 'Asia/Kabul'), 'Fri 30 Oct 2026 15:10:34');
  assert.equal(api.formatOffset(at('2026-10-30T10:40:34Z'), 'Asia/Kabul'), 'UTC+04:30');
  // Kabul has no daylight saving: the same +04:30 offset in January and July.
  assert.equal(api.formatOffset(at('2026-01-15T00:00:00Z'), 'Asia/Kabul'), 'UTC+04:30');
  assert.equal(api.formatOffset(at('2026-07-15T00:00:00Z'), 'Asia/Kabul'), 'UTC+04:30');

  // America/New_York spring-forward: 2026-03-08 02:00 local jumps to 03:00.
  assert.equal(api.formatZoned(at('2026-03-08T06:59:00Z'), 'America/New_York'), 'Sun 08 Mar 2026 01:59:00');
  assert.equal(api.formatZoned(at('2026-03-08T07:00:00Z'), 'America/New_York'), 'Sun 08 Mar 2026 03:00:00');
  assert.equal(api.formatOffset(at('2026-03-08T06:59:00Z'), 'America/New_York'), 'UTC-05:00');
  assert.equal(api.formatOffset(at('2026-03-08T07:00:00Z'), 'America/New_York'), 'UTC-04:00');

  // Europe/London fall-back: 2026-10-25 02:00 BST becomes 01:00 GMT.
  assert.equal(api.formatOffset(at('2026-10-25T00:59:00Z'), 'Europe/London'), 'UTC+01:00');
  assert.equal(api.formatOffset(at('2026-10-25T01:00:00Z'), 'Europe/London'), 'UTC+00:00');
});

test('countdown is whole hours and minutes only, rounded up', () => {
  const api = core();
  assert.equal(api.formatHoursMinutes(0), '0h 0m');
  assert.equal(api.formatHoursMinutes(-5000), '0h 0m');
  assert.equal(api.formatHoursMinutes(59 * 1000), '0h 1m');
  assert.equal(api.formatHoursMinutes(60 * 1000), '0h 1m');
  assert.equal(api.formatHoursMinutes((2 * 3600 + 13 * 60 + 20) * 1000), '2h 14m');
  assert.equal(api.formatHoursMinutes(63 * 3600 * 1000), '63h 0m');
  for (const sample of [59 * 1000, 3600 * 1000, 63 * 3600 * 1000]) {
    assert.match(api.formatHoursMinutes(sample), /^\d+h \d+m$/, 'no seconds in ' + sample);
  }
});

test('popover view model is the minimal two-line form', () => {
  const api = core();

  // PEAK: the popover shows only the status and when Off-Peak starts.
  const peak = api.describe(at('2026-10-28T02:00:00Z'), t);
  assert.deepEqual(peak, {
    status: 'PEAK',
    statusClass: 'peak',
    pillLabel: 'PEAK',
    lineText: 'Off-Peak starts in: 2h 0m',
  });

  // OFF-PEAK: only the status and when Peak starts.
  const offPeak = api.describe(at('2026-10-28T11:00:00Z'), t);
  assert.deepEqual(offPeak, {
    status: 'OFF_PEAK',
    statusClass: 'off-peak',
    pillLabel: 'OFF-PEAK',
    lineText: 'Peak starts in: 14h 0m',
  });

  // UNKNOWN: no countdown is invented.
  const unknown = api.describe(at('2027-01-04T02:00:00Z'), t);
  assert.deepEqual(unknown, {
    status: 'UNKNOWN',
    statusClass: 'unknown',
    pillLabel: 'UNKNOWN',
    lineText: 'Next transition cannot be reliably determined.',
  });
  assert.doesNotMatch(unknown.lineText, /\d+h \d+m/);

  // Crossing into an unverified calendar year must not invent a countdown
  // towards a period that may not exist (2026-12-31 is a Thursday).
  const edge = api.describe(at('2026-12-31T12:00:00Z'), t);
  assert.equal(edge.status, 'OFF_PEAK');
  assert.equal(edge.lineText, 'Next transition cannot be reliably determined.');
  assert.equal(api.nextTransition(at('2026-12-31T12:00:00Z')).to, 'UNKNOWN');

  // The view model carries nothing else: no times, schedules, sources, notes.
  for (const view of [peak, offPeak, unknown, edge]) {
    assert.deepEqual(Object.keys(view).sort(), ['lineText', 'pillLabel', 'status', 'statusClass']);
    assert.doesNotMatch(view.lineText, /UTC|Kabul|Beijing|schedule|source|pricing/i);
  }
});

test('fallback view is an honest UNKNOWN with the required message', () => {
  const view = core().fallbackView();
  assert.deepEqual(view, {
    status: 'UNKNOWN',
    statusClass: 'unknown',
    pillLabel: 'UNKNOWN',
    lineText: 'Next transition cannot be reliably determined.',
  });
});

test('the open popover renders exactly two lines and nothing else', () => {
  const api = core();
  globalThis.document = { body: 'TEST_BODY' };
  try {
    const peakTree = inspectTree(
      api.renderPanel(api.describe(at('2026-10-28T02:00:00Z'), t), { left: 8, top: 8 }, { current: null }, t),
    );
    assert.ok(peakTree.classes.includes('dspi-panel'));
    const peakText = peakTree.text.filter((value) => String(value).trim() !== '');
    assert.deepEqual(peakText, ['PEAK', 'Off-Peak starts in: 2h 0m']);
    assert.doesNotMatch(peakText.join(' '), /UTC|Kabul|Beijing|source|pricing|schedule/i);

    const offPeakTree = inspectTree(
      api.renderPanel(api.describe(at('2026-10-28T11:00:00Z'), t), null, { current: null }, t),
    );
    assert.deepEqual(
      offPeakTree.text.filter((value) => String(value).trim() !== ''),
      ['OFF-PEAK', 'Peak starts in: 14h 0m'],
    );

    const unknownTree = inspectTree(
      api.renderPanel(api.describe(at('2027-01-04T02:00:00Z'), t), null, { current: null }, t),
    );
    assert.deepEqual(
      unknownTree.text.filter((value) => String(value).trim() !== ''),
      ['UNKNOWN', 'Next transition cannot be reliably determined.'],
    );

    const rawPanel = api.renderPanel(
      api.describe(at('2026-10-28T02:00:00Z'), t),
      null,
      { current: null },
      t,
    );
    const panelNodes = [];
    (function walk(node) {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node !== null && typeof node === 'object') {
        if (node.props !== undefined && node.props.className === 'dspi-panel') panelNodes.push(node);
        for (const child of node.children || []) walk(child);
      }
    })(rawPanel);
    assert.equal(panelNodes.length, 1, 'exactly one panel');
    assert.equal(panelNodes[0].children.length, 2, 'panel has the status row and the line only');
  } finally {
    delete globalThis.document;
  }
});

test('the wide sidebar form shows the label and the rail form is dot-only', () => {
  const registered = registerWith(undefined);

  const wide = renderAt(registered.component, { wide: true }, at('2026-10-28T02:00:00Z'));
  assert.ok(wide.classes.includes('dspi-pill'), 'wide form must use the labelled pill');
  assert.ok(!wide.classes.includes('dspi-compact'), 'wide form must not use the rail form');
  assert.ok(wide.text.join('').includes('PEAK'), 'wide form must render the PEAK label');

  const rail = renderAt(registered.component, { wide: false }, at('2026-10-28T02:00:00Z'));
  assert.ok(rail.classes.includes('dspi-compact'), 'collapsed rail must use the compact form');
  assert.ok(!rail.classes.includes('dspi-pill'), 'collapsed rail must not use the wide pill');
  assert.ok(!rail.text.join('').includes('PEAK'), 'collapsed rail renders the dot only');

  // Status colors stay the same set for all three states.
  const offPeak = renderAt(registered.component, { wide: true }, at('2026-10-28T11:00:00Z'));
  assert.ok(offPeak.text.join('').includes('OFF-PEAK'));
  const unknown = renderAt(registered.component, { wide: true }, at('2027-01-04T02:00:00Z'));
  assert.ok(unknown.text.join('').includes('UNKNOWN'));
});

test('apply registers exactly one global entry in the sidebar foot', () => {
  const fakeLocale = {
    register(namespace, locale, dictionary) {
      assert.ok(namespace && locale && dictionary);
      return () => {};
    },
    bind() {
      return (key) => key;
    },
  };
  const registered = registerWith(fakeLocale);
  assert.equal(registered.options.name, 'sidebar.footer.action');
  assert.equal(registered.options.id, 'deepseek-peak-indicator');
  assert.equal(registered.options.order, 10);
  assert.equal(registered.options.locale, 'deepseekPeakIndicator');
  assert.equal(typeof registered.component, 'function');
});

test('apply still works without the locale service', () => {
  const registered = registerWith(undefined);
  assert.equal(registered.options.name, 'sidebar.footer.action');
  assert.equal(registered.options.id, 'deepseek-peak-indicator');
  assert.equal(registered.options.locale, undefined);
});

test('the holiday-calendar midnight boundary is derived from the zone, not hardcoded', () => {
  const api = core();
  // Asia/Shanghai is UTC+8 all year, so its calendar date changes at 16:00 UTC.
  assert.equal(api.calendarMidnightMinutesUtc(at('2026-01-15T00:00:00Z')), 16 * 60);
  assert.equal(api.calendarMidnightMinutesUtc(at('2026-07-15T00:00:00Z')), 16 * 60);
  const boundaries = api.boundaryMinutesUtc(at('2026-10-30T00:00:00Z'));
  assert.deepEqual(boundaries, [0, 60, 240, 360, 600, 960]);
});

test('malformed holiday dates are rejected as UNKNOWN, never trusted', () => {
  const api = core();
  api.HOLIDAY_CALENDAR.years['2099'] = {
    verified: true,
    published: true,
    source: 'https://example.invalid/2099',
    ranges: [{ name: 'Impossible', start: '2099-02-30', end: '2099-03-02' }],
  };
  try {
    const year = api.calendarYear(2099);
    assert.equal(year.known, false);
    assert.equal(year.reason, 'malformed');
    const holiday = api.holidayStatus(at('2099-02-01T02:00:00Z'));
    assert.equal(holiday.known, false);
  } finally {
    delete api.HOLIDAY_CALENDAR.years['2099'];
  }
});
