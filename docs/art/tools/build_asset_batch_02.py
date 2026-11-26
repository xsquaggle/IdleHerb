#!/usr/bin/env python3
"""Builds ASSET_BATCH_02.md. The style suffix and hemp guards are read word for word from section 21 of the style bible.

Usage: python3 build_asset_batch_02.py ../ASSET_BATCH_02.md
"""
import os
import re
import sys

OUT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- fixed blocks, from STYLE_BIBLE.md section 21
bible = open(os.path.join(HERE, '..', 'STYLE_BIBLE.md'), encoding='utf-8').read()
sec21 = bible.split('## 21. The fixed prompt suffix', 1)[1].split('### Prompt grammar', 1)[0]
blocks = re.findall(r'```text\n(.*?)\n```', sec21, re.S)
STYLE, BG_T, BG_P, HEMP, HEMP_P = blocks
assert STYLE.startswith('STYLE (Sprout Tower house style v1)') and HEMP.startswith('HEMP LOOK') and HEMP_P.startswith('HEMP PRODUCTS')

REF = ("Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). "
       "Do not copy their content.")
CAST = "CAST: characters invented for this game, not based on any real person or any existing cartoon character."
GRID = "evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge"
NO_FX = "No sparkles, glints, light rays, motion lines or floating dots anywhere in the image. The game adds those."
# Lawson's ChatGPT sent this package unasked in Batch 1. The clean-up route depends on it, so Batch 2 asks for it.
FILES = ("FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel "
         "the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, "
         "one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. "
         "If you cannot make the zip, the image alone is fine.")

P = []


def add(n, title, fname, shape, size, transparent, refset, purpose, breakdown, flag, body, hemp=False, bg=BG_T,
        cast=False, ref=REF, extra=None):
    assert n == len(P) + 1, 'prompts must be numbered in order'
    parts = [ref, body]
    if cast:
        parts.append(CAST)
    if hemp == 'plant':
        parts.append(HEMP)
    elif hemp == 'product':
        parts.append(HEMP_P)
    parts += [STYLE, bg, f"Image shape: {shape}.", FILES]
    text = "\n\n".join(parts)
    # the design word list (GDD 2.3): planter, never the three-letter word
    assert not re.search(r'\bpots?\b', text, re.I), f'prompt {n} says pot'
    P.append(dict(n=n, title=title, fname=fname, shape=shape, size=size, transparent=transparent, refset=refset,
                  purpose=purpose, breakdown=breakdown, flag=flag, extra=extra, prompt=text))


SPROUT = ("a plump golden seed with a small two-leaf golden sprout growing from its top, floating in the air. Its two "
          "leaves are raised like little wings in frame 1 and lowered in frame 2. On the front of the seed is a small "
          "round cream badge")
CARDS = ("Each is one whole herb plant growing in its own planter, seen from the front and slightly above, like the "
         "attached exotic plants reference. The plant is the hero and fills the upper two thirds of its cell; the "
         "planter is the lower third. Every plant has its own clear silhouette.")
STAGES = ("A plant growth chart for a cozy pixel-art farming game, like the attached growth-stage reference: three "
          "herbs, each shown at five growth stages. Three rows and five columns, " + GRID + ". Every plant grows in the "
          "same simple round terracotta planter, the same planter size in every cell, and the planters in a row stand "
          "on the same baseline. Sizes are true to each other: do NOT enlarge the small stages.\n\n"
          "Columns, left to right:\n"
          "1. A planter of dark soil with a few seeds on top.\n"
          "2. A tiny two-leaf sprout.\n"
          "3. A young plant, about one third of full size.\n"
          "4. A full-grown plant.\n"
          "5. The same full-grown plant, extra lush, with more flowers.")

# ---------------------------------------------------------------- Round 1: visitors and currency icons (Set C)
add(1, "Visitors: three Golden Sprouts, Dewdrop, Mystery Crate, Busy Bee", "b02_01_visitors.png",
    "landscape 4:3", "about 1448×1086", "Yes", "C",
    "The six things that drift across a floor for the player to catch, from floor 6 on. The three Golden Sprouts look "
    "alike on purpose, so players learn them by catching them; only the badge differs.",
    "12 frames: 6 visitors × 2 frames, each about 32×32 art pixels. The three badges are also cut out on their own.",
    "Visitor names are from the game design document, still in review. Each look is described, not named.",
    "An animation sheet of six small flying visitors for a cozy pixel-art idle game about a herb-growing tower. Each "
    "visitor is shown in two frames side by side, so the sheet has three rows of four cells: a visitor, its second "
    "frame, the next visitor, its second frame. " + GRID[0].upper() + GRID[1:] + ". The two frames of one visitor are "
    "the same size and sit in the same place in their cells, so they line up as a two-frame loop. Each visitor is "
    "small, round and chunky, about as big as a coin in the game, with one bold simple shape.\n\n"
    "Row 1:\n"
    "1 and 2. Golden Sprout: " + SPROUT + " showing a small gold coin.\n"
    "3 and 4. Sunbeam Sprout: exactly the same golden seed and sprout, the same size and pose, but its badge shows a "
    "small orange sun.\n\n"
    "Row 2:\n"
    "5 and 6. Tap Storm Sprout: exactly the same golden seed and sprout again, but its badge shows a small lilac cloud "
    "with a yellow zigzag under it.\n"
    "7 and 8. Dewdrop: a plump round water drop in clear light blue with a small green faceted gem inside it, floating "
    "on a small curled green leaf. In frame 2 the drop is squashed a little wider and lower, like a wobble.\n\n"
    "Row 3:\n"
    "9 and 10. Mystery Crate: a small wooden crate tied with a lilac ribbon bow, hanging from a fluffy white "
    "dandelion-seed parachute. In frame 2 it swings a little to the right.\n"
    "11 and 12. Busy Bee: a chubby round honeybee with golden-yellow and dark brown stripes, two small round dot eyes, "
    "small clear wings and a tiny ball of yellow pollen on one leg. Wings up in frame 1, down in frame 2.\n\n"
    "From a distance the three sprouts must look the same. Only their badges differ. " + NO_FX)

add(2, "Currency icons: Insight, Pollen, Skill Points, Shells, Snowmarks, Fair Tickets", "b02_02_currency_icons.png",
    "landscape 3:2", "about 1536×1024", "Yes", "C",
    "The six currencies that have no icon yet. Your B12 sheet covers Coins, Notes, Gems, Compost and Ribbons. Shells, "
    "Snowmarks and Fair Tickets come later in the game, but drawing them now in the same chat keeps all eleven "
    "currencies alike and saves three images in later batches.",
    "6 icons at 48×48 art pixels. The 32, 24 and 16 pixel sizes are redrawn by hand.",
    "Currency names are from the game design document, still in review. Insight must stay a lightbulb with a sprout, "
    "so nothing reads as a laboratory.",
    "Six currency icons for a cozy pixel-art idle game, in two rows of three, " + GRID + ". Each icon is one bold, "
    "simple object that reads at a glance at a small size, drawn like a game coin or token: chunky, turned a little "
    "toward the viewer, with a golden-yellow highlight on its upper left.\n\n"
    "Row 1:\n"
    "1. A round glass lightbulb on a short brass screw base, with a small two-leaf green sprout growing inside the "
    "glass. The inside of the bulb is a warm pale gold.\n"
    "2. A fluffy round ball of golden-yellow pollen, like a tiny pompom, sitting in the middle of a small five-petal "
    "cream flower.\n"
    "3. An upright lavender-purple seed, shaped like an acorn without its cap and cut with flat gem facets, with a "
    "tiny green two-leaf sprout on top.\n\n"
    "Row 2:\n"
    "4. A pink and cream scallop seashell with ridged fan lines and a tiny pearl at its hinge.\n"
    "5. A round pale blue token stamped with a white six-point snowflake. Its rim is knitted like the red wool cuff of "
    "a mitten.\n"
    "6. A cream paper ticket with zigzag torn ends, a red stripe along each long edge and a small two-leaf sprout "
    "stamped in its middle. No writing on it.\n\n" + NO_FX)

# ---------------------------------------------------------------- Round 2: herbs (Set C)
add(3, "Herb card art: four Common herbs", "b02_03_herb_cards_common.png",
    "square 1:1", "about 1254×1254", "Yes", "C",
    "The pictures for the Common herb cards Kitchen Rosemary, Garden Sage, Meadow Chamomile and Garden Thyme, which a "
    "new player meets in the first hour. They sit next to your B9 mint, basil and lavender cards.",
    "4 card pictures, each brought to about 108×100 art pixels.",
    "Herb names are from the game design document, still in review. Each look is described, not named.",
    "Four hero plants for collectible cards in a cozy pixel-art farming game, in two rows of two, " + GRID + ". "
    + CARDS + " These are everyday garden herbs, so the planters are plain and homely.\n\n"
    "Row 1:\n"
    "1. Rosemary: upright woody stems covered in short grey-green needle leaves, like little bottle brushes, in a small "
    "cream enamel kitchen planter with a dark blue rim.\n"
    "2. Sage: a soft mound of long, oval, grey-green leaves with a slightly fuzzy look, in a plain terracotta planter "
    "with a small chip in its rim.\n\n"
    "Row 2:\n"
    "3. Chamomile: feathery bright green leaves and thin stems topped with small white daisies with yellow centres, in "
    "a round woven wicker basket planter.\n"
    "4. Thyme: a low, wide cushion of tiny round green leaves on thin woody stems, dotted with tiny pink-lilac flowers, "
    "in a wide shallow terracotta bowl planter.\n\n" + NO_FX)

add(4, "Herb card art: four Uncommon herbs", "b02_04_herb_cards_uncommon.png",
    "square 1:1", "about 1254×1254", "Yes", "C",
    "The pictures for the Uncommon herb cards Peppermint, Lemon Basil, Trailing Rosemary and Butterfly Lavender.",
    "4 card pictures, each brought to about 108×100 art pixels.",
    "Herb names are from the game design document, still in review. Each look is described, not named.",
    "Four hero plants for collectible cards in a cozy pixel-art farming game, in two rows of two, " + GRID + ". "
    + CARDS + " These are a little special, so the planters are glazed and painted.\n\n"
    "Row 1:\n"
    "1. Peppermint: a round bush of broad toothed leaves in a deep cool green, with purple-tinged stems, in a teal "
    "glazed planter with a white swirl painted on it.\n"
    "2. Lemon Basil: a glossy dome of pointed oval leaves in a bright yellow-green, in a sunny yellow glazed planter "
    "with a small painted lemon on its front.\n\n"
    "Row 2:\n"
    "3. Trailing Rosemary: needle-leaf stems that spill over the rim and hang down the sides, with tiny pale blue "
    "flowers, in a terracotta planter standing on a short three-legged wooden stand.\n"
    "4. Butterfly Lavender: grey-green leaves and plump purple flower heads, each topped with two small pale pink "
    "petals like tiny butterfly wings, in a lilac glazed planter. One small white butterfly rests on a flower.\n\n"
    + NO_FX)

add(5, "Herb card art: five more World 1 herbs", "b02_05_herb_cards_rare.png",
    "landscape 3:2", "about 1536×1024", "Yes", "C",
    "The pictures for Pineapple Sage, Double Chamomile, Lemon Thyme, Chocolate Mint and Purple Basil, the rest of the "
    "World 1 herb cards.",
    "5 card pictures, each brought to about 108×100 art pixels.",
    "Herb names and rarities are from the game design document, still in review. Each look is described, not named.",
    "Five hero plants for collectible cards in a cozy pixel-art farming game, in two rows: three in the top row and "
    "two in the bottom row, centred, " + GRID + ". " + CARDS + " These are prized herbs, so the planters are "
    "decorated and some have a thin gold trim.\n\n"
    "Row 1:\n"
    "1. Pineapple Sage: soft pointed green leaves and tall spikes of bright red tube-shaped flowers, in a golden-yellow "
    "planter with a criss-cross pattern like the skin of a pineapple.\n"
    "2. Double Chamomile: feathery green leaves and round fluffy white pompom flowers, full of petals, in a cream "
    "planter with a blue ribbon tied around it.\n"
    "3. Lemon Thyme: a low, wide cushion of tiny round leaves that are green in the middle and lemon yellow at the "
    "edges, in a wide shallow pale yellow bowl planter.\n\n"
    "Row 2:\n"
    "4. Chocolate Mint: a round bush of broad toothed dark green leaves with dark brown-purple stems and veins, in a "
    "chocolate-brown glazed planter with a cream glaze dripping over its rim like icing.\n"
    "5. Purple Basil: a glossy dome of big cupped dark purple leaves with a few small pink flower spikes, in a "
    "lavender-purple planter with a thin gold rim.\n\n" + NO_FX)

add(6, "Herb growth stages: thyme, sage, chamomile", "b02_06_herb_growth_stages.png",
    "landscape 4:3", "about 1448×1086", "Yes", "C",
    "Growth stages for the last three herb families. With your B24 mint and Batch 1's basil, rosemary and lavender, "
    "every herb family in World 1 can now grow on a floor.",
    "15 sprites: 3 herbs × 5 stages. The planter is shared with Batch 1, so only the foliage layers are kept.",
    "Which herb sits on which floor is the Game Designer's call. The plants are safe either way.",
    STAGES + "\n\n"
    "Row 1, thyme: a low, wide cushion of tiny round green leaves on thin woody stems. Tiny pink-lilac flowers appear at "
    "stage 4 and cover it at stage 5.\n"
    "Row 2, sage: upright stems with long, soft, oval, grey-green leaves. Short spikes of small violet-blue flowers "
    "appear at stage 5.\n"
    "Row 3, chamomile: feathery bright green leaves with thin stems. Small white daisies with yellow centres appear at "
    "stage 4 and are fullest at stage 5.\n\n" + NO_FX)

ROUNDS = [
    (1, "Visitors and currency icons", "C", [1, 2], "Needed first"),
    (2, "Herbs", "C", [3, 4, 5, 6], "Needed first"),
]
LATER = [
    "Round 3: Soap and Scent Workshop props (soap kettle, moulds, drying racks, manager stool) and the back walls of "
    "floors 9 and 10",
    "Round 4: Pip the seedling guide, and the first sheet with two workers on it",
    "Rounds 5 and 6: worker sheets for the rest of floors 4 to 10, and the second workers of floors 1 to 10",
]
SETS = {
    "A": ("Scenes", ["B4_floor04_garden_shed_nursery_v2.png", "B4_floor_frame_shell.png"]),
    "B": ("People", ["B22_character_animation_sheet.png", "B21_manager_lineup_2.png"]),
    "C": ("Plants and items", ["B24_plant_growth_stages.png", "B23_exotic_plants.png"]),
}

L = []
w = L.append
w("# Production Asset Batch 2: Finish World 1")
w("")
w("Part of the [Style Bible](STYLE_BIBLE.md). Batch revision: **1**. Style suffix version: **v1**. Hemp guards "
  "version: **v1**. Written by `tools/build_asset_batch_02.py`, which copies the suffix and guards word for word from "
  "section 21 of the bible. Never edit this file by hand.")
w("")
w(f"**{len(P)} images so far, in {len(ROUNDS)} rounds.** The rounds below are ready to run now. These come next and "
  "will be added to this file without changing the numbers of the prompts already here:")
w("")
for x in LATER:
    w(f"- {x}")
w("")
w("The manager images are not in this batch. They wait until the new manager list (one manager per floor) is "
  "approved, then follow as a short round of their own.")
w("")
w("Names follow the game design document, which is still in review. Each prompt describes a look, not a name, so a "
  "rename does not spoil an image. The prompt's **Name flag** says what could still change.")
w("")
w("## How to do it on your phone")
w("")
w("1. Each round is **one new ChatGPT chat**.")
w("2. At the start of a round, **attach that round's two reference images** from your expansion pack (listed below) "
  "and paste the round's first prompt in the same message.")
w("3. Then paste the round's other prompts **one at a time, in the same chat**. You do not need to attach the "
  "reference images again.")
w("4. Each prompt is one grey box. Copy the whole box, change nothing.")
w("5. New in this batch: the end of every prompt asks ChatGPT for the zip it made on its own last time (true-size "
  "parts and a slices file). **Upload the zip as well as the picture.** If ChatGPT makes no zip, the picture alone "
  "is fine.")
w("6. Save each picture as it comes: **PNG, original size**. No screenshots, no JPG, no cropping or resizing.")
w("7. Upload the results to the project, in number order, or tell me which number each one is.")
w("8. If a result looks wrong, use the matching sentence from \"If a result is off\" near the bottom. If it is still "
  "off after two tries, upload it anyway and tell me. A lot can be fixed in clean-up.")
w("")
w("### The reference sets")
w("")
w("| Set | For | Attach these two images |")
w("|---|---|---|")
used = sorted({s for _, _, s, _, _ in ROUNDS})
for k in used:
    name, files = SETS[k]
    w(f"| **{k}** | {name} | " + " and ".join(f"`{f}`" for f in files) + " |")
w("")
w("Both are from your expansion pack, the same as in Batch 1.")
w("")
w("### The rounds")
w("")
w("| Round | Theme | Attach | Prompts | Priority |")
w("|---|---|---|---|---|")
for r, theme, s, ns, pri in ROUNDS:
    w(f"| {r} | {theme} | Set {s} | {', '.join(str(n) for n in ns)} | {pri} |")
w("")
w("### All prompts at a glance")
w("")
w("| # | Image | File name | Shape | Transparent |")
w("|---|---|---|---|---|")
for p in P:
    w(f"| {p['n']} | {p['title']} | `{p['fname']}` | {p['shape']} | {p['transparent']} |")
w("")
w("---")
for r, theme, s, ns, pri in ROUNDS:
    w("")
    w(f"## Round {r}: {theme}")
    w("")
    name, files = SETS[s]
    w(f"**New chat. Attach Set {s}:** " + " and ".join(f"`{f}`" for f in files) + ".")
    for n in ns:
        p = P[n - 1]
        w("")
        w(f"### Prompt {p['n']}: {p['title']}")
        w("")
        w(f"- **File name:** `{p['fname']}`")
        w(f"- **Shape and size:** {p['shape']}, {p['size']} (any size ChatGPT gives at this shape is fine)")
        w(f"- **Transparent background:** {p['transparent']}")
        w(f"- **Purpose:** {p['purpose']}")
        w(f"- **Parts we cut from it:** {p['breakdown']}")
        w(f"- **Name flag:** {p['flag']}")
        if p['extra']:
            w(f"- **Extra attachment:** {p['extra']}")
        w("")
        w("```text")
        w(p['prompt'])
        w("```")
    w("")
    w("---")
w("")
w("## If a result is off")
w("")
w("Send the matching sentence in the same chat.")
w("")
w("| What you see | Send this |")
w("|---|---|")
FIX = [
    ("Soft, blurry or painted instead of crisp pixels",
     "Redo the same image as true pixel art: big hard-edged square pixels, flat colours, no blur, no gradients, no anti-aliasing. Keep the same layout and content."),
    ("Small pixels in some places and big ones in others",
     "Redo with one pixel size across the whole image, matching the reference images."),
    ("A background or floor was painted in",
     "Same image, but on a flat solid magenta #FF00FF background with nothing else behind the objects."),
    ("Things touch each other or are cut off",
     "Same image, but make every item smaller with clear empty space around each one. Nothing may touch another item or the edge."),
    ("Text, letters or numbers appear",
     "Same image with all text, letters and numbers removed. Leave those areas plain."),
    ("Sparkles, glints or dots around the items",
     "Same image with every sparkle, glint, light ray and floating dot removed. Keep everything else."),
    ("The three Golden Sprouts look different from each other",
     "Redo the three sprouts as the exact same golden seed and sprout, same size and pose. Only the small badge on the front changes."),
    ("Wrong number of items",
     "Redo with exactly the number of items, rows and columns listed in the prompt."),
    ("Light comes from the right",
     "Same image with the light coming from the upper left."),
    ("Too busy or too detailed",
     "Same image, simpler: fewer details, bigger shapes, only 3 to 4 flat tones per material."),
    ("No zip came with the picture",
     "Please also give me the zip: the sheet as exact pixel art, each item as a true-size transparent PNG, and a slices.json."),
]
for a, b in FIX:
    w(f"| {a} | `{b}` |")
w("")
w("## What happens after you upload")
w("")
w("1. Each image is checked against Gate A of the style bible. If one needs a redo, you get its number and the exact "
  "sentence to send.")
w("2. Accepted images go through the clean-up route and become game-size sprites.")
w("3. Any image with hemp in it is checked with the five-question hemp review.")
w("")
open(OUT, "w", encoding="utf-8").write("\n".join(L))
print("prompts", len(P), "chars", sum(len(p['prompt']) for p in P))
for p in P:
    print(p['n'], len(p['prompt']), p['fname'])
