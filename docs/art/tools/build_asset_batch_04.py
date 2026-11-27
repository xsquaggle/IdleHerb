#!/usr/bin/env python3
"""Builds ASSET_BATCH_04.md: the Loomington cast and managers, Baron Fauxliage, the weekend events, and the Mythic and
Godly kit. The style suffix and hemp guards are read word for word from section 21 of the style bible.

Lessons from Batches 2 and 3 built in here: every image states its size in art pixels ("big square pixels"), because
ChatGPT fills a sheet with bigger people or plants when it is not told; hats and hair count inside a character's
height; strips that repeat must join at their ends.

Usage: python3 build_asset_batch_04.py ../ASSET_BATCH_04.md
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
GRID = "evenly spaced, each in its own cell, nothing touching or overlapping, nothing cut off by the edge"
NO_FX = ("No sparkles, glints, light rays, motion lines, music notes, stars or floating dots anywhere in the image. "
         "The game adds those.")
FILES = ("FILES: after the image, please also give me a zip file with (1) the sheet as exact pixel art, every art pixel "
         "the same whole number of image pixels, (2) each item, frame or layer as its own transparent PNG at true size, "
         "one image pixel per art pixel, and (3) a slices.json that names each item and gives its box on the sheet. "
         "If you cannot make the zip, the image alone is fine.")
FLAG = "Names are from the game design document (version 0.4). Each look is described, not named, so a rename is fine."
FLAG_P6 = ("Mythic and Godly are from the Game Designer's call of 2026-11-27 (design version 0.5). The look is the Art "
           "Director's.")

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
    # manager and worker sprites never show these (Lawson, 2026-11-26; hemp art rules)
    assert len(re.findall(r'\bmortar|\bpipes?\b|\bcigar', body, re.I)) == body.count('Do not give him a mortar'), n
    P.append(dict(n=n, title=title, fname=fname, shape=shape, size=size, transparent=transparent, refset=refset,
                  purpose=purpose, breakdown=breakdown, flag=flag, extra=extra, prompt=text, bg=bg,
                  att=re.findall(r'`([^`]+\.png)`', extra or '')))


# ---------------------------------------------------------------- Rounds 1 and 2: the Loomington workers (Set B)
# One sheet per room with both workers, as in Batch 2 (it worked on all eight sheets). The looks are the ones Lawson's
# Batch 3 room pictures show, word for word from build_asset_batch_03.py, so the moving workers match their rooms.
SHEET2 = ("A character animation sheet for a cozy pixel-art idle game with TWO different characters, nine poses each. "
          "The sheet is a grid of three rows and six columns, one pose per cell, evenly spaced, nothing touching. The "
          "left three columns are CHARACTER A and the right three columns are CHARACTER B, with a slightly wider gap "
          "between the two halves. Full body in every cell. Each character has the same face, outfit, colours, size and "
          "proportions in all nine of its poses, exactly like the attached animation sheet reference. Both are chunky, "
          "about two and a half heads tall, and drawn at the same scale. Feet in each row stand on the same baseline.\n\n"
          "SIZE: draw each character about 64 big square pixels tall from the feet to the top of the head, hair and "
          "hats included, with wide empty space around every pose.")
WALK = ("Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under "
        "the body, body slightly higher. (6) left leg forward, arms swinging the other way.")
STAND = ("Row 1: (1) standing relaxed, facing the viewer, smiling. (2) the same standing pose with eyes closed in a "
         "happy blink. (3) ")
AWAKE = ("Both characters look cheerful and wide awake in every pose. Their hands stay at chest height or lower and "
         "nothing is held up to a face. Nothing gives off steam, smoke or mist.")


def room_ref(what):
    return ("Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, "
            "colours). " + what + " Keep their faces, hair, outfits and colours, but draw them at the size given "
            "below.")


def worker_sheet(n, title, fname, purpose, a, b, ref, extra, hemp=False, flag=None):
    add(n, title, fname, "landscape 3:2", "about 1536×1024", "Yes", "B", purpose,
        "18 poses, 9 per character. Bodies become frames of 80×80 art pixels with the feet on row 76. One head per "
        "character is redrawn by hand and reused on every frame. These replace the single standing poses cut from "
        "the Batch 3 room picture.",
        flag or "Worker names may change. The looks are taken from your Batch 3 room picture.",
        SHEET2 + "\n\nCHARACTER A, left three columns: " + a + "\n\nCHARACTER B, right three columns: " + b + "\n\n"
        + AWAKE + " " + NO_FX,
        cast=True, hemp=hemp, ref=ref, extra=extra)


def room_extra(fname):
    return f"With this prompt also attach your Batch 3 picture `{fname}`, so the two workers match their room."


worker_sheet(1, "Workers: Rooftop Garden Beds", "b04_01_workers_w2_floor01_rooftop.png",
    "Makes both workers of Loomington floor 1, the rooftop herb garden, move.",
    "a lanky young man with light olive skin, a mop of black hair under a sky-blue bandana, a cream T-shirt, green "
    "dungarees rolled up at the ankles and yellow rubber boots.\n"
    + STAND + "cheering with both fists up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) watering the ground in front of him from a long-spouted tin watering can held "
    "low at waist height. (8) crouching to pat the soil with one hand, the watering can beside him. (9) walking to the "
    "right with the watering can swinging in one hand.",
    "a short, round woman in her sixties with deep brown skin, short grey twists, round gold earrings, a mustard-yellow "
    "cardigan over a teal dress, a striped cream apron and green rubber clogs.\n"
    + STAND + "cheering with both arms up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding a wooden tray of tiny seedlings at waist height and smiling at it. (8) "
    "bending a little to set one seedling down in front of her at knee height. (9) walking to the right carrying the "
    "tray of seedlings in both hands.",
    room_ref("The rooftop garden picture attached with this message shows the two characters to draw: CHARACTER A is "
             "the young man with the watering can, CHARACTER B is the woman in the mustard cardigan carrying "
             "seedlings."),
    room_extra("b03_01_w2_floor01_rooftop_beds.png"))

worker_sheet(2, "Workers: Corner Herb Kiosk", "b04_02_workers_w2_floor02_kiosk.png",
    "Makes both workers of Loomington floor 2, the mint kiosk on the street corner, move.",
    "a cheerful young woman with light skin, freckles and a short red bob under a green knitted beret, a cream shirt "
    "with rolled sleeves, a green-and-cream striped apron and brown shoes.\n"
    + STAND + "cheering with one fist up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) tying a bunch of fresh mint with twine at chest height. (8) setting the tied "
    "bunch down in front of her at waist height. (9) walking to the right carrying a small crate of mint bunches.",
    "a tall, slim young man with dark brown skin, short black hair with a neat side part, a crisp white shirt with "
    "rolled sleeves, a dark green waistcoat, a little mint-green bow tie, dark trousers and brown shoes.\n"
    + STAND + "cheering with one arm up, grinning.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding out a paper cone of fresh mint to the right at chest height, as if "
    "handing it to a customer. (8) wrapping a bunch of mint in brown paper at chest height. (9) walking to the right "
    "carrying a crate of mint bunches.",
    room_ref("The kiosk picture attached with this message shows the two characters to draw: CHARACTER A is the young "
             "woman in the green beret tying mint, CHARACTER B is the young man in the green waistcoat and bow tie."),
    room_extra("b03_02_w2_floor02_herb_kiosk.png"))

worker_sheet(3, "Workers: Canvas Weaving Mill", "b04_03_workers_w2_floor03_mill.png",
    "Makes both workers of Loomington floor 3, the hemp canvas mill, move.",
    "a sturdy young woman with tan skin, black hair in one long braid under a red headscarf, a cream blouse with "
    "rolled sleeves, a long sand-coloured canvas apron and brown boots.\n"
    + STAND + "cheering with both fists up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) both hands gripping a long wooden bar held across in front of her at chest "
    "height, pulling it toward her body, like the beater bar of a loom. (8) the same bar pushed away from her at arm's "
    "length. (9) walking to the right with a big cone of cream thread in each hand.",
    "a broad, bald older man with warm brown skin, a short white beard, a sky-blue work shirt with rolled sleeves, a "
    "leather apron with two thread spools in its pocket, dark trousers and brown boots.\n"
    + STAND + "cheering with one arm up, laughing.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) standing with a rolled bolt of cream canvas on one shoulder. (8) setting the "
    "bolt down in front of him at waist height. (9) walking to the right with the bolt on his shoulder.",
    room_ref("The weaving mill picture attached with this message shows the two characters to draw: CHARACTER A is "
             "the young woman at the loom, CHARACTER B is the bald man carrying a bolt of canvas."),
    room_extra("b03_03_w2_floor03_weaving_mill.png"), hemp='product')

worker_sheet(4, "Workers: Paper Workshop", "b04_04_workers_w2_floor04_paper.png",
    "Makes both workers of Loomington floor 4, where hemp fibre becomes paper and kites, move.",
    "a small, quick young man with light skin, curly blond hair, round wire glasses, a mustard shirt with rolled "
    "sleeves, a long teal rubber apron and tall rubber boots.\n"
    + STAND + "cheering with both arms up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding a wooden mould frame with a fresh wet sheet of paper on it, flat at "
    "chest height. (8) tipping the frame forward at waist height to lay the sheet down. No drips. (9) walking to the "
    "right carrying a stack of cream paper sheets.",
    "a tall young woman with light brown skin, long black hair in a high ponytail tied with a red ribbon, a lavender "
    "work smock and brown boots.\n"
    + STAND + "cheering with one fist up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding a finished diamond-shaped paper kite in red and sunny yellow with a "
    "short ribbon tail at her side, proudly. (8) folding a sheet of cream paper at chest height. (9) walking to the "
    "right with the kite tucked under one arm.",
    room_ref("The paper workshop picture attached with this message shows the two characters to draw: CHARACTER A is "
             "the young man in glasses at the paper vat, CHARACTER B is the young woman holding a kite."),
    room_extra("b03_04_w2_floor04_paper_workshop.png"), hemp='product')

worker_sheet(5, "Workers: Spice Kitchen Bistro", "b04_05_workers_w2_floor05_bistro.png",
    "Makes both workers of Loomington floor 5, the Spice Kitchen Bistro (your v2 floor 08), move. Character B is the "
    "cook in the yellow headscarf from that picture. Character A is new: the bistro's manager, Barley Biggs, is a big "
    "moustached chef, so a second one would look like his twin.",
    "a lanky young cook with warm tan skin and a short black ponytail, a small round white cook's cap, a white "
    "double-breasted cook's jacket, a red neckerchief, black-and-white checked trousers and black clogs. He has no "
    "moustache.\n"
    + STAND + "cheering with both fists up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) tossing basil leaves in a copper frying pan held by its handle at waist height, "
    "a few green leaves just above the pan. (8) stirring a copper saucepan held at waist height with a wooden spoon. "
    "No steam and no flames. (9) walking to the right carrying the copper saucepan in both hands.",
    "a cheerful, round young woman with light skin, rosy cheeks and curly brown hair under a mustard-yellow headscarf "
    "tied in a bow, a cream blouse with puffed sleeves pushed up, a long dark green pinafore apron over a dusty pink "
    "dress, and brown shoes.\n"
    + STAND + "cheering with both arms up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) tearing fresh basil leaves into a wooden bowl held at waist height. (8) holding "
    "out a plate with a basil-topped dish to the right at chest height. (9) walking to the right carrying a wicker "
    "basket of fresh basil.",
    room_ref("The kitchen picture attached with this message shows CHARACTER B: the young woman in the yellow "
             "headscarf at the chopping board. Do not draw the chef with the moustache. CHARACTER A is new."),
    "With this prompt also attach `B4_floor08_spice_kitchen_v2.png` from your expansion pack, so the cook matches "
    "your kitchen.",
    flag="Worker names may change. Character B is taken from your v2 floor 08; character A is new.")

worker_sheet(6, "Workers: Tailor's Atelier", "b04_06_workers_w2_floor06_atelier.png",
    "Makes both workers of Loomington floor 6, where hemp linen becomes clothes, move.",
    "an elegant older man with deep brown skin, a neat silver moustache, round gold spectacles, a yellow tape measure "
    "around his neck, a lavender waistcoat over a cream shirt, grey trousers and black shoes.\n"
    + STAND + "cheering with one arm up, a proud smile.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) hand-stitching the hem of a cream shirt held at chest height. (8) measuring a "
    "length of linen with the tape measure stretched between his hands at chest height. (9) walking to the right "
    "carrying a folded stack of linen shirts.",
    "a petite young woman with light skin, a sleek black bob with a straight fringe, small gold hoop earrings, a "
    "pincushion on her wrist, a sage-green dress with a white collar and black shoes.\n"
    + STAND + "cheering with both arms up and a little hop.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding up a finished sage-green linen shirt on a wooden hanger at chest "
    "height. (8) pinning the hem of a cream cloth draped over her arm. (9) walking to the right carrying the shirt on "
    "its hanger.",
    room_ref("The atelier picture attached with this message shows the two characters to draw: CHARACTER A is the "
             "older man at the sewing machine (draw him standing), CHARACTER B is the young woman holding a shirt."),
    room_extra("b03_05_w2_floor06_atelier.png"), hemp='product')

worker_sheet(7, "Workers: Hempcrete Brickyard", "b04_07_workers_w2_floor07_brickyard.png",
    "Makes both workers of Loomington floor 7, where hemp and lime become pale building blocks, move.",
    "a big, strong young man with medium brown skin, short black curls, an orange work vest over a grey T-shirt, "
    "canvas trousers with knee patches and heavy boots.\n"
    + STAND + "cheering with both fists up.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) pushing a long-handled hoe forward through the ground in front of him at waist "
    "height, as if stirring a trough. (8) pulling the hoe back toward him. (9) walking to the right carrying one pale "
    "speckled building block in both arms.",
    "a wiry older woman with light skin, a short grey crop under a red knitted cap, a denim jacket, a tool belt with a "
    "spirit level, dark trousers and sturdy boots.\n"
    + STAND + "cheering with one fist up, grinning.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) setting a pale speckled block down in front of her at chest height. (8) "
    "smoothing the top of it with a trowel at chest height. (9) walking to the right with a block under one arm and "
    "the trowel in her other hand.",
    room_ref("The brickyard picture attached with this message shows the two characters to draw: CHARACTER A is the "
             "young man in the orange vest at the mixing trough, CHARACTER B is the older woman in the red cap at the "
             "wall."),
    room_extra("b03_06_w2_floor07_brickyard.png"), hemp='product')

worker_sheet(8, "Workers: Grand Emporium", "b04_08_workers_w2_floor08_emporium.png",
    "Makes both workers of Loomington floor 8, the grand department store, move.",
    "a smiling middle-aged woman with tan skin, dark hair in a neat bun, a cream blouse with a lavender scarf, a long "
    "navy skirt and black shoes.\n"
    + STAND + "cheering with both hands clasped and raised, beaming.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) wrapping a small parcel in paper printed with little two-leaf sprouts at waist "
    "height. (8) tying a ribbon bow on the parcel at waist height. (9) walking to the right carrying the wrapped "
    "parcel.",
    "a tall young porter with light skin and ginger sideburns, a round red pillbox cap with a gold band, a red uniform "
    "jacket with gold buttons and black trousers.\n"
    + STAND + "lifting his cap with one hand in a cheerful greeting.\n" + WALK + "\n"
    "Row 3, working, facing right: (7) holding a stack of three gift boxes tied with ribbons at chest height. (8) "
    "setting the stack down in front of him at waist height. (9) walking to the right carrying the stack of boxes.",
    room_ref("The emporium picture attached with this message shows the two characters to draw: CHARACTER A is the "
             "woman wrapping a parcel, CHARACTER B is the porter in the red cap."),
    room_extra("b03_07_w2_floor08_emporium.png"), hemp='product')

# ---------------------------------------------------------------- Round 3: managers, Baron Fauxliage, Mayor (Set B)
# Managers draw in a 96×96 frame, feet on row 92, 72 to 80 tall (Batch 2 round 8). Sheets 26 and 27 came back 40%
# too big when the size was not stated, so every sheet now says it.
MSHEET = ("A character animation sheet for a cozy pixel-art idle game with {n} different characters, four poses each. "
          "The sheet is a grid of {n} rows and four columns: each row is ONE character, one pose per cell, evenly "
          "spaced, nothing touching, with a slightly wider gap between the rows. Full body in every cell. Each "
          "character has the same face, outfit, colours, size and proportions in all four of its poses, exactly like "
          "the attached animation sheet reference. All are chunky, about two and a half heads tall, and drawn at the "
          "same scale. Feet in each row stand on the same baseline.\n\n"
          "SIZE: draw every character about 76 big square pixels tall from the feet to the top of the head, hair and "
          "hats included, with wide empty space around every pose. Raised arms and items may reach higher.\n\n"
          "The four columns are the same for every character: (1) standing, facing the viewer. (2) at work, facing "
          "right. (3) cheering. (4) their big moment.")
MAWAKE = ("Every character looks cheerful and wide awake in every pose. Nothing is held up to a face or a mouth, and "
          "nothing gives off steam, smoke or mist. " + NO_FX)
MSTYLE = ("Use the attached animation sheet and the lineup with a robot in it for style only (pixel size, outline, "
          "shading, colours). ")
REDRAW = (" Keep their faces, hair, outfits and colours, but draw them in the crisp, flat pixel style of the animation "
          "sheet, not in a soft painted style.")


def manager_sheet(n, title, fname, purpose, flag, rows, ref, extra=None, hemp=False):
    k = len(rows)
    body = MSHEET.format(n={2: "TWO", 3: "THREE"}[k]) + "\n\n" + "\n\n".join(
        f"ROW {i + 1}, CHARACTER {i + 1}: {r}" for i, r in enumerate(rows)) + "\n\n" + MAWAKE
    add(n, title, fname, "landscape 3:2" if k == 3 else "landscape 16:9",
        "about 1536×1024" if k == 3 else "about 1664×936", "Yes", "B", purpose,
        f"{4 * k} poses, 4 per character, in 96×96 frames with the feet on row 92. One head per character is redrawn "
        "by hand and reused on every frame. The standing pose also gives the card picture and the 48×48 bust.",
        flag, body, cast=True, hemp=hemp, ref=ref, extra=extra)


manager_sheet(9, "Managers of Loomington floors 1 to 3: Bram Applewhite, Olive Ledger, Tansy Treadle",
    "b04_09_managers_w2_floors01_03.png",
    "The first three managers of Loomington. They stand at the manager's spot on the right of their own room: the "
    "rooftop beekeeper, the bookkeeper who now runs the mint kiosk, and the weaver who hums in time with the loom.",
    "Names are from the game design document (version 0.4). Bram and Olive are from your first manager lineup; "
    "Tansy Treadle is new.",
    ["a big, round, jolly beekeeper with light skin, rosy cheeks and a bushy ginger-red beard and moustache, a cream "
     "beekeeper's suit with a brown belt and big pockets, a wide cream beekeeper's hat with its fine net veil folded "
     "up over the brim so his whole face shows, yellow gloves and brown boots. His item is a small round jar of golden "
     "honey.\n"
     "(1) standing, the honey jar in one hand at his side, laughing. (2) holding a wooden frame of golden honeycomb in "
     "both hands at waist height and looking at it fondly. (3) cheering, lifting his wide hat high with one hand. (4) "
     "leaning to the right and holding the honey jar out at chest height, as if sharing it with a neighbour, with a "
     "big friendly grin, while three small round bees sit in a row on his hat brim. No bees in the air.",
     "a curvy, brisk businesswoman with light skin, big glossy chestnut-brown hair swept up high with a sprig of "
     "lavender in it, dark sunglasses pushed up on top of her hair so her eyes show, gold hoop earrings, a smart dark "
     "green trouser suit with a small gold two-leaf sprout badge on the lapel and a gold belt buckle, and black heeled "
     "shoes. Her item is a slim green ledger book.\n"
     "(1) standing with her arms folded and the ledger tucked under one arm, a confident smile. (2) writing in the open "
     "ledger held at chest height with a pencil. (3) cheering, holding the closed ledger high above her head. (4) "
     "holding out a bunch of fresh mint at chest height in one hand while tapping the ledger with the other, with a "
     "brisk, satisfied nod.",
     "a slim, lively weaver in her thirties with light olive skin, rosy cheeks and a tall bun of black hair tied with a "
     "red ribbon, a sky-blue dress with rolled sleeves, a cream canvas apron with a simple rope knot stitched on its "
     "pocket, a long woven scarf striped cream, red and sky blue, and brown lace-up boots. Her item is a wooden "
     "weaving shuttle wound with cream thread.\n"
     "(1) standing with the shuttle in one hand, eyes half closed and a small happy closed-mouth smile, as if humming "
     "to herself. (2) passing the shuttle from one hand to the other at chest height, as if weaving. (3) cheering, the "
     "shuttle held high, one heel kicked up. (4) holding up a long finished strip of striped canvas in both hands at "
     "chest height, beaming with pride."],
    MSTYLE + "The attached lineup of six people on a cream background, with a beekeeper in the middle, shows two of "
    "the characters: CHARACTER 1 is the beekeeper, fourth from the left, and CHARACTER 2 is the woman in the green "
    "suit on the far right." + REDRAW + " CHARACTER 3 is new.",
    extra="With this prompt also attach `B5_manager_lineup.png` from your first pack, so Bram and Olive keep their "
          "looks.",
    hemp='product')

manager_sheet(10, "Managers of Loomington floors 4 to 6: Kit Foldaway, Barley Biggs, Hazel Thimble",
    "b04_10_managers_w2_floors04_06.png",
    "The papermaker and kite builder, the grumpy cook with a heart of gold (Rare, ability Lunch Rush) and the master "
    "tailor (Epic, ability Stitch in Time). Pose 4 is what Barley and Hazel do when the player uses their ability.",
    "Names are from the game design document (version 0.4). Barley Biggs is from your second manager lineup; Kit "
    "and Hazel are new.",
    ["a short, wiry, cheerful man in his sixties with deep brown skin, a neat white chin beard, round wire glasses, a "
     "folded paper hat shaped like a little boat, a mustard-yellow cardigan over a cream shirt, a teal neckerchief, "
     "brown corduroy trousers and brown shoes, with a canvas satchel of rolled paper on his hip. His item is a small "
     "paper kite shaped like a bird, in sky blue and cream, with a short tail of cream ribbons.\n"
     "(1) standing with the bird kite tucked under one arm, grinning. (2) folding a sheet of cream paper at chest "
     "height. (3) cheering, holding the kite up high over his head, one foot kicked up. (4) running to the right "
     "holding the kite string, the bird kite flying just above and behind his head on a short string.",
     "a big, barrel-shaped cook with light skin, a red nose, bushy grey eyebrows, a big grey handlebar moustache and "
     "grey sideburns, a tall white chef's hat, a white cook's shirt with rolled sleeves, a long brown-and-orange apron "
     "with a yellow leaf pattern along its hem and a white towel tucked in at the waist, brown trousers and brown "
     "boots. He frowns a lot, but kindly. His item is a big wooden spoon. Do not give him a mortar and pestle: he "
     "holds the wooden spoon instead.\n"
     "(1) standing with his arms folded and the spoon in one hand, a grumpy frown that is clearly not mean. (2) "
     "stirring a big copper saucepan held by its handle at waist height. No steam. (3) cheering in spite of himself: "
     "a reluctant crooked grin, the spoon raised high. (4) holding out a big wooden tray piled with sandwiches and a "
     "bowl of salad at chest height, with a gruff, kind wink.",
     "a tall, elegant tailor in her sixties with tan skin, silver hair in a sleek bun, cat-eye spectacles on a gold "
     "chain, a hazel-brown tailored coat-dress with a crisp white collar and gold buttons, a red tape measure draped "
     "around her neck, a red pincushion on her wrist and polished brown shoes, with a round brass pocket watch hanging "
     "from her belt on a short chain. Her item is a big golden needle as long as her forearm, threaded with golden "
     "thread.\n"
     "(1) standing poised, holding the golden needle upright at chest height, a knowing smile. (2) stitching a cream "
     "linen sleeve draped over her arm at chest height. (3) cheering, the needle raised high, its golden thread curling "
     "in a loop. (4) swinging the pocket watch out on its chain in one hand while she pulls a long golden thread "
     "through the air in a big loop with the needle in her other hand, chin up."],
    MSTYLE + "The lineup with the robot also shows CHARACTER 2: the grumpy chef in the white hat, fourth from the "
    "left." + REDRAW + " CHARACTERS 1 and 3 are new.",
    hemp='product')

manager_sheet(11, "Managers of Loomington floors 7 and 8: Bjorn Barrow, Madame Loom",
    "b04_11_managers_w2_floors07_08.png",
    "The Legendary hempcrete builder (ability Heave-Ho) and Madame Loom, the Exotic Head of Loomington and of the "
    "weavers' guild (ability Golden Thread). She must look like the grandest person in the city: the biggest "
    "silhouette and the richest outfit.",
    "Names are from the game design document (version 0.4). Both are new.",
    ["a huge, gentle bear of a builder with ruddy light skin and a big blond beard in two thick braids, a yellow "
     "builder's hard hat, a red-and-black checked shirt with rolled sleeves, sand-coloured canvas dungarees, a leather "
     "tool belt with a trowel and a spirit level, and heavy brown boots. His item is a pale speckled building block.\n"
     "(1) standing with the block resting on one shoulder, a warm grin. (2) setting the block down at chest height and "
     "tapping it level with the trowel. (3) cheering, holding the block high over his head in one hand. (4) legs "
     "braced wide, lifting a stack of four pale blocks above his head with both arms, mouth open in a big cheerful "
     "shout.",
     "a tall, regal woman in her seventies with warm light-brown skin, a towering silver-white beehive of hair wound "
     "round with a band of golden thread, small gold earrings shaped like thread spools, a high-collared plum velvet "
     "gown with gold brocade, a long sweeping cape woven in bands of gold, plum, cream and sky blue with a gold tassel "
     "fringe, gold rings and plum shoes. Her item is a tall slim walking cane of dark polished wood topped with a "
     "golden spool wound with golden thread. She is a little taller than everyone else, and her cape makes her the "
     "widest shape on the sheet.\n"
     "(1) standing grand and tall, the cane planted at her side, chin up, a gracious smile. (2) holding a length of "
     "fine cream cloth up at chest height between both hands, inspecting it with approval. (3) cheering, raising the "
     "cane high, her cape flaring out. (4) sweeping the cane in a wide arc, a long ribbon of golden thread unspooling "
     "from its top in a big loop around her."],
    MSTYLE + "Both characters are new.",
    hemp='product')

add(12, "Baron Fauxliage, the plastic-plant salesman: poses and expressions", "b04_12_baron_fauxliage.png",
    "square 1:1", "about 1254×1254", "Yes", "B",
    "The game's comic foil. He sells plastic plants, turns up at the Harvest Festival and loses every time, and he is "
    "never mean. These poses play in his short scenes and at the Festival.",
    "9 poses in 96×96 frames with the feet on row 92, like the managers. One head is redrawn by hand.",
    "Baron Fauxliage's name and role are from the game design document (version 0.4).",
    "A character sheet for a cozy pixel-art idle game: the SAME character in nine poses and expressions, in a grid of "
    "three rows and three columns, " + GRID + ". Full body in every cell, the same face, outfit, colours, size and "
    "proportions in every pose, exactly like the attached animation sheet reference. He is chunky, about two and a "
    "half heads tall. SIZE: draw him about 76 big square pixels tall from his feet to the top of his hat, with wide "
    "empty space around every pose. Feet in each row stand on the same baseline.\n\n"
    "THE CHARACTER: a tall, thin, dapper salesman in his fifties with pale skin, rosy cheeks, a long nose and a thin "
    "black moustache curled up at the tips, slicked-back black hair with one grey streak, a lime-green bowler hat with "
    "a shiny bright pink plastic flower in its band, a loud checked suit in lime green and bubblegum pink, a yellow "
    "bow tie, white spats and shiny black shoes. His item is a too-perfect plastic plant in a shiny bright pink "
    "planter: its leaves are glossy, all exactly alike and an unnaturally bright green, and a small blank price tag "
    "hangs from it on a string. His face is friendly and a little silly, never sly or mean.\n\n"
    "Row 1: (1) standing proudly, presenting the plastic plant on one palm at chest height with a big salesman's "
    "smile. (2) the same pose with eyes closed in a happy blink. (3) talking, one hand held out palm up in the middle "
    "of a sales pitch, the plant tucked under his other arm.\n"
    "Row 2: (4) walking to the right, mid-stride, carrying the plant. (5) polishing a plastic leaf with a small cloth "
    "at chest height, very pleased with himself. (6) surprised, eyes wide and eyebrows up, his hat hopping up a "
    "little off his head.\n"
    "Row 3: (7) holding a small plain grey rosette at chest height with a sheepish, good-natured smile: he came "
    "second again. (8) clapping politely for someone else, a good sport. (9) shoulders slumped in comic despair, the "
    "plastic plant drooping in his hands, a big pout.\n\n"
    "Nothing is held up to his face. " + NO_FX,
    cast=True, ref=MSTYLE + "Do not copy their characters.")

CROWN = ("a small crown of polished white gold, a circlet with five upright points shaped like sprout leaves and one "
         "round pearl at the front")

add(13, "Mayor Thyme crowns a Head: four poses", "b04_13_mayor_thyme_crowning.png",
    "landscape 16:9", "about 1664×936", "Yes", "B",
    "The crowning scene at the Harvest Festival, when a world earns its tenth Mastery star and its Head becomes Godly. "
    "It is the biggest moment in the game. These four poses join the four you made in Batch 3.",
    "4 poses in 96×128 frames with the feet on row 124 (the raised crown needs the extra height). The crown is also "
    "cut out on its own.",
    FLAG_P6,
    "A character animation sheet for a cozy pixel-art idle game: ONE character in four poses, in one row of four "
    "cells across the middle of the image, " + GRID + ". Leave wide empty space above and below the row. Full body "
    "in every cell, the same face, outfit, colours, size and proportions in every pose. He is the man in the attached "
    "sheet of four poses with a top hat: keep his face, outfit and colours exactly. SIZE: draw him exactly as big as "
    "in that sheet: about 76 big square pixels from his feet to the top of his head, and about 96 to the top of his "
    "top hat. Feet in all four cells stand on the same baseline.\n\n"
    "THE CHARACTER: a short, round, beaming older man with warm brown skin, a neat grey goatee and twinkly eyes, a "
    "tall dark green top hat with a sprig of thyme tucked in its band, a sky-blue frock coat with gold buttons and "
    "short tails, a cream waistcoat, a red-and-gold sash from one shoulder to the other hip, a gold chain of office "
    "with a round medallion showing a two-leaf sprout, grey striped trousers and shiny black shoes. His item is "
    + CROWN + ", about 24 big square pixels wide and 14 tall, on a plum velvet cushion with a gold tassel at each "
    "corner.\n\n"
    "(1) Standing proudly, facing the viewer, holding the velvet cushion with the crown on it at chest height in both "
    "hands. (2) Facing right, holding the crown out in both hands at the height of his own head, as if setting it "
    "gently on the head of someone standing in front of him. (3) Raising the crown high above his head in both hands, "
    "mouth open in a joyful announcement. (4) Clapping his hands at chest height, beaming, the cushion tucked under "
    "one arm.\n\n"
    "He looks cheerful and wide awake in every pose. Nothing is held up to his face. " + NO_FX,
    cast=True,
    ref="Use the attached animation sheet and the lineup with a robot in it for style only (pixel size, outline, "
        "shading, colours). Do not copy their characters.",
    extra="With this prompt also attach your Batch 3 picture `b03_14_mayor_thyme.png`, so the Mayor stays the same.")

# ---------------------------------------------------------------- Round 4: weekend events (Set A)
add(14, "Weekend event emblems: Herb Fair, Night Market, Hemp Harvest Home, Blossom Parade",
    "b04_14_event_emblems.png", "square 1:1", "about 1254×1254", "Yes", "A",
    "The four weekend events, one each weekend in turn. The emblem shows on the event banner, the fair stall and the "
    "reward track.",
    "4 emblems at 48×48 art pixels. The smaller sizes are drawn by hand.",
    "Event names are from the game design document (version 0.4).",
    "Four event emblems for a cozy pixel-art idle game, in two rows of two, " + GRID + ". Each is one bold, simple "
    "object that reads at a glance at a small size, drawn like the attached currency icons: chunky, turned a little "
    "toward the viewer, with a golden-yellow highlight on its upper left. SIZE: each emblem fits inside a square of "
    "44 by 44 big square pixels.\n\n"
    "Row 1:\n"
    "1. A little round wicker basket heaped with bunches of fresh green herbs, with a small red-and-cream striped "
    "pennant flag on a short stick standing up out of it.\n"
    "2. A round warm golden paper lantern with dark red caps at its top and bottom, hanging from a short curved iron "
    "hook, with a small pale crescent moon tucked behind it on its upper right.\n\n"
    "Row 2:\n"
    "3. An upright sheaf of long, straight, pale golden stalks like straw, tied around the middle with a thick cream "
    "rope in a knot, the stalk ends fanned out a little at the top and the bottom. No leaves anywhere on it.\n"
    "4. A small round parade drum in cream with red rims and gold cords, crowned with a cluster of pink and lavender "
    "blossoms and two small green leaves.\n\n" + NO_FX,
    hemp='product',
    extra="With this prompt also attach your Batch 2 picture `b02_02_currency_icons.png`, so the emblems match the "
          "icons.")

SWAG = ("one swag about 168 big square pixels wide and 24 tall, hanging in a gentle curve from a cord whose left and "
        "right ends are at exactly the same height, so that copies join end to end")

add(15, "Fair stall dressing for the weekend events", "b04_15_fair_stall_dressing.png",
    "landscape 3:2", "about 1536×1024", "Yes", "A",
    "On event weekends the fair stall, a five-floor mini tower, reuses World 1 rooms 1 to 5. These pieces dress those "
    "rooms up for the fair: one garland across the top of each room for each event, and the same awning, prize table, "
    "ticket booth and pennant pole every time.",
    "8 pieces: four garland swags (168×24), an awning strip (64×20) that repeats, a prize table (88×56), a ticket "
    "booth (56×80) and a pennant pole (12×72), all in art pixels.",
    "Event names are from the game design document (version 0.4).",
    "A set of fair decorations for a cozy pixel-art idle game, laid out in three rows, " + GRID + ". Each piece is "
    "seen straight from the front. Sizes are given in big square pixels; keep every piece at its size.\n\n"
    "Row 1:\n"
    "1. A string of triangle bunting flags in red, cream, leaf green, mustard and lavender, repeating: " + SWAG + ".\n"
    "2. A string of small round paper lanterns in warm gold, rose and lavender on a dark cord: " + SWAG + ".\n\n"
    "Row 2:\n"
    "3. A thick cream rope hung with small tied bundles of pale straw-like stalks: " + SWAG + ".\n"
    "4. A garland of pink and lavender blossoms and small green leaves: " + SWAG + ".\n\n"
    "Row 3:\n"
    "5. A short strip of shop awning with red and cream vertical stripes and a scalloped bottom edge, about 64 wide "
    "and 20 tall, whose left and right ends match so that copies join into one long awning.\n"
    "6. A prize table: a small wooden trestle table with a red-and-cream checked cloth, holding a big basil plant in a "
    "planter with a blue prize rosette pinned to it, a jar of golden honey and a small gold trophy cup, about 88 wide "
    "and 56 tall.\n"
    "7. A small wooden ticket booth with a red-and-cream striped roof, a round sprout sign on top with nothing written "
    "on it, and an empty counter, about 56 wide and 80 tall.\n"
    "8. A tall pole with red and cream spiral stripes, topped with a small gold knob and a little green triangle "
    "pennant, about 12 wide and 72 tall.\n\n"
    "No people, no plants other than the basil and the blossoms, and no writing on any sign. " + NO_FX,
    hemp='product',
    extra="With this prompt also attach `B4_floor01_windowsill_planter_v2.png` from your expansion pack, one of the "
          "World 1 rooms these pieces dress up.")

# ---------------------------------------------------------------- Round 5: the Mythic and Godly kit (Set D)
# Design call p6 (2026-11-27): two rarities above Exotic, never rolled. Mythic is earned by the Full Bloom bench job and
# revealed at the bench; Godly crowns a world's Head at the Harvest Festival. The look (style bible sections 8 and 19):
# Exotic is pearly white and prismatic; Mythic goes dark and rich, an aurora on midnight blue, with a full-bloom flower
# as its shape cue; Godly is the brightest of all, white gold with a sprout crown and a sunburst.
KIT_REF = ("Use the reference images attached in this chat for style (pixel size, outline, shading, colours). The "
           "attached pictures of the six card frames and of the six rarity badges and bursts are the set these new "
           "pieces join: match their size, layout and level of detail exactly, but do not copy their ornaments.")
MYTHIC = "aurora colours: green-teal flowing into violet"
NO_FX_KIT = "No glow halo, no soft light and no floating dots anywhere in the image. Hard pixel edges only."

add(16, "Card frames: Mythic and Godly", "b04_16_card_frames_mythic_godly.png", "landscape 3:2", "about 1536×1024",
    "Yes", "D",
    "The two top card frames. Mythic is the frame of a plant raised by the Full Bloom bench job; Godly is the frame of "
    "a crowned Head. Each must look grander than the Exotic frame, and their shapes tell them apart without colour.",
    "2 frames at 180×240 art pixels. The small card frames and the 7 and 8 pips are made by hand.",
    FLAG_P6,
    "Two empty collectible card frames for a cozy pixel-art idle game, side by side in one row, " + GRID + ". Both "
    "have exactly the same size and the same layout as the attached six card frames: a tall card exactly 180 big "
    "square pixels wide and 240 tall, with an ornate border, an arched picture window in the upper half, a blank name "
    "ribbon across the middle, and a blank parchment panel in the lower part with two plain empty rows. Only the "
    "border ornament and its colours change. The picture window is EMPTY and transparent. The ribbon and the panel "
    "are plain, with no writing, numbers, icons or bars on them. No plant and no picture anywhere.\n\n"
    "Left to right:\n"
    "1. Mythic: a deep midnight-blue border edged with thin gold, with flowing ribbons in " + MYTHIC + " waving along "
    "it, a large fully open flower with long pointed petals in teal and violet and a gold centre at the top centre, "
    "a smaller open flower at the bottom centre, and small closed buds along each side. It is darker and richer than "
    "the pearly Exotic frame.\n"
    "2. Godly: a radiant border of polished white gold with thick gold edges. At the top centre sits " + CROWN + ", "
    "with short straight spikes of solid gold fanning out behind it like a sunburst. A row of small pearls runs down "
    "each side, and a gold laurel spray sits at the bottom centre. It is the brightest, heaviest and most ornate frame "
    "of all.\n\n"
    + NO_FX_KIT, ref=KIT_REF,
    extra="With this prompt also attach `ref_card_frames_six.png` (in the reference zip), the six frames you made in "
          "Batch 2 as they look in the game.")

add(17, "Rarity badges, bursts and the crown: Mythic and Godly", "b04_17_mythic_godly_badges_bursts.png",
    "landscape 3:2", "about 1536×1024", "Yes", "D",
    "The two new rarity badges, the burst that plays when each is revealed, and the small crown a Godly Head wears on "
    "every pose. The badge appears wherever rarity shows: frame, small card, slot and the bench.",
    "2 badges at 48×48, 8 burst frames at 64×64 and the crown at about 24×14, all in art pixels.",
    FLAG_P6,
    "Rarity art for a cozy pixel-art idle game, in three rows, " + GRID + ". Sizes are given in big square pixels; "
    "keep every piece at its size. Draw the badges like the attached six rarity badges: chunky, seen from the front, "
    "with a golden-yellow highlight on the upper left. Each new piece must look clearly richer than the Exotic one.\n\n"
    "Row 1, three pieces:\n"
    "1. The Mythic badge, fitting inside 44 by 44: an open flower with long pointed petals that shade from green-teal "
    "at the centre to violet at the tips, around a round gold centre, on a small round midnight-blue plate with a thin "
    "gold rim.\n"
    "2. The Godly badge, fitting inside 44 by 44: " + CROWN + ", standing in front of a round white-gold sunburst disc "
    "with short straight solid spikes.\n"
    "3. The crown on its own: " + CROWN + ", seen from the front, about 24 wide and 14 tall, made to sit on top of a "
    "character's head. It is the same crown as in badge 2.\n\n"
    "Row 2, the Mythic burst: four frames, each in a 64 by 64 cell, one short burst animation that grows from frame 1 "
    "to frame 3 and fades and scatters in frame 4, like the attached bursts: long pointed flower petals in teal, "
    "green-teal and violet spiralling outward, with small round gold pollen grains and four-point sparkles in teal "
    "and violet.\n\n"
    "Row 3, the Godly burst: four frames, each in a 64 by 64 cell, growing the same way: a ring of short straight "
    "white-gold spikes like a sunburst, small round pearls and gold laurel leaves flying outward, with eight-point "
    "white and gold sparkles.\n\n"
    "No dollar signs, plus signs, numbers or text. " + NO_FX_KIT, ref=KIT_REF,
    extra="With this prompt also attach `ref_rarity_badges_bursts.png` (in the reference zip), the badges and bursts "
          "you made in Batch 2 as they look in the game.")

add(18, "Full Bloom: the Mythic bud opening", "b04_18_full_bloom_bud.png", "landscape 16:9", "about 1664×936",
    "Yes", "D",
    "The reveal of a Mythic plant at the bench: the slowest build-up the bench has. A great bud swells and opens, and "
    "the new Mythic card rises out of its centre (the game moves the card and adds the light).",
    "4 frames at 112×112 art pixels, the stem in the same place in each.",
    FLAG_P6,
    "An animation sheet for a cozy pixel-art idle game: ONE magical flower bud opening, in four frames in one row "
    "across the middle of the image, " + GRID + ". Each frame is a cell 112 big square pixels wide and 112 tall. The "
    "bud grows from a short thick green stem with two broad leaves at its base, and the stem and leaves stand in "
    "exactly the same place in every cell, so the frames line up as an animation.\n\n"
    "(1) A tall closed bud, its petals wrapped tight: midnight blue at the base shading into " + MYTHIC + " at the "
    "tips, with a thin gold edge on each petal. (2) The petals loosening, their tips curling apart. (3) Half open, "
    "the petals curling outward and showing a pale gold centre. (4) Fully open: a wide flower with long pointed "
    "petals spread out in a big star shape around a large, round, EMPTY pale gold centre, the outer tips violet. The "
    "open flower fills most of its cell.\n\n" + NO_FX_KIT + " No sparkles.", ref=KIT_REF,
    extra="With this prompt also attach `ref_rarity_badges_bursts.png` (in the reference zip).")

# ---------------------------------------------------------------- Round 6: the Mythic plants (Set C)
MYTHIC_REF = ("Use the reference images attached in this chat for style (pixel size, outline, shading, colours). "
              "The attached sheet of six plants in fancy planters and the attached golden hemp card show the plants "
              "to follow: keep each plant's leaves, colours and planter, as described below. Do not draw the lavender "
              "or the white daisy from that sheet.")

add(19, "Plant card art: the Mythic forms of five Exotics", "b04_19_mythic_plant_cards.png",
    "landscape 3:2", "about 1536×1024", "Yes", "C",
    "When a max-level Exotic finishes the Full Bloom bench job it becomes its Mythic form: the same plant, grown into "
    "its grandest self. Clockwork Thyme, the sixth launch Exotic, is drawn in Batch 5 with its Mythic form beside it.",
    "5 card pictures at 108×100 art pixels: Frosted Mint, Ember Basil, Crystal Sage, Thunder Rosemary and Sunspun "
    "Hemp in Full Bloom.",
    FLAG_P6,
    "Five hero plants for collectible cards in a cozy pixel-art farming game, in two rows, three on top and two "
    "below, centred, " + GRID + ". Each is one whole herb plant growing in its own planter, seen from the front and "
    "slightly above, like the attached plants. SIZE: each plant with its planter is about 94 big square pixels tall "
    "and at most 96 wide; the plant fills the upper two thirds and the planter the lower third.\n\n"
    "Each is an Exotic plant from the attached pictures in FULL BLOOM: the same plant, colours and planter, but fuller "
    "and grander, and its planter is now gilded, with a thick gold rim, small gold feet and a band of " + MYTHIC +
    " around its middle. Each keeps the emblem on its planter.\n\n"
    "Row 1:\n"
    "1. The frosty teal mint with snow on its planter, now crowned with tall spikes of tiny white and pale teal "
    "flowers, with small icicles hanging from the planter rim.\n"
    "2. The fiery orange-red basil in the lava-cracked planter, its leaves fuller, now crowned with tall spikes of "
    "small gold and rose flowers. No flames.\n"
    "3. The sage with shimmering teal and pink leaves in the faceted crystal planter, now with tall spikes of violet "
    "sage flowers tipped with small crystal points.\n\n"
    "Row 2:\n"
    "4. The rosemary in the storm-cloud planter with the lightning bolt, taller and bushier and covered in small "
    "violet flowers. No lightning in the air.\n"
    "5. The golden hemp from the hemp card: now five tall slim golden-green canes instead of three, wound together "
    "with a spiral of shining golden thread and a second spiral ribbon in " + MYTHIC + ", in the golden planter with "
    "the sun on it. No flowers on the hemp.\n\n" + NO_FX,
    hemp='plant', ref=MYTHIC_REF,
    extra="With this prompt also attach `ref_sunspun_hemp_card.png` (in the reference zip), your Sunspun Hemp card "
          "as it looks in the game.")

ROUNDS = [
    (1, "Workers of Loomington floors 1 to 4", "B", [1, 2, 3, 4], "Needed first: the player's first hour in Loomington"),
    (2, "Workers of Loomington floors 5 to 8", "B", [5, 6, 7, 8], "Needed next"),
    (3, "The Loomington managers, Baron Fauxliage and the crowning", "B", [9, 10, 11, 12, 13],
     "Managers needed first: each arrives when their floor opens"),
    (4, "Weekend events", "A", [14, 15], "Needed by player level 12 (about day 1)"),
    (5, "The Mythic and Godly kit", "D", [16, 17, 18], "Needed late: the first Mythic is around day 25"),
    (6, "The Mythic plants", "C", [19], "Needed late, with round 5"),
]
EXTRA_ROUNDS = {1, 2, 3, 4, 5, 6}
SETS = {
    "A": ("Scenes", ["B4_floor04_garden_shed_nursery_v2.png", "B4_floor_frame_shell.png"]),
    "B": ("People", ["B22_character_animation_sheet.png", "B21_manager_lineup_2.png"]),
    "C": ("Plants and items", ["B24_plant_growth_stages.png", "B23_exotic_plants.png"]),
    "D": ("Chests and cards", ["b01_11_chest_opening_frames.png", "B25_card_layout_mockup.png"]),
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
    ("Sparkles, glints, stars, music notes or dots appear where they should not",
     "Same image with every sparkle, glint, star, music note, light ray and floating dot removed. Keep everything else."),
    ("Workers are drawn too big",
     "Redo with the same characters and poses, drawn smaller: about 64 big square pixels tall from the feet to the top of the head, hats included, with lots of empty space around each one."),
    ("Managers, the Baron or the Mayor are drawn too big",
     "Redo with the same characters and poses, drawn smaller: about 76 big square pixels tall from the feet to the top of the head, hats included, with lots of empty space around each one."),
    ("Plants on the cards are drawn too big",
     "Redo with the same plants, drawn smaller: each plant with its planter about 94 big square pixels tall and at most 96 wide."),
    ("Something is held to a face, or steam or smoke appears",
     "Same pose, but keep every item at chest height or lower, away from the face, and remove all steam, smoke and mist."),
    ("A leaf appears on the Hemp Harvest Home emblem or in the stalk garland",
     "Same piece, but only straight pale stalks tied with rope: no leaves anywhere on it."),
    ("A garland's two ends hang at different heights",
     "Same garland, but its left and right ends hang at exactly the same height, so two copies join end to end."),
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
    w("# Production Asset Batch 4: Loomington cast, managers, events, Mythic and Godly")
    w("")
    w("Part of the [Style Bible](STYLE_BIBLE.md). Batch revision: **1**. Style suffix version: **v1**. Hemp guards "
      "version: **v1**. Written by `tools/build_asset_batch_04.py`, which copies the suffix and guards word for word "
      "from section 21 of the bible. Never edit this file by hand.")
    w("")
    w(f"**{len(P)} images in {len(ROUNDS)} rounds.** They bring Loomington to life: moving sheets for the sixteen "
      "workers of its eight rooms, its eight managers, Baron Fauxliage and the weekend events. Then comes the kit for "
      "the two new top rarities, Mythic and Godly: two card frames, two badges and bursts, the crown, the Full Bloom "
      "bud, the Mythic forms of five Exotics and Mayor Thyme crowning a Head.")
    w("")
    w("Every sheet carries two workers, as in Batch 2, so the plan's separate \"second worker\" sheets are no longer "
      "needed. **Every image now says its size in art pixels** (\"big square pixels\"): in Batches 2 and 3, sheets "
      "that did not say it came back with people up to 40% too big and cards up to four times too big.")
    w("")
    w("Names follow the game design document (version 0.4); Mythic and Godly follow the Game Designer's call of "
      "2026-11-27 (version 0.5). Each prompt describes a look, not a name, so a rename does not spoil an image.")
    w("")
    w("## How to do it on your phone")
    w("")
    w("The easiest way is the **master file**: attach `Sprout_Tower_Batch4_Master.md` and "
      "`Sprout_Tower_Batch4_References.zip` (both in the project files, `art/batch04/master/`) to one new ChatGPT "
      "chat and type **next** between images. If the chat gets full, start a new chat with the same two files and "
      "type **start at image N**. The rounds below are the same images, one prompt at a time, if you prefer that.")
    w("")
    w("1. Each round is **one new ChatGPT chat**.")
    w("2. At the start of a round, **attach that round's two reference images** (listed below) and paste the round's "
      "first prompt in the same message.")
    w("3. Then paste the round's other prompts **one at a time, in the same chat**. Most prompts in this batch need "
      "one more picture as well, named in bold at the top of the prompt.")
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
    w("All four sets are from your expansion pack and your Batch 1 pictures, the same as before.")
    w("")
    w("### Extra pictures")
    w("")
    w("| Prompt | Also attach |")
    w("|---|---|")
    for p in P:
        if p['att']:
            w(f"| {p['n']} | " + " and ".join(f"`{f}`" for f in p['att']) + " |")
    w("")
    w("The `b03_` and `b02_` pictures are your own from Batches 2 and 3. The three `ref_` pictures are made from the "
      "cleaned game sprites, so the new pieces match what is in the game. A copy of every picture is in the reference "
      "zip.")
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
    w("1. Each image is checked against Gate A of the style bible, and its size is measured against the size the "
      "prompt asked for. If one needs a redo, you get its number and the exact sentence to send.")
    w("2. Accepted images go through the clean-up route and become game-size sprites.")
    hemp_ns = [p['n'] for p in P if 'HEMP' in p['prompt']]
    w("3. Every image with hemp in it (prompts " + ", ".join(str(n) for n in hemp_ns) + ") is checked with the "
      "five-question hemp review.")
    w("")
    open(OUT, "w", encoding="utf-8").write("\n".join(L))
    print("prompts", len(P), "chars", sum(len(p['prompt']) for p in P))
    for p in P:
        print(p['n'], len(p['prompt']), p['fname'])
