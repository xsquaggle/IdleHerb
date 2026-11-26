# Handoff: design version 0.3 (one fixed manager per floor)

Working note for the Game Designer thread. It is deleted before the pull request is marked ready. Branch: `claude/project-thread-rkpf3y`, restarted from main after PR #3 merged.

## Why

Lawson, 2026-11-26: "One manager per Floor." and "Lets go for 6 at the end." (six worlds over time, four at launch stands). Lawson also asked every thread to be usage aware: small steps, commit and push often, keep this note current.

## Decisions (settled, write them into the documents)

1. **Roster.** 50 managers, one per floor, 34 at launch. No desks, seating or swapping. A manager belongs to one floor for good.
2. **Rarity by floor position.** World 1: floors 1 to 3 Common, 4 to 6 Uncommon, 7 Rare, 8 Epic, 9 Legendary, 10 Exotic. Worlds 2 to 6: floors 1 and 2 Common, 3 and 4 Uncommon, 5 Rare, 6 Epic, 7 Legendary, 8 Exotic. Totals: 13 C, 13 U, 6 R, 6 E, 6 L, 6 X. Launch: 9, 9, 4, 4, 4, 4.
3. **The top floor's manager is the world's Head** (the Exotic). Hired like anyone. Copies never come from chests: Mastery star 5 gives one, stars 7, 9 and 10 one more each, and the Starlight Chest gives one for a Head whose world has 5 stars.
4. **Hiring is unchanged.** Pay the floor's `hireFee` once per run, again after a Replant. `hire.fee` stat stays.
5. **Cards still level managers.** A manager's card is owned at level 1 from the first time its floor is ever opened. Chest manager slots pick among managers the player has met (floor opened at least once). No card of that rarity met: the slot gives a plant, and if there is none of those either it drops one rarity.
6. **Welcome Chest** (same trigger): 2 copies each of the managers of floors 1 to 3. **Hiring Crate** (World 1 floors 4 to 9, first open): 2 copies of that floor's manager plus 2 Wooden Crate slots. Floor 10 has no crate, because Head copies never come from a crate.
7. **Profit formula.** `managerProfit = MGR_BASE[rarity] x MGR_STEP[rarity] ^ (level - 1) x managerPowerMult`. `MGR_BASE = 2, 2.5, 3, 3.5, 4, 5`. `MGR_STEP = 1.2, 1.2, 1.2, 1.22, 1.28, 1.43`. Max levels and copy curves unchanged (15, 13, 11, 9, 7, 5). Profit at max: 25.7, 22.3, 18.6, 17.2, 17.6, 20.9. Reason: rarer managers now sit on the floors that earn most, so the old bases (4, 6, 10) would front-load day 0 and 1.
8. **Abilities.** Rare and better, so four per world (24 in all, 16 at launch, the same 16 effects as 0.2). An ability works in its manager's own world. Hotkeys 1 to 4 on the world on screen.
9. **Mayor Thyme** leaves the manager roster and hosts the Harvest Festival.
10. **Also in 0.3:** the three rulings from the re-check notes (project memory `design-next-pass`): ceiling sentence in GDD 6.7, Combo and clicks, Autopilot taps are not counted taps.

## Launch roster (floor: manager, art, ability)

World 1: 1 Nana Sprig (B5). 2 Basil Brumble (B5). 3 Rowan Rake (new, hemp cast). 4 Posy Seedwell (new, hemp cast). 5 Fern Petrie (B5). 6 Juniper Jones (B21). 7 Old Moss (B21): Tea Break, the old Keep the Beat effect. 8 Captain Kelp (new, hemp cast): All Hands. 9 Clementine Zest (B21): Showstopper, the old Best in Show effect. 10 Granny Evergreen (new), Head: Sunday Best.

World 2: 1 Bram Applewhite (B5). 2 Olive Ledger (B5). 3 new weaver (hemp cast). 4 new papermaker (hemp cast). 5 Barley Biggs (B21): Lunch Rush, the old Crescendo effect. 6 Hazel Thimble: Stitch in Time. 7 Bjorn Barrow: Heave-Ho. 8 Madame Loom, Head: Golden Thread.

World 3: 1 Sandy Tidewell (B5). 2 Marigold Mayhew. 3 new sailmaker (hemp cast). 4 new net weaver (hemp cast). 5 Professor Thistlewick: Sprinkler Surge. 6 The Amazing Marrow: Abracadabra. 7 Pepper Finch: Step Right Up. 8 Skipper Papaya, Head: Treasure Map.

World 4: 1 new. 2 new. 3 Dame Dahlia Fairweather. 4 new knitter (hemp cast). 5 Maestro Fennel: Strike Up the Band, the old Town Fair effect. 6 Chip (B21): Dig In. 7 Barnaby Moonwort (B21): Night Shift. 8 Grandpa Mitten, Head: Fireside Story (Heat jumps to 100).

Worlds 5 and 6 (later): Heads are Commander Comet (Liftoff) and The Stargardener (Supernova). 14 new managers and 6 new abilities, first-pass.

Seven new launch characters, all Common or Uncommon with no ability. Launch art: 12 pictured, 22 new sprites (was 16).

## Steps

- [x] Decisions and this note
- [x] CONTENT section 2 (rows, abilities, who a new player meets, art status)
- [x] GDD 5.1, 6.1, 6.3, 6.7, 7, 8.1 to 8.3, 11.5, 12, 13.4, 13.5, 14.5, 16 (new row 11), 17, 19, Appendix A
- [x] Other CONTENT rows: scopes, Star Pupil (each world's Head counts as 1 level higher), Autopilot, story 42, achievements, codex and launch counts
- [x] AUDIT 4.2, 4.4, 7.4, section 8 (both answered), new section 10
- [x] CHANGES.md: new part "Version 0.3" (A.1 to A.7), the 0.2 part kept below it
- [ ] Checks (tables, references, word list), delete this note, open the pull request
- [ ] Tell the simulator, tech and art threads. Ask the coordinator for a fresh-eyes audit before merging

## Open questions

None for Lawson. For the simulator: the manager column of the budget in GDD 17.6 needs measuring again, because the floors that earn most now have the managers that level slowest.
