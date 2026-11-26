# Production Asset Batch 2: Finish World 1

Part of the [Style Bible](STYLE_BIBLE.md). Batch revision: **1**. Style suffix version: **v1**. Hemp guards version: **v1**. Written by `tools/build_asset_batch_02.py`, which copies the suffix and guards word for word from section 21 of the bible. Never edit this file by hand.

**6 images so far, in 2 rounds.** The rounds below are ready to run now. These come next and will be added to this file without changing the numbers of the prompts already here:

- Round 3: Soap and Scent Workshop props (soap kettle, moulds, drying racks, manager stool) and the back walls of floors 9 and 10
- Round 4: Pip the seedling guide, and the first sheet with two workers on it
- Rounds 5 and 6: worker sheets for the rest of floors 4 to 10, and the second workers of floors 1 to 10

The manager images are not in this batch. They wait until the new manager list (one manager per floor) is approved, then follow as a short round of their own.

Names follow the game design document, which is still in review. Each prompt describes a look, not a name, so a rename does not spoil an image. The prompt's **Name flag** says what could still change.

## How to do it on your phone

1. Each round is **one new ChatGPT chat**.
2. At the start of a round, **attach that round's two reference images** from your expansion pack (listed below) and paste the round's first prompt in the same message.
3. Then paste the round's other prompts **one at a time, in the same chat**. You do not need to attach the reference images again.
4. Each prompt is one grey box. Copy the whole box, change nothing.
5. New in this batch: the end of every prompt asks ChatGPT for the zip it made on its own last time (true-size parts and a slices file). **Upload the zip as well as the picture.** If ChatGPT makes no zip, the picture alone is fine.
6. Save each picture as it comes: **PNG, original size**. No screenshots, no JPG, no cropping or resizing.
7. Upload the results to the project, in number order, or tell me which number each one is.
8. If a result looks wrong, use the matching sentence from "If a result is off" near the bottom. If it is still off after two tries, upload it anyway and tell me. A lot can be fixed in clean-up.

### The reference sets

| Set | For | Attach these two images |
|---|---|---|
| **C** | Plants and items | `B24_plant_growth_stages.png` and `B23_exotic_plants.png` |

Both are from your expansion pack, the same as in Batch 1.

### The rounds

| Round | Theme | Attach | Prompts | Priority |
|---|---|---|---|---|
| 1 | Visitors and currency icons | Set C | 1, 2 | Needed first |
| 2 | Herbs | Set C | 3, 4, 5, 6 | Needed first |

### All prompts at a glance

| # | Image | File name | Shape | Transparent |
|---|---|---|---|---|
| 1 | Visitors: three Golden Sprouts, Dewdrop, Mystery Crate, Busy Bee | `b02_01_visitors.png` | landscape 4:3 | Yes |
| 2 | Currency icons: Insight, Pollen, Skill Points, Shells, Snowmarks, Fair Tickets | `b02_02_currency_icons.png` | landscape 3:2 | Yes |
| 3 | Herb card art: four Common herbs | `b02_03_herb_cards_common.png` | square 1:1 | Yes |
| 4 | Herb card art: four Uncommon herbs | `b02_04_herb_cards_uncommon.png` | square 1:1 | Yes |
| 5 | Herb card art: five more World 1 herbs | `b02_05_herb_cards_rare.png` | landscape 3:2 | Yes |
| 6 | Herb growth stages: thyme, sage, chamomile | `b02_06_herb_growth_stages.png` | landscape 4:3 | Yes |

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
| Wrong number of items | `Redo with exactly the number of items, rows and columns listed in the prompt.` |
| Light comes from the right | `Same image with the light coming from the upper left.` |
| Too busy or too detailed | `Same image, simpler: fewer details, bigger shapes, only 3 to 4 flat tones per material.` |
| No zip came with the picture | `Please also give me the zip: the sheet as exact pixel art, each item as a true-size transparent PNG, and a slices.json.` |

## What happens after you upload

1. Each image is checked against Gate A of the style bible. If one needs a redo, you get its number and the exact sentence to send.
2. Accepted images go through the clean-up route and become game-size sprites.
3. Any image with hemp in it is checked with the five-question hemp review.
