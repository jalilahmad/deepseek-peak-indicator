/**
 * DeepSeek Peak / Off-Peak indicator — Client half.
 *
 * One compact pill in the global sidebar foot (`sidebar.footer.action`, the
 * root-scoped list seat beside Settings). That seat is part of the permanent
 * application shell: it renders at startup with no Session, Conversation or
 * Composer open, it does not move when Sessions are opened, switched or closed,
 * and the owner passes `wide: false` when the sidebar collapses to its 56px rail
 * so a dot-only compact form can stay visible there.
 *
 *   OFF-PEAK  green dot + OFF-PEAK  — all other hours, weekends, Chinese holidays
 *   PEAK      red dot + PEAK        — Mon-Fri 01:00-04:00 and 06:00-10:00 UTC,
 *                                     excluding Chinese public holidays
 *   UNKNOWN   gray dot + UNKNOWN    — a weekday peak window whose holiday status
 *                                     cannot be verified from the local calendar
 *
 * Clicking the pill opens a deliberately minimal popover with two lines only:
 * the status and when the other period starts, in hours and minutes. The
 * countdown refreshes once a minute; a transition timer flips the status exactly
 * when the schedule changes. There is no network request, no API key, no Host
 * state, and no database.
 *
 * The holiday table in HOLIDAY_CALENDAR is generated from `holidays.json` by
 * `tools/sync-holidays.mjs`. Edit the JSON (add the new year from the State
 * Council notice), re-run that script, and the indicator picks the data up.
 *
 * Source: https://api-docs.deepseek.com/quick_start/pricing/
 */
window.__ModuleLoader__.load({
  id: '@local/deepseek-peak-indicator',
  factory(require) {
    'use strict';
    const React = require('react');
    const h = React.createElement;
    const createPortal = require('react-dom').createPortal;

    // -----------------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------------

    /** Global, root-scoped sidebar-foot seat this decoration occupies. */
    const SLOT_NAME = 'sidebar.footer.action';
    /** Cell key and position beside Settings; never reuses a shipped id. */
    const ENTRY_ID = 'deepseek-peak-indicator';
    const ENTRY_ORDER = 10;
    /** Locale namespace for the (tiny) popover copy; pill labels stay literal. */
    const NS = 'deepseekPeakIndicator';
    /** Reference display zone kept from the verified implementation. */
    const DISPLAY_TIME_ZONE = 'Asia/Kabul';
    /** Official DeepSeek pricing documentation. */
    const SOURCE_URL = 'https://api-docs.deepseek.com/quick_start/pricing/';
    /** The countdown refreshes once a minute and never shows seconds. */
    const COUNTDOWN_REFRESH_MS = 60000;
    /** How far ahead the next-change search looks (a state change is always < 4 days). */
    const HORIZON_DAYS = 21;
    /**
     * UTC minutes-of-day at which a peak/off-peak answer can change: the four
     * window edges plus UTC midnight (the UTC weekday changes there). The
     * calendar-zone midnight, where a holiday starts or ends, is derived from
     * the configured IANA zone with Intl — no UTC offset is hardcoded.
     */
    const PEAK_BOUNDARY_MINUTES_UTC = [0, 60, 240, 360, 600];
    /** Official peak windows as UTC minutes-of-day, half-open: [start, end). */
    const PEAK_WINDOWS_MINUTES = [
      [1 * 60, 4 * 60],
      [6 * 60, 10 * 60],
    ];
    /** Pill tokens are status codes and stay literal, as the feature specifies. */
    const PILL_LABEL = { PEAK: 'PEAK', OFF_PEAK: 'OFF-PEAK', UNKNOWN: 'UNKNOWN' };
    const STATUS_CLASS = { PEAK: 'peak', OFF_PEAK: 'off-peak', UNKNOWN: 'unknown' };

    // >>> HOLIDAY_CALENDAR — generated from holidays.json by tools/sync-holidays.mjs
    const HOLIDAY_CALENDAR =     {
      "timeZone": "Asia/Shanghai",
      "years": {
        "2025": {
          "verified": true,
          "published": true,
          "source": "https://www.gov.cn/zhengce/content/202411/content_6986382.htm",
          "titleZh": "国务院办公厅关于2025年部分节假日安排的通知",
          "ranges": [
            {
              "name": "New Year's Day",
              "nameZh": "元旦",
              "start": "2025-01-01",
              "end": "2025-01-01"
            },
            {
              "name": "Spring Festival",
              "nameZh": "春节",
              "start": "2025-01-28",
              "end": "2025-02-04"
            },
            {
              "name": "Qingming Festival",
              "nameZh": "清明节",
              "start": "2025-04-04",
              "end": "2025-04-06"
            },
            {
              "name": "Labour Day",
              "nameZh": "劳动节",
              "start": "2025-05-01",
              "end": "2025-05-05"
            },
            {
              "name": "Dragon Boat Festival",
              "nameZh": "端午节",
              "start": "2025-05-31",
              "end": "2025-06-02"
            },
            {
              "name": "National Day and Mid-Autumn Festival",
              "nameZh": "国庆节、中秋节",
              "start": "2025-10-01",
              "end": "2025-10-08"
            }
          ],
          "makeupWorkdays": [
            "2025-01-26",
            "2025-02-08",
            "2025-04-27",
            "2025-09-28",
            "2025-10-11"
          ]
        },
        "2026": {
          "verified": true,
          "published": true,
          "source": "https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm",
          "titleZh": "国务院办公厅关于2026年部分节假日安排的通知",
          "ranges": [
            {
              "name": "New Year's Day",
              "nameZh": "元旦",
              "start": "2026-01-01",
              "end": "2026-01-03"
            },
            {
              "name": "Spring Festival",
              "nameZh": "春节",
              "start": "2026-02-15",
              "end": "2026-02-23"
            },
            {
              "name": "Qingming Festival",
              "nameZh": "清明节",
              "start": "2026-04-04",
              "end": "2026-04-06"
            },
            {
              "name": "Labour Day",
              "nameZh": "劳动节",
              "start": "2026-05-01",
              "end": "2026-05-05"
            },
            {
              "name": "Dragon Boat Festival",
              "nameZh": "端午节",
              "start": "2026-06-19",
              "end": "2026-06-21"
            },
            {
              "name": "Mid-Autumn Festival",
              "nameZh": "中秋节",
              "start": "2026-09-25",
              "end": "2026-09-27"
            },
            {
              "name": "National Day",
              "nameZh": "国庆节",
              "start": "2026-10-01",
              "end": "2026-10-07"
            }
          ],
          "makeupWorkdays": [
            "2026-01-04",
            "2026-02-14",
            "2026-02-28",
            "2026-05-09",
            "2026-09-20",
            "2026-10-10"
          ]
        },
        "2027": {
          "verified": false,
          "published": false,
          "source": "",
          "note": "The State Council notice for 2027 was not published as of 2026-10-30. This is UNKNOWN, not 'no holidays': the indicator shows UNKNOWN inside weekday peak windows until this year is filled in from the official notice.",
          "ranges": [],
          "makeupWorkdays": []
        }
      }
    };
    // <<< HOLIDAY_CALENDAR

    const CALENDAR_TIME_ZONE =
      typeof HOLIDAY_CALENDAR.timeZone === 'string' && HOLIDAY_CALENDAR.timeZone !== ''
        ? HOLIDAY_CALENDAR.timeZone
        : 'Asia/Shanghai';

    // -----------------------------------------------------------------------
    // Timezone-aware helpers (Intl only; no hardcoded offsets, no libraries)
    // -----------------------------------------------------------------------

    const DATE_PARTS = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const DATETIME_PARTS = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      weekday: 'short',
    };
    /** Numeric parts only, for offset arithmetic. */
    const OFFSET_PARTS = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    };
    /** One Intl formatter per (zone, shape); formatters are immutable. */
    const formatterCache = new Map();

    function formatterFor(timeZone, key, options) {
      const cacheKey = timeZone + '|' + key;
      let formatter = formatterCache.get(cacheKey);
      if (formatter === undefined) {
        formatter = new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: timeZone }, options));
        formatterCache.set(cacheKey, formatter);
      }
      return formatter;
    }

    function partsOf(ms, timeZone, key, options) {
      const parts = {};
      const formatted = formatterFor(timeZone, key, options).formatToParts(new Date(ms));
      for (const part of formatted) {
        if (part.type !== 'literal') parts[part.type] = part.value;
      }
      return parts;
    }

    /** `YYYY-MM-DD` calendar date in the given IANA zone (used for holidays). */
    function zonedDateKey(ms, timeZone) {
      const p = partsOf(ms, timeZone, 'date', DATE_PARTS);
      return p.year + '-' + p.month + '-' + p.day;
    }

    /** Stable `Sat 31 Oct 2026 15:10:34` style stamp assembled from zone parts. */
    function formatZoned(ms, timeZone) {
      const p = partsOf(ms, timeZone, 'datetime', DATETIME_PARTS);
      const hour = p.hour === '24' ? '00' : p.hour;
      return p.weekday + ' ' + p.day + ' ' + p.month + ' ' + p.year + ' ' + hour + ':' + p.minute + ':' + p.second;
    }

    /** UTC offset in minutes for one instant in an IANA zone (DST-correct). */
    function offsetMinutes(ms, timeZone) {
      const p = partsOf(ms, timeZone, 'offset', OFFSET_PARTS);
      const asUtc = Date.UTC(
        Number(p.year),
        Number(p.month) - 1,
        Number(p.day),
        Number(p.hour === '24' ? 0 : p.hour),
        Number(p.minute),
        Number(p.second),
      );
      return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
    }

    /** `UTC+04:30` style offset label computed from the zone, not a constant. */
    function formatOffset(ms, timeZone) {
      const total = offsetMinutes(ms, timeZone);
      const sign = total < 0 ? '-' : '+';
      const abs = Math.abs(total);
      const hh = String(Math.floor(abs / 60)).padStart(2, '0');
      const mm = String(abs % 60).padStart(2, '0');
      return 'UTC' + sign + hh + ':' + mm;
    }

    /**
     * Remaining time as whole hours and minutes only (the popover requirement):
     * `2h 13m`, `63h 0m`. Rounded up so a running period never shows 0h 0m.
     */
    function formatHoursMinutes(ms) {
      const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return hours + 'h ' + minutes + 'm';
    }

    // -----------------------------------------------------------------------
    // Official schedule + holiday calendar
    // -----------------------------------------------------------------------

    function isValidDateKey(value) {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      // Reject syntactically valid but nonexistent dates such as 2026-02-30.
      const parsed = new Date(value + 'T00:00:00Z');
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }

    /**
     * One year of the local holiday table, validated. `known` is true only for a
     * year that the table marks `verified: true`, carries a source, and has
     * well-formed inclusive date ranges. Anything else is UNKNOWN, never "no
     * holidays" — an unverified calendar must never produce a confident PEAK.
     */
    function calendarYear(year) {
      const years = HOLIDAY_CALENDAR.years;
      const raw = years !== null && typeof years === 'object' ? years[String(year)] : undefined;
      if (raw === undefined || raw === null || typeof raw !== 'object') {
        return { year: year, known: false, reason: 'missing' };
      }
      if (raw.verified !== true) {
        return { year: year, known: false, reason: raw.published === false ? 'unpublished' : 'unverified' };
      }
      if (typeof raw.source !== 'string' || raw.source === '' || !Array.isArray(raw.ranges)) {
        return { year: year, known: false, reason: 'malformed' };
      }
      const ranges = [];
      for (const range of raw.ranges) {
        if (range === null || typeof range !== 'object') return { year: year, known: false, reason: 'malformed' };
        if (!isValidDateKey(range.start) || !isValidDateKey(range.end) || range.start > range.end) {
          return { year: year, known: false, reason: 'malformed' };
        }
        ranges.push(range);
      }
      return { year: year, known: true, ranges: ranges, source: raw.source };
    }

    /** Holiday answer for the China Standard Time calendar date of `ms`. */
    function holidayStatus(ms) {
      const dateKey = zonedDateKey(ms, CALENDAR_TIME_ZONE);
      const year = Number(dateKey.slice(0, 4));
      const calendar = calendarYear(year);
      if (!calendar.known) {
        return { known: false, holiday: false, year: year, reason: calendar.reason, name: '' };
      }
      for (const range of calendar.ranges) {
        if (dateKey >= range.start && dateKey <= range.end) {
          return {
            known: true,
            holiday: true,
            year: year,
            reason: 'holiday',
            name: typeof range.name === 'string' ? range.name : '',
          };
        }
      }
      return { known: true, holiday: false, year: year, reason: 'workday', name: '' };
    }

    function utcWeekday(ms) {
      return new Date(ms).getUTCDay();
    }

    function isWeekend(ms) {
      const weekday = utcWeekday(ms);
      return weekday === 0 || weekday === 6;
    }

    function isInsidePeakWindow(ms) {
      const date = new Date(ms);
      const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
      for (const window of PEAK_WINDOWS_MINUTES) {
        if (minutes >= window[0] && minutes < window[1]) return true;
      }
      return false;
    }

    /**
     * The single source of truth for the indicator.
     *
     * Certain answers: outside both windows, or on a weekend (DeepSeek documents
     * weekends as off-peak "in full", so a Saturday window hour is still
     * off-peak). Inside a Mon-Fri window the answer depends on the Chinese
     * holiday calendar; if that year is not verified the honest answer is
     * UNKNOWN, not PEAK.
     */
    function resolveState(ms) {
      if (!isInsidePeakWindow(ms)) {
        return { status: 'OFF_PEAK', basis: 'outside-peak-window' };
      }
      if (isWeekend(ms)) {
        return { status: 'OFF_PEAK', basis: 'weekend' };
      }
      const holiday = holidayStatus(ms);
      if (!holiday.known) {
        return { status: 'UNKNOWN', basis: 'holiday-calendar', holiday: holiday };
      }
      if (holiday.holiday) {
        return { status: 'OFF_PEAK', basis: 'holiday', holiday: holiday };
      }
      return { status: 'PEAK', basis: 'peak-window' };
    }

    /**
     * The UTC minute-of-day at which the configured calendar zone's date changes
     * (16:00 for Asia/Shanghai), derived from Intl rather than hardcoded.
     */
    function calendarMidnightMinutesUtc(ms) {
      const offset = offsetMinutes(ms, CALENDAR_TIME_ZONE);
      return (((24 * 60 - offset) % (24 * 60)) + 24 * 60) % (24 * 60);
    }

    /** Sorted UTC minutes-of-day at which the resolved status can change. */
    function boundaryMinutesUtc(ms) {
      const minutes = PEAK_BOUNDARY_MINUTES_UTC.slice();
      const calendarMidnight = calendarMidnightMinutesUtc(ms);
      if (minutes.indexOf(calendarMidnight) < 0) minutes.push(calendarMidnight);
      minutes.sort(function (a, b) {
        return a - b;
      });
      return minutes;
    }

    /**
     * The next instant at which the resolved status changes, searched only over
     * instants where it is mathematically able to change. Returns null when the
     * answer stays UNKNOWN for the whole horizon (an unverified calendar year).
     */
    function nextTransition(ms) {
      let last = resolveState(ms).status;
      const now = new Date(ms);
      const baseYear = now.getUTCFullYear();
      const baseMonth = now.getUTCMonth();
      const baseDay = now.getUTCDate();
      const boundaries = boundaryMinutesUtc(ms);
      for (let offset = 0; offset <= HORIZON_DAYS; offset += 1) {
        const dayStart = Date.UTC(baseYear, baseMonth, baseDay + offset);
        for (const minutes of boundaries) {
          const at = dayStart + minutes * 60000;
          if (at <= ms) continue;
          const status = resolveState(at).status;
          if (status !== last) return { at: at, from: last, to: status };
          last = status;
        }
      }
      return null;
    }

    // -----------------------------------------------------------------------
    // Copy (English fallback + optional Client locale dictionaries)
    // -----------------------------------------------------------------------

    const EN = {
      'line.peakStarts': 'Peak starts in: {time}',
      'line.offPeakStarts': 'Off-Peak starts in: {time}',
      'line.unknown': 'Next transition cannot be reliably determined.',
      'dialog.label': 'DeepSeek API pricing period',
      'tooltip': 'DeepSeek API pricing: {state}. Click for details.',
    };

    const ZH = {
      'line.peakStarts': '高峰将在 {time} 后开始',
      'line.offPeakStarts': '空闲将在 {time} 后开始',
      'line.unknown': '无法可靠确定下次切换时间。',
      'dialog.label': 'DeepSeek API 峰谷时段',
      'tooltip': 'DeepSeek API 定价：{state}。点击查看详情。',
    };

    /** Replace `{name}` placeholders; used by the fallback and by tests. */
    function fillTemplate(text, params) {
      let out = text;
      if (params !== undefined && params !== null) {
        for (const name of Object.keys(params)) {
          out = out.split('{' + name + '}').join(String(params[name]));
        }
      }
      return out;
    }

    /** Built-in translator so the indicator reads correctly without a locale service. */
    function fallbackTranslate(key, params) {
      const text = Object.prototype.hasOwnProperty.call(EN, key) ? EN[key] : key;
      return fillTemplate(text, params);
    }

    // -----------------------------------------------------------------------
    // Minimal view model (pure; testable without a DOM)
    // -----------------------------------------------------------------------

    /**
     * The popover has exactly two lines: the status and when the other period
     * starts. When the next transition cannot be classified per the requirement
     * (current UNKNOWN, or an unverified holiday year ahead), no countdown is
     * invented.
     */
    function describe(now, t) {
      const state = resolveState(now);
      let lineText;
      if (state.status === 'UNKNOWN') {
        lineText = t('line.unknown');
      } else {
        const change = nextTransition(now);
        const expected = state.status === 'PEAK' ? 'OFF_PEAK' : 'PEAK';
        if (change === null || change.to !== expected) {
          lineText = t('line.unknown');
        } else {
          lineText = t(state.status === 'PEAK' ? 'line.offPeakStarts' : 'line.peakStarts', {
            time: formatHoursMinutes(change.at - now),
          });
        }
      }
      return {
        status: state.status,
        statusClass: STATUS_CLASS[state.status],
        pillLabel: PILL_LABEL[state.status],
        lineText: lineText,
      };
    }

    /** Dependency-free UNKNOWN view used when computing the schedule throws. */
    function fallbackView() {
      return {
        status: 'UNKNOWN',
        statusClass: 'unknown',
        pillLabel: 'UNKNOWN',
        lineText: 'Next transition cannot be reliably determined.',
      };
    }

    // -----------------------------------------------------------------------
    // Styles (theme tokens only; rendered as a React element so unmount removes it)
    // -----------------------------------------------------------------------

    const CSS = [
      '.dspi-root{display:inline-flex;align-items:center;min-width:0;max-width:100%}',
      '.dspi-anchor{display:inline-flex;align-items:center;min-width:0;max-width:100%}',
      '.dspi-pill{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;height:24px;',
      'max-width:100%;padding:0 9px;border:1px solid var(--dsw-alias-border-l1,transparent);border-radius:999px;',
      'background:transparent;color:var(--dsw-alias-label-secondary,currentColor);cursor:pointer;',
      'font:inherit;font-size:11px;font-weight:600;letter-spacing:.04em;line-height:1;white-space:nowrap;',
      'font-variant-numeric:tabular-nums}',
      '.dspi-pill:hover,.dspi-pill[aria-expanded="true"]{background:var(--dsw-alias-bg-layer-2,transparent);',
      'border-color:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1,transparent));',
      'color:var(--dsw-alias-label-primary,currentColor)}',
      '.dspi-compact{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;',
      'width:28px;height:28px;padding:0;border:0;border-radius:8px;background:transparent;cursor:pointer}',
      '.dspi-compact:hover,.dspi-compact[aria-expanded="true"]{background:var(--dsw-alias-bg-layer-2,transparent)}',
      '.dspi-pill:focus-visible,.dspi-compact:focus-visible{',
      'outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:1px}',
      '.dspi-label{min-width:0;overflow:hidden;text-overflow:ellipsis}',
      '.dspi-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:currentColor;flex:0 0 auto}',
      '[data-dspi-state="off-peak"] .dspi-dot{background:var(--dsw-alias-state-success-primary,#16a34a)}',
      '[data-dspi-state="peak"] .dspi-dot{background:var(--dsw-alias-state-error-primary,#dc2626)}',
      '[data-dspi-state="unknown"] .dspi-dot{background:var(--dsw-alias-state-idle-primary,#9ca3af)}',
      '.dspi-panel{position:fixed;z-index:1100;box-sizing:border-box;width:max-content;min-width:150px;',
      'max-width:min(260px,calc(100vw - 16px));padding:9px 12px;border:1px solid var(--dsw-alias-border-l1,#d4d4d8);',
      'border-radius:10px;background:var(--dsw-alias-bg-overlay,#fff);color:var(--dsw-alias-label-primary,#111);',
      'box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:12px;line-height:1.45;cursor:default}',
      '.dspi-panel-status{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;letter-spacing:.02em}',
      '.dspi-panel-line{margin-top:3px;color:var(--dsw-alias-label-secondary,#52525b);white-space:nowrap}',
    ].join('');

    const MEASURE_STYLE = { position: 'fixed', left: '-9999px', top: '-9999px', visibility: 'hidden' };

    // -----------------------------------------------------------------------
    // React component
    // -----------------------------------------------------------------------

    function createIndicator(defaultTranslate) {
      return function DeepSeekPeakIndicator(props) {
        const propsObject = props !== null && typeof props === 'object' ? props : {};
        const t = typeof propsObject.t === 'function' ? propsObject.t : defaultTranslate;
        const wide = propsObject.wide === true;

        const [now, setNow] = React.useState(function () {
          return Date.now();
        });
        const [open, setOpen] = React.useState(false);
        const [position, setPosition] = React.useState(null);
        const anchorRef = React.useRef(null);
        const panelRef = React.useRef(null);

        // The countdown refreshes once a minute (no seconds), plus one exact
        // timer at the next schedule transition so the status never lags a
        // period boundary. Both are cleared on unmount, which is what plugin
        // unload does to this slot entry.
        React.useEffect(function () {
          let minuteTimer = null;
          let transitionTimer = null;
          const refresh = function () {
            const nowMs = Date.now();
            setNow(nowMs);
            if (transitionTimer !== null) {
              clearTimeout(transitionTimer);
              transitionTimer = null;
            }
            let change = null;
            try {
              change = nextTransition(nowMs);
            } catch (error) {
              change = null;
            }
            if (change !== null) {
              transitionTimer = setTimeout(
                refresh,
                Math.max(200, Math.min(change.at - nowMs + 200, 2000000000)),
              );
            }
          };
          refresh();
          minuteTimer = setInterval(refresh, COUNTDOWN_REFRESH_MS);
          return function () {
            clearInterval(minuteTimer);
            if (transitionTimer !== null) clearTimeout(transitionTimer);
          };
        }, []);

        // Anchor the minimal popover above the pill (it sits in the sidebar
        // foot), flipping below only if there is no room. Listeners and the
        // ResizeObserver are removed on close.
        React.useEffect(
          function () {
            if (!open) {
              setPosition(null);
              return undefined;
            }
            const place = function () {
              const anchor = anchorRef.current;
              const panel = panelRef.current;
              if (anchor === null || panel === null) return;
              const rect = anchor.getBoundingClientRect();
              const width = panel.offsetWidth || 220;
              const height = panel.offsetHeight || 70;
              const margin = 8;
              const gap = 6;
              let left = Math.min(Math.max(margin, rect.left), Math.max(margin, window.innerWidth - width - margin));
              let top = rect.top - gap - height;
              if (top < margin) top = rect.bottom + gap;
              setPosition({ left: Math.round(left), top: Math.round(top) });
            };
            place();
            let observer = null;
            if (typeof ResizeObserver !== 'undefined' && panelRef.current !== null) {
              observer = new ResizeObserver(place);
              observer.observe(panelRef.current);
            }
            window.addEventListener('resize', place);
            window.addEventListener('scroll', place, true);
            return function () {
              if (observer !== null) observer.disconnect();
              window.removeEventListener('resize', place);
              window.removeEventListener('scroll', place, true);
            };
          },
          [open],
        );

        // Dismiss on Escape and on a pointerdown outside trigger + panel.
        React.useEffect(
          function () {
            if (!open) return undefined;
            const onKeyDown = function (event) {
              if (event.key === 'Escape') setOpen(false);
            };
            const onPointerDown = function (event) {
              const target = event.target;
              if (!(target instanceof Node)) return;
              const anchor = anchorRef.current;
              const panel = panelRef.current;
              if (anchor !== null && anchor.contains(target)) return;
              if (panel !== null && panel.contains(target)) return;
              setOpen(false);
            };
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('pointerdown', onPointerDown);
            return function () {
              document.removeEventListener('keydown', onKeyDown);
              document.removeEventListener('pointerdown', onPointerDown);
            };
          },
          [open],
        );

        let view = null;
        try {
          view = describe(now, t);
        } catch (error) {
          // A broken clock/Intl/calendar must not make the indicator disappear:
          // show an honest UNKNOWN instead of an empty seat.
          view = fallbackView();
        }

        const button = h(
          'button',
          {
            type: 'button',
            className: wide ? 'dspi-pill' : 'dspi-compact',
            title: t('tooltip', { state: view.pillLabel }),
            'aria-label': t('tooltip', { state: view.pillLabel }),
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            onClick: function () {
              setNow(Date.now());
              setOpen(!open);
            },
          },
          h('span', { className: 'dspi-dot', 'aria-hidden': 'true' }),
          wide ? h('span', { className: 'dspi-label' }, view.pillLabel) : null,
        );

        const children = [
          h('style', { key: 'dspi-style' }, CSS),
          h('span', { className: 'dspi-anchor', ref: anchorRef, key: 'dspi-anchor' }, button),
        ];
        if (open) {
          children.push(renderPanel(view, position, panelRef, t));
        }

        return h('span', { className: 'dspi-root', 'data-dspi-state': view.statusClass }, children);
      };
    }

    function renderPanel(view, position, panelRef, t) {
      const style =
        position === null
          ? MEASURE_STYLE
          : { position: 'fixed', left: position.left + 'px', top: position.top + 'px' };
      return createPortal(
        h(
          'div',
          {
            ref: panelRef,
            className: 'dspi-panel',
            'data-dspi-state': view.statusClass,
            role: 'dialog',
            'aria-label': t('dialog.label'),
            style: style,
          },
          h(
            'div',
            { className: 'dspi-panel-status' },
            h('span', { className: 'dspi-dot', 'aria-hidden': 'true' }),
            h('strong', null, view.pillLabel),
          ),
          h('div', { className: 'dspi-panel-line' }, view.lineText),
        ),
        document.body,
      );
    }

    // -----------------------------------------------------------------------
    // Registration
    // -----------------------------------------------------------------------

    function apply(ctx) {
      // Localize the two popover lines when the Client locale service is
      // available; the English fallback keeps the indicator readable without it.
      let t = fallbackTranslate;
      let localeOption = {};
      const locale = typeof ctx.get === 'function' ? ctx.get('locale') : undefined;
      if (locale !== undefined && locale !== null) {
        if (typeof locale.register === 'function') {
          ctx.effect(function () {
            const disposers = [];
            try {
              disposers.push(locale.register(NS, 'en', EN));
              disposers.push(locale.register(NS, 'zh', ZH));
            } catch (error) {
              // A rejected namespace only costs localization.
            }
            return function () {
              for (const dispose of disposers) {
                try {
                  dispose();
                } catch (error) {
                  /* already removed */
                }
              }
            };
          }, 'deepseek-peak-indicator: dictionaries');
        }
        if (typeof locale.bind === 'function') {
          try {
            const bound = locale.bind(NS);
            if (typeof bound === 'function') t = bound;
            localeOption = { locale: NS };
          } catch (error) {
            t = fallbackTranslate;
          }
        }
      }

      const Indicator = createIndicator(t);
      ctx.slots.inject(SLOT_NAME, function () {
        return ctx.slots.register(
          {
            name: SLOT_NAME,
            id: ENTRY_ID,
            order: ENTRY_ORDER,
            ...localeOption,
          },
          Indicator,
        );
      });
    }

    // Test seam: a Node unit test can read and exercise the pure schedule core
    // without a DOM. Never set in the browser, so production behavior is unchanged.
    if (typeof globalThis === 'object' && globalThis !== null && globalThis.__DSPI_TEST__ !== undefined) {
      globalThis.__DSPI_TEST__.core = {
        resolveState: resolveState,
        nextTransition: nextTransition,
        holidayStatus: holidayStatus,
        calendarYear: calendarYear,
        boundaryMinutesUtc: boundaryMinutesUtc,
        calendarMidnightMinutesUtc: calendarMidnightMinutesUtc,
        zonedDateKey: zonedDateKey,
        formatZoned: formatZoned,
        formatOffset: formatOffset,
        formatHoursMinutes: formatHoursMinutes,
        describe: describe,
        fallbackView: fallbackView,
        renderPanel: renderPanel,
        fallbackTranslate: fallbackTranslate,
        DISPLAY_TIME_ZONE: DISPLAY_TIME_ZONE,
        SOURCE_URL: SOURCE_URL,
        SLOT_NAME: SLOT_NAME,
        ENTRY_ID: ENTRY_ID,
        CALENDAR_TIME_ZONE: CALENDAR_TIME_ZONE,
        HOLIDAY_CALENDAR: HOLIDAY_CALENDAR,
      };
    }

    return { inject: ['slots'], apply: apply };
  },
});
