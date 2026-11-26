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
                  purpose=purpose, breakdown=breakdown, flag=flag, extra=extra, prompt=text,
                  att=re.findall(r'`([^`]+\.png)`', extra or '')))


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

# ---------------------------------------------------------------- Round 3: the top two floors (Set A)
PANELS = ("Two background wall panels for a cozy pixel-art idle game about a herb-growing tower. The two panels are "
          "stacked one above the other with a clear empty gap between them. Each panel is a wide flat rectangle, three "
          "times as wide as it is tall, seen straight from the front with no perspective. These are empty backdrops: no "
          "people, no furniture, no plants, no floor, no ceiling beams, no border frame. Keep both panels quiet: soft "
          "low-contrast colours, a little darker and cooler than the reference props, with few details, so that bright "
          "props and characters placed in front of them will stand out.")

add(7, "Soap and Scent Workshop: props", "b02_07_floor09_soap_workshop_props.png",
    "very wide landscape 3:1", "about 2160×720", "Yes", "A",
    "Turns your v2 floor 09 into the Soap and Scent Workshop. Its copper still with a flame and its glass flasks are "
    "swapped for these, so nothing reads as a laboratory. Its two workers, perfume stand and lavender basket stay.",
    "Sliced into: soap kettle on its stove, mould table, drying rack, lotion shelf with the soap basket, manager's "
    "stool and side table. Brought to the 360×120 floor.",
    "Floor name is from the game design document, still in review.",
    "A row of workshop props for one floor of a cozy pixel-art idle game, arranged left to right on one shared ground "
    "line, exactly like the attached floor reference: separate objects with small gaps between them, nothing cut off "
    "by the edges. No people in this image.\n\n"
    "Left to right:\n"
    "1. A soap kettle: a big round copper kettle with a lid, sitting on a small closed black iron stove with its door "
    "shut, and a long wooden stirring paddle leaning against it. No fire, no steam.\n"
    "2. A wooden worktable with soap moulds on it: a long wooden tray holding a slab of cream soap, and three small "
    "round moulds of pale lavender soap.\n"
    "3. A tall wooden drying rack with four shelves of soap bars in cream, pale lavender and pale sage green. Each bar "
    "is stamped with a small two-leaf sprout.\n"
    "4. A small wooden shelf of round cream lotion bottles with cork stoppers, each with a small two-leaf sprout on "
    "its label, and below it a wicker basket of soap bars wrapped in paper and tied with twine.\n"
    "5. The manager's spot: an empty plum velvet stool beside a small round side table with a brass hand bell on it.",
    hemp='product')

add(8, "Back walls: soap workshop and tower headquarters", "b02_08_backwalls_soap_hq.png",
    "landscape 3:2", "about 1536×1024", "Around the panels only", "A",
    "The wall layer for floor 9 (Soap and Scent Workshop) and floor 10 (Sprout Tower HQ). With Batch 1 this gives "
    "every World 1 floor a back wall.",
    "2 panels at 336×104.",
    "Floor names are from the game design document, still in review.",
    PANELS + "\n\n"
    "TOP PANEL, inside a small soap workshop: a wall of pale sage-green plaster with a band of cream square tiles along "
    "the bottom third, a round window right of centre with golden evening light, a long wooden rail with three empty "
    "brass hooks, and a faint row of tiny lavender sprigs painted near the top.\n\n"
    "BOTTOM PANEL, the head office of a grand old garden company: dark warm wood panelling on the bottom half, deep "
    "green wallpaper with a small repeating gold two-leaf sprout pattern on the top half, a tall arched window left of "
    "centre showing a plain golden evening sky and far purple rooftops, and a round gold plaque on the right with a "
    "two-leaf sprout in relief.",
    bg=BG_P)

# ---------------------------------------------------------------- Rounds 4 to 6: people (Set B)
STYLE_ONLY = ("Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, "
              "colours). Do not copy their characters.")
SHEET2 = ("A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. "
          "The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The "
          "left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap "
          "between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and "
          "proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, "
          "about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.")
WALK = ("Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under "
        "the body, body slightly higher. (6) left leg forward, arms swinging the other way.")
STAND = ("Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a "
         "happy blink. (3) ")
AWAKE = ("Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and "
         "nothing is held up to a face.")


def floor_ref(what):
    return ("Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, "
            "colours). " + what + " Keep their faces, hair, outfits and colours.")


def worker_sheet(n, title, fname, purpose, flag, a, b, ref, extra, hemp=False, tail=""):
    add(n, title, fname, "landscape 3:2", "about 1536×1024", "Yes", "B", purpose,
        "18 poses, 9 per character. Bodies become frames of 80×80 art pixels. One head per character is redrawn by "
        "hand and reused on every frame.",
        flag,
        SHEET2 + "\n\nCHARACTER A, left three columns: " + a + "\n\nCHARACTER B, right three columns: " + b + "\n\n"
        + AWAKE + tail,
        cast=True, hemp=hemp, ref=ref, extra=extra)


add(9, "Pip, the seedling guide: poses and expressions", "b02_09_pip_guide.png",
    "square 1:1", "about 1254×1254", "Yes", "B",
    "Pip pops out of a windowsill planter in the first five seconds of the game and explains each new thing. These "
    "poses are what Pip shows while talking.",
    "9 poses at about 48×48 art pixels. The planter is cut out once and shared.",
    "Pip's name and role are from the game design document, still in review.",
    "A character sheet for Pip, the tutorial guide of a cozy pixel-art idle game about a herb-growing tower: the SAME "
    "little character in nine poses and expressions, in a grid of three rows and three columns, one per cell, evenly "
    "spaced, nothing touching. Same size, colours and proportions in every cell, exactly like the attached animation "
    "sheet reference.\n\n"
    "THE CHARACTER: Pip is a small, round seedling who lives in a tiny terracotta planter. Pip's body is a plump, "
    "smooth, light-brown bean shape that pokes up out of the soil in the planter, with a fresh green two-leaf sprout "
    "growing from the top of its head. Pip has two big round dark eyes, small rosy cheeks, a small mouth and two tiny "
    "stubby green leaf-shaped arms. Pip never leaves the planter: it hops and waddles about in it. No nose, no ears, no "
    "hair, no clothes. Cheerful and a bit of a chatterbox.\n\n"
    "Row 1: (1) smiling, facing the viewer. (2) the same with a happy blink. (3) talking, mouth open, one leaf-arm "
    "raised as if explaining something.\n"
    "Row 2: (4) waving with one leaf-arm. (5) jumping for joy, the planter off the ground, both arms up, the sprout "
    "leaves flung up. (6) surprised, eyes wide, the sprout leaves standing straight up.\n"
    "Row 3: (7) thinking, one leaf-arm at its chin, eyes looking up. (8) a little sad, the sprout leaves drooping, eyes "
    "looking down. (9) only the top of Pip's head and the sprout peeking out of the soil, eyes just visible over the "
    "rim.\n\n" + NO_FX,
    cast=True, ref=STYLE_ONLY)

worker_sheet(10, "Workers: Garden Shed Nursery", "b02_10_workers_floor04_garden_shed.png",
    "Makes both workers of floor 4, Garden Shed Nursery (from your v2 floor 04), move. This is the first sheet with two "
    "workers on it. If it works, the other sheets in this batch do the same and the whole game needs about 15 fewer "
    "images.",
    "Worker names may change. The looks are taken from your v2 floor 04.",
    "a stout, jolly older man with light skin, a big curled grey moustache and grey sideburns, an orange flat cap, an "
    "orange shirt with rolled sleeves, a dark green apron, brown trousers and brown boots.\n"
    + STAND + "cheering with one fist up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding a small terracotta planter in one hand and pressing soil around a "
    "seedling in it with the other. (8) scooping soil with a small hand trowel at waist height. (9) walking to the right "
    "carrying a tray of seedlings in both hands.",
    "a cheerful young woman with light skin, long brown hair in two braids, a cream headscarf tied in a bow on top, "
    "round red glasses, a cream shirt, lavender-purple dungarees with a pencil in the front pocket, and brown boots.\n"
    + STAND + "cheering with both arms up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding a tray of seedlings at chest height and smiling at it. (8) setting the "
    "tray down to the right at waist height. (9) walking to the right carrying a stack of three small terracotta "
    "planters.",
    floor_ref("The garden shed floor scene attached with this message shows the two characters to draw: CHARACTER A "
              "is the man in the orange cap at the potting bench, CHARACTER B is the young woman in purple dungarees "
              "holding a seedling tray."),
    "With this prompt also attach `B4_floor04_garden_shed_nursery_v2.png`, so the two workers match your floor 04.")

worker_sheet(11, "Workers: Glass Greenhouse", "b02_11_workers_floor05_greenhouse.png",
    "Makes both workers of floor 5, Glass Greenhouse (from your v2 floor 05), move. Character A uses a wheelchair, so "
    "her walk is a roll.",
    "Worker names may change. The looks are taken from your v2 floor 05.",
    "a cheerful older woman with deep brown skin who uses a wheelchair: a green headscarf with grey curls showing, gold "
    "hoop earrings, a cream blouse with a lavender neckerchief, a long green skirt, and a purple wheelchair with gold "
    "wheel rims. She is seated in every pose.\n"
    "Row 1: (1) sitting relaxed, facing the viewer, smiling. (2) the same with eyes closed in a happy blink. (3) "
    "cheering with both arms up.\n"
    "Row 2, rolling to the right, seen from the side: (4), (5) and (6) her hands pushing the wheel rims forward, the "
    "spokes turned a little further in each frame.\n"
    "Row 3, working, facing right: (7) holding a magnifying glass out at arm's length over a small flower in a planter "
    "on her lap. (8) writing in a small notebook on her lap. (9) rolling to the right with a planter of leafy herbs on "
    "her lap.",
    "a young gardener with light tan skin, short messy dark brown hair, a cream shirt with rolled sleeves, rust-brown "
    "dungarees with garden shears in the pocket, and green rubber boots.\n"
    + STAND + "cheering with both arms up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) lifting a small glass bell cover with both hands. (8) lowering the glass bell "
    "cover over a small flowering plant in a planter. (9) walking to the right carrying a planter of leafy herbs.",
    floor_ref("The greenhouse floor scene attached with this message shows the two characters to draw: CHARACTER A is "
              "the woman in the wheelchair on the left, CHARACTER B is the young gardener in rust-brown dungarees on "
              "the right."),
    "With this prompt also attach `B4_floor05_greenhouse_v2.png`, so the two workers match your floor 05.")

worker_sheet(12, "Workers: Farmers' Market Stall", "b02_12_workers_floor06_market.png",
    "Makes both workers of floor 6, Farmers' Market Stall (from your v2 floor 06), move.",
    "Worker names may change. The looks are taken from your v2 floor 06.",
    "a cheerful, plump woman with deep brown skin, a deep red head wrap tied high, gold hoop earrings, a yellow blouse "
    "with puffed sleeves, a dark green apron dress with a pocket, and brown shoes.\n"
    + STAND + "cheering with a bunch of fresh basil held up high in one hand.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding out a bunch of fresh green basil to the right, as if offering it. (8) "
    "arranging leafy herbs in a wicker basket held at waist height. (9) walking to the right with a big wicker basket "
    "of herbs on her hip.",
    "a cheerful, round older woman with light skin, a long white braid over one shoulder, a dark green shawl with a "
    "gold brooch, and a plum-purple dress with a cream hem.\n"
    + STAND + "cheering with one arm up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) reaching out to the right with an open hand, as if paying. (8) putting a bunch "
    "of fresh herbs into the wicker basket on her arm. (9) walking to the right with the full basket on her arm.",
    floor_ref("The market floor scene attached with this message shows the two characters to draw: CHARACTER A is the "
              "woman in the red head wrap on the left, CHARACTER B is the older woman with the white braid and basket "
              "on the right."),
    "With this prompt also attach `B4_floor06_farmers_market_v2.png`, so the two workers match your floor 06.")

worker_sheet(13, "Workers: Tea House", "b02_13_workers_floor07_tea_house.png",
    "Makes both workers of floor 7, Tea House (from your v2 floor 07), move.",
    "Worker names may change. The looks are taken from your v2 floor 07.",
    "a gentle older woman with light skin, grey hair in a bun held with two hair sticks, rosy cheeks, a plum-purple "
    "wrap robe with cream trim and a small embroidered leaf pattern, and a purple sash.\n"
    + STAND + "clapping her hands together happily.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) kneeling on a round purple cushion, pouring tea from a round brown teapot into a "
    "cup. (8) kneeling on the cushion, offering a tea cup forward with both hands. (9) walking to the right carrying "
    "the teapot on a small wooden tray.",
    "a cheerful young waiter with light skin, curly ginger hair, a cream shirt with a small purple bow tie, a "
    "mustard-yellow waistcoat, dark plum trousers and brown shoes.\n"
    + STAND + "cheering with one arm up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) carrying a tray of four tea cups on one flat hand at shoulder height. (8) bowing "
    "slightly while setting a cup down to the right. (9) walking to the right with the tray of cups.",
    floor_ref("The tea house floor scene attached with this message shows the two characters to draw: CHARACTER A is "
              "the older woman pouring tea on the left, CHARACTER B is the young waiter with the tray on the right."),
    "With this prompt also attach `B4_floor07_tea_house_v2.png`, so the two workers match your floor 07.",
    tail=" No steam rises from the tea.")

worker_sheet(14, "Workers: Ropewalk and Twine Shop", "b02_14_workers_floor08_ropewalk.png",
    "Makes both workers of floor 8, Ropewalk and Twine Shop, move. They are the two you made in Batch 1 prompt 15.",
    "Worker names may change. The looks are taken from your Batch 1 prompt 15 picture.",
    "a stout, cheerful young woman with deep brown skin, hair in two round puffs tied with cream ribbons, a "
    "mustard-yellow shirt with rolled sleeves, a brown leather apron and sturdy boots.\n"
    + STAND + "cheering with both fists up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) both hands pushing a wooden crank handle forward at waist height. (8) both "
    "hands pulling the crank handle back up at chest height. (9) walking to the right with a big coil of cream rope "
    "over one shoulder.",
    "a tall, thin old man with light skin, a long white moustache, round glasses, a soft plum-purple cap, a cream shirt "
    "and a plum waistcoat.\n"
    + STAND + "lifting his cap with one hand in a cheerful greeting.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) winding cream twine onto a ball held at chest height. (8) holding out a finished "
    "ball of twine on his open palm at chest height. (9) walking to the right carrying a small basket of twine balls.",
    floor_ref("The ropewalk picture attached with this message shows the two characters to draw: CHARACTER A is the "
              "young woman turning the rope wheel, CHARACTER B is the old man winding twine at the bench."),
    "With this prompt also attach your Batch 1 picture `b01_15_floor08_ropewalk_twine_shop.png`, so the two workers "
    "match it.",
    hemp='product')

worker_sheet(15, "Workers: Soap and Scent Workshop", "b02_15_workers_floor09_soap_workshop.png",
    "Makes both workers of floor 9, Soap and Scent Workshop (from your v2 floor 09), move. Their jobs change from "
    "lab work to soap making.",
    "Worker names may change. The looks are taken from your v2 floor 09.",
    "a small, cheerful older woman with light skin, short white hair with a green headband, a cream blouse with puffed "
    "sleeves, a dark green apron dress with small scissors in the pocket, brown trousers and brown boots.\n"
    + STAND + "cheering with both arms up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) tying a bundle of fresh purple lavender stems with a ribbon at chest height. (8) "
    "holding a small tray of lavender soap bars at waist height. (9) walking to the right carrying a wicker basket of "
    "soap bars wrapped in paper.",
    "a stout, theatrical woman with warm tan skin, big fluffy lilac-grey hair with a white flower in it, brass goggles "
    "pushed up on top of her head, gold hoop earrings, a long plum-purple coat with gold trim and leaf embroidery, a "
    "red waistcoat, olive-green breeches and brown boots.\n"
    + STAND + "throwing one arm out wide with a dramatic flourish.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) stirring with a long wooden paddle held in both hands at waist height. (8) "
    "presenting a bar of soap on her open palm at chest height, with a proud smile. (9) walking to the right carrying "
    "a small wooden crate of round cream lotion bottles.",
    floor_ref("The workshop floor scene attached with this message shows the two characters to draw: CHARACTER A is "
              "the small older woman with the green headband sitting at the lavender table, CHARACTER B is the woman "
              "in the long purple coat with goggles on her head. Ignore the copper still and the glass bottles."),
    "With this prompt also attach `B4_floor09_essence_lab_v2.png`, so the two workers match your floor 09.",
    tail=" No steam and no flames anywhere.")

worker_sheet(16, "Workers: Sprout Tower HQ and Windowsill Planter", "b02_16_workers_floor10_floor01.png",
    "Makes the worker of floor 10, Sprout Tower HQ, and the second worker of floor 1, Windowsill Planter, move. The "
    "grandmother at the HQ desk is left out on purpose: she is the best fit for Granny Evergreen, the Head of "
    "Thymeford, and is drawn with the managers.",
    "Worker names may change. The looks are taken from your v2 floors 10 and 01.",
    "a cheerful young man with light skin, a dark brown quiff, a cream shirt with rolled sleeves, a small purple bow "
    "tie, a dark green waistcoat, green trousers and brown shoes.\n"
    + STAND + "cheering with one fist up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) reading a clipboard held at chest height and nodding. (8) lifting a book up to "
    "the right at shoulder height, as if putting it on a shelf. (9) walking to the right carrying a tall stack of "
    "green and purple books.",
    "a young gardener with warm brown skin, curly dark brown hair under a green bandana, rosy cheeks, a cream shirt "
    "with rolled sleeves, a green apron with red scissors in the pocket, brown trousers and brown boots.\n"
    + STAND + "cheering with both arms up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) snipping leaves with small red scissors at waist height. (8) pouring from a "
    "small yellow watering can held at waist height, with a few water drops falling. (9) walking to the right "
    "carrying a wicker basket of seed packets.",
    floor_ref("The two floor scenes attached with this message show the two characters to draw: CHARACTER A is the "
              "young man carrying books in the headquarters scene, CHARACTER B is the young gardener in the green "
              "bandana with a watering can in the windowsill scene."),
    "With this prompt also attach `B4_floor10_herb_empire_hq_v2.png` and `B4_floor01_windowsill_planter_v2.png`.")

worker_sheet(17, "Workers: Balcony Boxes and Backyard Hemp Patch", "b02_17_workers_floor02_floor03.png",
    "Makes the second workers of floor 2, Balcony Boxes, and floor 3, Backyard Hemp Patch, move. With prompts 10 to 16 "
    "and Batch 1, every worker in your ten World 1 floor pictures can now move.",
    "Worker names may change. The looks are taken from your v2 floors 02 and 03.",
    "a short, plump woman with light tan skin, short curly black hair with a mustard-yellow headband tied in a bow, "
    "gold hoop earrings, a cream shirt with rolled sleeves, a lavender-purple waistcoat, mustard-yellow trousers and "
    "brown boots.\n"
    + STAND + "cheering with both arms up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) crouching to set a seedling into a planter on the ground. (8) crouching and "
    "patting the soil in the planter. (9) walking to the right carrying a planter of basil in both hands.",
    "a young woman with fair skin and freckles, a long red-orange braid, a straw sun hat with a pink flower, a pink "
    "neckerchief, a cream shirt, a green waistcoat, brown knee breeches and brown boots.\n"
    + STAND + "cheering with one arm up, holding her hat on with the other.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) pushing a long garden hoe forward along the ground. (8) pulling the hoe back. "
    "(9) walking to the right carrying a tin bucket.",
    floor_ref("The two floor scenes attached with this message show the two characters to draw: CHARACTER A is the "
              "plump woman crouching to plant on the balcony, CHARACTER B is the young woman with the red braid and "
              "straw hat digging in the backyard."),
    "With this prompt also attach `B4_floor02_balcony_pots_v2.png` and `B4_floor03_backyard_patch_v2.png`.")

ROUNDS = [
    (1, "Visitors and currency icons", "C", [1, 2], "Needed first"),
    (2, "Herbs", "C", [3, 4, 5, 6], "Needed first"),
    (3, "The top two floors", "A", [7, 8], "Needed next"),
    (4, "Pip and the first two-worker sheet", "B", [9, 10], "Needed first"),
    (5, "Workers of floors 5 to 7", "B", [11, 12, 13], "Needed next"),
    (6, "Workers of floors 8 to 10 and the second workers of floors 1 to 3", "B", [14, 15, 16, 17], "Needed next"),
]
EXTRA_ROUNDS = {4, 5, 6}   # rounds whose worker prompts need one or two of Lawson's floor images
LATER = []
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
w(f"**{len(P)} images in {len(ROUNDS)} rounds.** They finish World 1: the six visitors, six currency icons, every "
  "World 1 herb card and the last three herb growth charts, the soap workshop and the walls of the top two floors, "
  "Pip, and moving workers for every floor. The worker sheets now carry two workers each, which is why the batch is "
  "shorter than planned.")
w("")
if LATER:
    w("These come next and will be added to this file without changing the numbers of the prompts already here:")
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
  "reference images again. **Rounds 4 to 6 are different:** most of their prompts need one or two more of your "
  "pictures, attached in the same message as that prompt. They are listed in the table \"Extra pictures\" below and "
  "in bold at the top of each prompt.")
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
w("### Extra pictures for rounds 4 to 6")
w("")
w("These prompts draw workers who are already in your room pictures, so each needs that picture attached in the same "
  "message as the prompt. The `B4_floor..._v2` files are in your expansion pack. The `b01_15` file is "
  "the ropewalk picture you made in Batch 1. A copy of every one of them is in the project files, in the folder "
  "`art/batch02/attach_with_prompts/`. Use the `_v2` files, not the older painted room pictures, which show other "
  "people.")
w("")
w("| Prompt | Also attach |")
w("|---|---|")
for p in P:
    if p['att']:
        w(f"| {p['n']} | " + " and ".join(f"`{f}`" for f in p['att']) + " |")
w("")
w("### The rounds")
w("")
w("| Round | Theme | Attach | Prompts | Priority |")
w("|---|---|---|---|---|")
for r, theme, s, ns, pri in ROUNDS:
    att = f"Set {s}" + (" plus floor pictures" if r in EXTRA_ROUNDS else "")
    w(f"| {r} | {theme} | {att} | {', '.join(str(n) for n in ns)} | {pri} |")
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
    hdr = f"**New chat. Attach Set {s}:** " + " and ".join(f"`{f}`" for f in files) + "."
    if r in EXTRA_ROUNDS:
        hdr += (" **Most prompts in this round need one or two more pictures as well.** Each one is named in bold at "
                "the top of its prompt.")
    w(hdr)
    for n in ns:
        p = P[n - 1]
        w("")
        w(f"### Prompt {p['n']}: {p['title']}")
        w("")
        if p['att']:
            w("**Attach with this prompt:** " + " and ".join(f"`{f}`" for f in p['att']))
            w("")
        w(f"- **File name:** `{p['fname']}`")
        w(f"- **Shape and size:** {p['shape']}, {p['size']} (any size ChatGPT gives at this shape is fine)")
        w(f"- **Transparent background:** {p['transparent']}")
        w(f"- **Purpose:** {p['purpose']}")
        w(f"- **Parts we cut from it:** {p['breakdown']}")
        w(f"- **Name flag:** {p['flag']}")
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
    ("The character changes between poses",
     "Redo the sheet. Every pose must show the exact same character as pose 1: same face, hair, outfit, colours and body size."),
    ("On a two-worker sheet the two characters mix or change",
     "Redo the sheet. The left three columns show only character A and the right three columns only character B, each exactly the same in all nine of its poses."),
    ("Two workers on one sheet still fails after two tries",
     "Draw only character A, in nine poses in three rows of three. Then, as a second image, draw character B the same way."),
    ("A person looks like someone real or a known cartoon",
     "Redo with a clearly different, original face and hairstyle."),
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
