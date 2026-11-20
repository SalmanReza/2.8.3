import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_VERSION } from '../src/branding.js';
import { readText } from './helpers/read-text.js';

test('v2.8.3 keeps the header tight and prayer events content-sized', () => {
  assert.equal(APP_VERSION, '2.8.3');
  const css = readText('../src/styles.css', import.meta.url);
  const layout = css.slice(css.lastIndexOf('/* v2.8.3'));
  assert.match(layout, /padding-top:\s*0/);
  assert.match(layout, /--topbar-h:\s*clamp\(1\.7rem,\s*2\.4vh,\s*2\.05rem\)/);
  assert.match(layout, /grid-template-rows:\s*auto auto auto auto/);
  assert.match(layout, /\[data-events="1"\] > \.live-event \{ flex: 1 1 100%/);
  assert.match(layout, /align-items:\s*start/);
  assert.match(layout, /data-events="6"/);
  assert.doesNotMatch(layout, /max-width:\s*48rem/);
});
