# Sprout Tower: Premise Audit

Phase 0 design audit. It covers the brief, the Cash, Inc. game bible, the earlier idle-RPG brainstorm and both art reference packs (B1 to B29). The full design that follows from these calls is in [GDD.md](GDD.md), and the content rows are in [CONTENT.md](CONTENT.md).

Each call below is a decision, not an option. Where a call is big, the reason is given in a sentence or two. Section 9 lists what changed after an independent audit of the first version.

## 1. Verdict

The premise is strong and worth building almost as written. The tower loop from the bible is proven, the theme is warm and unusual, and the art direction already has a clear identity.

The premise has three real weaknesses, and the design fixes each one:

1. **The clicker dies when managers arrive.** In the reference game, tapping stops mattering the moment a floor is automated. The brief ranks Clicker first, so tapping has to stay worth it for the whole game.
2. **The system list is long enough to become clutter.** Twelve-plus systems that each add "+X% income" would bury the 60-second loop. Each system needs one job nobody else does, and each must arrive alone.
3. **Hemp is the flagship crop but is missing from the art and the floor list.** It has to be visible in the first three minutes, and it has to read as a farm crop every time it appears.

## 2. What the source material gives us

| Source | What we take | What we leave |
|---|---|---|
| Cash, Inc. bible | The floor cycle, tap to collect, linear payout, geometric level costs, the ×12 open-cost ladder, speed milestones, managers that automate, a second parallel tower. Section 5.1 is the starting point for floor numbers | Every name, character, line of text and piece of art. Ads, real-money packs, online leaderboards, celebrity parodies, the "spend Fame and lose your bonus" rule |
| Brainstorm | Skill tree with keystones, collectible workers with rarity, artifacts with sets, codex with completion bonus, achievements that give permanent income, auto-buy as a late convenience, a 60-second onboarding target | Talismans, worker skill trees, boss raids, expeditions, pets, random negative traits, worker ageing |
| Art packs B1 to B29 | Ten world 1 floors, twelve manager designs, six card rarities, six chest tiers, twelve artifact icons, eight currency icons, six Exotic plant paintings, a customer sheet, a HUD with a combo meter, city and island worlds, a Moon greenhouse | Nothing is cut. One floor is re-dressed as the hemp patch, one moves to world 2 to make room for the Ropewalk, and two are renamed (see 4.7 and 7.2) |

## 3. Keep

| Idea | Why it stays |
|---|---|
| Vertical tower, one business per floor | Readable at a glance, proven, and it suits the diorama art |
| Cycle, then tap, then payout | The core clicker beat. It teaches the game in one tap |
| Payout = base × level, geometric level costs, ×12 floor ladder | Proven pacing. The simulator can verify it directly |
| Level milestones | They give every floor a next goal at all times |
| Six rarities, duplicates level cards up | Standard, well understood, and matches the card art |
| Chests with shown odds and a pity timer | Honest and exciting. The chest reveal is a key juice moment |
| Rebirth and Prestige, each with a currency and a shop | The two layers give the game its days-to-weeks span |
| Worlds with their own floors, twist, art and currency | Fresh starts are the best reward the genre has |
| Offline earnings | Makes leaving the game feel safe |
| HD pixel art, golden hour, cozy and a bit absurd | Already chosen and already distinctive |

## 4. Change

### 4.1 Tapping pays all game long

After a floor has a manager, every tap still pays a slice of the whole tower's income, and that slice grows with Combo, Bumper taps (crits), Growth Spurts (frenzies) and Golden Sprouts. A new player with no upgrades earns about 3 to 4 times more while tapping than while watching, and a build that invests in tapping reaches about 25 times. Hard caps keep the ratio bounded however far a player goes.

**Why:** the brief puts Clicker first. If tapping only matters for the first 90 seconds, the game is an idle game with a clicker tutorial.

### 4.2 Managers become a collectible team you assign

The reference game has one fixed manager per floor. Here managers are cards. You pay a floor's hire fee in coins each run, then choose which manager takes the desk. Each manager multiplies the floor's profit, has a perk, and the rarer ones have a clickable ability.

**Why:** this is the cheapest way to get real build-crafting, and it means about 30 characters serve every world instead of one new character per floor (about 50). The hire fee is kept because it is the best pacing beat in the original loop. Story rewards guarantee you always own at least as many managers as you have floors, so nobody is ever stuck.

### 4.3 "Seed cards" and "plant cards" are one thing

There is one collectible: the Plant card. It arrives as a seed packet inside a chest, and you plant it in a floor's planter, where it adds a trait.

**Why:** two card types for the same idea would be clutter. The seed packet art becomes the reveal animation for plant cards.

### 4.4 Exotic is earned, never gambled

Exotic plants come only from cross-pollination and mutation. Exotic managers come only from mastering a world. Chests stop at Legendary.

**Why:** the top rarity should be a goal you work toward, and it keeps chest odds honest and the pity timer simple. It also makes the brief's own example (mint plus a winter world gives Frosted Mint) the only way to get an Exotic plant.

### 4.5 Compost never punishes you for spending it

The rebirth currency is Compost. Every bag of Compost you have ever earned in the current era gives +2% profit, whether or not you have spent it in the Compost Shop. The amount comes from lifetime earnings, so tiny repeat runs give nothing.

**Why:** the reference rule (spend the currency and lose its bonus) is a well-known trap for new players. The lifetime rule also removes any reason to reset every two minutes.

### 4.6 One milestone rule

Every milestone doubles a floor's output. It shows as a faster cycle until the cycle reaches 0.2 seconds, then as a bigger payout.

**Why:** the reference game mixes ×2 and ×1.25 tiers by floor. One rule is easier to learn and to simulate.

### 4.7 Hemp is in the tower from floor 3

World 1 gets a Backyard Hemp Patch on floor 3 and a Ropewalk on floor 8. World 2 is the hemp-industry city, with a weaving mill, paper workshop, tailor and hempcrete yard. Hemp is the largest plant family in the card set.

**Why:** the flagship crop cannot wait for a later world. No floors are added. The Backyard Patch becomes the hemp patch, and the Spice Kitchen moves to world 2 to make room for the Ropewalk, so nine of the ten existing floor paintings stay in world 1.

### 4.8 Research runs on time, not on spam

Research costs Insight and real time. Insight trickles in at a rate set by how many milestones your floors have reached, online and offline. Research never resets.

**Why:** it gives the idle player something to come back for, it cannot be farmed by resetting, and it is where conveniences like auto-buy live.

### 4.9 Twists are bonuses, never punishments

No pests, no frost damage, no plants dying. Every world twist is an extra way to earn.

**Why:** the tone is cozy. A mechanic that takes things away from an idle player reads as stress.

### 4.10 Ten floors in world 1, eight in every later world

**Why:** each later world brings a twist mechanic, so it does not need ten floors to feel full, and it saves ten floor dioramas across the game. This is a scope call. The numbers work the same either way.

### 4.11 Six worlds designed, four at launch

Thymeford (home), Loomington (city), Papaya Cay (island), Mount Mitten (winter), the Moon and the Nebula Nursery. Worlds 4 to 6 open through the prestige shop, so they are the long game.

**Why:** the brief asks for at least three, and more if the pacing needs them. The pacing check in the GDD has an active player reaching the fourth world around day 7, so three worlds would run dry inside the first week. Mount Mitten also carries Frosted Mint, the brief's own example of a mutation. The Moon and the Nebula Nursery are fully designed and can follow after launch. They would land in weeks 2 and 3.

### 4.12 Events are local and miss-proof

Weekend events run from the calendar on the player's PC. Anything you miss comes back in the rotation.

**Why:** there is no server and no monetization, so there is no reason for pressure.

## 5. Add

| Addition | What it does | Why |
|---|---|---|
| Combo meter | Taps build a multiplier that decays when you stop | The art pack HUD already shows one. It rewards rhythm |
| Bumper taps | 3% of taps pay ×10 | Crits are the cheapest juice in the genre |
| Growth Spurt | 300 taps fill a meter. Spend it for 20 seconds of ×3 everything | A frenzy you build yourself |
| Garden Visitors | A Golden Sprout drifts by every two minutes or so. Catch it for a windfall or a short boost | A reason to keep watching the screen |
| Hold to tap | Holding the mouse button or Space taps 6 times a second | Comfort and accessibility. Nobody needs an autoclicker |
| Pollen | Earned from spare cards and from bees. Pays for cross-pollination and for copies of a card you choose | Bad luck protection, and it gives duplicates of maxed cards a use |
| Tower milestones | Every floor past the same level gives the whole tower ×1.5 | Rewards levelling evenly, not only the top floor |
| World Mastery | Ten stars per world for best-ever tower milestones | A permanent record that survives every reset, and the route to Exotic managers |
| Morning Basket | A free crate every four hours, two stored | Replaces the ad-gated boosts of the reference game |
| Morning Dew | Two minutes of ×2 when you come back after an hour or more | Makes returning feel good |
| Player level | Earned from quests and new records. One skill point per level | Feeds the skill tree without tying it to resets |

## 6. Cut

| Idea | From | What happens to it |
|---|---|---|
| Talismans and merging | Brainstorm | Cut. Heirlooms cover the same ground with less inventory work |
| A skill tree for every worker | Brainstorm | Cut. Card levels, perks and abilities are enough depth per card |
| Boss raids | Brainstorm | Cut. Combat does not fit the tone |
| Expeditions | Brainstorm | Cut from v1. A good post-launch idea |
| Pets | Brainstorm | Cut as a system. Pip the tutorial sprout is a character, not a mechanic |
| Random negative traits, ageing workers | Brainstorm | Cut. Traits here are always positive |
| Relic forge | Brainstorm | Folded into Pollen |
| Contracts and bounties | Brainstorm | They are the daily and weekly quests |
| Ads, real-money packs, leaderboards | Bible | Cut, as the brief requires |
| Eighteen tower skins | Bible | Cut from v1. Worlds provide the visual variety. A few cosmetic tower decorations are the planned first use for spare Ribbons after launch |
| A third reset layer | Brief (optional) | Not in v1. The pacing check reaches week 4 with two layers, six worlds and World Mastery. Three reset layers would hurt the 60-second readability |

## 7. Risks and flags

### 7.1 The balance is a first pass

The numbers in the GDD were checked with a rough pacing script, not proven. An early version of the reset layers ran away (ten prestiges on day one) until two rules were tightened: shop upgrades that multiply profit are capped, and Compost and Ribbons use gentle roots of lifetime totals. The Economy thread's simulator is the proof. Section 19 of the GDD lists the tuning knobs in the order to turn them.

### 7.2 Hemp wording

Several ordinary garden words have a second meaning that a hemp game cannot afford. The GDD has a short word list for the Writer and Art Director (section 2.3). Three things change in existing material because of it: "Balcony Pots" becomes "Balcony Boxes", "Essence Lab" becomes "Soap & Scent Workshop", and the research currency is called Insight, not Essence, so that nothing reads as an extraction lab. The flask icon in B12 wants a redraw, and so does the mortar icon in B11, which becomes a stone birdbath. "Wrapping paper" became "gift paper" for the same reason. World 1's floor 2 base payout is 50, not the bible's 60, so the tutorial never shows a payout of 420, and its first level costs 70, not 69.

### 7.3 Working title

"Sprout Tower" is also the name of a location in a famous monster-collecting series. It is a common two-word phrase and this is a non-commercial game, so the risk is low, and the working title stays for now. If the game is ever shared widely, a distinct title is safer. Candidates: **Sproutscraper**, **Sprout & Storey**, **Thymeford Tower**.

### 7.4 Art load

The design asks for 50 floor rooms, 30 managers, 38 plants and 18 heirlooms in total. Launch with four worlds needs 34 floors (10 already painted), 28 managers (12 already drawn), 36 plants (7 already drawn), 18 heirlooms (12 already drawn) and one new world background. The content rows were fitted to the existing pictures on purpose: the first ten managers a player meets and six of the eight Exotic plants already have art. Everything is listed in CONTENT.md with a launch flag and an art column, and section 13 there adds it up.

### 7.5 Many systems

There are 14 systems. The unlock order in section 16 of the GDD shows at most one new system at a time, and nothing after the first chest appears in the first 90 seconds.

## 8. Questions where the answer would change the design

Only two matter enough to ask.

1. **How far past launch.** The design has six worlds and launches with four, because the pacing reaches the fourth world in the first week. Are you happy to generate art for the Moon and the Nebula Nursery after launch (about 8 floor paintings each), or should the game be designed to feel complete at four? Four is fine. Worlds 5 and 6 only add more places for weeks 2 and 3. One detail either way: the winter world is world 4 and the Moon is world 5, so your Moon picture (its file is named "world4") is used for world 5.
2. **Assignable managers.** Managers are cards you place on any floor, not one fixed character per floor. It adds a small "who goes where" choice each time you get a new card. If you would prefer zero management, managers can be fixed to floors with no change to the numbers.

## 9. What changed after the independent audit

A second reviewer who did not write the design audited version 0.1 of all three documents. The design met the brief. One rule had to change and nine more were worth changing while it is cheap. The full list of changed rules and numbers is in [CHANGES.md](CHANGES.md).

| Finding | Call |
|---|---|
| Timed boosts multiplied each other, and "pay N seconds of income now" abilities paid at the boosted rate. Every button pressed together paid about 100 days of income | **Fixed.** Every timed boost in a world now adds into one Boost, capped at ×15. A Growth Spurt is the only thing that multiplies it. Lump sums pay from the steady rate. Lining abilities up is still a nice burst and can no longer break the economy (GDD 13.5) |
| Offline bonuses reached their cap almost for free, so the idle build's cards and heirlooms did nothing | **Fixed.** Efficiency starts at 40% and the two cheap sources stop at 73%, so 100% takes a real idle build. Stored hours start at 4 and go to 33. A new player now gets more from a first night away, not less |
| Heirloom abilities and sets hung on a 5% roll | **Fixed.** The first Harvest Festival lets the player choose one Legendary heirloom. Rolls never repeat a piece, there is a pity counter, and Pollen buys copies |
| The weekend event's top prizes could not be reached | **Fixed.** The track now ends at about three hours of mixed play for a new player, sized with a rough script |
| The last World Mastery stars were out of reach and the first Exotic manager came too early | **Fixed.** The ten levels now run from 25 to 600. The first Exotic manager arrives around day 11 and the tenth star around day 50 |
| Combo refilled in three seconds, so nothing that protected it was worth having | **Fixed.** A stack now takes five taps. A full meter takes 17 to 42 seconds to build and a few seconds to lose |
| Twelve features unlocked in nine minutes, then nothing for half an hour | **Fixed.** Achievements and the Codex move to floor 9 and the skill tree to level 6 |
| Three worlds are too few for the pacing | **Fixed.** Four worlds at launch (section 4.11) |
| Replanting often could farm player levels | **Fixed.** XP is paid only for a new all-time Compost record |
| Eight rules an implementer could not follow as written | **Fixed**, each one in place (chest luck, what a tap harvests, one number for the first Replant, and so on) |

Not done on purpose: a late skill that raises the hold-to-tap rate, and cosmetic Ribbon sinks. The first would break the exact 111-point skill tree for a small gain, so the simulator is asked to test both tap rates first. The second needs new art, so it waits until after launch.
