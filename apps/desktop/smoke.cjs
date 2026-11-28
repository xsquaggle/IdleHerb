/**
 * Smoke test of the packaged app (docs/tech/08, desktop.yml): launches the real
 * executable, checks the game draws and earns, saves to a file, and that a second
 * launch picks the save back up.
 *
 *   node smoke.cjs <path to the app executable> [screenshot folder]
 *
 * Saves go to a fresh temporary folder (the portable layout), never the player's own.
 */
'use strict';

const { _electron: electron } = require('playwright-core');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const exe = process.argv[2];
const shots = process.argv[3] ?? path.join(__dirname, 'release');
if (!exe || !fs.existsSync(exe)) {
  console.error(`No app at ${exe}`);
  process.exit(2);
}
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'sprout-smoke-'));
const saveFile = path.join(data, 'SproutTowerData', 'saves', 'main', 'save.sprout');
let pageErrors = 0;

async function launch() {
  const app = await electron.launch({
    executablePath: exe,
    args: process.platform === 'linux' ? ['--no-sandbox'] : [],
    env: { ...process.env, PORTABLE_EXECUTABLE_DIR: data },
    timeout: 60_000,
  });
  const page = await app.firstWindow();
  page.on('pageerror', (e) => {
    console.error('[page error]', e.message);
    pageErrors++;
  });
  await page.waitForFunction(() => !!(window.__sprout && window.__sprout.game), null, { timeout: 60_000 });
  return { app, page };
}

function check(ok, what) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) process.exitCode = 1;
}

(async () => {
  fs.mkdirSync(shots, { recursive: true });

  // First launch: a new tower.
  let { app, page } = await launch();
  const info = await page.evaluate(() => window.sproutShell && window.sproutShell.info);
  check(!!info && info.portable === true, `shell bridge is there (${JSON.stringify(info)})`);
  const blocked = await page.evaluate(() => typeof window.require === 'undefined' && typeof window.process === 'undefined');
  check(blocked, 'page has no Node access');
  const before = await page.evaluate(() => window.__sprout.game.state.counters.taps ?? 0);
  await page.evaluate(() => {
    window.__sprout.skipReveals?.();
    window.__sprout.game.dispatch({ type: 'tap', count: 25 });
  });
  // The first planter grows, then a tap harvests it.
  await page.waitForFunction(() => window.__sprout.game.state.worlds[0].floors[0].ready, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sprout.game.dispatch({ type: 'tap', count: 1 }));
  await page.waitForTimeout(1000);
  const taps = await page.evaluate(() => window.__sprout.game.state.counters.taps ?? 0);
  check(taps >= before + 26, `taps count (${before} -> ${taps})`);
  const coins = await page.evaluate(() => window.__sprout.game.state.worlds[0].coins.toString());
  check(Number(coins) > 0, `the harvest paid coins (${coins})`);
  await page.screenshot({ path: path.join(shots, 'smoke-1-first-launch.png') });
  await page.evaluate(() => window.__sprout.save());
  await page.waitForTimeout(1000);
  check(fs.existsSync(saveFile), `save file written (${saveFile})`);
  await app.close();

  // Second launch: the same tower.
  ({ app, page } = await launch());
  const again = await page.evaluate(() => window.__sprout.game.state.counters.taps ?? 0);
  check(again >= taps, `save loaded on the next launch (${again} taps)`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(shots, 'smoke-2-second-launch.png') });
  await app.close();

  check(pageErrors === 0, `no errors on the page (${pageErrors})`);
  console.log(process.exitCode ? 'Smoke test failed' : 'Smoke test passed');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
