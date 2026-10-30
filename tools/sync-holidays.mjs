/**
 * Regenerate the inline HOLIDAY_CALENDAR block in client.js from holidays.json.
 *
 * The browser bundle cannot read a sibling JSON file at runtime (the client
 * module system serves only the plugin's own client bundle), so the editable
 * configuration lives in holidays.json and is inlined here. Run this from the
 * bundle directory after editing the JSON:
 *
 *   node tools/sync-holidays.mjs
 *
 * Zero dependencies beyond Node's own fs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const configPath = new URL('../holidays.json', import.meta.url);
const clientPath = new URL('../client.js', import.meta.url);

const START = '// >>> HOLIDAY_CALENDAR — generated from holidays.json by tools/sync-holidays.mjs';
const END = '// <<< HOLIDAY_CALENDAR';

const config = JSON.parse(readFileSync(configPath, 'utf8'));
if (config === null || typeof config !== 'object' || config.years === null || typeof config.years !== 'object') {
  throw new Error('holidays.json must contain a "years" object');
}

const calendar = { timeZone: config.timeZone || 'Asia/Shanghai', years: config.years };
const json = JSON.stringify(calendar, null, 2)
  .split('\n')
  .map(function (line) {
    return '    ' + line;
  })
  .join('\n');
const block = START + '\n    const HOLIDAY_CALENDAR = ' + json + ';\n    ' + END;

const source = readFileSync(clientPath, 'utf8');
const startIndex = source.indexOf(START);
const endIndex = source.indexOf(END);
if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
  throw new Error('HOLIDAY_CALENDAR markers not found in client.js');
}
if (source.indexOf(START, startIndex + 1) >= 0 || source.indexOf(END, endIndex + 1) >= 0) {
  throw new Error('HOLIDAY_CALENDAR markers appear more than once in client.js');
}

const next = source.slice(0, startIndex) + block + source.slice(endIndex + END.length);
writeFileSync(clientPath, next, 'utf8');

const years = Object.keys(config.years).sort();
console.log('synced holidays.json -> client.js (' + fileURLToPath(root) + ')');
console.log('years: ' + years.join(', '));
