/**
 * The simulated player. It drives the game only through `dispatch`, the same
 * commands the real UI will send, and reads only what a player can see.
 *
 * Buying follows the rule of GDD 17.6: of everything on offer, take the one
 * with the lowest wait plus payback time. Replant and Festival timing follow
 * the same section. Everything the GDD leaves to the player (seats, planters,
 * skills, shops, research) uses simple fixed rules that are listed in
 * docs/balance/REPORT.md, "How the simulated players decide".
 */
import {
  Num, RARITY_ORDER, managerProfit, milestoneCount, nextMilestone, weatherGroupOf,
  type Command, type Game, type ManagerDef, type PlantDef,
  type AbilityInfo,
} from '@sprout/core';
import type { PlayStyle, Profile } from './profiles';

const lg = (n: Num): number => (n.mantissa > 0 ? n.log10() : Number.NEGATIVE_INFINITY);

interface Candidate {
  score: number;
  affordable: boolean;
  commands: Command[];
}

const BOOST_KINDS = new Set(['buff', 'heatOrSpeed']);
const TAP_KINDS = new Set(['comboLock', 'guaranteedCrits', 'tapBoost', 'fillSpurt', 'startSpurt']);
const HEIRLOOM_PICKS = ['artifact.golden_watering_can', 'artifact.sandglass_of_seasons', 'artifact.whetstone_of_plenty', 'artifact.clover_locket', 'artifact.rainbow_sprinkler', 'artifact.golden_rope_coil'];

/**
 * How much slower a new player is than perfect play (GDD 17.6: about half speed
 * at first). Stages by play time: the first 2 minutes, to 10 minutes, to the
 * end of the first hour, afterwards. The numbers are fitted so that the game
 * with every content system off lands on the GDD's first-hour table.
 */
const FRICTION_UNTIL = [120, 600, 3600];
/** Purchases and claims per second. */
const FRICTION_ACTIONS = [0.3, 0.35, 0.4, 2];
/** Share of the tap rate actually landed. */
const FRICTION_TAPS = [0.3, 0.35, 0.35, 1];
function frictionStage(playTime: number): number {
  for (let i = 0; i < FRICTION_UNTIL.length; i++) if (playTime < FRICTION_UNTIL[i]!) return i;
  return FRICTION_UNTIL.length;
}

export class Bot {
  /** Purchases and claims made so far. */
  actions = 0;
  /** Play time of the last purchase or claim. */
  lastActionAt = 0;
  /** The longest stretch of open-game time with nothing bought or claimed. */
  longestQuiet = { seconds: 0, endedAtPlay: 0, endedAt: 0 };
  /** Replants forced by the six-hour rule rather than by the Compost rule. */
  valveReplants = 0;
  /** Seconds of tapping, and taps sent, per world (for the tap-value table). */
  tapSeconds = 0;

  private budget = 4;
  private n = 0;
  private sessionT = 0;
  private sessionLen = 0;
  private rate: Num[];
  private lastLife: Num[];
  private seatsDirty = true;
  private cardsDirty = true;
  private visitorAcc = 0;
  private twistAcc = 0;
  private fairAcc = 0;
  private sunriseSeen = false;
  private readonly decided = new WeakSet<object>();
  private readonly human: boolean;
  private readonly off: Set<string>;

  constructor(
    readonly g: Game,
    readonly profile: Profile,
    readonly style: PlayStyle,
    private readonly maxWorld: number,
  ) {
    this.human = style.skill === 'human';
    this.off = new Set(style.off);
    this.rate = g.state.worlds.map(() => Num.ZERO);
    this.lastLife = g.state.worlds.map((w) => w.lifetime);
    g.on((e) => {
      switch (e.type) {
        case 'cardNew':
        case 'cardLevel':
        case 'chestOpened':
        case 'benchDone':
        case 'heirloomNew':
        case 'star':
          this.cardsDirty = true;
          this.seatsDirty = true;
          break;
        case 'floorOpened':
        case 'replant':
        case 'festival':
        case 'worldReached':
        case 'unlock':
        case 'researchDone':
          this.seatsDirty = true;
          break;
      }
    });
  }

  // ------------------------------------------------------------- the session

  sessionStart(lengthSec: number): void {
    const g = this.g;
    const s = g.state;
    this.sessionT = 0;
    this.sessionLen = lengthSec;
    this.lastLife = s.worlds.map((w) => w.lifetime);
    this.budget = Math.max(this.budget, 4);
    // A returning player looks in on every world with a waiting queue before settling on the frontier.
    const frontier = this.frontier();
    for (let w = 0; w < s.worlds.length; w++) {
      const ws = s.worlds[w]!;
      if (!ws.unlocked || w === frontier) continue;
      if (g.content.worlds[w]!.twist === 'customers' && ws.customerQueue > 0) {
        g.dispatch({ type: 'focus', world: w });
        g.dispatch({ type: 'serveCustomers', count: ws.customerQueue });
      }
    }
    if (s.focus !== frontier) g.dispatch({ type: 'focus', world: frontier });
    this.meta();
  }

  sessionEnd(): void {
    const g = this.g;
    const s = g.state;
    if (g.content.worlds[s.focus]!.twist === 'bubbles' && s.worlds[s.focus]!.bank.gt(0)) g.dispatch({ type: 'popBubbles' });
    this.meta();
  }

  /** Call after every `game.advance(dt)` while the game is open. */
  tick(dt: number): void {
    const g = this.g;
    const s = g.state;
    const p = this.profile;
    this.n++;
    this.sessionT += dt;
    if (this.human) {
      const perSec = FRICTION_ACTIONS[frictionStage(s.playTime)]!;
      this.budget = Math.min(6, this.budget + perSec * dt);
    }
    this.trackIncome(dt);

    const focus = this.frontier();
    if (s.focus !== focus) g.dispatch({ type: 'focus', world: focus });

    const tapping = p.tapShare > 0 && this.sessionT <= this.sessionLen * p.tapShare + 1e-9;
    if (tapping) this.tap(dt);
    else this.harvestByHand(dt);

    if (!this.off.has('visitors')) this.catchVisitors();
    if (!this.off.has('twists')) this.twist(tapping);
    if (this.n % 2 === 0 && !this.off.has('abilities')) this.abilities(tapping);
    if (tapping && !this.off.has('spurt') && !this.holdSpurt() && g.spurtReady()) g.dispatch({ type: 'startSpurt' });

    this.spend(focus, this.human ? 4 : 12);
    if (this.n % 3 === 0) {
      for (let w = 0; w < s.worlds.length; w++) if (w !== focus && s.worlds[w]!.unlocked) this.spend(w, this.human ? 3 : 8);
    }
    if (this.cardsDirty || this.n % 5 === 0) this.meta();
    if (this.n % 5 === 0) this.resets();
    if (s.fair.active) this.fairStall();

    const quiet = s.playTime - this.lastActionAt;
    if (quiet > this.longestQuiet.seconds) this.longestQuiet = { seconds: quiet, endedAtPlay: s.playTime, endedAt: s.time };
  }

  private frontier(): number {
    const worlds = this.g.state.worlds;
    for (let w = worlds.length - 1; w >= 0; w--) if (worlds[w]!.unlocked) return w;
    return 0;
  }

  private canAct(): boolean {
    return !this.human || this.budget >= 1;
  }

  private act(cmd: Command): boolean {
    if (!this.canAct()) return false;
    if (!this.g.dispatch(cmd)) return false;
    if (this.human) this.budget -= 1;
    this.actions++;
    this.lastActionAt = this.g.state.playTime;
    return true;
  }

  private trackIncome(dt: number): void {
    const s = this.g.state;
    const a = Math.min(1, dt / 15);
    for (let w = 0; w < s.worlds.length; w++) {
      const ws = s.worlds[w]!;
      if (!ws.unlocked) continue;
      const life = ws.lifetime;
      const inc = life.gte(this.lastLife[w]!) ? life.sub(this.lastLife[w]!) : life;
      this.rate[w] = this.rate[w]!.mul(1 - a).add(inc.mul(a / dt));
      this.lastLife[w] = life;
    }
  }

  // ---------------------------------------------------------------- tapping

  private tapEfficiency(): number {
    if (!this.human) return 1;
    const t = this.g.state.playTime;
    return FRICTION_TAPS[frictionStage(t)]!;
  }

  private tap(dt: number): void {
    const g = this.g;
    const s = g.state;
    const count = this.style.tapRate * dt * this.tapEfficiency();
    this.tapSeconds += dt;
    if (s.fair.active && s.fair.step < g.content.fairSteps.length && this.profile.fairTapShare > 0) {
      this.fairAcc += this.profile.fairTapShare;
      if (this.fairAcc >= 1) {
        this.fairAcc -= 1;
        g.dispatch({ type: 'fairTap', count });
        return;
      }
    }
    g.dispatch({ type: 'tap', count });
  }

  /** Not tapping: the player still clicks a floor that is waiting, at most once a second. */
  private harvestByHand(dt: number): void {
    const g = this.g;
    const s = g.state;
    const ws = s.worlds[s.focus]!;
    let clicks = 0;
    for (const f of ws.floors) if (f.level > 0 && f.ready && !f.hired) clicks++;
    if (clicks > 0) g.dispatch({ type: 'tap', count: Math.min(clicks, Math.max(1, Math.floor(dt))) });
  }

  private catchVisitors(): void {
    const g = this.g;
    const s = g.state;
    for (let i = s.visitors.length - 1; i >= 0; i--) {
      const v = s.visitors[i]!;
      if (this.decided.has(v)) continue;
      this.decided.add(v);
      this.visitorAcc += this.profile.visitorShare;
      if (this.visitorAcc >= 1 - 1e-9) {
        this.visitorAcc -= 1;
        g.dispatch({ type: 'catchVisitor', index: i });
      }
    }
  }

  private twist(tapping: boolean): void {
    const g = this.g;
    const s = g.state;
    const t = g.t;
    const w = s.focus;
    const ws = s.worlds[w]!;
    const kind = g.content.worlds[w]!.twist;
    const attending = tapping || this.sessionT <= this.sessionLen * Math.max(this.profile.twistShare, 0.25);
    if (kind === 'customers') {
      if (attending && ws.customerQueue > 0) g.dispatch({ type: 'serveCustomers', count: Math.min(ws.customerQueue, t.CUSTOMER_SERVE_RATE) });
    } else if (kind === 'bubbles') {
      if (attending && ws.bankClock >= t.BUBBLE_CAP_SECONDS - 3) g.dispatch({ type: 'popBubbles' });
    } else if (kind === 'sunrise') {
      if (ws.sunriseWindow > 0) {
        if (!this.sunriseSeen) {
          this.sunriseSeen = true;
          this.twistAcc += this.profile.twistShare;
          if (this.twistAcc >= 1 - 1e-9) {
            this.twistAcc -= 1;
            g.dispatch({ type: 'catchSunrise' });
          }
        }
      } else this.sunriseSeen = false;
    }
  }

  // -------------------------------------------------------------- abilities

  /** In burst play the Growth Spurt waits when the next wave of boosts is under a minute away. */
  private holdSpurt(): boolean {
    if (!this.style.burst) return false;
    const boosts = this.usable().filter((a) => BOOST_KINDS.has(a.ability.kind));
    if (boosts.length < 2) return false;
    const soon = boosts.filter((a) => a.readyIn <= 60).length;
    const ready = boosts.filter((a) => a.ready).length;
    return soon >= Math.ceil(boosts.length * 0.75) && ready < Math.ceil(boosts.length * 0.75);
  }

  private abilities(tapping: boolean): void {
    const g = this.g;
    const s = g.state;
    const all = this.usable();
    if (all.length === 0) return;
    const focus = s.focus;
    const use = (id: string, worlds: number[]): void => {
      g.dispatch({ type: 'useAbility', id, world: worlds.includes(focus) ? focus : worlds[0] });
    };
    let wave = false;
    if (this.style.burst) {
      const boosts = all.filter((a) => BOOST_KINDS.has(a.ability.kind));
      const ready = boosts.filter((a) => a.ready);
      const spurtOk = !tapping || g.spurtReady() || g.spurtActive(focus) !== undefined || s.unlocked['feature.spurt'] === undefined;
      wave = ready.length > 0 && ready.length >= Math.ceil(boosts.length * 0.75) && spurtOk;
      if (wave) {
        for (const a of ready) use(a.ability.id, a.worlds);
        if (tapping && g.spurtReady()) g.dispatch({ type: 'startSpurt' });
      }
    }
    const onCooldown = all.filter((a) => !a.ready).length;
    for (const a of all) {
      if (!a.ready) continue;
      const k = a.ability.kind;
      if (BOOST_KINDS.has(k)) {
        if (!this.style.burst) use(a.ability.id, a.worlds);
        continue;
      }
      if (this.style.burst && !wave && (k === 'lumpSum' || k === 'guaranteedCrits' || k === 'tapBoost' || k === 'timeSkip')) continue;
      if (!tapping && TAP_KINDS.has(k)) continue;
      if (k === 'chestLuckNext') continue; // used when a good chest is opened
      if (k === 'resetCooldowns' && onCooldown < 3) continue;
      if (k === 'fillSpurt' && (g.spurtActive(focus) || s.spurtMeter >= g.derived.worlds[focus]!.spurtTaps * 0.6)) continue;
      if (k === 'startSpurt' && g.spurtActive(focus)) continue;
      use(a.ability.id, a.worlds);
    }
  }

  /** The abilities whose buttons are on screen: the four of the world in view, and the carried heirlooms'. */
  private usable(): AbilityInfo[] {
    const focus = this.g.state.focus;
    return this.g.abilities().filter((a) => a.ownerKind !== 'manager' || a.worlds.includes(focus));
  }

  // ----------------------------------------------------------------- buying

  /** Value of an unmanaged floor's output next to a managed one, for this player. */
  private unmanagedValue(): number {
    return this.profile.harvestShare;
  }

  private spend(w: number, maxBuys: number): void {
    const g = this.g;
    const s = g.state;
    const t = g.t;
    const ws = s.worlds[w]!;
    const def = g.content.worlds[w]!;
    const wd = g.derived.worlds[w]!;
    const lowValue = this.unmanagedValue();
    let buys = 0;
    while (buys < maxBuys && this.canAct()) {
      if (g.canBuyTicket(w)) {
        this.act({ type: 'buyTicket', world: w });
        buys++;
        continue;
      }
      const coins = ws.coins;
      const steadyAll = g.steadyIps(w);
      const lSteady = lg(steadyAll);
      let lr = Math.max(lg(this.rate[w]!), lg(g.managedIps(w, 'steady')), lSteady + Math.log10(lowValue));
      if (!Number.isFinite(lr)) lr = -3;
      const real = Math.min(1e4, Math.max(lowValue, 10 ** (lr - lSteady)));
      const lReal = Math.log10(real);

      // Saving for the ticket: nothing with a payback longer than the wait for it.
      let horizon = Infinity;
      const next = w + 1;
      const nextDef = g.content.worlds[next];
      if (def.ticket && next < this.maxWorld && nextDef && !s.worlds[next]!.unlocked && g.topFloorOpen(w)) {
        const deedOk = nextDef.deedRibbons <= 0 || g.derived.global.specials[`deed.w${next + 1}`];
        if (deedOk) horizon = coins.gte(def.ticket) ? 0 : 10 ** (lg(def.ticket.sub(coins)) - lr);
      }

      let best: Candidate | null = null;
      const consider = (cost: Num, gain: Num, commands: Command[]): void => {
        const lGain = lg(gain) + lReal;
        if (!Number.isFinite(lGain)) return;
        const payback = 10 ** (lg(cost) - lGain);
        if (payback > horizon) return;
        const affordable = coins.gte(cost);
        const wait = affordable ? 0 : 10 ** (lg(cost.sub(coins)) - lr);
        const score = wait + payback;
        if (!best || score < best.score) best = { score, affordable, commands };
      };

      const n = ws.floors.length;
      const nextFloor = g.nextFloor(w);
      const allOpen = nextFloor < 0;
      let min = Infinity;
      let second = Infinity;
      let atMin = 0;
      for (const f of ws.floors) {
        if (f.level < min) {
          second = min;
          min = f.level;
          atMin = 1;
        } else if (f.level === min) atMin++;
        else if (f.level < second) second = f.level;
      }
      const canHire = s.unlocked['feature.managers'] !== undefined;
      const towerTarget = allOpen ? nextMilestone(min, t) : 0;
      let towerCost = Num.ZERO;
      let towerGain = Num.ZERO;
      const towerCommands: Command[] = [];

      for (let i = 0; i < n; i++) {
        const f = ws.floors[i]!;
        if (f.level <= 0) continue;
        const fc = g.floorInfo(w, i);
        const value = fc.managed ? 1 : lowValue;
        const base = fc.ipsSteady;
        const L = f.level;
        const ms = milestoneCount(L, t);
        const toNext = nextMilestone(L, t) - L;
        const most = g.maxLevels(w, i, coins);
        const counts = most > 1 && most !== toNext ? [1, toNext, most] : [1, toNext];
        for (const k of counts) {
          const factor = ((L + k) / L) * t.MILESTONE_MULT ** (milestoneCount(L + k, t) - ms) - 1;
          let gain = base.mul(factor * value);
          if (allOpen && L === min && atMin === 1) {
            const newMin = Math.min(L + k, second);
            const up = milestoneCount(newMin, t) - milestoneCount(min, t);
            if (up > 0) gain = gain.add(steadyAll.mul(wd.towerMult ** up - 1));
          }
          consider(g.levelsCost(w, i, k), gain, [{ type: 'buyLevels', world: w, floor: i, count: k }]);
        }
        if (allOpen && L < towerTarget) {
          const k = towerTarget - L;
          towerCost = towerCost.add(g.levelsCost(w, i, k));
          towerGain = towerGain.add(base.mul((((L + k) / L) * t.MILESTONE_MULT ** (milestoneCount(L + k, t) - ms) - 1) * value));
          towerCommands.push({ type: 'buyLevels', world: w, floor: i, count: k });
        }
        const mgr = def.floors[i]!.manager;
        if (!f.hired && canHire && s.cards[mgr.id]) {
          const mult = managerProfit(mgr.rarity, s.cards[mgr.id]!.level, g.derived.global.managerPower, t);
          consider(g.hireFee(w, i), base.mul(Math.max(0.05, mult - value)), [{ type: 'hire', world: w, floor: i }]);
        }
      }
      if (towerCommands.length > 1) {
        // The whole tower to the next tower milestone, as one purchase.
        consider(towerCost, towerGain.add(steadyAll.add(towerGain).mul(wd.towerMult - 1)), towerCommands);
      }
      if (!allOpen) {
        const fdef = def.floors[nextFloor]!;
        const fd = wd.floors[nextFloor]!;
        const ips = fdef.basePayout.div(fdef.baseCycleSec).mul(g.derived.global.passive).mul(fd.profit * fd.speed * (1 + fd.doubleChance));
        consider(fdef.openCost, ips.mul(lowValue), [{ type: 'openFloor', world: w }]);
        // Opening the floor and hiring its manager, as one purchase. A manager not met yet starts at level 1.
        const card = fdef.manager;
        if (canHire) {
          const mult = managerProfit(card.rarity, s.cards[card.id]?.level ?? 1, g.derived.global.managerPower, t);
          consider(fdef.openCost.add(g.hireFee(w, nextFloor)), ips.mul(mult), [{ type: 'openFloor', world: w }]);
        }
      }

      const pick = best as Candidate | null;
      if (!pick || !pick.affordable) break;
      let done = false;
      for (const c of pick.commands) done = this.g.dispatch(c) || done;
      if (!done) break;
      if (this.human) this.budget -= 1;
      this.actions++;
      this.lastActionAt = s.playTime;
      buys++;
    }
  }

  // ------------------------------------------------------- Replant, Festival

  private resets(): void {
    const g = this.g;
    const s = g.state;
    if (g.canFestival()) {
      const pending = g.pendingRibbons();
      if (s.festivals === 0 || pending.gte(s.ribbonsClaimed.mul(this.style.festivalFrac).max(5))) {
        if (this.act({ type: 'festival' })) {
          this.seatsDirty = true;
          this.rate = s.worlds.map(() => Num.ZERO);
          this.lastLife = s.worlds.map((w) => w.lifetime);
          return;
        }
      }
    }
    for (let w = 0; w < s.worlds.length; w++) {
      if (!s.worlds[w]!.unlocked || !g.canReplant(w)) continue;
      const pending = g.pendingCompost(w);
      const first = g.counter('replants') === 0;
      const rule = first || pending.gte(s.compostEra.mul(this.style.replantFrac).max(25));
      // The designer's script also Replants a stale run: six hours old with a fifth of the era's Compost pending.
      const stale = !first && pending.gte(s.compostEra.mul(0.2).max(25)) && s.time - s.worlds[w]!.runStartedAt >= 6 * 3600;
      if (!rule && !stale) continue;
      // Do not throw away a ticket that is nearly paid for.
      if (this.ticketSoon(w)) continue;
      if (this.act({ type: 'replant', world: w })) {
        if (!rule) this.valveReplants++;
        this.rate[w] = Num.ZERO;
        this.lastLife[w] = s.worlds[w]!.lifetime;
      }
    }
  }

  /** True when this world's ticket can be bought within ten minutes at the current rate. */
  private ticketSoon(w: number): boolean {
    const g = this.g;
    const s = g.state;
    const def = g.content.worlds[w]!;
    const next = w + 1;
    const nextDef = g.content.worlds[next];
    if (!def.ticket || next >= this.maxWorld || !nextDef || s.worlds[next]!.unlocked) return false;
    if (nextDef.deedRibbons > 0 && !g.derived.global.specials[`deed.w${next + 1}`]) return false;
    const coins = s.worlds[w]!.coins;
    if (coins.gte(def.ticket)) return true;
    const lr = Math.max(lg(this.rate[w]!), lg(g.managedIps(w, 'steady')));
    return 10 ** (lg(def.ticket.sub(coins)) - lr) < 600;
  }

  // ---------------------------------------------------- collection and shops

  private meta(): void {
    const g = this.g;
    const s = g.state;
    const c = g.content;
    this.cardsDirty = false;

    // Chests, best first. Abracadabra doubles the luck of a Golden Chest or better.
    const chests = Object.keys(s.chests)
      .filter((id) => (s.chests[id] ?? 0) > 0)
      .sort((a, b) => (c.chests.get(b)?.tier ?? 0) - (c.chests.get(a)?.tier ?? 0));
    for (const id of chests) {
      if (this.off.has('chests')) break;
      while ((s.chests[id] ?? 0) > 0 && this.canAct()) {
        if ((c.chests.get(id)?.tier ?? 0) >= 4 && !s.luckDoubleNext) g.dispatch({ type: 'useAbility', id: 'ability.abracadabra' });
        if (!this.act({ type: 'openChest', chest: id })) break;
      }
    }
    if (s.basketStored > 0) this.act({ type: 'collectBasket' });

    // Card and heirloom levels cost copies only, so every one that can be bought is bought.
    for (const id of Object.keys(s.cards)) {
      if (this.off.has('cardLevels')) break;
      const def = c.cards.get(id)!;
      let own = s.cards[id]!;
      while (own.level < def.maxLevel && own.copies >= def.dupes[own.level - 1]! && this.act({ type: 'levelCard', id })) own = s.cards[id]!;
    }
    for (const id of Object.keys(s.heirlooms)) {
      const def = c.artifactById.get(id)!;
      const own = s.heirlooms[id]!;
      while (own.level < def.maxLevel && own.copies >= def.dupes[own.level - 1]! && this.act({ type: 'levelHeirloom', id })) {
        /* level again */
      }
    }
    while (s.heirloomPicks > 0) {
      const pick = HEIRLOOM_PICKS.find((id) => !s.heirlooms[id]) ?? HEIRLOOM_PICKS[0]!;
      if (!this.act({ type: 'pickHeirloom', id: pick })) break;
    }
    if (!this.off.has('heirlooms')) this.equip();

    if (this.seatsDirty) {
      this.seatsDirty = false;
      for (let w = 0; w < s.worlds.length; w++) {
        if (!s.worlds[w]!.unlocked) continue;
        if (!this.off.has('plants')) this.planters(w);
      }
    }

    while (s.skillPoints > 0 && !this.off.has('skills')) {
      const id = this.profile.skillOrder.find((k) => g.canBuySkill(k));
      if (!id || !this.act({ type: 'skill', id })) break;
    }

    // Research: the cheapest project that can start.
    for (;;) {
      let pick: string | null = null;
      let cost = Infinity;
      for (const r of c.research) {
        if (this.off.has('research')) break;
        if (r.cost < cost && g.canResearch(r.id)) {
          pick = r.id;
          cost = r.cost;
        }
      }
      if (!pick || !this.act({ type: 'research', id: pick })) break;
    }

    // Compost Shop: the cheapest level on offer, until the Compost runs out.
    for (;;) {
      let pick: string | null = null;
      let cost: Num | null = null;
      for (const row of c.compostShop) {
        if (this.off.has('shopExtras') && row.id !== 'shop.compost.rich_soil') continue;
        if (this.off.has(row.id)) continue;
        const price = g.compostShopCost(row.id);
        if (price && s.compost.gte(price) && (!cost || price.lt(cost))) {
          pick = row.id;
          cost = price;
        }
      }
      if (!pick || !this.act({ type: 'buyCompostShop', id: pick })) break;
    }

    // Ribbon Shop: Golden Hour and the Auto-Gardener, then a deed that opens the next world, then the cheapest.
    if (s.festivals > 0) {
      for (;;) {
        const first = ['shop.ribbon.golden_hour', 'shop.ribbon.auto_gardener'].find((id) => (s.ribbonShop[id] ?? 0) === 0);
        let pick: string | null = null;
        let cost: Num | null = null;
        for (const row of c.ribbonShop) {
          if (this.off.has(row.id)) continue;
          const price = g.ribbonShopCost(row.id);
          if (!price || s.ribbons.lt(price)) continue;
          const deed = row.special?.startsWith('deed.w') ? Number(row.special.slice(6)) : 0;
          if (deed > this.maxWorld) continue;
          if (row.id === first || (deed > 0 && !first && s.worldReached >= deed - 1)) {
            pick = row.id;
            break;
          }
          if (first) continue;
          if (!cost || price.lt(cost)) {
            pick = row.id;
            cost = price;
          }
        }
        if (!pick || !this.act({ type: 'buyRibbonShop', id: pick })) break;
      }
    }

    // Pollen: bench jobs first, then copies of the best manager that still has levels to gain.
    for (const p of c.plants) {
      if (p.source === 'chest' || !p.launch) continue;
      if (g.canBench(p.id)) this.act({ type: 'bench', plantId: p.id });
    }
    if (s.pollen > 3000) {
      const target = c.managers
        .filter((m) => m.rarity !== 'exotic' && s.cards[m.id] && s.cards[m.id]!.level < m.maxLevel)
        .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity])[0];
      if (target) while (s.pollen > 3000 && this.act({ type: 'buyCopy', id: target.id })) this.cardsDirty = true;
    }

    // Gems: a Golden Chest in the first week, Crystal Chests after that.
    const want = s.time < 7 * 86400 ? 'chest.golden' : 'chest.crystal';
    while (s.gems >= g.t.GEM_CHEST_COST[want === 'chest.golden' ? 'golden' : 'crystal'] && this.act({ type: 'buyChest', chest: want })) this.cardsDirty = true;

    // The Auto-Gardener is switched off while a ticket is close, so the coins can pile up.
    if (g.derived.global.specials['unlock.auto_gardener']) {
      let saving = false;
      for (let w = 0; w < s.worlds.length; w++) if (s.worlds[w]!.unlocked && this.ticketSoon(w)) saving = true;
      if (s.autoBuy === saving) g.dispatch({ type: 'setAutoBuy', on: !saving });
    }
  }

  private heirloomScore(id: string): number {
    const g = this.g;
    const def = g.content.artifactById.get(id)!;
    const own = g.state.heirlooms[id]!;
    const tapW = this.profile.tapWeight;
    const offW = this.profile.offlineWeight;
    let v = 0;
    for (const p of def.passives) {
      const x = Math.abs(p.value);
      switch (p.stat) {
        case 'floor.profit': v += x; break;
        case 'floor.speed': v += x; break;
        case 'floor.levelCost': v += x * 1.5; break;
        case 'floor.doubleChance': v += x; break;
        case 'manager.power': v += x; break;
        case 'tap.power': v += x * tapW; break;
        case 'tap.critChance': v += x * 7 * tapW; break;
        case 'tap.critMult': v += x * 0.025 * tapW; break;
        case 'offline.earnings': v += x * offW; break;
        case 'offline.cap': v += 0.1 * offW; break;
        case 'spurt.duration': v += 0.03 * x * tapW; break;
        case 'spurt.tapsNeeded': v += x * tapW; break;
        default: v += 0.05;
      }
    }
    return v * (1 + g.t.HEIRLOOM_PER_LEVEL * (own.level - 1)) + (def.ability ? 0.15 : 0);
  }

  private equip(): void {
    const g = this.g;
    const s = g.state;
    if (s.unlocked['feature.heirlooms'] === undefined) return;
    const slots = g.derived.global.heirloomSlots;
    const best = Object.keys(s.heirlooms)
      .sort((a, b) => this.heirloomScore(b) - this.heirloomScore(a))
      .slice(0, slots);
    const same = best.length === s.equipped.length && best.every((id) => s.equipped.includes(id));
    if (!same) this.act({ type: 'equip', heirlooms: best });
  }

  /** Floors of a world from most to least valuable at their current level. */
  private floorOrder(w: number): number[] {
    const g = this.g;
    const ws = g.state.worlds[w]!;
    const def = g.content.worlds[w]!;
    const value = (i: number): number => {
      const f = ws.floors[i]!;
      const fdef = def.floors[i]!;
      const L = Math.max(1, f.level);
      return lg(fdef.basePayout) + Math.log10((L * 2 ** milestoneCount(L, g.t)) / fdef.baseCycleSec) - (f.level > 0 ? 0 : 3);
    };
    return ws.floors.map((_, i) => i).sort((a, b) => value(b) - value(a));
  }

  private planters(w: number): void {
    const g = this.g;
    const s = g.state;
    const t = g.t;
    if (s.unlocked['feature.plants'] === undefined) return;
    const ws = s.worlds[w]!;
    const def = g.content.worlds[w]!;
    const per = g.derived.global.planters;
    const owned = g.content.plants.filter((p) => s.cards[p.id]);
    const score = (p: PlantDef): number => t.RARITY_FACTOR[p.rarity] * (1 + t.TRAIT_PER_LEVEL * (s.cards[p.id]!.level - 1)) * (p.traitDefs.length > 1 ? 1.4 : 1);
    const used = new Set<string>();
    const plan: string[][] = ws.floors.map(() => []);
    const order = this.floorOrder(w);
    const weather = def.twist === 'weather';
    for (let slot = 0; slot < per; slot++) {
      for (const i of order) {
        const fam = def.floors[i]!.favouredFamily;
        const groups = new Set(plan[i]!.map((id) => weatherGroupOf((g.content.cards.get(id) as PlantDef).family, t)));
        let best: PlantDef | null = null;
        let bestScore = 0;
        for (const p of owned) {
          if (used.has(p.id)) continue;
          let v = score(p) * (fam === 'wild' || fam === p.family ? t.AFFINITY_BONUS : 1);
          // Papaya Cay: a second plant from a new weather group is worth more than a second from the same one.
          if (weather && slot > 0 && !groups.has(weatherGroupOf(p.family, t))) v *= 1.6;
          if (v > bestScore) {
            best = p;
            bestScore = v;
          }
        }
        if (best) {
          plan[i]!.push(best.id);
          used.add(best.id);
        }
      }
    }
    for (const i of order) {
      const now = ws.floors[i]!.plants;
      const want = plan[i]!;
      if (now.length === want.length && now.every((id, k) => id === want[k])) continue;
      g.dispatch({ type: 'plant', world: w, floor: i, plants: want });
    }
  }

  // --------------------------------------------------------- weekend stall

  private fairStall(): void {
    const g = this.g;
    const f = g.state.fair;
    if (this.n % 3 !== 0) return;
    for (let k = 0; k < 6; k++) {
      let bought = false;
      for (let i = g.t.FAIR_FLOORS - 1; i >= 0; i--) {
        const level = f.levels[i] ?? 0;
        if (level <= 0) {
          const open = g.fairCost(i, 1);
          if (open && f.coins.gte(open)) bought = g.dispatch({ type: 'fairBuy', floor: i, count: 1 }) || bought;
          continue;
        }
        const toNext = nextMilestone(level, g.t) - level;
        const cost = g.fairCost(i, toNext);
        if (cost && f.coins.gte(cost)) bought = g.dispatch({ type: 'fairBuy', floor: i, count: toNext }) || bought;
        else {
          const one = g.fairCost(i, 1);
          if (one && f.coins.gte(one.mul(4))) bought = g.dispatch({ type: 'fairBuy', floor: i, count: 1 }) || bought;
        }
      }
      if (!bought) break;
    }
  }
}
