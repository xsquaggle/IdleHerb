# Sprout Tower: Content Tables

Version 0.3, Phase 0: one fixed manager per floor (what changed is in [CHANGES.md](CHANGES.md)). Owner: Game Designer thread. This file holds every content row. Rules and formulas are in [GDD.md](GDD.md). The reasons behind the big calls are in [AUDIT.md](AUDIT.md).

## 0. How to read this file

- One table per kind of content, one row per thing. Column names in `code style` are field names for the content pipeline.
- **Ids are stable.** They follow the Engine thread's convention: lowercase, dotted, namespaced by kind (`floor.w1.windowsill`, `card.manager.nana_sprig`, `plant.mint.frosted`, `artifact.sprouting_trowel`). Heirlooms use the `artifact.` prefix because that is the pipeline's table name. Players only ever see the word Heirloom.
- **Names are defaults** for the Writer to polish. Every name here follows the word list in GDD 2.3 and the never list in `docs/art/HEMP_ART.md`.
- **Art** columns say which picture already exists in Lawson's packs (B numbers) and what is new. How things look belongs to the Art Director.
- **Launch** `yes` means the row is needed for the four-world launch. `later` rows belong to worlds 5 and 6.
- Numbers such as `2.5e10` are big numbers.

### 0.1 Effects

Every bonus in this file is an effect with four parts: a `stat`, a scope, an operation and a value.

| Written as | Operation | Meaning |
|---|---|---|
| `+10%`, `-5%` | `inc` | A percentage. All `inc` effects on one stat in one bucket are added together, then buckets multiply each other (GDD 13) |
| `+5`, `+0.5 points`, `+2 s` | `add` | A flat amount added to the stat |
| `x2` | `mul` | Multiplies the stat |
| "unlocks", "sets" | `set` | Switches something on or replaces a value. Implemented as a named special |

**Scopes:** `floor` (a manager's own floor, or the floor a plant is planted on), `adjacent` (the floors directly above and below that floor), `world` (every floor in that floor's world), `global` (everything, counted once per card). A manager's effects count only while it is hired.

**Buckets:** a manager's own profit multiplier is the `manager` bucket. Manager perks and plant traits share the `floor` bucket. Heirlooms and their set bonuses are the `heirloom` bucket. Then `skill`, `research`, `compost`, `ribbon`, `achievement`, `codex`, `mastery`, `twist` and `boost`. The `boost` bucket holds everything that lasts a set time. It is the one bucket that adds across every source and has a cap (GDD 13.5).

**Scaling with level:**

| Owner | Value at level `L` |
|---|---|
| Manager perk | `value x (1 + 0.1 x (L - 1))` |
| Plant trait | GDD 8.5 |
| Heirloom passive | `value x (1 + 0.15 x (L - 1))`, unless the row says "fixed" |
| Abilities and set bonuses | never scale |

### 0.2 Stats

These are the stat names used in this file. The Engine thread may map them to its registered stat ids. The formulas they feed are in GDD 13.

| `stat` | What it changes | Cap (GDD 13.4) |
|---|---|---|
| `floor.profit` | Profit multiplier | none |
| `floor.speed` | Speed multiplier | none |
| `floor.levelCost` | Level cost multiplier | never below 0.25 in total |
| `floor.doubleChance` | Chance that a harvest pays double | 1 |
| `tower.milestoneMult` | The ×1.5 tower milestone factor | 2.0 |
| `tap.power` | Tap value | ×3 in total |
| `tap.critChance` | Bumper chance | 0.12 |
| `tap.critMult` | Bumper multiplier | 20 |
| `tap.comboCap` | Most Combo stacks | 50 |
| `tap.comboGrace` | Seconds before Combo starts to fall | 6 s |
| `spurt.duration` | Growth Spurt length | 45 s |
| `spurt.tapsNeeded` | Taps to fill the Spurt meter | at least 150 |
| `spurt.speed` | Floor speed during a Spurt | 4 |
| `visitor.interval` | Time between Garden Visitors | at least 0.4 of the base |
| `visitor.lifetime` | How long a visitor stays | none |
| `visitor.reward` | Value of Golden Sprout outcomes | none |
| `offline.earnings` | Offline earnings, as a percentage on top of efficiency | see GDD 13.4 |
| `offline.efficiency` | Offline efficiency, in points | 1.0 |
| `offline.cap` | Hours of offline earnings stored | 36 h. Everything in the game adds up to 33 h |
| `chest.luck` | Rare, Epic and Legendary chest weights. Skills and research only | none needed (GDD 8.3, rule 6) |
| `insight.gain`, `pollen.gain`, `compost.gain` | Income of that currency. `compost.gain` comes from skills and the Compost Shop only | none |
| `manager.power` | Every manager's profit multiplier | none |
| `manager.cooldown` | Manager ability cooldowns, as a reduction. Cooldowns tick faster while it is active | 50% |
| `plant.power` | Strength of plant traits. May be limited to one family | none |
| `plant.affinity` | The ×1.5 at-home bonus | none |
| `heirloom.power` | Strength of numeric heirloom passives | none |
| `hire.fee` | Hire fees | never below 0.1 |
| `bench.speed` | Speed of pollination and mutation jobs | none |
| `dew.duration` | Length of Morning Dew | none |

### 0.3 Other ids

| Kind | Ids |
|---|---|
| Worlds | `world.w1` to `world.w6` |
| World currencies | `cur.coins`, `cur.notes`, `cur.shells`, `cur.snowmarks`, `cur.moonpennies`, `cur.stardust` |
| Other currencies | `cur.gems`, `cur.compost`, `cur.ribbons`, `cur.insight`, `cur.pollen`, `cur.skill_points`, `cur.fair_tickets` |
| Chests | `chest.wooden`, `chest.copper`, `chest.silver`, `chest.golden`, `chest.crystal`, `chest.starlight` |
| Special chests | `chest.welcome`, `chest.hiring`, `chest.basket`, `chest.seed_packet` |
| Rarities | `common`, `uncommon`, `rare`, `epic`, `legendary`, `exotic` |
| Plant families | `hemp`, `mint`, `basil`, `rosemary`, `lavender`, `sage`, `chamomile`, `thyme` |
| Climates | `temperate`, `urban`, `tropical`, `frost`, `lunar`, `stellar` |

## 1. Worlds and floors

World rules, twists and parameters are in GDD 14. Every floor value below comes from the template in GDD 5.3. If the world parameters `D` or `T` change, these tables are regenerated. The top floor of each world is "Wild": every plant family is at home there.

| `id` | `name` | `climate` | `currency` | Floors | `D` | `T` | `COMPOST_K` | Ticket to next | Deed | Art | Launch |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `world.w1` | Thymeford | temperate | Coins | 10 | 1 | 1.00 | 5 | 3e23 Coins | none | B3, B26 | yes |
| `world.w2` | Loomington | urban | Notes | 8 | 1e5 | 0.90 | 15 | 4.5e23 Notes | none | B17 | yes |
| `world.w3` | Papaya Cay | tropical | Shells | 8 | 2e7 | 0.85 | 40 | 1e25 Shells | none | B18 | yes |
| `world.w4` | Mount Mitten | frost | Snowmarks | 8 | 5e10 | 0.80 | 100 | 3e30 Snowmarks | 8 Ribbons | new | yes |
| `world.w5` | The Moon | lunar | Moonpennies | 8 | 1e16 | 0.75 | 250 | 3e35 Moonpennies | 60 Ribbons | B27 (file is named "world4") | later |
| `world.w6` | Nebula Nursery | stellar | Stardust | 8 | 4e20 | 0.70 | 600 | none | 250 Ribbons | new | later |

### 1.1 Thymeford (`world.w1`), currency: Coins, `D = 1`, `T = 1.0`

| `order` | `id` | `name` | `product` | `favouredFamily` | `openCost` | `basePayout` | `baseCycle` (s) | `levelBaseCost` | `growth` | `hireFee` | Art |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `floor.w1.windowsill` | Windowsill Planter | Fresh mint | Mint | free | 1 | 0.6 | 4 | 1.07 | 1,000 | B4 floor 01 v2 |
| 2 | `floor.w1.balcony` | Balcony Boxes | Basil and kitchen herbs | Basil | 60 | 50 | 3 | 70 | 1.15 | 12,000 | B4 floor 02 v2 (was "Balcony Pots") |
| 3 | `floor.w1.hemp_patch` | Backyard Hemp Patch | Hemp stalks | Hemp | 720 | 540 | 6 | 828 | 1.14 | 90,000 | B4 floor 03 v2, re-dressed as a hemp patch |
| 4 | `floor.w1.garden_shed` | Garden Shed Nursery | Seedlings | Thyme | 8,640 | 6,480 | 12 | 9,936 | 1.13 | 604,800 | B4 floor 04 v2 |
| 5 | `floor.w1.greenhouse` | Glass Greenhouse | Sage and tender herbs | Sage | 103,680 | 77,760 | 24 | 119,232 | 1.12 | 4,147,200 | B4 floor 05 v2 |
| 6 | `floor.w1.market` | Farmers' Market Stall | Herb bunches | Rosemary | 1,244,160 | 933,120 | 48 | 1,430,784 | 1.11 | 31,104,000 | B4 floor 06 v2 |
| 7 | `floor.w1.tea_house` | Tea House | Herbal teas | Chamomile | 14,929,920 | 11,197,440 | 96 | 17,169,408 | 1.10 | 253,808,640 | B4 floor 07 v2 |
| 8 | `floor.w1.ropewalk` | Ropewalk & Twine Shop | Hemp rope and twine | Hemp | 179,159,040 | 134,369,280 | 192 | 206,032,896 | 1.09 | 2.508e9 | new, art batch 1 |
| 9 | `floor.w1.soap_workshop` | Soap & Scent Workshop | Lavender soap, hemp-seed lotion | Lavender | 2.15e9 | 1.612e9 | 384 | 2.472e9 | 1.08 | 2.58e10 | B4 floor 09 v2, re-dressed (was "Essence Lab") |
| 10 | `floor.w1.hq` | Sprout Tower HQ | The brand, on every shelf | Wild | 2.58e10 | 1.935e10 | 768 | 2.967e10 | 1.07 | 3.096e11 | B4 floor 10 v2 |

### 1.2 Loomington (`world.w2`), currency: Notes, `D = 100,000`, `T = 0.9`

| `order` | `id` | `name` | `product` | `favouredFamily` | `openCost` | `basePayout` | `baseCycle` (s) | `levelBaseCost` | `growth` | `hireFee` | Art |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `floor.w2.rooftop_beds` | Rooftop Garden Beds | Rooftop thyme | Thyme | free | 1 | 0.6 | 400,000 | 1.07 | 100,000,000 | new |
| 2 | `floor.w2.herb_kiosk` | Corner Herb Kiosk | Mint bunches to go | Mint | 6,000,000 | 50 | 3 | 7,000,000 | 1.15 | 1.2e9 | new |
| 3 | `floor.w2.weaving_mill` | Canvas Weaving Mill | Hemp canvas | Hemp | 72,000,000 | 540 | 6 | 82,800,000 | 1.14 | 9e9 | new |
| 4 | `floor.w2.paper_workshop` | Paper Workshop | Hemp notebooks, gift paper and kites | Hemp | 864,000,000 | 5,832 | 12 | 993,600,000 | 1.13 | 6.048e10 | new |
| 5 | `floor.w2.bistro` | Spice Kitchen Bistro | Herb dishes | Basil | 1.037e10 | 62,985.60 | 24 | 1.192e10 | 1.12 | 4.147e11 | B4 floor 08 v2 (Spice Kitchen) |
| 6 | `floor.w2.atelier` | Tailor's Atelier | Hemp-linen clothes, lavender sachets | Lavender | 1.244e11 | 680,244.48 | 48 | 1.431e11 | 1.11 | 3.11e12 | new |
| 7 | `floor.w2.brickyard` | Hempcrete Brickyard | Eco building blocks | Hemp | 1.493e12 | 7,346,640.38 | 96 | 1.717e12 | 1.10 | 2.538e13 | new |
| 8 | `floor.w2.emporium` | Grand Emporium | Everything, on five floors | Wild | 1.792e13 | 79,343,716.15 | 192 | 2.06e13 | 1.09 | 2.508e14 | new |

### 1.3 Papaya Cay (`world.w3`), currency: Shells, `D = 20,000,000`, `T = 0.85`

| `order` | `id` | `name` | `product` | `favouredFamily` | `openCost` | `basePayout` | `baseCycle` (s) | `levelBaseCost` | `growth` | `hireFee` | Art |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `floor.w3.beach_hut` | Beach Hut Planters | Iced mint tea | Mint | free | 1 | 0.6 | 80,000,000 | 1.07 | 2e10 | new |
| 2 | `floor.w3.jungle_terrace` | Jungle Herb Terrace | Island basil | Basil | 1.2e9 | 50 | 3 | 1.4e9 | 1.15 | 2.4e11 | new |
| 3 | `floor.w3.sailcloth_loft` | Sailcloth Loft | Hemp sails | Hemp | 1.44e10 | 540 | 6 | 1.656e10 | 1.14 | 1.8e12 | new |
| 4 | `floor.w3.net_weavers` | Hammock & Net Weavers | Hemp hammocks and nets | Hemp | 1.728e11 | 5,508 | 12 | 1.987e11 | 1.13 | 1.21e13 | new |
| 5 | `floor.w3.hot_spring` | Hot-Spring Greenhouse | Volcano-warmed sage | Sage | 2.074e12 | 56,181.60 | 24 | 2.385e12 | 1.12 | 8.294e13 | new |
| 6 | `floor.w3.floating_market` | Floating Market Boats | Rosemary and spice | Rosemary | 2.488e13 | 573,052.32 | 48 | 2.862e13 | 1.11 | 6.221e14 | new |
| 7 | `floor.w3.snack_shack` | Seed Snack Shack | Hemp-seed granola and coconut bars | Thyme | 2.986e14 | 5,845,133.66 | 96 | 3.434e14 | 1.10 | 5.076e15 | new |
| 8 | `floor.w3.lighthouse` | Lighthouse Conservatory | Rare island plants | Wild | 3.583e15 | 59,620,363.37 | 192 | 4.121e15 | 1.09 | 5.016e16 | new |

### 1.4 Mount Mitten (`world.w4`), currency: Snowmarks, `D = 5e10`, `T = 0.8`

| `order` | `id` | `name` | `product` | `favouredFamily` | `openCost` | `basePayout` | `baseCycle` (s) | `levelBaseCost` | `growth` | `hireFee` | Art |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `floor.w4.cabin_windowsill` | Cabin Windowsill | Winter mint | Mint | free | 1 | 0.6 | 2e11 | 1.07 | 5e13 | new |
| 2 | `floor.w4.herb_racks` | Hearthside Herb Racks | Dried sage | Sage | 3e12 | 50 | 3 | 3.5e12 | 1.15 | 6e14 | new |
| 3 | `floor.w4.ice_greenhouse` | Ice-Glass Greenhouse | Chamomile under ice glass | Chamomile | 3.6e13 | 540 | 6 | 4.14e13 | 1.14 | 4.5e15 | new |
| 4 | `floor.w4.knitworks` | Hemp Knitworks | Hemp-wool blankets and mittens | Hemp | 4.32e14 | 5,184 | 12 | 4.968e14 | 1.13 | 3.024e16 | new |
| 5 | `floor.w4.tea_lodge` | Fireside Tea Lodge | Lavender tea and cocoa | Lavender | 5.184e15 | 49,766.40 | 24 | 5.962e15 | 1.12 | 2.074e17 | new |
| 6 | `floor.w4.sled_works` | Sled Works | Hemp-board sleds | Hemp | 6.221e16 | 477,757.44 | 48 | 7.154e16 | 1.11 | 1.555e18 | new |
| 7 | `floor.w4.aurora_garden` | Aurora Garden | Thyme under the lights | Thyme | 7.465e17 | 4,586,471.42 | 96 | 8.585e17 | 1.10 | 1.269e19 | new |
| 8 | `floor.w4.summit_lodge` | Summit Lodge | The mountain flagship | Wild | 8.958e18 | 44,030,125.67 | 192 | 1.03e19 | 1.09 | 1.254e20 | new |

### 1.5 The Moon (`world.w5`), currency: Moonpennies, `D = 1e16`, `T = 0.75`

| `order` | `id` | `name` | `product` | `favouredFamily` | `openCost` | `basePayout` | `baseCycle` (s) | `levelBaseCost` | `growth` | `hireFee` | Art |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `floor.w5.lander_windowsill` | Lander Windowsill | Moon mint | Mint | free | 1 | 0.6 | 4e16 | 1.07 | 1e19 | new (B27 sets the look) |
| 2 | `floor.w5.dome_garden` | Dome Garden | Basil under glass | Basil | 6e17 | 50 | 3 | 7e17 | 1.15 | 1.2e20 | new (B27 sets the look) |
| 3 | `floor.w5.hemp_field` | Low-Gravity Hemp Field | Very tall hemp | Hemp | 7.2e18 | 540 | 6 | 8.28e18 | 1.14 | 9e20 | new |
| 4 | `floor.w5.hempcrete_works` | Moon-Dust Hempcrete Works | Lunar building blocks | Hemp | 8.64e19 | 4,860 | 12 | 9.936e19 | 1.13 | 6.048e21 | new |
| 5 | `floor.w5.tea_room` | Zero-G Tea Room | Floating chamomile tea | Chamomile | 1.037e21 | 43,740 | 24 | 1.192e21 | 1.12 | 4.147e22 | new |
| 6 | `floor.w5.soapery` | Starlight Soapery | Lavender soap | Lavender | 1.244e22 | 393,660 | 48 | 1.431e22 | 1.11 | 3.11e23 | new |
| 7 | `floor.w5.biodome` | Crater Biodome | Sage and rosemary groves | Rosemary | 1.493e23 | 3,542,940 | 96 | 1.717e23 | 1.10 | 2.538e24 | new |
| 8 | `floor.w5.lunar_spire` | Lunar Spire | Moon headquarters | Wild | 1.792e24 | 31,886,460 | 192 | 2.06e24 | 1.09 | 2.508e25 | new |

### 1.6 Nebula Nursery (`world.w6`), currency: Stardust, `D = 4e20`, `T = 0.7`

| `order` | `id` | `name` | `product` | `favouredFamily` | `openCost` | `basePayout` | `baseCycle` (s) | `levelBaseCost` | `growth` | `hireFee` | Art |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `floor.w6.airlock_planter` | Airlock Planter | Thyme by the airlock | Thyme | free | 1 | 0.6 | 1.6e21 | 1.07 | 4e23 | new |
| 2 | `floor.w6.ring_garden` | Spinning Ring Garden | Mint in a spinning ring | Mint | 2.4e22 | 50 | 3 | 2.8e22 | 1.15 | 4.8e24 | new |
| 3 | `floor.w6.sail_loom` | Solar-Sail Loom | Hemp-canvas solar sails | Hemp | 2.88e23 | 540 | 6 | 3.312e23 | 1.14 | 3.6e25 | new |
| 4 | `floor.w6.seed_vault` | Comet Seed Vault | Hemp seed stores | Hemp | 3.456e24 | 4,536 | 12 | 3.974e24 | 1.13 | 2.419e26 | new |
| 5 | `floor.w6.asteroid_greenhouse` | Asteroid Greenhouse | Sage on a rock | Sage | 4.147e25 | 38,102.40 | 24 | 4.769e25 | 1.12 | 1.659e27 | new |
| 6 | `floor.w6.cafe` | Constellation Cafe | Chamomile lattes with a view | Chamomile | 4.977e26 | 320,060.16 | 48 | 5.723e26 | 1.11 | 1.244e28 | new |
| 7 | `floor.w6.shipping_dock` | Wormhole Shipping Dock | Parcels to everywhere | Lavender | 5.972e27 | 2,688,505.34 | 96 | 6.868e27 | 1.10 | 1.015e29 | new |
| 8 | `floor.w6.garden_bridge` | Galactic Garden Bridge | The command deck | Wild | 7.166e28 | 22,583,444.89 | 192 | 8.241e28 | 1.09 | 1.003e30 | new |

## 2. Managers

Rules are in GDD 7. **Every floor has its own manager.** There are 50, one for each floor, and 34 at launch. A manager never moves to another floor. Rarity follows the floor's place in its world (GDD 7.1), and a manager's profit multiplier comes from its rarity and level (GDD 7.2). The perk and ability are below.

A manager's card is owned at level 1 from the first time its floor is opened. Chests then give copies of managers the player has met. The Exotic manager on each world's top floor is that world's **Head**. Copies of a Head never come from a chest roll. They come from World Mastery (GDD 14.5) and the Starlight Chest (GDD 8.3).

`M` numbers follow floor order. They are a reading aid for this file. Code uses the `id`.

### 2.1 Manager rows

| # | `id` | `name` | `floor` | `rarity` | Perk at level 1 | Role (a hint for the Writer and Art Director) | Art | Launch |
|---|---|---|---|---|---|---|---|---|
| M01 | `card.manager.nana_sprig` | Nana Sprig | `floor.w1.windowsill` | common | `floor.levelCost` -5% (floor) | Grandmother with a trowel who never overpays | B5, 2nd | yes |
| M02 | `card.manager.basil_brumble` | Basil Brumble | `floor.w1.balcony` | common | `floor.profit` +20% (floor) | Jolly shopkeeper in an apron | B5, 3rd | yes |
| M03 | `card.manager.rowan_rake` | Rowan Rake | `floor.w1.hemp_patch` | common | `floor.speed` +10% (floor) | Hemp field hand, up before the sun | new, hemp cast | yes |
| M04 | `card.manager.posy_seedwell` | Posy Seedwell | `floor.w1.garden_shed` | uncommon | `plant.power` +15% (floor) | Seed keeper with a sack on each shoulder | new | yes |
| M05 | `card.manager.fern_petrie` | Fern Petrie | `floor.w1.greenhouse` | uncommon | `insight.gain` +4% (global) | Curious botanist in goggles | B5, 5th | yes |
| M06 | `card.manager.juniper_jones` | Juniper Jones | `floor.w1.market` | uncommon | `tap.power` +8% (world) | Cheerful market runner with a basket | B21, 2nd | yes |
| M07 | `card.manager.old_moss` | Old Moss | `floor.w1.tea_house` | rare | `offline.earnings` +12% (world) | Serene tea master | B21, 1st | yes |
| M08 | `card.manager.captain_kelp` | Captain Kelp | `floor.w1.ropewalk` | epic | `floor.profit` +12% (adjacent) | Rope master and retired sailor | new, hemp cast | yes |
| M09 | `card.manager.clementine_zest` | Clementine Zest | `floor.w1.soap_workshop` | legendary | `tap.critChance` +0.5 points (world) | Perfumer with a flair for drama | B21, 3rd | yes |
| M10 | `card.manager.granny_evergreen` | Granny Evergreen | `floor.w1.hq` | exotic | `tower.milestoneMult` +0.1 (world) | Head of Thymeford. Matriarch of the tower | new | yes |
| M11 | `card.manager.bram_applewhite` | Bram Applewhite | `floor.w2.rooftop_beds` | common | `floor.profit` +8% (adjacent) | Rooftop beekeeper whose bees help the neighbours | B5, 4th | yes |
| M12 | `card.manager.olive_ledger` | Olive Ledger | `floor.w2.herb_kiosk` | common | `floor.speed` +10% (floor) | Brisk bookkeeper in a green suit, now running a kiosk | B5, 6th | yes |
| M13 | `card.manager.tansy_treadle` | Tansy Treadle | `floor.w2.weaving_mill` | uncommon | `floor.profit` +30% (floor) | Weaver who hums in time with the loom | new, hemp cast | yes |
| M14 | `card.manager.kit_foldaway` | Kit Foldaway | `floor.w2.paper_workshop` | uncommon | `floor.speed` +15% (floor) | Papermaker and kite builder | new, hemp cast | yes |
| M15 | `card.manager.barley_biggs` | Barley Biggs | `floor.w2.bistro` | rare | `floor.profit` +40% (floor) | Grumpy cook with a heart of gold | B21, 4th | yes |
| M16 | `card.manager.hazel_thimble` | Hazel Thimble | `floor.w2.atelier` | epic | `plant.power` +25%, Hemp family only (floor) | Master tailor | new, hemp cast | yes |
| M17 | `card.manager.bjorn_barrow` | Bjorn Barrow | `floor.w2.brickyard` | legendary | `floor.profit` +60% (floor) | Hempcrete builder | new, hemp cast | yes |
| M18 | `card.manager.madame_loom` | Madame Loom | `floor.w2.emporium` | exotic | `plant.power` +50%, Hemp family only (world) | Head of Loomington and of the weavers' guild | new, hemp cast | yes |
| M19 | `card.manager.sandy_tidewell` | Sandy Tidewell | `floor.w3.beach_hut` | common | `offline.earnings` +8% (world) | Easygoing beach gardener | B5, 1st | yes |
| M20 | `card.manager.marigold_mayhew` | Marigold Mayhew | `floor.w3.jungle_terrace` | common | `tap.comboCap` +2 (world) | Island drummer who keeps the terrace in time | new | yes |
| M21 | `card.manager.marina_bolt` | Marina Bolt | `floor.w3.sailcloth_loft` | uncommon | `floor.profit` +30% (floor) | Sailmaker with a needle the size of an oar | new, hemp cast | yes |
| M22 | `card.manager.ned_knotwell` | Ned Knotwell | `floor.w3.net_weavers` | uncommon | `floor.levelCost` -6% (floor) | Net weaver who can tie forty knots | new, hemp cast | yes |
| M23 | `card.manager.professor_thistlewick` | Professor Thistlewick | `floor.w3.hot_spring` | rare | `floor.speed` +25% (floor) | Sprinkler inventor | new | yes |
| M24 | `card.manager.amazing_marrow` | The Amazing Marrow | `floor.w3.floating_market` | epic | `floor.doubleChance` +10% (world) | Stage magician who pulls a second harvest out of his hat | new | yes |
| M25 | `card.manager.pepper_finch` | Pepper Finch | `floor.w3.snack_shack` | legendary | `visitor.interval` -5% (world) | Fairground caller with a tray of seed bars | new | yes |
| M26 | `card.manager.skipper_papaya` | Skipper Papaya | `floor.w3.lighthouse` | exotic | `visitor.reward` +100% (world) | Head of Papaya Cay. Island ferry skipper | new | yes |
| M27 | `card.manager.wren_woolsey` | Wren Woolsey | `floor.w4.cabin_windowsill` | common | `floor.levelCost` -5% (floor) | Cabin keeper in three scarves | new | yes |
| M28 | `card.manager.bertie_bundle` | Bertie Bundle | `floor.w4.herb_racks` | common | `floor.profit` +20% (floor) | Ties herbs in tidy bundles and labels every one | new | yes |
| M29 | `card.manager.dame_dahlia` | Dame Dahlia Fairweather | `floor.w4.ice_greenhouse` | uncommon | `tap.critMult` +0.5 (world) | Garden-show judge who winters in the mountains | new | yes |
| M30 | `card.manager.purl_garter` | Purl Garter | `floor.w4.knitworks` | uncommon | `floor.speed` +15% (floor) | Knitter whose needles never stop | new, hemp cast | yes |
| M31 | `card.manager.maestro_fennel` | Maestro Fennel | `floor.w4.tea_lodge` | rare | `spurt.duration` +2 s (world) | Conductor of the lodge band | new | yes |
| M32 | `card.manager.chip` | Chip | `floor.w4.sled_works` | epic | `floor.levelCost` -8% (floor) | Garden robot with a sprout on its head | B21, 6th | yes |
| M33 | `card.manager.barnaby_moonwort` | Barnaby Moonwort | `floor.w4.aurora_garden` | legendary | `offline.earnings` +20% (world) | Night-shift keeper with a lantern | B21, 5th | yes |
| M34 | `card.manager.grandpa_mitten` | Grandpa Mitten | `floor.w4.summit_lodge` | exotic | `offline.efficiency` +25 points (world) | Head of Mount Mitten. Storyteller by the fire | new | yes |
| M35 | `card.manager.tilly_touchdown` | Tilly Touchdown | `floor.w5.lander_windowsill` | common | `floor.levelCost` -5% (floor) | Lander pilot who gardens between flights | new | later |
| M36 | `card.manager.domingo_pane` | Domingo Pane | `floor.w5.dome_garden` | common | `floor.profit` +20% (floor) | Glazier who polishes the dome every morning | new | later |
| M37 | `card.manager.stilts_mccrae` | Stilts McCrae | `floor.w5.hemp_field` | uncommon | `floor.speed` +15% (floor) | Field hand on stilts, for the very tall hemp | new, hemp cast | later |
| M38 | `card.manager.petra_blockley` | Petra Blockley | `floor.w5.hempcrete_works` | uncommon | `floor.profit` +30% (floor) | Moon mason, proud of every block | new, hemp cast | later |
| M39 | `card.manager.auntie_gravity` | Auntie Gravity | `floor.w5.tea_room` | rare | `offline.earnings` +12% (world) | Serves tea that stays in the cup, mostly | new | later |
| M40 | `card.manager.stella_lather` | Stella Lather | `floor.w5.soapery` | epic | `floor.profit` +12% (adjacent) | Soap maker who stamps a star on every bar | new | later |
| M41 | `card.manager.grover_crater` | Grover Crater | `floor.w5.biodome` | legendary | `plant.power` +20% (world) | Grove keeper who has named every tree | new | later |
| M42 | `card.manager.commander_comet` | Commander Comet | `floor.w5.lunar_spire` | exotic | `tap.power` +30% (world) | Head of the Moon. Moon base commander | new | later |
| M43 | `card.manager.dot_hatchley` | Dot Hatchley | `floor.w6.airlock_planter` | common | `floor.speed` +10% (floor) | Airlock keeper, always counting to three | new | later |
| M44 | `card.manager.gus_gyro` | Gus Gyro | `floor.w6.ring_garden` | common | `floor.profit` +20% (floor) | Gardener who has not been dizzy in years | new | later |
| M45 | `card.manager.luma_weft` | Luma Weft | `floor.w6.sail_loom` | uncommon | `floor.profit` +30% (floor) | Weaver of sails a mile wide | new, hemp cast | later |
| M46 | `card.manager.major_kernel` | Major Kernel | `floor.w6.seed_vault` | uncommon | `plant.power` +15% (floor) | Vault keeper who salutes every seed | new, hemp cast | later |
| M47 | `card.manager.rocky_bloom` | Rocky Bloom | `floor.w6.asteroid_greenhouse` | rare | `visitor.interval` -5% (world) | Grows sage on a rock and waves at passing comets | new | later |
| M48 | `card.manager.celeste_crema` | Celeste Crema | `floor.w6.cafe` | epic | `tap.critChance` +0.5 points (world) | Draws constellations in the foam | new | later |
| M49 | `card.manager.dash_parcelli` | Dash Parcelli | `floor.w6.shipping_dock` | legendary | `floor.profit` +60% (floor) | Dock chief who has never lost a parcel | new | later |
| M50 | `card.manager.stargardener` | The Stargardener | `floor.w6.garden_bridge` | exotic | `floor.profit` +50% (world) | Head of the Nebula Nursery. Keeper of the orbital greenhouse | new | later |

A perk works only while its manager is hired in the current run. `floor` is the manager's own floor, `adjacent` the floors directly above and below it, `world` every floor in the manager's world, and `global` everything.

Mayor Thyme, an Exotic manager in version 0.2, is no longer a manager. He hosts the Harvest Festival and pins on the Ribbons (GDD 12.2).

### 2.2 Abilities

Rare and better managers have one ability, so every world has four: the managers of its four highest floors. Strength is fixed. An ability works in its manager's own world, and its button is on that manager's floor. "This world" and "this floor" below mean the manager's own. A **boost** is a timed bonus that adds into the world's one capped Boost and never multiplies another boost (GDD 13.5).

| Manager | World | `ability` | Effect | `cooldown` |
|---|---|---|---|---|
| M07 Old Moss | 1 | Tea Break | Combo jumps to full and cannot fall for 60 s | 8 min |
| M08 Captain Kelp | 1 | All Hands | A ×2 boost in this world for 30 s, shown as speed | 12 min |
| M09 Clementine Zest | 1 | Showstopper | The next 20 taps are Bumpers | 8 min |
| M10 Granny Evergreen | 1 | Sunday Best | A ×5 boost in this world for 30 s | 15 min |
| M15 Barley Biggs | 2 | Lunch Rush | Fills the Growth Spurt meter | 10 min |
| M16 Hazel Thimble | 2 | Stitch in Time | This floor pays 60 s of its own steady income at once | 6 min |
| M17 Bjorn Barrow | 2 | Heave-Ho | Pays 120 s of this world's steady income at once | 20 min |
| M18 Madame Loom | 2 | Golden Thread | A ×10 boost in this world for 20 s | 20 min |
| M23 Professor Thistlewick | 3 | Sprinkler Surge | A ×10 boost on this floor for 30 s | 10 min |
| M24 The Amazing Marrow | 3 | Abracadabra | The next chest opened rolls with double the Rare, Epic and Legendary weights | 60 min |
| M25 Pepper Finch | 3 | Step Right Up | A Golden Sprout appears now | 10 min |
| M26 Skipper Papaya | 3 | Treasure Map | Three Golden Sprouts appear | 20 min |
| M31 Maestro Fennel | 4 | Strike Up the Band | A Growth Spurt of normal length starts now. It does not use the meter | 30 min |
| M32 Chip | 4 | Dig In | This floor's level costs ×0.5 for 30 s | 15 min |
| M33 Barnaby Moonwort | 4 | Night Shift | A ×2 boost in this world for 60 s | 15 min |
| M34 Grandpa Mitten | 4 | Fireside Story | Heat jumps to 100 | 20 min |
| M39 Auntie Gravity | 5 | Tea Party | Every bubble in this world fills at once, each with 120 s of its floor's steady income | 20 min |
| M40 Stella Lather | 5 | Lather Up | A ×3 boost in this world for 30 s | 12 min |
| M41 Grover Crater | 5 | Moonrise | A ×5 boost in this world for 30 s | 15 min |
| M42 Commander Comet | 5 | Liftoff | A ×5 tap boost for the next 50 taps | 15 min |
| M47 Rocky Bloom | 6 | Meteor Shower | Two Golden Sprouts appear | 15 min |
| M48 Celeste Crema | 6 | Wake-Up Call | The next sunrise pays as if it was caught, even if the player misses it | 10 min |
| M49 Dash Parcelli | 6 | Express Delivery | Pays 5 minutes of this world's steady income at once | 30 min |
| M50 The Stargardener | 6 | Supernova | Pays 10 minutes of this world's steady income at once | 60 min |

The sixteen launch abilities are the same sixteen effects as in version 0.2. Four of them have a new name to suit a new owner: Tea Break was Keep the Beat, Showstopper was Best in Show, Lunch Rush was Crescendo and Strike Up the Band was Town Fair. Fireside Story lost its second half, because Grandpa Mitten never leaves Mount Mitten. The six abilities of worlds 5 and 6 other than Liftoff and Supernova are new and first-pass.

Boosts add. Sunday Best and All Hands together are ×6 (1 + 4 + 1), and the Boost stops at ×15. A boost that is already running restarts its timer when it is triggered again. Abilities that pay income at once use the steady rate, with no Boost and no Growth Spurt in it (GDD 13.5, rule 4).

### 2.3 Who a new player meets first

A manager arrives with their floor, so the first session never depends on luck. In World 1 the player meets M01 to M10 in floor order.

| When | What the player gets |
|---|---|
| A floor opens for the first time | That floor's manager, owned at level 1 and waiting to be hired |
| Welcome Chest (the first time the player holds 1,000 Coins with floor 3 open) | 2 copies each of M01 Nana Sprig, M02 Basil Brumble and M03 Rowan Rake. That is enough to take each of them to level 2 |
| Hiring Crate, as each of World 1 floors 4 to 9 opens for the first time | 2 copies of that floor's manager, plus 2 Wooden Crate slots |

The Welcome Chest arrives at the moment the player can pay the first hire fee (1,000 Coins). It teaches both halves of a manager in one beat: hire Nana Sprig, then level her up. Hire buttons appear once the Welcome Chest has been opened. Floor 10 has no Hiring Crate, because its manager is the Head and Head copies never come from a crate.

### 2.4 Art status

- **Pictured (12):** M01, M02, M05, M06, M07, M09 in World 1. M11, M12, M15 in Loomington. M19 in Papaya Cay. M32, M33 in Mount Mitten.
- **New for World 1 (4):** M03 Rowan Rake, M04 Posy Seedwell, M08 Captain Kelp, M10 Granny Evergreen. They are needed before anything else, because the player meets them in the first half hour.
- **New for worlds 2 to 4 (18):** M13, M14, M16, M17, M18, M20 to M26, M27 to M31, M34.
- **Later (16):** M35 to M50.
- **New characters in version 0.3 (7 at launch):** Tansy Treadle, Kit Foldaway, Marina Bolt, Ned Knotwell, Wren Woolsey, Bertie Bundle, Purl Garter. Fourteen more belong to worlds 5 and 6.
- **Hemp cast** (brisk, proud craftspeople): every manager of a hemp floor. At launch: M03 Rowan Rake, M08 Captain Kelp, M13 Tansy Treadle, M14 Kit Foldaway, M16 Hazel Thimble, M17 Bjorn Barrow, M18 Madame Loom, M21 Marina Bolt, M22 Ned Knotwell, M30 Purl Garter. Chip runs the Sled Works and is a robot, which reads as neither.
- A manager now belongs to one room, so a sprite can be drawn for that room and no longer needs a floor-neutral pose. Every floor still needs one manager spot. Whether the pictured twelve need new poses is the Art Director's call.
- The hemp-floor rule is now a casting rule: the easygoing beach gardener (M19) and the night-shift keeper (M33) are on herb floors and stay there. The Art Director still keeps mortars, pipes, steam and smoke puffs off every manager sprite. Role hints, bios and ability text stay clear of them too.
- World 1 has three grandmothers: the lead worker on floor 1 (Lawson's art), Nana Sprig, who manages that same floor, and Granny Evergreen. A hint for the Writer: the floor 1 worker and Nana Sprig can be sisters, so the likeness reads as a joke.

## 3. Plants

Rules, traits and formulas are in GDD 8.5 and 8.6. There are 38 plants: 26 from chests, 4 Legendary hybrids and 8 Exotics. Launch has 36.

### 3.1 Families

| `family` | Cards | Favoured by (World 1 floor) |
|---|---|---|
| Hemp | 6 | Backyard Hemp Patch, Ropewalk & Twine Shop |
| Mint | 5 | Windowsill Planter |
| Thyme | 5 | Garden Shed Nursery |
| Basil | 5 | Balcony Boxes |
| Sage | 5 | Glass Greenhouse |
| Rosemary | 4 | Farmers' Market Stall |
| Lavender | 4 | Soap & Scent Workshop |
| Chamomile | 4 | Tea House |

Hemp is the largest family. Hemp cards are drawn as tall cane crops. Any magic shows in the stalk and fibre.

### 3.2 Plants from chests

| `id` | `name` | `family` | `rarity` | `trait` | `poolWorld` | Art | Launch |
|---|---|---|---|---|---|---|---|
| `plant.hemp.fibre` | Fibre Hemp | hemp | common | Sturdy | w1 | new, art batch 1 | yes |
| `plant.hemp.seed` | Seed Hemp | hemp | uncommon | Bountiful | w1 | new | yes |
| `plant.hemp.longstalk` | Longstalk Hemp | hemp | rare | Neighbourly | w1 | new | yes |
| `plant.hemp.show` | Giant Show-Hemp | hemp | epic | Sturdy | w2 | new | yes |
| `plant.mint.garden` | Garden Mint | mint | common | Quick | w1 | B9, B24 | yes |
| `plant.mint.pepper` | Peppermint | mint | uncommon | Sweet | w1 | new | yes |
| `plant.mint.chocolate` | Chocolate Mint | mint | rare | Fragrant | w1 | new | yes |
| `plant.basil.sweet` | Sweet Basil | basil | common | Sweet | w1 | B9 | yes |
| `plant.basil.lemon` | Lemon Basil | basil | uncommon | Zesty | w1 | new | yes |
| `plant.basil.purple` | Purple Basil | basil | rare | Sturdy | w1 | new | yes |
| `plant.rosemary.kitchen` | Kitchen Rosemary | rosemary | common | Thrifty | w1 | new | yes |
| `plant.rosemary.trailing` | Trailing Rosemary | rosemary | uncommon | Neighbourly | w1 | new | yes |
| `plant.rosemary.topiary` | Rosemary Topiary | rosemary | epic | Thrifty | w2 | new | yes |
| `plant.lavender.field` | Field Lavender | lavender | common | Evergreen | w1 | B9 | yes |
| `plant.lavender.butterfly` | Butterfly Lavender | lavender | uncommon | Lucky | w1 | new | yes |
| `plant.lavender.royal` | Royal Lavender | lavender | rare | Evergreen | w2 | new | yes |
| `plant.sage.garden` | Garden Sage | sage | common | Studious | w1 | new | yes |
| `plant.sage.pineapple` | Pineapple Sage | sage | uncommon | Quick | w1 | new | yes |
| `plant.sage.silver` | Silver Sage | sage | rare | Frosty | w2 | new | yes |
| `plant.chamomile.meadow` | Meadow Chamomile | chamomile | common | Bountiful | w1 | new | yes |
| `plant.chamomile.double` | Double Chamomile | chamomile | uncommon | Evergreen | w1 | new | yes |
| `plant.chamomile.golden` | Golden Chamomile | chamomile | epic | Radiant | w3 | new | yes |
| `plant.thyme.garden` | Garden Thyme | thyme | common | Fragrant | w1 | new | yes |
| `plant.thyme.lemon` | Lemon Thyme | thyme | uncommon | Thrifty | w1 | new | yes |
| `plant.thyme.creeping` | Creeping Thyme | thyme | rare | Quick | w2 | new | yes |
| `plant.thyme.elfin` | Elfin Thyme | thyme | epic | Lucky | w3 | new | yes |

Counts: 8 Common, 8 Uncommon, 6 Rare, 4 Epic. There are no Legendary plants in chests. A Legendary plant slot in a chest gives a Legendary manager (GDD 8.3, rule 3).

The first seed packet (World 1 floor 5) always holds Garden Mint and Fibre Hemp.

### 3.3 Recipes

**Hybrids** are Legendary and carry two traits. Both parents must be at level 2 or higher. Each job costs 400 Pollen and takes 8 hours (GDD 8.6).

| `id` | `name` | `family` | `traits` | Parent 1 | Parent 2 | Earliest | Art | Launch |
|---|---|---|---|---|---|---|---|---|
| `plant.mint.honey` | Honeymint | mint | Quick, Bountiful | Chocolate Mint | Double Chamomile | world 2 (bench) | new | yes |
| `plant.basil.pepperleaf` | Pepperleaf Basil | basil | Zesty, Fragrant | Purple Basil | Creeping Thyme | world 2 | new | yes |
| `plant.hemp.silkspun` | Silkspun Hemp | hemp | Sturdy, Evergreen | Giant Show-Hemp | Royal Lavender | world 2 | new, "silk-pearl" look (pale silver-lilac canes, silky threads) | yes |
| `plant.sage.sunset` | Sunset Sage | sage | Frosty, Thrifty | Silver Sage | Rosemary Topiary | world 2 | new | yes |

Honeymint is the teaching recipe. Both parents drop in World 1, so the first hybrid only waits for the bench and 400 Pollen.

**Exotics** carry two traits. The parent must be at level 3 or higher, and the player must have unlocked the world with that climate. Each job costs 1,500 Pollen and takes 24 hours.

| `id` | `name` | `family` | `traits` | Parent | Climate | Earliest | Art | Launch |
|---|---|---|---|---|---|---|---|---|
| `plant.hemp.sunspun` | Sunspun Hemp | hemp | Sturdy, Neighbourly | Giant Show-Hemp | temperate | world 3 (chamber) | new, "golden-thread" look | yes |
| `plant.thyme.clockwork` | Clockwork Thyme | thyme | Quick, Radiant | Elfin Thyme | urban | world 3 | new | yes |
| `plant.basil.ember` | Ember Basil | basil | Sweet, Zesty | Purple Basil | tropical | world 3 | B9, B23 | yes |
| `plant.rosemary.thunder` | Thunder Rosemary | rosemary | Thrifty, Zesty | Rosemary Topiary | tropical | world 3 | B23 | yes |
| `plant.mint.frosted` | Frosted Mint | mint | Frosty, Quick | Chocolate Mint | frost | world 4 | B9, B23, B25 | yes |
| `plant.sage.crystal` | Crystal Sage | sage | Studious, Lucky | Silver Sage | frost | world 4 | B23 | yes |
| `plant.lavender.moonlit` | Moonlit Lavender | lavender | Evergreen, Lucky | Royal Lavender | lunar | world 5 | B9, B23 | later |
| `plant.chamomile.starlight` | Starlight Chamomile | chamomile | Radiant, Bountiful | Golden Chamomile | stellar | world 6 | B23 | later |

Every family has exactly one Exotic. Ember Basil is the easiest first Exotic, because its parent is a Rare that drops in World 1.

The Codex shows each recipe as a silhouette with a hint from the first day. Hint text belongs to the Writer.

## 4. Heirlooms

Rules are in GDD 8.7. There are 18 heirlooms in six sets of three: one Rare, one Epic and one Legendary each. The Legendary piece has an ability. All 18 are needed at launch and all drop from chests.

### 4.1 Heirloom rows

| # | `id` | `name` | `set` | `rarity` | Passive at level 1 | `ability` | `cooldown` | Art |
|---|---|---|---|---|---|---|---|---|
| H01 | `artifact.sprouting_trowel` | Sprouting Trowel | toolshed | rare | `floor.profit` +30% (global) | | | B11 |
| H02 | `artifact.brass_garden_key` | Brass Garden Key | toolshed | epic | `floor.levelCost` -8% (global) | | | B11 |
| H03 | `artifact.golden_watering_can` | Golden Watering Can | toolshed | legendary | `floor.profit` +60% (global) | **Downpour:** a ×3 boost in the world on screen for 30 s | 10 min | B11 |
| H04 | `artifact.honey_hive_charm` | Honey Hive Charm | lucky | rare | `pollen.gain` +20% | | | B11 |
| H05 | `artifact.lucky_gnome` | Lucky Gnome | lucky | epic | `visitor.interval` -15% | | | B11 |
| H06 | `artifact.clover_locket` | Clover Locket | lucky | legendary | `floor.doubleChance` +8% (global) | **Lucky Day:** the next Golden Sprout is a Jackpot, a Windfall worth ×5 | 20 min | new |
| H07 | `artifact.glass_cloche_bell` | Glass Cloche Bell | night | rare | `offline.earnings` +20% | | | B11 |
| H08 | `artifact.moonstone_birdbath` | Moonstone Birdbath | night | epic | `offline.cap` +4 h (fixed), `insight.gain` +10% | | | B11, redrawn (the icon shows a mortar; it becomes a stone bowl of moonlit water with no pestle) |
| H09 | `artifact.sandglass_of_seasons` | Sandglass of Seasons | night | legendary | `floor.speed` +20% (global) | **Time Skip:** pays 10 minutes of offline-rate income in every world at once, from the steady rate | 30 min | B11 |
| H10 | `artifact.bramble_gloves` | Bramble Gloves | thorn | rare | `tap.power` +25% | | | new |
| H11 | `artifact.thornback_pruners` | Thornback Pruners | thorn | epic | `tap.critChance` +1.5 points | | | B11 |
| H12 | `artifact.whetstone_of_plenty` | Whetstone of Plenty | thorn | legendary | `tap.critMult` +3 | **Sharp Season:** the next 30 taps are Bumpers | 10 min | new |
| H13 | `artifact.wayfinder_compass` | Wayfinder Compass | rainmaker | rare | `floor.speed` +10% (global) | | | B11 |
| H14 | `artifact.toadstool_wind_bell` | Toadstool Wind-Bell | rainmaker | epic | `spurt.duration` +4 s | | | B11 |
| H15 | `artifact.rainbow_sprinkler` | Rainbow Sprinkler | rainmaker | legendary | `spurt.tapsNeeded` -20% | **Rainbow Burst:** fills half of the Growth Spurt meter | 8 min | B11 |
| H16 | `artifact.heirloom_spindle` | Heirloom Spindle | weaver | rare | `manager.power` +10% | | | new |
| H17 | `artifact.canvas_guild_banner` | Canvas Guild Banner | weaver | epic | `manager.cooldown` -10% | | | new |
| H18 | `artifact.golden_rope_coil` | Golden Rope Coil | weaver | legendary | `plant.power` +50%, Hemp family only | **Pull Together:** every manager cooldown in the world on screen is reset | 45 min | new |

Twelve icons exist in B11, and one of them (the mortar) is redrawn as the birdbath. Six are new: locket, gloves, whetstone, spindle, banner and rope coil.

No heirloom gives chest luck or Compost gain. Those two are read at a single click, so a piece that carried them would only ever be swapped in for that click (GDD 13.4).

### 4.2 Sets

| `set` | Name | Theme | Two pieces | Three pieces |
|---|---|---|---|---|
| `toolshed` | Grandmother's Toolshed | Profit | `floor.profit` +25% | `tower.milestoneMult` +0.1 |
| `lucky` | Lucky Garden | Luck and visitors | `visitor.lifetime` +6 s | Windfalls pay +100% |
| `night` | Night Garden | Offline | `dew.duration` +120 s | `offline.efficiency` +15 points |
| `thorn` | Thorn & Thistle | Tapping | `tap.comboCap` +5 | Every Bumper adds 5 to the Spurt meter |
| `rainmaker` | Rainmaker's Kit | Growth Spurts | `spurt.duration` +3 s | `spurt.speed` +1 (3 becomes 4) |
| `weaver` | Weaver's Legacy | Managers and hemp | `hire.fee` ×0.5 | `manager.power` +15% |

With six slots a player can wear two full sets, or three pairs.

The story gives the Sprouting Trowel at the third Replant. That is how heirlooms are introduced. The first Harvest Festival gives the **Heirloom Pick**: the player chooses one Legendary out of H03, H06, H09, H12, H15 and H18. After that, chest rolls never repeat a piece until that rarity is complete, a pity counter gives a Legendary piece at least every 10 pieces, and Pollen buys copies of pieces already owned (GDD 8.3, 8.6 and 8.7).

## 5. Skill tree

Rules are in GDD 9.2. Three branches of 37 points. A branch has six minor skills (5 ranks), two major skills (3 ranks) and two keystones (1 rank, pick one). Tiers open by points spent in the same branch: tier 1 at 0, tier 2 at 5, tier 3 at 15, keystone at 30.

### 5.1 Green Thumb (tapping)

| `id` | `name` | Tier | Ranks | Effect per rank |
|---|---|---|---|---|
| `skill.gt.firm_grip` | Firm Grip | 1 | 5 | `tap.power` +10% |
| `skill.gt.keep_the_rhythm` | Keep the Rhythm | 1 | 5 | `tap.comboCap` +2 |
| `skill.gt.bumper_crop` | Bumper Crop | 2 | 5 | `tap.critChance` +0.5 points |
| `skill.gt.big_bumpers` | Big Bumpers | 2 | 5 | `tap.critMult` +0.5 |
| `skill.gt.long_spurt` | Long Spurt | 2, major | 3 | `spurt.duration` +2 s |
| `skill.gt.second_wind` | Second Wind | 3 | 5 | `spurt.tapsNeeded` -6% |
| `skill.gt.sprout_spotter` | Sprout Spotter | 3 | 5 | `visitor.interval` -5% |
| `skill.gt.steady_hands` | Steady Hands | 3, major | 3 | `tap.comboGrace` +1 s |
| `skill.gt.thunder_thumb` | **Thunder Thumb** | keystone | 1 | Combo cannot fall during a Growth Spurt. Each Bumper during a Spurt makes that Spurt 0.25 s longer, up to +15 s. This is on top of the 45 s length cap |
| `skill.gt.golden_touch` | **Golden Touch** | keystone | 1 | Catching a Golden Sprout adds 60 taps to the Spurt meter. The first tap of every Growth Spurt calls a Golden Sprout |

### 5.2 Botanist (collection)

| `id` | `name` | Tier | Ranks | Effect per rank |
|---|---|---|---|---|
| `skill.bo.green_fingers` | Green Fingers | 1 | 5 | `plant.power` +5% |
| `skill.bo.people_person` | People Person | 1 | 5 | `manager.power` +5% |
| `skill.bo.lucky_dip` | Lucky Dip | 2 | 5 | `chest.luck` +4% |
| `skill.bo.pollinator` | Pollinator | 2 | 5 | `pollen.gain` +10% |
| `skill.bo.home_soil` | Home Soil | 2, major | 3 | `plant.affinity` +0.1 |
| `skill.bo.quick_study` | Quick Study | 3 | 5 | `insight.gain` +10% |
| `skill.bo.curator` | Curator | 3 | 5 | `heirloom.power` +5% |
| `skill.bo.bench_hand` | Bench Hand | 3, major | 3 | `bench.speed` +10% |
| `skill.bo.companion_planting` | **Companion Planting** | keystone | 1 | A floor gets ×1.5 profit while every floor directly next to it holds a plant of the same family as one of its own plants. A middle floor has two neighbours. The top and bottom floors have one |
| `skill.bo.star_pupil` | **Star Pupil** | keystone | 1 | In each world, the Head counts as 1 level higher while hired, even past its max level. `manager.cooldown` -25% |

### 5.3 Tycoon (automation)

| `id` | `name` | Tier | Ranks | Effect per rank |
|---|---|---|---|---|
| `skill.ty.good_bookkeeping` | Good Bookkeeping | 1 | 5 | `floor.profit` +10% (global) |
| `skill.ty.night_owl` | Night Owl | 1 | 5 | `offline.efficiency` +3 points |
| `skill.ty.early_shift` | Early Shift | 2 | 5 | `floor.speed` +4% (global) |
| `skill.ty.bulk_discount` | Bulk Discount | 2 | 5 | `floor.levelCost` -2% (global) |
| `skill.ty.even_rows` | Even Rows | 2, major | 3 | `tower.milestoneMult` +0.05 |
| `skill.ty.deep_pantry` | Deep Pantry | 3 | 5 | `offline.cap` +1 h |
| `skill.ty.compost_connoisseur` | Compost Connoisseur | 3 | 5 | `compost.gain` +4% |
| `skill.ty.warm_welcome` | Warm Welcome | 3, major | 3 | `dew.duration` +60 s |
| `skill.ty.autopilot` | **Autopilot** | keystone | 1 | While the game is open, every hired manager in every unlocked world taps once a second. Each of these taps pays `TAP_SECONDS x tapPowerMult x steadyIPS` of its own world: no Combo, no Bumpers, no Boost and no Growth Spurt. They are not counted taps (GDD 6.1): they do not fill the Spurt meter, build Combo or add Hearth Heat, and they do not count for quests or achievements |
| `skill.ty.compound_interest` | **Compound Interest** | keystone | 1 | Offline earnings grow by +2% for every hour away, up to +50%. This is applied after the efficiency cap |

## 6. Research

Rules are in GDD 10. Forty-eight projects in four lanes. A project needs the project named in `requires` to be finished first. Cost is in Insight. Totals: about 809,000 Insight and about 1,354 hours. The eight rows marked 0.4 are long projects (GDD 10, rule 7): cheap in Insight, four or five days each.

### 6.1 Tools

| `id` | `name` | `requires` | Cost | Time | Effect |
|---|---|---|---|---|---|
| `research.tools.sturdy_baskets` | Sturdy Baskets | | 50 | 5 min | `offline.cap` +4 h |
| `research.tools.bigger_baskets` | Bigger Baskets | Sturdy Baskets | 400 | 1 h | `offline.cap` +4 h |
| `research.tools.root_cellar` | Root Cellar | Bigger Baskets | 3,000 | 6 h | `offline.cap` +4 h |
| `research.tools.cold_store` | Cold Store | Root Cellar | 20,000 | 24 h | `offline.cap` +8 h |
| `research.tools.whole_tower_button` | Whole-Tower Button | | 150 | 20 min | Unlocks one button (and the A key) that buys the current buy mode on every floor, cheapest first |
| `research.tools.second_planter` | Second Planter | | 1,500 | 4 h | Every floor gets a second planter |
| `research.tools.heirloom_shelf_1` | Heirloom Shelf I | heirlooms unlocked | 2,500 | 6 h | Heirloom slot 3 |
| `research.tools.heirloom_shelf_2` | Heirloom Shelf II | Heirloom Shelf I | 25,000 | 24 h | Heirloom slot 4 |
| `research.tools.basket_stacker` | Basket Stacker | | 800 | 2 h | The Morning Basket stores 3 crates |
| `research.tools.auto_hire` | Auto-Hire | Whole-Tower Button | 5,000 | 8 h | After a Replant, each floor's manager is hired again the moment its fee can be paid |

### 6.2 Soil Science

| `id` | `name` | `requires` | Cost | Time | Effect |
|---|---|---|---|---|---|
| `research.soil.soil_science_1` | Soil Science I | | 100 | 10 min | Research profit ×1.5 |
| `research.soil.soil_science_2` | Soil Science II | Soil Science I | 1,000 | 2 h | Research profit ×1.5 |
| `research.soil.soil_science_3` | Soil Science III | Soil Science II | 8,000 | 8 h | Research profit ×1.5 |
| `research.soil.soil_science_4` | Soil Science IV | Soil Science III | 40,000 | 24 h | Research profit ×1.5 |
| `research.soil.soil_science_5` | Soil Science V | Soil Science IV | 150,000 | 48 h | Research profit ×1.5 |
| `research.soil.crop_rotation_1` | Crop Rotation I | Soil Science I | 300 | 30 min | Research speed ×1.2 |
| `research.soil.crop_rotation_2` | Crop Rotation II | Crop Rotation I | 4,000 | 6 h | Research speed ×1.2 |
| `research.soil.crop_rotation_3` | Crop Rotation III | Crop Rotation II | 60,000 | 36 h | Research speed ×1.2 |
| `research.soil.crop_rotation_4` | Crop Rotation IV (0.4) | Crop Rotation III | 12,000 | 96 h | Research speed ×1.4 |
| `research.soil.frugal_farming_1` | Frugal Farming I | Soil Science I | 600 | 1 h | Research level cost ×0.9 |
| `research.soil.frugal_farming_2` | Frugal Farming II | Frugal Farming I | 12,000 | 12 h | Research level cost ×0.9 |
| `research.soil.living_soil_1` | Living Soil I (0.4) | Soil Science III | 18,000 | 120 h | Research profit ×1.3 |
| `research.soil.living_soil_2` | Living Soil II (0.4) | Living Soil I | 21,000 | 120 h | Research profit ×1.3 |
| `research.soil.living_soil_3` | Living Soil III (0.4) | Living Soil II | 24,000 | 120 h | Research profit ×1.3 |
| `research.soil.living_soil_4` | Living Soil IV (0.4) | Living Soil III | 27,000 | 120 h | Research profit ×1.3 |
| `research.soil.living_soil_5` | Living Soil V (0.4) | Living Soil IV | 30,000 | 120 h | Research profit ×1.3 |
| `research.soil.living_soil_6` | Living Soil VI (0.4) | Living Soil V | 36,000 | 120 h | Research profit ×1.3 |

All five Soil Science projects together are ×7.59 profit and all six Living Soil projects ×4.83, so research profit is ×36.6 in all. All four Crop Rotations are ×2.42 speed. Living Soil I needs only Soil Science III, so the long chain can start in week 3 while Soil Science IV and V are still being saved for.

### 6.3 Botany

| `id` | `name` | `requires` | Cost | Time | Effect |
|---|---|---|---|---|---|
| `research.botany.bee_hotel` | Bee Hotel | | 200 | 30 min | Busy Bees start to visit. Unlocks Pollen |
| `research.botany.pollination_bench` | Pollination Bench | Bee Hotel, world 2 reached | 500 | 2 h | Unlocks cross-pollination |
| `research.botany.tidy_hive` | Tidy Hive | Bee Hotel | 2,000 | 4 h | Copies of max-level cards give +50% Pollen |
| `research.botany.greenhouse_glass_1` | Greenhouse Glass I | | 1,200 | 3 h | `plant.power` +10% |
| `research.botany.greenhouse_glass_2` | Greenhouse Glass II | Greenhouse Glass I | 10,000 | 12 h | `plant.power` +10% |
| `research.botany.greenhouse_glass_3` | Greenhouse Glass III | Greenhouse Glass II | 70,000 | 36 h | `plant.power` +10% |
| `research.botany.mutation_chamber` | Mutation Chamber | Pollination Bench, world 3 reached | 5,000 | 12 h | Unlocks mutation and Exotic plants |
| `research.botany.second_bench` | Second Bench | Pollination Bench | 6,000 | 8 h | Two bench jobs at once |
| `research.botany.fast_pollination` | Fast Pollination | Second Bench | 15,000 | 16 h | `bench.speed` +25% |
| `research.botany.perfect_beds` | Perfect Beds | Greenhouse Glass I | 30,000 | 24 h | `plant.affinity` +0.25 |

### 6.4 People and Luck

| `id` | `name` | `requires` | Cost | Time | Effect |
|---|---|---|---|---|---|
| `research.people.staff_room_1` | Staff Room I | | 400 | 1 h | `manager.cooldown` -10% |
| `research.people.staff_room_2` | Staff Room II | Staff Room I | 6,000 | 8 h | `manager.cooldown` -10% |
| `research.people.training_day_1` | Training Day I | | 1,500 | 3 h | `manager.power` +10% |
| `research.people.training_day_2` | Training Day II | Training Day I | 15,000 | 16 h | `manager.power` +10% |
| `research.people.training_day_3` | Training Day III | Training Day II | 90,000 | 40 h | `manager.power` +10% |
| `research.people.training_day_4` | Training Day IV (0.4) | Training Day III | 15,000 | 96 h | `manager.power` +25% |
| `research.people.lucky_clover_1` | Lucky Clover Patch I | | 2,000 | 4 h | `chest.luck` +10% |
| `research.people.lucky_clover_2` | Lucky Clover Patch II | Lucky Clover Patch I | 25,000 | 24 h | `chest.luck` +10% |
| `research.people.sprout_lure` | Sprout Lure | | 700 | 90 min | `visitor.interval` -10% |
| `research.people.field_journal_1` | Field Journal I | | 1,000 | 2 h | `insight.gain` +25% |
| `research.people.field_journal_2` | Field Journal II | Field Journal I | 10,000 | 12 h | `insight.gain` +25% |

Suggested first day: Sturdy Baskets, Soil Science I, Whole-Tower Button, Bee Hotel, Crop Rotation I, Staff Room I.

## 7. Compost Shop

Rules are in GDD 12.1. Paid in Compost. Every item has a level cap. The whole shop resets at a Harvest Festival. `n` is the level being bought, starting at 1. Costs are rounded up.

| `id` | `name` | Effect per level | Max level | Cost of level `n` | Cost of all levels |
|---|---|---|---|---|---|
| `shop.compost.rich_soil` | Rich Soil | Profit ×1.25, in every world | 10 | `20 x 1.8^(n-1)` | about 8,900 |
| `shop.compost.head_start` | Head Start | Every run starts with `1e3, 1e5, 1e7, 1e9, 1e11, 1e13 x D` of that world's currency. This money is not counted in lifetime earnings | 6 | `10 x 5^(n-1)` | 39,060 |
| `shop.compost.loyal_staff` | Loyal Staff | Floors 1 to `2n` keep their managers through a Replant, with no fee | 5 | `15 x 6^(n-1)` | 23,325 |
| `shop.compost.market_day` | Market Day | `hire.fee` -20% | 4 | `25 x 3^(n-1)` | 1,000 |
| `shop.compost.green_deal` | Green Deal | Level cost ×0.96 | 10 | `30 x 2.5^(n-1)` | about 190,700 |
| `shop.compost.overnight_growth` | Overnight Growth | `offline.efficiency` +3 points | 6 | `40 x 3^(n-1)` | 14,560 |
| `shop.compost.sprout_whistle` | Sprout Whistle | `visitor.interval` -4% | 5 | `100 x 4^(n-1)` | 34,100 |
| `shop.compost.compost_tea` | Compost Tea | `compost.gain` +10% | 10 | `50 x 3^(n-1)` | 1,476,200 |

Rich Soil is the only item that multiplies profit, and its ten levels are ×9.31 in total. The first Replant (440 Compost) buys Rich Soil four times. The whole shop costs about 1.8 million Compost, which is less than one era produces, so every era ends with a full shop. After the first Harvest Festival a Buy All button buys every level the player can afford, cheapest first.

## 8. Ribbon Shop

Rules are in GDD 12.2. Paid in Ribbons. Nothing here ever resets.

| `id` | `name` | Effect | Levels | Cost |
|---|---|---|---|---|
| `shop.ribbon.golden_hour` | Golden Hour | Profit ×2 per level, in every world | 5 | 3, 10, 40, 150, 600 |
| `shop.ribbon.auto_gardener` | Auto-Gardener | Auto-buy. Every floor gets a switch, and switches start on. While the game is open, a floor whose switch is on buys its next level whenever that costs at most 10% (`AUTO_BUY_SHARE`) of the currency in hand. A floor that is not open yet opens itself on the same rule. Floor 1's manager in each world stays hired through every Replant and Festival, with no fee, while floor 1's switch is on (a world locked again by a Festival gets it back, free, when its ticket is bought again). So no world goes dead after a reset | 1 | 4 |
| `shop.ribbon.deed_mitten` | Deed: Mount Mitten | World 4 can be reached | 1 | 8 |
| `shop.ribbon.festival_fireworks` | Festival Fireworks | `spurt.duration` +2 s per level | 3 | 10, 50, 250 |
| `shop.ribbon.second_desk` | Second Research Desk | Two research projects run at once | 1 | 15 |
| `shop.ribbon.master_composter` | Master Composter | Each Compost gives +0.5 points more profit per level (2% becomes 4.5% at level 5) | 5 | 5, 20, 80, 320, 1,280 |
| `shop.ribbon.heirloom_shelf_3` | Heirloom Shelf III | Heirloom slot 5 | 1 | 25 |
| `shop.ribbon.third_planter` | Third Planter | Every floor gets a third planter | 1 | 30 |
| `shop.ribbon.deluxe_basket` | Deluxe Basket | The Morning Basket holds Copper Chests | 1 | 40 |
| `shop.ribbon.deed_moon` | Deed: The Moon | World 5 can be reached | 1 | 60 |
| `shop.ribbon.auto_replant` | Auto-Replant | A rule for each world: Replant by itself when pending Compost reaches a multiple of this era's Compost that the player sets (default 1). Works while the game is open | 1 | 100 |
| `shop.ribbon.heirloom_shelf_4` | Heirloom Shelf IV | Heirloom slot 6 | 1 | 250 |
| `shop.ribbon.deed_nebula` | Deed: Nebula Nursery | World 6 can be reached | 1 | 250 |
| `shop.ribbon.blue_polish` | Blue Ribbon Polish | Each Ribbon gives +0.2 points more profit per level (10% becomes 10.2%, 10.4% and so on) | endless | `50 x 1.15^(n-1)`, rounded up |

Everything except Blue Ribbon Polish costs 3,600 Ribbons. The first Festival's 8 Ribbons buy either the deed to Mount Mitten, or Golden Hour and the Auto-Gardener.

## 9. Story quests

Rules are in GDD 11.1. One step is active at a time. A step whose goal is already met completes at once. "Unlocks" is the feature the step introduces.

| # | `id` | `name` | Goal | Reward | Unlocks | XP |
|---|---|---|---|---|---|---|
| 1 | `quest.story.first_harvest` | First Harvest | Harvest the Windowsill Planter | | Floor levels | 30 |
| 2 | `quest.story.grow_up` | Grow Up | Windowsill Planter at level 10 | | | 30 |
| 3 | `quest.story.proper_milestone` | A Proper Milestone | Any floor at level 25 | | Milestones panel, buy modes | 30 |
| 4 | `quest.story.fresh_air` | Fresh Air | Open floor 2 | | | 30 |
| 5 | `quest.story.flagship_crop` | The Flagship Crop | Open floor 3, the Backyard Hemp Patch | | | 30 |
| 6 | `quest.story.helping_hands` | Helping Hands | Hold 1,000 Coins at once | Welcome Chest | Chests, managers | 50 |
| 7 | `quest.story.youre_hired` | You're Hired | Hire a manager | 5 Gems | Tap bonus, Combo | 50 |
| 8 | `quest.story.moving_up` | Moving Up | Open floor 4 | | Quests panel, daily quests | 75 |
| 9 | `quest.story.full_swing` | Full Swing | Fill the Combo meter | 5 Gems | | 75 |
| 10 | `quest.story.under_glass` | Under Glass | Open floor 5 | First seed packet | Plants, planters | 100 |
| 11 | `quest.story.right_plant` | Right Plant, Right Place | Plant a card on a floor that favours its family | 10 Gems | | 100 |
| 12 | `quest.story.what_a_whopper` | What a Whopper | Land 5 Bumper taps | Wooden Crate | | 150 |
| 13 | `quest.story.to_market` | To Market | Open floor 6 | | Garden Visitors | 150 |
| 14 | `quest.story.catch` | Catch! | Catch a Golden Sprout | 10 Gems | | 150 |
| 15 | `quest.story.tea_time` | Tea Time | Open floor 7 | 10 Gems | | 200 |
| 16 | `quest.story.level_best` | Level Best | Level up any card | Copper Chest | | 200 |
| 17 | `quest.story.know_the_ropes` | Know the Ropes | Open floor 8, the Ropewalk | | Growth Spurt | 250 |
| 18 | `quest.story.spurt` | Spurt! | Trigger a Growth Spurt | 15 Gems | | 250 |
| 19 | `quest.story.squeaky_clean` | Squeaky Clean | Open floor 9 | Wooden Crate | Achievements, Codex | 300 |
| 20 | `quest.story.head_office` | Head Office | Open floor 10 | Silver Chest | The Replant button, with a bar that fills toward 440 Compost pending | 400 |
| 21 | `quest.story.even_growth` | Even Growth | Every World 1 floor at level 25 | 20 Gems | | 400 |
| 22 | `quest.story.turn_the_heap` | Turn the Heap | Replant for the first time (the button is live at 440 Compost pending) | Silver Chest | Compost Shop, Research | 500 |
| 23 | `quest.story.richer_soil` | Richer Soil | Buy Rich Soil | 10 Gems | | 300 |
| 24 | `quest.story.bright_idea` | Bright Idea | Start a research project | 10 Gems | | 300 |
| 25 | `quest.story.back_again` | Back Again | Open floor 10 again | Copper Chest | | 300 |
| 26 | `quest.story.third_time` | Third Time's a Charm | Replant 3 times | Sprouting Trowel | Heirlooms | 500 |
| 27 | `quest.story.century` | Century | Every World 1 floor at level 100 | Copper Chest, 20 Gems | | 500 |
| 28 | `quest.story.all_aboard` | All Aboard | Hold 1e18 Coins at once | Copper Chest | | 750 |
| 29 | `quest.story.big_city_lights` | Big City Lights | Buy the ticket to Loomington | Golden Chest | World 2, Customers, World Mastery, weekly quests | 1,000 |
| 30 | `quest.story.service_with_a_smile` | Service With a Smile | Serve 20 customers | 20 Gems | | 500 |
| 31 | `quest.story.mill_town` | Mill Town | Open the Canvas Weaving Mill | Silver Chest | | 600 |
| 32 | `quest.story.busy_bees` | Busy Bees | Finish Bee Hotel and catch a Busy Bee | 50 Pollen | | 600 |
| 33 | `quest.story.matchmaker` | Matchmaker | Make a hybrid | 30 Gems | | 1,000 |
| 34 | `quest.story.city_slicker` | City Slicker | Open floor 8 in Loomington | Golden Chest | | 1,000 |
| 35 | `quest.story.rising_star` | Rising Star | Earn a Mastery star in two worlds | 30 Gems | | 1,000 |
| 36 | `quest.story.island_time` | Island Time | Buy the ticket to Papaya Cay | Golden Chest | World 3, Weather | 1,500 |
| 37 | `quest.story.rain_or_shine` | Rain or Shine | In Papaya Cay, have plants from all three weather groups planted at once | 40 Gems | | 1,000 |
| 38 | `quest.story.festival_season` | Festival Season | Have 8 Ribbons pending | Silver Chest | Harvest Festival | 1,500 |
| 39 | `quest.story.blue_ribbon` | Blue Ribbon | Hold a Harvest Festival | 50 Gems (the Festival itself gives a Crystal Chest and the Heirloom Pick) | Ribbon Shop | 2,500 |
| 40 | `quest.story.snow_day` | Snow Day | Arrive in Mount Mitten | Golden Chest | World 4, Hearth Heat | 2,500 |
| 41 | `quest.story.something_strange` | Something Strange in the Greenhouse | Grow an Exotic plant | 100 Gems | | 2,500 |
| 42 | `quest.story.local_legend` | Local Legend | Earn 5 Mastery stars in one world | 50 Gems (the star itself gives a copy of that world's Head) | | 3,000 |
| 43 | `quest.story.small_step` | Small Step | Arrive on the Moon | Crystal Chest | World 5, Floating Harvests | 4,000 |
| 44 | `quest.story.among_the_stars` | Among the Stars | Arrive in the Nebula Nursery | Starlight Chest | World 6, Orbital Sunrise | 5,000 |

Steps 43 and 44 are `later`. With a four-world launch the fixed chain ends at step 42. Steps 40 to 42 are in the order an active player meets them: Mount Mitten around day 7 or 8, and the first Exotic plant and the fifth Mastery star both around day 11. Step 35 asks for stars in two worlds because version 0.4's Mastery levels give a second star in one world only around day 5, after Papaya Cay. The skill tree has no story step. It opens at player level 6.

**Chapter goals.** After the last fixed step, every unlocked world shows a repeating goal: every floor in that world at level `100 x n`, for `n = 1, 2, 3` and so on. Each is counted once, on the best level ever reached. Each gives a Silver Chest and 2,000 XP.

## 10. Daily and weekly quests

Rules and rewards are in GDD 11.2 and 11.3. A quest is left out of the draw while the feature in `needs` is locked.

### 10.1 Daily pool

Three are drawn each day without repeats. Each is sized for about ten minutes of mixed play.

| `id` | Goal | `needs` |
|---|---|---|
| `quest.daily.taps` | Tap 1,500 times | tap bonus |
| `quest.daily.bumpers` | Land 40 Bumper taps | Bumper taps |
| `quest.daily.combo` | Hold a full Combo for 60 s in total | Combo |
| `quest.daily.visitors` | Catch 5 Garden Visitors | Garden Visitors |
| `quest.daily.spurts` | Trigger 3 Growth Spurts | Growth Spurt |
| `quest.daily.levels` | Buy 500 floor levels | |
| `quest.daily.milestones` | Reach 15 floor milestones | milestones panel |
| `quest.daily.hires` | Hire 8 managers | managers |
| `quest.daily.chests` | Open 3 chests | chests |
| `quest.daily.cards` | Collect 15 cards | chests |
| `quest.daily.abilities` | Use 5 manager or heirloom abilities | an ability owned |
| `quest.daily.replant` | Replant once | Replant |
| `quest.daily.offline` | Collect offline earnings worth 30 minutes or more | offline earnings screen |
| `quest.daily.customers` | Serve 40 customers | world 2 |
| `quest.daily.bees` | Catch 3 Busy Bees | Bee Hotel |

### 10.2 Weekly pool

Five are drawn each Monday.

| `id` | Goal | `needs` |
|---|---|---|
| `quest.weekly.replants` | Replant 10 times | |
| `quest.weekly.chests` | Open 25 chests | |
| `quest.weekly.cards` | Collect 300 cards | |
| `quest.weekly.milestones` | Reach 150 floor milestones | |
| `quest.weekly.records` | Set 10 new best-ever floor milestones | |
| `quest.weekly.visitors` | Catch 40 Garden Visitors | |
| `quest.weekly.taps` | Tap 25,000 times | |
| `quest.weekly.dailies` | Finish 15 daily quests | |
| `quest.weekly.research` | Finish 3 research projects | at least 3 projects left |
| `quest.weekly.pollination` | Finish a bench job | Pollination Bench |

## 11. Achievements

Rules are in GDD 11.4. Twenty families with five tiers each. Ids are `ach.<family>.<tier>`, for example `ach.taps.3`. Every achievement gives +1% profit, Gems (5, 10, 15, 25, 50 by tier) and XP (100, 200, 400, 750, 1,500 by tier). All counts are lifetime totals that never reset. Progress is counted from the first second of play, so several pop at once when the panel unlocks.

| Family | Counts | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|---|---|---|---|---|---|---|
| `taps` | Counted taps | 1,000 | 10,000 | 100,000 | 500,000 | 3,000,000 |
| `bumpers` | Bumper taps | 50 | 500 | 5,000 | 50,000 | 300,000 |
| `combo` | Seconds at full Combo | 60 | 600 | 6,000 | 60,000 | 300,000 |
| `spurts` | Growth Spurts | 5 | 50 | 250 | 1,000 | 5,000 |
| `visitors` | Garden Visitors caught | 10 | 100 | 500 | 2,500 | 10,000 |
| `levels` | Floor levels bought | 500 | 5,000 | 25,000 | 100,000 | 500,000 |
| `milestones` | Floor milestones reached | 25 | 250 | 1,000 | 5,000 | 20,000 |
| `floors` | Floors opened | 10 | 100 | 500 | 2,500 | 10,000 |
| `managers` | Different managers hired | 5 | 10 | 18 | 26 | 34 |
| `plants` | Plants owned | 5 | 10 | 20 | 28 | 36 |
| `heirlooms` | Heirlooms owned | 2 | 6 | 10 | 14 | 18 |
| `card_levels` | Card level-ups | 5 | 25 | 100 | 250 | 500 |
| `chests` | Chests opened | 10 | 50 | 250 | 1,000 | 5,000 |
| `replants` | Replants | 1 | 10 | 50 | 250 | 1,000 |
| `compost` | Compost earned, all time | 100 | 1e4 | 1e6 | 1e9 | 1e12 |
| `festivals` | Harvest Festivals | 1 | 3 | 10 | 25 | 50 |
| `stars` | World Mastery stars | 3 | 8 | 15 | 22 | 30 |
| `research` | Research projects finished | 3 | 10 | 20 | 30 | 40 |
| `quests` | Daily and weekly quests finished | 10 | 50 | 200 | 500 | 1,500 |
| `offline` | Hours of offline earnings collected | 1 | 24 | 100 | 500 | 2,000 |

All 100 can be earned with the four launch worlds. The top `stars` tier asks for 30 of the 40 stars in those worlds, which the balance simulator's active player reaches around day 32 (GDD 14.5). When worlds 5 and 6 ship, a sixth tier can be added to `managers`, `plants` and `stars`.

## 12. Visitors and Codex

### 12.1 Visitor rows

Rules and weights are in GDD 6.6.

| `id` | `name` | Outcome | Art |
|---|---|---|---|
| `visitor.sprout.windfall` | Golden Sprout | 60 s of this world's steady income | B29 sets the feel |
| `visitor.sprout.sunbeam` | Sunbeam Sprout | A ×5 boost in this world for 30 s | new |
| `visitor.sprout.storm` | Tap Storm Sprout | A ×10 tap boost for 15 s | new |
| `visitor.dewdrop` | Dewdrop | 2 Gems | new |
| `visitor.mystery_crate` | Mystery Crate | 1 Wooden Crate | new |
| `visitor.busy_bee` | Busy Bee | 5 Pollen | new |

The three Golden Sprouts look alike from a distance and differ by a small badge, so the player learns them by catching them. Customers in Loomington are a twist, not visitors. Their art exists in B28.

### 12.2 Codex entries

| Kind | Entries in total | At launch |
|---|---|---|
| Floors | 50 | 34 |
| Managers | 50 | 34 |
| Plants | 38 | 36 |
| Heirlooms | 18 | 18 |
| Visitors | 6 | 6 |
| Worlds | 6 | 4 |
| **Total** | **168** | **132** |

Each entry gives 5 Gems once and +0.25% profit forever (GDD 11.5).

## 13. Launch counts and art still to make

| Content | In the design | Needed at launch | Already pictured | New for launch |
|---|---|---|---|---|
| Floor rooms | 50 | 34 | 10 (B4 v2 set, two of them re-dressed for hemp wording; the Spice Kitchen moves to World 2) | 24 |
| Managers | 50 | 34 | 12 (B5, B21) | 22 |
| Plants | 38 | 36 | 7 (Garden Mint, Sweet Basil, Field Lavender, Ember Basil, Thunder Rosemary, Frosted Mint, Crystal Sage) | 29 |
| Heirlooms | 18 | 18 | 12 (B11, one of them redrawn) | 6 |
| Visitors | 6 | 6 | 0 | 6 |
| World backgrounds | 6 | 4 | 3 (B3 and B26, B17, B18) | 1 (Mount Mitten) |
| Currency icons | 13 | 11 | 5 (B12: Coins, Notes, Gems, Compost, Ribbons) | 6 (Shells, Snowmarks, Insight, Pollen, Skill Points, Fair Tickets) |
| Story characters | 3 | 3 | 0 | 3 (Pip, Baron Fauxliage, and Mayor Thyme, who hosts the Harvest Festival) |

Two more plants are already pictured for the later worlds: Moonlit Lavender and Starlight Chamomile. The Moon's background (B27) exists too.
