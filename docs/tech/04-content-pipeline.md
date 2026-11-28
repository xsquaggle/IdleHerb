# 04. Data-driven content pipeline

Status: recommended, Phase 0; updated for the Phase 1 build. Owner: Engine Architect. In line with design 0.3 (managers and abilities) and design 0.5 (tiers, chests, moments and reset layers, EXPANSION 15.1) on 2026-11-28; version 0.4's numbers are the ones in the tables. The GDD decides what the tables contain; this document decides their shape and how they reach the game. Rules are in [GDD.md](../design/GDD.md) and every row is in [CONTENT.md](../design/CONTENT.md). Where this page and those two disagree about a field or a value, they win and this page is corrected.

## Principles

1. **Content is data, not code.** Worlds, floors, managers and their abilities, plants and their traits, heirlooms, chests, skills, research, shops, quests, achievements, visitors, events and every named constant are rows in tables. Adding a floor or a card never needs a programmer.
2. **One source, three consumers.** The game, the balance simulator and the tests all load the same compiled bundle. There is no second copy of any number.
3. **Numbers, words and pictures are separate files** so the Economy thread, the Writer and the artists do not edit the same lines.
4. **Bad data cannot reach a build.** A compiler validates everything and CI fails on any error.
5. **Small files, one owner each**, so parallel agents rarely touch the same file.

## Where things live

```
packages/content/
  tables/                     numbers and structure (YAML)
    tuning.yaml               every named constant in GDD Appendix A, under the same name
    tiers.yaml                the rarity ladder: eleven tiers with their looks, reveal timings and juice (design 0.5)
    moments.yaml              which tier each big moment plays at (EXPANSION 4.2)
    unlocks.yaml              the reveal order (GDD 16)
    achievements.yaml
    worlds/      worlds.yaml                      one row per world: D, T, COMPOST_K, ticket, deed, twist, Mastery levels
    floors/      template.yaml                    the floor template (GDD 5.3) and who each floor is, written by hand
                 generate.ts                      turns template.yaml and worlds.yaml into the files below
                 w1.yaml ... w6.yaml              what each floor costs and pays (generated, see below)
    cards/       managers.yaml                    50 managers, one per floor, each with its perk and ability inline
                 dupe-curves.yaml                 copies needed per level, by tier
    plants/      plants.yaml traits.yaml
    chests/      chests.yaml                      one row per chest tier, 1 to 11
                 specials.yaml                    chests with fixed contents: Welcome Chest, Hiring Crate, Seed Packet
    artifacts/   artifacts.yaml sets.yaml         heirlooms. The id prefix stays artifact.
    skills/      tree.yaml
    research/    tree.yaml
    resets/      layers.yaml                      the reset layers as a list (design 0.5)
                 rebirth.yaml                     the Compost Shop
                 prestige.yaml                    the Ribbon Shop
    quests/      story.yaml daily.yaml weekly.yaml
    events/      fair.yaml                        the weekend fair stall and its reward track
  text/en.yaml                every player-facing word, keyed by id
  src/                        the loader and the bundler
  generated/                  bundle output, not committed
art/                          cleaned sprites, rigs, effects (see below)
audio/                        final OGG files and loop metadata
```

This is the layout the economy core and the slice use. The first plan had `constants.yaml`, `w1.floors.yaml` beside `w1.floors.gen.yaml`, and abilities in their own file; the economy core (PR #6) chose the names above, and this page was moved to match them (the PR #6 review, note 3). Tables that are not built yet (visitors, codex, retired ids, the Gem shop, and the 0.5 tables for activities, Tier Up and Style) join under the same pattern. The loader reads each file by name and the generated floor files by pattern. Ids must be unique across all files.

## File format

YAML 1.2, parsed strictly (duplicate keys are errors; only `true` and `false` are booleans). YAML is chosen over JSON because designers' comments matter in balance tables and multi-line text reads well; it is chosen over spreadsheets because nested effects do not fit in cells and because diffs must be reviewable. Each file is a list of records.

The first floor of Thymeford, with the values of CONTENT.md 1.1. A floor is written by hand as who it is, and what it costs and pays is generated, in one record per floor.

```yaml
# packages/content/tables/floors/template.yaml        written by hand
floors:
  world.w1:
    - { id: floor.w1.windowsill, favouredFamily: mint }
```

```yaml
# packages/content/tables/floors/w1.yaml               generated. Do not edit by hand
- { id: floor.w1.windowsill, world: world.w1, order: 1, favouredFamily: mint, openCost: 0, basePayout: 1, baseCycleSec: 0.6, levelCost: { base: 4, growth: 1.07 }, hireFee: 1000 }
```

Its words live elsewhere:

```yaml
# packages/content/text/en.yaml
floors:
  floor.w1.windowsill: Windowsill Planter
```

### Generated floor rows

Every world's floors come from one template and two numbers per world, the cost scale `D` and the payout taper `T` (GDD 5.3 and 14.2). Those six rows of world parameters are the most sensitive numbers in the game, so they are the only place a floor's economy is typed in.

- The template is `floors/template.yaml` and one pure function, `floors/generate.ts`, written once from GDD 5.3.
- `pnpm content:floors` runs it over `worlds/worlds.yaml` and writes the `floors/wN.yaml` files. They are committed, so a change to `D` or `T` arrives as a reviewable diff of every floor it moves.
- CI runs the generator again and fails if the committed files differ. Nobody can hand-edit a generated number or forget to regenerate.
- The hand-written part (`floors` in the template) holds only who each floor is, and a generated file holds nothing typed by hand.
- The simulator calls the same function with trial values of `D` and `T`, in memory, when it searches for better world parameters. The fair stall (GDD 15.3) uses it too.

### Managers

**One fixed manager per floor.** Lawson decided this on 2026-11-25. The shape follows design 0.3 (CONTENT section 2), which is merged.

```yaml
# packages/content/tables/cards/managers.yaml
- { id: card.manager.basil_brumble, n: 2, floor: floor.w1.balcony, rarity: common, launch: true,
    perk: { stat: floor.profit, op: inc, value: 0.2, scope: floor } }
- { id: card.manager.old_moss, n: 7, floor: floor.w1.tea_house, rarity: rare, launch: true,
    perk: { stat: offline.earnings, op: inc, value: 0.12, scope: world },
    ability: { id: ability.tea_break, cooldownSec: 480, kind: comboLock, durationSec: 60 } }
```

- A manager is a card with a tier (`rarity` on the row is its native tier, see Tiers below), copies and levels. There are 50, one per floor.
- The card is owned at level 1 from the first time its floor is ever opened. That "met" flag is save state and survives every reset layer. An "ever hired" flag per manager is kept as well, for the `managers` achievement.
- Hiring is paying the floor's `hireFee`, once per run. It switches on the floor's automation, the manager's perk and its ability. The fee stays on the floor row.
- Copies come from chests. A manager slot picks among the managers the player has met at the rolled tier, so managers have no `poolWorld`. The Heads (the Exotic manager of each world's top floor) are never in a chest pool: their copies come from World Mastery and from the Starlight Chest's fixed slot, which gives a random Head whose world has at least 5 Mastery stars, else a third Legendary (GDD 8.3 rule 9). Chests of tier 7 and up carry more Head copies (`headCopies`).
- A perk's scope is read from the manager's own floor and counts only while that manager is hired.
- **An ability works only in its manager's own world** (CONTENT 2.2, GDD 7.1 rule 7), and only while the manager is hired. Whatever it gave the taps ends when the player leaves that world.
- **The number keys 1 to 4 press the four abilities of the world on screen, in floor order** (GDD 7.1). The action map in 03 names them `ability1` to `ability4`.
- **Star Pupil** (`skill.bo.star_pupil`) lets each world's Head count one level higher while hired, even past its maximum level. That is the one rule that reads a level above a card's cap.

An ability sits on its manager's row (Rare and better managers have one). It is a timed boost, a payout or a named special, with a cooldown:

```yaml
ability: { id: ability.sunday_best, cooldownSec: 900, kind: buff, stat: floor.profit, scope: world, mult: 5, durationSec: 30 }   # adds 4 to that world's Boost (GDD 13.5)
ability: { id: ability.heave_ho, cooldownSec: 1200, kind: lumpSum, scope: world, seconds: 120 }   # always paid from the steady rate
ability: { id: ability.tea_break, cooldownSec: 480, kind: comboLock, durationSec: 60 }          # a rule change, done by the tapping code
```

### Tiers (design 0.5)

The rarity ladder is one table, `tiers.yaml`: eleven tiers, Common to Grailed, in the order of EXPANSION 2.1. Each row has its order (a tier's power is `TIER_STEP ^ (order - 1)`, 1.5 per tier), palette tokens, emblem, burst and chest art (or null, which borrows the nearest tier below that has one), pips, the chime and sting of its reveal, the reveal timings of both forms, and the juice of a moment at that tier.

- Every card, chest, item and moment names its tier by id. Ids are checked when the bundle loads.
- **No code compares tier names.** A rule that singles out a tier names it in `tuning.yaml` (`CHEST_CARD_TOP`, `PITY_EPIC_TIER`, `HEAD_TIER`, `HEIRLOOM_PICK_TIER`, `EPIC_COPIES_TIER`). A test scans the sources of every package for a quoted tier id and fails on one.
- Cards carry `nativeTier` (from their row) and, in the save, an optional raised `tier` for Tier Up (EXPANSION 3). Tier-ups are `tier - nativeTier`; max level comes from `nativeTier`.
- `moments.yaml` says which tier each big event plays at, raised by a value reached or a named case (a record, a first time). The client plays every one through one `moment(tier, place, form)` effect (03).

## Shared building blocks

These few shapes are reused by every table. Learning them once is learning the whole content format.

**Ids.** Lowercase, dotted, namespaced by kind: `floor.w1.windowsill`, `card.manager.nana_sprig`, `plant.mint.frosted`, `artifact.sprouting_trowel`, `skill.gt.firm_grip`, `shop.compost.rich_soil`, `cur.coins`. Heirlooms keep the `artifact.` prefix. Players only ever see the word Heirloom. An id is permanent once it has shipped in a build, because saves refer to it. To remove or rename something, add a line to `retired.yaml` saying what it becomes (a replacement id, or a refund).

**Numbers.** Small values are plain numbers. Anything that can grow large is written as a number or a string such as `"7.25e12"` and is loaded as a big number (see 05).

**Constants.** Every named constant in GDD Appendix A is one line in `tuning.yaml` under the same name (`MILESTONE_MULT`, `BOOST_CAP`, `OFFLINE_CAP_BASE`). Code reads constants by name and never carries its own copy of a number, so the GDD, the table and the game cannot drift apart.

**Effect.** How anything changes a stat. Used by manager perks, plant traits, heirlooms, set bonuses, skills, research, shop items, achievements, world twists and events.

```yaml
- stat: floor.profit        # a registered stat. The names are those of CONTENT.md 0.2
  op: inc                   # inc: a percentage, added up inside its bucket
                            # add: a flat amount     mul: its own multiplier
                            # set: switches on a named special
  value: 0.20
  scope: floor              # floor | adjacent | world | global
  family: hemp              # optional: limits a plant bonus to one family
  when: { ... }             # optional condition
```

- **Scope is relative to where the owner is.** For a manager it is their own floor. For a plant it is the floor it is planted on. `adjacent` is the floors directly above and below, `world` is every floor in that world, and `global` is everything, counted once. Things that are not placed anywhere (skills, research, shop items, heirlooms) use `global` or name their target, as in `scope: { world: world.w4 }`.
- **The bucket is not written on the row.** It comes from the kind of owner, as CONTENT.md 0.1 lists them: a manager's own multiplier is `manager`, manager perks and plant traits share `floor`, heirlooms and their sets are `heirloom`, then `skill`, `research`, `compost`, `ribbon`, `achievement`, `codex`, `mastery` and `twist`. A row cannot land in the wrong bucket through a typo.
- **Scaling with level is not written on the row either.** It is one rule per kind of owner (CONTENT.md 0.1): a manager perk grows by `PERK_PER_LEVEL`, an heirloom passive by `HEIRLOOM_PER_LEVEL` unless the row says `fixed: true`, a plant trait by the formula in GDD 8.5. Abilities and set bonuses never scale.
- **A timed bonus to income or taps is a `boost`**, not an effect: a target (`world`, `floor` or `tap`), a size, and seconds or taps. Boosts add into one capped Boost per world and never multiply each other (GDD 13.5). The schema has no way to write a timed multiplier, on purpose. The few timed things that are not boosts (GDD 13.5 rule 6) are named specials: Dig In, which is a timed discount on one floor's level costs, and the guaranteed Bumpers of Showstopper and Sharp Season.

How each stat combines its bonuses, and where it is capped, is declared once with the stat (see 02).

**Condition.** Used for unlocks, quest goals and `when` clauses. This one is the Welcome Chest rule:

```yaml
all:
  - { holds: [cur.coins, 1000] }
  - { open: floor.w1.hemp_patch }
any: [ ... ]
not: { ... }
```

**Cost.** A curve named by its formula, or a list: `{ currency: cur.compost, formula: geometric, base: 20, growth: 1.8, maxLevel: 10 }` or `{ currency: cur.ribbons, levels: [3, 10, 40, 150, 600] }`. Formulas are implemented once in the core and named here. There are no formula strings to evaluate.

**Reward.** `{ currency: cur.gems, amount: 5 }`, `{ chest: chest.wooden, count: 1 }`, `{ card: plant.mint.garden, copies: 2 }`, `{ xp: 1500 }`, `{ unlock: feature.research }`.

**Chest.** One record per tier, straight from the table in GDD 8.3 for tiers 1 to 6 and EXPANSION 2.3 for tiers 7 to 11:

```yaml
# packages/content/tables/chests/chests.yaml
- { id: chest.silver, tier: 3, cards: 8, guarantee: [rare], odds: { common: 48, uncommon: 32, rare: 15, epic: 4.2, legendary: 0.8 }, pollen: 30, heirloomChance: 0.2 }
- { id: chest.grail, tier: 11, cards: 40, guarantee: [legendary, ...], odds: { ... }, heirloomChance: 1, heirloomOdds: starlight,
    heirloomSlots: [legendary, legendary, legendary], headCopies: 3,
    extras: [{ item: ore.cloud_pearl, count: 2 }, { item: ore.grailstone, count: 1 }, { item: cosmetic.random, count: 1, tier: grailed }] }
```

- **Card slots never roll above `CHEST_CARD_TOP` (Legendary).** The bundle refuses a chest whose guarantee or odds name a higher tier. What makes a high chest better is more cards, more guarantees, sure heirlooms (`heirloomSlots`), Head copies and fixed extras.
- **Fixed extras are data** (`extras`): materials and cosmetics by id and count, with a tier where the item has one. They land in the save's item bag.

The order of the rolling rules is code in the chests system, written once from GDD 8.3:

1. Guarantee slots first, among the guaranteed tier and better.
2. Card type: a manager with probability `CHEST_MANAGER_SHARE`, otherwise a plant (every slot is a manager before planters unlock).
3. Which card: uniform among cards of that tier and type in the pool. **If the pool has no card of that tier and type, the slot gives the other type; if neither type has one, it drops one tier at a time** until it finds one.
4. **New-card help applies to plant slots only**: in the first `NEW_CARD_CHESTS` chests, a plant slot whose tier has an unowned plant gives an unowned plant. Managers do not need it, because a met manager is already owned.
5. Pity, then luck, then the heirloom roll.

Their numbers (`PITY_EPIC`, `PITY_LEGENDARY`, `PITY_HEIRLOOM`, `NEW_CARD_CHESTS`) are named constants, and the tiers they name are tuning keys too. Which cards a chest can give is worked out, never listed by hand: a plant by its tier and `poolWorld`, a manager by its tier and whether the player has met it. A new card joins the right pool by existing. The odds shown to the player come from the same function with the player's luck applied, so shown odds cannot drift from real odds.

**Special chests** have fixed contents and are never rolled or sold. `chests/specials.yaml` gives each one the tier it looks like. The contents of the first two follow from the floor order, so they are not a hand-typed list:

- **Welcome Chest**: 2 copies each of the managers of world 1 floors 1 to 3 (Nana Sprig, Basil Brumble, Rowan Rake). It comes the first time the player holds 1,000 Coins with floor 3 open, and Hire buttons appear once it is opened (GDD 7.1 rule 9, CONTENT 2.3).
- **Hiring Crate**: as each of world 1 floors 4 to 9 opens for the first time, 2 copies of that floor's manager plus 2 Wooden Crate slots. Floor 10 has none, because its manager is the Head.
- **Seed Packet**: Garden Mint and Fibre Hemp, from story step 10 (floor 5 opens). The two ids are a list in the core today (`SEED_PACKET`) and move into `specials.yaml` when a second packet exists.

**Reset layer.** One row per layer in `resets/layers.yaml` (GDD 12; EXPANSION 7 and 15.1 item 6): what it pays and from what (`total = floor(scale x stat x (source / base) ^ exp)`, pending is total less claimed), when it opens, what it gives, and which named reset steps it runs and which it keeps. Replant and the Harvest Festival are enabled; New Generation (Laurels) and Big Bloom (Starseeds) are rows that are not enabled yet. The bundle fails if a row forgets a built step or an enabled row uses a step that is not built. See 02.

**Special.** Behaviour that is not a number change is a named hook implemented by the owning system: `special: keystone.thunder_thumb`.

## Table list

The GDD and CONTENT.md are the authority on fields. This is the starting set and who owns each schema.

| Table | Key fields | Schema owner (core system) |
|---|---|---|
| `tuning` | every named constant, by its GDD name | kernel |
| `tiers` | order, looks, emblem, burst and chest art, pips, chime, sting, reveal timings, juice | content (tiers), the client's reveal player |
| `moments` | tier of each big moment, raised by a value or a case | the client's moment effect |
| `currencies` | id, kind (a world's currency, Gems, Compost, Ribbons, Insight, Pollen, Skill Points, Fair Tickets), big or integer, icon (not a table yet: currencies are fields of the save and their names are in `text/en.yaml`) | wallet |
| `worlds` | id, climate, currency, floor count, `D`, `T`, `COMPOST_K`, ticket, deed, twist special, Mastery levels | worlds |
| `floors` | by hand: id and favoured family in the template. Generated: world, order, open cost, base payout, base cycle, level cost, hire fee | floors |
| `managers` | tier, floor, perk, and the ability inline: cooldown and its boost, payout or special | managers |
| `traits`, `plants` | family, tier, source (chest, hybrid, mutation), pool world, one or two traits; trait base, scope and stat | plants, bench |
| `chests`, `specials`, `dupe-curves` | tier, card count, guarantees, odds, Pollen, heirloom chance, sure heirlooms, Head copies, fixed extras; the tier of each special chest; copies needed per level for each tier | chests, cards |
| `artifacts`, `sets` | tier, set, passive effect, ability, two-piece and three-piece bonuses | artifacts (heirlooms) |
| `skills` | branch, tier, ranks, effect per rank or keystone special | skills |
| `research` | lane, Insight cost, time, what it needs first, effect or unlock | research |
| `resets` | the reset layers; the Compost Shop and the Ribbon Shop: effect per level, level cap, cost | resets |
| `quests` | the story chain in order; daily and weekly pools with goal, rewards and the feature each needs | quests |
| `achievements` | family, five tiers, condition, rewards | achievements |
| `events` | fair stall rows, reward track | events |
| `unlocks` | feature id, condition, how it is introduced | unlocks |
| `visitors`, `codex`, `tutorial` | not tables yet: their rules are in the core and the client until they have rows | visitors, codex, tutorial |

Schemas are written with zod, so the TypeScript types and the validation rules are the same thing. Today they are in one file, `packages/core/src/content/schema.ts`; they move next to their systems when the core is split (02).

## The compiler

`pnpm content:bundle` (also run by the dev server, the builds and CI; the tests and the simulator load the tables directly through the same loader):

1. Read every table and text file.
2. Validate each record against its schema.
3. Cross-check:
   - ids unique and well-formed; every reference points at something that exists
   - every stat named by an effect is registered; every special and formula named has an implementation
   - cost growth is above 1, cycles are positive, weights sum above zero, pity rules are satisfiable
   - **the generated floor rows match the template** for the world parameters in `worlds.yaml`
   - **the design's guard rules hold.** Each stat lists the buckets that may feed it: `chest.luck` takes skills and research only, and `compost.gain` takes skills and the Compost Shop only (GDD 13.4). Anything bought with Compost or Ribbons that multiplies profit per level has a level cap. No Head, no mutation and no hybrid is in a chest pool, and no card slot rolls above `CHEST_CARD_TOP` (GDD 8.3 rule 3, EXPANSION 2.3). Each stat only takes the operations its rule allows
   - **the unlock graph has no cycles and everything is reachable** from a new game, which catches orphaned content and one class of dead zone before the simulator even runs
   - every entity has its text keys; every art and audio key exists (a warning until Phase 3, an error after)
   - **the word check.** Every line of text is checked against the do-not-use list in GDD 2.3 and `docs/art/HEMP_ART.md`. Words that are never acceptable fail the build. Words that are only wrong in some uses are listed in the report for the reviewer, with an allow file for lines a person has approved. A hand-written 420 or 69 in a table or in text is listed the same way (GDD 2.2 rule 7)
4. Emit `generated/content.json` (the bundle the game loads). Still planned: a content hash, `generated/ids.d.ts` (so code that names an id is checked at compile time) and `generated/report.html` (every table as a readable page).

The report page is published with the phone preview (see 08) so Lawson can read the actual shipped numbers and text without opening YAML.

In development the compiler watches for changes and the running game hot-reloads content, so a balance tweak is visible in seconds.

## Text and localisation

All player-facing text is in `text/en.yaml`, keyed by id, with named placeholders (`"Earns {amount} every {time}"`). Version 1 ships English only, but nothing in code contains display text, so another language is a new folder. The Writer owns this folder. A CI check lists any text key that is missing or unused.

## Art and audio assets

```
art/
  floors/ actors/ plants/ props/ cards/ icons/ ui/ vfx/ bg/
                    cleaned, palette-locked PNG sprites by class. The source of truth
  rigs/             rig JSON (see 03)
  fx/               effect YAML
  fonts/            bitmap font sources
audio/
  music/<track>/    stems as OGG plus loop metadata
  sfx/  amb/
```

- **The style bible sets where sprites go and what they are called** (STYLE_BIBLE section 3): one folder per class under `art/`, and lowercase snake case file names such as `plant_mint_stage3.png`. The scaffold follows it. An art key in a content table is the file name without `.png`, so the art keys in the examples on this page are stand-ins until the real files exist.
- **Raw generated images do not go in git.** They are large and get replaced often. They stay in the project's shared files, in the batch folders the Art Director keeps under `/mnt/project-files/art/`. Only the cleaned sprites that the clean-up step produces are committed. This keeps the repository small and avoids any paid storage.
- The clean-up route (palette quantising, pixel snapping, slicing, splitting parts for rigs) belongs to the Art Director; its scripts live in `tools/art/` and run headless.
- `pnpm assets:build` packs sprites into atlases and writes an asset manifest. Atlases are build output and are not committed.
- **Art lint** runs in CI on the sprite folders: only palette colours, hard alpha unless flagged as a soft layer, correct canvas size for the asset class, correct naming. It is the automated half of the art-consistency review.
- Content refers to art by key, never by file path or atlas position.

## Who edits what

| Role | Files |
|---|---|
| Game Designer | `tables/unlocks.yaml`, `tables/quests/`, `tables/skills/`, `tables/research/`, `tables/tiers.yaml`, `tables/moments.yaml`, `tables/resets/layers.yaml`, structure of every table |
| Economy and Balance | `tuning.yaml`, `worlds/worlds.yaml` and the generated floor rows, the shops in `resets/`, numbers in `chests/` |
| Content Builder | bulk rows in `tables/cards/`, `plants/`, `artifacts/`, `achievements.yaml` |
| Writer | `text/en.yaml` |
| Art, Animation and VFX | `art/` |
| Audio | `audio/` |
| Gameplay programmers | schemas in their system folder |

Where numbers come from a formula, the generator is committed and its output is the table, so a regenerated table shows up as an ordinary reviewable diff. The floor rows above are the first case. Any later one follows the same pattern: a generated file marked as such in its first line, a command, and a CI check that the committed file is current.
