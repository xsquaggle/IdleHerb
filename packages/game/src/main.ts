/**
 * Sprout Tower, the game client: boots the fonts, art and content, loads the
 * save, builds the scene and runs the loop. The rules all live in @sprout/core;
 * this file only wires the presentation to them.
 */
import { Application, Container, Rectangle, type FederatedPointerEvent, type FederatedWheelEvent } from 'pixi.js';
import { Game, Num, type GameEvent } from '@sprout/core';
import { computeView, applyView, type View } from './engine/resolution';
import { loadPixelFont } from './engine/font';
import { loadArt } from './engine/assets';
import { F } from './engine/ui';
import { C } from './engine/palette';
import { clock } from './engine/tween';
import { sfx, unlockAudio, setMuted } from './engine/audio';
import { Particles } from './engine/particles';
import { content, ui, floorName, txt } from './app/content';
import { session } from './app/session';
import { loadSave, loadSettings, saveSettings, writeSave } from './app/save';
import { Backdrop } from './scene/backdrop';
import { Tower, floorTop } from './scene/tower';
import { Hud, TOP_H, BOTTOM_H } from './scene/hud';
import { Toasts } from './scene/toast';
import { Pip } from './scene/pip';
import { Visitors } from './scene/visitors';
import { Reveal, type RevealOptions } from './scene/reveal';
import { initMoments, namedMoment } from './scene/moment';
import { ChestsPanel, CardsPanel, ReplantPanel, SettingsPanel, TheatrePanel, WelcomeBack } from './scene/panels';
import type { Window } from './scene/window';
import { coinFlight, flash } from './scene/fx';
import jersey from '@fontsource/jersey-10/files/jersey-10-latin-400-normal.woff2?url';
import tiny5 from '@fontsource/tiny5/files/tiny5-latin-400-normal.woff2?url';

const bootEl = document.getElementById('boot');
const setBoot = (t: string) => {
  if (bootEl) bootEl.textContent = t;
};

async function boot(): Promise<void> {
  const settings = loadSettings();
  setMuted(settings.muted);

  setBoot('Sprouting…');
  const [big, body, small] = await Promise.all([
    loadPixelFont({ id: 'big', family: 'Jersey10', url: jersey, size: 20, threshold: 110 }),
    loadPixelFont({ id: 'body', family: 'Jersey10', url: jersey, size: 16, threshold: 110 }),
    loadPixelFont({ id: 'small', family: 'Tiny5', url: tiny5, size: 8, threshold: 110 }),
  ]);
  F.big = big;
  F.body = body;
  F.small = small;
  await loadArt((f) => setBoot(`Sprouting… ${Math.round(f * 100)}%`));

  // The game: a save if there is one, else a new tower.
  const saved = await loadSave();
  const game = new Game({ content, seed: saved?.state.seed ?? (Date.now() % 2147483647), state: saved?.state, rollTaps: true });
  session.game = game;
  session.settings = settings;
  session.saveSettings = () => saveSettings(settings);

  // Pixi at the logical size; CSS scales it by whole device pixels.
  const stageEl = document.getElementById('stage')!;
  const stageSize = () => {
    const r = stageEl.getBoundingClientRect();
    return { w: r.width || window.innerWidth, h: r.height || window.innerHeight };
  };
  let view: View = computeView(stageSize().w, stageSize().h, window.devicePixelRatio || 1);
  const app = new Application();
  await app.init({
    width: view.w,
    height: view.h,
    resolution: 1,
    antialias: false,
    roundPixels: true,
    autoDensity: false,
    background: C['ink-2'],
    preference: 'webgl',
  });
  const canvas = app.canvas;
  stageEl.appendChild(canvas);
  bootEl?.remove();

  // Layers, back to front.
  const root = new Container();
  const backdrop = new Backdrop();
  const tower = new Tower();
  const visitors = new Visitors();
  const hud = new Hud();
  const screenFx = new Particles();
  const coinLayer = new Container();
  const pip = new Pip();
  const momentFx = new Container();
  const overlay = new Container();
  const toasts = new Toasts();
  root.addChild(backdrop, tower, visitors, hud, pip, coinLayer, screenFx, momentFx, overlay, toasts);
  initMoments(momentFx, screenFx, () => view);
  app.stage.addChild(root);
  app.stage.eventMode = 'static';

  let panel: Window | null = null;
  const reveals: Reveal[] = [];
  let shakeLeft = 0;
  let shakeAmt = 0;

  session.hooks = {
    coinTarget: () => hud.coinTarget(),
    coinLanded: () => hud.coinLanded(),
    shake: (px, sec) => {
      if (settings.reduceMotion) return;
      shakeAmt = Math.max(shakeAmt, px);
      shakeLeft = Math.max(shakeLeft, sec);
    },
    toast: (text, color) => toasts.show(text, color),
    openPanel: (id) => {
      panel?.close();
      const p = id === 'chests' ? new ChestsPanel() : id === 'cards' ? new CardsPanel() : id === 'replant' ? new ReplantPanel() : id === 'theatre' ? new TheatrePanel() : new SettingsPanel();
      showWindow(p);
    },
    focusFloor: (i) => tower.focusFloor(i),
    reveal: (opts) => queueReveal(opts),
  };

  function showWindow(p: Window): void {
    panel = p;
    p.onClosed = () => {
      if (panel === p) panel = null;
    };
    overlay.addChild(p);
    p.layout(view.w, view.h);
    p.openAnim();
  }

  function layout(): void {
    const size = stageSize();
    view = computeView(size.w, size.h, window.devicePixelRatio || 1);
    app.renderer.resize(view.w, view.h);
    applyView(canvas, view, size.w, size.h);
    app.stage.hitArea = new Rectangle(0, 0, view.w, view.h);
    backdrop.resize(view.w, view.h);
    tower.setView(TOP_H, view.h - BOTTOM_H);
    hud.layout(view.w, view.h);
    const besideTower = Math.floor((view.w - 360) / 2) - 54;
    pip.layout(view.w, view.h - BOTTOM_H, besideTower >= 120 ? besideTower : view.w - 70);
    toasts.layout(view.w, () => hud.pinnedBottom());
    visitors.layout(view.w, TOP_H + 30, view.h - BOTTOM_H - 30);
    panel?.layout(view.w, view.h);
    for (const r of reveals) r.layout(view.w, view.h);
  }
  layout();
  window.addEventListener('resize', layout);
  window.visualViewport?.addEventListener('resize', layout);
  new ResizeObserver(() => layout()).observe(stageEl);

  // Start the camera on the highest open floor.
  const openCount = game.state.worlds[0]!.floors.filter((f) => f.level > 0).length;
  // The top open floor and the shutter above it share the view.
  tower.camY = -232 - Math.max(1, openCount) * 120;
  tower.glideTo(tower.camY);

  // Input: drag and wheel scroll the tower; taps are handled by each floor.
  app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
    unlockAudio();
    if (!panel && reveals.length === 0) tower.onDown(e);
  });
  app.stage.on('globalpointermove', (e: FederatedPointerEvent) => tower.onMove(e));
  app.stage.on('pointerup', (e: FederatedPointerEvent) => tower.onUp(e));
  app.stage.on('pointerupoutside', (e: FederatedPointerEvent) => tower.onUp(e));
  app.stage.on('wheel', (e: FederatedWheelEvent) => {
    if (!panel && reveals.length === 0) tower.onWheel(e);
  });

  // Keyboard: Space taps (hold for 6 a second), F starts a Spurt, B cycles the buy mode, arrows scroll.
  let spaceHeld = false;
  let spaceT = 0;
  window.addEventListener('keydown', (e) => {
    unlockAudio();
    if (e.code === 'Space') {
      e.preventDefault();
      if (!spaceHeld) {
        spaceHeld = true;
        spaceT = 0;
        keyTap();
      }
    } else if (e.code === 'KeyF') {
      if (game.dispatch({ type: 'startSpurt' })) sfx.spurt();
    } else if (e.code === 'KeyB') {
      hud.buyMode.onTap?.();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') tower.scrollBy(-60);
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') tower.scrollBy(60);
    else if (e.code === 'Escape') panel?.close();
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') spaceHeld = false;
  });
  function keyTap(): void {
    if (panel || reveals.length) return;
    lastTapFloor = -1;
    game.dispatch({ type: 'tap', count: 1 });
  }

  // Events from the core drive the presentation.
  let lastTapFloor = -1;
  const newCards = new Set<string>();
  const nextAfter = new Map<Reveal, () => void>();
  /** Reveals play one at a time, in the order they were asked for. Resolves when this one is put away. */
  function queueReveal(opts: RevealOptions): Promise<void> {
    const r = new Reveal(opts, view.w, view.h);
    reveals.push(r);
    overlay.addChild(r);
    return new Promise<void>((resolve) => {
      const after = () => {
        reveals.splice(reveals.indexOf(r), 1);
        resolve();
        const next = reveals[0];
        if (next) void next.start().then(nextAfter.get(next));
      };
      nextAfter.set(r, after);
      if (reveals.length === 1) void r.start().then(after);
    });
  }
  const center = () => ({ layer: overlay, x: Math.floor(view.w / 2), y: Math.floor(view.h * 0.45) });
  const floorPlace = (i: number) => {
    const fv = tower.floors[i];
    return fv ? { layer: fv as Container, x: 180, y: 60 } : center();
  };
  let comboWasFull = false;
  let recordPow = game.state.compostRecordPow;
  const queue: GameEvent[] = [];
  game.on((e) => queue.push(e));
  let coinBudget = 0;

  function onEvent(e: GameEvent): void {
    switch (e.type) {
      case 'tapped': {
        const fi = e.harvested >= 0 ? e.harvested : lastTapFloor;
        const fv = fi >= 0 ? tower.floors[fi] : undefined;
        const combo = game.derived.worlds[0]!.comboCap > 0 ? game.state.combo / game.derived.worlds[0]!.comboCap : 0;
        sfx.tap(combo);
        if (e.bumper) {
          sfx.bumper();
          namedMoment('bumper', fv ? { layer: fv, x: 180, y: 50 } : center());
        }
        // The Combo meter filling is its own moment, once per fill.
        const full = combo >= 0.999;
        if (full && !comboWasFull) namedMoment('combo_full', fv ? { layer: fv, x: 180, y: 40 } : center());
        comboWasFull = full;
        if (fv) {
          fv.tapped(e.amount, e.bumper, e.harvested >= 0, combo);
          if (e.amount.gt(0) && coinBudget > 0) {
            coinBudget -= 1;
            const p = fv.toGlobal({ x: 180, y: 50 });
            coinFlight(coinLayer, p, e.bumper ? 8 : e.harvested >= 0 ? 3 : 1);
          }
        }
        break;
      }
      case 'floorOpened': {
        const fv = tower.floors[e.floor];
        const top = e.floor === content.worlds[e.world]!.floors.length - 1;
        clock.after(0.05, () => {
          fv?.opened();
          tower.glideTo(floorTop(e.floor));
        });
        clock.after(0.45, () => namedMoment('floor_open', floorPlace(e.floor), { cases: top ? ['top'] : [] }));
        toasts.show(`${ui('new_floor')} ${floorName(e.world, e.floor)}`);
        if (e.floor === 1) pip.say('floor2');
        if (e.floor === 2) pip.say('floor3');
        if (e.floor === content.worlds[0]!.floors.length - 1) pip.say('top_floor', 'jump');
        break;
      }
      case 'milestone':
        tower.floors[e.floor]?.milestone();
        namedMoment('floor_milestone', floorPlace(e.floor), { value: game.state.worlds[e.world]!.floors[e.floor]!.level });
        if (!pip.hasSeen('milestone')) pip.say('milestone', 'jump');
        break;
      case 'towerMilestone':
        namedMoment('tower_milestone', center(), { value: e.count });
        break;
      case 'worldReached':
        namedMoment('world_reached', center(), { cases: e.first ? ['first'] : [] });
        break;
      case 'star':
        namedMoment('mastery_star', center(), { value: e.stars });
        break;
      case 'hire':
        tower.floors[e.floor]?.hired();
        toasts.show(`${ui('hired')}: ${txt('managers', content.worlds[0]!.floors[e.floor]!.manager.id)}`, C['gold-4']);
        break;
      case 'cardNew':
        newCards.add(e.id);
        break;
      case 'chestOpened': {
        const welcome = e.chest === 'chest.welcome';
        if (welcome) pip.say('welcome_chest', 'jump');
        void queueReveal({ chestId: e.chest, cards: e.cards, isNew: new Set(newCards) }).then(() => {
          if (welcome) pip.say('hire');
        });
        newCards.clear();
        break;
      }
      case 'cardLevel':
        toasts.show(`${txt('managers', e.id) ?? e.id} ${ui('level')} ${e.level}!`, C['leaf-5']);
        break;
      case 'levelUp':
        namedMoment('level_up', center(), { value: e.level });
        toasts.show(`${ui('player_level')} ${e.level}!`, C['lavender-5']);
        break;
      case 'story':
        toasts.show(`${ui('quest_done')}`, C['leaf-5']);
        break;
      case 'unlock':
        if (e.id === 'feature.tap_bonus') pip.say('tap_bonus');
        if (e.id === 'feature.bumpers') pip.say('bumper');
        if (e.id === 'feature.visitors') pip.say('visitors');
        if (e.id === 'feature.replant') pip.say('replant_ready', 'surprised');
        break;
      case 'visitor':
        if (!pip.hasSeen('visitors')) pip.say('visitors', 'surprised');
        break;
      case 'spurt':
        sfx.spurt();
        namedMoment('spurt', center());
        break;
      case 'reset': {
        // Every layer plays its own moment (tables/moments.yaml has a row per layer id).
        const layer = content.resetLayers.find((l) => l.id === e.layer);
        const record = game.state.compostRecordPow > recordPow;
        recordPow = game.state.compostRecordPow;
        const cases = [...(e.n === 1 ? ['first'] : []), ...(record ? ['record'] : [])];
        namedMoment(e.layer, center(), { cases });
        if (layer) toasts.show(`+${e.gained.toString()} ${txt('currencies', layer.currency)}`, C['leaf-5']);
        if (layer?.scope === 'world') {
          tower.focusFloor(0);
          pip.say(`after_${e.layer}`, 'jump');
        }
        break;
      }
      case 'offline': {
        const earned = e.earned[0] ?? Num.ZERO;
        if (e.seconds >= 60 && earned.gt(0)) showWindow(new WelcomeBack(e.seconds, earned));
        break;
      }
      default:
        break;
    }
  }

  // Floors tell main which floor a tap landed on, for its numbers and coins.
  for (const f of tower.floors) f.on('pointerdown', () => (lastTapFloor = f.index));

  // Time away since the last save is paid now (GDD 13, offline).
  if (saved) {
    const away = Date.now() - saved.savedAt;
    if (away > 5000) game.fastForward(away);
  }
  if (game.state.counters.harvests === undefined || game.state.counters.harvests === 0) pip.say('hello', 'wave');

  // Saves: every 10 seconds, when hidden, and on the way out.
  const save = (final = false) => {
    if (!(window as unknown as { __sproutNoSave?: boolean }).__sproutNoSave) writeSave(game.state, final);
  };
  setInterval(save, 10000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });
  window.addEventListener('pagehide', () => save(true));

  // The loop. Long gaps (a hidden tab) count as time away.
  let last = performance.now();
  let wall = Date.now();
  app.ticker.add(() => {
    const now = performance.now();
    const nowWall = Date.now();
    const gapWall = nowWall - wall;
    wall = nowWall;
    let dtMs = now - last;
    last = now;
    if (gapWall > 10000) {
      game.fastForward(gapWall);
      dtMs = 16;
    } else game.tick(Math.min(dtMs, 1000));
    const dt = Math.min(dtMs, 100) / 1000;

    coinBudget = Math.min(6, coinBudget + dt * 8);
    if (spaceHeld) {
      spaceT += dt;
      while (spaceT >= 1 / 6) {
        spaceT -= 1 / 6;
        keyTap();
      }
    }
    while (queue.length) onEvent(queue.shift()!);
    if (!pip.hasSeen('first_harvest') && (game.state.counters.harvests ?? 0) >= 1) pip.say('first_harvest');
    if (game.spurtReady() && !pip.hasSeen('spurt')) pip.say('spurt', 'surprised');

    clock.update(dt);
    tower.place(view.w);
    backdrop.update(tower.y, tower.x);
    visitors.update(dt);
    hud.update(dt);
    panel?.update(dt);

    // Screen shake moves everything but the overlay by whole pixels.
    if (shakeLeft > 0) {
      shakeLeft -= dt;
      const a = Math.ceil(shakeAmt * Math.max(0, shakeLeft) * 4) > 0 ? shakeAmt : 0;
      root.position.set(Math.round((Math.random() - 0.5) * 2 * a), Math.round((Math.random() - 0.5) * 2 * a));
      if (shakeLeft <= 0) {
        root.position.set(0, 0);
        shakeAmt = 0;
      }
    }
  });

  // A small debug bridge for tests and playtests.
  (window as unknown as { __sprout: unknown }).__sprout = {
    game,
    give: (coins: number) => {
      game.state.worlds[0]!.coins = game.state.worlds[0]!.coins.add(coins);
    },
    tower,
    hud,
    hooks: session.hooks,
    view: () => view,
    /** Drops every queued chest reveal (screenshot runs). */
    skipReveals: () => {
      for (const r of reveals.splice(0)) r.destroy({ children: true });
    },
    save,
  };
}

boot().catch((err) => {
  console.error(err);
  setBoot(`Something went wrong: ${String(err)}`);
});
