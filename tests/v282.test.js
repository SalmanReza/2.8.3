import test from 'node:test';
import assert from 'node:assert/strict';
import { localPlace } from '../src/places.js';
import { APP_VERSION } from '../src/branding.js';
import { readText } from './helpers/read-text.js';

const read = file => readText(file, import.meta.url);

test('v2.8.3 looks up a town and city offline', () => {
  assert.equal(APP_VERSION, '2.8.3');
  const label = localPlace(23.9181, 90.2533, 'en');
  assert.match(label, /Savar/);
  assert.match(label, /Dhaka/);
  assert.doesNotMatch(label, /23\.918/);
  const bn = localPlace(23.9181, 90.2533, 'bn');
  assert.match(bn, /সাভার/);
  assert.equal(localPlace(0, 0, 'en'), '');
  const places = read('../src/places.js');
  assert.doesNotMatch(places, /fetch\(|navigator\.geolocation|https?:\/\//);
});

test('v2.8.3 ticks +2 rak‘ahs, marks complete on the countdown, and matches the page font', () => {
  const app = read('../src/app.js');
  const css = read('../src/styles.css');
  const html = read('../index.html');
  assert.match(app, /playLayerSound\('voluntary', true, before, dayLayers\(date\)\)/);
  assert.match(app, /data-mark-complete="\$\{countdownState\.kind\}"/);
  assert.match(html, /When preferred time begins/);
  assert.match(html, /When preferred time ends/);
  assert.match(html, /Remind me when the preferred time begins/);
  assert.match(html, /Remind me when the preferred time ends/);
  assert.doesNotMatch(css, /Optima/);
  assert.match(css, /body \.clock-card #liveClock \{[^}]*font-family: var\(--ui-font\)/);
  assert.match(app, /state\.place = localPlace\(lat, lon, lang\(\)\)/);
});
