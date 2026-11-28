#!/usr/bin/env python3
"""Builds ASSET_BATCH_03.md: Loomington rooms and collection. The style suffix and hemp guards are read word for word
from section 21 of the style bible.

Usage: python3 build_asset_batch_03.py ../ASSET_BATCH_03.md
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
NO_FX = ("No sparkles, glints, light rays, motion lines, stars or floating dots anywhere in the image. The game adds "
         "those.")
FILES = ("FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel "
         "the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, "
         "one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. "
         "If you cannot make the zip, the image alone is fine.")
FLAG = "Names are from the game design document (version 0.3). Each look is described, not named, so a rename is fine."

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
                  purpose=purpose, breakdown=breakdown, flag=flag, extra=extra, prompt=text, bg=bg,
                  att=re.findall(r'`([^`]+\.png)`', extra or '')))


# ---------------------------------------------------------------- Rounds 1 and 2: the seven new rooms (Set A)
# Loomington is the night city of mills (bible section 7): the rooms are warm and lamplit, the city outside is blue.
# A room image is the Ropewalk recipe of Batch 1 (prompt 15), which worked first time: props and two workers in one
# row on one ground line, the tap target in the middle, the manager's spot at the right end (bible section 13).
ROOM = ("A row of props and two workers for one floor of a cozy pixel-art idle game, arranged left to right on one "
        "shared ground line, exactly like the attached floor reference: separate objects with small gaps between "
        "them, nothing cut off by the edges. Item 3, in the middle, is what the player taps: make it the biggest and "
        "brightest thing in the image. The two workers are chunky, about two and a half heads tall, and stand on the "
        "same ground line as the props. Item 6 is the manager's spot: a low seat with nothing tall on or behind it, "
        "no taller than a fifth of the image height. No other people in this image.")
CRAFT = ("Both workers look brisk, proud and wide awake, like skilled tradespeople who love their craft. Their hands "
         "stay at chest height or lower and nothing is held up to a face.")
CHEER = ("Both workers look cheerful and wide awake. Their hands stay at chest height or lower and nothing is held up "
         "to a face.")
BELL = "with a brass hand bell on it"


def room(n, title, fname, purpose, breakdown, items, tail, hemp=False):
    body = ROOM + "\n\nLeft to right:\n" + "\n".join(f"{i}. {t}" for i, t in enumerate(items, 1)) + "\n\n" + tail
    add(n, title, fname, "very wide landscape 3:1", "about 2160×720", "Yes", "A", purpose,
        "Sliced into: " + breakdown + ". Brought to the 360×120 floor. The two workers get moving sheets in Batch 4.",
        FLAG, body, hemp=hemp, cast=True)


room(1, "Rooftop Garden Beds: props and two workers", "b03_01_w2_floor01_rooftop_beds.png",
     "The first floor of Loomington, a herb garden on a city rooftop at night. Thyme grows here, so the bed is left "
     "empty and the game plants it. Your B5 beekeeper manages it, hence the beehives.",
     "trellis arch, first worker, raised bed, second worker, beehives, manager's crate",
     ["A wooden trellis arch with a climbing bean vine and a string of small round warm lantern bulbs along its top.",
      "A worker watering from a long-spouted tin watering can held low at waist height: a lanky young man with light "
      "olive skin, a mop of black hair under a sky-blue bandana, a cream T-shirt, green dungarees rolled up at the "
      "ankles and yellow rubber boots.",
      "A long, low raised garden bed made of weathered wooden planks on short brick legs, about one third of the image "
      "width, filled with dark soil and completely EMPTY. The game plants the crop here. A small chalkboard stake at "
      "one end, with nothing written on it.",
      "A worker carrying a wooden tray of tiny seedlings at waist height: a short, round woman in her sixties with "
      "deep brown skin, short grey twists, round gold earrings, a mustard-yellow cardigan over a teal dress, a "
      "striped cream apron and green rubber clogs.",
      "Two small white wooden beehives with sloping roofs on a low wooden stand, with a little landing board at each "
      "entrance. No bees flying.",
      "The manager's spot: an empty folding stool beside an upturned honey crate " + BELL + "."],
     CHEER + " There are no standing crop plants in this image. " + NO_FX)

room(2, "Corner Herb Kiosk: props and two workers", "b03_02_w2_floor02_herb_kiosk.png",
     "Floor 2 of Loomington, a little kiosk on a street corner that sells bunches of fresh mint. Your B5 manager in "
     "the green suit runs it.",
     "street lamp, first worker, kiosk, second worker, crates and handcart, manager's stool",
     ["A green iron street lamp with a warm glowing lantern and a hanging basket of mint.",
      "A worker tying a bunch of fresh mint with twine at a small folding table: a cheerful young woman with light "
      "skin, freckles and a short red bob under a green knitted beret, a cream shirt with rolled sleeves and a "
      "green-and-cream striped apron.",
      "The kiosk: a small round wooden kiosk with a green-and-cream striped domed roof and a brass knob on top, its "
      "wide counter piled high with crates of bright fresh mint bunches and cones of brown paper. Warm light inside.",
      "A worker holding out a paper cone of fresh mint to the right at chest height, as if handing it to a customer: "
      "a tall, slim young man with dark brown skin, short black hair with a neat side part, a crisp white shirt with "
      "rolled sleeves, a dark green waistcoat and a little mint-green bow tie.",
      "A small wooden handcart with two big wheels, loaded with crates of mint bunches.",
      "The manager's spot: an empty tall stool beside a small crate holding a closed green ledger book and a brass "
      "hand bell."],
     CHEER + " " + NO_FX)

room(3, "Canvas Weaving Mill: props and two workers", "b03_03_w2_floor03_weaving_mill.png",
     "Floor 3 of Loomington, the first hemp floor of the city, where hemp thread is woven into canvas.",
     "thread rack, first worker, floor loom, second worker, canvas bolts, manager's bench",
     ["A tall wooden rack of big thread cones in cream, sand and sky blue.",
      "A worker pulling the wooden beater bar of the loom toward her with both hands: a sturdy young woman with tan "
      "skin, black hair in one long braid under a red headscarf, a cream blouse with rolled sleeves, a long "
      "sand-coloured canvas apron and brown boots.",
      "A big wooden floor loom with a half-woven roll of cream canvas on its front beam, rows of cream threads running "
      "back into it and a wooden shuttle resting in the threads.",
      "A worker carrying a rolled bolt of cream canvas on one shoulder: a broad, bald older man with warm brown skin, "
      "a short white beard, a sky-blue work shirt and a leather apron with two thread spools in its pocket.",
      "A stack of rolled canvas bolts in cream and natural beige, and a wicker basket of wooden shuttles.",
      "The manager's spot: an empty low wooden bench with a folded canvas cushion, next to a small crate " + BELL + "."],
     CRAFT + " No plants in this image. " + NO_FX, hemp='product')

room(4, "Paper Workshop: props and two workers", "b03_04_w2_floor04_paper_workshop.png",
     "Floor 4 of Loomington, where hemp fibre becomes paper, notebooks, gift paper and kites.",
     "drying line, first worker, paper vat, second worker, paper goods table, manager's stool",
     ["A drying line strung between two wooden posts, with five sheets of cream paper pegged on it.",
      "A worker lifting a wooden mould frame with a fresh wet sheet of paper on it, held flat at chest height: a "
      "small, quick young man with light skin, curly blond hair, round wire glasses, a mustard shirt with rolled "
      "sleeves, a long teal rubber apron and tall rubber boots.",
      "A big round wooden paper vat bound with iron hoops, full of smooth creamy pulp, with a second mould frame "
      "resting on its rim. No steam, no drips.",
      "A worker proudly holding up a finished diamond-shaped paper kite in red and sunny yellow with a short ribbon "
      "tail, at chest height: a tall young woman with light brown skin, long black hair in a high ponytail tied with "
      "a red ribbon, a lavender work smock and brown boots.",
      "A worktable stacked with paper reams, notebooks tied with twine and two rolls of gift paper printed with small "
      "two-leaf sprouts, with two finished kites hanging on the wall above it.",
      "The manager's spot: an empty wooden stool next to a small crate " + BELL + "."],
     CRAFT + " No plants in this image. " + NO_FX, hemp='product')

room(5, "Tailor's Atelier: props and two workers", "b03_05_w2_floor06_atelier.png",
     "Floor 6 of Loomington (floor 5 is the Spice Kitchen Bistro from your v2 floor 08), where hemp linen becomes "
     "clothes and lavender sachets.",
     "dress form, first worker at the sewing machine, cutting table, second worker, clothes rail, manager's stool",
     ["A dress form wearing a half-finished cream linen jacket held with a few pins.",
      "A worker sitting at an old black treadle sewing machine on a wooden table, stitching a cream shirt: an elegant "
      "older man with deep brown skin, a neat silver moustache, round gold spectacles, a yellow tape measure around "
      "his neck, a lavender waistcoat over a cream shirt and grey trousers.",
      "A big wooden cutting table with a long roll of natural linen cloth unrolled across it, a large pair of tailor's "
      "shears, a cake of white chalk and two plain paper pattern pieces pinned to the cloth.",
      "A worker holding up a finished sage-green linen shirt on a wooden hanger at chest height: a petite young woman "
      "with light skin, a sleek black bob with a straight fringe, small gold hoop earrings, a pincushion on her wrist "
      "and a sage-green dress with a white collar.",
      "A brass clothes rail of linen shirts and dresses in cream, sage and lavender, with a wicker basket of small "
      "lavender sachets tied with ribbons on the floor below it.",
      "The manager's spot: an empty round upholstered stool beside a small side table with a pincushion and a brass "
      "hand bell."],
     CRAFT + " " + NO_FX, hemp='product')

room(6, "Hempcrete Brickyard: props and two workers", "b03_06_w2_floor07_brickyard.png",
     "Floor 7 of Loomington, where hemp stalks and lime are mixed and moulded into pale eco building blocks.",
     "block pallet, first worker, mixing trough and block mould, second worker, half-built wall, manager's stool",
     ["A wooden pallet stacked high with pale, speckled hempcrete blocks.",
      "A worker stirring the mix in the trough with a long-handled hoe: a big, strong young man with medium brown "
      "skin, short black curls, an orange work vest over a grey T-shirt, canvas trousers with knee patches and heavy "
      "boots.",
      "A long wooden mixing trough full of pale speckled hempcrete mix, with a wooden block mould beside it and one "
      "fresh pale block just turned out of the mould onto a board.",
      "A worker setting a pale block onto the wall with a trowel, at chest height: a wiry older woman with light "
      "skin, a short grey crop under a red knitted cap, a denim jacket, a tool belt with a spirit level, and sturdy "
      "boots.",
      "A half-built wall of pale speckled blocks with a wooden spirit level lying on top and a bucket of trowels "
      "beside it.",
      "The manager's spot: an empty sturdy wooden stool next to a small crate with a rolled-up plan and a brass hand "
      "bell."],
     CRAFT + " No plants in this image. " + NO_FX, hemp='product')

room(7, "Grand Emporium: props and two workers", "b03_07_w2_floor08_emporium.png",
     "The top floor of Loomington, a grand old department store that sells everything the brand makes. Its manager "
     "is Madame Loom, the Head of Loomington.",
     "display cabinet, first worker, grand display stand, second worker, gift shelf, manager's stool",
     ["A tall glass display cabinet with a polished wood and gold frame, holding small herb planters, tea tins and "
      "soap bars.",
      "A worker wrapping a parcel in paper printed with small two-leaf sprouts at a small polished counter: a smiling "
      "middle-aged woman with tan skin, dark hair in a neat bun, a cream blouse with a lavender scarf and a long navy "
      "skirt.",
      "A grand round three-tier display stand of polished wood with gold trim and a lavender velvet top, holding a "
      "little of everything: a herb planter, a coil of cream rope, a canvas tote bag, a stack of notebooks, soap "
      "bars, a tea tin, a pale building block and a small paper kite.",
      "A porter carrying a tall stack of three gift boxes tied with ribbons at chest height: a tall young man with "
      "light skin and ginger sideburns, a round red pillbox cap with a gold band, a red uniform jacket with gold "
      "buttons and black trousers.",
      "A brass-railed shelf of folded linen shirts, rolled canvas tote bags and gift boxes tied with ribbons.",
      "The manager's spot: an empty gold-and-lavender velvet stool beside a small round gilded side table with a "
      "brass hand bell."],
     CHEER + " " + NO_FX, hemp='product')

# ---------------------------------------------------------------- Round 3: back walls (Set A)
PANELS = ("Two background wall panels for a cozy pixel-art idle game about a herb-growing tower in a big city at "
          "night. The two panels are stacked one above the other with a clear empty gap between them. Each panel is a "
          "wide flat rectangle, three times as wide as it is tall, seen straight from the front with no perspective. "
          "These are empty backdrops: no people, no furniture, no plants, no floor, no ceiling beams, no border frame. "
          "Keep both panels quiet: soft low-contrast colours, a little darker and cooler than the reference props, with "
          "few details, so that bright props and characters placed in front of them will stand out. Windows show a "
          "plain deep blue night sky and far rows of small warm golden lit windows, with no stars and no moon.")
FLAT_SKY = ("is ONE flat plain pale blue colour with no clouds, no stars, no moon and no shading (the game replaces it "
            "with its own night sky)")


def walls(n, title, fname, purpose, top, bottom, breakdown="2 panels at 336×104."):
    add(n, title, fname, "landscape 3:2", "about 1536×1024", "Around the panels only", "A", purpose, breakdown, FLAG,
        PANELS + "\n\nTOP PANEL, " + top + "\n\nBOTTOM PANEL, " + bottom, bg=BG_P)


walls(8, "Back walls: rooftop garden and herb kiosk", "b03_08_backwalls_rooftop_kiosk.png",
      "The wall layer for Loomington floors 1 (Rooftop Garden Beds) and 2 (Corner Herb Kiosk). The rooftop is open "
      "air, so the game's own night sky shows above it.",
      "a city rooftop garden: a low red-brick parapet wall with a pale stone coping runs along the bottom third, with "
      "a round wooden water tower on short iron legs at the far right and a small brick chimney stack with no smoke "
      "at the far left. Everything above the parapet, the tower and the chimney " + FLAT_SKY + ".",
      "a street corner in the old city: the red-brick side wall of a corner building, with a tall arched shop window "
      "glowing warm gold left of centre (empty inside, no writing), a green iron drainpipe running down the right, a "
      "faded painted two-leaf sprout on the bricks and a strip of dark granite kerb along the bottom.",
      breakdown="2 panels at 336×104. The flat blue area of the rooftop panel is removed in clean-up.")

walls(9, "Back walls: weaving mill and paper workshop", "b03_09_backwalls_mill_paper.png",
      "The wall layer for Loomington floors 3 (Canvas Weaving Mill) and 4 (Paper Workshop).",
      "inside an old weaving mill: a red-brick wall with three tall arched iron-framed factory windows showing the "
      "night city, slim cast-iron columns between them, and a long wooden shelf of empty thread cones along the top.",
      "inside a small paper workshop: a whitewashed brick wall, two small square windows showing the night city, a "
      "long wooden shelf of empty drying trays, and a wooden pegboard on the right with three empty pegs.")

walls(10, "Back walls: spice kitchen and tailor's atelier", "b03_10_backwalls_bistro_atelier.png",
      "The wall layer for Loomington floors 5 (Spice Kitchen Bistro, your v2 floor 08) and 6 (Tailor's Atelier).",
      "inside a cozy city bistro kitchen: warm terracotta tiles on the bottom third, cream plaster above, a long "
      "wooden shelf with a row of copper pans hanging below it, and a round window right of centre showing the night "
      "city.",
      "inside a tailor's atelier: soft lavender-grey striped wallpaper, a tall window left of centre showing the night "
      "city, a long brass rail with a few empty wooden hangers, and dark wooden panelling along the bottom.")

walls(11, "Back walls: brickyard and grand emporium", "b03_11_backwalls_brickyard_emporium.png",
      "The wall layer for Loomington floors 7 (Hempcrete Brickyard) and 8 (Grand Emporium). The brickyard is open "
      "air, so the game's own night sky shows above it.",
      "an open city building yard: a long wall of pale speckled blocks fills the bottom half, with a short section of "
      "wooden scaffolding and a ladder at the right end and an iron lamp post on the left. Everything above the wall "
      "and the scaffold " + FLAT_SKY + ".",
      "inside a grand old department store: cream marble pilasters with gold capitals, two tall arched windows with "
      "gold frames showing the night city, and a band of plum velvet wallpaper with a thin gold line along the bottom "
      "third.",
      breakdown="2 panels at 336×104. The flat blue area of the brickyard panel is removed in clean-up.")

# ---------------------------------------------------------------- Round 4: the city background (Set A plus B26, B17)
CITY_REF = ("Use the attached layered background sheet (a sunset sky, then hills over a lake, then houses on the left "
            "and right of an empty middle, then cobbles) for its layout and its crisp pixel style. Use the attached "
            "night city painting only as a guide for what is in the city; do not copy its soft painted style, its "
            "stars or its glow.")
CITY = ("It is night in this city of old brick mills and rooftop glasshouses. Walls and roofs are cool dusk blue and "
        "lavender in shadow; the warm colour comes only from small golden lit windows and lamps. Every strip is "
        "very wide, about four times as wide as it is tall, seen straight from the front, and nothing in it is "
        "cut off at the top. There is NO sky in any strip: the area above the buildings is empty and transparent, "
        "because the game draws its own sky.")

add(12, "City background: far skyline and river", "b03_12_w2_bg_far_river.png",
    "landscape 3:2", "about 1536×1024", "Yes, around the strips", "A",
    "The two back layers of the Loomington background that scroll slowly behind the tower, drawn again in the crisp "
    "style from your B17 city painting.",
    "2 layers, each brought to about 640 art pixels wide: the far skyline and the river with its bridge.",
    "World name from the game design document (version 0.3).",
    "Two layers of a parallax background for a cozy pixel-art idle game, stacked one above the other with a clear "
    "empty gap between them. " + CITY + "\n\n"
    "TOP STRIP, the far skyline: a long low row of far city buildings across the whole width: slim towers, old "
    "brick mills with tall square chimneys with no smoke, and glasshouses glowing softly gold on the rooftops. Far "
    "away, so it is low in contrast, mostly dusk blue and lavender, with tiny rows of warm lit windows and no dark "
    "outlines.\n\n"
    "BOTTOM STRIP, the river: a wide calm river across the whole width with gentle horizontal ripples in deep blue, "
    "long wobbly golden reflections of lit windows, and a low old stone arch bridge with a row of small warm lamps "
    "crossing the middle. The water fills the strip from edge to edge.\n\n" + NO_FX,
    ref=CITY_REF,
    extra="With this prompt also attach `B26_world1_parallax_layers.png` (expansion pack) and "
          "`B17_world2_big_city.png` (first pack), so the layers follow the World 1 layout and the Loomington city.")

add(13, "City background: town and riverside street", "b03_13_w2_bg_town_street.png",
    "landscape 3:2", "about 1536×1024", "Yes, around the strips", "A",
    "The two front layers of the Loomington background: the buildings beside the tower and the street at its foot.",
    "2 layers: the town (left and right parts) and the street, each brought to about 640 art pixels wide.",
    "World name from the game design document (version 0.3).",
    "Two layers of a parallax background for a cozy pixel-art idle game, stacked one above the other with a clear "
    "empty gap between them. " + CITY + "\n\n"
    "TOP STRIP, the town: a cluster of city buildings on the LEFT third and another on the RIGHT third, with the "
    "middle third completely EMPTY, because the game's tower stands there. Old red-brick mill buildings with rows of "
    "arched windows, tall narrow townhouses, and glass rooftop greenhouses full of green herbs and lavender, with ivy "
    "on the walls. Many windows glow warm gold. A thin dark outline around every building.\n\n"
    "BOTTOM STRIP, the riverside street: a stone quay across the whole width: warm grey paving slabs, a row of "
    "squat granite bollards linked by dark iron chains, two old iron lamp posts with warm glowing lanterns near the "
    "ends, and long wooden planter boxes of fresh basil, rosemary and lavender between them.\n\n" + NO_FX,
    ref=CITY_REF,
    extra="With this prompt also attach `B26_world1_parallax_layers.png` (expansion pack) and "
          "`B17_world2_big_city.png` (first pack).")

# ---------------------------------------------------------------- Round 5: Mayor Thyme (Set B)
add(14, "Mayor Thyme, the Harvest Festival host: four poses", "b03_14_mayor_thyme.png",
    "landscape 16:9", "about 1664×936", "Yes", "B",
    "Mayor Thyme hosts the Grand Harvest Festival, where a Replant ends, and pins on the Prize Ribbons. Since "
    "design version 0.3 he is a story character, not a manager.",
    "4 poses in a 96×96 frame with the feet on row 91, like the managers. One head is redrawn by hand.",
    "Mayor Thyme's name and role are from the game design document (version 0.3).",
    "A character animation sheet for a cozy pixel-art idle game: ONE character in four poses, in one row of four "
    "cells across the middle of the image, " + GRID + ". Leave wide empty space above and below the row. Full body "
    "in every cell, the same face, outfit, colours, size and proportions in every pose, exactly like the attached "
    "animation sheet reference. He is chunky, about two and a half heads tall. SIZE: draw him about 76 big square "
    "pixels tall from his feet to the top of his head, the same size as the people in the attached animation sheet; "
    "his top hat may add up to 12 more. Feet in all four cells stand on the same baseline.\n\n"
    "THE CHARACTER: a short, round, beaming older man with warm brown skin, a neat grey goatee and twinkly eyes, a "
    "tall dark green top hat with a sprig of thyme tucked in its band, a sky-blue frock coat with gold buttons and "
    "short tails, a cream waistcoat, a red-and-gold sash from one shoulder to the other hip, a gold chain of office "
    "with a round medallion showing a two-leaf sprout, grey striped trousers and shiny black shoes. His item is a big "
    "blue prize-ribbon rosette with two tails.\n\n"
    "(1) Standing proudly, facing the viewer, holding the rosette at chest height. (2) Facing right, pinning the "
    "rosette onto something at chest height in front of him. (3) Cheering, raising his top hat high with one hand, "
    "the other fist up. (4) His big moment: cutting a wide red ribbon held across in front of him with a pair of "
    "giant golden scissors, beaming.\n\n"
    "He looks cheerful and wide awake in every pose. Nothing is held up to his face. " + NO_FX,
    cast=True,
    ref="Use the attached animation sheet and the lineup with a robot in it for style only (pixel size, outline, "
        "shading, colours). Do not copy their characters.")

# ---------------------------------------------------------------- Round 6: plants and heirlooms (Set C)
CARDS = ("Each is one whole herb plant growing in its own planter, seen from the front and slightly above, like the "
         "attached exotic plants reference. The plant is the hero and fills the upper two thirds of its cell; the "
         "planter is the lower third. Every plant has its own clear silhouette.")

add(15, "Plant card art: four Loomington herbs", "b03_15_w2_plant_cards.png",
    "square 1:1", "about 1254×1254", "Yes", "C",
    "The pictures for the four herbs that drop in Loomington: Rosemary Topiary (Epic), Royal Lavender, Silver Sage "
    "and Creeping Thyme (Rare).",
    "4 card pictures, each brought to about 108×100 art pixels.",
    FLAG,
    "Four hero plants for collectible cards in a cozy pixel-art farming game, in two rows of two, " + GRID + ". "
    + CARDS + " These are city herbs for fine homes and grand shops, so the planters are smart and polished.\n\n"
    "Row 1:\n"
    "1. Rosemary Topiary: rosemary clipped into a perfect round ball of short grey-green needle leaves on a straight "
    "slim trunk, with a second smaller ball below it, in a square white planter box with small gold feet.\n"
    "2. Royal Lavender: tall, proud spikes of deep violet lavender flowers above grey-green leaves, in a deep purple "
    "glazed planter with a gold band and a small gold crown shape on its front.\n\n"
    "Row 2:\n"
    "3. Silver Sage: a soft mound of long, oval, silvery white-green leaves with a cool frosty look, in a pale grey "
    "stone planter with a carved rim.\n"
    "4. Creeping Thyme: a low carpet of tiny round green leaves spilling over the rim and down the sides of a wide "
    "shallow red-brick planter, covered in tiny bright magenta flowers.\n\n" + NO_FX)

add(16, "Plant card art: three Loomington hybrids", "b03_16_w2_hybrid_cards.png",
    "landscape 3:2", "about 1536×1024", "Yes", "C",
    "The pictures for the first three hybrids, which the player breeds on the Hybrid Bench: Honeymint (the teaching "
    "recipe), Pepperleaf Basil and Sunset Sage. Silkspun Hemp, the fourth, is already in Batch 1.",
    "3 card pictures, each brought to about 108×100 art pixels.",
    FLAG,
    "Three hero plants for collectible cards in a cozy pixel-art farming game, in one row of three, " + GRID + ". "
    + CARDS + " These are new hybrid herbs, each mixing two parents, so they look special but still homely.\n\n"
    "1. Honeymint: a round bush of broad toothed mint leaves whose edges are tipped with warm honey gold, with small "
    "cream flower spikes, in a honey-yellow planter with a raised hexagon pattern like honeycomb.\n"
    "2. Pepperleaf Basil: a glossy dome of big cupped basil leaves in deep green with dark purple veins and purple "
    "stems, with a few tiny pink flower spikes, in a black cast-iron planter with a thin copper rim.\n"
    "3. Sunset Sage: upright stems of long oval sage leaves that shade from silver-green at the bottom to warm orange "
    "and rose at the tips, with coral-pink flower spikes, in a terracotta planter painted with one orange and one "
    "rose stripe.\n\n" + NO_FX)

add(17, "Heirloom icons: six new pieces and the birdbath", "b03_17_heirloom_icons.png",
    "landscape 4:3", "about 1448×1086", "Yes", "C",
    "The heirlooms that have no picture yet: Clover Locket, Bramble Gloves, Whetstone of Plenty, Heirloom Spindle, "
    "Canvas Guild Banner and Golden Rope Coil, plus the Moonstone Birdbath, which replaces the mortar in your B11 "
    "sheet.",
    "7 icons at 48×48 art pixels. The smaller sizes are redrawn by hand.",
    FLAG,
    "Seven treasured keepsake icons for a cozy pixel-art idle game, in two rows: four in the top row and three in "
    "the bottom row, centred, " + GRID + ". Each icon is one bold, simple object that reads at a glance at a small "
    "size, drawn like the attached currency icons: chunky, turned a little toward the viewer, with a golden-yellow "
    "highlight on its upper left. These are old family heirlooms, so they look well loved and a little precious.\n\n"
    "Row 1:\n"
    "1. A round gold locket on a short loop of gold chain, its lid set with a green four-leaf clover in enamel: four "
    "small round heart-shaped leaves.\n"
    "2. A small round stone birdbath on a short carved pedestal, its shallow bowl full of pale moonlit water with a "
    "thin crescent moon reflected in it. Nothing else in the bowl.\n"
    "3. A pair of sturdy brown leather gardening gloves, one lying over the other, with a short sprig of bramble "
    "with two blackberries tucked into one cuff.\n"
    "4. A long grey sharpening stone resting on a polished wooden stand with small gold corner caps and a tiny "
    "purple thistle flower carved on the front of the stand.\n\n"
    "Row 2:\n"
    "5. An old wooden drop spindle: a slim shaft with a round wooden disc near the bottom, wound thickly with cream "
    "thread, one loose end of thread curling away.\n"
    "6. A small cream canvas banner hanging from a wooden crossbar on a short pole with gold knobs at the ends, "
    "showing a green two-leaf sprout above a simple rope knot, with a short gold fringe along its bottom edge.\n"
    "7. A neat round coil of thick shining golden rope, finished with a round woven knot on one end.\n\n" + NO_FX,
    hemp='product',
    extra="With this prompt also attach `b02_02_currency_icons.png`, the currency icons you made in Batch 2, so "
          "the keepsakes match them.")

ROUNDS = [
    (1, "Loomington rooms, floors 1 to 4", "A", [1, 2, 3, 4], "Needed first: the player's first hour in Loomington"),
    (2, "Loomington rooms, floors 6 to 8", "A", [5, 6, 7], "Needed next"),
    (3, "Back walls for all eight rooms", "A", [8, 9, 10, 11], "Needed next"),
    (4, "The city background", "A", [12, 13], "Needed first: it is behind the tower the moment the player arrives"),
    (5, "Mayor Thyme", "B", [14], "Needed for the first Harvest Festival"),
    (6, "Loomington herbs, hybrids and heirlooms", "C", [15, 16, 17], "Needed for the chests and the Hybrid Bench"),
]
EXTRA_ROUNDS = {4, 6}
SETS = {
    "A": ("Scenes", ["B4_floor04_garden_shed_nursery_v2.png", "B4_floor_frame_shell.png"]),
    "B": ("People", ["B22_character_animation_sheet.png", "B21_manager_lineup_2.png"]),
    "C": ("Plants and items", ["B24_plant_growth_stages.png", "B23_exotic_plants.png"]),
}
assert sorted(n for r in ROUNDS for n in r[3]) == list(range(1, len(P) + 1))

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
    ("Sparkles, glints, stars or dots appear",
     "Same image with every sparkle, glint, star, light ray and floating dot removed. Keep everything else."),
    ("In a room, the middle object is small or plain",
     "Same image, but make item 3 in the middle the biggest and brightest thing, with the other props smaller around it."),
    ("In a room, the workers are much bigger or smaller than the props",
     "Same image, but draw the two workers at the size of a real person next to the props: about as tall as a door."),
    ("A background strip has sky, stars or a moon in it",
     "Same strips, but with nothing above the buildings: an empty transparent area, no sky, no stars, no moon."),
    ("The town strip has buildings in the middle",
     "Same town strip, but keep the middle third completely empty. Buildings only on the left third and the right third."),
    ("Mayor Thyme is drawn too big",
     "Redo with the same character and poses, drawn smaller: about 76 big square pixels tall from his feet to the top of his head, with lots of empty space around him."),
    ("The character changes between poses",
     "Redo the sheet. Every pose must show the exact same character as pose 1: same face, hair, outfit, colours and body size."),
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

if __name__ == '__main__':
    L = []
    w = L.append
    w("# Production Asset Batch 3: Loomington rooms and collection")
    w("")
    w("Part of the [Style Bible](STYLE_BIBLE.md). Batch revision: **1**. Style suffix version: **v1**. Hemp guards "
      "version: **v1**. Written by `tools/build_asset_batch_03.py`, which copies the suffix and guards word for word "
      "from section 21 of the bible. Never edit this file by hand.")
    w("")
    w(f"**{len(P)} images in {len(ROUNDS)} rounds.** They build Loomington, the night city of mills and the second "
      "world: seven new rooms with their workers (the eighth, the Spice Kitchen Bistro, is your v2 floor 08), back "
      "walls for all eight rooms, the city background in layers, Mayor Thyme, the four Loomington herbs, the first "
      "three hybrids and the seven heirloom icons still missing.")
    w("")
    w("The Loomington managers and the moving sheets for these workers are Batch 4. Rooms follow the recipe of the "
      "Batch 1 ropewalk (prompt 15): props and two workers in one row, the tap target in the middle, the manager's "
      "spot at the right end. Managers draw at 96×96 since Batch 2 round 8, so Mayor Thyme does too.")
    w("")
    w("Names follow the game design document (version 0.3). Each prompt describes a look, not a name, so a rename "
      "does not spoil an image.")
    w("")
    w("## How to do it on your phone")
    w("")
    w("The easiest way is the **master file**: attach `Sprout_Tower_Batch3_Master.md` and "
      "`Sprout_Tower_Batch3_References.zip` (both in the project files, `art/batch03/master/`) to one new ChatGPT "
      "chat and type **next** between images. If the chat gets full, start a new chat with the same two files and "
      "type **start at image N**. The rounds below are the same images, one prompt at a time, if you prefer that.")
    w("")
    w("1. Each round is **one new ChatGPT chat**.")
    w("2. At the start of a round, **attach that round's two reference images** (listed below) and paste the round's "
      "first prompt in the same message.")
    w("3. Then paste the round's other prompts **one at a time, in the same chat**. **Rounds 4 and 6** need one or "
      "two more pictures, named in bold at the top of the prompt.")
    w("4. Each prompt is one grey box. Copy the whole box, change nothing.")
    w("5. Upload the zip as well as the picture. If ChatGPT makes no zip, the picture alone is fine.")
    w("6. Save each picture as **PNG, original size**. No screenshots, no JPG, no cropping or resizing.")
    w("7. Upload the results in number order, or tell me which number each one is.")
    w("")
    w("### The reference sets")
    w("")
    w("| Set | For | Attach these two images |")
    w("|---|---|---|")
    for k in sorted({s for _, _, s, _, _ in ROUNDS}):
        name, files = SETS[k]
        w(f"| **{k}** | {name} | " + " and ".join(f"`{f}`" for f in files) + " |")
    w("")
    w("All three sets are from your expansion pack, the same as in Batches 1 and 2.")
    w("")
    w("### Extra pictures")
    w("")
    w("| Prompt | Also attach |")
    w("|---|---|")
    for p in P:
        if p['att']:
            w(f"| {p['n']} | " + " and ".join(f"`{f}`" for f in p['att']) + " |")
    w("")
    w("`B17_world2_big_city.png` is from your first pack and is only a guide to what is in the city; its painted "
      "style is not copied. `b02_02_currency_icons.png` is your own Batch 2 picture. A copy of every picture is in the "
      "reference zip.")
    w("")
    w("### The rounds")
    w("")
    w("| Round | Theme | Attach | Prompts | Priority |")
    w("|---|---|---|---|---|")
    for r, theme, s, ns, pri in ROUNDS:
        att = f"Set {s}" + (" plus extra pictures" if r in EXTRA_ROUNDS else "")
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
            hdr += " **Some prompts in this round need more pictures as well.** Each one is named in bold at its top."
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
    for a, b in FIX:
        w(f"| {a} | `{b}` |")
    w("")
    w("## What happens after you upload")
    w("")
    w("1. Each image is checked against Gate A of the style bible. If one needs a redo, you get its number and the "
      "exact sentence to send.")
    w("2. Accepted images go through the clean-up route and become game-size sprites.")
    w("3. Every image with hemp products in it (prompts 3 to 7 and 17) is checked with the five-question hemp review.")
    w("")
    open(OUT, "w", encoding="utf-8").write("\n".join(L))
    print("prompts", len(P), "chars", sum(len(p['prompt']) for p in P))
    for p in P:
        print(p['n'], len(p['prompt']), p['fname'])
