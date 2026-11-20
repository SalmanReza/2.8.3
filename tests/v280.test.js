import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_VERSION } from '../src/branding.js';
import { readText } from './helpers/read-text.js';

const app = readText('../src/app.js', import.meta.url);
const css = readText('../src/styles.css', import.meta.url);

function loadStamp() {
  const start = app.indexOf('function stamp(');
  const end = app.indexOf('/* v1.3.4:', start);
  assert.ok(start > 0 && end > start, 'stamp() is defined before the location subtitle');
  return new Function(`${app.slice(start, end)}\nreturn stamp;`)();
}

test('v2.8.3 clock countdown uses numeric prohibited ends', () => {
  assert.equal(APP_VERSION, '2.8.3');
  const stamp = loadStamp();
  const end = Date.parse('2026-11-19T11:50:00');
  assert.equal(stamp(end), end);
  assert.equal(stamp(new Date(end)), end);
  assert.ok(Number.isNaN(stamp('nope')));
  assert.doesNotMatch(app, /paused\.end\.getTime\(/);
  assert.doesNotMatch(app, /fmt\(new Date\(paused\.start\)\)/);
  const clock = app.slice(app.indexOf('function renderTimeView'), app.indexOf('function openSettings'));
  const live = app.slice(app.indexOf('function updateTimeViewLive'), app.indexOf('function renderAdjustmentControls'));
  assert.match(clock, /const pauseEnd = stamp\(paused\.end\)/);
  assert.match(clock, /const until = paused \? stamp\(paused\.end\)/);
  assert.match(clock, /Remaining in this prohibited time/);
  assert.match(live, /const until = paused \? stamp\(paused\.end\)/);
  assert.match(app, /box\.dataset\.events = String\(events\.length\)/);
});

test('v2.8.3 one prayer event fills the band and several share it', () => {
  const layout = css.slice(css.lastIndexOf('/* v2.5.3 event-card composition'));
  assert.match(layout, /display:\s*flex/);
  assert.match(layout, /flex-wrap:\s*wrap/);
  assert.match(layout, /flex:\s*1 1 22rem/);
  assert.match(layout, /\[data-events="1"\] > \.live-event\s*\{[^}]*flex:\s*1 1 100%/s);
  assert.match(layout, /grid-template-rows:\s*auto auto 1fr auto/);
  assert.doesNotMatch(layout, /max-width:\s*48rem/);
});
