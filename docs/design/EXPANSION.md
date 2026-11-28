# Sprout Tower: The Long Game

Design version 0.5, draft. This file answers Lawson's ask of 2026-11-28 for higher retention: better core upgrades and items, longer skill trees, more currencies and resets, cosmetics that boost, chests from fishing, digging and mining that can also be automated, and eleven rarities, each one noticeably better than the one before, with effects and reveals that scale with rarity. Lawson's words: "Add on - be creative, give it your all!"

Owner: Game Designer. Companion files: [GDD.md](GDD.md) (rules and formulas, version 0.4 plus the two changes in section 0 below), [CONTENT.md](CONTENT.md) (rows), [ROADMAP.md](ROADMAP.md) (which release carries each system), [CHANGES.md](CHANGES.md) (what changed and what each thread does next) and [AUDIT.md](AUDIT.md) section 12 (why).

## 0. How to read this file

- **Every system here is designed in full** (rules, first-pass numbers, named constants), but only two changes take effect in the GDD at once: the eleven-tier ladder (GDD 8.1, with the Head crowning in GDD 14.5 that goes with it) and the plan for two more reset layers (GDD 12.3). Everything else joins the GDD and CONTENT.md when it is built and the balance simulator has fitted its numbers. Until then this file is the reference.
- **Numbers are first-pass.** Each one has a constant name (Appendix B), so the simulator can fit it. Targets are given as times, so the fit has something to aim at.
- **The old rules still hold** unless a section here says otherwise: GDD 2.2 and 2.3 (hemp guardrails and words), 13.5 (one capped Boost), 13.6 (why nothing runs away). Section 1.3 lists the rules every new system obeys.
- **Look and timing of reveals belong to the Art Director.** Style bible v1.7 (sections 8 and 19) already draws all eleven tiers. This file says where each tier appears and how it is earned.
- **Phone and PC.** Lawson, 2026-11-28: "It should be playable on phone and PC." Everything new plays by tap and hold alone, with keyboard shortcuts as extras.

## 1. The calls on one page

### 1.1 The big calls

| # | Call | Why |
|---|---|---|
| 1 | **Eleven tiers, one ladder for everything**: Common, Uncommon, Rare, Epic, Legendary, Mythic, Exotic, Godly, Ungodly, Holy, Grailed. Cards, heirlooms, tools, helpers, chests, fish, finds, ores, cosmetics, Golden Sprouts, weekend events and achievements all use it | One ladder means one look, one sound and one meaning. A player who learns that aurora means Mythic knows it everywhere |
| 2 | **Each tier is about 1.5 times as strong as the one below**, and from Godly up each tier also adds a crest: a new way the item reaches further | Lawson asked for each rarity to be noticeably better. Fifty percent is a step anyone can feel. Crests make the top four tiers feel different, not only bigger |
| 3 | **Tier Up:** anything you own can climb one tier at a time, all the way to Grailed. Ores and Pollen pay for it | Every card already owned becomes a long-term project. A humble Common gardener can end the game Grailed. Nothing is ever replaced or thrown away |
| 4 | **Chests still never roll a card above Legendary.** Higher tiers are earned: Tier Up, mutation, World Mastery and ceremonies | The top rarities stay goals you work toward, and chest odds stay honest. The new chests of tiers 7 to 11 add fixed extras, never rolled ones |
| 5 | **Three field activities**: Fishing (Thymeford), Digging (Loomington) and Mining (Mount Mitten). Each is a small tap game with its own tool, a critter helper that automates it, its own crate and its own collection | Lawson's ask, and a cozy change of pace. Each one feeds a different system, so none of them is filler |
| 6 | **Two more reset layers**: New Generation (Laurels) and Big Bloom (Starseeds) | They carry the game from week 4 into months, where Festivals would otherwise drift apart. Each opens deeper ores, so the top tiers arrive with them |
| 7 | **Longer trees**: a fourth skill branch (Explorer), tiers 4 and 5 and a grand keystone in every branch, level cap 250, endless Evergreen ranks after the cap, and a Constellation map bought with Starseeds | Lawson asked for longer trees. Each part arrives when the one before it runs out |
| 8 | **Floor Improvements**: three visible upgrades per floor in every run, each doubling that floor | The core loop gains a satisfying mid-run purchase that shows on the floor itself |
| 9 | **Style**: cosmetics boost by being owned, not by being worn | Lawson asked for cosmetic boosts. Owning gives the power, so you can always wear what you like |
| 10 | **A daily rhythm**: the Garden Diary (rewards for every day you play), the Season Almanac (a free monthly reward track), Baron Fauxliage's Challenges, and rarity rolls on Golden Sprouts and weekend events | A reason to come back every day that never punishes a missed day |
| 11 | **Better items**: four new heirloom sets (ten in all) and Garden Treats, small consumables made at a Workbench | New tools for the new activities, and something useful to make from spare materials |
| 12 | **Every big moment has a tier**, and the juice scales with it: a Bumper tap is Uncommon, a Festival is Exotic, a first Big Bloom is Grailed | The same rule as the reveal ladder, applied to the whole game, so effort goes where the moment is biggest |

### 1.2 Earlier calls this changes

| Earlier call | Now | Where |
|---|---|---|
| Six rarities (GDD 8.1), then eight with Mythic above Exotic (call p6, 2026-11-27) | Eleven, with Mythic **below** Exotic, in Lawson's order | Section 2 |
| p6: Mythic is a max-level Exotic plant after a Full Bloom bench job | Full Bloom is now the name of every plant tier-up at the bench. A plant reaches Mythic by tiering up from Legendary. An Exotic plant tiers up to Godly | Section 3 |
| p6: a world's Head is crowned Godly at the Harvest Festival after the 10th Mastery star | Kept, and it is the only way a Head reaches Godly | Section 3.1, rule 6 |
| No third reset layer in v1 (GDD 12.3) | Layers 3 and 4 are designed and ship in the first updates after launch, before a player reaches them | Section 7, ROADMAP |
| Pets cut as a system (AUDIT 6) | Still no pet system. The three helpers belong to their activities | Section 6 |
| Expeditions cut from v1 (AUDIT 6) | They return as Outings for the helpers, in the second update | Section 6.6 |
| Tower skins cut from v1 (AUDIT 6) | Style is a planned system with tower skins, outfits and effects | Section 10 |
| Achievements have five tiers | Eleven, named and drawn by rarity | Section 12.1 |
| The Ribbon Shop never resets (CONTENT 8) | A New Generation resets its four power items. Its slots and conveniences stay | Section 7.1 |
| `RARITY_FACTOR` for an Exotic plant is 8 | 11, with Mythic at 7.5 below it | Section 2.2 |
| A Windfall pays `WINDFALL_SECONDS = 60` | `WINDFALL_BASE = 40 s` times the visitor's `tierPower`, the same on average | Section 4.4 |
| Six heirloom slots | Eight, from the Laurel Shop | Sections 7.1 and 9.1 |
| `LEVEL_CAP = 112` | 250, with endless Evergreen ranks after it | Section 8.2 |

### 1.3 Rules every new system obeys

1. **Cards above Legendary never come from a chest roll.** A chest of any tier rolls its card slots between Common and Legendary. The new chests of tiers 7 to 11 add fixed extras on top.
2. **Every roll shows its odds and has pity.** That covers chests, catches, finds, rocks, Golden Sprout tiers and weekend tiers.
3. **Nothing is ever taken from the player.** A missed bite, a half-dug tile, a lost challenge and an unused charge cost nothing. A tier-up never lowers anything.
4. **Timed bonuses add into the one capped Boost** (GDD 13.5), Garden Treats included. Lump sums pay from `steadyIPS`.
5. **Nothing bought with any currency or material multiplies profit by a fixed factor per level unless it has a level cap.** Endless items add a fixed step, so they grow slowly.
6. **Chest luck still comes only from skills and research, and Compost gain only from skills and the Compost Shop** (GDD 13.4). The Constellation map counts as a skill tree here, and none of its stars give either. Style, collections, heirlooms, tools, Treats and the Laurel Shop never give either. Chest luck means the stat in GDD 8.3 rule 6: an activity's own crate (a Tackle Box, a Buried Chest, a Geode) can be made better by that activity's gear and sets, because that is not chest luck.
7. **Activity taps are not counted taps** (GDD 6.1). They give no Combo, no Spurt meter, no Hearth Heat and no tap achievements. The tower and the field each have their own fun.
8. **One new thing at a time.** Every system here unlocks alone, with a story beat and one line from Pip (section 13).
9. **Hemp guardrails and words** (GDD 2.2 and 2.3) apply to every new name. Section 14 adds words for the new systems. Fish are always caught and released.

## 2. The rarity ladder

### 2.1 The eleven tiers

The look is the Art Director's (style bible v1.7, section 8). This table is how the design uses each tier.

| # | Tier | Look (bible v1.7) | Emblem | Pips | How a card first reaches it |
|---|---|---|---|---|---|
| 1 | Common | wood and iron | plain frame with rivets | 1 | chests |
| 2 | Uncommon | leaf green | leaf pair | 2 | chests |
| 3 | Rare | sapphire blue | diamond gem | 3 | chests |
| 4 | Epic | amethyst | tall crystal | 4 | chests |
| 5 | Legendary | gold | sun and laurel medallion | 5 | chests, hybrids |
| 6 | **Mythic** | aurora on midnight | full-bloom flower | 6 | tier-up from Legendary |
| 7 | Exotic | prismatic | winged prism | 7 | mutation (plants), Heads (managers), tier-up |
| 8 | **Godly** | white gold | sprout crown with a sunburst | 8 | tier-up; the Festival crowning for Heads |
| 9 | **Ungodly** | eclipse: plum-black with a ruby and gold corona | eclipsed sun | 9 | tier-up |
| 10 | **Holy** | pearl | pearl on a cloud in a silver ring | 10 | tier-up |
| 11 | **Grailed** | liquid gold with all ten earlier colours braided in | golden watering can, the grail | 11 | tier-up, after the first Big Bloom |

The tier names are Lawson's and are rarity labels only. No religious sign is ever drawn or written (bible v1.7, section 8). "Ungodly" is the wild one, never scary: an eclipse with a bright corona.

### 2.2 What each tier is worth

One step for everything: `TIER_STEP = 1.5`. A tier's power is `tierPower(t) = TIER_STEP ^ (t - 1)`.

| Tier | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `tierPower` | 1 | 1.5 | 2.25 | 3.38 | 5.06 | 7.59 | 11.4 | 17.1 | 25.6 | 38.4 | 57.7 |
| Plant `RARITY_FACTOR` | 1 | 1.5 | 2.2 | 3.2 | 5 | 7.5 | **11** | 16 | 24 | 36 | 54 |

- **Plants** use `RARITY_FACTOR[tier]` in the trait formula (GDD 8.5). The first five values are unchanged. Exotic moves from 8 to 11 because Mythic now sits below it, and a step from 7.5 to 8 would not be noticeable. The simulator checks the effect (Exotic plants arrive around day 11).
- **Managers:** `managerProfit = MGR_BASE[native] x MGR_STEP[native] ^ (level - 1) x TIERUP_STEP ^ tierUps x managerPowerMult`, with `TIERUP_STEP = 1.5`. The perk grows too: `perkValue x (1 + TIERUP_PERK_STEP x tierUps)`, with `TIERUP_PERK_STEP = 0.25`.
- **Heirlooms:** a numeric passive is multiplied by `TIERUP_STEP ^ tierUps`. An ability that lasts a set time lasts `TIERUP_ABILITY_STEP = 20%` longer per tier-up, and one that pays at once pays 20% more per tier-up, still from the steady rate. Set bonuses do not scale.
- **Tools, helpers, chests, catches, ores, cosmetics, Golden Sprouts and events** have their own tier tables in their sections. Each one climbs by about 1.5 per tier too.

### 2.3 Crests: what the top four tiers add

From Godly up, every tier adds one crest on top of the ×1.5. The idea is easy to say: **the higher the tier, the further the item reaches.**

| Tier | Crest | Plants | Managers | Heirlooms | Tools |
|---|---|---|---|---|---|
| Godly | Crown | Its floor traits also reach the floors directly above and below, at half strength | Its perk reaches one step further: floor becomes adjacent, adjacent becomes world, world becomes every world | Ability cooldown -25% | 25% of actions pay twice |
| Ungodly | Eclipse | Always at home: the affinity bonus works on any floor | Stays hired through Replants and Festivals, with no fee | Its passive also works from the shelf, unequipped, at half strength | The Legend Meter fills twice as fast |
| Holy | Pearl | Gains a third trait, chosen by the player from its family's list when it turns Holy | Half of its profit multiplier also counts on the floors directly above and below, as a floor bonus of `(managerProfit - 1) x 0.5`, at most +500% | Its ability goes off by itself whenever it is ready. A switch turns this off | Reach grows by one more tier |
| Grailed | Grail | Counts as planted in every world at once: world and global traits work everywhere, and floor traits work on the same floor number in every world | Its ability works in the world on screen, wherever that is. A manager with no ability gets its perk in every world | Works at full strength from the shelf, so it frees its slot | Every action is at least Rare |

Crests stack as you climb: a Grailed plant also has the Crown, the Eclipse and the Pearl.

### 2.4 Where each kind of thing sits on the ladder

| Kind | Born at | Climbs by | Top |
|---|---|---|---|
| Managers | their floor's rarity, Common to Exotic (GDD 7.1) | Tier Up at the card. Heads reach Godly only by the Festival crowning | Grailed |
| Plants | Common to Legendary from chests, Legendary hybrids, Exotic mutations | Full Bloom at the Pollination Bench | Grailed |
| Heirlooms | Rare, Epic or Legendary | Restoring at the Workbench | Grailed |
| Tools (rod, spade, pickaxe) | Common | the Workbench | Grailed |
| Helpers | Common | the Workbench | Grailed |
| Chests | tiers 1 to 11 (section 4.3) | do not climb | Grail Chest |
| Fish, finds, rocks and ores | rolled tier, capped by the tool | do not climb | Grailed |
| Cosmetics | their tier | do not climb | Grailed |
| Golden Sprouts, weekend events | rolled tier | do not climb | Grailed (special) |
| Achievements | tiers 1 to 11 of each family | earned in order | Grailed |

## 3. Tier Up

### 3.1 Rules

1. **Any card, heirloom, tool or helper at level `TIERUP_MIN_LEVEL = 2` or higher can tier up** to the next tier, one tier at a time, up to Grailed. Tools and helpers have no levels and can always tier up.
2. **Tiering up keeps everything.** The level, the copies, the place in a planter or slot, the codex entry. It raises the tier by one, applies one `TIERUP_STEP`, and adds a crest from Godly up. Nothing is ever lost.
3. **The price is Pollen and ore of the tier being reached** (section 3.2). Tools and helpers pay their activity's own token instead of Pollen (sections 6.3 to 6.5).
4. **Where it happens.** Managers tier up at their card, at once. Plants tier up at the Pollination Bench as a **Full Bloom** job, which takes real time and uses a bench slot. Heirlooms, tools and helpers tier up at the Workbench, at once.
5. **The ores set the pace.** The ore of a tier comes from the Mine at that tier's depth. Depths 1 to 7 open with the Mine. Sunstone (Godly) opens after the first New Generation, Eclipse Stone (Ungodly) after the third, Cloud Pearl (Holy) after the fifth, and Grailstone (Grailed) after the first Big Bloom (section 6.5).
6. **The Head crowning.** When a world earns its 10th Mastery star, Mayor Thyme crowns its Head Godly at the next Harvest Festival, in its own scene (call p6, kept). That is the only way a Head reaches Godly, and it is free. After it, the Head tiers up with ore like anyone.
7. **Copies still matter.** Duplicates level a card to its max level as before (GDD 8.2). Tier Up does not change the max level. Copies of a max-level card still turn into Pollen, and that Pollen pays for tier-ups. No card is born Mythic or higher, so the max levels of GDD 8.2 need no new rows.
8. **Every tier-up plays the reveal of the tier it reaches** (section 4): the bloom opening at the bench for plants, a new badge pinned on for managers, a glow on the Workbench for heirlooms and tools. The first time a player reaches each tier, the reveal always plays in full.
9. **Tier Up opens with the Mine** (row 45 in section 13). Before that, ores from crates wait in the ore pouch and the Tier Up button shows a silhouette and one line of hint.

### 3.2 Prices

For a card or heirloom reaching tier `t`:

| Reaching | Pollen `TIERUP_POLLEN` | Ore `TIERUP_ORE` | Full Bloom time (plants) `BLOOM_HOURS` |
|---|---|---|---|
| Uncommon | 50 | 10 Jade | 15 min |
| Rare | 150 | 10 Sapphire | 30 min |
| Epic | 400 | 10 Amethyst | 1 h |
| Legendary | 1,000 | 10 Amber | 2 h |
| Mythic | 2,500 | 8 Aurora Opal | 6 h |
| Exotic | 6,000 | 8 Prism Quartz | 12 h |
| Godly | 15,000 | 6 Sunstone | 24 h |
| Ungodly | 35,000 | 6 Eclipse Stone | 36 h |
| Holy | 80,000 | 5 Cloud Pearl | 48 h |
| Grailed | 200,000 | 5 Grailstone | 72 h |

A Common taken all the way to Grailed costs about 340,000 Pollen and 78 ores over ten steps. An Exotic Head has only four steps left, and the crowning gives it the first one free.

### 3.3 What it does to the game

Tier Up is the main new source of power from week 2 on, and it is spread across a hundred or so things the player already owns. It does not touch the first week, because the Mine opens around day 8. Rough arithmetic for an active player:

- **Week 2 (day 8 to 14):** most Commons and Uncommons climb one or two tiers, because low ores are plentiful. That is ×1.5 to ×2.25 on the low floors, which earn little, and a first Mythic plant or heirloom from a Legendary around day 12 to 16.
- **Month 1:** the top managers of the older worlds reach Mythic or Exotic: about ×2.25 to ×3.4 on the floors that earn the most.
- **Month 2 to 3:** Godly and Ungodly arrive with the new layers.
- **Month 4 and later:** Holy, then Grailed after the first Big Bloom.

So the simulator should expect income in month 1 to be several times higher than in 0.4, from tier-ups and Floor Improvements together, and refit the Festival rhythm and the new layers' constants (section 15.2).

## 4. Reveals and juice that scale with rarity

### 4.1 The climb, all eleven steps

The reveal ladder in style bible v1.7, section 19, already covers all eleven tiers: the five beats (Arrive, Build, Tell, Burst, Show), the honest climb of light through the tier colours, and a build-up that gets longer and bigger the rarer the thing. The design adds these rules:

1. **One ladder for every reveal.** Chests, cards, tier-ups, Full Bloom jobs, catches, finds, Geodes, Golden Sprouts, Diary pages, Almanac pages and achievements all use it.
2. **Two forms.** The **full** form plays all five beats. The **short** form plays only the climb, the burst and the chime, in under a second, for things that happen often (catches, finds, rocks, Golden Sprouts, achievements). A short reveal of Mythic or better pauses the game for its burst, so it is never missed.
3. **The first of every tier plays in full**, for every kind of thing: the first Mythic fish, the first Mythic card, the first Mythic chest. Godly and higher always play in full, and can be skipped after two seconds once the player has seen that tier once.
4. **Longer at the top.** Total length targets, from the first jolt to the end of the Show: Common 0.4 s, Uncommon 0.7 s, Rare 1 s, Epic 1.5 s, Legendary 2.5 s, Mythic 3.5 s, Exotic 4.5 s, Godly 5.5 s, Ungodly 6.5 s, Holy 7.5 s, Grailed 9 s. The bible's "held" times are the last beat of these. The playtest tunes both.
5. **The chime climbs one note per tier**, eleven notes in all. Each tier has its own closing sting. The Grailed sting plays the ten stings before it as one rising run.
6. **A Grailed reveal saves a Postcard** (section 11.4) of the moment to the Hall of Fame, the first time for each item.
7. **Reduce motion** keeps the climb as a steady glow and shows the emblem and the tier name. Flashes are never faster than three a second (bible section 19).
8. **A setting, "Quick reveals",** plays every full reveal in its short form, except the first of each tier.

### 4.2 Every big moment has a tier

The engine has one effect call, `moment(tier, place, form)`, that scales particles, light, shake, sound layers and hit-pause by tier, and every big event calls it. This table is the first pass.

| Moment | Tier | Form |
|---|---|---|
| Bumper tap | Uncommon | short |
| Combo meter fills | Rare | short |
| Growth Spurt starts | Epic | short |
| Floor milestone 25, 50, 100 | Common, Uncommon, Rare | short |
| Floor milestone 200 to 400, 500 to 900, 1,000 and up | Epic, Legendary, Mythic | short |
| Tower milestone | one tier above the floor milestone it matches | full |
| New floor opened | Rare. The top floor of a world: Legendary | full |
| New world reached | Exotic the first time ever, Epic after a reset | full |
| Player level up | Rare. Every 10th level: Legendary. Levels 100, 200 and 250: Godly | full |
| Replant | Epic. A new Compost record: Legendary | full |
| Harvest Festival | Mythic. The first ever: Exotic | full |
| New Generation | Godly. The first ever: Ungodly | full |
| Big Bloom | Holy. The first ever: Grailed | full |
| World Mastery star | Legendary. Star 5: Mythic. Star 10: Godly | full |
| Golden Sprout caught, fish, find, rock, Geode | its own tier | short, full for the first of a tier |
| Tier-up | the tier reached | full |
| Achievement | its tier | short |

### 4.3 Chests of eleven tiers

The six chests of GDD 8.3 are tiers 1 to 6, so a chest's tier is its rarity: Wooden Crate (Common) up to the Starlight Chest (Mythic). Five new chests sit above them. Their card slots roll like a Starlight Chest (15, 25, 30, 20 and 10 percent, Common to Legendary). Their extras are fixed, never rolled.

| Tier | Chest | Cards | Guaranteed | Pollen | Heirlooms | Fixed extras |
|---|---|---|---|---|---|---|
| 7 Exotic | Prism Chest | 24 | 3 Legendary, 1 Head copy | 1,000 | 1, Epic or better | 5 Aurora Opal |
| 8 Godly | Sunburst Chest | 28 | 4 Legendary, 1 Head copy | 2,000 | 1 Legendary | 3 Prism Quartz, 1 Mythic cosmetic |
| 9 Ungodly | Eclipse Chest | 32 | 5 Legendary, 2 Head copies | 4,000 | 2, one Legendary | 3 Sunstone, 1 Exotic cosmetic |
| 10 Holy | Pearl Chest | 36 | 6 Legendary, 2 Head copies | 8,000 | 2 Legendary | 2 Eclipse Stone, 1 Godly cosmetic |
| 11 Grailed | Grail Chest | 40 | 8 Legendary, 3 Head copies | 15,000 | 3 Legendary | 2 Cloud Pearl, 1 Grailstone, 1 Grailed cosmetic |

Head copies follow the Starlight rule (GDD 8.3 rule 9): a random Head whose world has at least 5 Mastery stars, else another Legendary.

Where they come from: every New Generation gives a Prism Chest (a Sunburst Chest every fifth time), the first Big Bloom gives a Grail Chest and later ones a Pearl Chest, World Mastery star 10 gives a Sunburst Chest, late Diary volumes and the Almanac's last pages give tiers 6 to 8, and the best catches, finds and Geodes give crates of these tiers (section 6).

### 4.4 Golden Sprouts roll a tier

Every Golden Sprout, Dewdrop and Mystery Crate rolls a tier when it spawns: `VISITOR_TIER_WEIGHTS` = Common 60, Uncommon 22, Rare 10, Epic 5, Legendary 2.2, Mythic 0.6, Exotic 0.2. A rarer visitor glows in its tier's colour, leaves a brighter trail and plays its tier's chime when caught.

| Visitor | Pays at tier `t` | Average, so 0.4's value is kept |
|---|---|---|
| Windfall | `WINDFALL_BASE = 40 s x tierPower(t)` of `steadyIPS`: 40 s Common, 202 s Legendary, 456 s Exotic | 60 s, as in 0.4 |
| Sunbeam | ×5 boost for `25 s x (1 + 0.25 x (t - 1))` | about 30 s |
| Tap Storm | ×10 tap boost for `13 s x (1 + 0.25 x (t - 1))` | about 15 s |
| Dewdrop | `DEWDROP_GEMS` = 1, 2, 3, 5, 8, 12, 20, 30, 50, 80, 120 Gems | about 2 Gems |
| Mystery Crate | a chest two tiers below the visitor's, at least a Wooden Crate | about a Wooden Crate, as in 0.4 |

The Common values are lowered so that the average payout stays what 0.4 measured. Tapping is no stronger on average. It is only lumpier and more exciting. The Busy Bee keeps its own timer and its 5 Pollen, with no tier.

The four top tiers are never rolled. Each comes once, at a moment worth celebrating: a **Godly Sprout** is the first visitor after every Harvest Festival, an **Ungodly Sprout** the first after every New Generation, a **Holy Sprout** the first after every Big Bloom, and a **Grailed Sprout** the first after the player's first Grailed tier-up, and on the save's birthday every year after. They pay a Windfall of their tier.

Visitor luck comes from Golden Sprout skills, the County Fair heirloom set and Style perks. It multiplies the weights of Rare and better, the same way chest luck does (GDD 8.3 rule 6). Some things raise a visitor's tier instead (the Family Motto "Showfolk", the County Fair set, a Golden Seed). Raises from every source add up to at most two tiers, and a rolled visitor is never above Exotic.

### 4.5 Weekend events roll a tier

Each weekend event (GDD 15.3) has a tier, rolled from the week number so it is the same however the clock is moved: `EVENT_TIER_WEIGHTS` = Common 35, Uncommon 25, Rare 17, Epic 11, Legendary 7, Mythic 3.5, Exotic 1.5. Pity: at least one Epic or better every 4 weekends and one Legendary or better every 10. The weekend of the save's birthday is always Godly.

- The banner, the fair stall's dressing and the reward track take the tier's look.
- The main-game bonus grows by `EVENT_BONUS_STEP = 15%` per tier above Common. For example, the Night Market's ×1.5 offline bonus is ×1.5 at Common and ×1.95 at Exotic.
- Every reward chest on the track is `floor((t - 1) / 2)` chest tiers better. Each event tier has its own cosmetic banner for the Wardrobe.
- The calendar screen shows the coming four weekends' tiers, so nothing is a surprise and nothing is missed for good: every tier and every event comes back.

## 5. Floor Improvements: a better core upgrade

1. **Every floor has three Improvements**, I, II and III. They appear at floor levels `IMPROVE_LEVELS = 25, 100, 300` in the current run.
2. **Price:** `IMPROVE_PRICE = 10, 20, 40` times that floor's own level cost at the level where the Improvement appears, in the world's currency. So Improvement I on the Windowsill costs about 200 Coins, and on Sprout Tower HQ about 1.5 trillion.
3. **Effect:** each one doubles that floor's profit (`IMPROVE_MULT = 2`), so all three are ×8. They are a new bucket in GDD 13.1: `x 2 ^ improvementsOwned(floor)`.
4. **They are run purchases.** A Replant or a Festival clears them, like floor levels. The Auto-Gardener buys them on the same 10% rule as levels.
5. **They show on the floor.** Each Improvement adds a prop to the room: I a small tool or sign, II a second rack or a helper prop, III a showpiece. Every run, the tower visibly fills up again.
6. **Unlock:** after the first Replant, so the first run stays one button simple.
7. **Names** are the Writer's. Examples for Thymeford: Windowsill Planter (Bigger Planter, Sunny Spot, Self-Watering Saucer), Balcony Boxes (Trellis, Herb Ladder, Flower Box Garden), Backyard Hemp Patch (Drip Hose, Sturdy Stakes, Bale Wagon), Tea House (Copper Kettle, Window Seat, Garden Terrace).

Why: the core loop had one kind of purchase in a run (levels) besides opening floors and hiring. Improvements add a decision ("the next level, or the Improvement?") and a pop of ×2 that can be seen on the floor. They make every run's middle stretch faster, so the simulator raises `D` and the tickets to match (section 15.2).

## 6. Field activities: fishing, digging and mining

### 6.1 What they share

All three are built once, as one system with three games on top (section 15.1).

- **The Field tab** opens with the first activity. Each activity has **spots**, one in each world where it fits, and each spot has its own table of eleven things to find, one per tier.
- **Charges.** Each activity has a store of `CHARGE_STORE = 20` charges, shown as casts, digs and picks. One charge regrows every `CHARGE_MINUTES = 6`, while playing and while away (a timer, clock rules 1 to 4 in GDD 15.2). A full store is about two hours of regrowth, and a day holds up to 240 actions per activity.
- **A tool.** The rod, the spade and the pickaxe each have a tier from Common to Grailed. A tool can **reach** one tier above its own: a Legendary rod can hook a Mythic fish, never an Exotic one. Each tool tier above Common adds `GEAR_LUCK_STEP = 10%` luck.
- **A helper** automates the activity: Otis the Otter fishes, Digby the Mole digs, and the Gnome Crew mines. **A helper only ever uses overflow:** when the store is full, the helper spends the charge that would have been wasted. Away from the game, the helper works through the overflow of the away time, up to the offline cap. So automation never takes a charge the player could have used, and an idle player still gets everything a full store would have thrown away. A helper never gets a Perfect Hook or a Bumper strike. Each helper tier adds `HELPER_LUCK_STEP = 5%` luck.
- **The roll.** Each action rolls a tier from the spot's weights, `CATCH_WEIGHTS` = Common 50, Uncommon 25, Rare 13, Epic 7, Legendary 3.2, Mythic 1.2, Exotic 0.4, Godly 0.13, Ungodly 0.05, Holy 0.015, Grailed 0.005. Tiers above the tool's reach are left out and the rest are scaled to 100%. Luck multiplies the weights of Rare and better, as in GDD 8.3 rule 6. The odds are shown on the spot.
- **The Legend Meter** is the pity: after `LEGEND_METER = 60` actions without a result at the tool's own tier or better, the next action is at the tool's tier.
- **A token** for upgrading the tool and the helper: Shiny Scales from fishing, Trinkets from digging, and the ores themselves from mining. Every result pays its tier's amount: `TOKENS` = 1, 2, 3, 5, 8, 12, 18, 27, 40, 60, 90.
- **A crate** of its own, which is a chest of its tier (section 4.3) plus one extra from the activity.
- **A collection** in the Codex and the Museum (section 6.7).
- **Taps here are not counted taps** (rule 7 in section 1.3). Holding works at `HOLD_RATE`.

### 6.2 What each one feeds

| Activity | First spot | Main reward | Feeds | Token | Crate | Collection |
|---|---|---|---|---|---|---|
| Fishing | Thymeford's Millpond | Tackle Boxes and a fish for the log | card levels (chests), Pollen, cosmetics | Shiny Scales | Tackle Box | the Fish Log |
| Digging | Loomington's Old Allotments | Finds for the Museum, lost heirlooms | Museum bonuses, heirloom levels | Trinkets | Buried Chest | the Museum |
| Mining | Mount Mitten's Mitten Mine | Ores | tier-ups of everything, tools | ores | Geode | the Ore Hall |

### 6.3 Fishing

**How it plays.** Tap to cast (one charge). The bobber floats for 2 to 6 seconds, then "Bite!" pops up. Tap within `BITE_WINDOW = 0.8 s`. Then hold to reel while a ring fills, for `0.4 s + 0.25 s x (t - 1)`, so a Grailed fish takes 2.9 s of holding. Let go early and the fish swims off and the charge comes back. A tap inside the first `PERFECT_WINDOW = 0.25 s` of the bite is a **Perfect Hook**: the tier is rolled twice and the better one is kept.

**The catch.** The fish is shown with a short reveal of its tier, measured (for the log's size record), written in the Fish Log and released with a splash and a wave. Every fish leaves Shiny Scales as thanks.

**Tackle Boxes.** An Epic fish leaves a Tackle Box 25% of the time. A Legendary or better fish always does. The box's tier is the fish's tier minus 3 (an Epic fish gives a Wooden one, a Grailed fish a Sunburst one). A Tackle Box is a chest of its tier plus one extra: Shiny Scales, an ore of its tier or a pond cosmetic.

**Spots.** Thymeford's Millpond, Loomington's Old Canal, Papaya Cay's Lagoon and Mount Mitten's Ice Hole at launch. The Moon's Crater Pond and the Nebula Nursery's Star Pool come with their worlds. A spot opens when its world is reached.

**The Millpond's fish** (first-pass names for the Writer): Pebble Minnow, Clover Perch, Bluebell Bream, Amethyst Gudgeon, Golden Carp, Aurora Trout, Rainbow Koi, Sunburst Pike, Eclipse Eel, Pearl Sunfish, and Grandpa Gill, the Grailed carp who has lived in the pond since the tower was a windowsill.

**The rod** starts as a Bamboo Rod (Common). Upgrading it to tier `t` costs Shiny Scales, and from Mythic up also ore of that tier: `GEAR_TOKENS` = 50, 150, 400, 1,000, 2,500, 6,000, 15,000, 35,000, 80,000, 200,000 and `GEAR_ORE` (from Mythic) = 6, 6, 5, 5, 4, 4. Between the player and Otis, all 240 casts of a day are used, for about 300 to 500 Scales a day as the rod improves, so a Legendary rod takes four to five days, and a Mythic rod waits for the Mine.

**Otis the Otter** fishes the overflow. He tiers up with Scales at half the rod's prices.

**Unlock:** player level 14, about two hours in. Story quest "Gone Fishing": Pip hands over the Bamboo Rod.

### 6.4 Digging

**How it plays.** A patch of `DIG_PATCH = 24` soil tiles, six by four. Tap a tile to start digging it (one charge), then keep tapping or hold. A tile needs `DIG_TAPS` taps for the tier of what lies under it: 3, 4, 5, 7, 9, 12, 15, 19, 24, 30, 38. The player cannot see the tier until it is dug, but a tile that takes longer is holding something better, and the spade's sparkle hints at Epic or better. Leave a tile half dug and it waits, with nothing lost. When the last tile is dug, a fresh patch rolls in.

**Finds.** Each tile holds a find of its tier. A find goes into the Museum the first time and gives Trinkets every time. 4% of tiles (`BURIED_CHEST_CHANCE`) hold a Buried Chest instead, two tiers below the tile's tier (at least a Wooden Crate), with Trinkets or an ore as its extra. One in ten Epic-or-better tiles (`LOST_HEIRLOOM_CHANCE`) holds a lost heirloom piece of that tier or lower, following the heirloom rules of GDD 8.3 rule 7 (no repeats until a rarity is complete, and its own pity).

**Spots.** Loomington's Old Allotments and Papaya Cay's Dunes at launch. The Moon's Crater Sands come with it.

**The Old Allotments' finds** (first pass): Odd Button, Clay Marble, Brass Thimble, Pocket Watch, Gilded Seed Tin, Aurora Glass Float, Prism Teacup, Sunburst Weathervane, Eclipse Music Box, Pearl Brooch, and the Grail Trowel, the very first tool of Sprout Tower.

**The spade** starts Common and climbs with Trinkets, plus ore from Mythic up, at the rod's prices. Each tier needs 8% fewer taps per tile. **Digby the Mole** digs the overflow and climbs with Trinkets at half price.

**Unlock:** Loomington floor 5 opened (day 1 to 2). Story quest "Something Buried": a kite lands in the old allotments and Pip finds a button under it.

### 6.5 Mining

**How it plays.** A rock face of `ROCK_FACE = 6` rocks. Each rock shows its tier by colour. Tap a rock to start on it (one charge), then strike it by tapping or holding until it splits open. A rock takes `ROCK_HP` strikes: 5, 8, 12, 18, 27, 40, 60, 90, 135, 200, 300, divided by the pickaxe's power, which is ×1.25 per tier. A strike has a 5% chance to be a Bumper strike for ×5 damage, with a crunch and a hit-pause. Rocks above the pickaxe's reach sparkle but cannot be struck yet. This is the most clicker-like of the three, on purpose.

**Ores.** A broken rock gives ores of its tier, `ORE_YIELD` = 3 for Common to Legendary, 2 for Mythic to Godly, 1 for Ungodly to Grailed. 5% of rocks (`GEODE_CHANCE`) also drop a Geode of their tier.

| Tier | Ore | Opens |
|---|---|---|
| 1 | Pebble | with the Mine |
| 2 | Jade | with the Mine |
| 3 | Sapphire | with the Mine |
| 4 | Amethyst | with the Mine |
| 5 | Amber | with the Mine |
| 6 | Aurora Opal | with the Mine |
| 7 | Prism Quartz | with the Mine |
| 8 | Sunstone | after the first New Generation |
| 9 | Eclipse Stone | after the third New Generation |
| 10 | Cloud Pearl | after the fifth New Generation |
| 11 | Grailstone | after the first Big Bloom |

A depth that is not open yet shows as a silhouette with its rule.

**Geodes** pop open with the climb. A Geode of tier `t` holds ores of tiers `t` and `t + 1` (if that depth is open), Gems, and sometimes a cosmetic. A Grailed Geode always holds a Grailed cosmetic.

**The pickaxe** starts Common. Upgrading it costs `PICK_ORE = 15` ores of the tier being reached, so the Mine pays for itself. **The Gnome Crew**, three garden gnomes who finally have a job, mine the overflow. They climb with ores at half the pickaxe's price.

**Spots.** Mount Mitten's Mitten Mine at launch. The Moon Quarry and the Nebula Nursery's Asteroid Garden come with their worlds, each with its own rock looks. All spots share the ore table.

**Unlock:** Mount Mitten floor 3 opened (about day 8). Story quest "Gnomes Wanted". Tier Up opens with it (story quest "Stronger Than Before": Pip learns that ore can make anything grow stronger).

### 6.6 Outings (in the second update)

A helper can go on an **Outing** instead of working the overflow: 4, 8 or 24 hours to any open spot in any world. It comes back with a crate whose tier is rolled with better odds the longer it was away, and its own Legend Meter. While it is out, the overflow at home is not worked, so the player chooses between steady and lumpy. It is the old expedition idea from the brainstorm, made cozy.

### 6.7 The Museum and three new Codex chapters

- The Codex gains three chapters: **the Fish Log**, **the Museum** (finds) and **the Ore Hall** (ores and Geodes). Each new entry gives 5 Gems once and +0.25% profit forever, like every Codex entry (GDD 11.5).
- Every spot's eleven entries form three **displays**: tiers 1 to 5, tiers 6 to 8 and tiers 9 to 11. A finished display gives a permanent bonus that fits its spot. First pass: the Millpond's displays give +5% offline earnings, +1 visitor second and +5 charge store for fishing. The Content Builder writes the rest from that pattern.
- The **Museum screen** in Thymeford shows every display, every record fish and the Hall of Fame (section 7.1). It is a place to look at, not a place to manage.

## 7. Two more reset layers

| Layer | Name | Currency | First time (active player) | Rhythm |
|---|---|---|---|---|
| 1 | Replant (GDD 12.1) | Compost | about 40 minutes | several a day |
| 2 | Harvest Festival (GDD 12.2) | Ribbons | about day 4 to 5 | every 1 to 10 days, further apart over time |
| 3 | **New Generation** | **Laurels** | about day 30 | every 1 to 2 weeks |
| 4 | **Big Bloom** | **Starseeds** | about day 90 | every 3 to 6 weeks |

The same three promises hold at every layer: the currency comes from a gentle root of a lifetime total, so quick repeats give nothing; the passive bonus counts every unit ever earned in its scope, so spending never costs the bonus; and the shop's power items have level caps.

### 7.1 New Generation (Laurels)

**Fiction:** the Head Gardener retires with honours. Their portrait goes up in the Hall of Fame, the trowel passes to the next generation of the family, and the whole brand starts again from one windowsill, with the family's laurels on the wall.

```
ribbonsTotal  = floor( (compostThisGeneration / RIBBON_C0) ^ RIBBON_EXP )      (GDD 12.2, scoped to the generation)
laurelsTotal  = floor( (ribbonsLifetime / LAUREL_R0) ^ LAUREL_EXP )
laurelsPending = laurelsTotal - laurelsClaimed
```

- `compostThisGeneration` is what 0.4 calls `compostAllTime`, counted from the start of the current generation. `ribbonsLifetime` is every Ribbon ever claimed, in every generation. `LAUREL_EXP = 0.5`. `LAUREL_R0` is fitted by the simulator so that `FIRST_GEN_MIN = 3` Laurels are pending around day 30 for an active player.
- **Unlocks** when Mount Mitten has been reached and 3 Laurels are pending. Later generations need 1.
- **On New Generation:** `laurelsClaimed += laurelsPending`. Everything a Festival resets resets (GDD 12.2). `compostThisGeneration` and `ribbonsClaimed` reset to 0. The Ribbon Shop's power items reset: Golden Hour, Master Composter, Festival Fireworks and Blue Ribbon Polish. The Ribbon passive (GDD 12.2) then counts the Ribbons of the new generation, as the Compost passive counts the Compost of the current era.
- **Kept:** every slot and convenience bought in the Ribbon Shop (deeds, the Auto-Gardener, Auto-Replant, the second desk, heirloom shelves, the third planter, the Deluxe Basket), and everything a Festival keeps, plus activities, tools, helpers, ores, tier-ups, cosmetics and collections.
- **Passive:** every Laurel ever claimed gives `LAUREL_PCT = +50%` profit in every world and `LAUREL_RIBBON_PCT = +10%` Ribbon gain. Spending Laurels does not lower either.
- Each New Generation gives a Prism Chest (a Sunburst Chest every fifth time), a free respec, an Ungodly Sprout and a new rooftop ornament for the tower, up to ten.
- **Targets:** after the first New Generation, an active player is back to their old Ribbon total within 3 days and ahead of it after that. Generations land 7 to 14 days apart.

**The Laurel Shop** never resets until a Big Bloom, and then only its power items do.

| Item | Effect | Levels | First-pass cost |
|---|---|---|---|
| Family Motto | Choose one motto for the generation (below). It can be changed at every New Generation | 1 | 3 |
| Golden Legacy | Profit ×2 per level, in every world | 5 | 3, 10, 30, 100, 300 |
| Festival Fame | Ribbon gain +10% per level | 10 | `5 x 1.6^(n-1)` |
| Heirloom Shelf V and VI | Heirloom slots 7 and 8 (hotkeys U and I) | 1 each | 8 and 40 |
| Third Research Desk | Three projects at once | 1 | 15 |
| Third Bench Slot | Three bench jobs at once (Full Bloom included) | 1 | 20 |
| Seasoned Soil | Every Festival starts with Rich Soil at level 2 | 1 | 12 |
| Family Album | Hall of Fame frames and the portrait kit's extra parts | 1 | 5 |
| Laurel Polish | Each Laurel gives +2 points more profit per level (50% becomes 52%, 54% and so on) | endless | `20 x 1.15^(n-1)`, rounded up |

**Family Mottos** (one at a time): **Busy Hands** (tap power +100%, under the tap cap), **Patient Hearts** (offline efficiency +20 points, applied after the cap), **Keen Eyes** (Pollen from every source +50%), **Field Folk** (charges regrow 50% faster) and **Showfolk** (Golden Sprouts roll one tier higher, up to Exotic). A motto changes how a generation plays, which keeps the fourth and fifth generation fresh.

**The Hall of Fame** holds a portrait of every retired Head Gardener, built from a small kit of hats, hair and aprons, with that generation's records: Festivals held, best Ribbons, first Mythic, best fish. It is the family album of the save.

### 7.2 Big Bloom (Starseeds)

**Fiction:** Sprout Tower plants a Starseed in the sky, and the whole galaxy garden blooms anew.

```
starseedsTotal   = floor( (laurelsLifetime / STARSEED_L0) ^ STARSEED_EXP )
starseedsPending = starseedsTotal - starseedsClaimed
```

- `STARSEED_EXP = 0.5`. `STARSEED_L0` is fitted so that the first Starseed is pending around day 90 for an active player.
- **Unlocks** when the Nebula Nursery has been reached and a Starseed is pending. It ships with that world (ROADMAP).
- **On Big Bloom:** everything a New Generation resets resets, plus `laurelsClaimed` and the Laurel Shop's power items (Golden Legacy, Festival Fame, Laurel Polish). Its slots and conveniences stay, and so does the Hall of Fame.
- **Passive:** every Starseed gives `STARSEED_PCT = +100%` profit in every world and `STARSEED_LAUREL_PCT = +20%` Laurel gain.
- Starseeds are spent on the **Constellation map** (section 8.4). The first Big Bloom opens Grailstone, the Grailed tier and the Holy Sprout, and gives a Grail Chest.

### 7.3 How the profit formula grows

New buckets join GDD 13.1, each one finite or a gentle root, so section 13.6 of the GDD still holds:

```
profitMult(floor) = (version 0.4 formula, with managerProfit and the trait values including tier-ups)
  x 2 ^ improvementsOwned(floor)                                   section 5, this run only
  x (1 + (LAUREL_PCT + 0.02 x laurelPolishLevel) x laurelsClaimed)   section 7.1
  x 2 ^ goldenLegacyLevel                                          section 7.1, 5 levels
  x (1 + STARSEED_PCT x starseedsClaimed)                          section 7.2
  x (1 + STYLE_PCT x styleLevel)                                    section 10, finite
  x (1 + sum of display bonuses)                                    section 6.7, finite
  x (1 + sum of Evergreen and Constellation profit bonuses)         section 8, additive
```

Laurel Polish and the Evergreen ranks are the only endless items. Both add a fixed step whose price rises, so they grow with the logarithm of the effort, like Blue Ribbon Polish.

## 8. Longer trees

### 8.1 Four branches, five tiers and a grand keystone

The skill tree (GDD 9.2, CONTENT 5) gains a fourth branch and two more tiers in every branch.

| Tier | Opens at (points in the branch) | Contents |
|---|---|---|
| 1 to 3 and keystone | 0, 5, 15, 30 (as now) | 6 minors, 2 majors, 2 keystones (pick one): 37 points |
| 4 | 37 | 2 minors (5 ranks) and 1 major (3 ranks): 13 points |
| 5 | 50 | 2 minors and 1 major: 13 points |
| Grand keystone | 62 | pick one of two: 1 point |

A branch now holds 64 points and the tree 256. With `LEVEL_CAP = 250` the player has 249 points, so even at the cap the last few points are a choice.

**Green Thumb (tapping), tiers 4 and 5**

| Skill | Tier | Ranks | Effect per rank |
|---|---|---|---|
| Feather Touch | 4 | 5 | `tap.power` +10% |
| Encore | 4 | 5 | `spurt.tapsNeeded` -4% |
| Showboat | 4, major | 3 | `tap.critMult` +1 |
| Sprout Whisperer | 5 | 5 | visitor luck +5% (section 4.4) |
| Drumroll | 5 | 5 | Combo grace +0.3 s |
| Grand Finale | 5, major | 3 | When a Growth Spurt ends, the Combo stays full for 5 s more |
| **Thousandth Tap** | grand keystone | 1 | Every 1,000th counted tap is an Exotic Bumper: it pays 60 s of `steadyIPS` with an Exotic moment |
| **Golden Age** | grand keystone | 1 | While a Growth Spurt runs, Golden Sprouts come twice as often (the floor of 0.4 on `visitorIntervalMult` in GDD 13.4 still holds) |

**Botanist (collection), tiers 4 and 5**

| Skill | Tier | Ranks | Effect per rank |
|---|---|---|---|
| Bloom Keeper | 4 | 5 | `bench.speed` +5%, Full Bloom included |
| Ore Sense | 4 | 5 | Tier Up Pollen -3% |
| Kindred Roots | 4, major | 3 | `plant.affinity` +0.1 |
| Patron | 5 | 5 | `heirloom.power` +4% |
| Spare Parts | 5 | 5 | Pollen from max-level copies +10% |
| Horseshoe | 5, major | 3 | `chest.luck` +5% |
| **Hybrid Vigour** | grand keystone | 1 | Hybrids and Exotic plants tier up for half the Pollen |
| **Star Collector** | grand keystone | 1 | Every Codex entry gives +0.5% profit instead of +0.25% |

**Tycoon (automation), tiers 4 and 5**

| Skill | Tier | Ranks | Effect per rank |
|---|---|---|---|
| Overtime | 4 | 5 | `floor.speed` +3% (global) |
| Shrewd | 4 | 5 | Floor Improvement prices -5% |
| Head Office | 4, major | 3 | `manager.power` +8% |
| Long Nights | 5 | 5 | `offline.cap` +0.5 h |
| Hiring Fair | 5 | 5 | `hire.fee` -8% |
| Legacy Builder | 5, major | 3 | Ribbon gain +5% |
| **Clockwork Tower** | grand keystone | 1 | The Auto-Gardener spends up to 25% of the currency in hand instead of 10% |
| **Sleeping Giant** | grand keystone | 1 | Research and bench jobs run 25% faster while the game is closed |

**Explorer (the field), a new branch**

| Skill | Tier | Ranks | Effect per rank |
|---|---|---|---|
| Early Riser | 1 | 5 | charges regrow 4% faster |
| Big Bucket | 1 | 5 | charge store +2 |
| Steady Line | 2 | 5 | `BITE_WINDOW` +0.08 s |
| Sharp Spade | 2 | 5 | dig taps -5% |
| Strong Arm | 2, major | 3 | strike damage +15% |
| Lucky Waters | 3 | 5 | fishing luck +6% |
| Treasure Nose | 3 | 5 | digging luck +6% |
| Busy Paws | 3, major | 3 | helpers' luck +5% |
| **Perfect Patience** | keystone | 1 | A Perfect Hook raises the catch one tier instead of rolling twice |
| **Prospector** | keystone | 1 | Every 10th rock broken drops a Geode of its tier |
| Mother Lode | 4 | 5 | ore yield +5% (fractions roll) |
| Gallery Eye | 4 | 5 | display bonuses +5% |
| Legend Hunter | 4, major | 3 | the Legend Meter needs 5 fewer actions |
| Long Outings | 5 | 5 | Outing crates +4% luck |
| Field Notes | 5 | 5 | Almanac points from activities +10% |
| Golden Tools | 5, major | 3 | tool and helper prices -10% |
| **Sixth Sense** | grand keystone | 1 | Tiles, bites and rocks of Mythic or better shimmer before you act |
| **Eager Helpers** | grand keystone | 1 | Helpers also work when the store is not full, at half speed, and never take the last 5 charges |

The Explorer branch opens when a second activity unlocks, with no points spent in it yet. None of its skills touch chest luck or Compost gain.

### 8.2 Level cap 250 and Evergreen ranks

- `LEVEL_CAP` rises from 112 to 250. The XP rule stays `500 + 250 x L`. New XP sources: first-time catches, finds and ores (50 x tier), Diary pages (200), Almanac pages (300), Challenges (100 to 1,000 by tier) and tier-ups (100 x tier reached).
- Level-up chests continue (GDD 8.4). A Starlight Chest comes at levels 50, 100, 150, 200 and 250.
- An active player reaches level 112 around month 3, as in 0.4, and level 250 around month 10 to 12 (about 7.9 million XP in all). The simulator checks this.
- **Evergreen ranks.** After level 250, every `EVERGREEN_XP = 60,000` XP gives one Evergreen Leaf, forever. Leaves buy ranks in six endless nodes, each a fixed step that adds: profit +1% (global), floor speed +0.5%, tap power +1% (under the tap cap), offline efficiency +0.5 points (under the cap), Pollen gain +1%, charges regrow +0.5% faster (up to 50%).

### 8.3 Research: a fifth lane, Field Science

Twelve projects for the field, costed by the simulator: Bigger Buckets I to III (charge store +5 each), Quick Regrowth I to III (charges regrow 10% faster each), Fish Finder (the bite shows a little earlier), Soil Survey (Epic-or-better tiles sparkle), Mine Carts (ore yield +10%), Geode Polishing (Geodes have a 10% chance to be one tier higher), and Tier Up Studies I and II (Tier Up Pollen -10% each).

### 8.4 The Constellation map

Bought with Starseeds after the first Big Bloom. Eight constellations, one per plant family, each with eleven stars: ten small ones (1 or 2 Starseeds each, +5% to +10% steps on the family's theme) and one bright star (5 Starseeds) that changes a rule. A finished constellation glows as a picture in the sky behind every world.

| Constellation | Bright star |
|---|---|
| Hemp, the Great Loom | Every Hemp plant is at home on every floor, and floors that make hemp goods get ×2 profit |
| Mint, the Cool Breeze | `SPURT_DURATION_CAP` rises from 45 s to 60 s, and Growth Spurts last 50% longer |
| Basil, the Ember | `CRIT_MULT_CAP` rises from 20 to 25 |
| Rosemary, the Storm | Tap Storms last twice as long |
| Lavender, the Dreamer | Offline efficiency can reach 125% |
| Sage, the Scholar | Research and bench jobs run 50% faster |
| Chamomile, the Sleepy Sun | Morning Dew is ×3 and lasts 5 minutes |
| Thyme, the Old Clock | The cooldown reduction cap rises from 50% to 60% |

## 9. Better items: heirlooms and Garden Treats

### 9.1 Four new heirloom sets

Ten sets, 30 pieces. The new sets come with the new systems and drop in the usual ways (GDD 8.7), and their activity can dig them up too.

| Set | Rare | Epic | Legendary, with its ability | Two pieces | Three pieces |
|---|---|---|---|---|---|
| **Angler's Luck** | Grandpa's Lucky Lure: fishing luck +15% | Kingfisher Feather: `BITE_WINDOW` +0.2 s | Silver Tide Net: fishing charges regrow 25% faster. **Big One:** the next 3 casts are Perfect Hooks (30 min) | fishing charge store +5 | Tackle Boxes are one tier better |
| **Treasure Hunter** | Old Map Scrap: digging luck +15% | Brass Dowsing Rod: Epic-or-better tiles sparkle | Old Prospector's Hat: dig taps -20%. **Lucky Dig:** the next tile is at least Epic (30 min) | dig taps -15% | Buried Chest chance ×2 |
| **Deep Delver** | Gnome Lantern: strike damage +20% | Ore Compass: ore yield +15% | Starforged Hammer: Geode chance +5 points. **Rich Seam:** the next 10 rocks are one tier higher, within reach (45 min) | Bumper strike chance +5 points | +1 ore from every rock |
| **County Fair** | Rosette Pin: Style points +10% | Judge's Spyglass: visitor luck +20% | The Golden Gardener's Hat: Ribbon gain +15%. **Showtime:** for 60 s every Golden Sprout is at least Epic (30 min) | visitor lifetime +4 s | Golden Sprouts roll one tier higher |

Heirloom slots rise from 6 to 8 (Laurel Shop). No heirloom gives chest luck or Compost gain.

### 9.2 Garden Treats

Small consumables, made at the **Workbench** from tokens and ores, and found in crates. The Workbench makes Common to Legendary Treats. Mythic and better Treats come only from Geodes, events and the Almanac. A Treat of a higher tier is stronger or longer.

| Treat | At Common | Each tier higher | Made from |
|---|---|---|---|
| Sunshine Jar | a ×2 boost in the world on screen for 60 s (it adds into the Boost) | +30 s | Shiny Scales and Pebble |
| Rain Cloud in a Bottle | adds 100 taps to the Spurt meter | +50 taps | Trinkets |
| Golden Seed | the next Golden Sprout arrives within 10 s | it rolls one tier higher, up to Exotic | Shiny Scales and Trinkets |
| Bait Bucket | +10 fishing charges, even past the store | +5 | Shiny Scales |
| Spare Spade | +8 dig charges | +4 | Trinkets |
| Gnome Snacks | +8 mining charges | +4 | Pebble and Jade |
| Time Capsule | 30 min of offline-rate income at once, from the steady rate | +30 min | Amber |

Treats live in a pouch with a small quick bar. A Treat never stacks with itself: using a second Sunshine Jar restarts the timer (GDD 13.5 rule 2).

**Unlock:** the Workbench opens with the first 50 Trinkets (day 2), and it is also where heirlooms, tools and helpers tier up.

## 10. Style: cosmetics that boost by being owned

### 10.1 What there is

- **Tower skins:** the roof, frame and sky as one look (Autumn Lanterns, Spring Blossom, Frost Fair Lights, Kite Day).
- **Floor dressings:** a themed set of small props for a world's floors.
- **Gardener outfits:** hats and aprons on the managers' shared head anchor, and colour sets for a whole world's staff.
- **Pip outfits**, **tap trails**, **Bumper bursts**, **Golden Sprout costumes**, **chest skins** and **card backs**.
- **Hall of Fame frames**, **Jukebox tracks** and **sky pictures** (the Constellations).

Every cosmetic has a tier from Common to Grailed.

### 10.2 Style points and the Style level

- Owning a cosmetic gives Style points by its tier: `STYLE_POINTS` = 1, 2, 4, 7, 12, 20, 35, 60, 100, 170, 300.
- Style level `n` needs `STYLE_LEVEL_STEP = 25 x n` more points than level `n - 1`. Each Style level gives `STYLE_PCT = +1%` profit in every world.
- Style perks at levels 5, 10, 20, 30, 40 and 50: visitor lifetime +1 s, Morning Basket store +1, offline cap +0.5 h, charge store +5 for every activity, visitor luck +10%, and a bonus Diary page every volume.
- Style never gives chest luck or Compost gain (rule 6 in section 1.3). Long Nights and this perk add 3 hours of offline cap, which brings everything in the game to exactly `OFFLINE_CAP_MAX = 36 h` (GDD 13.4).

### 10.3 Wear what you like

Power comes from owning, so the Wardrobe is free choice. The one exception is small on purpose: wearing every piece of one **outfit set** (for example Autumn Lanterns: the tower skin, the tap trail, Pip's outfit and the chest skin) gives that set's little perk, such as +5% offline earnings. Changing clothes is free and instant.

### 10.4 Where cosmetics come from

Achievement tiers 6 to 11, World Mastery stars 3, 6 and 9, finished displays, every weekend event tier, the Season Almanac, Baron's Challenges, Geodes and Tackle Boxes (rarely), the Laurel Shop and the Constellations. The **Boutique** sells six cosmetics a week, Common to Legendary, for Gems (50, 80, 120, 200 and 300), and past seasons' cosmetics come back there a year later. Mythic and better cosmetics are only ever earned.

**Unlock:** the Wardrobe opens with the first cosmetic, on Diary page 3 (day 3). The Boutique opens at the first Festival.

## 11. A daily rhythm that never punishes

### 11.1 The Garden Diary

- A diary of `DIARY_PAGES = 28` pages. Every day the game is opened (by the guarded day counter, GDD 15.2), the next page fills. A missed day costs nothing: the diary simply waits.
- Volume I: Gems and Wooden Crates on most pages, the first cosmetic on page 3 (a hat for Pip), a Silver Chest on page 7, a Golden Chest on page 14, a Crystal Chest on page 21, and on page 28 a Starlight Chest and the volume's cover for the Wardrobe.
- There are eleven volumes, one per tier. Each volume's rewards are a little better than the last, and every second volume moves its chests up one tier. Volume XI has a Grailed cover. After it, Volume XI's rewards repeat for as long as the save is played.
- Unlock: the first return after an hour away.

### 11.2 The Season Almanac

- A free reward track that runs for a 28-day season, thirteen seasons a year with rotating themes (Spring Seedlings, Kite Festival, Summer Sun, Autumn Lanterns, Frost Fair, Starfall and more).
- 40 pages. Almanac points come from daily quests (100 each), weekly quests (400 each), activities (1 per charge), Challenges (150) and Festivals (500).
- Rewards: chests, Pollen, ores, Treats and cosmetics. Page 40 is the season's Legendary outfit set. After page 40, bonus pages give a Copper Chest every 1,000 points.
- A season that ends half done keeps what was earned. Its cosmetics come back in the Boutique a year later.
- Unlock: player level 16 (day 1).

### 11.3 Baron Fauxliage's Challenges

- Every day, the Baron posts three challenges, one each at Common, Rare and Legendary difficulty, and once a week a Mythic "Grudge Match". He is sure his plastic plants will win. They never do.
- Examples: tap 600 times in 60 s, catch 3 Golden Sprouts in 5 minutes, land 5 Perfect Hooks, reach floor 6 within 6 minutes of a Replant, break 10 rocks in 2 minutes, keep the Combo full for 90 s.
- A win pays the **Baron's Forfeit**, a chest of the challenge's tier, plus Almanac points and one of the Baron's excuses. A loss costs nothing, and a challenge can be tried again all day.
- Unlock: player level 26 (day 2 to 3).

### 11.4 Postcards (in the second update)

A camera button frames the tower with a Wardrobe frame and saves a picture. A player's first Grailed reveal of each kind saves one by itself to the Hall of Fame.

### 11.5 The Jukebox (later)

Tracks of the soundtrack, unlocked by displays and Almanac pages, playable in any world.

## 12. Smaller additions

### 12.1 Achievements to eleven tiers

Every achievement family gets tiers 6 to 11 (Mythic to Grailed), and each badge is drawn in its tier's look. Ten new families: fish caught, finds dug, rocks broken, tier-ups, Style level, Diary pages, Challenges won, generations, Big Blooms and Golden Sprouts of Mythic or better. That is 30 families and 330 achievements, each still +1% profit (GDD 11.4). Gems by tier: 5, 10, 15, 25, 50, 75, 100, 150, 200, 300, 500. XP for tiers 6 to 11: 2,500, 4,000, 6,000, 9,000, 13,000 and 20,000. The Content Builder writes tiers 6 to 11 at about three to five times the tier before.

### 12.2 Daily and weekly quests

The pools (CONTENT 10) gain field quests (catch 10 fish, dig a whole patch, break 20 rocks, land a Perfect Hook, open a Geode) once each activity is unlocked.

### 12.3 More to come, in later updates

Kite Flying in Loomington (catch the wind on the rooftops, a fourth activity), a Beekeeping apiary built on the Bee Hotel, seasonal calendar events, and more Almanac themes. They are listed in ROADMAP.md as ideas, not promises.

## 13. Unlock order additions

These rows follow GDD 16 (rows 1 to 31). One new thing per session at most in the first week, each with a story quest and one line from Pip. Times are targets for an active player.

| # | Feature | Unlock condition | Target time |
|---|---|---|---|
| 32 | Golden Sprout tiers | with visitors (row 10). The first two are Common, the third is Rare, so the player sees the difference | 5:30 |
| 33 | Floor Improvements | first Replant | about 40 min |
| 34 | Garden Diary | the first return after an hour away | hour 1 to 2 |
| 35 | Fishing, Otis, Shiny Scales, Tackle Boxes | player level 14 | about 2 h |
| 36 | Weekend event tiers | with weekend events (row 22) | day 1 |
| 37 | Season Almanac | player level 16 | day 1 |
| 38 | Digging, Digby, the Museum, Buried Chests | Loomington floor 5 opened | day 1 to 2 |
| 39 | Workbench and Garden Treats | first 50 Trinkets | day 2 |
| 40 | Explorer branch | a second activity unlocked | day 2 |
| 41 | Wardrobe and Style level | first cosmetic (Diary page 3) | day 3 |
| 42 | Baron's Challenges | player level 26 | day 2 to 3 |
| 43 | Heirloom sets Angler's Luck and Treasure Hunter | the first Epic-or-better catch or find | day 2 to 4 |
| 44 | Boutique, County Fair set | first Harvest Festival | day 4 to 5 |
| 45 | Mining, the Gnome Crew, ores, Geodes, Tier Up, Deep Delver set | Mount Mitten floor 3 opened | about day 8 |
| 46 | Skill tiers 4 and 5 | 37 points in one branch | week 2 to 3 |
| 47 | New Generation, Laurels, Laurel Shop, Hall of Fame, Sunstone, Godly tier-ups | Mount Mitten reached and 3 Laurels pending | about day 30 |
| 48 | Eclipse Stone, Ungodly | third New Generation | about day 50 |
| 49 | Cloud Pearl, Holy | fifth New Generation | about day 75 |
| 50 | Outings, Postcards | the Moon update | |
| 51 | Big Bloom, Starseeds, Constellation map, Grailstone, Grailed | Nebula Nursery reached and 1 Starseed pending | about day 90 |
| 52 | Evergreen ranks | level 250 | about month 10 to 12 |

## 14. Words for the new systems

These join the list in GDD 2.3. They apply to names, text and art.

| Do not use | Use |
|---|---|
| moon rocks | moonstones, Moon Quarry, crater ores |
| shatter, crumble, wax, dab, crack (for breaking rocks or for ores) | break, split, pop open, polish |
| stash | pouch, hoard, collection |
| trip (for an Outing) | outing, journey, day out |
| haze, smoke, cloud chasing | mist, morning fog (only as weather) |
| northern lights | aurora |
| dust (for the Moon's sand, or any find) | sand, grit, sparkle |
| vein (for an ore seam) | seam |
| skunk (as a helper or animal) | otter, mole, gnome, hedgehog |
| mushrooms of any kind, as a find, food, plant or prop | (not used) |
| explosives, dynamite, blasting in the mine | picks, hammers, carts |
| catching fish to keep or eat | catch and release, the Fish Log |
| any religious sign or word beyond the tier names | light, gold, pearls, sunbursts and garden motifs |

## 15. For the other threads

### 15.1 Engine (the Phase 1 build thread and the gameplay programmers)

**Build into the slice now, because it is cheap now and costly later:**

1. **Tiers are data.** One table of eleven tiers (id, name, order, colour tokens, emblem, pip count, chime note, sting, reveal timings, `tierPower`). Every card, chest, item and moment refers to a tier by id. No code compares rarity names.
2. **Cards carry `tier` and `nativeTier`.** Tier-ups are `tier - nativeTier`. Max level comes from `nativeTier`.
3. **One reveal player** that takes a tier and a form (full or short) and plays the climb from the tier table, so tiers 6 to 11 work the day their art arrives. A debug "reveal theatre" can play all eleven with placeholder art.
4. **One `moment(tier, place, form)` effect** for every big event (section 4.2).
5. **Chests by tier**, 1 to 11, with fixed extras as data.
6. **Reset layers as a list.** The core should hold N layers (currency, formula, what resets, what is kept), so New Generation and Big Bloom are rows, not new code paths.
7. **Counted taps are a flag on the input source.** Field taps will not count.

**Build later, with Phase 2 (ROADMAP):** Floor Improvements in the floor system, the field framework (charges, spots, tools, helpers, rolls with reach and the Legend Meter, crates, collections) with three games on top, Tier Up, the Workbench, Style layers (overlays on the head anchor, palette sets, tower skins), the Diary and the Almanac on the guarded day counter, and the Challenges.

### 15.2 Balance simulator

In this order, after design 0.4's own list (CHANGES B.6):

1. Floor Improvements: refit `D` and the tickets so the gate table of 0.4 still holds.
2. Golden Sprout tiers: check that the average visitor payout matches 0.4.
3. Fishing and digging: measure cards and Pollen per day with them, and keep total chests per day within about +40% of 0.4.
4. Mining and Tier Up: measure the power curve from day 8 and keep the Festival rhythm near 0.4's (GDD 17.5: one to five days apart up to day 30).
5. New Generation: fit `LAUREL_R0` (first one around day 30) and check the return to the old Ribbon total within 3 days.
6. Big Bloom: fit `STARSEED_L0` (around day 90) once worlds 5 and 6 are in the tables.
7. Report the day of each tier's first item for each play style.

### 15.3 Art Director

Style bible v1.7 already sets the eleven looks and the reveal ladder. New families, in roadmap order:

A thing that tiers up keeps its own art. Its frame, emblem, glow and pips change with the tier, so no new plant, manager or heirloom forms are needed.

1. **Fishing:** the Millpond scene (one diorama, redressed for each later spot), rod sheet (11 tiers), bobber, splash and bite pop, Otis the Otter (idle, fish, cheer), eleven Millpond fish icons, the Tackle Box in eleven tiers.
2. **Digging:** the Old Allotments patch and its tile states, spade sheet, Digby the Mole, eleven find icons, the Buried Chest in eleven tiers.
3. **Mining:** the Mitten Mine rock face, rocks in eleven tiers with three break stages, pickaxe sheet, the Gnome Crew, eleven ore icons, Geodes in eleven tiers.
4. **Chests of tiers 7 to 11:** Prism, Sunburst, Eclipse, Pearl and Grail Chests.
5. **Floor Improvement props:** three per floor, starting with Thymeford's ten floors.
6. **Style:** tower skins, Pip outfits, a hat kit for the shared head anchor, tap trails, chest skins, card backs.
7. **Layers:** the Hall of Fame wall and the portrait kit, rooftop ornaments, the Constellation sky.
8. Achievement badges in eleven tiers, Garden Treat icons, the Diary and Almanac covers.

### 15.4 Writer

Names and lines for: 11 fish per fishing spot, 11 finds per digging spot, the ores, Treats, cosmetics, Improvements (three per floor), the helpers' personalities, the Baron's challenges and excuses, Diary page lines, Almanac seasons, the Hall of Fame records, and Pip's line for every unlock in section 13.

### 15.5 Audio

Eleven climbing chime notes and eleven closing stings (section 4.1), the cast, bite, reel and splash, the dig thunk and a find's chime, the rock strike, the split and the Geode pop, the helpers' little sounds, and one sting each for New Generation and Big Bloom.

## Appendix B. New constants (first pass)

| Constant | Value | Section |
|---|---|---|
| `TIER_COUNT` | 11 | 2.1 |
| `TIER_STEP` | 1.5 | 2.2 |
| `RARITY_FACTOR` | 1, 1.5, 2.2, 3.2, 5, 7.5, 11, 16, 24, 36, 54 | 2.2 |
| `TIERUP_STEP` | 1.5 | 2.2 |
| `TIERUP_PERK_STEP` | 0.25 | 2.2 |
| `TIERUP_ABILITY_STEP` | 0.2 | 2.2 |
| `TIERUP_MIN_LEVEL` | 2 | 3.1 |
| `TIERUP_POLLEN` (reaching tiers 2 to 11) | 50, 150, 400, 1,000, 2,500, 6,000, 15,000, 35,000, 80,000, 200,000 | 3.2 |
| `TIERUP_ORE` (reaching tiers 2 to 11) | 10, 10, 10, 10, 8, 8, 6, 6, 5, 5 | 3.2 |
| `BLOOM_HOURS` (reaching tiers 2 to 11) | 0.25, 0.5, 1, 2, 6, 12, 24, 36, 48, 72 | 3.2 |
| `VISITOR_TIER_WEIGHTS` | 60, 22, 10, 5, 2.2, 0.6, 0.2 | 4.4 |
| `WINDFALL_BASE` (replaces `WINDFALL_SECONDS = 60` once tiers ship) | 40 s, times `tierPower` | 4.4 |
| `SUNBEAM_BASE`, `TAP_STORM_BASE` | 25 s, 13 s, times `1 + 0.25 x (t - 1)` | 4.4 |
| `DEWDROP_GEMS` | 1, 2, 3, 5, 8, 12, 20, 30, 50, 80, 120 | 4.4 |
| `VISITOR_RAISE_CAP` | 2 tiers, and never above Exotic when rolled | 4.4 |
| `EVENT_TIER_WEIGHTS` | 35, 25, 17, 11, 7, 3.5, 1.5 | 4.5 |
| `EVENT_PITY_EPIC`, `EVENT_PITY_LEGENDARY` | 4 and 10 weekends | 4.5 |
| `EVENT_BONUS_STEP` | 0.15 | 4.5 |
| `IMPROVE_LEVELS` | 25, 100, 300 | 5 |
| `IMPROVE_PRICE` | 10, 20, 40 | 5 |
| `IMPROVE_MULT` | 2 | 5 |
| `CHARGE_STORE` | 20 | 6.1 |
| `CHARGE_MINUTES` | 6 | 6.1 |
| `GEAR_LUCK_STEP` | 0.10 | 6.1 |
| `HELPER_LUCK_STEP` | 0.05 | 6.1 |
| `CATCH_WEIGHTS` | 50, 25, 13, 7, 3.2, 1.2, 0.4, 0.13, 0.05, 0.015, 0.005 | 6.1 |
| `LEGEND_METER` | 60 actions | 6.1 |
| `TOKENS` (per result, by tier) | 1, 2, 3, 5, 8, 12, 18, 27, 40, 60, 90 | 6.1 |
| `BITE_WINDOW` | 0.8 s | 6.3 |
| `PERFECT_WINDOW` | 0.25 s | 6.3 |
| `REEL_BASE`, `REEL_STEP` | 0.4 s, 0.25 s per tier above Common | 6.3 |
| `TACKLE_BOX_CHANCE` | 0.25 for an Epic fish, 1 from Legendary up | 6.3 |
| `TACKLE_BOX_OFFSET` | 3 tiers below the fish | 6.3 |
| `GEAR_TOKENS` (reaching tiers 2 to 11) | 50, 150, 400, 1,000, 2,500, 6,000, 15,000, 35,000, 80,000, 200,000 | 6.3 |
| `GEAR_ORE` (reaching tiers 6 to 11) | 6, 6, 5, 5, 4, 4 | 6.3 |
| `DIG_PATCH` | 24 tiles | 6.4 |
| `DIG_TAPS` | 3, 4, 5, 7, 9, 12, 15, 19, 24, 30, 38 | 6.4 |
| `BURIED_CHEST_CHANCE` | 0.04 | 6.4 |
| `LOST_HEIRLOOM_CHANCE` | 0.10 of Epic-or-better tiles | 6.4 |
| `BURIED_CHEST_OFFSET` | 2 tiers below the tile | 6.4 |
| `SPADE_TAP_STEP` | 0.08 fewer taps per spade tier | 6.4 |
| `ROCK_FACE` | 6 rocks | 6.5 |
| `ROCK_HP` | 5, 8, 12, 18, 27, 40, 60, 90, 135, 200, 300 | 6.5 |
| `PICK_POWER_STEP` | 1.25 | 6.5 |
| `STRIKE_BUMPER_CHANCE`, `STRIKE_BUMPER_MULT` | 0.05, 5 | 6.5 |
| `ORE_YIELD` | 3 (tiers 1 to 5), 2 (6 to 8), 1 (9 to 11) | 6.5 |
| `GEODE_CHANCE` | 0.05 | 6.5 |
| `PICK_ORE` | 15 | 6.5 |
| `FIRST_GEN_MIN` | 3 | 7.1 |
| `LAUREL_EXP` | 0.5 | 7.1 |
| `LAUREL_R0` | fitted by the simulator | 7.1 |
| `LAUREL_PCT` | 0.5 | 7.1 |
| `LAUREL_RIBBON_PCT` | 0.1 | 7.1 |
| `STARSEED_EXP` | 0.5 | 7.2 |
| `STARSEED_L0` | fitted by the simulator | 7.2 |
| `STARSEED_PCT` | 1.0 | 7.2 |
| `STARSEED_LAUREL_PCT` | 0.2 | 7.2 |
| `LEVEL_CAP` | 250 (was 112) | 8.2 |
| `EVERGREEN_XP` | 60,000 | 8.2 |
| `HEIRLOOM_SLOTS` (most) | 8 (was 6) | 9.1 |
| `STYLE_POINTS` | 1, 2, 4, 7, 12, 20, 35, 60, 100, 170, 300 | 10.2 |
| `STYLE_LEVEL_STEP` | 25 | 10.2 |
| `STYLE_PCT` | 0.01 | 10.2 |
| `DIARY_PAGES` | 28 | 11.1 |
| `ALMANAC_PAGES`, `SEASON_DAYS` | 40, 28 | 11.2 |
| `CHALLENGES_PER_DAY` | 3, plus one weekly Grudge Match | 11.3 |
| `ACH_GEMS` (tiers 1 to 11) | 5, 10, 15, 25, 50, 75, 100, 150, 200, 300, 500 | 12.1 |
| `XP_ACHIEVEMENT` (tiers 6 to 11 added) | 2,500, 4,000, 6,000, 9,000, 13,000, 20,000 | 12.1 |
