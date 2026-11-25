# Sprout Tower design: what changed in version 0.2

For the Economy and Balance thread, the Engine thread and anyone who read version 0.1. Version 0.2 answers the independent design audit of PR #3 (review of commit `9954bf0`). Each item names the audit finding it answers (M1, S1 to S9, or N for a nice-to-have). Rules are in [GDD.md](GDD.md) and rows are in [CONTENT.md](CONTENT.md).

## 1. Rules that changed

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

## 2. Constants

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

## 3. Content rows

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

## 4. What the simulator should measure first

1. **Boost uptime.** The average Boost on the tower and on taps, for each profile, by day. The design's own arithmetic (GDD 6.7, `boost_avg.py`) says about ×1.3 with no upgrades, ×2.4 at day 30 and ×3 for a finished account. If it runs high, trim ability strengths in CONTENT 2.2 before touching `BOOST_CAP`.
2. **Both tap rates.** Hold to tap is 6 a second and the limit is 12. With every tap stat at its cap that is about 55 and 120 times idle income before boosts.
3. **The six world rows** in GDD 14.2, as before. They were not changed.
4. **Mastery levels and event steps.** Both are first-pass values from rough scripts.
5. **The offline build.** How soon each profile reaches 100% efficiency, now that it takes cards or heirlooms.
6. **XP.** Replant XP is smaller than before in week 1 (about 60,000 against roughly 110,000). The level targets in GDD 9.1 are still unchecked.

## 5. Rough scripts

In the project's shared files, under `design/pacing-check/`:

| Script | What it shows |
|---|---|
| `run4.py` (with `sim3.py`) | The pacing table in GDD 17.6, run again with the new offline start and the first Replant held to 60. The biggest move is 1.2 days (World 6, mixed profile) |
| `mastery_track.py` | When the lowest floor in each world first passes each level. Source of the new Mastery levels |
| `stall.py`, `stall2.py` | The fair stall for several kinds of player. Source of the new event steps |
| `boost_avg.py` | Average Boost under the adding rule, and the active ceiling |

They are sanity checks by the designer, not the balance simulator.

## 6. Audit suggestions not taken, and why

| Suggestion | Why not now |
|---|---|
| A late skill that raises the hold rate to the tap limit | The tree is exactly 111 points for 112 levels. The simulator is asked to run both rates first. If 12 a second proves too strong, lowering `TAP_RATE_CAP` is the simpler fix |
| Cosmetic tower decorations as a Ribbon sink | They need new art. Noted in GDD 18 as the first sink to add after launch. Blue Ribbon Polish stays the endless sink |
| A longer first night by a bigger starting cap alone | Done a different way: the cap starts at 4 hours and the first research project (50 Insight, 5 minutes) makes it 8 |
