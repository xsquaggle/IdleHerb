# Sprout Tower design: what changed, version by version

For the Economy and Balance thread, the Engine thread, the Art Director and anyone who read an earlier version. The newest version is first. Rules are in [GDD.md](GDD.md) and rows are in [CONTENT.md](CONTENT.md).

## Version 0.3: one fixed manager per floor

Lawson decided on 2026-11-25: "One manager per Floor." Version 0.3 makes that change. It also writes in three rulings from the audit's re-check of version 0.2 (A.5). Nothing else in the design changed: every floor row, every world row in GDD 14.2, every plant, heirloom, research, shop and quest row is as it was, except where listed here.

### A.1 Rules that changed

| # | Rule in 0.2 | Rule in 0.3 | Where |
|---|---|---|---|
| 1 | Managers were cards the player seated on any floor. One desk per floor, the same manager could work in every world, swaps were free | Every floor has its own manager, who never moves. 50 managers, 34 at launch. No desks, seating or swapping | GDD 7.1 |
| 2 | Rarity belonged to the card (30 cards) | Rarity follows the floor. World 1: floors 1 to 3 Common, 4 to 6 Uncommon, 7 Rare, 8 Epic, 9 Legendary, 10 Exotic. Worlds 2 to 6: floors 1 and 2 Common, 3 and 4 Uncommon, 5 Rare, 6 Epic, 7 Legendary, 8 Exotic. Totals: 13, 13, 6, 6, 6, 6. At launch: 9, 9, 4, 4, 4, 4 | GDD 7.1 rule 6 |
| 3 | A manager card was owned from its first copy | A manager's card is owned at level 1 from the first time its floor is opened, in any run. The manager is then **met**, for good. Every copy counts toward the next level | GDD 7.1 rule 5, 8.2 |
| 4 | Hiring: pay the floor's fee, then pick a manager | Hiring: pay the floor's fee. `hireFee`, `HIRE_RATIO` and the `hire.fee` stat are unchanged. Perks and abilities work only while the manager is hired. Hire buttons appear once the Welcome Chest has been opened | GDD 7.1, 16 |
| 5 | A chest's manager slot picked among managers of the rolled rarity whose `poolWorld` was unlocked | It picks evenly among **met** managers of the rolled rarity. Managers have no `poolWorld` any more. Plants keep theirs. If neither type has a card of that rarity, the slot drops one rarity at a time. `CHEST_MANAGER_SHARE` and the pity counters are unchanged | GDD 8.3 rule 3 |
| 6 | New-card help applied to managers and plants | Plants only. A met manager is already owned | GDD 8.3 rule 4 |
| 7 | An Exotic manager was first owned at Mastery star 5. Stars 7, 9 and 10 gave one more copy each | The Exotic manager of a world is its **Head**, the manager of its top floor, hired like anyone from level 1. Stars 5, 7, 9 and 10 give one copy each. Four copies reach level 3 | GDD 7.1 rule 8, 14.5 |
| 8 | Starlight Chest: one copy of a random Exotic manager already earned | One copy of a random Head whose world has at least 5 Mastery stars. If there is none, a third Legendary | GDD 8.3 rule 9 |
| 9 | Welcome Chest: managers Nana Sprig, Basil Brumble and Olive Ledger | 2 copies each of the managers of world 1 floors 1 to 3 (Nana Sprig, Basil Brumble, Rowan Rake). Same trigger | GDD 8.3 |
| 10 | Hiring Crate, world 1 floors 4 to 10: 1 new manager and 2 Wooden Crate slots | World 1 floors 4 to 9: 2 copies of that floor's manager and 2 Wooden Crate slots. Floor 10 has no crate, because its manager is a Head | GDD 8.3 |
| 11 | `managerProfit = MGR_BASE[rarity] x MGR_LEVEL_MULT ^ (level - 1) x managerPowerMult` | `managerProfit = MGR_BASE[rarity] x MGR_STEP[rarity] ^ (level - 1) x managerPowerMult`. It is 1 while the manager is not hired | GDD 7.2 |
| 12 | A Rare or better manager's ability worked in any world where the card was seated, so one world could use every ability in the game | Every world has four abilities, from the managers of its four highest floors. An ability works only in its manager's own world. The number keys 1 to 4 press the four abilities of the world on screen | GDD 7.1 rule 7, 7.2, 13.5 rule 10 |
| 13 | Scopes: "the floor the card sits on", "the world where the card is placed" | For a manager: `floor` is its own floor, `adjacent` is the floors directly above and below its own floor, `world` is its own world, `global` is everything. All count only while it is hired. Plants are unchanged | GDD 13.4, CONTENT 0.1 |
| 14 | Mayor Thyme was the Exotic manager of world 1 | Mayor Thyme hosts the Harvest Festival. `card.manager.mayor_thyme` is removed. His perk (`tower.milestoneMult` +0.1) and his place as the Exotic of Thymeford go to Granny Evergreen | GDD 12.2, CONTENT 2 |
| 15 | The unlock table had no row for abilities | New row 11, Manager abilities: the manager of world 1 floor 7 is hired. Every later row moves down by one, so the table has 31 rows | GDD 16 |
| 16 | Star Pupil: the highest-level hired manager in each world counts as 2 levels higher | Each world's Head counts as 1 level higher while hired. That is ×1.43 on the top floor, where it was ×1.44 on a floor of the player's choice | CONTENT 5.2 |

### A.2 Constants

| Constant | 0.2 | 0.3 |
|---|---|---|
| `MGR_BASE` (Common to Exotic) | 2, 2.5, 3, 4, 6, 10 | 2, 2.5, 3, 3.5, 4, 5 |
| `MGR_LEVEL_MULT` | 1.2 | removed |
| `MGR_STEP` (Common to Exotic) | did not exist | 1.2, 1.2, 1.2, 1.22, 1.28, 1.43 |

Profit at max level is now ×25.7, ×22.3, ×18.6, ×17.2, ×17.6 and ×20.9. Only the last two moved (from ×17.9 and ×20.7). Max levels (15, 13, 11, 9, 7, 5) and the copy curves in GDD 8.2 are unchanged.

**Why the level 1 values are lower.** Rare managers now sit on the floors that earn the most. With the old values a new player would have had ×4, ×6 and ×10 on the top three floors of Thymeford in the first half hour.

### A.3 Manager rows

All of CONTENT section 2 is new. **M numbers now follow floor order** (M01 to M10 are Thymeford's floors 1 to 10, then eight for each later world). **Ids did not change** for any character that was kept, so match on `id`, never on the M number. Every perk was set again for the manager's floor and rarity, so read CONTENT 2.1 as a new table and do not diff it.

| Manager (`card.manager.*`) | 0.2 | 0.3 | Floor in 0.3 |
|---|---|---|---|
| `nana_sprig` | M01 Common | M01 Common | World 1, floor 1 |
| `basil_brumble` | M02 Common | M02 Common | World 1, floor 2 |
| `rowan_rake` | M11 Uncommon | M03 Common | World 1, floor 3 |
| `posy_seedwell` | M12 Uncommon | M04 Uncommon | World 1, floor 4 |
| `fern_petrie` | M05 Common | M05 Uncommon | World 1, floor 5 |
| `juniper_jones` | M07 Uncommon | M06 Uncommon | World 1, floor 6 |
| `old_moss` | M08 Uncommon | M07 Rare | World 1, floor 7 |
| `captain_kelp` | M16 Rare | M08 Epic | World 1, floor 8 |
| `clementine_zest` | M09 Uncommon | M09 Legendary | World 1, floor 9 |
| `granny_evergreen` | M22 Legendary | M10 Exotic, Head | World 1, floor 10 |
| `bram_applewhite` | M04 Common | M11 Common | World 2, floor 1 |
| `olive_ledger` | M03 Common | M12 Common | World 2, floor 2 |
| `barley_biggs` | M10 Uncommon | M15 Rare | World 2, floor 5 |
| `hazel_thimble` | M15 Rare | M16 Epic | World 2, floor 6 |
| `bjorn_barrow` | M20 Epic | M17 Legendary | World 2, floor 7 |
| `madame_loom` | M26 Exotic | M18 Exotic, Head | World 2, floor 8 |
| `sandy_tidewell` | M06 Common | M19 Common | World 3, floor 1 |
| `marigold_mayhew` | M13 Rare | M20 Common | World 3, floor 2 |
| `professor_thistlewick` | M18 Epic | M23 Rare | World 3, floor 5 |
| `amazing_marrow` | M24 Legendary | M24 Epic | World 3, floor 6 |
| `pepper_finch` | M17 Rare | M25 Legendary | World 3, floor 7 |
| `skipper_papaya` | M27 Exotic | M26 Exotic, Head | World 3, floor 8 |
| `dame_dahlia` | M19 Epic | M29 Uncommon | World 4, floor 3 |
| `maestro_fennel` | M23 Legendary | M31 Rare | World 4, floor 5 |
| `chip` | M14 Rare | M32 Epic | World 4, floor 6 |
| `barnaby_moonwort` | M21 Epic | M33 Legendary | World 4, floor 7 |
| `grandpa_mitten` | M28 Exotic | M34 Exotic, Head | World 4, floor 8 |
| `commander_comet` | M29 Exotic | M42 Exotic, Head | World 5, floor 8 |
| `stargardener` | M30 Exotic | M50 Exotic, Head | World 6, floor 8 |
| `mayor_thyme` | M25 Exotic | removed | none. He hosts the Harvest Festival |

**New managers (21).** Seven at launch, all Common or Uncommon with no ability: Tansy Treadle (M13), Kit Foldaway (M14), Marina Bolt (M21), Ned Knotwell (M22), Wren Woolsey (M27), Bertie Bundle (M28), Purl Garter (M30). Fourteen for worlds 5 and 6: M35 to M41 and M43 to M49.

**Abilities.** The sixteen launch abilities are the same sixteen effects with the same sizes and cooldowns. What moved:

| Effect | 0.2 name and owner | 0.3 name and owner | Works in |
|---|---|---|---|
| Combo jumps to full and cannot fall for 60 s | Keep the Beat, Marigold Mayhew | Tea Break, Old Moss | World 1 |
| The next 20 taps are Bumpers | Best in Show, Dame Dahlia Fairweather | Showstopper, Clementine Zest | World 1 |
| Fills the Growth Spurt meter | Crescendo, Maestro Fennel | Lunch Rush, Barley Biggs | World 2 |
| A Growth Spurt starts now | Town Fair, Mayor Thyme | Strike Up the Band, Maestro Fennel | World 4 |
| Heat jumps to 100 | Fireside Story, Grandpa Mitten. Outside Mount Mitten it was a ×3 boost for 30 s | Fireside Story, Grandpa Mitten. The second half is removed | World 4 |
| The other eleven | same name, same owner | same name, same owner | the owner's world (CONTENT 2.2) |

Six abilities are new and first-pass, all for worlds 5 and 6: Tea Party, Lather Up (×3 boost, 30 s), Moonrise (×5 boost, 30 s), Meteor Shower, Wake-Up Call and Express Delivery. Liftoff and Supernova are unchanged.

### A.4 Other rows

| Row | 0.2 | 0.3 |
|---|---|---|
| Achievements, `managers` | Managers owned: 5, 10, 15, 20, 28 | Different managers hired: 5, 10, 18, 26, 34 |
| Codex entries | 148 in total, 126 at launch. Full codex +37% | 168 in total, 132 at launch. Full codex +42%, and +33% at launch |
| Story 42, reward text | The star gives the Exotic manager | The star gives a copy of that world's Head |
| Skill `skill.ty.autopilot` | No Combo, Bumpers, Boost or Spurt | The same, and its taps are not counted taps (A.5) |
| Research `research.tools.auto_hire`, wording | Each remembered manager is hired when its fee can be paid | Each floor's manager is hired again when its fee can be paid. Same effect |
| Launch counts, managers | 30 designed, 28 at launch, 16 new sprites | 50 designed, 34 at launch, 22 new sprites |
| Launch counts, story characters | 2 (Pip, Baron Fauxliage) | 3 (and Mayor Thyme, the Festival host) |

### A.5 Three rulings from the audit's re-check of 0.2

The re-check passed version 0.2 with five notes that did not block it. Three were design questions. They are in the documents now.

1. **Ceilings (GDD 6.7).** The ceiling sentence now gives both tap rates: holding at 6 a second, and the limit of 12 a second. It also says that guaranteed Bumpers (Showstopper, Sharp Season) sit outside the Boost: fifty of them inside a capped Boost and a Growth Spurt are worth about 15 hours of steady income. If the top is too high, lower `TAP_RATE_CAP` first, then `CRIT_MULT_CAP`.
2. **What a counted tap is (GDD 6.1, 6.3).** A counted tap is a left click on the tower, or Space. A click on a button or a panel is not a counted tap: it pays nothing and adds nothing to Combo or the Spurt meter. It does restart the Combo grace timer. The timer is paused while a full-screen panel is open, as it already was during reveals. `COMBO_GRACE` and `COMBO_DECAY` are for a playtest.
3. **Autopilot (GDD 6.1, CONTENT 5.3).** Autopilot taps are not counted taps. They add no Hearth Heat and do not count for tap quests, the `taps` achievement, the Spurt meter or Combo.

The other two notes are the simulator's: the event track can now be finished every weekend (about one Golden and one Crystal Chest a week into the card and heirloom rates), and the ten Mastery levels should be set from cost.

### A.6 Numbers that moved, and what was not run again

Designer's arithmetic (`boost_avg03.py` in the shared files, under `design/pacing-check/`). None of it is a simulation.

| Number | 0.2 | 0.3 | Where |
|---|---|---|---|
| Average Boost on the tower, finished account | about ×2.9 (every ability in one world) | ×1.5 (Mount Mitten) to ×2.0 (Papaya Cay) | GDD 6.7 |
| Average Boost on taps, finished account | about ×3.4 | ×1.7 to ×2.4 | GDD 6.7 |
| The same with a Golden Sprout build | ×3.6 and ×4.6 | ×2.2 to ×2.7 and ×2.9 to ×3.7 | GDD 6.7 |
| Active income ceiling, holding to tap | about 180 times idle, 250 with a Golden Sprout build | about 130 and 200, in the best world | GDD 6.7 |
| The same at 12 taps a second | about 410 and 560 (not in the 0.2 text) | about 290 and 440 | GDD 6.7 |
| Budget row, timed boosts (day 7, day 30) | ×1.4, ×1.9 | ×1.3, ×1.5 | GDD 17.6 |
| Budget product (day 7, day 30) | about ×160, ×15,000 | about ×150, ×11,500 | GDD 17.6 |
| Card levels in week 1 and month 1 | one table for all managers | Thymeford's managers: Common 5 and 7 to 8, Uncommon 4 and 6, Rare 4 and 5 to 6, Epic 3 and 4, Legendary 2 and 3, the Head 1 and 2 | GDD 17.5 |

**Not run again:** the rough pacing script behind the dates in GDD 17.6. Its manager column was set for managers a player could seat anywhere. With fixed managers the top floors start higher (×3 to ×5 on day 0, where the column says ×2), agree by day 7, and are a little lower at day 30 (×6 to ×7.5 against ×9). The budget row for plants and manager perks was not estimated again either.

### A.7 What each thread should do

**Balance simulator.**
1. Model managers per floor: read `floor`, `rarity` and the perk from CONTENT 2.1, and the formula and constants from GDD 7.2. Drop any seating logic.
2. Measure the manager column of the budget in GDD 17.6 first, above all days 0 to 2. The knobs are `MGR_BASE` and `MGR_STEP`.
3. Chest pool: manager slots draw among met managers. Early copies pile onto Thymeford's managers, and later worlds trail (GDD 17.5).
4. Abilities per world: measure the Boost in each world, not one number for the account.
5. The two notes left from the re-check (A.5).

**Engine.**
1. A manager record is `id`, `floor`, `rarity`, perk, optional ability. It has no `poolWorld`. Player state per manager: met, copies, level. Per run: hired.
2. Chest rule 3, rule 4 and rule 9 in GDD 8.3 changed. The Welcome Chest and Hiring Crate contents changed.
3. `MGR_LEVEL_MULT` is gone and `MGR_STEP` is new (Appendix A).
4. Ability buttons belong to the world on screen, keys 1 to 4.
5. Counted taps, the Combo timer and Autopilot as in A.5.

**Art.**
1. 34 manager sprites at launch, 12 pictured and 22 new (it was 16 new). Thymeford needs four first: Rowan Rake, Posy Seedwell, Captain Kelp and Granny Evergreen.
2. Seven new characters at launch (A.3). Worlds 5 and 6 need 16 sprites later.
3. A manager belongs to one room, so a sprite no longer needs a pose that fits every floor.
4. Mayor Thyme is now the Festival host and needs a story-character sprite, not a manager card.
5. Hemp-floor casting is in CONTENT 2.4.

## Version 0.2: after the independent audit

Manager numbers in this part (M01 to M30) are the 0.2 numbers. The table in A.3 maps them to 0.3.

For the Economy and Balance thread, the Engine thread and anyone who read version 0.1. Version 0.2 answers the independent design audit of PR #3 (review of commit `9954bf0`). Each item names the audit finding it answers (M1, S1 to S9, or N for a nice-to-have). Rules are in [GDD.md](GDD.md) and rows are in [CONTENT.md](CONTENT.md).

### 1. Rules that changed

| # | Finding | Rule in 0.1 | Rule in 0.2 | Where |
|---|---|---|---|---|
| 1 | M1 | Every timed buff was its own multiplier | Every timed boost in a world adds into one **Boost**, capped at `BOOST_CAP = 15`. A boost written ×N has bonus N − 1. A boost does not stack with itself | GDD 13.5 |
| 2 | M1 | A Growth Spurt was one more multiplying buff | A Growth Spurt is the only timed effect that multiplies the Boost. Most a burst can reach: 15 × 4 = 60 times income | GDD 13.5, 6.5 |
| 3 | M1 | `worldIPS` was the rate right now with every buff in it. Taps and lump sums read it | `steadyIPS` has no Boost and no Spurt in it. World twists stay in it at their current value (13.5 rule 9). `tapValue = TAP_SECONDS x tapPowerMult x steadyIPS x comboMult x crit x spurt x tapBoost`. Tap-only boosts add into the same capped sum | GDD 6.2, 13.5 |
| 4 | M1 | Lump sums paid at the buffed rate | Windfall, Jackpot, customer tips, Stitch in Time, Heave-Ho, Supernova, Time Skip and Time Warp pay from `steadyIPS` | GDD 13.5 rule 4 |
| 5 | S1 | Offline efficiency 50 points to start, cap reached by two cheap sources | 40 points to start. Night Owl and Overnight Growth give 3 a step, so the cheap sources stop at 73. The Night Market multiplies after the cap | GDD 13.4, 15.1 |
| 6 | S1 | Stored hours: 2 to start, 24 cap, research alone reached it | 4 to start, +20 from research, +5 Deep Pantry, +4 Moonstone Birdbath, guard cap 36 | GDD 13.4, 15.1 |
| 7 | S2 | Heirloom pieces rolled at random with no protection | No repeats until a rarity is complete. `PITY_HEIRLOOM = 10`. The first Festival gives the Heirloom Pick (one Legendary of choice). Pollen buys copies of owned heirlooms (100, 400, 2,000) | GDD 8.3, 8.6, 8.7 |
| 8 | S3 | Event track to 1e15 Fair Tickets, normal offline rules | Track to 1e12. The stall has its own offline rule (50%, 12 h), helpers at ×1, no visitors, abilities or boosts | GDD 15.3 |
| 9 | S4 | Mastery at levels 25 to 1,000 | Levels 25, 50, 100, 250, 350, 400, 450, 500, 550, 600 | GDD 14.5 |
| 10 | S5 | One Combo stack per tap | One stack per `COMBO_TAPS_PER_STACK = 5` taps. Reveals pause the Combo timer. Keep the Beat also fills the meter | GDD 6.3 |
| 11 | S6 | Skill tree at level 3, achievements and Codex at floor 7 | Skill tree at level 6, achievements and Codex at floor 9 | GDD 16, 9.2 |
| 12 | S7 | Three worlds at launch | Four worlds at launch. A four-world build shows "Coming soon" on Mount Mitten's ticket plate and the two later deeds | GDD 14.1 |
| 13 | S8 | Replant XP `100 x floor(log2(1 + gained))`, up to 2,000 a Replant | `150 x n` XP the first time all-time Compost passes `2^n` | GDD 9.1 |
| 14 | S9 | Chest luck shrank only the Common weight | Multiply the Rare, Epic and Legendary weights, then rescale all five to 100% | GDD 8.3 rule 6 |
| 15 | S9 | Not said | A tap on a floor harvests it. Any other tap or Space harvests the unmanaged floor that has been ready longest, one per tap | GDD 6.1 |
| 16 | S9 | Button at 25 Compost, story asked for 60 | One number: `FIRST_REPLANT_MIN = 60`. The Compost Shop and Research unlock at the first Replant | GDD 12.1, 16 |
| 17 | S9 | Not said | A Starlight Chest with no Exotic manager earned gives a third Legendary | GDD 8.3 rule 9 |
| 18 | S9 | Companion Planting needed a floor above and below | Every neighbour a floor has. Edge floors have one | CONTENT 5.2 |
| 19 | S9 | `pending` could go negative, and Compost gain and chest luck could be swapped in for one click | `pending = max(0, ...)`. Compost gain and chest luck come only from skills, research and shops. Cooldown reduction ticks, it is not read at the press | GDD 12.1, 13.4 |
| 20 | S9 | Timers waited for `highestTimeSeen` | Five behaviour rules that match `docs/tech/07-offline-and-time.md`. A clock that was once ahead cannot strand the player | GDD 15.2 |
| 21 | S9 | Not said | Autopilot taps in every unlocked world, from that world's `steadyIPS`, with no Combo, Bumpers, Boost or Spurt | CONTENT 5.3 |
| 22 | N | Sunrise streak reset on a miss | It steps down by one, and is kept while away | GDD 14.4 |
| 23 | N | No Festival hint | The Festival button glows once pending Ribbons are at least equal to claimed Ribbons | GDD 12.2 |
| 24 | N | No goal between a world's top floor and its ticket | Three waypoint marks on the ticket plate, 5 Gems each the first time | GDD 14.3 |
| 25 | N | Not there | Compost Shop Buy All after the first Festival | GDD 12.1 |
| 26 | N | Welcome Chest at 1,000 lifetime Coins | At the first moment the player holds 1,000 Coins with floor 3 open | GDD 16, CONTENT 2.3 |

### 2. Constants

| Constant | 0.1 | 0.2 |
|---|---|---|
| `BOOST_CAP` | none | 15 |
| `COMBO_TAPS_PER_STACK` | 1 (implied) | 5 |
| `PITY_HEIRLOOM` | none | 10 |
| `REPLANT_XP_STEP` | none | 150 |
| `FIRST_REPLANT_MIN` | 25 | 60 |
| `OFFLINE_EFF_BASE` | 0.5 | 0.4 |
| `OFFLINE_CAP_BASE` | 2 h | 4 h |
| `OFFLINE_CAP_MAX` | 24 h (28 h with one heirloom) | 36 h (content adds up to 33 h) |
| `FAIR_OFFLINE_EFF`, `FAIR_OFFLINE_CAP` | none | 0.5, 12 h |
| `MASTERY_LEVELS` | 25, 50, 100, 200, 300, 400, 500, 600, 800, 1,000 | 25, 50, 100, 250, 350, 400, 450, 500, 550, 600 |
| Floor 2 `levelBaseCost` | `1.15 x openCost` (69 in world 1) | `70 x D` |
| Event track steps | 1e3, 1e5, 1e7, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15 | 1e3, 1e5, 1e7, 1e9, 1e10, 3e10, 1e11, 3e11, 6e11, 1e12 |

Removed: `worldIPS` (now `steadyIPS`), `tapBuffs` (now `tapBoost`), `highestTimeSeen`.

### 3. Content rows

| Row | 0.1 | 0.2 |
|---|---|---|
| M13 Keep the Beat | Combo cannot fall for 60 s | Combo jumps to full and cannot fall for 60 s |
| M24 The Amazing Marrow, perk | `chest.luck` +10% (global) | `floor.doubleChance` +10% (world) |
| M16, M18, M21, M22, M26, M28, M29 abilities | "×N profit" or "×N speed" | The same sizes, written as boosts. They add |
| M15, M20, M30 and H09 abilities | Pay income at the current rate | Pay from the steady rate |
| M28 Grandpa Mitten | later | launch |
| H06 Clover Locket, passive | `chest.luck` +20% | `floor.doubleChance` +8% (global) |
| H08 | Moonstone Mortar, `artifact.moonstone_mortar` | Moonstone Birdbath, `artifact.moonstone_birdbath`. Same effect. The B11 icon is redrawn |
| H17 Canvas Guild Banner, passive | `compost.gain` +10% | `manager.cooldown` -10% |
| Night Garden, three pieces | `offline.efficiency` +25 points | +15 points |
| Night Owl (skill) | +5 points a rank | +3 points a rank |
| Overnight Growth (Compost Shop) | +5 points a level | +3 points a level |
| Sturdy Baskets, Cold Store (research) | `offline.cap` +2 h, +12 h | +4 h, +8 h |
| Night Market (event) | Offline efficiency +25 points | Offline earnings ×1.5 after the cap |
| Story 6 | 1,000 lifetime Coins | Hold 1,000 Coins at once |
| Story 15 and 19 | Achievements and Codex at floor 7 | At floor 9. Step 15 gives 10 Gems |
| Story 20 and 22 | 25 pending, then "Replant with 60" | One number, 60 |
| Story 39 | 50 Gems | 50 Gems, and the Festival gives the Heirloom Pick |
| Story 40 to 42 | Exotic plant, 5 stars, Mount Mitten | Mount Mitten, Exotic plant, 5 stars. Step 42 is the last at launch |
| Achievements `managers`, `plants`, tier 5 | 27, 34 | 28, 36 |
| Frosted Mint, Crystal Sage | later | launch |
| Paper Workshop product | notebooks, wrapping paper, kites | notebooks, gift paper and kites |
| Launch counts | 26 floors, 27 managers, 34 plants, 114 codex entries, 41 story steps | 34 floors, 28 managers, 36 plants, 126 codex entries, 42 story steps |

Chest luck now tops out at +40% (skills and research). Compost gain tops out at ×2.2 (Compost Connoisseur and Compost Tea).

### 4. What the simulator should measure first

1. **Boost uptime.** The average Boost on the tower and on taps, for each profile, by day. The design's own arithmetic (GDD 6.7, `boost_avg.py`) says about ×1.3 with no upgrades, ×2.4 at day 30 and ×3 for a finished account. If it runs high, trim ability strengths in CONTENT 2.2 before touching `BOOST_CAP`.
2. **Both tap rates.** Hold to tap is 6 a second and the limit is 12. With every tap stat at its cap that is about 55 and 120 times idle income before boosts.
3. **The six world rows** in GDD 14.2, as before. They were not changed.
4. **Mastery levels and event steps.** Both are first-pass values from rough scripts.
5. **The offline build.** How soon each profile reaches 100% efficiency, now that it takes cards or heirlooms.
6. **XP.** Replant XP is smaller than before in week 1 (about 60,000 against roughly 110,000). The level targets in GDD 9.1 are still unchecked.

### 5. Rough scripts

In the project's shared files, under `design/pacing-check/`:

| Script | What it shows |
|---|---|
| `run4.py` (with `sim3.py`) | The pacing table in GDD 17.6, run again with the new offline start and the first Replant held to 60. The biggest move is 1.2 days (World 6, mixed profile) |
| `mastery_track.py` | When the lowest floor in each world first passes each level. Source of the new Mastery levels |
| `stall.py`, `stall2.py` | The fair stall for several kinds of player. Source of the new event steps |
| `boost_avg.py` | Average Boost under the adding rule, and the active ceiling |

They are sanity checks by the designer, not the balance simulator.

### 6. Audit suggestions not taken, and why

| Suggestion | Why not now |
|---|---|
| A late skill that raises the hold rate to the tap limit | The tree is exactly 111 points for 112 levels. The simulator is asked to run both rates first. If 12 a second proves too strong, lowering `TAP_RATE_CAP` is the simpler fix |
| Cosmetic tower decorations as a Ribbon sink | They need new art. Noted in GDD 18 as the first sink to add after launch. Blue Ribbon Polish stays the endless sink |
| A longer first night by a bigger starting cap alone | Done a different way: the cap starts at 4 hours and the first research project (50 Insight, 5 minutes) makes it 8 |
