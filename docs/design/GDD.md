# Sprout Tower: Game Design Document

Version 0.3, Phase 0. Version 0.2 passed the independent design audit. Version 0.3 gives every floor one fixed manager, on Lawson's decision of 2026-11-25. Owner: Game Designer thread. Companion files: [AUDIT.md](AUDIT.md) (why the premise changed), [CONTENT.md](CONTENT.md) (every content row: floors, managers, plants, heirlooms, skills, research, shops, quests, achievements) and [CHANGES.md](CHANGES.md) (every rule and number that changed from version to version, for the balance simulator and the engine).

## 0. How to read this document

- **Rules and formulas live here. Rows live in CONTENT.md.** If the two ever disagree, this file wins for rules and CONTENT.md wins for row values.
- **Every tunable number has a constant name** in `CODE_STYLE`. Appendix A lists all of them in one table. The simulator and the game should read these names from data, not hard-code them.
- **Numbers are big numbers** (mantissa and exponent). Nothing is rounded internally except where a formula says `floor`. Display rounding is a UI matter.
- **"Profit"** means a multiplier on a floor's payout. **"Speed"** means a multiplier on how fast a floor's cycle runs. **"IPS"** means income per second.
- **Scopes.** An effect is `floor` (one floor), `world` (every floor in one world), or `global` (everything).
- **Names are defaults.** The Writer may polish names and the Art Director owns how everything looks. Ids are stable.
- Section 13 says exactly how bonuses stack. Read it before implementing any multiplier. Section 13.5 is the one rule for everything that lasts a set time.
- Section 17.6 separates what a rough pacing script has checked from what is still a first guess.

## 1. Vision and pillars

**One line:** grow a single windowsill planter into a hemp and herb brand that reaches the stars, one satisfying tap at a time.

**Feel priority:** Clicker, then RPG, then Idle. When two features compete, the one higher in this order wins.

| # | Pillar | What it means in practice | Test |
|---|---|---|---|
| 1 | **Every tap is a treat** | Tapping pays for the whole game and has its own toys: Combo, Bumper taps, Growth Spurts, Golden Sprouts | A player with every floor automated still wants to tap |
| 2 | **Collect, plant, combine** | Managers, plants and heirlooms are a collection you build a tower out of. Every floor has its own manager to hire and level up. Where the plants and heirlooms go is the player's choice, and it matters | Two players at the same stage have different-looking towers |
| 3 | **Always something sprouting** | Leave for an hour or a night and something good is waiting: earnings, research, a basket, a bench job | Coming back always has a reward within five seconds |
| 4 | **One new thing at a time** | The game starts with one button. Every system arrives alone, with a reason | A new player understands the loop in 60 seconds |
| 5 | **Cozy and a bit absurd** | Warm, funny, kind. Nothing is taken from the player. Hemp is a farm crop and nothing else | A grandparent and a ten-year-old can both play it |

## 2. Tone and guardrails

### 2.1 Tone

Wholesome garden comedy. Puns, gentle absurdity, proud gardeners and plants that are slightly magical. The player is the Head Gardener of Sprout Tower. The guide is **Pip**, a talkative seedling. A light comic foil, **Baron Fauxliage**, sells plastic plants and loses at every Harvest Festival. He is never mean.

### 2.2 Hard rules

1. Hemp means industrial hemp: a legal, non-intoxicating farm crop grown for fibre and seed. It is shown as tall field rows of cane-like stalks and as finished goods. `docs/art/HEMP_ART.md` owns how it is drawn.
2. Hemp goods in the game: rope, twine, canvas, sailcloth, clothing, paper and notebooks, hempcrete building blocks, hemp-seed snacks, hemp-seed cooking oil, soap and lotion.
3. No smoking, no intoxication, no drug references or jokes, no slang, no real cultivation instructions, in any text, art or sound.
4. No real brands, people or likenesses. Nothing from Cash, Inc. except mechanics.
5. No real-money purchases. Gems are earned only by playing.
6. Nothing bad ever happens to the player's garden. No pests, blights or losses.
7. No featured number is 420 or 69. Floor 2's base payout is 50 and its first level costs 70 for this reason.

### 2.3 Words for the Writer and Art Director

Some ordinary garden words have a second meaning. The safe word is always used.

| Do not use | Use |
|---|---|
| pot, pots, potted | planter, box, tub |
| weed, weeds, weeding | thistles, tidying, clearing |
| bud | sprout, shoot, bloom |
| strain | variety |
| grow room, grow light | greenhouse, sun lamp |
| extract, tincture, concentrate, resin | soap, lotion, scent, cooking oil |
| edibles, brownies | snacks, granola, seed bars |
| high, baked, lit, blazing, stoned | (no wordplay on these at all) |
| joint, roll, rolling, wrap, wrapping, papers (for paper goods) | notebook, gift paper, kite paper |
| flower (as a hemp product) | fibre, seed, stalk |
| cannabis and every other name for it | hemp |
| essence, still, flask, lab (near hemp, or as a product) | workshop, kettle, soap mould |
| hydro, press, grinder, trim (as names for tools, floors or products) | (not used) |
| mortar, pestle (as a tool, a prop or part of a name) | bowl, birdbath |

The paper workshop makes notebooks, gift paper and kites. The soap floor uses lavender and hemp-seed oil. Hemp is never shown in a laboratory.

## 3. The loops

### 3.1 The first 60 seconds

| Time | The player | The game |
|---|---|---|
| 0:00 | Presses New Game | Pip pops out of a windowsill planter and says hello. Five seconds, skippable |
| 0:05 | Taps the planter | Mint grows in 0.6 s, the room glows "Tap to harvest", a coin flies to the counter. +1 |
| 0:10 | Presses the green level button (4 coins) | The planter now pays 2. The button shows the next price |
| 0:10 to 0:35 | Taps and levels | Coins tick up. At level 25: "Milestone! Twice as fast" |
| about 0:35 | Presses the plate that just turned green (60 coins) | Floor 2 is built in 1.5 s. It pays 50 every 3 s |
| about 1:00 | Opens floor 3 (720 coins) | The Backyard Hemp Patch. Pip explains what hemp is for in one line |

By one minute the player has done the whole core loop three times: **tap, earn, spend, grow.** Nothing else is on screen yet.

### 3.2 Core loop (every few seconds)

```
floor finishes a cycle -> tap to harvest (or the manager does) -> coins
        ^                                                          |
        |                                                          v
   faster / bigger  <-  milestone  <-  buy levels, open floors, hire
```

On top of that loop sits the tap layer. Every tap adds bonus coins, builds Combo, can be a Bumper, and fills the Growth Spurt meter.

### 3.3 Session loop (5 to 30 minutes)

1. Collect what grew while away (offline coins, Insight, Morning Basket, finished research, finished bench jobs).
2. Spend it: levels, floors, hires, a research project, card level-ups.
3. Push toward the next goal on screen: a milestone, a floor, a quest, a chest.
4. Tap through a Growth Spurt or two and catch a Golden Sprout.
5. When the tower slows, **Replant** for Compost, or switch to another world.
6. Queue long things before leaving: research, a pollination job.

### 3.4 Long-term loop (days to weeks)

```
runs -> Replant (Compost) -> faster runs -> world tickets -> new worlds
   \-> cards, plants, heirlooms, skills, research (never reset)
        \-> Harvest Festival (Ribbons) -> everything above, faster, plus deeds to worlds 4 to 6
```

| Layer | Resets | Keeps | Typical length |
|---|---|---|---|
| Run | nothing | everything | 10 to 60 minutes |
| Replant (per world) | that world's coins, floor levels and hires | everything else | several per day |
| Harvest Festival | all worlds' coins, floors, hires, tickets, Compost and Compost Shop | cards, plants, heirlooms, skills, research, achievements, codex, mastery, Gems, Pollen, Insight, Ribbon Shop | every 2 to 4 days |

## 4. Currencies at a glance

Full sources and sinks are in section 18.

| Currency | Scope | Resets on | Role |
|---|---|---|---|
| **Coins** (world 1), **Notes** (2), **Shells** (3), **Snowmarks** (4), **Moonpennies** (5), **Stardust** (6) | one world each | Replant | Floors, levels, hires, world tickets |
| **Gems** | global | never | Chests, time warps, respecs |
| **Compost** | global | Harvest Festival | Passive profit and the Compost Shop |
| **Ribbons** | global | never | Passive profit and the Ribbon Shop |
| **Insight** | global | never | Research |
| **Pollen** | global | never | Cross-pollination and chosen card copies |
| **Skill Points** | global | never (respec allowed) | Skill tree |
| **Fair Tickets** | event only | end of event | Event reward track |

## 5. Floors: the core economy

### 5.1 What a floor is

A floor is one business in the tower. It has a level, its own manager and one to three planters. World 1 has 10 floors. Every later world has 8.

Floor row fields (see CONTENT.md section 1): `worldId, index, id, name, product, favouredFamily, openCost, basePayout, baseCycle, levelBaseCost, growth, hireFee`.

### 5.2 Formulas

For one floor at level `L` (level 1 when opened):

```
milestoneCount(L)   = how many thresholds in MILESTONES are <= L
MILESTONES          = 25, 50, 100, then every 100 (200, 300, 400, ...)

towerMilestoneCount = milestoneCount(lowest level among all floors in this world;
                      a floor that is not open counts as level 0)

speedMult   = MILESTONE_MULT ^ milestoneCount(L)
            x TOWER_MILESTONE_MULT ^ towerMilestoneCount
            x (all speed bonuses, section 13)

rawCycle    = baseCycle / speedMult
cycle       = max(MIN_CYCLE, rawCycle)
overflow    = cycle / rawCycle                (1 unless the cycle is capped)

payout      = basePayout x L x overflow x profitMult      (profitMult: section 13)
floorIPS    = payout / cycle
            = basePayout x L x speedMult x profitMult / baseCycle
```

`MILESTONE_MULT = 2`, `TOWER_MILESTONE_MULT = 1.5`, `MIN_CYCLE = 0.2 s`.

The cycle cap only changes how the floor looks (a full "streaming" bar and bigger payouts). `floorIPS` is the same either way.

**Level cost.** The cost to go from level `L` to `L + 1`:

```
levelCost(L)      = levelBaseCost x growth ^ (L - 1) x costMult
cost of k levels  = levelBaseCost x growth ^ (L - 1) x (growth ^ k - 1) / (growth - 1) x costMult
```

`costMult` is the product of all level-cost discounts (section 13). It never goes below `COST_MULT_FLOOR = 0.25`.

### 5.3 The floor template

Every world's floors come from one template, so the simulator needs only the world parameters in section 14.2.

For floor `n` (1-based) in a world with cost scale `D` and payout taper `T`:

| Field | Floor 1 | Floor 2 | Floor n >= 3 |
|---|---|---|---|
| `openCost` | 0 (free) | `60 x D` | `60 x 12^(n-2) x D` |
| `basePayout` | 1 | 50 | `0.75 x T^(n-3) x 60 x 12^(n-2)` |
| `baseCycle` (s) | 0.6 | 3 | `3 x 2^(n-2)` |
| `levelBaseCost` | `4 x D` | `70 x D` | `1.15 x openCost` |
| `growth` | 1.07 | 1.15 | `1.15 - 0.01 x (n-2)`, so 1.14, 1.13, ... 1.07 at floor 10 |
| `hireFee` | `1,000 x D` | `HIRE_RATIO[n] x openCost` | `HIRE_RATIO[n] x openCost` |

`HIRE_RATIO` for floors 2 to 10: `200, 125, 70, 40, 25, 17, 14, 12, 12`. Floor 2's level base cost is 1.15 times its open cost, rounded up from 69 to 70 (rule 7 in section 2.2).

Base payouts are **not** multiplied by `D`. That is how a later world absorbs the multipliers the player arrives with. `T` makes the upper floors of later worlds pay back more slowly. World 1 has `D = 1` and `T = 1`.

What the template means for feel:

- The ×12 ladder is kept from the bible. Each new floor costs 12 times the last.
- A new floor pays back its own cost in one or two harvests. That is why opening a floor feels great.
- Each floor's cycle is twice as long as the one below, so higher floors hit less often and harder.
- Growth eases from 1.15 to 1.07 as floors rise, so top floors stay worth levelling.

### 5.4 World 1 floor table

| # | Floor | Open cost | Base payout | Cycle (s) | Level base cost | Growth | Hire fee |
|---|---|---|---|---|---|---|---|
| 1 | Windowsill Planter | free | 1 | 0.6 | 4 | 1.07 | 1,000 |
| 2 | Balcony Boxes | 60 | 50 | 3 | 70 | 1.15 | 12,000 |
| 3 | Backyard Hemp Patch | 720 | 540 | 6 | 828 | 1.14 | 90,000 |
| 4 | Garden Shed Nursery | 8,640 | 6,480 | 12 | 9,936 | 1.13 | 604,800 |
| 5 | Glass Greenhouse | 103,680 | 77,760 | 24 | 119,232 | 1.12 | 4,147,200 |
| 6 | Farmers' Market Stall | 1,244,160 | 933,120 | 48 | 1,430,784 | 1.11 | 31,104,000 |
| 7 | Tea House | 14,929,920 | 11,197,440 | 96 | 17,169,408 | 1.10 | 253,808,640 |
| 8 | Ropewalk & Twine Shop | 179,159,040 | 134,369,280 | 192 | 206,032,896 | 1.09 | 2,508,226,560 |
| 9 | Soap & Scent Workshop | 2,149,908,480 | 1,612,431,360 | 384 | 2,472,394,752 | 1.08 | 25,798,901,760 |
| 10 | Sprout Tower HQ | 25,798,901,760 | 19,349,176,320 | 768 | 29,668,737,024 | 1.07 | 309,586,821,120 |

Tables for worlds 2 to 6 are in CONTENT.md section 1.

### 5.5 Manual and managed floors

- **No manager:** the cycle runs once, then the room dims and shows "Tap to harvest". Nothing is earned until the player taps it. Tapping pays the payout and starts the next cycle.
- **Manager hired:** the payout is collected the moment the cycle ends and the next cycle starts.
- Opening a floor plays a construction beat of `CONSTRUCTION_TIME = 1.5 s`. The first cycle starts after it.

### 5.6 Buying

- The buy-mode toggle has four settings: `x1`, `x10`, `Next` (to the next milestone) and `Max`. It appears after the first milestone. Before that every purchase is `x1`.
- A locked floor shows its price plate. The plate turns green when it is affordable. Only the next locked floor can be bought.
- The plate above the top floor is the ticket to the next world (section 14.3).

### 5.7 Floor milestone rewards

Besides the ×2, reaching a floor milestone:

- raises the Insight rate (section 10),
- gives XP the first time ever that this floor reaches that tier (section 9.1),
- gives a Wooden Crate the first time ever that any floor in a world reaches tiers 100, 300, 500, 700 and 900.

## 6. Tapping

Tapping has five parts. They unlock one at a time (section 16).

### 6.1 Counted taps

- A tap is a left click on the tower, or Space. A click on a button or a panel is not a counted tap: it pays nothing and adds nothing to Combo or the Spurt meter.
- **What a tap harvests.** A tap on a floor harvests that floor if it is ready. A tap anywhere else on the tower, or Space, harvests the unmanaged floor that has been ready longest. One tap harvests at most one floor, so a player can run the whole tower from the keyboard.
- Every tap counts the same for the tap bonus, Combo and the Spurt meter, wherever it lands.
- **Hold to tap:** holding the button or key taps at `HOLD_RATE = 6` per second.
- At most `TAP_RATE_CAP = 12` taps per second are counted. Extra taps are ignored.
- Taps the game makes for the player (the Autopilot skill) are not counted taps. They pay what their row says and nothing else: no Combo, no Spurt meter, no Hearth Heat, no quest or achievement progress.

### 6.2 Tap bonus

Unlocks when the first manager is hired. Before that, taps only harvest.

```
steadyIPS = sum of floorIPS over every open floor in the current world,
            with no timed boost and no Growth Spurt in it (section 13.5)
            (a floor without a manager counts at its own floorIPS, with no manager multiplier)

tapValue  = TAP_SECONDS x tapPowerMult x steadyIPS
          x comboMult x (critMult if Bumper, else 1)
          x spurt x tapBoost                               (section 13.5)
```

`TAP_SECONDS = 0.05`. A tap is worth one twentieth of a second of the whole tower's steady income before any bonus.

**Taps follow the tower.** `spurt` is the Growth Spurt speed while one is active, and `tapBoost` is the world's Boost plus any tap-only boost such as a Tap Storm. So a Growth Spurt or a Sunbeam lifts taps by the same factor as it lifts the floors, each timed effect is counted once, and the whole of it sits under one cap (section 13.5).

Because the tap is tied to the tower's income, it scales with everything the player builds and never goes stale.

### 6.3 Combo

```
every COMBO_TAPS_PER_STACK counted taps:   stacks = min(comboCap, stacks + 1)
no tap for COMBO_GRACE seconds:            stacks fall by COMBO_DECAY per second
comboMult = 1 + COMBO_PER_STACK x stacks
```

`COMBO_TAPS_PER_STACK = 5`, `COMBO_PER_STACK = 0.1`, `COMBO_CAP_BASE = 20` (so ×3 at full), `COMBO_GRACE = 1.5 s`, `COMBO_DECAY = 10` stacks per second. The HUD meter has 10 segments, each worth a tenth of the current cap.

**Combo is slow to build and quick to lose.** A full meter takes 100 taps at the base cap (about 17 seconds of holding) and 250 taps at the cap of 50 (about 42 seconds). A pause of a few seconds empties it. Keeping the chain alive is the skill, and that is what a longer grace, Tea Break and Thunder Thumb are for. Clicking faster than the hold rate fills it sooner.

**Using the game never costs a chain.** A click on a button or a panel restarts the grace timer, although it is not a counted tap. The timer is paused while a full-screen panel is open, and while the game plays a chest opening or any other reveal. `COMBO_GRACE` and `COMBO_DECAY` are values for a playtest to settle.

### 6.4 Bumper taps (crits)

Each counted tap has `critChance` to be a Bumper, which multiplies that tap by `critMult`.

`CRIT_CHANCE_BASE = 0.03`, `CRIT_MULT_BASE = 10`. `critChance` is capped at `CRIT_CHANCE_CAP = 0.12` and `critMult` at `CRIT_MULT_CAP = 20`.

### 6.5 Growth Spurt (frenzy)

- Every counted tap adds 1 to the Spurt meter. The meter does not fill during a Spurt.
- At `SPURT_TAPS = 300` the meter is full. The player triggers it with a click or the F key. A setting triggers it automatically.
- For `SPURT_DURATION = 20 s`, every floor in the current world runs at `SPURT_SPEED = 3` times speed, and taps are worth three times as much too (section 6.2). A Growth Spurt is the one timed effect that multiplies the Boost (section 13.5).
- Holding to tap fills the meter in 50 s, so a Spurt is active about 29% of the time.

### 6.6 Garden Visitors

Clickable visitors drift across the tower. They appear only while the game window has focus.

- A spawn timer picks a delay uniformly between `VISITOR_MIN = 90 s` and `VISITOR_MAX = 150 s`, multiplied by `visitorIntervalMult`.
- A visitor stays for `VISITOR_LIFETIME = 12 s`.
- The visitor type and outcome are rolled when it spawns.

| Visitor | Unlock | Weight | Outcome when caught |
|---|---|---|---|
| Golden Sprout: Windfall | floor 6 | 55 | Coins worth `WINDFALL_SECONDS = 60 s` of `steadyIPS` |
| Golden Sprout: Sunbeam | floor 6 | 20 | A ×5 boost in this world for 30 s (section 13.5) |
| Golden Sprout: Tap Storm | floor 6 | 15 | A ×10 tap boost for 15 s (section 13.5) |
| Dewdrop | floor 6 | 7 | 2 Gems |
| Mystery Crate | floor 6 | 3 | 1 Wooden Crate |
| Busy Bee | research "Bee Hotel" | separate timer, 240 to 360 s | `BEE_POLLEN = 5` Pollen |

A Golden Sprout that is missed is simply gone. Nothing is lost. Catching a boost that is already running restarts its timer. It does not stack with itself.

### 6.7 What tapping is worth

With no upgrades, holding to tap gives:

```
tap income      = 6 taps/s x 0.05 s x comboMult 3 x Bumper average 1.27  = 1.14 x steadyIPS
with Spurts     = (1 + 1.14) x 1.57 = about 3.4 x idle income
Golden Sprouts  = about 1.2 x more with every one caught
                  (Windfall 0.28, Sunbeam 0.67, Tap Storm 0.30)
```

| Build | Active income compared with idle, before timed boosts |
|---|---|
| No upgrades | about 3.4×, and about 4.6× with every Golden Sprout caught |
| Mid game, some Green Thumb skills | 4× to 6× |
| Full tapping build with the tapping heirloom set | about 13× |
| Every tap stat at its cap (section 13.4) | about 55× holding at 6 taps a second. About 120× at the limit of 12 a second |

**Timed boosts come on top, and they are bounded too.** Boosts add into one capped number (section 13.5), so their value is their average uptime. Rough arithmetic from the rows in CONTENT.md:

| Player, in the world on screen | Average Boost on the tower | Average Boost on taps |
|---|---|---|
| No abilities yet (Golden Sprouts and Morning Dew only) | about ×1.3 | about ×1.4 |
| Thymeford on day 1, its four ability managers hired | about ×1.4 | about ×1.6 |
| Day 30 in the best world for boosts (Papaya Cay), with the Golden Watering Can | about ×1.9 | about ×2.2 |
| A finished account with full cooldown reduction, from Mount Mitten (lowest) to Papaya Cay (highest) | ×1.5 to ×2.0 | ×1.7 to ×2.4 |
| The same, built around Golden Sprouts | ×2.2 to ×2.7 | ×2.9 to ×3.7 |

An ability works only in its manager's own world (section 7.1), so a world's Boost comes from its own four managers, the Golden Sprouts and the heirloom the player carries. That is why these averages are lower than in version 0.2, where one world could use every ability in the game.

So the highest active income the rules allow, for a finished account in its best world, is about 130 times idle holding to tap and about 200 times with a full Golden Sprout build. At the limit of 12 taps a second the same arithmetic gives about 290 and 440. Guaranteed Bumpers (Showstopper, Sharp Season) sit outside the Boost and add more on top: fifty of them inside a capped Boost and a Growth Spurt are worth about 15 hours of steady income. Those are ceilings for the end of the game, not targets. The simulator should run both tap rates and measure boost uptime (section 17.6). If the top is too high, lower `TAP_RATE_CAP` first, then `CRIT_MULT_CAP`.

Idle builds get the mirror image: up to 100% offline efficiency, up to 33 hours stored, and stronger managers.

## 7. Managers

### 7.1 Rules

1. **Every floor has its own manager.** A manager is a named character who runs one floor and never moves. There are 50, one for each floor, and 34 at launch. Rows are in CONTENT.md section 2. There is nothing to seat, swap or assign.
2. **Hiring.** To hire a floor's manager, pay the floor's `hireFee` in that world's currency. The fee is paid once per run. It is paid again after a Replant or a Festival.
3. A floor whose manager is hired harvests itself.
4. A hired manager multiplies that floor's profit and adds a perk. Perks and abilities work only while the manager is hired.
5. **A manager is also a card.** The card is owned at level 1 from the first time its floor is opened, in any run. From then on the manager is **met**. Copies from chests level the card up (section 8). Card levels are never lost.
6. **Rarity follows the floor.** The higher the floor, the rarer its manager:

   | Rarity | Floors in world 1 | Floors in worlds 2 to 6 |
   |---|---|---|
   | Common | 1 to 3 | 1 and 2 |
   | Uncommon | 4 to 6 | 3 and 4 |
   | Rare | 7 | 5 |
   | Epic | 8 | 6 |
   | Legendary | 9 | 7 |
   | Exotic | 10 | 8 |

   That is 13 Common, 13 Uncommon and 6 each of Rare, Epic, Legendary and Exotic. At launch: 9, 9, 4, 4, 4, 4.
7. **Abilities.** Rare and better managers have an ability: a button with a cooldown. So every world has four. An ability works in its manager's own world.
8. **The Head.** The manager of a world's top floor is its Head, and the Head is Exotic. A Head is hired like anyone else. Copies of a Head never come from a chest roll. They come from World Mastery (section 14.5) and the Starlight Chest (section 8.3).
9. **The first session never depends on luck.** A manager arrives with their floor. The Welcome Chest gives two copies each of the managers of floors 1 to 3, and Hire buttons appear from that moment. The first time each of floors 4 to 9 opens in world 1, a Hiring Crate gives two copies of that floor's manager plus two random cards (CONTENT.md section 2.3).

**What the player decides.** Which floor to hire first, when to press each ability, and which plants and heirlooms go where (sections 8.5 and 8.7). Build choices live in planters, heirloom slots and the skill tree (section 9.2). Managers are the cast: a player learns who runs the Tea House and watches them grow.

### 7.2 Numbers

```
managerProfit = MGR_BASE[rarity] x MGR_STEP[rarity] ^ (level - 1) x managerPowerMult
perkValue     = perkBase x (1 + PERK_PER_LEVEL x (level - 1))
```

`PERK_PER_LEVEL = 0.1`. `managerProfit` is 1 while the manager is not hired.

| Rarity | `MGR_BASE` | `MGR_STEP` | Max level | Profit at max level | Ability |
|---|---|---|---|---|---|
| Common | 2 | 1.2 | 15 | ×25.7 | no |
| Uncommon | 2.5 | 1.2 | 13 | ×22.3 | no |
| Rare | 3 | 1.2 | 11 | ×18.6 | yes |
| Epic | 3.5 | 1.22 | 9 | ×17.2 | yes |
| Legendary | 4 | 1.28 | 7 | ×17.6 | yes |
| Exotic | 5 | 1.43 | 5 | ×20.9 | yes |

All rarities end near the same ceiling on purpose. Rarer managers get there with far fewer copies, each level is a bigger step, and they bring the abilities. The level 1 values are close together on purpose too: the rare managers sit on the floors that earn the most, so a big head start there would hand a new player the first day for free.

Abilities have fixed strength. Cooldowns keep running while the game is closed. The number keys 1 to 4 press the four abilities of the world on screen, in floor order. An ability that lasts a set time is a timed boost and follows section 13.5. An ability that pays income at once pays from the steady rate.

## 8. Cards, chests and the collection

### 8.1 Rarities

| Rarity | Colour cue (Art Director owns the look) | Where it comes from |
|---|---|---|
| Common | grey | chests |
| Uncommon | green | chests |
| Rare | blue | chests |
| Epic | purple | chests |
| Legendary | gold | chests; hybrid plants from cross-pollination |
| Exotic | rainbow | never from a chest roll. Plants by mutation. The Exotic managers are the six Heads: their copies come from World Mastery and the Starlight Chest |

Rarity is also shown by frame shape and a pip count, so it never depends on colour alone.

### 8.2 Duplicate curves

Copies needed to go from level `L` to `L + 1`. The same curves serve managers and plants. A plant's first copy unlocks the card at level 1. A manager's card is at level 1 from the moment its floor is first opened (section 7.1), so every manager copy counts toward the next level.

| From level | Common | Uncommon | Rare | Epic | Legendary | Exotic |
|---|---|---|---|---|---|---|
| 1 | 2 | 2 | 2 | 1 | 1 | 1 |
| 2 | 4 | 4 | 4 | 2 | 2 | 2 |
| 3 | 8 | 8 | 6 | 4 | 3 | 3 |
| 4 | 16 | 14 | 10 | 6 | 5 | 4 |
| 5 | 30 | 24 | 16 | 10 | 8 | max |
| 6 | 50 | 40 | 24 | 14 | 12 | |
| 7 | 80 | 60 | 36 | 20 | max | |
| 8 | 120 | 90 | 50 | 30 | | |
| 9 | 180 | 130 | 70 | max | | |
| 10 | 260 | 190 | 100 | | | |
| 11 | 380 | 280 | max | | | |
| 12 | 550 | 400 | | | | |
| 13 | 800 | max | | | | |
| 14 | 1,200 | | | | | |
| **Max level** | **15** | **13** | **11** | **9** | **7** | **5** |
| **Copies from level 1 to max** | **3,680** | **1,242** | **318** | **87** | **31** | **10** |

Levelling up costs copies only. It is a button press with a level-up moment.

Heirlooms use the same idea with their own curves (section 8.7).

A copy of a card that is already at max level turns into Pollen: Common 1, Uncommon 3, Rare 10, Epic 40, Legendary 200.

### 8.3 Chests

There are six chest tiers. Each card slot is rolled separately.

| Tier | Chest | Cards | Guaranteed | Common | Uncommon | Rare | Epic | Legendary | Pollen | Heirloom |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Wooden Crate | 3 | none | 74% | 22% | 3.5% | 0.5% | 0% | 0 | 0% |
| 2 | Copper Chest | 5 | 1 Uncommon or better | 62% | 28% | 8% | 1.8% | 0.2% | 10 | 0% |
| 3 | Silver Chest | 8 | 1 Rare or better | 48% | 32% | 15% | 4.2% | 0.8% | 30 | 20% |
| 4 | Golden Chest | 12 | 1 Epic or better | 34% | 34% | 22% | 8% | 2% | 80 | 50% |
| 5 | Crystal Chest | 16 | 1 Legendary | 22% | 30% | 28% | 15% | 5% | 200 | 100% |
| 6 | Starlight Chest | 20 | 2 Legendary, and 1 copy of a Head (rule 9) | 15% | 25% | 30% | 20% | 10% | 500 | 100%, Epic or better |

Rules, in order:

1. **Guarantee slots** are rolled first, among the guaranteed rarity and better, in the same proportions as the table.
2. **Card type.** Each slot is a manager with probability `CHEST_MANAGER_SHARE = 0.55`, otherwise a plant. Before planters unlock, every slot is a manager.
3. **Which card.** Uniform among cards of that rarity and type that are in the pool. A manager is in the pool once it is met: its floor has been opened at least once, in any run. A plant is in the pool when its `poolWorld` is unlocked. Exotics and hybrids are never in the pool. If the pool has no card of that rarity and type, the slot gives the other type. That is how a Legendary plant slot becomes a Legendary manager. If neither type has a card of that rarity, the slot drops one rarity at a time until it finds one.
4. **New-card help.** In a player's first `NEW_CARD_CHESTS = 10` chests, a plant slot whose rarity has an unowned plant always gives an unowned plant. Managers do not need it, because a met manager is already owned.
5. **Pity.** Two counters count cards drawn since the last Epic-or-better and since the last Legendary. At `PITY_EPIC = 60` the next card is Epic. At `PITY_LEGENDARY = 300` the next card is Legendary. Both counters, and the heirloom counter in rule 7, are shown on the chest screen.
6. **Luck.** `chestLuck` multiplies the Rare, Epic and Legendary weights by `1 + chestLuck`. Abracadabra doubles those three weights again. Then all five weights are scaled so that they add up to 100%. Common and Uncommon shrink together and no weight can go below zero, whatever the luck.
7. **Heirloom.** If the heirloom roll succeeds, the chest also holds one heirloom piece: Rare 70%, Epic 25%, Legendary 5% (Starlight: Epic 70%, Legendary 30%). While the player is missing a piece of the rolled rarity, the piece is always one they do not own yet. A third pity counter counts heirloom pieces since the last Legendary piece. At `PITY_HEIRLOOM = 10` the next piece is Legendary. Before heirlooms unlock, this roll is skipped.
8. **Shown odds.** The chest screen shows this table with the player's current luck applied.
9. **Starlight Chest.** Its Exotic copy is for a random Head whose world has at least 5 Mastery stars. If no world has 5 stars yet, it is a third guaranteed Legendary.

**Special chests**

| Chest | Contents |
|---|---|
| Welcome Chest | 2 copies each of Nana Sprig, Basil Brumble and Rowan Rake, the managers of world 1 floors 1 to 3. Fixed |
| Hiring Crate | 2 copies of the manager of the floor that just opened (world 1 floors 4 to 9), plus 2 Wooden Crate slots |
| Morning Basket | 1 Wooden Crate. One becomes ready every `BASKET_HOURS = 4` hours. Up to `BASKET_STORE = 2` wait for the player |
| First seed packet | Plants Garden Mint and Fibre Hemp. Fixed |
| Heirloom Pick | The player chooses one Legendary heirloom out of all six. Given once, at the first Harvest Festival |

### 8.4 Where chests come from

| Source | What | Rate |
|---|---|---|
| Morning Basket | Wooden | up to 6 a day |
| Daily quests | Wooden each, Copper for all three | 3 Wooden and 1 Copper a day |
| Weekly quests | Silver each, Golden for all five | 5 Silver and 1 Golden a week |
| Level-up | Copper. Silver every 5th level. Golden every 10th. Crystal every 25th. Starlight at levels 50 and 100. Only the best one that applies is given | about 5 a day in week 1 |
| Story quests | mixed, see CONTENT.md | front-loaded |
| Floor milestones (first time) | Wooden at tiers 100, 300, 500, 700, 900 per world | a few a day |
| Replant | Copper when the Replant adds at least 25% to total Compost. At most one per world per hour | a few a day |
| Golden Sprout | Wooden, 3% of sprouts | rare |
| Gem shop | Copper 40, Silver 120, Golden 350, Crystal 1,000 Gems | player's choice |
| Events | up to Crystal on the reward track | weekends |
| Harvest Festival | Golden. Crystal on the first Festival, with the Heirloom Pick. Starlight on every fifth | every few days |

Expected cards per day for an active player in week 1: about 90 to 120. Section 17.5 shows what that does to card levels.

### 8.5 Plants

1. Plants are cards. There are 38 (36 at launch). Rows are in CONTENT.md section 3.
2. Every floor has one **planter**. A second comes from research and a third from the Ribbon Shop.
3. Planting is free and instant, and plants can be moved at any time. A plant can be in one planter per world. The same plant can be planted in every world at once.
4. A plant gives its **trait** to the floor, to the world, or globally, as the trait says.
5. Each floor has a **favoured family**. A plant of that family on that floor is "at home" and its trait is multiplied by `AFFINITY_BONUS = 1.5`. The top floor of each world is "wild": every family is at home there.
6. Hybrids and Exotics carry two traits. Each is at `DUAL_TRAIT_FACTOR = 0.7` of full strength.

```
traitValue = traitBase x RARITY_FACTOR[rarity] x (1 + TRAIT_PER_LEVEL x (level - 1))
           x (AFFINITY_BONUS if at home) x (DUAL_TRAIT_FACTOR if the card has two traits)
           x plantPowerMult
```

`TRAIT_PER_LEVEL = 0.2`. `RARITY_FACTOR`: Common 1, Uncommon 1.5, Rare 2.2, Epic 3.2, Legendary 5, Exotic 8.

| Trait | `traitBase` | Scope | Effect |
|---|---|---|---|
| Sturdy | +20% | floor | Profit |
| Quick | +6% | floor | Speed |
| Thrifty | -3% | floor | Level cost. Plants cannot take a floor below -50% |
| Neighbourly | +8% | floors directly above and below | Profit |
| Bountiful | +5% | floor | Chance that a harvest pays double |
| Frosty | +0.25 points | world | Bumper chance |
| Zesty | +0.3 | world | Bumper multiplier |
| Fragrant | +2 | world | Combo cap |
| Radiant | +0.5 s | world | Growth Spurt length |
| Lucky | -1.5% | world | Time between Golden Sprouts |
| Evergreen | +4% | world | Offline earnings |
| Sweet | +3% | world | Tap power |
| Studious | +2% | global, counted once per card | Insight rate |

**Families:** Hemp, Mint, Basil, Rosemary, Lavender, Sage, Chamomile, Thyme. Hemp is the flagship family and has the most cards.

### 8.6 Cross-pollination and mutation

Unlocked by research ("Pollination Bench", then "Mutation Chamber").

- The bench runs one job at a time (two with research). A job costs Pollen and takes real time. It keeps running while the game is closed.
- Parents are not used up. They only need to be at the listed level.
- **Cross-pollination** takes two parent plants and makes a Legendary **hybrid**.
- **Mutation** takes one parent plant and a **climate**. The player must have unlocked the world with that climate. It makes an **Exotic**.
- Every job makes one copy. Running the recipe again makes another copy, which is how hybrids and Exotics level up.
- Recipes are shown in the Codex as silhouettes with a hint. Nothing is hidden behind guessing.

| Job | Parent level | Pollen | Time |
|---|---|---|---|
| Hybrid | both parents at `HYBRID_PARENT_LEVEL = 2` or higher | `HYBRID_POLLEN = 400` | `HYBRID_HOURS = 8` |
| Exotic | parent at `EXOTIC_PARENT_LEVEL = 3` or higher | `EXOTIC_POLLEN = 1,500` | `EXOTIC_HOURS = 24` |

The parent levels are low on purpose. Pollen and bench time are the real price, and Pollen can buy the missing copies of a parent.

Climates: Temperate (Thymeford), Urban (Loomington), Tropical (Papaya Cay), Frost (Mount Mitten), Lunar (the Moon), Stellar (Nebula Nursery). The recipe list is in CONTENT.md section 3.3. The brief's example is in it: Chocolate Mint in the Frost climate gives Frosted Mint, whose first trait is Frosty.

**Pollen can also buy copies of a card you already own:** Common 5, Uncommon 15, Rare 50, Epic 200, Legendary 1,000 Pollen each. Exotic copies cannot be bought. Copies of an heirloom you already own cost Rare 100, Epic 400 and Legendary 2,000 Pollen.

### 8.7 Heirlooms

Heirlooms are the game's artifacts: old garden tools with a little magic. There are 18, in six sets of three. Rows are in CONTENT.md section 4.

1. Heirlooms are equipped in global slots. `HEIRLOOM_SLOTS_BASE = 2`. Research adds two and the Ribbon Shop adds two, for six.
2. Every heirloom has a passive. The Legendary piece of each set also has an **ability** with a cooldown. Hotkeys Q, W, E, R, T, Y in slot order.
3. Each set gives a bonus for two pieces equipped and another for all three.
4. Heirlooms level up with copies. A numeric passive is multiplied by `1 + HEIRLOOM_PER_LEVEL x (level - 1)`, with `HEIRLOOM_PER_LEVEL = 0.15`. Set bonuses and abilities do not scale.
5. Swapping is free, but an ability's cooldown is kept on the heirloom.
6. **Getting them never hangs on one lucky roll.** The story gives the Sprouting Trowel at the third Replant. The first Harvest Festival gives the Heirloom Pick, one Legendary of the player's choice, so every player has an heirloom ability and a set to aim for by day 4 or 5. Chest rolls give no repeats until a rarity is complete and have their own pity counter (section 8.3, rule 7). Pollen buys copies of pieces already owned (section 8.6). A chosen set is complete in week 2 or 3 for an active player.

Copies needed per level (max level 9):

| From level | Rare | Epic | Legendary |
|---|---|---|---|
| 1 | 2 | 1 | 1 |
| 2 | 4 | 2 | 2 |
| 3 | 6 | 4 | 3 |
| 4 | 10 | 6 | 5 |
| 5 | 16 | 10 | 8 |
| 6 | 24 | 14 | 12 |
| 7 | 36 | 20 | 18 |
| 8 | 50 | 30 | 25 |

A copy of a max-level heirloom turns into Pollen: Rare 25, Epic 100, Legendary 400.

## 9. Player level and skills

### 9.1 Green Thumb level

The player has one level for the whole game. It never resets.

```
XP needed to go from level L to L + 1  =  XP_BASE + XP_PER_LEVEL x L  =  500 + 250 x L
```

| XP source | XP |
|---|---|
| Story quest | per row, 30 to 5,000 (CONTENT.md section 9) |
| Daily quest | 1,000 each, plus 1,000 for finishing all three |
| Weekly quest | 5,000 each, plus 10,000 for finishing all five |
| Floor milestone, first time ever for that floor and tier | 50 × tier number (tier 1 is level 25, tier 2 is 50, tier 3 is 100, tier 4 is 200, ...) |
| New Compost record | `REPLANT_XP_STEP x n` the first time all-time Compost passes `2^n`, with `REPLANT_XP_STEP = 150`. A Replant that crosses several powers of two pays each of them |
| Chest opened | 20 × chest tier |
| Visitor caught | 5 |
| Achievement | 100, 200, 400, 750, 1,500 by tier |
| World Mastery star | 1,000 |

Every level-up gives 1 Skill Point, 10 Gems and a chest (section 8.4). `LEVEL_CAP = 112`, which is exactly enough points for the whole tree.

XP rewards are fixed amounts for records and quests, so resetting quickly does not farm levels. A Replant pays XP only for a new all-time Compost record, never for the Replant itself.

Expected level: 10 to 11 after the first hour, about 23 after day 1, about 40 after week 1, about 70 after a month, and the cap around month 3. The balance simulator's active player has level 11 at one hour, 22 on day 1, 39 on day 7 and 73 on day 30 (version 0.4 numbers). Most early XP comes in lumps (the first Compost records, the first daily quests and the achievements already earned when the panel opens), which is why version 0.4 lowered the daily quest and achievement XP.

### 9.2 Skill tree

Three branches, one per feel priority. Rows are in CONTENT.md section 5.

| Branch | Theme | Typical player |
|---|---|---|
| **Green Thumb** | Tapping: tap power, Combo, Bumpers, Spurts, Golden Sprouts | Active |
| **Botanist** | Collection: plants, managers, luck, Pollen, Insight | Collector |
| **Tycoon** | Automation: profit, speed, costs, offline, Compost | Idle |

Rules:

1. Each branch has six minor skills (5 ranks each), two major skills (3 ranks each) and two keystones (1 rank, pick one). That is 37 points a branch and 111 in all.
2. Tier gates count points spent in the same branch: tier 2 needs 5, tier 3 needs 15, the keystone needs 30.
3. A keystone changes a rule. A branch's two keystones exclude each other.
4. Respec refunds every point. It is free once after each Harvest Festival and otherwise costs `RESPEC_GEMS = 100`.
5. The tree unlocks at level 6, with the five points already earned waiting. That is enough to open tier 2 of one branch on the spot.

With about 40 points at the end of week 1, a player can finish one branch or split between two. That is the build choice.

## 10. Research

Research is where conveniences and steady permanent boosts live. It unlocks after the first Replant and never resets. Rows are in CONTENT.md section 6.

```
recordMilestones = sum, over every floor in every world, of the highest milestoneCount
                   that floor has reached in the current era
insightPerHour   = INSIGHT_PER_MILESTONE x recordMilestones x insightGainMult
```

`INSIGHT_PER_MILESTONE = 1`.

1. Insight accrues while playing and while away. Away time counts up to `INSIGHT_TANK_HOURS = 24`.
2. The record does not drop on a Replant, so resetting never costs Insight. It restarts at a Harvest Festival and is rebuilt within the first session.
3. A project costs Insight when it is queued and then takes real time. Time passes while the game is closed.
4. There is one research desk. The Ribbon Shop adds a second. Each desk can hold a queue of `RESEARCH_QUEUE = 3` projects.
5. There are 40 projects in four lanes: **Tools** (offline cap, planters, heirloom slots, auto-hire), **Soil Science** (profit, speed, costs), **Botany** (bees, the pollination bench, mutation, trait strength) and **People and Luck** (manager power, cooldowns, chest luck, Insight).
6. All 40 projects cost about 626,000 Insight and about 18 days of research time in total. The cheap ones come in the first week. The whole tree takes about two to three months.

## 11. Quests, achievements and codex

### 11.1 Story quests

A single chain that teaches the game and unlocks features. One story quest is active at a time. It is pinned to the HUD with a progress bar. Rows are in CONTENT.md section 9. The chain has 44 fixed steps (42 at launch), then a repeating "chapter" goal for each world (all floors to level 100, 200, 300 and so on) that gives a Silver Chest.

### 11.2 Daily quests

Three quests a day, drawn without repeats from the pool in CONTENT.md section 10. Quests whose feature is still locked are left out of the draw. The day changes at local midnight (section 15.2).

| Reward | Each quest | All three |
|---|---|---|
| Chest | Wooden Crate | Copper Chest |
| Gems | 10 | 20 |
| XP | 1,000 (`XP_DAILY`) | 1,000 (`XP_DAILY_ALL`) |
| Pollen (once the bench is unlocked) | 20 | 40 |

### 11.3 Weekly quests

Unlock with world 2. Five a week, drawn from a pool of ten. The week starts on Monday.

| Reward | Each quest | All five |
|---|---|---|
| Chest | Silver Chest | Golden Chest |
| Gems | 20 | 100 |
| XP | 5,000 | 10,000 |

### 11.4 Achievements

Twenty families with five tiers each: 100 achievements. Rows are in CONTENT.md section 11.

- Each achievement gives **+1% profit**, permanently. All achievements add together (`ACHIEVEMENT_PCT = 0.01`), so the full set is ×2.
- Each also gives Gems (5, 10, 15, 25, 50 by tier) and XP (`XP_ACHIEVEMENT` = 100, 200, 400, 750, 1,500 by tier).

### 11.5 Codex

A collection log: every floor, manager, plant, heirloom, visitor and world. 168 entries, 132 of them at launch (CONTENT.md section 12).

- An entry is filled the first time the thing is owned, opened or caught.
- Each entry gives 5 Gems once and **+0.25% profit** permanently (`CODEX_PCT = 0.0025`), so the full codex is +42%, and +33% with the four launch worlds.
- Plant and manager entries hold the Writer's bios. Hybrid and Exotic entries show their recipe hints.

## 12. Reset layers

### 12.1 Replant (the small reset)

**Fiction:** the season ends. Everything goes on the compost heap and next season grows in richer soil.

Replant is per world.

```
compostTotal(w) = floor( COMPOST_K[w] x (lifetime(w) / COMPOST_E0) ^ COMPOST_EXP x compostGainMult )
pending(w)      = max(0, compostTotal(w) - claimed(w))
```

- `lifetime(w)` is every unit of world `w`'s currency earned in the current era. It does not reset on Replant. Starting money from Head Start is not counted.
- `COMPOST_E0 = 2e10`, `COMPOST_EXP = 0.4`, `COMPOST_K = 5, 15, 40, 100, 250, 600` for worlds 1 to 6.
- **Replant is available** in a world when its top floor is open in the current run and `pending >= 1`. The very first Replant of a save needs `pending >= FIRST_REPLANT_MIN = 60`.
- `compostGainMult` comes only from skills and the Compost Shop, never from a card or an heirloom, so there is nothing to swap in for the click. If a respec lowers it, `pending` stays at 0 until lifetime earnings catch up.
- **On Replant:** `claimed(w) += pending(w)`, `compostEra += pending(w)`, `compostAllTime += pending(w)`. That world's currency, floor levels and hires reset. Floor 1 is open at level 1. Plant placements are remembered and come back as floors reopen. Managers stay met and keep their card levels, and each one is hired again with its floor's fee.
- **Passive:** every Compost earned this era gives `COMPOST_PCT = +2%` profit in every world. Spending Compost in the Compost Shop does not reduce this.
- **Compost Shop:** rows in CONTENT.md section 7. Every item has a level cap. Rich Soil (×1.25 profit, 10 levels) is the only one that multiplies profit. After the first Harvest Festival the shop has a Buy All button, because it is rebuilt every era.

Because `pending` comes from lifetime earnings, a second Replant five minutes after the first gives almost nothing. The player must grow past their previous best. The Replant screen says "Replant now for +N Compost (+X% profit)", and the button glows once `pending` is at least half of `compostEra`.

Why 0.4 and not a square root: section 17.6.

First Replant: the button unlocks at 60 pending Compost, which is about 1e13 lifetime Coins. Until then it shows a progress bar toward 60. Sixty Compost gives ×2.2 profit and buys Rich Soil twice, so the second run is about three times faster. There is one number for the first Replant, and the Compost Shop and Research unlock with it.

### 12.2 Harvest Festival (the big reset)

**Fiction:** the whole brand goes to the Grand Harvest Festival. Mayor Thyme hosts it and pins on the Prize Ribbons, and a new generation starts over with the ribbons on the wall.

```
ribbonsTotal   = floor( (compostAllTime / RIBBON_C0) ^ RIBBON_EXP )
ribbonsPending = ribbonsTotal - ribbonsClaimed
```

- `compostAllTime` is all Compost ever claimed, in every era. `RIBBON_C0 = 50,000`, `RIBBON_EXP = 0.5`.
- **Unlocks** when the player has reached world 3 at least once and `ribbonsPending >= FIRST_FESTIVAL_MIN = 8`. Later Festivals need `ribbonsPending >= 1`.
- **On Festival:** `ribbonsClaimed += ribbonsPending`. Then every world's currency, floors, hires and `lifetime` reset. `compostEra`, every `claimed(w)` and all Compost Shop purchases reset. World tickets must be bought again. Everything in the "Keeps" column of section 3.4 stays.
- **Passive:** every Ribbon ever earned gives `RIBBON_PCT = +10%` profit in every world. Spending Ribbons does not reduce this.
- **Ribbon Shop:** rows in CONTENT.md section 8. It never resets. It holds Golden Hour (×2 profit, 5 levels), the deeds to worlds 4, 5 and 6, the third planter, heirloom slots, a second research desk, auto-buy (the Auto-Gardener) and one endless item, Blue Ribbon Polish.
- Each Festival gives a Golden Chest (a Crystal Chest the first time, a Starlight Chest every fifth time) and one free respec. The first Festival also gives the Heirloom Pick (section 8.3).
- The Festival screen says "Hold the Festival now for +N Ribbons (+X% profit)", and the button glows once `ribbonsPending` is at least equal to `ribbonsClaimed`.

The first 8 Ribbons need about 3.2 million Compost. The pacing check puts that on day 4 to 5 for an active player.

### 12.3 No third layer in v1

The long tail is carried by the later worlds, World Mastery, Exotic plants and managers, heirloom sets, card levels, research and the Ribbon Shop's endless item. A third reset would cost more readability than it adds. If the simulator shows the game going flat after week 6, the next layer is designed then.

## 13. How bonuses stack

One rule: **bonuses of the same kind from the same bucket add together. Buckets multiply each other.**

### 13.1 Profit

```
profitMult(floor) =
    managerProfit                                    (1 if no manager)
  x (1 + sum of floor profit bonuses)                Sturdy, Neighbourly, manager perks
  x (1 + sum of heirloom profit bonuses)             including set bonuses
  x (1 + sum of skill profit bonuses)
  x researchProfit                                   1.5 ^ (Soil Science projects done)
  x (1 + (COMPOST_PCT + MASTER_COMPOSTER_PCT x masterComposterLevel) x compostEra)
  x RICH_SOIL ^ richSoilLevel
  x (1 + (RIBBON_PCT + BLUE_POLISH_PCT x bluePolishLevel) x ribbonsClaimed)
  x 2 ^ goldenHourLevel
  x (1 + ACHIEVEMENT_PCT x achievements)
  x (1 + CODEX_PCT x codexEntries)
  x (1 + MASTERY_PCT x masteryStars(world))
  x twistMult(world)                                 section 14.4
  x boost(floor)                                     the one timed Boost, section 13.5
```

`MASTER_COMPOSTER_PCT = 0.005` (5 levels) and `BLUE_POLISH_PCT = 0.002` (endless) are Ribbon Shop items. A permanent effect written as "×1.5 profit" in CONTENT.md (a keystone, a twist) is its own multiplier. Anything that lasts a set time is a timed boost: it adds into the Boost and never multiplies another boost (section 13.5).

A harvest with a Bountiful chance `c` pays double with probability `c` (capped at 1).

### 13.2 Speed

```
speedMult(floor) = 2 ^ milestoneCount x towerMilestoneMult ^ towerMilestoneCount
  x (1 + sum of floor speed bonuses)                 Quick, manager perks
  x (1 + sum of heirloom speed bonuses)
  x (1 + sum of skill speed bonuses)
  x researchSpeed                                    1.2 ^ (Crop Rotation projects done)
  x spurt                                            Growth Spurt speed while one is active, else 1
```

Abilities written as speed (All Hands, Fireside Story) are timed boosts. They count in the Boost of section 13.5, not here.

`towerMilestoneMult` is `TOWER_MILESTONE_MULT` plus any flat additions (a Tycoon skill, a set bonus, Granny Evergreen in Thymeford), capped at `TOWER_MILESTONE_CAP = 2.0`.

### 13.3 Level cost

```
costMult(floor) = (1 - sum of floor discounts)       Thrifty, manager perks. At most 0.5 off
  x (1 - sum of heirloom discounts)
  x (1 - sum of skill discounts)
  x researchCost                                     0.9 ^ (Frugal Farming projects done)
  x GREEN_DEAL ^ greenDealLevel
  x 0.5 while Dig In is active on this floor
costMult is never below COST_MULT_FLOOR = 0.25
```

Discounts apply to level costs only. Open costs, hire fees and tickets have their own named discounts.

### 13.4 Everything else

| Stat | Formula | Cap |
|---|---|---|
| `tapPowerMult` | product over buckets of `(1 + sum)` | `TAP_POWER_CAP = 3` |
| `critChance` | `CRIT_CHANCE_BASE` + every source added | `CRIT_CHANCE_CAP = 0.12` |
| `critMult` | `CRIT_MULT_BASE` + every source added | `CRIT_MULT_CAP = 20` |
| `comboCap` | `COMBO_CAP_BASE` + every source added | `COMBO_CAP_MAX = 50` |
| Combo grace | `COMBO_GRACE` + every source added | 6 s |
| Spurt length | `SPURT_DURATION` + every source added | `SPURT_DURATION_CAP = 45 s` |
| Spurt taps needed | `SPURT_TAPS x product of (1 - reduction)` per source | at least `SPURT_TAPS_MIN = 150` |
| Spurt speed | `SPURT_SPEED` + every source added | `SPURT_SPEED_CAP = 4` |
| `visitorIntervalMult` | product of `(1 - reduction)` per source | at least 0.4 |
| `offlineEfficiency` | `(OFFLINE_EFF_BASE + points added) x (1 + sum of "offline earnings" bonuses in that world)` | 1.0. Compound Interest and the Night Market are applied after the cap |
| `offlineCap` | `OFFLINE_CAP_BASE` + every source added | `OFFLINE_CAP_MAX = 36 h`. Everything in the game adds up to 33 h |
| `chestLuck` | every source added. Skills and research only | none needed. Section 8.3 rule 6 rescales the weights |
| `insightGainMult`, `pollenGainMult`, `compostGainMult`, `managerPowerMult`, `plantPowerMult` | 1 + every source added. `compostGainMult` comes from skills and the Compost Shop only | none |
| `hireFeeMult` | product of every source | at least 0.1 |
| Cooldown reduction | every source added. Cooldowns tick faster while it is active. It is not read at the press | 50% |
| Boost (every timed bonus in a world) | section 13.5 | `BOOST_CAP = 15` |

A reduction that comes in ranks or levels adds up inside its own source first. Five ranks of Sprout Spotter are one source of 25%.

The tap caps are there so that active play stays a bounded multiple of idle play (section 6.7).

A manager's effects count only while it is hired. Its world-scoped effects count in its own world, and its `adjacent` effects on the floors directly above and below its own. A plant's world-scoped effects count in the world where it is planted.

**Offline numbers add up like this.** Efficiency starts at 40 points. Night Owl adds up to 15 and Overnight Growth up to 18, so the two cheap sources stop at 73. The Night Garden set adds 15, and Grandpa Mitten adds 25 or more in Mount Mitten. Every "offline earnings" percentage (Evergreen plants, the managers with an offline perk in their own worlds, the Glass Cloche Bell) multiplies the points. Reaching 100% therefore takes a real idle build and every piece of it counts. Stored hours: 4 to start, +20 from research, +5 from Deep Pantry, +4 from the Moonstone Birdbath.

**Bonuses are read when they are used.** Swapping a plant or an heirloom in for a single click is allowed, and nothing strong depends on it: chest luck and Compost gain come only from skills, research and shops.

### 13.5 Timed boosts

A **timed boost** is any bonus that lasts a set time or a set number of taps: manager and heirloom abilities, Sunbeams, Tap Storms and Morning Dew. They all follow one rule, so that pressing every button at once is a treat and can never break the economy.

**Every timed boost in a world adds into one number, the Boost, and the Boost has a cap.**

```
a boost written "xN" has bonus N - 1

boost(world) = min(BOOST_CAP, 1 + sum of the bonuses of active world boosts)
boost(floor) = min(BOOST_CAP, 1 + sum of active world boosts + active boosts on that floor)
tapBoost     = min(BOOST_CAP, 1 + sum of active world boosts + active tap boosts)
spurt        = Growth Spurt speed while one is active in this world, else 1

floor income right now = steady floorIPS x boost(floor) x spurt
tap value right now    = steady tap value x tapBoost x spurt          (section 6.2)
steadyIPS              = the world's income with boost = 1 and spurt = 1
```

`BOOST_CAP = 15`.

| Boost | Kind | Size | Lasts | From |
|---|---|---|---|---|
| Sunbeam | world | ×5 | 30 s | Golden Sprout |
| Morning Dew | world, in every world | ×2 | 120 s | returning after an hour away |
| All Hands | world, shown as speed | ×2 | 30 s | Captain Kelp, in Thymeford |
| Night Shift | world | ×2 | 60 s | Barnaby Moonwort, in Mount Mitten |
| Sunday Best | world | ×5 | 30 s | Granny Evergreen, in Thymeford |
| Golden Thread | world | ×10 | 20 s | Madame Loom, in Loomington |
| Lather Up | world | ×3 | 30 s | Stella Lather, on the Moon |
| Moonrise | world | ×5 | 30 s | Grover Crater, on the Moon |
| Downpour | the world on screen | ×3 | 30 s | Golden Watering Can |
| Sprinkler Surge | one floor | ×10 | 30 s | Professor Thistlewick, in Papaya Cay |
| Tap Storm | taps | ×10 | 15 s | Golden Sprout |
| Liftoff | taps | ×5 | 50 taps | Commander Comet, on the Moon |

Rules:

1. **Bonuses add.** A Sunbeam and Sunday Best together are ×9 (1 + 4 + 4), not ×25. In Loomington, Golden Thread, a Sunbeam and a Downpour together would be ×16, and the cap holds them at ×15.
2. **A boost never stacks with itself.** Triggering it again restarts its timer.
3. **A Growth Spurt is the only timed effect that multiplies the Boost.** With the Spurt speed cap of 4, nothing timed can lift a world's income by more than `BOOST_CAP x SPURT_SPEED_CAP = 60` times, and only for as long as the shortest boost lasts.
4. **Lump sums pay from the steady rate.** Anything that pays "N seconds of income at once" uses `steadyIPS`, with no Boost and no Growth Spurt in it: Windfalls and Jackpots, customer tips, Stitch in Time, Heave-Ho, Tea Party, Express Delivery, Supernova, Time Skip and Time Warp. A world's twist counts at its current value where the twist is a profit multiplier (Weather, Hearth Heat).
5. Whether a boost is written as speed or as profit only changes how it looks on screen. Both raise income by the same factor (section 5.2) and both count toward the same Boost.
6. Guaranteed Bumpers (Showstopper, Sharp Season) are not boosts. They turn taps into Bumpers, and the Bumper multiplier has its own cap (section 13.4). Dig In is not a boost either. It is a timed discount on one floor's level costs (section 13.3).
7. The HUD shows one Boost badge per world with the current total, for example "Boost ×9". It glows at the cap.
8. Boosts do not run in the fair stall and are never part of offline earnings.
9. World twists are not boosts. A twist (section 14.4) is part of a world's steady income at its current value. Each has its own ceiling there (×3 for Weather, ×4 for Hearth Heat), and it multiplies the Boost like every permanent bucket in section 13.1.
10. **A manager's boost stays in its own world.** A world's Boost can only hold the boosts of its own four ability managers, Golden Sprout boosts, Morning Dew and the ability of an heirloom the player carries. That is at most ×13 in Thymeford and ×14 on the Moon. So the cap is only reached in Loomington, on the Sprinkler Surge floor in Papaya Cay, and on taps during a Tap Storm.

**Why boosts add.** In version 0.1 each boost was its own multiplier, and abilities that pay income at once read the boosted rate. The independent audit showed that one player pressing every button together got about ×74,000 for 20 seconds, and about 100 days of income from a single Heave-Ho inside that window. Adding fixes both. A boost is now worth the same whenever it is used, so lining two or three up is a satisfying burst and not a requirement, and the most a burst can do is known in advance.

What boosts are worth on average is in section 6.7. A finished account that uses every ability on cooldown averages a Boost of about ×2 in its best world.

### 13.6 Why this is safe

Every bucket except three has a hard ceiling, because its content is finite: card levels, skill ranks, research projects, achievements. The three open-ended ones are milestones (paid for with exponentially rising costs), Compost and Ribbons (both gentle roots of lifetime totals). Blue Ribbon Polish is endless, but its price rises 15% a level for a fixed step, so it grows only with the logarithm of Ribbons. Timed boosts add into one capped number and lump sums pay from the steady rate (section 13.5), so no combination of buttons multiplies. Section 17.6 shows the arithmetic.

## 14. Worlds

### 14.1 The list

| # | World | Climate | Currency | Floors | Twist | Launch |
|---|---|---|---|---|---|---|
| 1 | **Thymeford**, the home town | Temperate | Coins | 10 | None. This world teaches the game | required |
| 2 | **Loomington**, the big city of mills | Urban | Notes | 8 | **Customers** queue at the door. Click to serve them for tips | required |
| 3 | **Papaya Cay**, a tropical island | Tropical | Shells | 8 | **Weather** turns, and each kind of weather favours some plant families | required |
| 4 | **Mount Mitten**, a snowy peak | Frost | Snowmarks | 8 | **Hearth Heat.** Tapping warms the mountain, and warmth multiplies profit | required |
| 5 | **The Moon**, Crater Gardens | Lunar | Moonpennies | 8 | **Floating Harvests.** Harvests float up as bubbles. Pop them yourself for more | planned |
| 6 | **Nebula Nursery**, an orbital greenhouse | Stellar | Stardust | 8 | **Orbital Sunrise.** The tower pays out all at once every orbit. Catch the sunrise for a bonus | planned |

**Launch is four worlds.** The brief asks for at least three, and more if the pacing needs them. The pacing check has an active player arriving in Mount Mitten around day 7, so a three-world game would run out of new places inside the first week. Four worlds also bring Frosted Mint, the brief's own example of a mutation. Worlds 5 and 6 are fully designed and can ship later. In a four-world build, Mount Mitten's ticket plate and the two later deeds show a "Coming soon" card with a silhouette. They cannot be bought, so nothing can be spent on them.

Worlds run in parallel. Managed floors in every unlocked world keep earning at full rate while the game is open. Taps, Combo, Spurts and visitors belong to the world on screen. Tab switches world.

### 14.2 World parameters

These feed the floor template in section 5.3.

| # | World | `D` cost scale | `T` payout taper | `COMPOST_K` | Ticket to the next world | Deed (Ribbons) |
|---|---|---|---|---|---|---|
| 1 | Thymeford | 1 | 1.00 | 5 | 5e19 Coins | none |
| 2 | Loomington | 1e5 | 0.90 | 15 | 2e19 Notes | none |
| 3 | Papaya Cay | 2e7 | 0.85 | 40 | 1e24 Shells | none |
| 4 | Mount Mitten | 5e10 | 0.80 | 100 | 2e29 Snowmarks | 8 |
| 5 | The Moon | 1e16 | 0.75 | 250 | 1e34 Moonpennies | 60 |
| 6 | Nebula Nursery | 4e20 | 0.70 | 600 | none | 600 |

- `D` is set to about ten times the profit multiplier an active player arrives with. Floors 1 to 3 of a new world then take a minute or two, and the top floor takes about an hour of play the first time. On later visits, after a Festival, the same world goes much faster. That is the power fantasy.
- `COMPOST_K` rises so that the newest world is always a good source of Compost.
- These six rows are the most sensitive numbers in the game. They come from the rough pacing check in section 17.6 and are the first thing the simulator should re-derive.

### 14.3 Tickets and deeds

- The plate above a world's top floor is the **ticket** to the next world. It is paid in the current world's currency. It shows once the top floor has been opened.
- Worlds 4, 5 and 6 also need a **deed** from the Ribbon Shop. A deed is bought once and kept forever.
- After a Harvest Festival, tickets must be bought again. Deeds are kept.
- A ticket costs far more than the world's top floor, so the plate shows three **waypoint marks** at one millionth, one ten-thousandth and one hundredth of the price. Passing a mark for the first time ever gives 5 Gems. The marks give the long climb a nearer goal.
- Arriving in a world for the first time adds its cards to the chest pool, unlocks its climate for mutation, and starts its World Mastery track.

### 14.4 Twist rules

**World 2, Customers**

- A customer joins the queue every `CUSTOMER_INTERVAL = 20 s`, while playing and while away. The queue holds `CUSTOMER_QUEUE_CAP = 15`.
- Clicking a customer (or pressing C) serves them and pays `CUSTOMER_TIP_SECONDS = 15 s` of `steadyIPS`. Holding serves 4 a second.
- Worth about +75% income to a player who keeps up, and a full queue on return is worth 225 s of income.

**World 3, Weather**

- A fixed loop: Sunshine 300 s, Rain 300 s, Breeze 300 s, Rainbow 60 s. The loop keeps turning while away.
- Sunshine favours Basil, Rosemary and Thyme. Rain favours Mint, Chamomile and Sage. Breeze favours Hemp and Lavender. Rainbow favours every family.
- A floor with at least one planted plant of a favoured family gets `WEATHER_PROFIT = x3` profit while that weather lasts. During a Rainbow, visitor timers also run twice as fast.
- Over a full loop a floor averages ×1.75 with one weather group planted, ×2.38 with two and ×3 with three. Offline earnings use these averages.

**World 4, Hearth Heat**

- Heat runs from 0 to 100. Each counted tap in this world adds `HEAT_PER_TAP = 0.5`. Heat falls by `HEAT_DECAY = 0.05` per second (100 to 0 in about 33 minutes).
- While at least one manager is hired here, Heat never falls below `HEAT_FLOOR = 20`.
- `twistMult = 1 + HEAT_PROFIT x Heat`, with `HEAT_PROFIT = 0.03`. That is ×4 at full Heat and ×1.6 at the floor.
- While away, Heat falls at the same rate and offline earnings use the falling value.

**World 5, Floating Harvests**

- A managed floor's payouts collect in a bubble above it. A bubble holds `BUBBLE_CAP_SECONDS = 120 s` of that floor's income. A full bubble pops by itself and pays ×1.
- Clicking a bubble (or pressing B for the fullest) pops it for `BUBBLE_BONUS = x2`.
- Each pop within `BUBBLE_CHAIN_WINDOW = 2 s` of the last adds +0.25, up to `BUBBLE_CHAIN_MAX = +1.0`. A fast sweep of all eight floors averages about ×2.7 a bubble, and close to ×3 of income when the top floors are popped last.
- While away, bubbles pay ×1.

**World 6, Orbital Sunrise**

- An orbit lasts `ORBIT_SECONDS = 90`. Managed floors' payouts are banked during the orbit.
- At sunrise there is a `SUNRISE_WINDOW = 3 s` window. Clicking in it pays the bank at `SUNRISE_BONUS = x2.5`, plus 0.25 for every sunrise caught in a row, up to ×4.
- If the window passes, the bank pays ×1 and the streak steps down by one. While away, every orbit pays ×1 and the streak is kept.

No twist ever takes anything away. A player who ignores a twist earns exactly what they would have earned without it.

### 14.5 World Mastery

A permanent record for each world. It never resets.

- A world has 10 stars. Star `n` is earned the first time every floor in that world is at or above level `MASTERY_LEVELS[n]` = 25, 50, 100, 250, 350, 400, 450, 500, 550, 600.
- Each star gives `MASTERY_PCT = +10%` profit in that world.
- **Star 5** gives one copy of that world's **Head**, the Exotic manager of its top floor (section 7.1). Stars 7, 9 and 10 give one more copy each. Those four copies take a Head from level 1 to level 3. The last two levels come from Starlight Chests.
- The ten levels are first-pass values from the rough script. In Thymeford an active player earns star 4 on day 5, star 5 on about day 11, star 8 on about day 19 and star 10 on about day 50. Each later world trails by one to three weeks. The low floors grow at 1.15 a level, so a threshold much above 600 cannot be reached in any sensible time. The simulator should set the ten levels from cost.

## 15. Events, offline time and the clock

### 15.1 Offline earnings

```
away           = trustedNow - lastSeen                    (never negative, section 15.2)
offlineSeconds = min(away, offlineCap)
for each unlocked world:
    earned = sum of floorIPS over managed floors x offlineEfficiency x offlineSeconds
             (with that world's twist rule from 14.4)
```

`OFFLINE_CAP_BASE = 4 h`, `OFFLINE_EFF_BASE = 0.4`. Research, skills, plants, managers, heirlooms and the Compost Shop raise both, to as much as 33 hours and 100%. The exact stacking is in section 13.4. The first research project, Sturdy Baskets, costs 50 Insight and takes the cap to 8 hours, so a player who has Replanted once is covered for a night's sleep.

- A floor without a manager finishes the cycle it was on and waits.
- These keep running for the whole time away, whatever the cap: research, bench jobs, ability cooldowns, Morning Basket timers, the customer queue and the weather loop. Insight accrues for up to 24 hours.
- These do not happen while away: visitors, Combo, Spurts, taps.
- The Welcome Back screen shows a harvest basket with a line for each world. One tap collects it with a burst.
- **Morning Dew:** after `DEW_AWAY = 1 h` or more away, the player returns to a ×2 boost in every world for `DEW_DURATION = 120 s` (section 13.5).
- **Time Warp:** 30 Gems for 1 hour or 100 Gems for 4 hours of offline-rate income, paid at once from the steady rate. It ignores the cap and does not advance research.
- A game that is open but in the background runs at the full online rate.

### 15.2 Clock rules

The design requirement is that changing the PC clock can never break a save or pay out more than one normal return.

1. Live play is timed by a clock that only counts up. Changing the PC clock while the game is running does nothing.
2. On return, `away` is the larger of what the PC clock claims and the time that provably passed. It is never negative and never more than 30 days. Earnings use at most the offline cap.
3. If the clock moves **back**, the player gets the time that provably passed, which is often none. Timers carry on from where they were. Nothing is lost, nothing is locked and nothing is paid twice.
4. If the clock moves **forward**, the player gets one capped return.
5. Daily and weekly quests, Morning Baskets and events are keyed to a guarded day counter. Moving the clock back never grants a new set. A clock that was once far ahead cannot strand the player either: the counter re-anchors, and the next reset is the next real midnight.

`docs/tech/07-offline-and-time.md` owns the mechanism (three clocks, the proven-time floor and the day counter), and the Save and Offline thread owns the implementation. These five rules are the behaviour to test. In `away` above, `trustedNow - lastSeen` is shorthand for rule 2.

### 15.3 Weekend events

Unlock at player level 12. An event runs from Friday 00:00 to Sunday 23:59 local time. Four events rotate by week number.

| Week mod 4 | Event | Bonus in the main game all weekend |
|---|---|---|
| 0 | Herb Fair | Golden Sprout Windfalls pay double |
| 1 | Night Market | Offline earnings ×1.5, applied after the efficiency cap |
| 2 | Hemp Harvest Home | Hemp-family traits ×1.5 |
| 3 | Blossom Parade | Pollen from every source ×2 |

Every event also has a **fair stall**: a five-floor mini tower with its own currency, Fair Tickets.

- It uses the world 1 template for floors 1 to 5. Its helpers are free, already hired, and collect at ×1 profit.
- Only tap skills and the passives of tap heirlooms apply to it. No Compost, Ribbons, cards, research, visitors, abilities or boosts. Growth Spurts work as usual.
- It earns while away by its own fixed rule, the same for everyone: `FAIR_OFFLINE_EFF = 50%` for up to `FAIR_OFFLINE_CAP = 12 h`.
- Lifetime Fair Tickets move the player along a 10-step reward track.

| Step | Fair Tickets | Reward | Step | Fair Tickets | Reward |
|---|---|---|---|---|---|
| 1 | 1e3 | Wooden Crate | 6 | 3e10 | 50 Gems |
| 2 | 1e5 | 20 Gems | 7 | 1e11 | Golden Chest |
| 3 | 1e7 | Copper Chest | 8 | 3e11 | 200 Pollen |
| 4 | 1e9 | 50 Pollen | 9 | 6e11 | 3 copies of the event's featured Epic card |
| 5 | 1e10 | Silver Chest | 10 | 1e12 | Crystal Chest |

With no Compost and no cards, the stall grows almost in a straight line, so the steps bunch up at the top. A rough script of the stall (`stall2.py` in the pacing-check folder) puts a new player with no upgrades at step 4 after 10 minutes of play, step 7 within an hour, and step 10 after two and a half to three and a half hours of mixed play spread across the weekend. A player who only looks in a few times finishes step 9. A week-2 player needs about two hours for the whole track and a veteran with a full tapping build about half an hour. The simulator should set the ten steps from the mixed profile. Nothing is exclusive. A missed event returns four weeks later with the same track.

## 16. Unlock order

One new thing at a time. Conditions are exact. Times are targets for a new player in their first session.

| # | Feature | Unlock condition | Target time |
|---|---|---|---|
| 1 | Tap to harvest | start | 0:05 |
| 2 | Floor levels | first harvest | 0:10 |
| 3 | Milestones panel and buy modes | any floor reaches level 25 | 0:35 |
| 4 | More floors | coins | 0:40 onward |
| 5 | Managers and chests | holding 1,000 Coins with floor 3 open (Welcome Chest). Hire buttons appear from this moment | 1:30 |
| 6 | Tap bonus and Combo | first manager hired | 1:40 |
| 7 | Quests panel (story and daily) | world 1 floor 4 opened | 2:15 |
| 8 | Plants and planters | world 1 floor 5 opened (first seed packet) | 3:30 |
| 9 | Bumper taps | player level 2 | about 4:00 |
| 10 | Garden Visitors | world 1 floor 6 opened | 5:30 |
| 11 | Manager abilities | the manager of world 1 floor 7 is hired (Old Moss, Tea Break) | about 11:00 |
| 12 | Growth Spurt | world 1 floor 8 opened | 13:00 |
| 13 | Morning Basket | 15 minutes of play | 15:00 |
| 14 | Achievements and Codex | world 1 floor 9 opened | 21:00 |
| 15 | Skill tree | player level 6 | about 26:00 |
| 16 | Offline earnings screen | first return after 5 minutes away with a manager hired | first return |
| 17 | Replant | world 1 floor 10 opened (32:00). The button is live at 60 Compost pending | about 50:00 |
| 18 | Compost Shop and Research | first Replant | about 55:00 |
| 19 | Heirlooms | third Replant (the story gives the Sprouting Trowel) | about 1 h 30 |
| 20 | World 2, Customers, World Mastery, weekly quests | ticket: 5e19 Coins | end of day 1 |
| 21 | Bees and Pollen | research "Bee Hotel" | day 1 to 2 |
| 22 | Weekend events | player level 12 | day 1 to 2 |
| 23 | Cross-pollination | research "Pollination Bench" (needs world 2) | day 2 |
| 24 | World 3, Weather | ticket: 2e19 Notes | day 3 |
| 25 | Mutation and Exotic plants | research "Mutation Chamber" (needs world 3) | day 5 to 7 |
| 26 | Harvest Festival, Ribbon Shop and the Heirloom Pick | world 3 reached and 8 Ribbons pending | day 4 to 5 |
| 27 | Auto-buy (the Auto-Gardener) | Ribbon Shop, 4 Ribbons | after the first Festival |
| 28 | World 4, Hearth Heat | deed (8 Ribbons) and ticket | week 1 to 2 |
| 29 | Head copies | 5 Mastery stars in a world (the first copy of that world's Head) | week 2 (about day 11) |
| 30 | World 5, Floating Harvests (after launch) | deed (60 Ribbons) and ticket | week 2 to 3 |
| 31 | World 6, Orbital Sunrise (after launch) | deed (600 Ribbons) and ticket | week 3 to 4 |

Nothing that is locked shows more than a silhouette and a one-line hint. The bottom bar starts with no buttons and gains them as features unlock.

Rows 1 to 10 arrive in the first six minutes. Rows 11 to 16 are spread over the next forty-five, so there is something new about every eight minutes right up to the first Replant. Achievements count from the first second of play, so several pop at once when the panel opens at floor 9.

## 17. Pacing

All times in 17.1 to 17.4 are design targets for a real new player. Section 17.6 says what a script has checked.

### 17.1 First 10 minutes

| Time | Beat | New |
|---|---|---|
| 0:05 | First harvest: +1 | Tap |
| 0:10 | First level bought | Levels |
| 0:35 | Windowsill level 25 | Milestones, buy modes |
| 0:40 | Floor 2, Balcony Boxes | |
| 1:05 | Floor 3, Backyard Hemp Patch | Hemp |
| 1:30 | Welcome Chest: the first chest opening. Two copies each of the first three managers | Chests, managers |
| 1:40 | Nana Sprig is hired and levelled up. Taps now pay a bonus and build Combo | Combo |
| 2:15 | Floor 4. Hiring Crate. First story quest pinned | Quests |
| 3:30 | Floor 5. First seed packet. Mint goes in the windowsill, hemp in the patch | Plants |
| 4:00 | Level 2. First Bumper tap: ×10 with a hit-pause | Bumpers |
| 5:30 | Floor 6. A Golden Sprout drifts past | Visitors |
| 7:00 | Level 3. A Copper Chest and 10 Gems | |
| 8:30 | Floor 7, the Tea House. Another Hiring Crate. Old Moss's card shows the first ability, Tea Break | |
| 10:00 | Seven floors, five of them managed, seven managers met, three plants, several card level-ups, level 3 | |

A new thing roughly every 60 to 90 seconds for the first six minutes, each one taught by doing it once. Then the pace eases on purpose: minutes 6 to 13 are for playing with what is already there, and the only new thing in them is the first ability. The skill tree, achievements and the Codex wait for the quieter stretch before the first Replant (section 17.2).

### 17.2 First hour

| Time | Beat |
|---|---|
| 11 min | Old Moss is hired. The first ability button: Tea Break fills the Combo meter |
| 13 min | Floor 8, the Ropewalk. First Growth Spurt |
| 15 min | The Morning Basket appears |
| 21 min | Floor 9. Achievements and the Codex open, and the first handful of achievements pop at once |
| 26 min | Level 6. The skill tree opens with five points to spend |
| 32 min | Floor 10, Sprout Tower HQ, run by Granny Evergreen, the Head of Thymeford. The ticket plate to Loomington appears far out of reach, with its first waypoint mark. Pip mentions the compost heap, and the Replant button shows a bar toward 60 Compost |
| 32 to 50 min | Push floors to 50 and 100, hit the first tower milestones. Pending Compost climbs to 60 |
| 50 to 60 min | **First Replant.** ×2.2 profit, two levels of Rich Soil, the Compost Shop and Research open |
| 60 min | Level 8. All ten Thymeford managers met, 5 plants. The second run reaches HQ in about 12 minutes |

### 17.3 Day 1 (about 3 hours of play)

- 6 to 10 Replants. Compost goes from 60 to tens of thousands.
- Heirlooms unlock at the third Replant. Two slots filled by the end of the day.
- First research: Soil Science I, Sturdy Baskets, Bee Hotel.
- First return from a break shows offline earnings and Morning Dew.
- Level about 18. Commons at card level 2 to 3.
- The day ends at or near the ticket to **Loomington**.

### 17.4 Week 1

| Day | Active player | New |
|---|---|---|
| 1 to 2 | Arrives in Loomington | Customers, World Mastery, weekly quests, 8 new floors |
| 2 | Pollination Bench built. First hybrid on day 2 to 3 | Cross-pollination |
| 3 | Arrives in Papaya Cay | Weather |
| 4 to 5 | **First Harvest Festival.** 8 Ribbons, Golden Hour, auto-buy, and a Legendary heirloom of the player's choice | Ribbon Shop, Heirloom Pick |
| 5 to 7 | Mutation Chamber built. First Exotic plant around day 7 (Ember Basil is the easy one) | Exotics |
| 6 to 7 | Deed and ticket to Mount Mitten | Hearth Heat |
| 7 | Level about 40. Commons at level 5, Old Moss (Rare) at level 4, Clementine Zest (Legendary) at level 2. 12 to 15 research projects done. 3 to 4 Festivals | |

### 17.5 Weeks 2 to 8

| When (active player) | Beat |
|---|---|
| Week 2 | The first Head copy, for Granny Evergreen, around day 11 (Mastery star 5 in Thymeford). Frosted Mint and Crystal Sage from the Frost climate. A first full heirloom set. Festivals every one to two days. The Moon, once it ships |
| Week 3 | Mastery stars 7 and 8 in Thymeford, star 5 in Loomington and Papaya Cay. All six heirloom slots. Nebula Nursery, once it ships |
| Week 4 | Level about 70. Research about half done. Commons at level 8 to 9. Festivals every three to five days |
| Weeks 5 to 8 | Mastery stars 9 and 10 in Thymeford and stars 6 to 8 in the later worlds. Last research projects. Level about 90, with the cap of 112 around month 3. Hybrids and Exotics levelling up |

With four worlds at launch, new places stop arriving around day 7. From there the game is carried by Exotic plants, levelling the Heads, heirloom sets, World Mastery, research (two to three months), the Ribbon Shop and card levels. Worlds 5 and 6 slot into weeks 2 and 3 when they ship.

Card levels over time for an active player (about 100 cards a day). The figures are for Thymeford's managers, who are met first. Managers of later worlds trail them, because the copies of a rarity are shared among every met manager of that rarity. This is rough arithmetic from the chest odds, not a measurement.

| Rarity | Week 1 | Month 1 | Manager profit at that level |
|---|---|---|---|
| Common | level 5 | level 7 to 8 | ×4.1, then ×6.0 to ×7.2 |
| Uncommon | level 4 | level 6 | ×4.3, then ×6.2 |
| Rare | level 4 | level 5 to 6 | ×5.2, then ×6.2 to ×7.5 |
| Epic | level 3 | level 4 | ×5.2, then ×6.4 |
| Legendary | level 2 | level 3 | ×5.1, then ×6.6 |
| Exotic (the Head) | level 1 | level 2 | ×5, then ×7.2 |

### 17.6 What has been checked, and how

A rough pacing script was run for this document. **It is a sanity check, not the balance simulator.** It models floors, levels, milestones, hires, taps, Replant, Compost, Rich Soil, tickets, deeds, Festivals, Ribbons and Golden Hour exactly as written here. Everything else enters as the multiplier budget below.

**Player profiles** (the simulator should use the same three):

| Profile | Play per day | Tapping | First session |
|---|---|---|---|
| Active | 6 sessions of 30 minutes | whole session, 6 taps a second | 60 minutes |
| Mixed | 8 sessions of 6 minutes | half of each session | 30 minutes |
| Idle | 3 sessions of 4 minutes | none | 15 minutes |

The script buys greedily (lowest wait plus payback time), Replants when pending Compost is at least equal to current Compost, and holds a Festival when pending Ribbons are at least equal to current Ribbons.

**Multiplier budget.** The systems that never reset must add up to roughly this. The simulator should measure the real systems against it.

| Day | Manager profit on a typical floor | Everything else that never resets, plus the capped Compost Shop items other than Rich Soil | Tap income as a multiple of `steadyIPS`, before Spurts and boosts |
|---|---|---|---|
| 0 | ×2 | ×1 | 1.1 |
| 1 | ×2.5 | ×4 | 2.5 |
| 3 | ×3.4 | ×16 | 3.3 |
| 7 | ×5 | ×120 | 5 |
| 14 | ×6.2 | ×700 | 6.5 |
| 30 | ×9 | ×7,000 | 10 |
| 60 | ×13 | ×20,000 | 14 |

**The manager column has not been measured for version 0.3.** It was set when a manager could be seated on any floor, and the rough script has not been run again. With one fixed manager per floor, the floors that earn the most have the rarest managers. Those start at ×3 to ×5 on day 0, where the column says ×2. By day 7 the two agree (×4 to ×5). At day 30 the fixed managers are a little lower (×6 to ×7.5 against ×9), because rare cards level slowly (section 17.5). So the first days should run a little ahead of the results below, and the second month a little behind. Measuring this column again is the simulator's first job on version 0.3. The knobs are `MGR_BASE` and `MGR_STEP` (section 7.2).

**Where the budget comes from.** This is a rough estimate of the middle column, built from the rows in CONTENT.md for an active player. The budget is the product of these parts.

| Part | Day 7 | Day 30 |
|---|---|---|
| Research (Soil Science, Crop Rotation) | ×4.9 | ×10 |
| Achievements and Codex | ×1.65 | ×2.1 |
| World Mastery | ×1.45 | ×1.7 |
| Skills (profit, speed, tower milestones) | ×1.7 | ×2.5 |
| Heirlooms and set bonuses | ×1.6 | ×4 |
| Plants and manager perks | ×1.6 | ×3.5 |
| World twists | ×1.5 | ×1.6 |
| Timed boosts, as average uptime (section 6.7) | ×1.3 | ×1.5 |
| Cheaper levels (a discount is worth about as much as the same factor of income) | ×1.5 | ×2.2 |
| Master Composter | ×1 | ×1.75 |
| **Product** | **about ×150** | **about ×11,500** |

Both land within about a factor of two of the budget (×120 and ×7,000), on the high side. So the content can carry the pacing in the results below, and the simulator is more likely to trim a little than to need more. The timed-boost row is the tower average in the world on screen (section 6.7), discounted because nobody presses every button on cooldown. The row for plants and manager perks was estimated for version 0.2 and has not been estimated again for the fixed perks. If the simulator finds it high, ability strengths in CONTENT.md 2.2 are the first thing to trim, before `BOOST_CAP`.

**Results** (days from first launch):

| Event | Active | Mixed | Idle |
|---|---|---|---|
| World 1 top floor | 17 min | 30 min | 11 h |
| First Replant | 36 min | 4.4 h | 16 h |
| World 2 | day 0.5 | day 1.4 | day 3.2 |
| World 3 | day 2.6 | day 4.1 | day 5.2 |
| First Festival | day 4.1 | day 5.4 | day 8.2 |
| World 4 | day 6.7 | day 10.1 | day 16.2 |
| World 5 | day 12.2 | day 18.1 | day 27.2 |
| World 6 | day 19.5 | day 30.5 | day 52.2 |
| Festivals by day 30 | 13 | 11 | 7 |

This table was run again for version 0.2 with the new offline start (40% for 4 hours, rising to 100% for 24 hours over three weeks) and with the first Replant held to 60 Compost. The biggest move is 1.2 days (World 6 for the mixed profile).

The script plays perfectly. A real new player is about twice as slow in the first ten minutes and about 1.5 times as slow in the first hour, which is where the targets in 17.1 and 17.2 come from.

**What the check found**

1. **No runaway, with these exponents.** A first draft used a square root for Compost, an uncapped Rich Soil and a square root for Ribbons. It reached ten Festivals on day 1. The cause is simple arithmetic. If income grows as `lifetime ^ e`, growth stays polynomial only while `e < 1`. Here `e` is about 0.15 (milestones) + 0.4 (Compost) + 0.2 (Ribbons, the square root of a 0.4 power) = 0.75. Any uncapped multiplier bought with Compost or Ribbons adds to `e`. **Rule for all future content: nothing bought with Compost or Ribbons may multiply profit by a fixed factor per level unless it has a level cap.** Blue Ribbon Polish is the one endless item. It adds a fixed step for a price that rises 15% a level, so it adds about 0.01 to `e`.
2. **No dead zone longer than about 20 minutes inside a run.** The longest wait is saving for level 100 on several floors late in the first run. That is exactly when the Replant button is glowing.
3. **Idle players are slower but not left behind.** Idle reaches each world in roughly two to three times the active player's days.
4. **Festivals are frequent in week 2** (about one a day for the active profile) while Golden Hour's five doublings are being bought, then stretch to every three to eight days. If that feels too fast in play, raise the Golden Hour prices first.
5. **Timed boosts are bounded by rule, not by this script.** The script has no abilities in it. Section 13.5 makes every timed boost add into one number capped at ×15, with the Growth Spurt as the only multiplier on top, and makes lump sums pay from the steady rate. The uptime arithmetic in section 6.7 (`boost_avg.py`) puts the average Boost near ×2.4 at day 30 and ×3 for a finished account.
6. **The script's tap model is on the low side for Golden Sprouts.** It counts them at 0.3 times idle income. Section 6.7 now puts them near 1.2 times with every one caught. That makes a real active player a little faster than the Active column, by about a quarter of income.
7. **World Mastery and the fair stall were sized with the same rough scripts** (`mastery_track.py` and `stall2.py`). The Mastery levels in section 14.5 and the track steps in section 15.3 are first-pass values from them.

**Not checked by any script:** XP and level pacing, Insight income, chest and card rates, heirloom rates, Pollen, Gem flow, twist values, Master Composter, Blue Ribbon Polish, the tap caps, the Combo ramp and the offline build (how soon a player reaches 100%). Boost uptime, Mastery levels and the event track have rough arithmetic only. All of these are estimates from the formulas in this document, and the simulator should run each of them with both tap rates (6 and 12 a second).

## 18. Currency sources and sinks

| Currency | Sources | Sinks |
|---|---|---|
| World currency | Harvests, taps, Windfalls, customer tips, abilities, offline earnings, Time Warp, Head Start | Floor levels, floor opens, hire fees, the ticket to the next world |
| Gems | Daily quests (50 a day), weekly quests (200 a week), level-ups (10), achievements (5 to 50), codex entries (5), story quests, Dewdrops, ticket waypoints (5), event track | Chests (40, 120, 350, 1,000), Time Warp (30, 100), respec (100) |
| Compost | Replant | Compost Shop. Spending never lowers the passive bonus |
| Ribbons | Harvest Festival | Ribbon Shop, including one endless item. Spending never lowers the passive bonus. The shop's fixed items are all bought by about week 3, and Blue Ribbon Polish carries on from there. Cosmetic tower decorations are the planned next sink after launch (AUDIT.md section 6) |
| Insight | Passive, from record milestones | Research projects |
| Pollen | Copies of max-level cards and heirlooms, Busy Bees, chests (Copper and better), daily quests, events | Hybrid jobs (400), Exotic jobs (1,500), copies of owned cards (5 to 1,000), copies of owned heirlooms (100 to 2,000) |
| Skill Points | Player level | Skill tree. Refunded by respec |
| Card and heirloom copies | Chests, Hiring Crates, bench jobs, Mastery stars, the Heirloom Pick, Pollen | Card and heirloom levels |
| Fair Tickets | Fair stall | None. They only move the reward track |

Expected flow for an active player in week 1: about 150 to 200 Gems a day (about 100 a day later), 200 to 400 Pollen a day once bees are out, 1,700 Insight a day rising to about 5,000 by week 2.

Every currency has at least one sink that lasts past month 1: card levels for copies, Exotic copies for Pollen, the last research tiers for Insight, Blue Ribbon Polish for Ribbons, and Crystal Chests for Gems.

## 19. Tuning knobs

In the order to reach for them. Change one at a time.

| # | Knob | Constant | Effect |
|---|---|---|---|
| 1 | World cost scale | `D` per world | How long the first climb of a world takes |
| 2 | Ticket prices | per world | When each world arrives |
| 3 | Compost threshold | `COMPOST_E0` | When the first Replant is worth doing |
| 4 | Ribbon threshold | `RIBBON_C0` | When the first Festival arrives |
| 5 | Golden Hour prices | Ribbon Shop | How fast Festivals follow each other in week 2 |
| 6 | Compost exponent | `COMPOST_EXP` | The whole long-term curve. Very sensitive. Stay between 0.35 and 0.45 |
| 7 | Hire ratios | `HIRE_RATIO` | How long each floor is tapped by hand |
| 8 | Tap base | `TAP_SECONDS` | How much active play is worth |
| 9 | Payout ratio and taper | 0.75, `T` | How good a new floor feels, and how steep the top of a world is |
| 10 | Milestone strength | `MILESTONE_MULT`, `TOWER_MILESTONE_MULT` | How rewarding levelling is. Raises the in-run exponent, so handle with care |
| 11 | Chest rates and duplicate curves | section 8 | Collection speed |
| 12 | Research times | CONTENT.md section 6 | The idle cadence |
| 13 | Ability strengths, then the Boost cap | CONTENT.md section 2.2, `BOOST_CAP` | What timed boosts add on average, and how big a lined-up burst can get |
| 14 | Mastery levels and event steps | `MASTERY_LEVELS`, section 15.3 | When Head copies arrive, and how long a weekend event takes |
| 15 | Manager level 1 values and steps | `MGR_BASE`, `MGR_STEP` | How strong the first day is, and what a manager copy is worth |

## Appendix A. Constants

| Constant | Value | Section |
|---|---|---|
| `MILESTONES` | 25, 50, 100, then every 100 | 5.2 |
| `MILESTONE_MULT` | 2 | 5.2 |
| `TOWER_MILESTONE_MULT` | 1.5 | 5.2 |
| `MIN_CYCLE` | 0.2 s | 5.2 |
| `COST_MULT_FLOOR` | 0.25 | 5.2 |
| `HIRE_RATIO` (floors 2 to 10) | 200, 125, 70, 40, 25, 17, 14, 12, 12 | 5.3 |
| `CONSTRUCTION_TIME` | 1.5 s | 5.5 |
| `HOLD_RATE` | 6 taps per second | 6.1 |
| `TAP_RATE_CAP` | 12 taps per second | 6.1 |
| `TAP_SECONDS` | 0.05 | 6.2 |
| `COMBO_TAPS_PER_STACK` | 5 | 6.3 |
| `COMBO_PER_STACK` | 0.1 | 6.3 |
| `COMBO_CAP_BASE` | 20 | 6.3 |
| `COMBO_GRACE` | 1.5 s | 6.3 |
| `COMBO_DECAY` | 10 stacks per second | 6.3 |
| `CRIT_CHANCE_BASE` | 0.03 | 6.4 |
| `CRIT_MULT_BASE` | 10 | 6.4 |
| `CRIT_CHANCE_CAP`, `CRIT_MULT_CAP` | 0.12, 20 | 6.4 |
| `SPURT_TAPS` | 300 | 6.5 |
| `SPURT_DURATION` | 20 s | 6.5 |
| `SPURT_SPEED` | 3 | 6.5 |
| `VISITOR_MIN`, `VISITOR_MAX` | 90 s, 150 s | 6.6 |
| `VISITOR_LIFETIME` | 12 s | 6.6 |
| `WINDFALL_SECONDS` | 60 | 6.6 |
| `BEE_POLLEN` | 5 | 6.6 |
| `MGR_BASE` | 2, 2.5, 3, 3.5, 4, 5 | 7.2 |
| `MGR_STEP` | 1.2, 1.2, 1.2, 1.22, 1.28, 1.43 | 7.2 |
| `PERK_PER_LEVEL` | 0.1 | 7.2 |
| `CHEST_MANAGER_SHARE` | 0.55 | 8.3 |
| `NEW_CARD_CHESTS` | 10 | 8.3 |
| `PITY_EPIC` | 60 cards | 8.3 |
| `PITY_LEGENDARY` | 300 cards | 8.3 |
| `PITY_HEIRLOOM` | 10 heirloom pieces | 8.3 |
| `BASKET_HOURS`, `BASKET_STORE` | 4, 2 | 8.3 |
| `AFFINITY_BONUS` | 1.5 | 8.5 |
| `DUAL_TRAIT_FACTOR` | 0.7 | 8.5 |
| `TRAIT_PER_LEVEL` | 0.2 | 8.5 |
| `RARITY_FACTOR` | 1, 1.5, 2.2, 3.2, 5, 8 | 8.5 |
| `HYBRID_POLLEN`, `HYBRID_HOURS` | 400, 8 | 8.6 |
| `EXOTIC_POLLEN`, `EXOTIC_HOURS` | 1,500, 24 | 8.6 |
| `HYBRID_PARENT_LEVEL`, `EXOTIC_PARENT_LEVEL` | 2, 3 | 8.6 |
| `HEIRLOOM_SLOTS_BASE` | 2 | 8.7 |
| `HEIRLOOM_PER_LEVEL` | 0.15 | 8.7 |
| `XP_BASE`, `XP_PER_LEVEL` | 500, 250 | 9.1 |
| `XP_DAILY`, `XP_DAILY_ALL` | 1,000, 1,000 | 11.2 |
| `XP_ACHIEVEMENT` | 100, 200, 400, 750, 1,500 by tier | 11.4 |
| `REPLANT_XP_STEP` | 150 | 9.1 |
| `LEVEL_CAP` | 112 | 9.1 |
| `RESPEC_GEMS` | 100 | 9.2 |
| `INSIGHT_PER_MILESTONE` | 1 per hour | 10 |
| `INSIGHT_TANK_HOURS` | 24 | 10 |
| `RESEARCH_QUEUE` | 3 | 10 |
| `ACHIEVEMENT_PCT` | 0.01 | 11.4 |
| `CODEX_PCT` | 0.0025 | 11.5 |
| `COMPOST_E0` | 2e10 | 12.1 |
| `COMPOST_EXP` | 0.4 | 12.1 |
| `COMPOST_K` (worlds 1 to 6) | 5, 15, 40, 100, 250, 600 | 12.1 |
| `COMPOST_PCT` | 0.02 | 12.1 |
| `FIRST_REPLANT_MIN` | 60 | 12.1 |
| `RICH_SOIL` | 1.25 per level, 10 levels | 12.1 |
| `GREEN_DEAL` | 0.96 per level, 10 levels | 13.3 |
| `RIBBON_C0` | 50,000 | 12.2 |
| `RIBBON_EXP` | 0.5 | 12.2 |
| `FIRST_FESTIVAL_MIN` | 8 | 12.2 |
| `RIBBON_PCT` | 0.10 | 12.2 |
| `MASTER_COMPOSTER_PCT` | 0.005 per level, 5 levels | 13.1 |
| `BLUE_POLISH_PCT` | 0.002 per level, endless | 13.1 |
| `TOWER_MILESTONE_CAP` | 2.0 | 13.2 |
| `TAP_POWER_CAP`, `COMBO_CAP_MAX` | 3, 50 | 13.4 |
| `BOOST_CAP` | 15 | 13.5 |
| `SPURT_DURATION_CAP`, `SPURT_TAPS_MIN`, `SPURT_SPEED_CAP` | 45 s, 150, 4 | 13.4 |
| `AUTO_BUY_SHARE` | 0.10 | CONTENT.md 8 |
| `MASTERY_LEVELS` | 25, 50, 100, 250, 350, 400, 450, 500, 550, 600 | 14.5 |
| `MASTERY_PCT` | 0.10 | 14.5 |
| `CUSTOMER_INTERVAL` | 20 s | 14.4 |
| `CUSTOMER_QUEUE_CAP` | 15 | 14.4 |
| `CUSTOMER_TIP_SECONDS` | 15 | 14.4 |
| `WEATHER_PROFIT` | 3 | 14.4 |
| `HEAT_PER_TAP`, `HEAT_DECAY`, `HEAT_FLOOR`, `HEAT_PROFIT` | 0.5, 0.05 per second, 20, 0.03 | 14.4 |
| `BUBBLE_CAP_SECONDS`, `BUBBLE_BONUS` | 120, 2 | 14.4 |
| `BUBBLE_CHAIN_WINDOW`, `BUBBLE_CHAIN_MAX` | 2 s, +1.0 | 14.4 |
| `ORBIT_SECONDS`, `SUNRISE_WINDOW`, `SUNRISE_BONUS` | 90, 3 s, 2.5 | 14.4 |
| `OFFLINE_CAP_BASE`, `OFFLINE_CAP_MAX` | 4 h, 36 h | 15.1, 13.4 |
| `OFFLINE_EFF_BASE` | 0.4 | 15.1 |
| `DEW_AWAY`, `DEW_DURATION` | 1 h, 120 s | 15.1 |
| `FAIR_OFFLINE_EFF`, `FAIR_OFFLINE_CAP` | 0.5, 12 h | 15.3 |
