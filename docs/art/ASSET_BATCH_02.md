# Production Asset Batch 2: Finish World 1

Part of the [Style Bible](STYLE_BIBLE.md). Batch revision: **1**. Style suffix version: **v1**. Hemp guards version: **v1**. Written by `tools/build_asset_batch_02.py`, which copies the suffix and guards word for word from section 21 of the bible. Never edit this file by hand.

**23 images in 7 rounds.** They finish World 1: the six visitors, six currency icons, every World 1 herb card and the last three herb growth charts, the soap workshop and the walls of the top two floors, Pip, and moving workers for every floor. The worker sheets now carry two workers each, which is why the batch is shorter than planned.

**Round 7 was added later** (2026-11-26): the rarity reveal kit, so that opening something rare builds up more the rarer it is. Rounds 1 to 6 are unchanged.

The manager images are not in this batch. They wait until the new manager list (one manager per floor) is approved, then follow as a short round of their own.

Names follow the game design document, which is still in review. Each prompt describes a look, not a name, so a rename does not spoil an image. The prompt's **Name flag** says what could still change.

## How to do it on your phone

1. Each round is **one new ChatGPT chat**.
2. At the start of a round, **attach that round's two reference images** from your expansion pack (listed below) and paste the round's first prompt in the same message.
3. Then paste the round's other prompts **one at a time, in the same chat**. You do not need to attach the reference images again. **Rounds 4 to 7 are different:** some of their prompts need one or two more of your pictures, attached in the same message as that prompt. They are listed in the table "Extra pictures" below and in bold at the top of each prompt.
4. Each prompt is one grey box. Copy the whole box, change nothing.
5. New in this batch: the end of every prompt asks ChatGPT for the zip it made on its own last time (true-size parts and a slices file). **Upload the zip as well as the picture.** If ChatGPT makes no zip, the picture alone is fine.
6. Save each picture as it comes: **PNG, original size**. No screenshots, no JPG, no cropping or resizing.
7. Upload the results to the project, in number order, or tell me which number each one is.
8. If a result looks wrong, use the matching sentence from "If a result is off" near the bottom. If it is still off after two tries, upload it anyway and tell me. A lot can be fixed in clean-up.

### The reference sets

| Set | For | Attach these two images |
|---|---|---|
| **A** | Scenes | `B4_floor04_garden_shed_nursery_v2.png` and `B4_floor_frame_shell.png` |
| **B** | People | `B22_character_animation_sheet.png` and `B21_manager_lineup_2.png` |
| **C** | Plants and items | `B24_plant_growth_stages.png` and `B23_exotic_plants.png` |
| **D** | Chests and cards | `b01_11_chest_opening_frames.png` and `B25_card_layout_mockup.png` |

Sets A to C are from your expansion pack, the same as in Batch 1. Set D is one picture you made yourself in Batch 1 (`b01_11_chest_opening_frames.png`, your chest animation sheet) and one from the expansion pack. A copy of both is in the project files, in `art/batch02/attach_with_prompts/`.

### Extra pictures for rounds 4 to 7

The worker prompts draw people who are already in your room pictures, so each needs that picture attached in the same message as the prompt. Prompt 23 needs your tap-effects picture. The `B4_floor..._v2` files are in your expansion pack. The `b01_15` file is the ropewalk picture you made in Batch 1. A copy of every one of them is in the project files, in the folder `art/batch02/attach_with_prompts/`. Use the `_v2` files, not the older painted room pictures, which show other people.

| Prompt | Also attach |
|---|---|
| 10 | `B4_floor04_garden_shed_nursery_v2.png` |
| 11 | `B4_floor05_greenhouse_v2.png` |
| 12 | `B4_floor06_farmers_market_v2.png` |
| 13 | `B4_floor07_tea_house_v2.png` |
| 14 | `b01_15_floor08_ropewalk_twine_shop.png` |
| 15 | `B4_floor09_essence_lab_v2.png` |
| 16 | `B4_floor10_herb_empire_hq_v2.png` and `B4_floor01_windowsill_planter_v2.png` |
| 17 | `B4_floor02_balcony_pots_v2.png` and `B4_floor03_backyard_patch_v2.png` |
| 23 | `B29_tap_feedback_vfx.png` |

### The rounds

| Round | Theme | Attach | Prompts | Priority |
|---|---|---|---|---|
| 1 | Visitors and currency icons | Set C | 1, 2 | Needed first |
| 2 | Herbs | Set C | 3, 4, 5, 6 | Needed first |
| 3 | The top two floors | Set A | 7, 8 | Needed next |
| 4 | Pip and the first two-worker sheet | Set B plus extra pictures | 9, 10 | Needed first |
| 5 | Workers of floors 5 to 7 | Set B plus extra pictures | 11, 12, 13 | Needed next |
| 6 | Workers of floors 8 to 10 and the second workers of floors 1 to 3 | Set B plus extra pictures | 14, 15, 16, 17 | Needed next |
| 7 | The rarity reveal kit | Set D plus extra pictures | 18, 19, 20, 21, 22, 23 | Needed for the chest opening |

### All prompts at a glance

| # | Image | File name | Shape | Transparent |
|---|---|---|---|---|
| 1 | Visitors: three Golden Sprouts, Dewdrop, Mystery Crate, Busy Bee | `b02_01_visitors.png` | landscape 4:3 | Yes |
| 2 | Currency icons: Insight, Pollen, Skill Points, Shells, Snowmarks, Fair Tickets | `b02_02_currency_icons.png` | landscape 3:2 | Yes |
| 3 | Herb card art: four Common herbs | `b02_03_herb_cards_common.png` | square 1:1 | Yes |
| 4 | Herb card art: four Uncommon herbs | `b02_04_herb_cards_uncommon.png` | square 1:1 | Yes |
| 5 | Herb card art: five more World 1 herbs | `b02_05_herb_cards_rare.png` | landscape 3:2 | Yes |
| 6 | Herb growth stages: thyme, sage, chamomile | `b02_06_herb_growth_stages.png` | landscape 4:3 | Yes |
| 7 | Soap and Scent Workshop: props | `b02_07_floor09_soap_workshop_props.png` | very wide landscape 3:1 | Yes |
| 8 | Back walls: soap workshop and tower headquarters | `b02_08_backwalls_soap_hq.png` | landscape 3:2 | Around the panels only |
| 9 | Pip, the seedling guide: poses and expressions | `b02_09_pip_guide.png` | square 1:1 | Yes |
| 10 | Workers: Garden Shed Nursery | `b02_10_workers_floor04_garden_shed.png` | landscape 3:2 | Yes |
| 11 | Workers: Glass Greenhouse | `b02_11_workers_floor05_greenhouse.png` | landscape 3:2 | Yes |
| 12 | Workers: Farmers' Market Stall | `b02_12_workers_floor06_market.png` | landscape 3:2 | Yes |
| 13 | Workers: Tea House | `b02_13_workers_floor07_tea_house.png` | landscape 3:2 | Yes |
| 14 | Workers: Ropewalk and Twine Shop | `b02_14_workers_floor08_ropewalk.png` | landscape 3:2 | Yes |
| 15 | Workers: Soap and Scent Workshop | `b02_15_workers_floor09_soap_workshop.png` | landscape 3:2 | Yes |
| 16 | Workers: Sprout Tower HQ and Windowsill Planter | `b02_16_workers_floor10_floor01.png` | landscape 3:2 | Yes |
| 17 | Workers: Balcony Boxes and Backyard Hemp Patch | `b02_17_workers_floor02_floor03.png` | landscape 3:2 | Yes |
| 18 | Rarity emblems: one badge per rarity | `b02_18_rarity_emblems.png` | landscape 3:2 | Yes |
| 19 | Chests: Copper Chest and Silver Chest | `b02_19_chests_copper_silver.png` | landscape 16:9 | Yes |
| 20 | Chests: Crystal Chest and Starlight Chest | `b02_20_chests_crystal_starlight.png` | landscape 16:9 | Yes |
| 21 | Card frames: Common, Uncommon, Rare | `b02_21_card_frames_common_rare.png` | landscape 3:2 | Yes |
| 22 | Card frames: Epic, Legendary, Exotic | `b02_22_card_frames_epic_exotic.png` | landscape 3:2 | Yes |
| 23 | Reveal effects: one burst per rarity | `b02_23_reveal_effects.png` | portrait 2:3 | Yes |

---

## Round 1: Visitors and currency icons

**New chat. Attach Set C:** `B24_plant_growth_stages.png` and `B23_exotic_plants.png`.

### Prompt 1: Visitors: three Golden Sprouts, Dewdrop, Mystery Crate, Busy Bee

- **File name:** `b02_01_visitors.png`
- **Shape and size:** landscape 4:3, about 1448×1086 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The six things that drift across a floor for the player to catch, from floor 6 on. The three Golden Sprouts look alike on purpose, so players learn them by catching them; only the badge differs.
- **Parts we cut from it:** 12 frames: 6 visitors × 2 frames, each about 32×32 art pixels. The three badges are also cut out on their own.
- **Name flag:** Visitor names are from the game design document, still in review. Each look is described, not named.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

An animation sheet of six small flying visitors for a cozy pixel-art idle game about a herb-growing tower. Each visitor is shown in two frames side by side, so the sheet has three rows of four cells: a visitor, its second frame, the next visitor, its second frame. Evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. The two frames of one visitor are the same size and sit in the same place in their cells, so they line up as a two-frame loop. Each visitor is small, round and chunky, about as big as a coin in the game, with one bold simple shape.

Row 1:
1 and 2. Golden Sprout: a plump golden seed with a small two-leaf golden sprout growing from its top, floating in the air. Its two leaves are raised like little wings in frame 1 and lowered in frame 2. On the front of the seed is a small round cream badge showing a small gold coin.
3 and 4. Sunbeam Sprout: exactly the same golden seed and sprout, the same size and pose, but its badge shows a small orange sun.

Row 2:
5 and 6. Tap Storm Sprout: exactly the same golden seed and sprout again, but its badge shows a small lilac cloud with a yellow zigzag under it.
7 and 8. Dewdrop: a plump round water drop in clear light blue with a small green faceted gem inside it, floating on a small curled green leaf. In frame 2 the drop is squashed a little wider and lower, like a wobble.

Row 3:
9 and 10. Mystery Crate: a small wooden crate tied with a lilac ribbon bow, hanging from a fluffy white dandelion-seed parachute. In frame 2 it swings a little to the right.
11 and 12. Busy Bee: a chubby round honeybee with golden-yellow and dark brown stripes, two small round dot eyes, small clear wings and a tiny ball of yellow pollen on one leg. Wings up in frame 1, down in frame 2.

From a distance the three sprouts must look the same. Only their badges differ. No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 4:3.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 2: Currency icons: Insight, Pollen, Skill Points, Shells, Snowmarks, Fair Tickets

- **File name:** `b02_02_currency_icons.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The six currencies that have no icon yet. Your B12 sheet covers Coins, Notes, Gems, Compost and Ribbons. Shells, Snowmarks and Fair Tickets come later in the game, but drawing them now in the same chat keeps all eleven currencies alike and saves three images in later batches.
- **Parts we cut from it:** 6 icons at 48×48 art pixels. The 32, 24 and 16 pixel sizes are redrawn by hand.
- **Name flag:** Currency names are from the game design document, still in review. Insight must stay a lightbulb with a sprout, so nothing reads as a laboratory.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Six currency icons for a cozy pixel-art idle game, in two rows of three, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Each icon is one bold, simple object that reads at a glance at a small size, drawn like a game coin or token: chunky, turned a little toward the viewer, with a golden-yellow highlight on its upper left.

Row 1:
1. A round glass lightbulb on a short brass screw base, with a small two-leaf green sprout growing inside the glass. The inside of the bulb is a warm pale gold.
2. A fluffy round ball of golden-yellow pollen, like a tiny pompom, sitting in the middle of a small five-petal cream flower.
3. An upright lavender-purple seed, shaped like an acorn without its cap and cut with flat gem facets, with a tiny green two-leaf sprout on top.

Row 2:
4. A pink and cream scallop seashell with ridged fan lines and a tiny pearl at its hinge.
5. A round pale blue token stamped with a white six-point snowflake. Its rim is knitted like the red wool cuff of a mitten.
6. A cream paper ticket with zigzag torn ends, a red stripe along each long edge and a small two-leaf sprout stamped in its middle. No writing on it.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 2: Herbs

**New chat. Attach Set C:** `B24_plant_growth_stages.png` and `B23_exotic_plants.png`.

### Prompt 3: Herb card art: four Common herbs

- **File name:** `b02_03_herb_cards_common.png`
- **Shape and size:** square 1:1, about 1254×1254 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The pictures for the Common herb cards Kitchen Rosemary, Garden Sage, Meadow Chamomile and Garden Thyme, which a new player meets in the first hour. They sit next to your B9 mint, basil and lavender cards.
- **Parts we cut from it:** 4 card pictures, each brought to about 108×100 art pixels.
- **Name flag:** Herb names are from the game design document, still in review. Each look is described, not named.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Four hero plants for collectible cards in a cozy pixel-art farming game, in two rows of two, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Each is one whole herb plant growing in its own planter, seen from the front and slightly above, like the attached exotic plants reference. The plant is the hero and fills the upper two thirds of its cell; the planter is the lower third. Every plant has its own clear silhouette. These are everyday garden herbs, so the planters are plain and homely.

Row 1:
1. Rosemary: upright woody stems covered in short grey-green needle leaves, like little bottle brushes, in a small cream enamel kitchen planter with a dark blue rim.
2. Sage: a soft mound of long, oval, grey-green leaves with a slightly fuzzy look, in a plain terracotta planter with a small chip in its rim.

Row 2:
3. Chamomile: feathery bright green leaves and thin stems topped with small white daisies with yellow centres, in a round woven wicker basket planter.
4. Thyme: a low, wide cushion of tiny round green leaves on thin woody stems, dotted with tiny pink-lilac flowers, in a wide shallow terracotta bowl planter.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: square 1:1.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 4: Herb card art: four Uncommon herbs

- **File name:** `b02_04_herb_cards_uncommon.png`
- **Shape and size:** square 1:1, about 1254×1254 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The pictures for the Uncommon herb cards Peppermint, Lemon Basil, Trailing Rosemary and Butterfly Lavender.
- **Parts we cut from it:** 4 card pictures, each brought to about 108×100 art pixels.
- **Name flag:** Herb names are from the game design document, still in review. Each look is described, not named.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Four hero plants for collectible cards in a cozy pixel-art farming game, in two rows of two, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Each is one whole herb plant growing in its own planter, seen from the front and slightly above, like the attached exotic plants reference. The plant is the hero and fills the upper two thirds of its cell; the planter is the lower third. Every plant has its own clear silhouette. These are a little special, so the planters are glazed and painted.

Row 1:
1. Peppermint: a round bush of broad toothed leaves in a deep cool green, with purple-tinged stems, in a teal glazed planter with a white swirl painted on it.
2. Lemon Basil: a glossy dome of pointed oval leaves in a bright yellow-green, in a sunny yellow glazed planter with a small painted lemon on its front.

Row 2:
3. Trailing Rosemary: needle-leaf stems that spill over the rim and hang down the sides, with tiny pale blue flowers, in a terracotta planter standing on a short three-legged wooden stand.
4. Butterfly Lavender: grey-green leaves and plump purple flower heads, each topped with two small pale pink petals like tiny butterfly wings, in a lilac glazed planter. One small white butterfly rests on a flower.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: square 1:1.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 5: Herb card art: five more World 1 herbs

- **File name:** `b02_05_herb_cards_rare.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The pictures for Pineapple Sage, Double Chamomile, Lemon Thyme, Chocolate Mint and Purple Basil, the rest of the World 1 herb cards.
- **Parts we cut from it:** 5 card pictures, each brought to about 108×100 art pixels.
- **Name flag:** Herb names and rarities are from the game design document, still in review. Each look is described, not named.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Five hero plants for collectible cards in a cozy pixel-art farming game, in two rows: three in the top row and two in the bottom row, centred, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Each is one whole herb plant growing in its own planter, seen from the front and slightly above, like the attached exotic plants reference. The plant is the hero and fills the upper two thirds of its cell; the planter is the lower third. Every plant has its own clear silhouette. These are prized herbs, so the planters are decorated and some have a thin gold trim.

Row 1:
1. Pineapple Sage: soft pointed green leaves and tall spikes of bright red tube-shaped flowers, in a golden-yellow planter with a criss-cross pattern like the skin of a pineapple.
2. Double Chamomile: feathery green leaves and round fluffy white pompom flowers, full of petals, in a cream planter with a blue ribbon tied around it.
3. Lemon Thyme: a low, wide cushion of tiny round leaves that are green in the middle and lemon yellow at the edges, in a wide shallow pale yellow bowl planter.

Row 2:
4. Chocolate Mint: a round bush of broad toothed dark green leaves with dark brown-purple stems and veins, in a chocolate-brown glazed planter with a cream glaze dripping over its rim like icing.
5. Purple Basil: a glossy dome of big cupped dark purple leaves with a few small pink flower spikes, in a lavender-purple planter with a thin gold rim.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 6: Herb growth stages: thyme, sage, chamomile

- **File name:** `b02_06_herb_growth_stages.png`
- **Shape and size:** landscape 4:3, about 1448×1086 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Growth stages for the last three herb families. With your B24 mint and Batch 1's basil, rosemary and lavender, every herb family in World 1 can now grow on a floor.
- **Parts we cut from it:** 15 sprites: 3 herbs × 5 stages. The planter is shared with Batch 1, so only the foliage layers are kept.
- **Name flag:** Which herb sits on which floor is the Game Designer's call. The plants are safe either way.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

A plant growth chart for a cozy pixel-art farming game, like the attached growth-stage reference: three herbs, each shown at five growth stages. Three rows and five columns, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Every plant grows in the same simple round terracotta planter, the same planter size in every cell, and the planters in a row stand on the same baseline. Sizes are true to each other: do NOT enlarge the small stages.

Columns, left to right:
1. A planter of dark soil with a few seeds on top.
2. A tiny two-leaf sprout.
3. A young plant, about one third of full size.
4. A full-grown plant.
5. The same full-grown plant, extra lush, with more flowers.

Row 1, thyme: a low, wide cushion of tiny round green leaves on thin woody stems. Tiny pink-lilac flowers appear at stage 4 and cover it at stage 5.
Row 2, sage: upright stems with long, soft, oval, grey-green leaves. Short spikes of small violet-blue flowers appear at stage 5.
Row 3, chamomile: feathery bright green leaves with thin stems. Small white daisies with yellow centres appear at stage 4 and are fullest at stage 5.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 4:3.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 3: The top two floors

**New chat. Attach Set A:** `B4_floor04_garden_shed_nursery_v2.png` and `B4_floor_frame_shell.png`.

### Prompt 7: Soap and Scent Workshop: props

- **File name:** `b02_07_floor09_soap_workshop_props.png`
- **Shape and size:** very wide landscape 3:1, about 2160×720 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Turns your v2 floor 09 into the Soap and Scent Workshop. Its copper still with a flame and its glass flasks are swapped for these, so nothing reads as a laboratory. Its two workers, perfume stand and lavender basket stay.
- **Parts we cut from it:** Sliced into: soap kettle on its stove, mould table, drying rack, lotion shelf with the soap basket, manager's stool and side table. Brought to the 360×120 floor.
- **Name flag:** Floor name is from the game design document, still in review.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

A row of workshop props for one floor of a cozy pixel-art idle game, arranged left to right on one shared ground line, exactly like the attached floor reference: separate objects with small gaps between them, nothing cut off by the edges. No people in this image.

Left to right:
1. A soap kettle: a big round copper kettle with a lid, sitting on a small closed black iron stove with its door shut, and a long wooden stirring paddle leaning against it. No fire, no steam.
2. A wooden worktable with soap moulds on it: a long wooden tray holding a slab of cream soap, and three small round moulds of pale lavender soap.
3. A tall wooden drying rack with four shelves of soap bars in cream, pale lavender and pale sage green. Each bar is stamped with a small two-leaf sprout.
4. A small wooden shelf of round cream lotion bottles with cork stoppers, each with a small two-leaf sprout on its label, and below it a wicker basket of soap bars wrapped in paper and tied with twine.
5. The manager's spot: an empty plum velvet stool beside a small round side table with a brass hand bell on it.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: very wide landscape 3:1.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 8: Back walls: soap workshop and tower headquarters

- **File name:** `b02_08_backwalls_soap_hq.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Around the panels only
- **Purpose:** The wall layer for floor 9 (Soap and Scent Workshop) and floor 10 (Sprout Tower HQ). With Batch 1 this gives every World 1 floor a back wall.
- **Parts we cut from it:** 2 panels at 336×104.
- **Name flag:** Floor names are from the game design document, still in review.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Two background wall panels for a cozy pixel-art idle game about a herb-growing tower. The two panels are stacked one above the other with a clear empty gap between them. Each panel is a wide flat rectangle, three times as wide as it is tall, seen straight from the front with no perspective. These are empty backdrops: no people, no furniture, no plants, no floor, no ceiling beams, no border frame. Keep both panels quiet: soft low-contrast colours, a little darker and cooler than the reference props, with few details, so that bright props and characters placed in front of them will stand out.

TOP PANEL, inside a small soap workshop: a wall of pale sage-green plaster with a band of cream square tiles along the bottom third, a round window right of centre with golden evening light, a long wooden rail with three empty brass hooks, and a faint row of tiny lavender sprigs painted near the top.

BOTTOM PANEL, the head office of a grand old garden company: dark warm wood panelling on the bottom half, deep green wallpaper with a small repeating gold two-leaf sprout pattern on the top half, a tall arched window left of centre showing a plain golden evening sky and far purple rooftops, and a round gold plaque on the right with a two-leaf sprout in relief.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha) around and between the panels. Each panel itself is fully painted edge to edge.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 4: Pip and the first two-worker sheet

**New chat. Attach Set B:** `B22_character_animation_sheet.png` and `B21_manager_lineup_2.png`. **Some prompts in this round need one or two more pictures as well.** Each one is named in bold at the top of its prompt.

### Prompt 9: Pip, the seedling guide: poses and expressions

- **File name:** `b02_09_pip_guide.png`
- **Shape and size:** square 1:1, about 1254×1254 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Pip pops out of a windowsill planter in the first five seconds of the game and explains each new thing. These poses are what Pip shows while talking.
- **Parts we cut from it:** 9 poses at about 48×48 art pixels. The planter is cut out once and shared.
- **Name flag:** Pip's name and role are from the game design document, still in review.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). Do not copy their characters.

A character sheet for Pip, the tutorial guide of a cozy pixel-art idle game about a herb-growing tower: the SAME little character in nine poses and expressions, in a grid of three rows and three columns, one per cell, evenly spaced, nothing touching. Same size, colours and proportions in every cell, exactly like the attached animation sheet reference.

THE CHARACTER: Pip is a small, round seedling who lives in a tiny terracotta planter. Pip's body is a plump, smooth, light-brown bean shape that pokes up out of the soil in the planter, with a fresh green two-leaf sprout growing from the top of its head. Pip has two big round dark eyes, small rosy cheeks, a small mouth and two tiny stubby green leaf-shaped arms. Pip never leaves the planter: it hops and waddles about in it. No nose, no ears, no hair, no clothes. Cheerful and a bit of a chatterbox.

Row 1: (1) smiling, facing the viewer. (2) the same with a happy blink. (3) talking, mouth open, one leaf-arm raised as if explaining something.
Row 2: (4) waving with one leaf-arm. (5) jumping for joy, the planter off the ground, both arms up, the sprout leaves flung up. (6) surprised, eyes wide, the sprout leaves standing straight up.
Row 3: (7) thinking, one leaf-arm at its chin, eyes looking up. (8) a little sad, the sprout leaves drooping, eyes looking down. (9) only the top of Pip's head and the sprout peeking out of the soil, eyes just visible over the rim.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: square 1:1.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 10: Workers: Garden Shed Nursery

**Attach with this prompt:** `B4_floor04_garden_shed_nursery_v2.png`

- **File name:** `b02_10_workers_floor04_garden_shed.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of floor 4, Garden Shed Nursery (from your v2 floor 04), move. This is the first sheet with two workers on it. If it works, the other sheets in this batch do the same and the whole game needs about 15 fewer images.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by hand and reused on every frame.
- **Name flag:** Worker names may change. The looks are taken from your v2 floor 04.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The garden shed floor scene attached with this message shows the two characters to draw: CHARACTER A is the man in the orange cap at the potting bench, CHARACTER B is the young woman in purple dungarees holding a seedling tray. Keep their faces, hair, outfits and colours.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

CHARACTER A, left three columns: a stout, jolly older man with light skin, a big curled grey moustache and grey sideburns, an orange flat cap, an orange shirt with rolled sleeves, a dark green apron, brown trousers and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one fist up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding a small terracotta planter in one hand and pressing soil around a seedling in it with the other. (8) scooping soil with a small hand trowel at waist height. (9) walking to the right carrying a tray of seedlings in both hands.

CHARACTER B, right three columns: a cheerful young woman with light skin, long brown hair in two braids, a cream headscarf tied in a bow on top, round red glasses, a cream shirt, lavender-purple dungarees with a pencil in the front pocket, and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding a tray of seedlings at chest height and smiling at it. (8) setting the tray down to the right at waist height. (9) walking to the right carrying a stack of three small terracotta planters.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 5: Workers of floors 5 to 7

**New chat. Attach Set B:** `B22_character_animation_sheet.png` and `B21_manager_lineup_2.png`. **Some prompts in this round need one or two more pictures as well.** Each one is named in bold at the top of its prompt.

### Prompt 11: Workers: Glass Greenhouse

**Attach with this prompt:** `B4_floor05_greenhouse_v2.png`

- **File name:** `b02_11_workers_floor05_greenhouse.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of floor 5, Glass Greenhouse (from your v2 floor 05), move. Character A uses a wheelchair, so her walk is a roll.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by hand and reused on every frame.
- **Name flag:** Worker names may change. The looks are taken from your v2 floor 05.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The greenhouse floor scene attached with this message shows the two characters to draw: CHARACTER A is the woman in the wheelchair on the left, CHARACTER B is the young gardener in rust-brown dungarees on the right. Keep their faces, hair, outfits and colours.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

CHARACTER A, left three columns: a cheerful older woman with deep brown skin who uses a wheelchair: a green headscarf with grey curls showing, gold hoop earrings, a cream blouse with a lavender neckerchief, a long green skirt, and a purple wheelchair with gold wheel rims. She is seated in every pose.
Row 1: (1) sitting relaxed, facing the viewer, smiling. (2) the same with eyes closed in a happy blink. (3) cheering with both arms up.
Row 2, rolling to the right, seen from the side: (4), (5) and (6) her hands pushing the wheel rims forward, the spokes turned a little further in each frame.
Row 3, working, facing right: (7) holding a magnifying glass out at arm's length over a small flower in a planter on her lap. (8) writing in a small notebook on her lap. (9) rolling to the right with a planter of leafy herbs on her lap.

CHARACTER B, right three columns: a young gardener with light tan skin, short messy dark brown hair, a cream shirt with rolled sleeves, rust-brown dungarees with garden shears in the pocket, and green rubber boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) lifting a small glass bell cover with both hands. (8) lowering the glass bell cover over a small flowering plant in a planter. (9) walking to the right carrying a planter of leafy herbs.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 12: Workers: Farmers' Market Stall

**Attach with this prompt:** `B4_floor06_farmers_market_v2.png`

- **File name:** `b02_12_workers_floor06_market.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of floor 6, Farmers' Market Stall (from your v2 floor 06), move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by hand and reused on every frame.
- **Name flag:** Worker names may change. The looks are taken from your v2 floor 06.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The market floor scene attached with this message shows the two characters to draw: CHARACTER A is the woman in the red head wrap on the left, CHARACTER B is the older woman with the white braid and basket on the right. Keep their faces, hair, outfits and colours.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

CHARACTER A, left three columns: a cheerful, plump woman with deep brown skin, a deep red head wrap tied high, gold hoop earrings, a yellow blouse with puffed sleeves, a dark green apron dress with a pocket, and brown shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with a bunch of fresh basil held up high in one hand.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding out a bunch of fresh green basil to the right, as if offering it. (8) arranging leafy herbs in a wicker basket held at waist height. (9) walking to the right with a big wicker basket of herbs on her hip.

CHARACTER B, right three columns: a cheerful, round older woman with light skin, a long white braid over one shoulder, a dark green shawl with a gold brooch, and a plum-purple dress with a cream hem.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one arm up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) reaching out to the right with an open hand, as if paying. (8) putting a bunch of fresh herbs into the wicker basket on her arm. (9) walking to the right with the full basket on her arm.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 13: Workers: Tea House

**Attach with this prompt:** `B4_floor07_tea_house_v2.png`

- **File name:** `b02_13_workers_floor07_tea_house.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of floor 7, Tea House (from your v2 floor 07), move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by hand and reused on every frame.
- **Name flag:** Worker names may change. The looks are taken from your v2 floor 07.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The tea house floor scene attached with this message shows the two characters to draw: CHARACTER A is the older woman pouring tea on the left, CHARACTER B is the young waiter with the tray on the right. Keep their faces, hair, outfits and colours.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

CHARACTER A, left three columns: a gentle older woman with light skin, grey hair in a bun held with two hair sticks, rosy cheeks, a plum-purple wrap robe with cream trim and a small embroidered leaf pattern, and a purple sash.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) clapping her hands together happily.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) kneeling on a round purple cushion, pouring tea from a round brown teapot into a cup. (8) kneeling on the cushion, offering a tea cup forward with both hands. (9) walking to the right carrying the teapot on a small wooden tray.

CHARACTER B, right three columns: a cheerful young waiter with light skin, curly ginger hair, a cream shirt with a small purple bow tie, a mustard-yellow waistcoat, dark plum trousers and brown shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one arm up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) carrying a tray of four tea cups on one flat hand at shoulder height. (8) bowing slightly while setting a cup down to the right. (9) walking to the right with the tray of cups.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. No steam rises from the tea.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 6: Workers of floors 8 to 10 and the second workers of floors 1 to 3

**New chat. Attach Set B:** `B22_character_animation_sheet.png` and `B21_manager_lineup_2.png`. **Some prompts in this round need one or two more pictures as well.** Each one is named in bold at the top of its prompt.

### Prompt 14: Workers: Ropewalk and Twine Shop

**Attach with this prompt:** `b01_15_floor08_ropewalk_twine_shop.png`

- **File name:** `b02_14_workers_floor08_ropewalk.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of floor 8, Ropewalk and Twine Shop, move. They are the two you made in Batch 1 prompt 15.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by hand and reused on every frame.
- **Name flag:** Worker names may change. The looks are taken from your Batch 1 prompt 15 picture.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The ropewalk picture attached with this message shows the two characters to draw: CHARACTER A is the young woman turning the rope wheel, CHARACTER B is the old man winding twine at the bench. Keep their faces, hair, outfits and colours.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

CHARACTER A, left three columns: a stout, cheerful young woman with deep brown skin, hair in two round puffs tied with cream ribbons, a mustard-yellow shirt with rolled sleeves, a brown leather apron and sturdy boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both fists up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) both hands pushing a wooden crank handle forward at waist height. (8) both hands pulling the crank handle back up at chest height. (9) walking to the right with a big coil of cream rope over one shoulder.

CHARACTER B, right three columns: a tall, thin old man with light skin, a long white moustache, round glasses, a soft plum-purple cap, a cream shirt and a plum waistcoat.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) lifting his cap with one hand in a cheerful greeting.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) winding cream twine onto a ball held at chest height. (8) holding out a finished ball of twine on his open palm at chest height. (9) walking to the right carrying a small basket of twine balls.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 15: Workers: Soap and Scent Workshop

**Attach with this prompt:** `B4_floor09_essence_lab_v2.png`

- **File name:** `b02_15_workers_floor09_soap_workshop.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of floor 9, Soap and Scent Workshop (from your v2 floor 09), move. Their jobs change from lab work to soap making.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by hand and reused on every frame.
- **Name flag:** Worker names may change. The looks are taken from your v2 floor 09.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The workshop floor scene attached with this message shows the two characters to draw: CHARACTER A is the small older woman with the green headband sitting at the lavender table, CHARACTER B is the woman in the long purple coat with goggles on her head. Ignore the copper still and the glass bottles. Keep their faces, hair, outfits and colours.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

CHARACTER A, left three columns: a small, cheerful older woman with light skin, short white hair with a green headband, a cream blouse with puffed sleeves, a dark green apron dress with small scissors in the pocket, brown trousers and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) tying a bundle of fresh purple lavender stems with a ribbon at chest height. (8) holding a small tray of lavender soap bars at waist height. (9) walking to the right carrying a wicker basket of soap bars wrapped in paper.

CHARACTER B, right three columns: a stout, theatrical woman with warm tan skin, big fluffy lilac-grey hair with a white flower in it, brass goggles pushed up on top of her head, gold hoop earrings, a long plum-purple coat with gold trim and leaf embroidery, a red waistcoat, olive-green breeches and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) throwing one arm out wide with a dramatic flourish.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) stirring with a long wooden paddle held in both hands at waist height. (8) presenting a bar of soap on her open palm at chest height, with a proud smile. (9) walking to the right carrying a small wooden crate of round cream lotion bottles.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. No steam and no flames anywhere.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 16: Workers: Sprout Tower HQ and Windowsill Planter

**Attach with this prompt:** `B4_floor10_herb_empire_hq_v2.png` and `B4_floor01_windowsill_planter_v2.png`

- **File name:** `b02_16_workers_floor10_floor01.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes the worker of floor 10, Sprout Tower HQ, and the second worker of floor 1, Windowsill Planter, move. The grandmother at the HQ desk is left out on purpose: she is the best fit for Granny Evergreen, the Head of Thymeford, and is drawn with the managers.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by hand and reused on every frame.
- **Name flag:** Worker names may change. The looks are taken from your v2 floors 10 and 01.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The two floor scenes attached with this message show the two characters to draw: CHARACTER A is the young man carrying books in the headquarters scene, CHARACTER B is the young gardener in the green bandana with a watering can in the windowsill scene. Keep their faces, hair, outfits and colours.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

CHARACTER A, left three columns: a cheerful young man with light skin, a dark brown quiff, a cream shirt with rolled sleeves, a small purple bow tie, a dark green waistcoat, green trousers and brown shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one fist up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) reading a clipboard held at chest height and nodding. (8) lifting a book up to the right at shoulder height, as if putting it on a shelf. (9) walking to the right carrying a tall stack of green and purple books.

CHARACTER B, right three columns: a young gardener with warm brown skin, curly dark brown hair under a green bandana, rosy cheeks, a cream shirt with rolled sleeves, a green apron with red scissors in the pocket, brown trousers and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) snipping leaves with small red scissors at waist height. (8) pouring from a small yellow watering can held at waist height, with a few water drops falling. (9) walking to the right carrying a wicker basket of seed packets.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 17: Workers: Balcony Boxes and Backyard Hemp Patch

**Attach with this prompt:** `B4_floor02_balcony_pots_v2.png` and `B4_floor03_backyard_patch_v2.png`

- **File name:** `b02_17_workers_floor02_floor03.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes the second workers of floor 2, Balcony Boxes, and floor 3, Backyard Hemp Patch, move. With prompts 10 to 16 and Batch 1, every worker in your ten World 1 floor pictures can now move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by hand and reused on every frame.
- **Name flag:** Worker names may change. The looks are taken from your v2 floors 02 and 03.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The two floor scenes attached with this message show the two characters to draw: CHARACTER A is the plump woman crouching to plant on the balcony, CHARACTER B is the young woman with the red braid and straw hat digging in the backyard. Keep their faces, hair, outfits and colours.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

CHARACTER A, left three columns: a short, plump woman with light tan skin, short curly black hair with a mustard-yellow headband tied in a bow, gold hoop earrings, a cream shirt with rolled sleeves, a lavender-purple waistcoat, mustard-yellow trousers and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) crouching to set a seedling into a planter on the ground. (8) crouching and patting the soil in the planter. (9) walking to the right carrying a planter of basil in both hands.

CHARACTER B, right three columns: a young woman with fair skin and freckles, a long red-orange braid, a straw sun hat with a pink flower, a pink neckerchief, a cream shirt, a green waistcoat, brown knee breeches and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one arm up, holding her hat on with the other.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) pushing a long garden hoe forward along the ground. (8) pulling the hoe back. (9) walking to the right carrying a tin bucket.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 7: The rarity reveal kit

**New chat. Attach Set D:** `b01_11_chest_opening_frames.png` and `B25_card_layout_mockup.png`. **Some prompts in this round need one or two more pictures as well.** Each one is named in bold at the top of its prompt.

### Prompt 18: Rarity emblems: one badge per rarity

- **File name:** `b02_18_rarity_emblems.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The six small badges that tell a card's rarity everywhere in the game: on the card frame, the small card, the collection slot and the chest light. They are what ties the rarity look together. Style bible sections 8 and 19.
- **Parts we cut from it:** 6 emblems at 48×48 art pixels. Smaller sizes are drawn by hand.
- **Name flag:** Rarity names are from the game design document. Two more rarities may be added later; they get their emblems then.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Six small badge emblems for a cozy pixel-art idle game, one for each rarity of collectible card, in two rows of three, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Each is one chunky, simple object that reads at a glance at a small size, seen from the front, with a golden-yellow highlight on its upper left. Each must look clearly richer than the one before it.
Row 1:
1. A round plate of dark iron with four rivets around a small warm wooden centre.
2. Two fresh green leaves on a short stem, tied with a little twine bow.
3. A faceted sapphire-blue diamond gem in a small silver setting.
Row 2:
4. A tall, pointed amethyst crystal with two smaller purple crystals at its sides.
5. A round gold sun medallion with a small two-leaf sprout in its middle and a gold laurel wreath around it.
6. A gem-cut prism crystal with teal, rose and lavender facets and two small white feathered wings spread from its sides.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 19: Chests: Copper Chest and Silver Chest

- **File name:** `b02_19_chests_copper_silver.png`
- **Shape and size:** landscape 16:9, about 1664×936 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Two of the four missing chest tiers, opening in the same four steps as your Batch 1 chests, so all six chests open the same way. The light that shows the rarity inside is added by the game.
- **Parts we cut from it:** 8 frames: 2 chests × 4 steps, 96×80 art pixels each. Lids are also cut out as separate parts.
- **Name flag:** Chest names are from the game design document and may change.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

An animation sheet of two treasure chests opening, for a cozy pixel-art idle game, drawn exactly like the attached chest animation sheet: the same chest size, the same view from slightly above turned a little to the right, and the same four steps. Two rows of four frames, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Within a row the chest is the same size and stands in the same place in every cell, so that the frames line up as an animation.

The four frames in each row, left to right:
1. Closed.
2. Lid lifted just a crack.
3. Lid half open.
4. Lid fully open and thrown back. The chest is EMPTY inside, lined with plain cream cloth.

Row 1, the copper chest: warm wooden planks with shiny copper bands, copper corners and a copper lock, with a thin trim of soft green patina along the bands.
Row 2, the silver chest: pale grey-blue wood covered with polished silver plates and silver rivets, and a lock set with one sapphire-blue gem.

No treasure, no items, no light coming out, no light rays and no sparkles in any frame. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 16:9.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 20: Chests: Crystal Chest and Starlight Chest

- **File name:** `b02_20_chests_crystal_starlight.png`
- **Shape and size:** landscape 16:9, about 1664×936 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The two top chest tiers. With prompt 19 and your Batch 1 chests, all six chest tiers exist.
- **Parts we cut from it:** 8 frames: 2 chests × 4 steps, 96×80 art pixels each. Lids are also cut out as separate parts.
- **Name flag:** Chest names are from the game design document and may change.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

An animation sheet of two treasure chests opening, for a cozy pixel-art idle game, drawn exactly like the attached chest animation sheet: the same chest size, the same view from slightly above turned a little to the right, and the same four steps. Two rows of four frames, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Within a row the chest is the same size and stands in the same place in every cell, so that the frames line up as an animation.

The four frames in each row, left to right:
1. Closed.
2. Lid lifted just a crack.
3. Lid half open.
4. Lid fully open and thrown back. The chest is EMPTY inside, lined with plain cream cloth.

Row 1, the crystal chest: a silver frame holding panels of clear amethyst-purple crystal with flat facets, and a silver lock shaped like a tall crystal.
Row 2, the starlight chest: deep night-blue wood with small gold star studs, gold corners shaped like crescent moons, and a lock set with a prism crystal in teal, rose and lavender.

No treasure, no items, no light coming out, no light rays and no sparkles in any frame. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 16:9.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 21: Card frames: Common, Uncommon, Rare

- **File name:** `b02_21_card_frames_common_rare.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The first three of the six card frames. The card picture, name, level and stats are drawn into them by the game. Frame shape and ornament tell the rarity without colour.
- **Parts we cut from it:** 3 frames at 180×240 art pixels. The small card frames are made by hand from these.
- **Name flag:** Rarity names are from the game design document.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Three empty collectible card frames for a cozy pixel-art idle game, side by side in one row, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. All three have exactly the same size and the same layout as the attached card mockup: a tall card, three wide by four tall, with an ornate border, an arched picture window in the upper half, a blank name ribbon across the middle, and a blank parchment panel in the lower part with two plain empty rows. Only the border ornament and its colours change from card to card. The picture window is EMPTY and transparent. The ribbon and the panel are plain, with no writing, numbers, icons or bars on them. No plant and no picture anywhere.

Left to right:
1. Common: a plain warm wooden border with grey iron corner brackets and rivets, and a round iron rivet plate at the top centre.
2. Uncommon: a wooden border wrapped in a fresh green leafy vine, with a pair of green leaves at the top centre and at the bottom centre.
3. Rare: a polished silver border with a faceted sapphire-blue gem at the top centre, at the bottom centre and on each side.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 22: Card frames: Epic, Legendary, Exotic

- **File name:** `b02_22_card_frames_epic_exotic.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The three top card frames. Each must look clearly grander than the one before it.
- **Parts we cut from it:** 3 frames at 180×240 art pixels. The small card frames are made by hand from these.
- **Name flag:** Rarity names are from the game design document. Two more rarities may be added later; they get frames then.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Three empty collectible card frames for a cozy pixel-art idle game, side by side in one row, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. All three have exactly the same size and the same layout as the attached card mockup: a tall card, three wide by four tall, with an ornate border, an arched picture window in the upper half, a blank name ribbon across the middle, and a blank parchment panel in the lower part with two plain empty rows. Only the border ornament and its colours change from card to card. The picture window is EMPTY and transparent. The ribbon and the panel are plain, with no writing, numbers, icons or bars on them. No plant and no picture anywhere.

Left to right:
1. Epic: a carved lavender-purple stone border with swirls and small green leaves, a tall amethyst crystal at the top centre and at the bottom centre, and a small purple crystal on each side, like the attached mockup.
2. Legendary: a rich gold border with gold laurel leaves all the way around, a round gold sun medallion with a two-leaf sprout at the top centre, and smaller gold medallions on each side.
3. Exotic: a pearly white and silver border inlaid with small prism crystals in teal, rose and lavender, a prism crystal with two small white feathered wings at the top centre, and the wings' feathers spreading along the top corners.

No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 23: Reveal effects: one burst per rarity

**Attach with this prompt:** `B29_tap_feedback_vfx.png`

- **File name:** `b02_23_reveal_effects.png`
- **Shape and size:** portrait 2:3, about 1024×1536 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The bursts that play when a card of each rarity is revealed, from a small puff for Common to a shower of prism shards for Exotic. The game adds the light, rays and screen colour around them.
- **Parts we cut from it:** 24 frames: 6 rarities × 4 frames, each burst on a 48×48 art pixel cell.
- **Name flag:** None.

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

An effects sheet for a cozy pixel-art idle game, drawn like the attached tap-effects sheet: six rows of four frames, evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge. Each row is one short burst animation that grows from frame 1 to frame 3 and fades and scatters in frame 4. Each row must look clearly bigger and richer than the row above it.
Row 1: a small puff of round cream and light brown dust clouds.
Row 2: a burst of small green leaves and yellow-green bits.
Row 3: blue diamond-shaped gem glints with small four-point sparkles in pale blue and white.
Row 4: sharp amethyst-purple crystal shards flying outward in a ring.
Row 5: gold coins with a small sprout mark tumbling outward with small gold laurel leaves and four-point gold sparkles.
Row 6: small prism crystal shards in teal, rose and lavender with tiny white feathers and four-point sparkles in all three colours.
Hard pixel edges only, no glow halo and no soft light around any effect. No dollar signs, plus signs, numbers or text.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: portrait 2:3.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## If a result is off

Send the matching sentence in the same chat.

| What you see | Send this |
|---|---|
| Soft, blurry or painted instead of crisp pixels | `Redo the same image as true pixel art: big hard-edged square pixels, flat colours, no blur, no gradients, no anti-aliasing. Keep the same layout and content.` |
| Small pixels in some places and big ones in others | `Redo with one pixel size across the whole image, matching the reference images.` |
| A background or floor was painted in | `Same image, but on a flat solid magenta #FF00FF background with nothing else behind the objects.` |
| Things touch each other or are cut off | `Same image, but make every item smaller with clear empty space around each one. Nothing may touch another item or the edge.` |
| Text, letters or numbers appear | `Same image with all text, letters and numbers removed. Leave those areas plain.` |
| Sparkles, glints or dots around the items | `Same image with every sparkle, glint, light ray and floating dot removed. Keep everything else.` |
| The three Golden Sprouts look different from each other | `Redo the three sprouts as the exact same golden seed and sprout, same size and pose. Only the small badge on the front changes.` |
| The character changes between poses | `Redo the sheet. Every pose must show the exact same character as pose 1: same face, hair, outfit, colours and body size.` |
| On a two-worker sheet the two characters mix or change | `Redo the sheet. The left three columns show only character A and the right three columns only character B, each exactly the same in all nine of its poses.` |
| Two workers on one sheet still fails after two tries | `Draw only character A, in nine poses in three rows of three. Then, as a second image, draw character B the same way.` |
| A person looks like someone real or a known cartoon | `Redo with a clearly different, original face and hairstyle.` |
| A chest changes size or place between frames | `Redo so each chest is exactly the same size and in exactly the same place in all four frames of its row. Only the lid moves.` |
| A card frame has a picture, writing or bars inside | `Same frames, but completely empty inside: no plant, no picture, no writing, no numbers, no bars. Plain window, plain ribbon, plain panel.` |
| The rarities do not look richer from one to the next | `Redo so each one is clearly grander than the one before it: more ornament, richer material, a bigger silhouette.` |
| Wrong number of items | `Redo with exactly the number of items, rows and columns listed in the prompt.` |
| Light comes from the right | `Same image with the light coming from the upper left.` |
| Too busy or too detailed | `Same image, simpler: fewer details, bigger shapes, only 3 to 4 flat tones per material.` |
| No zip came with the picture | `Please also give me the zip: the sheet as exact pixel art, each item as a true-size transparent PNG, and a slices.json.` |

## What happens after you upload

1. Each image is checked against Gate A of the style bible. If one needs a redo, you get its number and the exact sentence to send.
2. Accepted images go through the clean-up route and become game-size sprites.
3. Any image with hemp in it is checked with the five-question hemp review.
