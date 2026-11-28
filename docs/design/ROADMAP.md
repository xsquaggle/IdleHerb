# Sprout Tower: Roadmap

Design version 0.5, draft, 2026-11-28. Owner: Game Designer. This file says which release carries each system and what each phase delivers. The systems themselves are designed in [GDD.md](GDD.md) (version 0.4, the launch game) and [EXPANSION.md](EXPANSION.md) (the long game Lawson asked for on 2026-11-28). Phases follow Lawson's brief of 2026-11-25: finish each one and report before the next.

## 1. Where things stand (2026-11-28)

| Part | State |
|---|---|
| Phase 0: design | GDD 0.4 merged (PR #7). Design 0.5, the long game, is this draft |
| Phase 0: balance simulator | Delivered on design 0.4 and merged (PR #6). Numbers frozen until a playtest. The content tables are rebuilt from 0.4 next (CHANGES B.6) |
| Phase 0: tech plan | Merged (PR #1 and PR #4). TypeScript, PixiJS and Electron, with a phone browser build |
| Phase 0: art direction | Style bible v1.7 (PR #2, open) already draws all eleven tiers. Batches 1 to 3 are made and cleaned. Batch 4 is written and waiting for images. Batches 5 to 8 (about 58 images) are left for launch |
| Phase 1: vertical slice | Started 2026-11-28 |

## 2. Releases at a glance

| Release | Name | When | What a player gets |
|---|---|---|---|
| v1.0 | Launch | the end of Phase 5 | Four worlds and every system of GDD 0.4, plus the launch part of the long game (section 4) |
| v1.1 | New Generation | about four weeks after launch, so it is there when an active player reaches day 30 | The third reset layer, Laurels, and the Godly, Ungodly and Holy tiers for everything |
| v1.2 | The Moon | when ready | World 5, its three field spots, Outings and Postcards |
| v1.3 | Nebula Nursery | before the first players reach month 3 | World 6, the fourth reset layer (Big Bloom and Starseeds), the Constellation map and the Grailed tier |
| Later | ideas, not promises | | Kite Flying, Beekeeping, the Jukebox, seasonal calendar events, more Almanac themes |

The game never waits on an update to be fun. Before v1.1, an active player past day 30 still has Festivals, World Mastery, research and Tier Up up to Exotic. Every tier that is not out yet shows as a silhouette with one line of hint. On its own, the launch game keeps every play style's Festival gaps under 10 days to about day 48. With the Head crowning, the active and idle players stay under 10 days to day 90, but the mixed player does not (CHANGES C.11). From about day 48 the rhythm leans on v1.1, so its date is the one hard date.

## 3. Phase by phase

### Phase 1: the vertical slice (now)

Lawson's scope: World 1 with its first four or five floors, tap feel, managers, a first chest opening, a first card upgrade and a first Replant, all at final quality. Lawson added on 2026-11-28: "It should be playable on phone and PC." The slice runs on both, by tap and hold alone.

The long game adds no features to the slice. It adds seven foundations, because they are cheap now and costly later (EXPANSION 15.1):

1. Tiers are data: one table of eleven tiers, and no code compares rarity names.
2. Cards carry `tier` and `nativeTier`.
3. One reveal player for every tier and both forms (full and short), with a debug "reveal theatre" that plays all eleven.
4. One `moment(tier, place, form)` effect for every big event.
5. Chests by tier, 1 to 11, with fixed extras as data.
6. Reset layers as a list, so New Generation and Big Bloom are new rows later, not new code.
7. Counted taps are a flag on the input source, so field taps never count.

**Done when:** the slice plays the first chest's reveal at its real tier with final art, the reveal theatre plays tiers 1 to 11 (placeholder art until Batch 4 arrives), a test fails if code compares rarity names, and the slice plays the same on a phone and a PC.

### Phase 2: all systems

**Step 2a: GDD 0.4.** Every system of the launch design, in the tech plan's order, wired and balanced against the simulator.

**Step 2b: the launch part of the long game**, in this order. Each step is written into the GDD and CONTENT.md when it is built, and the simulator checks it before the next.

| # | Step | EXPANSION | Why here |
|---|---|---|---|
| 1 | Golden Sprout tiers and weekend event tiers | 4.4, 4.5 | Small, and they use the reveal player at once |
| 2 | Floor Improvements | 5 | A core loop change, so it goes in before content |
| 3 | The field framework, then Fishing | 6.1 to 6.3 | The framework is built once; Fishing is the first game on it |
| 4 | Garden Diary, Season Almanac and Baron's Challenges | 11.1 to 11.3 | The daily rhythm, on the guarded day counter |
| 5 | Digging, the Workbench and Garden Treats | 6.4, 9.2 | The second game on the framework |
| 6 | Mining and Tier Up, with Full Bloom and the Festival crowning | 3, 6.5 | Tier Up needs ores, so it comes with the Mine. The crowning never moves to a later release: in the 90-day runs of the launch build, it is what keeps the active and idle players' late Festival gaps under 10 days (CHANGES C.11) |
| 7 | Style: Wardrobe, Style level and Boutique | 10 | Needs cosmetics from steps 1 to 6 to be worth opening |
| 8 | Longer trees: skill tiers 4 and 5, the Explorer branch, level cap 250 and Field Science | 8.1 to 8.3 | Needs the field to exist |
| 9 | Achievements in eleven tiers, field quests, chests of tiers 7 and 8 | 4.3, 12 | Last, because they count everything above |

After step 9 the simulator runs EXPANSION 15.2, items 1 to 4 and 7, and Phase 3 starts on the refitted numbers.

### Phase 3: content

- **Four worlds** as GDD 0.4 plans them: Thymeford, Loomington, Papaya Cay and Mount Mitten.
- **The full card, plant and heirloom sets,** quests, achievements and weekend events, as planned.
- **Field content for launch:** four fishing spots (Millpond, Old Canal, Lagoon and Ice Hole), two digging spots (Old Allotments and Dunes) and the Mitten Mine. That is 44 fish, 22 finds, 11 ores and 11 Geodes, each with a name, a line and an icon.
- **102 Floor Improvements,** three for each of the 34 launch floors.
- **Twelve heirloom pieces** for the four new sets (Angler's Luck, Treasure Hunter, Deep Delver and County Fair).
- **Style:** the first season's cosmetics, the Boutique's stock, and the outfit sets.
- **The daily rhythm:** Diary volumes I to XI, the first two Almanac seasons, and the Baron's challenges and excuses.
- **Achievement tiers 6 to 11** for 30 families, and Pip's line for every new unlock.

### Phase 4: polish

- A juice pass on the moment table (EXPANSION 4.2): the effort goes where the moment is biggest.
- Reveal lengths and "held" times tuned in a playtest, starting from EXPANSION 4.1 rule 4.
- The audio mix, with the eleven climbing chime notes and the eleven stings.
- Accessibility: Reduce motion keeps the climb as a steady glow, a tier is always shown by its emblem and pips as well as its colour, and no flash is faster than three a second.
- An onboarding pass so every unlock arrives alone, with a story beat and one line from Pip.
- Performance: the Grailed reveal's particle budget on a phone and at 4K.
- A consistency audit against style bible v1.7 by a fresh-eyes reviewer.

### Phase 5: ship v1.0

The Windows installer, the portable build and the phone browser build, with a README, a changelog and a save migration test from every earlier build.

### After launch

Each update repeats Phases 2 to 5 at a smaller size: the design goes into the GDD, the simulator fits it, the content is made, the polish pass runs, and a save from every earlier version is migrated in a test.

| Update | Systems | EXPANSION |
|---|---|---|
| v1.1 New Generation | New Generation, Laurels, the Laurel Shop, Family Mottos, the Hall of Fame and rooftop ornaments. Mine depths 8 to 10 (Sunstone, Eclipse Stone and Cloud Pearl), so Godly, Ungodly and Holy tier-ups and their crests. The Sunburst, Eclipse and Pearl Chests. The Ungodly Sprout. Heirloom slots 7 and 8, a third research desk and a third bench slot. The simulator fits `LAUREL_R0` | 2.3, 3, 4.3, 7.1 |
| v1.2 The Moon | World 5 and its twist, Floating Harvests (GDD 14). Crater Pond, Crater Sands and the Moon Quarry. Outings for the helpers. Postcards | 6.6, 11.4 |
| v1.3 Nebula Nursery | World 6 and its twist, Orbital Sunrise. The Star Pool and the Asteroid Garden. Big Bloom, Starseeds and the Constellation map. Grailstone and the Grailed tier, the Grail Chest, and the Holy and Grailed Sprouts. Evergreen ranks after level 250. The simulator fits `STARSEED_L0` | 7.2, 8.2, 8.4 |
| Later ideas | Kite Flying on Loomington's rooftops (a fourth activity), a Beekeeping apiary built on the Bee Hotel, the Jukebox, seasonal calendar events and more Almanac themes. After Sprout Tower is finished: the side-scrolling walk-around game that reuses the art (back burner, Lawson's idea of 2026-11-26) | 11.5, 12.3 |

## 4. The launch part of the long game, in one list

Everything here is in v1.0. Section numbers are EXPANSION's.

1. The eleven-tier ladder, the reveal ladder and the moment tiers (2, 4.1, 4.2).
2. Chests of every tier in the data. Tiers 1 to 8 can be earned in v1.0. Tiers 9 to 11 come with v1.1 and v1.3 (4.3).
3. Golden Sprout tiers from Common to Exotic, the Godly Sprout after every Festival, and weekend event tiers (4.4, 4.5).
4. Floor Improvements (5).
5. Fishing, Digging and Mining, with Otis the Otter, Digby the Mole and the Gnome Crew, their crates, the Fish Log, the Museum and the Ore Hall (6).
6. Tier Up for everything up to Exotic, the Festival crowning that makes a world's Head Godly, Full Bloom at the bench, the Workbench and Garden Treats (3, 9.2).
7. Skill tiers 4 and 5 with grand keystones, the Explorer branch, level cap 250 and the Field Science research lane (8.1 to 8.3).
8. Four new heirloom sets. Slots stay at six until v1.1 (9.1).
9. Style: the Wardrobe, the Style level and the Boutique (10).
10. The Garden Diary, the Season Almanac and Baron Fauxliage's Challenges (11.1 to 11.3).
11. Achievements in eleven tiers and field quests (12.1, 12.2).

## 5. Art in the order the build needs it

The Art Director numbers the batches and may reorder them. This is the order the build needs.

| Art | Needed for | State |
|---|---|---|
| Batch 4: Loomington workers and managers, Baron Fauxliage, weekend events, and the frames, badges and bursts of the five tiers above Legendary | Phase 1 reveal theatre, Phase 3 | Written 2026-11-27, waiting for images |
| Batches 5 to 8: the rest of the four launch worlds (about 58 images) | Phase 3 | In the batch plan |
| Fishing: the Millpond, the rod in eleven tiers, Otis, eleven fish, the Tackle Box | Phase 2b, step 3 | New, EXPANSION 15.3 |
| Digging: the Old Allotments, the spade, Digby, eleven finds, the Buried Chest | Phase 2b, step 5 | New |
| Mining: the Mitten Mine, rocks in eleven tiers, the pickaxe, the Gnome Crew, eleven ores, Geodes. The Prism, Sunburst, Eclipse, Pearl and Grail Chests | Phase 2b, step 6 | New |
| Floor Improvement props, as one small kit per world | Phase 2b step 2 (World 1), Phase 3 (the rest) | New |
| Style: tower skins, Pip outfits, the hat kit, tap trails, chest skins, card backs | Phase 2b, step 7 | New |
| Diary and Almanac covers, Garden Treat icons, achievement badges in eleven tiers | Phase 3 | New |
| The Hall of Fame wall, the portrait kit and rooftop ornaments | v1.1 | New |
| The Moon's three spots | v1.2 | New |
| The Constellation sky and Nebula Nursery's two spots | v1.3 | New |

A thing that tiers up keeps its own art: only its frame, emblem, glow and pips change. Where a recolour or an overlay can stand in for a drawn variant (a chest's edging, a rod's grip), the Art Director decides.

## 6. Who does what next

| Who | Next |
|---|---|
| Fresh-eyes reviewer | Audit design 0.5, as Lawson's review rule asks for every design version |
| Game Designer | Fold in the audit's notes. Then write each system into the GDD and CONTENT.md when the build reaches it |
| Phase 1 build thread | The seven foundations in section 3, Phase 1 (EXPANSION 15.1) |
| Balance simulator | Design 0.4's list first (CHANGES B.6), then EXPANSION 15.2 |
| Art Director | Fit EXPANSION 15.3 into the batch plan, in the order of section 5 |
| Writer | Names and lines in EXPANSION 15.4 |
| Audio Director | Sounds in EXPANSION 15.5 |
| Content Builder | The Phase 3 rows, from EXPANSION's patterns |
| QA | The checks in section 7 |

## 7. How each release is checked

Every phase, as the brief says: the balance simulator, the automated tests, a real playthrough with a screenshot of every new screen, the save torture tests (a crash mid-save, a corrupted file, a version migration, and offline catch-up of 1 minute, 8 hours and 30 days), big numbers that never overflow or lose precision, and an art-consistency review by a fresh-eyes reviewer. Then a report of what passed, what failed and what was fixed.

The long game adds these checks:

1. **The odds on screen are the odds in the data,** for every chest, catch, find, rock, visitor and weekend roll.
2. **No chest roll ever gives a card above Legendary** (a property test over many rolls).
3. **Every pity counter fires** when it should: chests, the Legend Meter and weekend tiers.
4. **A helper never spends a charge the player could have used,** and after time away it has worked exactly the overflow (a property test).
5. **Tier Up never lowers anything,** and every crest does what EXPANSION 2.3 says.
6. **Every tier's reveal plays,** in both forms, with Reduce motion on and off, on a phone and at 4K.
7. **Every activity plays by tap and hold alone** on a phone.
8. **A save from every earlier version loads** into each update, with nothing lost.

## 8. What could go wrong, and the plan

| Risk | Plan |
|---|---|
| **Scope.** The launch part of the long game is about as big again as Phase 2a | Section 3 orders it so each step stands alone. If time runs short, steps 7 to 9 of Phase 2b move to v1.1, and v1.0 is still a complete game |
| **Balance.** Tier Up and Floor Improvements add a lot of power | The simulator refits before Phase 3 (EXPANSION 15.2), and every power item has a cap or a gentle root (GDD 13.6). The two new reset layers are played over several generations before v1.1 and v1.3 ship, to confirm the gaps between resets do not shrink (EXPANSION 15.2, items 5 and 6) |
| **Too much at once** | One new thing at a time (EXPANSION 13). The first hour gains only Golden Sprout tiers and Floor Improvements |
| **Art volume** | Kits per world for props, recolours and overlays where they work, and art ordered by what the build needs next |
| **Reveal fatigue** | The short form for things that happen often, skipping after two seconds once a tier has been seen, and a setting for reveal length |
