# Sprout Tower: Game Design Document

Version 0.1, Phase 0. Owner: Game Designer thread. Companion files: [AUDIT.md](AUDIT.md) (why the premise changed) and [CONTENT.md](CONTENT.md) (every content row: floors, managers, plants, heirlooms, skills, research, shops, quests, achievements).

## 0. How to read this document

- **Rules and formulas live here. Rows live in CONTENT.md.** If the two ever disagree, this file wins for rules and CONTENT.md wins for row values.
- **Every tunable number has a constant name** in `CODE_STYLE`. Appendix A lists all of them in one table. The simulator and the game should read these names from data, not hard-code them.
- **Numbers are big numbers** (mantissa and exponent). Nothing is rounded internally except where a formula says `floor`. Display rounding is a UI matter.
- **"Profit"** means a multiplier on a floor's payout. **"Speed"** means a multiplier on how fast a floor's cycle runs. **"IPS"** means income per second.
- **Scopes.** An effect is `floor` (one floor), `world` (every floor in one world), or `global` (everything).
- **Names are defaults.** The Writer may polish names and the Art Director owns how everything looks. Ids are stable.
- Section 13 says exactly how bonuses stack. Read it before implementing any multiplier.
- Section 17.6 separates what a rough pacing script has checked from what is still a first guess.

## 1. Vision and pillars

**One line:** grow a single windowsill planter into a hemp and herb brand that reaches the stars, one satisfying tap at a time.

**Feel priority:** Clicker, then RPG, then Idle. When two features compete, the one higher in this order wins.

| # | Pillar | What it means in practice | Test |
|---|---|---|---|
| 1 | **Every tap is a treat** | Tapping pays for the whole game and has its own toys: Combo, Bumper taps, Growth Spurts, Golden Sprouts | A player with every floor automated still wants to tap |
| 2 | **Collect, plant, combine** | Managers, plants and heirlooms are a collection you build a tower out of. Where things go matters | Two players at the same stage have different-looking towers |
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
7. No featured number is 420. Floor 2's base payout is 50 for this reason.

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
| joint, roll, rolling (for paper goods) | notebook, wrapping paper, kite paper |
| flower (as a hemp product) | fibre, seed, stalk |
| cannabis and every other name for it | hemp |
| essence, still, flask, lab (near hemp, or as a product) | workshop, kettle, soap mould |
| hydro, press, grinder, trim (as names for tools, floors or products) | (not used) |

The paper workshop makes notebooks, wrapping paper and kites. The soap floor uses lavender and hemp-seed oil. Hemp is never shown in a laboratory.

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

A floor is one business in the tower. It has a level, a manager desk and one to three planters. World 1 has 10 floors. Every later world has 8.

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
| `levelBaseCost` | `4 x D` | `1.15 x openCost` | `1.15 x openCost` |
| `growth` | 1.07 | 1.15 | `1.15 - 0.01 x (n-2)`, so 1.14, 1.13, ... 1.07 at floor 10 |
| `hireFee` | `1,000 x D` | `HIRE_RATIO[n] x openCost` | `HIRE_RATIO[n] x openCost` |

`HIRE_RATIO` for floors 2 to 10: `200, 125, 70, 40, 25, 17, 14, 12, 12`.

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
| 2 | Balcony Boxes | 60 | 50 | 3 | 69 | 1.15 | 12,000 |
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

- A tap is a left click or Space on the tower, or on a specific floor.
- **Hold to tap:** holding the button or key taps at `HOLD_RATE = 6` per second. Holding on a floor also harvests it whenever it is ready.
- At most `TAP_RATE_CAP = 12` taps per second are counted. Extra taps are ignored.

### 6.2 Tap bonus

Unlocks when the first manager is hired. Before that, taps only harvest.

```
worldIPS  = sum of floorIPS over every open floor in the current world
            (a floor without a manager counts at its own floorIPS, with no manager multiplier)

tapValue  = TAP_SECONDS x tapPowerMult x worldIPS
          x comboMult x (critMult if Bumper, else 1) x tapBuffs
```

`TAP_SECONDS = 0.05`. A tap is worth one twentieth of a second of the whole tower's income before any bonus. Tapping an unmanaged floor that is ready also harvests it.

`worldIPS` is the rate **right now**, with every active buff in it (a Growth Spurt, a Sunbeam, an ability). So anything that speeds up the tower makes taps worth more by the same factor, and no buff is counted twice. `tapBuffs` holds only buffs that name tap value, such as a Tap Storm.

Because the tap is tied to `worldIPS`, it scales with everything the player builds and never goes stale.

### 6.3 Combo

```
each counted tap:   stacks = min(comboCap, stacks + 1)
no tap for COMBO_GRACE seconds:   stacks fall by COMBO_DECAY per second
comboMult = 1 + COMBO_PER_STACK x stacks
```

`COMBO_PER_STACK = 0.1`, `COMBO_CAP_BASE = 20` (so ×3 at full), `COMBO_GRACE = 1.5 s`, `COMBO_DECAY = 10` stacks per second. The HUD meter has 10 segments, each worth a tenth of the current cap.

### 6.4 Bumper taps (crits)

Each counted tap has `critChance` to be a Bumper, which multiplies that tap by `critMult`.

`CRIT_CHANCE_BASE = 0.03`, `CRIT_MULT_BASE = 10`. `critChance` is capped at `CRIT_CHANCE_CAP = 0.12` and `critMult` at `CRIT_MULT_CAP = 20`.

### 6.5 Growth Spurt (frenzy)

- Every counted tap adds 1 to the Spurt meter. The meter does not fill during a Spurt.
- At `SPURT_TAPS = 300` the meter is full. The player triggers it with a click or the F key. A setting triggers it automatically.
- For `SPURT_DURATION = 20 s`, every floor in the current world runs at `SPURT_SPEED = 3` times speed. Taps are worth three times as much too, because a tap pays a slice of what the tower earns right now (section 6.2).
- Holding to tap fills the meter in 50 s, so a Spurt is active about 29% of the time.

### 6.6 Garden Visitors

Clickable visitors drift across the tower. They appear only while the game window has focus.

- A spawn timer picks a delay uniformly between `VISITOR_MIN = 90 s` and `VISITOR_MAX = 150 s`, multiplied by `visitorIntervalMult`.
- A visitor stays for `VISITOR_LIFETIME = 12 s`.
- The visitor type and outcome are rolled when it spawns.

| Visitor | Unlock | Weight | Outcome when caught |
|---|---|---|---|
| Golden Sprout: Windfall | floor 6 | 55 | Coins worth `WINDFALL_SECONDS = 60 s` of `worldIPS` |
| Golden Sprout: Sunbeam | floor 6 | 20 | All profit in this world ×5 for 30 s |
| Golden Sprout: Tap Storm | floor 6 | 15 | Tap value ×10 for 15 s |
| Dewdrop | floor 6 | 7 | 2 Gems |
| Mystery Crate | floor 6 | 3 | 1 Wooden Crate |
| Busy Bee | research "Bee Hotel" | separate timer, 240 to 360 s | `BEE_POLLEN = 5` Pollen |

A Golden Sprout that is missed is simply gone. Nothing is lost.

### 6.7 What tapping is worth

With no upgrades, holding to tap gives:

```
tap income  = 6 taps/s x 0.05 s x comboMult 3 x Bumper average 1.27  = 1.14 x worldIPS
with Spurts = (1 + 1.14) x 1.57 = about 3.4 x idle income, plus about 0.3 x from Golden Sprouts
```

| Build | Active income compared with idle |
|---|---|
| No upgrades | about 3.5× |
| Mid game, some Green Thumb skills | 6× to 10× |
| Full tapping build with the tapping heirloom set | about 25×. The caps in section 13.4 bound it near 50× |

Idle builds get the mirror image: up to 100% offline efficiency, a 24 hour cap, and stronger managers.

## 7. Managers

### 7.1 Rules

1. Managers are cards. There are 30 (27 at launch). Rows are in CONTENT.md section 2.
2. Each floor has one manager desk. To fill it, pay the floor's `hireFee` in that world's currency, then pick a manager you own. The fee is paid once per run. It is paid again after a Replant.
3. A manager can sit at one desk per world. The same manager can work in every world at once.
4. Swapping managers between desks you have already paid for is free and instant.
5. A floor with a manager harvests itself.
6. The manager multiplies that floor's profit and adds a perk. Rare and better managers also have an **ability**: a button with a cooldown.
7. **You can never be stuck without a manager.** The Welcome Chest gives three fixed Common managers. The first time each of floors 4 to 10 opens in world 1, a Hiring Crate gives one guaranteed new manager (lowest rarity not yet owned, lowest number first) plus two random cards. So a player always owns at least as many managers as world 1 has open floors, and the first ten are the same for everyone (CONTENT.md section 2.3).

### 7.2 Numbers

```
managerProfit = MGR_BASE[rarity] x MGR_LEVEL_MULT ^ (level - 1) x managerPowerMult
perkValue     = perkBase x (1 + PERK_PER_LEVEL x (level - 1))
```

`MGR_LEVEL_MULT = 1.2`, `PERK_PER_LEVEL = 0.1`.

| Rarity | `MGR_BASE` | Max level | Profit at max level | Ability |
|---|---|---|---|---|
| Common | 2 | 15 | ×25.7 | no |
| Uncommon | 2.5 | 13 | ×22.3 | no |
| Rare | 3 | 11 | ×18.6 | yes |
| Epic | 4 | 9 | ×17.2 | yes |
| Legendary | 6 | 7 | ×17.9 | yes |
| Exotic | 10 | 5 | ×20.7 | yes |

All rarities end near the same ceiling on purpose. Rarer managers get there with far fewer copies and bring better perks and abilities, so a Common is never useless and a Legendary is always exciting.

Abilities have fixed strength. Cooldowns keep running while the game is closed. Ability hotkeys are the number keys in floor order.

## 8. Cards, chests and the collection

### 8.1 Rarities

| Rarity | Colour cue (Art Director owns the look) | Where it comes from |
|---|---|---|
| Common | grey | chests |
| Uncommon | green | chests |
| Rare | blue | chests |
| Epic | purple | chests |
| Legendary | gold | chests; hybrid plants from cross-pollination |
| Exotic | rainbow | never from chests. Plants by mutation, managers by World Mastery |

Rarity is also shown by frame shape and a pip count, so it never depends on colour alone.

### 8.2 Duplicate curves

Copies needed to go from level `L` to `L + 1`. The first copy unlocks the card at level 1. The same curves serve managers and plants.

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
| 6 | Starlight Chest | 20 | 2 Legendary, and 1 copy of an Exotic manager you have already earned | 15% | 25% | 30% | 20% | 10% | 500 | 100%, Epic or better |

Rules, in order:

1. **Guarantee slots** are rolled first, among the guaranteed rarity and better, in the same proportions as the table.
2. **Card type.** Each slot is a manager with probability `CHEST_MANAGER_SHARE = 0.55`, otherwise a plant. Before planters unlock, every slot is a manager.
3. **Which card.** Uniform among cards of that rarity and type that are in the pool. A card is in the pool when its `poolWorld` is unlocked. Exotics and hybrids are never in the pool. If the pool has no card of that rarity and type, the slot gives the other type. That is how a Legendary plant slot becomes a Legendary manager.
4. **New-card help.** In a player's first `NEW_CARD_CHESTS = 10` chests, a slot whose rarity has an unowned card always gives an unowned card.
5. **Pity.** Two counters count cards drawn since the last Epic-or-better and since the last Legendary. At `PITY_EPIC = 60` the next card is Epic. At `PITY_LEGENDARY = 300` the next card is Legendary. Both counters are shown on the chest screen.
6. **Luck.** `chestLuck` multiplies the Rare, Epic and Legendary weights by `1 + chestLuck`. The Common weight shrinks to keep the total at 100%.
7. **Heirloom.** If the heirloom roll succeeds, the chest also holds one heirloom piece: Rare 70%, Epic 25%, Legendary 5% (Starlight: Epic 70%, Legendary 30%). Before heirlooms unlock, this roll is skipped.
8. **Shown odds.** The chest screen shows this table with the player's current luck applied.

**Special chests**

| Chest | Contents |
|---|---|
| Welcome Chest | Managers Nana Sprig, Basil Brumble and Olive Ledger. Fixed |
| Hiring Crate | 1 new manager (lowest rarity not owned, lowest number first), plus 2 Wooden Crate slots |
| Morning Basket | 1 Wooden Crate. One becomes ready every `BASKET_HOURS = 4` hours. Up to `BASKET_STORE = 2` wait for the player |
| First seed packet | Plants Garden Mint and Fibre Hemp. Fixed |

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
| Harvest Festival | Golden. Crystal on the first Festival. Starlight on every fifth | every few days |

Expected cards per day for an active player in week 1: about 90 to 120. Section 17.5 shows what that does to card levels.

### 8.5 Plants

1. Plants are cards. There are 38 (34 at launch). Rows are in CONTENT.md section 3.
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

**Pollen can also buy copies of a card you already own:** Common 5, Uncommon 15, Rare 50, Epic 200, Legendary 1,000 Pollen each. Exotic copies cannot be bought.

### 8.7 Heirlooms

Heirlooms are the game's artifacts: old garden tools with a little magic. There are 18, in six sets of three. Rows are in CONTENT.md section 4.

1. Heirlooms are equipped in global slots. `HEIRLOOM_SLOTS_BASE = 2`. Research adds two and the Ribbon Shop adds two, for six.
2. Every heirloom has a passive. The Legendary piece of each set also has an **ability** with a cooldown. Hotkeys Q, W, E, R, T, Y in slot order.
3. Each set gives a bonus for two pieces equipped and another for all three.
4. Heirlooms level up with copies. A numeric passive is multiplied by `1 + HEIRLOOM_PER_LEVEL x (level - 1)`, with `HEIRLOOM_PER_LEVEL = 0.15`. Set bonuses and abilities do not scale.
5. Swapping is free, but an ability's cooldown is kept on the heirloom.

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
| Daily quest | 1,500 each, plus 1,500 for finishing all three |
| Weekly quest | 5,000 each, plus 10,000 for finishing all five |
| Floor milestone, first time ever for that floor and tier | 50 × tier number (tier 1 is level 25, tier 2 is 50, tier 3 is 100, tier 4 is 200, ...) |
| Replant | `100 x floor(log2(1 + Compost gained))`, at most 2,000 |
| Chest opened | 20 × chest tier |
| Visitor caught | 5 |
| Achievement | 200, 400, 800, 1,500, 3,000 by tier |
| World Mastery star | 1,000 |

Every level-up gives 1 Skill Point, 10 Gems and a chest (section 8.4). `LEVEL_CAP = 112`, which is exactly enough points for the whole tree.

XP rewards are fixed amounts for records and quests, so resetting quickly does not farm levels.

Expected level: 7 to 9 after the first hour, about 18 after day 1, about 40 after week 1, about 70 after a month, and the cap around month 3.

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
5. The tree unlocks at level 3, with the two points already earned waiting.

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

A single chain that teaches the game and unlocks features. One story quest is active at a time. It is pinned to the HUD with a progress bar. Rows are in CONTENT.md section 9. The chain has 44 fixed steps (41 at launch), then a repeating "chapter" goal for each world (all floors to level 100, 200, 300 and so on) that gives a Silver Chest.

### 11.2 Daily quests

Three quests a day, drawn without repeats from the pool in CONTENT.md section 10. Quests whose feature is still locked are left out of the draw. The day changes at local midnight (section 15.2).

| Reward | Each quest | All three |
|---|---|---|
| Chest | Wooden Crate | Copper Chest |
| Gems | 10 | 20 |
| XP | 1,500 | 1,500 |
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
- Each also gives Gems (5, 10, 15, 25, 50 by tier) and XP.

### 11.5 Codex

A collection log: every floor, manager, plant, heirloom, visitor and world. 148 entries (CONTENT.md section 12).

- An entry is filled the first time the thing is owned, opened or caught.
- Each entry gives 5 Gems once and **+0.25% profit** permanently (`CODEX_PCT = 0.0025`), so the full codex is +37%.
- Plant and manager entries hold the Writer's bios. Hybrid and Exotic entries show their recipe hints.

## 12. Reset layers

### 12.1 Replant (the small reset)

**Fiction:** the season ends. Everything goes on the compost heap and next season grows in richer soil.

Replant is per world.

```
compostTotal(w) = floor( COMPOST_K[w] x (lifetime(w) / COMPOST_E0) ^ COMPOST_EXP x compostGainMult )
pending(w)      = compostTotal(w) - claimed(w)
```

- `lifetime(w)` is every unit of world `w`'s currency earned in the current era. It does not reset on Replant. Starting money from Head Start is not counted.
- `COMPOST_E0 = 2e10`, `COMPOST_EXP = 0.4`, `COMPOST_K = 5, 15, 40, 100, 250, 600` for worlds 1 to 6.
- **Replant is available** in a world when its top floor is open in the current run and `pending >= 1`. The very first Replant of a save needs `pending >= FIRST_REPLANT_MIN = 25`.
- **On Replant:** `claimed(w) += pending(w)`, `compostEra += pending(w)`, `compostAllTime += pending(w)`. That world's currency, floor levels and hires reset. Floor 1 is open at level 1. Manager and plant placements are remembered and come back as floors reopen.
- **Passive:** every Compost earned this era gives `COMPOST_PCT = +2%` profit in every world. Spending Compost in the Compost Shop does not reduce this.
- **Compost Shop:** rows in CONTENT.md section 7. Every item has a level cap. Rich Soil (×1.25 profit, 10 levels) is the only one that multiplies profit.

Because `pending` comes from lifetime earnings, a second Replant five minutes after the first gives almost nothing. The player must grow past their previous best. The Replant screen says "Replant now for +N Compost (+X% profit)", and the button glows once `pending` is at least half of `compostEra`.

Why 0.4 and not a square root: section 17.6.

First Replant: the button unlocks at 25 pending Compost (about 1.1e12 lifetime Coins), and the story asks the player to wait for 60 (about 1e13 lifetime Coins). Sixty Compost gives ×2.2 profit and buys Rich Soil twice, so the second run is about three times faster.

### 12.2 Harvest Festival (the big reset)

**Fiction:** the whole brand goes to the Grand Harvest Festival. The judges hand out Prize Ribbons, and a new generation starts over with the ribbons on the wall.

```
ribbonsTotal   = floor( (compostAllTime / RIBBON_C0) ^ RIBBON_EXP )
ribbonsPending = ribbonsTotal - ribbonsClaimed
```

- `compostAllTime` is all Compost ever claimed, in every era. `RIBBON_C0 = 50,000`, `RIBBON_EXP = 0.5`.
- **Unlocks** when the player has reached world 3 at least once and `ribbonsPending >= FIRST_FESTIVAL_MIN = 8`. Later Festivals need `ribbonsPending >= 1`.
- **On Festival:** `ribbonsClaimed += ribbonsPending`. Then every world's currency, floors, hires and `lifetime` reset. `compostEra`, every `claimed(w)` and all Compost Shop purchases reset. World tickets must be bought again. Everything in the "Keeps" column of section 3.4 stays.
- **Passive:** every Ribbon ever earned gives `RIBBON_PCT = +10%` profit in every world. Spending Ribbons does not reduce this.
- **Ribbon Shop:** rows in CONTENT.md section 8. It never resets. It holds Golden Hour (×2 profit, 5 levels), the deeds to worlds 4, 5 and 6, the third planter, heirloom slots, a second research desk, auto-buy (the Auto-Gardener) and one endless item, Blue Ribbon Polish.
- Each Festival gives a Golden Chest (a Crystal Chest the first time, a Starlight Chest every fifth time) and one free respec.

The first 8 Ribbons need about 3.2 million Compost. The pacing check puts that on day 4 to 5 for an active player.

### 12.3 No third layer in v1

The long tail is carried by worlds 4 to 6, World Mastery, card levels, research and the Ribbon Shop's endless item. A third reset would cost more readability than it adds. If the simulator shows the game going flat after week 6, the next layer is designed then.

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
  x product of active buffs                          Sunbeam, abilities, Morning Dew
```

`MASTER_COMPOSTER_PCT = 0.005` (5 levels) and `BLUE_POLISH_PCT = 0.002` (endless) are Ribbon Shop items. An effect written as "×1.5 profit" in CONTENT.md (a keystone, an ability, a twist) is its own multiplier.

A harvest with a Bountiful chance `c` pays double with probability `c` (capped at 1).

### 13.2 Speed

```
speedMult(floor) = 2 ^ milestoneCount x towerMilestoneMult ^ towerMilestoneCount
  x (1 + sum of floor speed bonuses)                 Quick, manager perks
  x (1 + sum of heirloom speed bonuses)
  x (1 + sum of skill speed bonuses)
  x researchSpeed                                    1.2 ^ (Crop Rotation projects done)
  x product of active buffs                          Growth Spurt, abilities
```

`towerMilestoneMult` is `TOWER_MILESTONE_MULT` plus any flat additions (a Tycoon skill, a set bonus, Mayor Thyme), capped at `TOWER_MILESTONE_CAP = 2.0`.

### 13.3 Level cost

```
costMult(floor) = (1 - sum of floor discounts)       Thrifty, manager perks. At most 0.5 off
  x (1 - sum of heirloom discounts)
  x (1 - sum of skill discounts)
  x researchCost                                     0.9 ^ (Frugal Farming projects done)
  x GREEN_DEAL ^ greenDealLevel
  x product of active buffs
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
| `offlineEfficiency` | `(OFFLINE_EFF_BASE + points added) x (1 + sum of "offline earnings" bonuses in that world)` | 1.0. Compound Interest is applied after the cap |
| `offlineCap` | `OFFLINE_CAP_BASE` + every source added | 24 h (28 h with the Moonstone Mortar) |
| `chestLuck` | every source added | none |
| `insightGainMult`, `pollenGainMult`, `compostGainMult`, `managerPowerMult`, `plantPowerMult` | 1 + every source added | none |
| `hireFeeMult` | product of every source | at least 0.1 |
| Cooldown reduction | every source added | 50% |

A reduction that comes in ranks or levels adds up inside its own source first. Five ranks of Sprout Spotter are one source of 25%.

The tap caps are there so that active play stays a bounded multiple of idle play (section 6.7).

World-scoped effects count only from managers and plants placed in that world.

### 13.5 Why this is safe

Every bucket except three has a hard ceiling, because its content is finite: card levels, skill ranks, research projects, achievements. The three open-ended ones are milestones (paid for with exponentially rising costs), Compost and Ribbons (both gentle roots of lifetime totals). Blue Ribbon Polish is endless, but its price rises 15% a level for a fixed step, so it grows only with the logarithm of Ribbons. Section 17.6 shows the arithmetic.

## 14. Worlds

### 14.1 The list

| # | World | Climate | Currency | Floors | Twist | Launch |
|---|---|---|---|---|---|---|
| 1 | **Thymeford**, the home town | Temperate | Coins | 10 | None. This world teaches the game | required |
| 2 | **Loomington**, the big city of mills | Urban | Notes | 8 | **Customers** queue at the door. Click to serve them for tips | required |
| 3 | **Papaya Cay**, a tropical island | Tropical | Shells | 8 | **Weather** turns, and each kind of weather favours some plant families | required |
| 4 | **Mount Mitten**, a snowy peak | Frost | Snowmarks | 8 | **Hearth Heat.** Tapping warms the mountain, and warmth multiplies profit | planned |
| 5 | **The Moon**, Crater Gardens | Lunar | Moonpennies | 8 | **Floating Harvests.** Harvests float up as bubbles. Pop them yourself for more | planned |
| 6 | **Nebula Nursery**, an orbital greenhouse | Stellar | Stardust | 8 | **Orbital Sunrise.** The tower pays out all at once every orbit. Catch the sunrise for a bonus | planned |

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
- Arriving in a world for the first time adds its cards to the chest pool, unlocks its climate for mutation, and starts its World Mastery track.

### 14.4 Twist rules

**World 2, Customers**

- A customer joins the queue every `CUSTOMER_INTERVAL = 20 s`, while playing and while away. The queue holds `CUSTOMER_QUEUE_CAP = 15`.
- Clicking a customer (or pressing C) serves them and pays `CUSTOMER_TIP_SECONDS = 15 s` of `worldIPS`. Holding serves 4 a second.
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
- Each pop within `BUBBLE_CHAIN_WINDOW = 2 s` of the last adds +0.25, up to `BUBBLE_CHAIN_MAX = +1.0`. A fast sweep of all eight floors averages about ×2.6.
- While away, bubbles pay ×1.

**World 6, Orbital Sunrise**

- An orbit lasts `ORBIT_SECONDS = 90`. Managed floors' payouts are banked during the orbit.
- At sunrise there is a `SUNRISE_WINDOW = 3 s` window. Clicking in it pays the bank at `SUNRISE_BONUS = x2.5`, plus 0.25 for every sunrise caught in a row, up to ×4.
- If the window passes, the bank pays ×1 and the streak resets. While away, every orbit pays ×1.

No twist ever takes anything away. A player who ignores a twist earns exactly what they would have earned without it.

### 14.5 World Mastery

A permanent record for each world. It never resets.

- A world has 10 stars. Star `n` is earned the first time every floor in that world is at or above level `MASTERY_LEVELS[n]` = 25, 50, 100, 200, 300, 400, 500, 600, 800, 1,000.
- Each star gives `MASTERY_PCT = +10%` profit in that world.
- **Star 5** gives the first copy of that world's **Exotic manager**. Stars 7, 9 and 10 give one more copy each.

## 15. Events, offline time and the clock

### 15.1 Offline earnings

```
away           = trustedNow - lastSeen                    (never negative, section 15.2)
offlineSeconds = min(away, offlineCap)
for each unlocked world:
    earned = sum of floorIPS over managed floors x offlineEfficiency x offlineSeconds
             (with that world's twist rule from 14.4)
```

`OFFLINE_CAP_BASE = 2 h`, `OFFLINE_EFF_BASE = 0.5`. Research, skills, plants, heirlooms and the Compost Shop raise both, to 24 hours and 100%. The exact stacking is in section 13.4.

- A floor without a manager finishes the cycle it was on and waits.
- These keep running for the whole time away, whatever the cap: research, bench jobs, ability cooldowns, Morning Basket timers, the customer queue and the weather loop. Insight accrues for up to 24 hours.
- These do not happen while away: visitors, Combo, Spurts, taps.
- The Welcome Back screen shows a harvest basket with a line for each world. One tap collects it with a burst.
- **Morning Dew:** after `DEW_AWAY = 1 h` or more away, the player returns to ×2 profit in every world for `DEW_DURATION = 120 s`.
- **Time Warp:** 30 Gems for 1 hour or 100 Gems for 4 hours of offline-rate income, paid at once. It ignores the cap and does not advance research.
- A game that is open but in the background runs at the full online rate.

### 15.2 Clock rules

The design requirement is that changing the PC clock can never break a save or pay out more than one normal return.

1. The game keeps `highestTimeSeen`. `trustedNow = max(systemNow, highestTimeSeen)`.
2. If the clock moves **back**, `away` is 0. All timers wait until real time passes `highestTimeSeen`. Nothing is lost and nothing is paid twice.
3. If the clock moves **forward**, the player gets one capped return. Moving it back afterwards falls under rule 2.
4. Daily and weekly quests, Morning Baskets and events are keyed to a day number that only moves forward. Replaying a day cannot grant its rewards again.

The Save and Offline thread owns the implementation. These four rules are the behaviour to test.

### 15.3 Weekend events

Unlock at player level 12. An event runs from Friday 00:00 to Sunday 23:59 local time. Four events rotate by week number.

| Week mod 4 | Event | Bonus in the main game all weekend |
|---|---|---|
| 0 | Herb Fair | Golden Sprout Windfalls pay double |
| 1 | Night Market | Offline efficiency +25 points |
| 2 | Hemp Harvest Home | Hemp-family traits ×1.5 |
| 3 | Blossom Parade | Pollen from every source ×2 |

Every event also has a **fair stall**: a five-floor mini tower with its own currency, Fair Tickets.

- It uses the world 1 template for floors 1 to 5. Managers are free and already hired.
- Only tap skills and tap heirlooms apply to it. No Compost, Ribbons, cards or research. A new player and a veteran are close to equal there.
- It earns while away, using the normal offline rules.
- Lifetime Fair Tickets move the player along a 10-step reward track.

| Step | Fair Tickets | Reward | Step | Fair Tickets | Reward |
|---|---|---|---|---|---|
| 1 | 1e3 | Wooden Crate | 6 | 1e11 | 50 Gems |
| 2 | 1e5 | 20 Gems | 7 | 1e12 | Golden Chest |
| 3 | 1e7 | Copper Chest | 8 | 1e13 | 200 Pollen |
| 4 | 1e9 | 50 Pollen | 9 | 1e14 | 3 copies of the event's featured Epic card |
| 5 | 1e10 | Silver Chest | 10 | 1e15 | Crystal Chest |

The track takes about four to five hours of mixed play across the weekend. Nothing is exclusive. A missed event returns four weeks later with the same track.

## 16. Unlock order

One new thing at a time. Conditions are exact. Times are targets for a new player in their first session.

| # | Feature | Unlock condition | Target time |
|---|---|---|---|
| 1 | Tap to harvest | start | 0:05 |
| 2 | Floor levels | first harvest | 0:10 |
| 3 | Milestones panel and buy modes | any floor reaches level 25 | 0:35 |
| 4 | More floors | coins | 0:40 onward |
| 5 | Chests and managers | 1,000 lifetime Coins (Welcome Chest) | 1:30 |
| 6 | Tap bonus and Combo | first manager hired | 1:40 |
| 7 | Quests panel (story and daily) | world 1 floor 4 opened | 2:15 |
| 8 | Plants and planters | world 1 floor 5 opened (first seed packet) | 3:30 |
| 9 | Bumper taps | player level 2 | about 4:00 |
| 10 | Garden Visitors | world 1 floor 6 opened | 5:30 |
| 11 | Skill tree | player level 3 | about 7:00 |
| 12 | Achievements and Codex | world 1 floor 7 opened | 8:30 |
| 13 | Growth Spurt | world 1 floor 8 opened | 13:00 |
| 14 | Morning Basket | 15 minutes of play | 15:00 |
| 15 | Offline earnings screen | first return after 5 minutes away with a manager hired | first return |
| 16 | Replant | world 1 floor 10 opened and 25 Compost pending | about 40:00 |
| 17 | Compost Shop and Research | first Replant | about 55:00 |
| 18 | Heirlooms | third Replant (the story gives the Sprouting Trowel) | about 1 h 30 |
| 19 | World 2, Customers, World Mastery, weekly quests | ticket: 5e19 Coins | end of day 1 |
| 20 | Bees and Pollen | research "Bee Hotel" | day 1 to 2 |
| 21 | Weekend events | player level 12 | day 1 to 2 |
| 22 | Cross-pollination | research "Pollination Bench" (needs world 2) | day 2 |
| 23 | World 3, Weather | ticket: 2e19 Notes | day 3 |
| 24 | Mutation and Exotic plants | research "Mutation Chamber" (needs world 3) | day 5 to 7 |
| 25 | Harvest Festival and Ribbon Shop | world 3 reached and 8 Ribbons pending | day 4 to 5 |
| 26 | Auto-buy (the Auto-Gardener) | Ribbon Shop, 4 Ribbons | after the first Festival |
| 27 | World 4, Hearth Heat | deed (8 Ribbons) and ticket | week 1 to 2 |
| 28 | Exotic managers | 5 Mastery stars in a world | week 2 |
| 29 | World 5, Floating Harvests | deed (60 Ribbons) and ticket | week 2 to 3 |
| 30 | World 6, Orbital Sunrise | deed (600 Ribbons) and ticket | week 3 to 4 |

Nothing that is locked shows more than a silhouette and a one-line hint. The bottom bar starts with no buttons and gains them as features unlock.

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
| 1:30 | Welcome Chest: the first chest opening, three managers | Chests, managers |
| 1:40 | First hire. Taps now pay a bonus and build Combo | Combo |
| 2:15 | Floor 4. Hiring Crate. First story quest pinned | Quests |
| 3:30 | Floor 5. First seed packet. Mint goes in the windowsill, hemp in the patch | Plants |
| 4:00 | Level 2. First Bumper tap: ×10 with a hit-pause | Bumpers |
| 5:30 | Floor 6. A Golden Sprout drifts past | Visitors |
| 7:00 | Level 3. Two skill points to spend | Skills |
| 8:30 | Floor 7. First achievement pops | Achievements, Codex |
| 10:00 | Seven floors, five of them managed, seven or more managers owned, three plants, one card level-up, level 3 | |

A new thing roughly every 60 to 90 seconds, each one taught by doing it once.

### 17.2 First hour

| Time | Beat |
|---|---|
| 13 min | Floor 8, the Ropewalk. First Growth Spurt |
| 15 min | The Morning Basket appears |
| 21 min | Floor 9 |
| 32 min | Floor 10, Sprout Tower HQ. The ticket plate to Loomington appears far out of reach. Pip mentions the compost heap |
| 32 to 50 min | Push floors to 50 and 100, hit the first tower milestones. Pending Compost climbs to 60 |
| 50 to 60 min | **First Replant.** ×2.2 profit, two levels of Rich Soil, Research opens |
| 60 min | Level 8. About 12 managers, 5 plants. The second run reaches HQ in about 12 minutes |

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
| 4 to 5 | **First Harvest Festival.** 8 Ribbons, Golden Hour, auto-buy | Ribbon Shop |
| 5 to 7 | Mutation Chamber built. First Exotic plant around day 7 (Ember Basil is the easy one) | Exotics |
| 6 to 7 | Deed and ticket to Mount Mitten | Hearth Heat |
| 7 | Level about 40. Commons at level 5, Rares at 3, a first Legendary. 12 to 15 research projects done. 3 to 4 Festivals | |

### 17.5 Weeks 2 to 8

| When (active player) | Beat |
|---|---|
| Week 2 | First Exotic manager. The Moon. Festivals every one to two days |
| Week 3 | Nebula Nursery. All six heirloom slots |
| Week 4 | Level about 70. Research about half done. Commons at level 8 to 9. Festivals every three to five days |
| Weeks 5 to 8 | Mastery stars 6 to 10 in the early worlds. Last research projects. Level about 90, with the cap of 112 around month 3. Hybrids and Exotics levelling up |

Card levels over time for an active player (about 100 cards a day):

| Rarity | Week 1 | Month 1 | Manager profit at that level |
|---|---|---|---|
| Common | level 5 | level 8 to 9 | ×4.1, then ×8.6 |
| Uncommon | level 4 | level 7 | ×4.3, then ×7.5 |
| Rare | level 3 | level 6 | ×4.3, then ×7.5 |
| Epic | level 2 | level 4 | ×4.8, then ×6.9 |
| Legendary | level 1 | level 2 to 3 | ×6, then ×8.6 |

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

| Day | Manager profit on a typical floor | Everything else that never resets, plus the capped Compost Shop items other than Rich Soil | Tap income as a multiple of `worldIPS`, before Spurts |
|---|---|---|---|
| 0 | ×2 | ×1 | 1.1 |
| 1 | ×2.5 | ×4 | 2.5 |
| 3 | ×3.4 | ×16 | 3.3 |
| 7 | ×5 | ×120 | 5 |
| 14 | ×6.2 | ×700 | 6.5 |
| 30 | ×9 | ×7,000 | 10 |
| 60 | ×13 | ×20,000 | 14 |

**Results** (days from first launch):

| Event | Active | Mixed | Idle |
|---|---|---|---|
| World 1 top floor | 17 min | 30 min | 16 h |
| First Replant | 36 min | 4.4 h | 16 h |
| World 2 | day 0.5 | day 1.4 | day 3.2 |
| World 3 | day 2.6 | day 4.1 | day 5.2 |
| First Festival | day 4.1 | day 5.4 | day 7.7 |
| World 4 | day 6.7 | day 10.3 | day 15.2 |
| World 5 | day 11.5 | day 17.1 | day 28.2 |
| World 6 | day 19.5 | day 29.3 | day 53.2 |
| Festivals by day 30 | 13 | 11 | 7 |

The script plays perfectly. A real new player is about twice as slow in the first ten minutes and about 1.5 times as slow in the first hour, which is where the targets in 17.1 and 17.2 come from.

**What the check found**

1. **No runaway, with these exponents.** A first draft used a square root for Compost, an uncapped Rich Soil and a square root for Ribbons. It reached ten Festivals on day 1. The cause is simple arithmetic. If income grows as `lifetime ^ e`, growth stays polynomial only while `e < 1`. Here `e` is about 0.15 (milestones) + 0.4 (Compost) + 0.2 (Ribbons, the square root of a 0.4 power) = 0.75. Any uncapped multiplier bought with Compost or Ribbons adds to `e`. **Rule for all future content: nothing bought with Compost or Ribbons may multiply profit by a fixed factor per level unless it has a level cap.** Blue Ribbon Polish is the one endless item. It adds a fixed step for a price that rises 15% a level, so it adds about 0.01 to `e`.
2. **No dead zone longer than about 20 minutes inside a run.** The longest wait is saving for level 100 on several floors late in the first run. That is exactly when the Replant button is glowing.
3. **Idle players are slower but not left behind.** Idle reaches each world in roughly two to three times the active player's days.
4. **Festivals are frequent in week 2** (about one a day for the active profile) while Golden Hour's five doublings are being bought, then stretch to every three to eight days. If that feels too fast in play, raise the Golden Hour prices first.

**Not checked:** XP and level pacing, Insight income, chest and card rates, Pollen, Gem flow, twist values, ability uptime, Master Composter, Blue Ribbon Polish and the tap caps. Those are estimates from the formulas in this document.

## 18. Currency sources and sinks

| Currency | Sources | Sinks |
|---|---|---|
| World currency | Harvests, taps, Windfalls, customer tips, abilities, offline earnings, Time Warp, Head Start | Floor levels, floor opens, hire fees, the ticket to the next world |
| Gems | Daily quests (50 a day), weekly quests (200 a week), level-ups (10), achievements (5 to 50), codex entries (5), story quests, Dewdrops, event track | Chests (40, 120, 350, 1,000), Time Warp (30, 100), respec (100) |
| Compost | Replant | Compost Shop. Spending never lowers the passive bonus |
| Ribbons | Harvest Festival | Ribbon Shop, including one endless item. Spending never lowers the passive bonus |
| Insight | Passive, from record milestones | Research projects |
| Pollen | Copies of max-level cards and heirlooms, Busy Bees, chests (Copper and better), daily quests, events | Hybrid jobs (400), Exotic jobs (1,500), copies of owned cards (5 to 1,000) |
| Skill Points | Player level | Skill tree. Refunded by respec |
| Card copies | Chests, Hiring Crates, bench jobs, Mastery stars, Pollen | Card levels |
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
| `MGR_BASE` | 2, 2.5, 3, 4, 6, 10 | 7.2 |
| `MGR_LEVEL_MULT` | 1.2 | 7.2 |
| `PERK_PER_LEVEL` | 0.1 | 7.2 |
| `CHEST_MANAGER_SHARE` | 0.55 | 8.3 |
| `NEW_CARD_CHESTS` | 10 | 8.3 |
| `PITY_EPIC` | 60 cards | 8.3 |
| `PITY_LEGENDARY` | 300 cards | 8.3 |
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
| `FIRST_REPLANT_MIN` | 25 | 12.1 |
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
| `SPURT_DURATION_CAP`, `SPURT_TAPS_MIN`, `SPURT_SPEED_CAP` | 45 s, 150, 4 | 13.4 |
| `AUTO_BUY_SHARE` | 0.10 | CONTENT.md 8 |
| `MASTERY_LEVELS` | 25, 50, 100, 200, 300, 400, 500, 600, 800, 1,000 | 14.5 |
| `MASTERY_PCT` | 0.10 | 14.5 |
| `CUSTOMER_INTERVAL` | 20 s | 14.4 |
| `CUSTOMER_QUEUE_CAP` | 15 | 14.4 |
| `CUSTOMER_TIP_SECONDS` | 15 | 14.4 |
| `WEATHER_PROFIT` | 3 | 14.4 |
| `HEAT_PER_TAP`, `HEAT_DECAY`, `HEAT_FLOOR`, `HEAT_PROFIT` | 0.5, 0.05 per second, 20, 0.03 | 14.4 |
| `BUBBLE_CAP_SECONDS`, `BUBBLE_BONUS` | 120, 2 | 14.4 |
| `BUBBLE_CHAIN_WINDOW`, `BUBBLE_CHAIN_MAX` | 2 s, +1.0 | 14.4 |
| `ORBIT_SECONDS`, `SUNRISE_WINDOW`, `SUNRISE_BONUS` | 90, 3 s, 2.5 | 14.4 |
| `OFFLINE_CAP_BASE` | 2 h | 15.1 |
| `OFFLINE_EFF_BASE` | 0.5 | 15.1 |
| `DEW_AWAY`, `DEW_DURATION` | 1 h, 120 s | 15.1 |
