# Production Asset Batch 4: Loomington cast, managers, events and the top rarities

Part of the [Style Bible](STYLE_BIBLE.md). Batch revision: **2**. Style suffix version: **v1**. Hemp guards version: **v1**. Written by `tools/build_asset_batch_04.py`, which copies the suffix and guards word for word from section 21 of the bible. Never edit this file by hand.

**19 images in 5 rounds.** They bring Loomington to life: moving sheets for the sixteen workers of its eight rooms, its eight managers, Baron Fauxliage, Mayor Thyme crowning a Head and the weekend events. Then come the frames, badges and bursts of the five new top rarities, Mythic, Godly, Ungodly, Holy and Grailed, and the crown a Godly Head wears.

**Revision 2** (2026-11-28): Lawson set an eleven-rarity ladder: Common, Uncommon, Rare, Epic, Legendary, Mythic, Exotic, Godly, Ungodly, Holy, Grailed. Images 1 to 15 are unchanged. Images 16 to 19 are new: they replace revision 1's Mythic and Godly kit, its Full Bloom bud (held until design 0.5 says where a card's rise to a new tier is shown) and its Mythic plant forms (dropped, because Mythic now sits below Exotic).

Every sheet carries two workers, as in Batch 2, so the plan's separate "second worker" sheets are no longer needed. **Every image now says its size in art pixels** ("big square pixels"): in Batches 2 and 3, sheets that did not say it came back with people up to 40% too big and cards up to four times too big.

Names follow the game design document (version 0.4); the rarities follow Lawson's ladder of 2026-11-28 (version 0.5). Each prompt describes a look, not a name, so a rename does not spoil an image.

## How to do it on your phone

The easiest way is the **master files**. ChatGPT takes at most 20 attachments, so the batch comes in two parts. Part 1 is images 1 to 13 (the people): attach `Sprout_Tower_Batch4_Part1_Master.md` and the 12 pictures in `Sprout_Tower_Batch4_Part1_References.zip` to one new ChatGPT chat and type **next** between images. Part 2 is images 14 to 19 (events and the top rarities): the same with `Sprout_Tower_Batch4_Part2_Master.md` and the 8 pictures in `Sprout_Tower_Batch4_Part2_References.zip`, in a second new chat. All four files are in the project files, `art/batch04/master/`. If a chat gets full, start a new one with the same files and type **start at image N**. Every picture is named for the images it belongs to (`img05_...` is for image 5, `img01-13_...` for images 1 to 13). The rounds below are the same images, one prompt at a time, if you prefer that.

1. Each round is **one new ChatGPT chat**.
2. At the start of a round, **attach that round's two reference images** (listed below) and paste the round's first prompt in the same message.
3. Then paste the round's other prompts **one at a time, in the same chat**. Most prompts in this batch need one more picture as well, named in bold at the top of the prompt.
4. Each prompt is one grey box. Copy the whole box, change nothing.
5. Upload the zip as well as the picture. If ChatGPT makes no zip, the picture alone is fine.
6. Save each picture as **PNG, original size**. No screenshots, no JPG, no cropping or resizing.
7. Upload the results in number order, or tell me which number each one is.

### The reference sets

| Set | For | Attach these two images |
|---|---|---|
| **A** | Scenes | `B4_floor04_garden_shed_nursery_v2.png` and `B4_floor_frame_shell.png` |
| **B** | People | `B22_character_animation_sheet.png` and `B21_manager_lineup_2.png` |
| **D** | Chests and cards | `b01_11_chest_opening_frames.png` and `B25_card_layout_mockup.png` |

All four sets are from your expansion pack and your Batch 1 pictures, the same as before.

### Extra pictures

| Prompt | Also attach |
|---|---|
| 1 | `b03_01_w2_floor01_rooftop_beds.png` |
| 2 | `b03_02_w2_floor02_herb_kiosk.png` |
| 3 | `b03_03_w2_floor03_weaving_mill.png` |
| 4 | `b03_04_w2_floor04_paper_workshop.png` |
| 5 | `B4_floor08_spice_kitchen_v2.png` |
| 6 | `b03_05_w2_floor06_atelier.png` |
| 7 | `b03_06_w2_floor07_brickyard.png` |
| 8 | `b03_07_w2_floor08_emporium.png` |
| 9 | `B5_manager_lineup.png` |
| 13 | `b03_14_mayor_thyme.png` |
| 14 | `b02_02_currency_icons.png` |
| 15 | `B4_floor01_windowsill_planter_v2.png` |
| 16 | `ref_card_frames_six.png` |
| 17 | `ref_card_frames_six.png` |
| 18 | `ref_rarity_badges_bursts.png` |
| 19 | `ref_rarity_badges_bursts.png` |

The `b03_` and `b02_` pictures are your own from Batches 2 and 3. The three `ref_` pictures are made from the cleaned game sprites, so the new pieces match what is in the game. A copy of every picture is in the reference zip.

### The rounds

| Round | Theme | Attach | Prompts | Priority |
|---|---|---|---|---|
| 1 | Workers of Loomington floors 1 to 4 | Set B plus extra pictures | 1, 2, 3, 4 | Needed first: the player's first hour in Loomington |
| 2 | Workers of Loomington floors 5 to 8 | Set B plus extra pictures | 5, 6, 7, 8 | Needed next |
| 3 | The Loomington managers, Baron Fauxliage and the crowning | Set B plus extra pictures | 9, 10, 11, 12, 13 | Managers needed first: each arrives when their floor opens |
| 4 | Weekend events | Set A plus extra pictures | 14, 15 | Needed by player level 12 (about day 1) |
| 5 | The five new top rarities: Mythic, Godly, Ungodly, Holy, Grailed | Set D plus extra pictures | 16, 17, 18, 19 | Needed for the reveal ladder; the top tiers come late in play |

### All prompts at a glance

| # | Image | File name | Shape | Transparent |
|---|---|---|---|---|
| 1 | Workers: Rooftop Garden Beds | `b04_01_workers_w2_floor01_rooftop.png` | landscape 3:2 | Yes |
| 2 | Workers: Corner Herb Kiosk | `b04_02_workers_w2_floor02_kiosk.png` | landscape 3:2 | Yes |
| 3 | Workers: Canvas Weaving Mill | `b04_03_workers_w2_floor03_mill.png` | landscape 3:2 | Yes |
| 4 | Workers: Paper Workshop | `b04_04_workers_w2_floor04_paper.png` | landscape 3:2 | Yes |
| 5 | Workers: Spice Kitchen Bistro | `b04_05_workers_w2_floor05_bistro.png` | landscape 3:2 | Yes |
| 6 | Workers: Tailor's Atelier | `b04_06_workers_w2_floor06_atelier.png` | landscape 3:2 | Yes |
| 7 | Workers: Hempcrete Brickyard | `b04_07_workers_w2_floor07_brickyard.png` | landscape 3:2 | Yes |
| 8 | Workers: Grand Emporium | `b04_08_workers_w2_floor08_emporium.png` | landscape 3:2 | Yes |
| 9 | Managers of Loomington floors 1 to 3: Bram Applewhite, Olive Ledger, Tansy Treadle | `b04_09_managers_w2_floors01_03.png` | landscape 3:2 | Yes |
| 10 | Managers of Loomington floors 4 to 6: Kit Foldaway, Barley Biggs, Hazel Thimble | `b04_10_managers_w2_floors04_06.png` | landscape 3:2 | Yes |
| 11 | Managers of Loomington floors 7 and 8: Bjorn Barrow, Madame Loom | `b04_11_managers_w2_floors07_08.png` | landscape 16:9 | Yes |
| 12 | Baron Fauxliage, the plastic-plant salesman: poses and expressions | `b04_12_baron_fauxliage.png` | square 1:1 | Yes |
| 13 | Mayor Thyme crowns a Head: four poses | `b04_13_mayor_thyme_crowning.png` | landscape 16:9 | Yes |
| 14 | Weekend event emblems: Herb Fair, Night Market, Hemp Harvest Home, Blossom Parade | `b04_14_event_emblems.png` | square 1:1 | Yes |
| 15 | Fair stall dressing for the weekend events | `b04_15_fair_stall_dressing.png` | landscape 3:2 | Yes |
| 16 | Card frames: Mythic, Godly, Ungodly | `b04_16_card_frames_mythic_godly_ungodly.png` | landscape 3:2 | Yes |
| 17 | Card frames: Holy and Grailed | `b04_17_card_frames_holy_grailed.png` | landscape 3:2 | Yes |
| 18 | Rarity badges: Mythic to Grailed, and the crown | `b04_18_rarity_badges_mythic_grailed.png` | landscape 3:2 | Yes |
| 19 | Reveal bursts: Mythic to Grailed | `b04_19_reveal_bursts_mythic_grailed.png` | portrait 2:3 | Yes |

---

## Round 1: Workers of Loomington floors 1 to 4

**New chat. Attach Set B:** `B22_character_animation_sheet.png` and `B21_manager_lineup_2.png`. **Some prompts in this round need more pictures as well.** Each one is named in bold at its top.

### Prompt 1: Workers: Rooftop Garden Beds

**Attach with this prompt:** `b03_01_w2_floor01_rooftop_beds.png`

- **File name:** `b04_01_workers_w2_floor01_rooftop.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of Loomington floor 1, the rooftop herb garden, move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per character is redrawn by hand and reused on every frame. These replace the single standing poses cut from the Batch 3 room picture.
- **Name flag:** Worker names may change. The looks are taken from your Batch 3 room picture.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The rooftop garden picture attached with this message shows the two characters to draw: CHARACTER A is the young man with the watering can, CHARACTER B is the woman in the mustard cardigan carrying seedlings. Keep their faces, hair, outfits and colours, but draw them at the size given below.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose.

CHARACTER A, left three columns: a lanky young man with light olive skin, a mop of black hair under a sky-blue bandana, a cream T-shirt, green dungarees rolled up at the ankles and yellow rubber boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both fists up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) watering the ground in front of him from a long-spouted tin watering can held low at waist height. (8) crouching to pat the soil with one hand, the watering can beside him. (9) walking to the right with the watering can swinging in one hand.

CHARACTER B, right three columns: a short, round woman in her sixties with deep brown skin, short grey twists, round gold earrings, a mustard-yellow cardigan over a teal dress, a striped cream apron and green rubber clogs.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding a wooden tray of tiny seedlings at waist height and smiling at it. (8) bending a little to set one seedling down in front of her at knee height. (9) walking to the right carrying the tray of seedlings in both hands.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. Nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 2: Workers: Corner Herb Kiosk

**Attach with this prompt:** `b03_02_w2_floor02_herb_kiosk.png`

- **File name:** `b04_02_workers_w2_floor02_kiosk.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of Loomington floor 2, the mint kiosk on the street corner, move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per character is redrawn by hand and reused on every frame. These replace the single standing poses cut from the Batch 3 room picture.
- **Name flag:** Worker names may change. The looks are taken from your Batch 3 room picture.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The kiosk picture attached with this message shows the two characters to draw: CHARACTER A is the young woman in the green beret tying mint, CHARACTER B is the young man in the green waistcoat and bow tie. Keep their faces, hair, outfits and colours, but draw them at the size given below.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose.

CHARACTER A, left three columns: a cheerful young woman with light skin, freckles and a short red bob under a green knitted beret, a cream shirt with rolled sleeves, a green-and-cream striped apron and brown shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one fist up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) tying a bunch of fresh mint with twine at chest height. (8) setting the tied bunch down in front of her at waist height. (9) walking to the right carrying a small crate of mint bunches.

CHARACTER B, right three columns: a tall, slim young man with dark brown skin, short black hair with a neat side part, a crisp white shirt with rolled sleeves, a dark green waistcoat, a little mint-green bow tie, dark trousers and brown shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one arm up, grinning.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding out a paper cone of fresh mint to the right at chest height, as if handing it to a customer. (8) wrapping a bunch of mint in brown paper at chest height. (9) walking to the right carrying a crate of mint bunches.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. Nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 3: Workers: Canvas Weaving Mill

**Attach with this prompt:** `b03_03_w2_floor03_weaving_mill.png`

- **File name:** `b04_03_workers_w2_floor03_mill.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of Loomington floor 3, the hemp canvas mill, move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per character is redrawn by hand and reused on every frame. These replace the single standing poses cut from the Batch 3 room picture.
- **Name flag:** Worker names may change. The looks are taken from your Batch 3 room picture.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The weaving mill picture attached with this message shows the two characters to draw: CHARACTER A is the young woman at the loom, CHARACTER B is the bald man carrying a bolt of canvas. Keep their faces, hair, outfits and colours, but draw them at the size given below.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose.

CHARACTER A, left three columns: a sturdy young woman with tan skin, black hair in one long braid under a red headscarf, a cream blouse with rolled sleeves, a long sand-coloured canvas apron and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both fists up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) both hands gripping a long wooden bar held across in front of her at chest height, pulling it toward her body, like the beater bar of a loom. (8) the same bar pushed away from her at arm's length. (9) walking to the right with a big cone of cream thread in each hand.

CHARACTER B, right three columns: a broad, bald older man with warm brown skin, a short white beard, a sky-blue work shirt with rolled sleeves, a leather apron with two thread spools in its pocket, dark trousers and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one arm up, laughing.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) standing with a rolled bolt of cream canvas on one shoulder. (8) setting the bolt down in front of him at waist height. (9) walking to the right with the bolt on his shoulder.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. Nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 4: Workers: Paper Workshop

**Attach with this prompt:** `b03_04_w2_floor04_paper_workshop.png`

- **File name:** `b04_04_workers_w2_floor04_paper.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of Loomington floor 4, where hemp fibre becomes paper and kites, move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per character is redrawn by hand and reused on every frame. These replace the single standing poses cut from the Batch 3 room picture.
- **Name flag:** Worker names may change. The looks are taken from your Batch 3 room picture.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The paper workshop picture attached with this message shows the two characters to draw: CHARACTER A is the young man in glasses at the paper vat, CHARACTER B is the young woman holding a kite. Keep their faces, hair, outfits and colours, but draw them at the size given below.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose.

CHARACTER A, left three columns: a small, quick young man with light skin, curly blond hair, round wire glasses, a mustard shirt with rolled sleeves, a long teal rubber apron and tall rubber boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding a wooden mould frame with a fresh wet sheet of paper on it, flat at chest height. (8) tipping the frame forward at waist height to lay the sheet down. No drips. (9) walking to the right carrying a stack of cream paper sheets.

CHARACTER B, right three columns: a tall young woman with light brown skin, long black hair in a high ponytail tied with a red ribbon, a lavender work smock and brown boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one fist up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding a finished diamond-shaped paper kite in red and sunny yellow with a short ribbon tail at her side, proudly. (8) folding a sheet of cream paper at chest height. (9) walking to the right with the kite tucked under one arm.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. Nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 2: Workers of Loomington floors 5 to 8

**New chat. Attach Set B:** `B22_character_animation_sheet.png` and `B21_manager_lineup_2.png`. **Some prompts in this round need more pictures as well.** Each one is named in bold at its top.

### Prompt 5: Workers: Spice Kitchen Bistro

**Attach with this prompt:** `B4_floor08_spice_kitchen_v2.png`

- **File name:** `b04_05_workers_w2_floor05_bistro.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of Loomington floor 5, the Spice Kitchen Bistro (your v2 floor 08), move. Character B is the cook in the yellow headscarf from that picture. Character A is new: the bistro's manager, Barley Biggs, is a big moustached chef, so a second one would look like his twin.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per character is redrawn by hand and reused on every frame. These replace the single standing poses cut from the Batch 3 room picture.
- **Name flag:** Worker names may change. Character B is taken from your v2 floor 08; character A is new.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The kitchen picture attached with this message shows CHARACTER B: the young woman in the yellow headscarf at the chopping board. Do not draw the chef with the moustache. CHARACTER A is new. Keep their faces, hair, outfits and colours, but draw them at the size given below.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose.

CHARACTER A, left three columns: a lanky young cook with warm tan skin and a short black ponytail, a small round white cook's cap, a white double-breasted cook's jacket, a red neckerchief, black-and-white checked trousers and black clogs. He has no moustache.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both fists up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) tossing basil leaves in a copper frying pan held by its handle at waist height, a few green leaves just above the pan. (8) stirring a copper saucepan held at waist height with a wooden spoon. No steam and no flames. (9) walking to the right carrying the copper saucepan in both hands.

CHARACTER B, right three columns: a cheerful, round young woman with light skin, rosy cheeks and curly brown hair under a mustard-yellow headscarf tied in a bow, a cream blouse with puffed sleeves pushed up, a long dark green pinafore apron over a dusty pink dress, and brown shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) tearing fresh basil leaves into a wooden bowl held at waist height. (8) holding out a plate with a basil-topped dish to the right at chest height. (9) walking to the right carrying a wicker basket of fresh basil.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. Nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 6: Workers: Tailor's Atelier

**Attach with this prompt:** `b03_05_w2_floor06_atelier.png`

- **File name:** `b04_06_workers_w2_floor06_atelier.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of Loomington floor 6, where hemp linen becomes clothes, move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per character is redrawn by hand and reused on every frame. These replace the single standing poses cut from the Batch 3 room picture.
- **Name flag:** Worker names may change. The looks are taken from your Batch 3 room picture.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The atelier picture attached with this message shows the two characters to draw: CHARACTER A is the older man at the sewing machine (draw him standing), CHARACTER B is the young woman holding a shirt. Keep their faces, hair, outfits and colours, but draw them at the size given below.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose.

CHARACTER A, left three columns: an elegant older man with deep brown skin, a neat silver moustache, round gold spectacles, a yellow tape measure around his neck, a lavender waistcoat over a cream shirt, grey trousers and black shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one arm up, a proud smile.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) hand-stitching the hem of a cream shirt held at chest height. (8) measuring a length of linen with the tape measure stretched between his hands at chest height. (9) walking to the right carrying a folded stack of linen shirts.

CHARACTER B, right three columns: a petite young woman with light skin, a sleek black bob with a straight fringe, small gold hoop earrings, a pincushion on her wrist, a sage-green dress with a white collar and black shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both arms up and a little hop.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding up a finished sage-green linen shirt on a wooden hanger at chest height. (8) pinning the hem of a cream cloth draped over her arm. (9) walking to the right carrying the shirt on its hanger.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. Nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 7: Workers: Hempcrete Brickyard

**Attach with this prompt:** `b03_06_w2_floor07_brickyard.png`

- **File name:** `b04_07_workers_w2_floor07_brickyard.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of Loomington floor 7, where hemp and lime become pale building blocks, move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per character is redrawn by hand and reused on every frame. These replace the single standing poses cut from the Batch 3 room picture.
- **Name flag:** Worker names may change. The looks are taken from your Batch 3 room picture.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The brickyard picture attached with this message shows the two characters to draw: CHARACTER A is the young man in the orange vest at the mixing trough, CHARACTER B is the older woman in the red cap at the wall. Keep their faces, hair, outfits and colours, but draw them at the size given below.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose.

CHARACTER A, left three columns: a big, strong young man with medium brown skin, short black curls, an orange work vest over a grey T-shirt, canvas trousers with knee patches and heavy boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both fists up.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) pushing a long-handled hoe forward through the ground in front of him at waist height, as if stirring a trough. (8) pulling the hoe back toward him. (9) walking to the right carrying one pale speckled building block in both arms.

CHARACTER B, right three columns: a wiry older woman with light skin, a short grey crop under a red knitted cap, a denim jacket, a tool belt with a spirit level, dark trousers and sturdy boots.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with one fist up, grinning.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) setting a pale speckled block down in front of her at chest height. (8) smoothing the top of it with a trowel at chest height. (9) walking to the right with a block under one arm and the trowel in her other hand.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. Nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 8: Workers: Grand Emporium

**Attach with this prompt:** `b03_07_w2_floor08_emporium.png`

- **File name:** `b04_08_workers_w2_floor08_emporium.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Makes both workers of Loomington floor 8, the grand department store, move.
- **Parts we cut from it:** 18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per character is redrawn by hand and reused on every frame. These replace the single standing poses cut from the Batch 3 room picture.
- **Name flag:** Worker names may change. The looks are taken from your Batch 3 room picture.

```text
Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). The emporium picture attached with this message shows the two characters to draw: CHARACTER A is the woman wrapping a parcel, CHARACTER B is the porter in the red cap. Keep their faces, hair, outfits and colours, but draw them at the size given below.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose.

CHARACTER A, left three columns: a smiling middle-aged woman with tan skin, dark hair in a neat bun, a cream blouse with a lavender scarf, a long navy skirt and black shoes.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) cheering with both hands clasped and raised, beaming.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) wrapping a small parcel in paper printed with little two-leaf sprouts at waist height. (8) tying a ribbon bow on the parcel at waist height. (9) walking to the right carrying the wrapped parcel.

CHARACTER B, right three columns: a tall young porter with light skin and ginger sideburns, a round red pillbox cap with a gold band, a red uniform jacket with gold buttons and black trousers.
Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a happy blink. (3) lifting his cap with one hand in a cheerful greeting.
Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the body, body slightly higher. (6) left leg forward, arms swinging the other way.
Row 3, working, facing right: (7) holding a stack of three gift boxes tied with ribbons at chest height. (8) setting the stack down in front of him at waist height. (9) walking to the right carrying the stack of boxes.

Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and nothing is held up to a face. Nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 3: The Loomington managers, Baron Fauxliage and the crowning

**New chat. Attach Set B:** `B22_character_animation_sheet.png` and `B21_manager_lineup_2.png`. **Some prompts in this round need more pictures as well.** Each one is named in bold at its top.

### Prompt 9: Managers of Loomington floors 1 to 3: Bram Applewhite, Olive Ledger, Tansy Treadle

**Attach with this prompt:** `B5_manager_lineup.png`

- **File name:** `b04_09_managers_w2_floors01_03.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The first three managers of Loomington. They stand at the manager's spot on the right of their own room: the rooftop beekeeper, the bookkeeper who now runs the mint kiosk, and the weaver who hums in time with the loom.
- **Parts we cut from it:** 12 poses, 4 per character, in 96×96 frames with the feet on row 92. One head per character is redrawn by hand and reused on every frame. The standing pose also gives the card picture and the 48×48 bust.
- **Name flag:** Names are from the game design document (version 0.4). Bram and Olive are from your first manager lineup; Tansy Treadle is new.

```text
Use the attached animation sheet and the lineup with a robot in it for style only (pixel size, outline, shading, colours). The attached lineup of six people on a cream background, with a beekeeper in the middle, shows two of the characters: CHARACTER 1 is the beekeeper, fourth from the left, and CHARACTER 2 is the woman in the green suit on the far right. Keep their faces, hair, outfits and colours, but draw them in the crisp, flat pixel style of the animation sheet, not in a soft painted style. CHARACTER 3 is new.

A character animation sheet for a cozy pixel-art idle game with THREE different characters, four poses each. The sheet is a grid of THREE rows and four columns: each row is ONE character, one pose per cell, evenly spaced, nothing touching, with a slightly wider gap between the rows. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all four of its poses, exactly like the attached animation sheet reference. All are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw every character about 76 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose. Raised arms and items may reach higher.

The four columns are the same for every character: (1) standing, facing the viewer. (2) at work, facing right. (3) cheering. (4) their big moment.

ROW 1, CHARACTER 1: a big, round, jolly beekeeper with light skin, rosy cheeks and a bushy ginger-red beard and moustache, a cream beekeeper's suit with a brown belt and big pockets, a wide cream beekeeper's hat with its fine net veil folded up over the brim so his whole face shows, yellow gloves and brown boots. His item is a small round jar of golden honey.
(1) standing, the honey jar in one hand at his side, laughing. (2) holding a wooden frame of golden honeycomb in both hands at waist height and looking at it fondly. (3) cheering, lifting his wide hat high with one hand. (4) leaning to the right and holding the honey jar out at chest height, as if sharing it with a neighbour, with a big friendly grin, while three small round bees sit in a row on his hat brim. No bees in the air.

ROW 2, CHARACTER 2: a curvy, brisk businesswoman with light skin, big glossy chestnut-brown hair swept up high with a sprig of lavender in it, dark sunglasses pushed up on top of her hair so her eyes show, gold hoop earrings, a smart dark green trouser suit with a small gold two-leaf sprout badge on the lapel and a gold belt buckle, and black heeled shoes. Her item is a slim green ledger book.
(1) standing with her arms folded and the ledger tucked under one arm, a confident smile. (2) writing in the open ledger held at chest height with a pencil. (3) cheering, holding the closed ledger high above her head. (4) holding out a bunch of fresh mint at chest height in one hand while tapping the ledger with the other, with a brisk, satisfied nod.

ROW 3, CHARACTER 3: a slim, lively weaver in her thirties with light olive skin, rosy cheeks and a tall bun of black hair tied with a red ribbon, a sky-blue dress with rolled sleeves, a cream canvas apron with a simple rope knot stitched on its pocket, a long woven scarf striped cream, red and sky blue, and brown lace-up boots. Her item is a wooden weaving shuttle wound with cream thread.
(1) standing with the shuttle in one hand, eyes half closed and a small happy closed-mouth smile, as if humming to herself. (2) passing the shuttle from one hand to the other at chest height, as if weaving. (3) cheering, the shuttle held high, one heel kicked up. (4) holding up a long finished strip of striped canvas in both hands at chest height, beaming with pride.

Every character looks cheerful and wide awake in every pose. Nothing is held up to a face or a mouth, and nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 10: Managers of Loomington floors 4 to 6: Kit Foldaway, Barley Biggs, Hazel Thimble

- **File name:** `b04_10_managers_w2_floors04_06.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The papermaker and kite builder, the grumpy cook with a heart of gold (Rare, ability Lunch Rush) and the master tailor (Epic, ability Stitch in Time). Pose 4 is what Barley and Hazel do when the player uses their ability.
- **Parts we cut from it:** 12 poses, 4 per character, in 96×96 frames with the feet on row 92. One head per character is redrawn by hand and reused on every frame. The standing pose also gives the card picture and the 48×48 bust.
- **Name flag:** Names are from the game design document (version 0.4). Barley Biggs is from your second manager lineup; Kit and Hazel are new.

```text
Use the attached animation sheet and the lineup with a robot in it for style only (pixel size, outline, shading, colours). The lineup with the robot also shows CHARACTER 2: the grumpy chef in the white hat, fourth from the left. Keep their faces, hair, outfits and colours, but draw them in the crisp, flat pixel style of the animation sheet, not in a soft painted style. CHARACTERS 1 and 3 are new.

A character animation sheet for a cozy pixel-art idle game with THREE different characters, four poses each. The sheet is a grid of THREE rows and four columns: each row is ONE character, one pose per cell, evenly spaced, nothing touching, with a slightly wider gap between the rows. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all four of its poses, exactly like the attached animation sheet reference. All are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw every character about 76 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose. Raised arms and items may reach higher.

The four columns are the same for every character: (1) standing, facing the viewer. (2) at work, facing right. (3) cheering. (4) their big moment.

ROW 1, CHARACTER 1: a short, wiry, cheerful man in his sixties with deep brown skin, a neat white chin beard, round wire glasses, a folded paper hat shaped like a little boat, a mustard-yellow cardigan over a cream shirt, a teal neckerchief, brown corduroy trousers and brown shoes, with a canvas satchel of rolled paper on his hip. His item is a small paper kite shaped like a bird, in sky blue and cream, with a short tail of cream ribbons.
(1) standing with the bird kite tucked under one arm, grinning. (2) folding a sheet of cream paper at chest height. (3) cheering, holding the kite up high over his head, one foot kicked up. (4) running to the right holding the kite string, the bird kite flying just above and behind his head on a short string.

ROW 2, CHARACTER 2: a big, barrel-shaped cook with light skin, a red nose, bushy grey eyebrows, a big grey handlebar moustache and grey sideburns, a tall white chef's hat, a white cook's shirt with rolled sleeves, a long brown-and-orange apron with a yellow leaf pattern along its hem and a white towel tucked in at the waist, brown trousers and brown boots. He frowns a lot, but kindly. His item is a big wooden spoon. Do not give him a mortar and pestle: he holds the wooden spoon instead.
(1) standing with his arms folded and the spoon in one hand, a grumpy frown that is clearly not mean. (2) stirring a big copper saucepan held by its handle at waist height. No steam. (3) cheering in spite of himself: a reluctant crooked grin, the spoon raised high. (4) holding out a big wooden tray piled with sandwiches and a bowl of salad at chest height, with a gruff, kind wink.

ROW 3, CHARACTER 3: a tall, elegant tailor in her sixties with tan skin, silver hair in a sleek bun, cat-eye spectacles on a gold chain, a hazel-brown tailored coat-dress with a crisp white collar and gold buttons, a red tape measure draped around her neck, a red pincushion on her wrist and polished brown shoes, with a round brass pocket watch hanging from her belt on a short chain. Her item is a big golden needle as long as her forearm, threaded with golden thread.
(1) standing poised, holding the golden needle upright at chest height, a knowing smile. (2) stitching a cream linen sleeve draped over her arm at chest height. (3) cheering, the needle raised high, its golden thread curling in a loop. (4) swinging the pocket watch out on its chain in one hand while she pulls a long golden thread through the air in a big loop with the needle in her other hand, chin up.

Every character looks cheerful and wide awake in every pose. Nothing is held up to a face or a mouth, and nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 11: Managers of Loomington floors 7 and 8: Bjorn Barrow, Madame Loom

- **File name:** `b04_11_managers_w2_floors07_08.png`
- **Shape and size:** landscape 16:9, about 1664×936 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The Legendary hempcrete builder (ability Heave-Ho) and Madame Loom, the Exotic Head of Loomington and of the weavers' guild (ability Golden Thread). She must look like the grandest person in the city: the biggest silhouette and the richest outfit.
- **Parts we cut from it:** 8 poses, 4 per character, in 96×96 frames with the feet on row 92. One head per character is redrawn by hand and reused on every frame. The standing pose also gives the card picture and the 48×48 bust.
- **Name flag:** Names are from the game design document (version 0.4). Both are new.

```text
Use the attached animation sheet and the lineup with a robot in it for style only (pixel size, outline, shading, colours). Both characters are new.

A character animation sheet for a cozy pixel-art idle game with TWO different characters, four poses each. The sheet is a grid of TWO rows and four columns: each row is ONE character, one pose per cell, evenly spaced, nothing touching, with a slightly wider gap between the rows. Full body in every cell. Each character has the same face, outfit, colours, size and proportions in all four of its poses, exactly like the attached animation sheet reference. All are chunky, about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.

SIZE: draw every character about 76 big square pixels tall from the feet to the top of the head, hair and hats included, with wide empty space around every pose. Raised arms and items may reach higher.

The four columns are the same for every character: (1) standing, facing the viewer. (2) at work, facing right. (3) cheering. (4) their big moment.

ROW 1, CHARACTER 1: a huge, gentle bear of a builder with ruddy light skin and a big blond beard in two thick braids, a yellow builder's hard hat, a red-and-black checked shirt with rolled sleeves, sand-coloured canvas dungarees, a leather tool belt with a trowel and a spirit level, and heavy brown boots. His item is a pale speckled building block.
(1) standing with the block resting on one shoulder, a warm grin. (2) setting the block down at chest height and tapping it level with the trowel. (3) cheering, holding the block high over his head in one hand. (4) legs braced wide, lifting a stack of four pale blocks above his head with both arms, mouth open in a big cheerful shout.

ROW 2, CHARACTER 2: a tall, regal woman in her seventies with warm light-brown skin, a towering silver-white beehive of hair wound round with a band of golden thread, small gold earrings shaped like thread spools, a high-collared plum velvet gown with gold brocade, a long sweeping cape woven in bands of gold, plum, cream and sky blue with a gold tassel fringe, gold rings and plum shoes. Her item is a tall slim walking cane of dark polished wood topped with a golden spool wound with golden thread. She is a little taller than everyone else, and her cape makes her the widest shape on the sheet.
(1) standing grand and tall, the cane planted at her side, chin up, a gracious smile. (2) holding a length of fine cream cloth up at chest height between both hands, inspecting it with approval. (3) cheering, raising the cane high, her cape flaring out. (4) sweeping the cane in a wide arc, a long ribbon of golden thread unspooling from its top in a big loop around her.

Every character looks cheerful and wide awake in every pose. Nothing is held up to a face or a mouth, and nothing gives off steam, smoke or mist. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 16:9.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 12: Baron Fauxliage, the plastic-plant salesman: poses and expressions

- **File name:** `b04_12_baron_fauxliage.png`
- **Shape and size:** square 1:1, about 1254×1254 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The game's comic foil. He sells plastic plants, turns up at the Harvest Festival and loses every time, and he is never mean. These poses play in his short scenes and at the Festival.
- **Parts we cut from it:** 9 poses in 96×96 frames with the feet on row 92, like the managers. One head is redrawn by hand.
- **Name flag:** Baron Fauxliage's name and role are from the game design document (version 0.4).

```text
Use the attached animation sheet and the lineup with a robot in it for style only (pixel size, outline, shading, colours). Do not copy their characters.

A character sheet for a cozy pixel-art idle game: the SAME character in nine poses and expressions, in a grid of three rows and three columns, evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge. Full body in every cell, the same face, outfit, colours, size and proportions in every pose, exactly like the attached animation sheet reference. He is chunky, about two and a half heads tall. SIZE: draw him about 76 big square pixels tall from his feet to the top of his hat, with wide empty space around every pose. Feet in each row stand on the same baseline.

THE CHARACTER: a tall, thin, dapper salesman in his fifties with pale skin, rosy cheeks, a long nose and a thin black moustache curled up at the tips, slicked-back black hair with one grey streak, a lime-green bowler hat with a shiny bright pink plastic flower in its band, a loud checked suit in lime green and bubblegum pink, a yellow bow tie, white spats and shiny black shoes. His item is a too-perfect plastic plant in a shiny bright pink planter: its leaves are glossy, all exactly alike and an unnaturally bright green, and a small blank price tag hangs from it on a string. His face is friendly and a little silly, never sly or mean.

Row 1: (1) standing proudly, presenting the plastic plant on one palm at chest height with a big salesman's smile. (2) the same pose with eyes closed in a happy blink. (3) talking, one hand held out palm up in the middle of a sales pitch, the plant tucked under his other arm.
Row 2: (4) walking to the right, mid-stride, carrying the plant. (5) polishing a plastic leaf with a small cloth at chest height, very pleased with himself. (6) surprised, eyes wide and eyebrows up, his hat hopping up a little off his head.
Row 3: (7) holding a small plain grey rosette at chest height with a sheepish, good-natured smile: he came second again. (8) clapping politely for someone else, a good sport. (9) shoulders slumped in comic despair, the plastic plant drooping in his hands, a big pout.

Nothing is held up to his face. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: square 1:1.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 13: Mayor Thyme crowns a Head: four poses

**Attach with this prompt:** `b03_14_mayor_thyme.png`

- **File name:** `b04_13_mayor_thyme_crowning.png`
- **Shape and size:** landscape 16:9, about 1664×936 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The crowning scene at the Harvest Festival, when a world earns its tenth Mastery star and its Head becomes Godly. It is the biggest moment in the game. These four poses join the four you made in Batch 3.
- **Parts we cut from it:** 4 poses in 96×128 frames with the feet on row 124 (the raised crown needs the extra height). The crown is also cut out on its own.
- **Name flag:** Mythic and Godly are from the Game Designer's call of 2026-11-27 (design version 0.5). The look is the Art Director's.

```text
Use the attached animation sheet and the lineup with a robot in it for style only (pixel size, outline, shading, colours). Do not copy their characters.

A character animation sheet for a cozy pixel-art idle game: ONE character in four poses, in one row of four cells across the middle of the image, evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge. Leave wide empty space above and below the row. Full body in every cell, the same face, outfit, colours, size and proportions in every pose. He is the man in the attached sheet of four poses with a top hat: keep his face, outfit and colours exactly. SIZE: draw him exactly as big as in that sheet: about 76 big square pixels from his feet to the top of his head, and about 96 to the top of his top hat. Feet in all four cells stand on the same baseline.

THE CHARACTER: a short, round, beaming older man with warm brown skin, a neat grey goatee and twinkly eyes, a tall dark green top hat with a sprig of thyme tucked in its band, a sky-blue frock coat with gold buttons and short tails, a cream waistcoat, a red-and-gold sash from one shoulder to the other hip, a gold chain of office with a round medallion showing a two-leaf sprout, grey striped trousers and shiny black shoes. His item is a small crown of polished white gold, a circlet with five upright points shaped like sprout leaves and one round pearl at the front, about 24 big square pixels wide and 14 tall, on a plum velvet cushion with a gold tassel at each corner.

(1) Standing proudly, facing the viewer, holding the velvet cushion with the crown on it at chest height in both hands. (2) Facing right, holding the crown out in both hands at the height of his own head, as if setting it gently on the head of someone standing in front of him. (3) Raising the crown high above his head in both hands, mouth open in a joyful announcement. (4) Clapping his hands at chest height, beaming, the cushion tucked under one arm.

He looks cheerful and wide awake in every pose. Nothing is held up to his face. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

CAST: characters invented for this game, not based on any real person or any existing cartoon character.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 16:9.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 4: Weekend events

**New chat. Attach Set A:** `B4_floor04_garden_shed_nursery_v2.png` and `B4_floor_frame_shell.png`. **Some prompts in this round need more pictures as well.** Each one is named in bold at its top.

### Prompt 14: Weekend event emblems: Herb Fair, Night Market, Hemp Harvest Home, Blossom Parade

**Attach with this prompt:** `b02_02_currency_icons.png`

- **File name:** `b04_14_event_emblems.png`
- **Shape and size:** square 1:1, about 1254×1254 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The four weekend events, one each weekend in turn. The emblem shows on the event banner, the fair stall and the reward track.
- **Parts we cut from it:** 4 emblems at 48×48 art pixels. The smaller sizes are drawn by hand.
- **Name flag:** Event names are from the game design document (version 0.4).

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

Four event emblems for a cozy pixel-art idle game, in two rows of two, evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge. Each is one bold, simple object that reads at a glance at a small size, drawn like the attached currency icons: chunky, turned a little toward the viewer, with a golden-yellow highlight on its upper left. SIZE: each emblem fits inside a square of 44 by 44 big square pixels.

Row 1:
1. A little round wicker basket heaped with bunches of fresh green herbs, with a small red-and-cream striped pennant flag on a short stick standing up out of it.
2. A round warm golden paper lantern with dark red caps at its top and bottom, hanging from a short curved iron hook, with a small pale crescent moon tucked behind it on its upper right.

Row 2:
3. An upright sheaf of long, straight, pale golden stalks like straw, tied around the middle with a thick cream rope in a knot, the stalk ends fanned out a little at the top and the bottom. No leaves anywhere on it.
4. A small round parade drum in cream with red rims and gold cords, crowned with a cluster of pink and lavender blossoms and two small green leaves.

No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: square 1:1.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 15: Fair stall dressing for the weekend events

**Attach with this prompt:** `B4_floor01_windowsill_planter_v2.png`

- **File name:** `b04_15_fair_stall_dressing.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** On event weekends the fair stall, a five-floor mini tower, reuses World 1 rooms 1 to 5. These pieces dress those rooms up for the fair: one garland across the top of each room for each event, and the same awning, prize table, ticket booth and pennant pole every time.
- **Parts we cut from it:** 8 pieces: four garland swags (168×24), an awning strip (64×20) that repeats, a prize table (88×56), a ticket booth (56×80) and a pennant pole (12×72), all in art pixels.
- **Name flag:** Event names are from the game design document (version 0.4).

```text
Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). Do not copy their content.

A set of fair decorations for a cozy pixel-art idle game, laid out in three rows, evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge. Each piece is seen straight from the front. Sizes are given in big square pixels; keep every piece at its size.

Row 1:
1. A string of triangle bunting flags in red, cream, leaf green, mustard and lavender, repeating: one swag about 168 big square pixels wide and 24 tall, hanging in a gentle curve from a cord whose left and right ends are at exactly the same height, so that copies join end to end.
2. A string of small round paper lanterns in warm gold, rose and lavender on a dark cord: one swag about 168 big square pixels wide and 24 tall, hanging in a gentle curve from a cord whose left and right ends are at exactly the same height, so that copies join end to end.

Row 2:
3. A thick cream rope hung with small tied bundles of pale straw-like stalks: one swag about 168 big square pixels wide and 24 tall, hanging in a gentle curve from a cord whose left and right ends are at exactly the same height, so that copies join end to end.
4. A garland of pink and lavender blossoms and small green leaves: one swag about 168 big square pixels wide and 24 tall, hanging in a gentle curve from a cord whose left and right ends are at exactly the same height, so that copies join end to end.

Row 3:
5. A short strip of shop awning with red and cream vertical stripes and a scalloped bottom edge, about 64 wide and 20 tall, whose left and right ends match so that copies join into one long awning.
6. A prize table: a small wooden trestle table with a red-and-cream checked cloth, holding a big basil plant in a planter with a blue prize rosette pinned to it, a jar of golden honey and a small gold trophy cup, about 88 wide and 56 tall.
7. A small wooden ticket booth with a red-and-cream striped roof, a round sprout sign on top with nothing written on it, and an empty counter, about 56 wide and 80 tall.
8. A tall pole with red and cream spiral stripes, topped with a small gold knob and a little green triangle pennant, about 12 wide and 72 tall.

No people, no plants other than the basil and the blossoms, and no writing on any sign. No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. The game adds those.

HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

---

## Round 5: The five new top rarities: Mythic, Godly, Ungodly, Holy, Grailed

**New chat. Attach Set D:** `b01_11_chest_opening_frames.png` and `B25_card_layout_mockup.png`. **Some prompts in this round need more pictures as well.** Each one is named in bold at its top.

### Prompt 16: Card frames: Mythic, Godly, Ungodly

**Attach with this prompt:** `ref_card_frames_six.png`

- **File name:** `b04_16_card_frames_mythic_godly_ungodly.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** Three of the five new card frames. Mythic sits between the gold Legendary frame and the pearly Exotic one; Godly and Ungodly sit above Exotic. Each must look grander than the one before it, and the shapes tell them apart without colour.
- **Parts we cut from it:** 3 frames at 180×240 art pixels. The small card frames and the pips are made by hand.
- **Name flag:** The eleven rarities are Lawson's (2026-11-28); design version 0.5 carries them. The look is the Art Director's (style bible v1.7).

```text
Use the reference images attached in this chat for style (pixel size, outline, shading, colours). The attached pictures of the six card frames and of the six rarity badges and bursts are the set these new pieces join: match their size, layout and level of detail exactly, but do not copy their ornaments.

Three empty collectible card frames for a cozy pixel-art idle game, side by side in one row, evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge. All three have exactly the same size and the same layout as the attached six card frames: a tall card exactly 180 big square pixels wide and 240 tall, with an ornate border, an arched picture window in the upper half, a blank name ribbon across the middle, and a blank parchment panel in the lower part with two plain empty rows. Only the border ornament and its colours change. The picture window is EMPTY and transparent. The ribbon and the panel are plain, with no writing, numbers, icons or bars on them. No plant and no picture anywhere.

The game has eleven rarities, each clearly grander than the one before: Common, Uncommon, Rare, Epic, Legendary, Mythic, Exotic, Godly, Ungodly, Holy, Grailed. You can see the first five, and Exotic, in the attached pictures.

Left to right:
1. Mythic: a deep midnight-blue border edged with thin gold, with flowing ribbons in aurora colours: green-teal flowing into violet waving along it, a large fully open flower with long pointed petals in teal and violet and a gold centre at the top centre, a smaller open flower at the bottom centre, and small closed buds along each side. It is richer than the gold Legendary frame and a little less grand than the pearly Exotic frame.
2. Godly: a radiant border of polished white gold with thick gold edges. At the top centre sits a small crown of polished white gold, a circlet with five upright points shaped like sprout leaves and one round pearl at the front, with short straight spikes of solid gold fanning out behind it like a sunburst. A row of small pearls runs down each side, and a gold laurel spray sits at the bottom centre. It is brighter and heavier than the Exotic frame.
3. Ungodly: a dramatic border of dark plum-black polished stone with a thin ruby-red inner edge. At the top centre is an eclipsed sun: a round black disc ringed by a blazing corona of short ruby-red and gold spikes. Small ruby gems run down each side, and a dark crescent with a gold rim sits at the bottom centre. It is the dark, striking step after Godly, and grander than it.

No wings, no halo above anything, no cross, star of any faith or other religious sign. No glow halo, no soft light and no floating dots anywhere in the image. Hard pixel edges only.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 17: Card frames: Holy and Grailed

**Attach with this prompt:** `ref_card_frames_six.png`

- **File name:** `b04_17_card_frames_holy_grailed.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The two highest card frames. Grailed is the top of the whole ladder and must be the grandest frame in the game.
- **Parts we cut from it:** 2 frames at 180×240 art pixels. The small card frames and the pips are made by hand.
- **Name flag:** The eleven rarities are Lawson's (2026-11-28); design version 0.5 carries them. The look is the Art Director's (style bible v1.7).

```text
Use the reference images attached in this chat for style (pixel size, outline, shading, colours). The attached pictures of the six card frames and of the six rarity badges and bursts are the set these new pieces join: match their size, layout and level of detail exactly, but do not copy their ornaments.

Two empty collectible card frames for a cozy pixel-art idle game, side by side in one row, evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge. Both have exactly the same size and the same layout as the attached six card frames: a tall card exactly 180 big square pixels wide and 240 tall, with an ornate border, an arched picture window in the upper half, a blank name ribbon across the middle, and a blank parchment panel in the lower part with two plain empty rows. Only the border ornament and its colours change. The picture window is EMPTY and transparent. The ribbon and the panel are plain, with no writing, numbers, icons or bars on them. No plant and no picture anywhere. They join the Mythic, Godly and Ungodly frames you made in the previous image, and must look grander still.

The game has eleven rarities, each clearly grander than the one before: Common, Uncommon, Rare, Epic, Legendary, Mythic, Exotic, Godly, Ungodly, Holy, Grailed. You can see the first five, and Exotic, in the attached pictures.

Left to right:
1. Holy: a gleaming border of pearl white with a pale sky-blue and soft rose shimmer along its edges. At the top centre a big round lustrous pearl rests on a small soft white cloud, inside a thin ring of silver. Rows of small pearls are set along the sides, and white cloud scrolls curl at the bottom centre. It is the calm, shining step after the dark Ungodly frame.
2. Grailed: a heavy border of rich polished gold that looks almost liquid, with a braided ribbon running all the way round it in ten colours: wood brown, leaf green, sapphire blue, amethyst purple, gold, aurora teal, prism rose, white gold, ruby red and pearl white. At the top centre sits a small golden watering can, tipped forward, set with a tiny gem in each of those colours, pouring three golden drops. Small gold leaves curl at each corner and a gold two-leaf sprout sits at the bottom centre. It is the grandest frame in the game.

No wings, no halo above anything, no cross, star of any faith or other religious sign. No glow halo, no soft light and no floating dots anywhere in the image. Hard pixel edges only.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 18: Rarity badges: Mythic to Grailed, and the crown

**Attach with this prompt:** `ref_rarity_badges_bursts.png`

- **File name:** `b04_18_rarity_badges_mythic_grailed.png`
- **Shape and size:** landscape 3:2, about 1536×1024 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The five new rarity badges and the small crown a Godly Head wears. A badge appears wherever rarity shows: the frame, the small card, the inventory slot, the chest light and the reveal.
- **Parts we cut from it:** 5 badges at 48×48 and the crown at about 24×14, all in art pixels.
- **Name flag:** The eleven rarities are Lawson's (2026-11-28); design version 0.5 carries them. The look is the Art Director's (style bible v1.7).

```text
Use the reference images attached in this chat for style (pixel size, outline, shading, colours). The attached pictures of the six card frames and of the six rarity badges and bursts are the set these new pieces join: match their size, layout and level of detail exactly, but do not copy their ornaments.

Rarity badges for a cozy pixel-art idle game, in two rows of three, evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge. Draw the badges like the attached six rarity badges: chunky, seen from the front, with a golden-yellow highlight on the upper left. SIZE: each badge fits inside a square of 44 by 44 big square pixels. The game has eleven rarities, each clearly grander than the one before: Common, Uncommon, Rare, Epic, Legendary, Mythic, Exotic, Godly, Ungodly, Holy, Grailed. You can see the first five, and Exotic, in the attached pictures. Each new badge must look clearly richer than the one before it.

Row 1:
1. Mythic: an open flower with long pointed petals that shade from green-teal at the centre to violet at the tips, around a round gold centre, on a small round midnight-blue plate with a thin gold rim.
2. Godly: a small crown of polished white gold, a circlet with five upright points shaped like sprout leaves and one round pearl at the front, standing in front of a round white-gold sunburst disc with short straight solid spikes.
3. Ungodly: an eclipsed sun: a round black disc with a thin ruby rim, ringed by a blazing corona of short ruby-red and gold spikes.

Row 2:
4. Holy: a big round lustrous pearl resting on a small soft white cloud, inside a thin ring of silver.
5. Grailed: a small golden watering can, tipped forward, set with tiny gems in green, blue, purple, teal, rose and ruby, with a braided ribbon of many colours tied round its handle.
6. The crown on its own: a small crown of polished white gold, a circlet with five upright points shaped like sprout leaves and one round pearl at the front, seen from the front, about 24 big square pixels wide and 14 tall, made to sit on top of a character's head. It is the same crown as in badge 2.

No wings, no halo above anything, no cross, star of any faith or other religious sign. No glow halo, no soft light and no floating dots anywhere in the image. Hard pixel edges only.

STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.

BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.

Image shape: landscape 3:2.

FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. If you cannot make the zip, the image alone is fine.
```

### Prompt 19: Reveal bursts: Mythic to Grailed

**Attach with this prompt:** `ref_rarity_badges_bursts.png`

- **File name:** `b04_19_reveal_bursts_mythic_grailed.png`
- **Shape and size:** portrait 2:3, about 1024×1536 (any size ChatGPT gives at this shape is fine)
- **Transparent background:** Yes
- **Purpose:** The bursts that play when a card of each new rarity is revealed, from aurora petals for Mythic to a fountain of golden drops and confetti for Grailed. The game adds the light, rays and screen colour around them.
- **Parts we cut from it:** 20 frames: 5 rarities × 4 frames, each burst on a 64×64 art pixel cell.
- **Name flag:** The eleven rarities are Lawson's (2026-11-28); design version 0.5 carries them. The look is the Art Director's (style bible v1.7).

```text
Use the reference images attached in this chat for style (pixel size, outline, shading, colours). The attached pictures of the six card frames and of the six rarity badges and bursts are the set these new pieces join: match their size, layout and level of detail exactly, but do not copy their ornaments.

An effects sheet for a cozy pixel-art idle game, drawn like the bursts in the attached picture: five rows of four frames, evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge. Each frame is a cell of 64 by 64 big square pixels. Each row is one short burst animation that grows from frame 1 to frame 3 and fades and scatters in frame 4. Each row must look clearly bigger and richer than the row above it, and richer than every burst in the attached picture.
Row 1, Mythic: long pointed flower petals in teal, green-teal and violet spiralling outward, with small round gold pollen grains and four-point sparkles in teal and violet.
Row 2, Godly: a ring of short straight white-gold spikes like a sunburst, small round pearls and gold laurel leaves flying outward, with eight-point white and gold sparkles.
Row 3, Ungodly: sharp plum-black shards and ruby-red and gold sparks flying outward from a dark centre in a ring, with a thin ruby ring expanding behind them.
Row 4, Holy: lustrous pearls and small round white cloud puffs spreading outward in a wide ring, with silver and pale blue four-point sparkles.
Row 5, Grailed: a fountain of golden water drops and tiny confetti pieces in wood brown, leaf green, sapphire blue, amethyst purple, gold, aurora teal, prism rose, white gold, ruby red and pearl white, bursting up and out, with gold eight-point sparkles and a few small gold leaves.
Hard pixel edges only, no glow halo and no soft light around any effect. No dollar signs, plus signs, numbers or text. No wings, no halo above anything, no cross, star of any faith or other religious sign.

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
| Sparkles, glints, stars, music notes or dots appear where they should not | `Same image with every sparkle, glint, star, music note, light ray and floating dot removed. Keep everything else.` |
| Workers are drawn too big | `Redo with the same characters and poses, drawn smaller: about 64 big square pixels tall from the feet to the top of the head, hats included, with lots of empty space around each one.` |
| Managers, the Baron or the Mayor are drawn too big | `Redo with the same characters and poses, drawn smaller: about 76 big square pixels tall from the feet to the top of the head, hats included, with lots of empty space around each one.` |
| A card frame or badge is drawn the wrong size | `Redo the same pieces at the size given: each card frame exactly 180 big square pixels wide and 240 tall, each badge inside 44 by 44.` |
| A cross, halo, wings or other religious sign appears | `Same piece with that sign removed and nothing in its place except the ornament the description names.` |
| Something is held to a face, or steam or smoke appears | `Same pose, but keep every item at chest height or lower, away from the face, and remove all steam, smoke and mist.` |
| A leaf appears on the Hemp Harvest Home emblem or in the stalk garland | `Same piece, but only straight pale stalks tied with rope: no leaves anywhere on it.` |
| A garland's two ends hang at different heights | `Same garland, but its left and right ends hang at exactly the same height, so two copies join end to end.` |
| The character changes between poses | `Redo the sheet. Every pose must show the exact same character as pose 1: same face, hair, outfit, colours and body size.` |
| A person looks like someone real or a known cartoon | `Redo with a clearly different, original face and hairstyle.` |
| Wrong number of items | `Redo with exactly the number of items, rows and columns listed in the prompt.` |
| Light comes from the right | `Same image with the light coming from the upper left.` |
| Too busy or too detailed | `Same image, simpler: fewer details, bigger shapes, only 3 to 4 flat tones per material.` |
| No zip came with the picture | `Please also give me the zip: the sheet as exact pixel art, each item as a true-size transparent PNG, and a slices.json.` |

## What happens after you upload

1. Each image is checked against Gate A of the style bible, and its size is measured against the size the prompt asked for. If one needs a redo, you get its number and the exact sentence to send.
2. Accepted images go through the clean-up route and become game-size sprites.
3. Every image with hemp in it (prompts 3, 4, 6, 7, 8, 9, 10, 11, 14, 15) is checked with the five-question hemp review.
