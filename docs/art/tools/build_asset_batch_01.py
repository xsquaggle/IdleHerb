#!/usr/bin/env python3
"""Builds ASSET_BATCH_01.md so that every prompt carries the identical fixed suffix.

Usage: python3 build_asset_batch_01.py ../ASSET_BATCH_01.md
"""
import sys

OUT = sys.argv[1]

STYLE = ("STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, "
         "with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. "
         "Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. "
         "Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. "
         "Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; "
         "shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, "
         "golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading "
         "of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, "
         "logos, watermark or signature.")
BG_T = "BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame."
BG_P = ("BACKGROUND: transparent (PNG with alpha) around and between the panels. "
        "Each panel itself is fully painted edge to edge.")
HEMP = ("HEMP LOOK: industrial fibre hemp drawn as a tall farm crop, like bamboo or tall corn: a straight slim green cane "
        "with ringed joints, bare in its lower half, with small drooping groups of 3 to 5 narrow leaflets seen from the side "
        "in the upper half and a slim leafy tuft on top. Whole plants only, in farm context. No flower buds, no close-up of "
        "plant tops, no single fan-shaped leaf shown alone or used as an emblem, no smoke, no jars of dried leaves, "
        "nothing held to a face.")
HEMP_P = ("HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop "
          "goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a "
          "rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant "
          "close-ups, no smoke, no jars of dried leaves, nothing held to a face.")
REF = ("Use the reference images attached in this chat for style only (pixel size, outline, shading, colours). "
       "Do not copy their content.")
CAST = "CAST: characters invented for this game, not based on any real person or any existing cartoon character."

PANELS = ("Two background wall panels for a cozy pixel-art idle game about a herb-growing tower. The two panels are stacked "
          "one above the other with a clear empty gap between them. Each panel is a wide flat rectangle, three times as wide "
          "as it is tall, seen straight from the front with no perspective. These are empty backdrops: no people, no furniture, "
          "no potted plants, no floor, no ceiling beams, no border frame. Keep both panels quiet: soft low-contrast colours, "
          "a little darker and cooler than the reference props, with few details, so that bright props and characters placed "
          "in front of them will stand out.")
FLAT_SKY = ("is ONE flat plain pale blue colour with no clouds, no sun and no shading "
            "(the game replaces it with its own sky)")

FARMER = ("a sturdy, cheerful farmer in their fifties with warm brown skin, short curly black hair greying at the temples, "
          "a wide straw hat with a sage-green band, bushy eyebrows and a big smile, a cream shirt with rolled sleeves, "
          "sage-green dungarees with a rope belt, and brown boots")
GRANNY = ("a cheerful, plump grandmother with fluffy grey hair in a bun tied with a cream bow headband, round red glasses, "
          "rosy cheeks, small gold earrings, a salmon-pink cardigan over a cream blouse, a dark red apron with one pocket "
          "over a cream skirt, and brown heeled shoes")
SHEET = ("A character animation sheet for a cozy pixel-art idle game: the SAME character in nine poses, in a grid of three "
         "rows and three columns, one pose per cell, evenly spaced, nothing touching. Full body in every cell. Same size, "
         "same face, same outfit, same colours and same proportions in every pose, exactly like the attached animation "
         "sheet reference. The character is chunky, about two and a half heads tall. Feet in each row stand on the same "
         "baseline.")
GRID = "evenly spaced, each in its own cell, the same visual size, nothing touching or overlapping, nothing cut off by the edge"

P = []


def add(n, title, fname, shape, size, transparent, refset, purpose, breakdown, flag, body, hemp=False, bg=BG_T, cast=False,
        ref=REF, extra=None):
    parts = [ref, body]
    if cast:
        parts.append(CAST)
    if hemp == 'plant':
        parts.append(HEMP)
    elif hemp == 'product':
        parts.append(HEMP_P)
    parts += [STYLE, bg, f"Image shape: {shape}."]
    P.append(dict(n=n, title=title, fname=fname, shape=shape, size=size, transparent=transparent, refset=refset,
                  purpose=purpose, breakdown=breakdown, flag=flag, extra=extra, prompt="\n\n".join(parts)))


# ---------------------------------------------------------------- Round 1: scenes (Set A)
add(1, "Back walls: windowsill room and balcony", "b01_01_backwalls_windowsill_balcony.png",
    "landscape 3:2", "about 1536×1024", "Around the panels only", "A",
    "The wall layer behind the props of floors 1 and 2. The shell interiors are see-through, so every room needs one.",
    "2 panels. Each is cut out and brought to 336×104 art pixels.",
    "Floor names may change. The rooms are described by type.",
    PANELS + "\n\n"
    "TOP PANEL, a cozy kitchen windowsill room: a warm cream plaster wall with a faint pattern of tiny leaves, wooden "
    "panelling along the bottom third, one large arched window left of centre showing a plain golden evening sky and far "
    "purple rooftops, cream curtains tied back at its sides, and one small framed pressed-flower picture on the right.\n\n"
    "BOTTOM PANEL, the house wall behind a town balcony: a warm terracotta brick wall, a tall double glass door with "
    "lavender-purple wooden shutters in the middle, a small round window on the right, a climbing ivy vine in the top left "
    "corner, and a cream-and-rose striped awning strip along the very top.",
    bg=BG_P)

add(2, "Back walls: backyard and garden shed", "b01_02_backwalls_backyard_shed.png",
    "landscape 3:2", "about 1536×1024", "Around the panels only", "A",
    "The wall layer for floors 3 and 4. The backyard is open air, so the game's own sunset sky shows above the hedge.",
    "2 panels at 336×104. The flat blue area of the backyard panel is removed in clean-up.",
    "Floor names may change.",
    PANELS + "\n\n"
    "TOP PANEL, a backyard garden: a wooden picket fence with a rounded garden gate in the middle runs along the bottom "
    "half, a clipped dark green hedge stands behind it, and there is one round fruit tree at the far left and one at the "
    "far right. Everything above the hedge and trees " + FLAT_SKY + ".\n\n"
    "BOTTOM PANEL, inside a wooden garden shed: a wall of vertical warm brown planks, a small square four-pane window "
    "right of centre with golden evening light, one horizontal wooden rail with empty pegs, a few knots and nail heads, "
    "and a small cobweb in one top corner.",
    bg=BG_P)

add(3, "Back walls: greenhouse and farm field", "b01_03_backwalls_greenhouse_field.png",
    "landscape 3:2", "about 1536×1024", "Around the panels only", "A",
    "The wall layer for floor 5 and for the hemp field floor.",
    "2 panels at 336×104. The flat blue area of the field panel is removed in clean-up.",
    "Floor names may change. Where the hemp field sits in the tower is the Game Designer's call.",
    PANELS + "\n\n"
    "TOP PANEL, inside a glass greenhouse: a white-painted iron frame of slim posts and arched ribs divides the wall into "
    "tall glass panes. Through the glass there is a plain pale teal evening tone with the soft dark shapes of far hills "
    "along the bottom. A little ivy climbs one post.\n\n"
    "BOTTOM PANEL, a farm field backdrop: gentle far hills covered with neat rows of a tall green crop, drawn as simple "
    "sage-green stripes with no single plants or leaves visible, a wooden rail fence across the lower part, and a small "
    "red-brown barn and a little windmill far away on the left. Everything above the hills " + FLAT_SKY + ".",
    bg=BG_P)

add(4, "Hemp field floor: props and two workers", "b01_04_floor_hemp_field.png",
    "very wide landscape 3:1", "about 2160×720", "Yes", "A",
    "The contents of the first hemp floor, in the same form as your v2 floors. The crop itself is added by the game in the "
    "middle gap so it can grow.",
    "Sliced into: fence with scarecrow, stook, farmer, soil row, field hand, cart, barrel and can. Brought to 360×120.",
    "Floor name and worker names may change.",
    "A row of farm props and two farm workers for one floor of a cozy pixel-art idle game, arranged left to right on one "
    "shared ground line, exactly like the attached floor reference: separate objects with small gaps between them, "
    "nothing cut off by the edges.\n\n"
    "Left to right:\n"
    "1. A short piece of wooden rail fence with a friendly scarecrow in a straw hat and a patched jacket. Two small brown "
    "sparrows sit on its arms.\n"
    "2. A stook: three tied sheaves of long, straight, pale golden-green stalks leaning together.\n"
    "3. A worker walking to the right, carrying a tied sheaf of long stalks on one shoulder: " + FARMER + ".\n"
    "4. AN EMPTY GAP in the middle, about one quarter of the image width. Only a long low mound of dark ploughed soil "
    "lies on the ground line there. The game plants the crop here.\n"
    "5. A second worker, kneeling and tying a sheaf with twine: a lanky young field hand with light freckled skin, a long "
    "ginger braid, a faded lavender neckerchief, a cream shirt, brown rolled-up trousers with braces and tall green "
    "rubber boots.\n"
    "6. A wooden two-wheeled farm cart loaded with tied sheaves, then a wooden water barrel with a tin watering can "
    "beside it.\n\n"
    "Both workers look brisk, proud and wide awake. There are no standing crop plants in this image.",
    hemp='product', cast=True)

# ---------------------------------------------------------------- Round 2: plants (Set C)
add(5, "Hemp growth stages", "b01_05_hemp_growth_stages.png",
    "very wide landscape 3:1", "about 2160×720", "Yes", "C",
    "The crop the player taps on the hemp field floor. This is the image that defines hemp for the whole game.",
    "5 sprites, one per stage. The harvest stage becomes 32×96 art pixels.",
    "None.",
    "A plant growth chart for a cozy pixel-art farming game: the same industrial fibre hemp plant at five growth stages "
    "in a single row, from left to right, evenly spaced, all standing on the same ground line. Sizes are true to each "
    "other: do NOT enlarge the small stages. Each stage grows from a low mound of dark soil. No pots.\n\n"
    "1. Seed: only the soil mound, with three tiny round seeds on top.\n"
    "2. Sprout: three tiny two-leaf seedlings, each about as tall as the mound.\n"
    "3. Young: three thin green canes about one fifth of the final height, with a few small leaves.\n"
    "4. Tall: three canes about three quarters of the final height, with leaf groups only in the upper half.\n"
    "5. Harvest-ready: three canes at full height, the tallest thing in the image, almost reaching the top edge. The "
    "bottom third of each cane has turned straw-gold. Slim leafy tufts on top. A short twist of rope is tied round the "
    "clump.\n\n"
    "The plants are much taller than they are wide. Leaves are cool sage green, not neon green.",
    hemp='plant')

add(6, "Hemp varieties and harvest props", "b01_06_hemp_varieties_harvest.png",
    "landscape 16:9", "about 1664×936", "Yes", "C",
    "The other hemp plants and everything a harvest leaves behind. Used on the hemp floors and in card art.",
    "8 sprites. The giant cane's base and top are joined in the game by a repeating cane piece cut from the base.",
    "None.",
    "A sheet of eight farm items for a cozy pixel-art farming game, in two rows of four, " + GRID + ".\n\n"
    "Row 1:\n"
    "1. A seed hemp plant: shorter and branchier than fibre hemp, with slim hanging ears of small round cream-and-tan "
    "seeds, like oats or millet. One small brown sparrow sits on a branch.\n"
    "2. One tied sheaf of long straight pale golden-green stalks, standing upright.\n"
    "3. A stook: three such sheaves leaning together.\n"
    "4. A round bale of pale golden stalks tied with twine.\n\n"
    "Row 2:\n"
    "5. A wooden drying rack with bundles of pale golden stalks hanging from it.\n"
    "6. A hank of pale blond combed fibre, tied in the middle, like a thick ponytail of straw-blond hair.\n"
    "7. The BASE of a giant prize-winning hemp cane: one very thick green cane with ringed joints, as thick as bamboo, "
    "growing from a wooden half-barrel planter, with a blue first-prize ribbon rosette on the barrel and a small wooden "
    "ladder leaning on the cane. The cane runs straight up and out of the top of its cell.\n"
    "8. The TOP of the same giant cane: the thick cane comes up from the bottom of its cell and ends in a slim leafy "
    "tuft with a tiny cream pennant flag.",
    hemp='plant')

add(7, "Herb growth stages: basil, rosemary, lavender", "b01_07_herb_growth_stages.png",
    "landscape 4:3", "about 1448×1086", "Yes", "C",
    "Growth stages for the three everyday herbs that have none yet. Your B24 sheet already covers mint.",
    "15 sprites: 3 herbs × 5 stages. Foliage and pot are separated in clean-up.",
    "Which herb sits on which floor is the Game Designer's call. The plants are safe either way.",
    "A plant growth chart for a cozy pixel-art farming game, like the attached growth-stage reference: three kitchen "
    "herbs, each shown at five growth stages. Three rows and five columns, " + GRID + ". Every plant grows in the same "
    "simple terracotta pot, the same pot size in every cell, and the pots in a row stand on the same baseline. Sizes are "
    "true to each other: do NOT enlarge the small stages.\n\n"
    "Columns, left to right:\n"
    "1. A pot of dark soil with a few seeds on top.\n"
    "2. A tiny two-leaf sprout.\n"
    "3. A young plant, about one third of full size.\n"
    "4. A full-grown plant.\n"
    "5. The same full-grown plant, extra lush, with three or four small four-point sparkles around it.\n\n"
    "Row 1, basil: big glossy cupped oval leaves in a rounded dome, bright fresh green.\n"
    "Row 2, rosemary: upright woody stems covered in short needle leaves, like little green bottle brushes, grey-green. "
    "Stage 5 has a few tiny pale blue flowers.\n"
    "Row 3, lavender: a tuft of thin grey-green leaves with tall thin stems topped by purple flower spikes. The flower "
    "spikes appear at stage 4 and are fullest at stage 5.")

# ---------------------------------------------------------------- Round 3: characters (Set B)
add(8, "Worker animation sheet: floor 1 gardener", "b01_08_worker_sheet_floor1_gardener.png",
    "square 1:1", "about 1254×1254", "Yes", "B",
    "Makes the lead worker of floor 1 (the grandmother from your v2 floor 01) walk, work and cheer.",
    "9 poses. Bodies become frames of 80×80 art pixels. One head is redrawn by hand and reused on every frame.",
    "Her name may change. Her look is taken from your v2 floor 01.",
    SHEET + "\n\n"
    "THE CHARACTER: " + GRANNY + ".\n\n"
    "Row 1: (1) standing relaxed, facing the viewer, hands together, smiling. (2) the same standing pose with eyes closed "
    "in a happy blink. (3) cheering with both arms up and a little hop.\n"
    "Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the "
    "body, body slightly higher. (6) left leg forward, arms swinging the other way.\n"
    "Row 3, working, facing right: (7) leaning forward and reaching out with both hands to pick leaves. (8) standing "
    "back up, holding a small wooden bowl of picked green leaves at waist height. (9) walking to the right carrying a "
    "potted green herb in both hands.",
    cast=True,
    ref=("Use the attached animation sheet and manager lineup for style only (pixel size, outline, shading, colours). "
         "The third attached image is a floor scene with two gardeners and plant shelves: the grandmother with glasses on "
         "its left side is the character to draw. Keep her face, hair, outfit and colours."),
    extra="For this prompt also attach `B4_floor01_windowsill_planter_v2.png`, so the grandmother matches your floor 01.")

add(9, "Worker animation sheet: hemp farmer", "b01_09_worker_sheet_hemp_farmer.png",
    "square 1:1", "about 1254×1254", "Yes", "B",
    "The lead worker of the hemp field floor, a new character, ready to animate.",
    "9 poses, as for prompt 8. The rake and the sheaf are separated as props.",
    "Name may change.",
    SHEET + "\n\n"
    "THE CHARACTER: " + FARMER + ".\n\n"
    "Row 1: (1) standing relaxed, facing the viewer, thumbs hooked in the dungaree straps, smiling. (2) the same standing "
    "pose with eyes closed in a happy blink. (3) cheering with both arms up, hat lifted in one hand.\n"
    "Row 2, walking to the right, seen from the side: (4) right leg forward, arms swinging. (5) legs passing under the "
    "body, body slightly higher. (6) left leg forward, arms swinging the other way.\n"
    "Row 3, working, facing right: (7) reaching forward with a long wooden hay rake. (8) pulling the rake back toward "
    "the body. (9) walking to the right carrying a tied sheaf of long pale golden-green stalks on one shoulder.\n\n"
    "The farmer looks brisk, proud and wide awake in every pose.",
    hemp='product', cast=True)

add(10, "Hemp and workshop managers lineup", "b01_10_managers_hemp_lineup.png",
    "landscape 16:9", "about 1664×936", "Yes", "B",
    "The five managers of the hemp floors: the faces on manager cards and in each room.",
    "5 full-body sprites at 64 art pixels tall, plus five 48×48 portraits redrawn from them.",
    "Names, and which manager runs which floor, belong to the Game Designer.",
    "Five manager characters for a cozy pixel-art idle game, standing in one row like the attached manager lineup "
    "reference: full body, evenly spaced, not touching, all on the same baseline. Each is chunky, about two and a half "
    "heads tall, with a very different body shape, age and silhouette from the others. All five look brisk, proud and "
    "wide awake, like master craftspeople who love their trade.\n\n"
    "1. The field boss: tall and lanky, deep brown skin, short silver curly hair, round spectacles, a cream shirt, a "
    "sage-green waistcoat and tall rubber boots. Holds a long wooden measuring pole taller than themselves in one hand "
    "and has a tied sheaf of long pale stalks under the other arm. Proud chin-up smile.\n"
    "2. The ropemaker: broad and burly, tan skin, a big ginger moustache, a flat navy cap, a cream-and-navy striped "
    "shirt with rolled sleeves and a brown leather apron. A huge coil of thick cream rope hangs over one shoulder. The "
    "other arm is flexed proudly.\n"
    "3. The weaver: a small, elegant elderly woman with light skin, white hair in a neat braided crown, half-moon "
    "glasses on a chain, a lavender dress with a cream apron and a tape measure round her neck. She holds a wooden "
    "weaving shuttle up like a conductor's baton and has a rolled bolt of cream canvas under her arm.\n"
    "4. The papermaker: a neat, cheerful young man with golden-tan skin and straight black hair in a short ponytail, a "
    "teal apron over a cream shirt, and a pencil behind one ear. He holds a rectangular wooden frame with a fresh blank "
    "cream sheet of paper on it. Delighted smile.\n"
    "5. The mason: a stocky, strong woman with dark brown skin, hair wrapped in a bright gold headscarf under a yellow "
    "hard hat, and clay-orange overalls with dusty knees. She holds a trowel in one hand and balances a pale cream "
    "speckled building block on the other palm. Confident wink.",
    hemp='product', cast=True)

# ---------------------------------------------------------------- Round 4: items (Set C)
add(11, "Chest opening frames", "b01_11_chest_opening_frames.png",
    "landscape 16:9", "about 1664×936", "Yes", "C",
    "The in-between frames for the chest opening. Your B10 sheet has closed and full chests. The game needs the lid "
    "moving and an empty open chest so the cards can fly out on their own.",
    "8 frames: 2 chests × 4 steps, 96×80 art pixels each. Lids are also cut out as separate parts.",
    "Chest and rarity names may change.",
    "An animation sheet of two treasure chests opening, for a cozy pixel-art idle game. Two rows of four frames, "
    + GRID + ". Within a row the chest is the same size and stands in the same place in every cell, so that the frames "
    "line up as an animation. Each chest is seen from slightly above, turned a little to the right.\n\n"
    "The four frames in each row, left to right:\n"
    "1. Closed.\n"
    "2. Lid lifted just a crack.\n"
    "3. Lid half open.\n"
    "4. Lid fully open and thrown back. The chest is EMPTY inside, lined with plain cream cloth.\n\n"
    "Row 1, the common chest: plain warm brown wooden planks with grey iron bands, rivets and a simple iron lock, and one "
    "small green sprig growing at its foot.\n"
    "Row 2, the legendary chest: rich gold all over, with laurel-leaf relief and a round medallion on the front showing a "
    "small two-leaf sprout.\n\n"
    "No treasure, no items, no light rays and no sparkles in any frame. The game adds those.")

add(12, "Hemp plant card art", "b01_12_hemp_card_art.png",
    "landscape 3:2", "about 1536×1024", "Yes", "C",
    "The hero pictures for the hemp plant cards: three farm varieties and three magical ones.",
    "6 card pictures, each brought to about 108×100 art pixels.",
    "The three magical varieties are placeholders (golden-thread, moon-silver, star-loom). Names and count belong to the "
    "Game Designer.",
    "Six hero plants for collectible cards in a cozy pixel-art farming game, in two rows of three like the attached "
    "exotic plants reference, " + GRID + ". Each is a clump of whole hemp canes growing in a wide container. In every "
    "picture the canes are the hero: tall, slim and much taller than the container.\n\n"
    "Row 1, farm varieties:\n"
    "1. Fibre hemp: five tall slim green canes in a long wooden planter trough with rope handles.\n"
    "2. Seed hemp: a shorter, branchier clump in a wooden half-barrel, with slim hanging ears of small round "
    "cream-and-tan seeds, and one small brown sparrow.\n"
    "3. Giant show-hemp: one very thick cane, as thick as bamboo, in a half-barrel with a blue first-prize ribbon "
    "rosette. It is so tall that it runs out of the top of its cell. A tiny wooden ladder leans against it.\n\n"
    "Row 2, magical varieties. The magic is in the canes and the fibre. The leafy tops stay plain:\n"
    "4. Golden-thread hemp: green canes with a bright golden thread spiralling up each one, in a cream planter with a "
    "gold rim, and a few small four-point gold sparkles.\n"
    "5. Moon-silver hemp: pale silver-blue canes with lighter joints, in a deep purple planter painted with a crescent "
    "moon, and a few tiny white stars.\n"
    "6. Star-loom hemp: deep indigo canes with tiny star-shaped joints, in a dark blue planter painted with a star. A "
    "ribbon of pale woven cloth drifts up from the clump like a banner.",
    hemp='plant')

add(13, "Hemp seed packets and jars", "b01_13_hemp_seed_packets.png",
    "landscape 16:9", "about 1664×936", "Yes", "C",
    "Seed cards and shop items for hemp, to sit next to your B9b herb seed packets.",
    "8 icons at 48×48 art pixels, with 32 pixel versions redrawn from them.",
    "Variety names may change.",
    "A sheet of eight seed items for a cozy pixel-art farming game, in two rows of four, " + GRID + ". Packets carry a "
    "small picture and a few tiny scribble lines that suggest writing, but no real letters or numbers.\n\n"
    "Row 1:\n"
    "1. A kraft-brown paper seed packet tied with twine. Its picture shows a whole tall slim cane plant next to a coil "
    "of rope.\n"
    "2. A cream paper seed packet. Its picture shows a tall plant with hanging grain ears and a small sparrow.\n"
    "3. A sage-green paper seed packet with a small blue prize ribbon. Its picture shows one very thick, very tall "
    "cane.\n"
    "4. A small wooden scoop full of round grey-brown seeds, with a few seeds spilled beside it.\n\n"
    "Row 2:\n"
    "5. A round glass jar with a gold lid, full of golden seeds, with a golden thread tied round its neck.\n"
    "6. A round glass jar with a silver crescent-moon lid, full of pale silver-blue seeds.\n"
    "7. A round glass jar with a star-shaped lid, full of deep indigo seeds with tiny star sparkles.\n"
    "8. A small burlap seed sack tied with twine, stamped with a simple two-leaf sprout mark.",
    hemp='plant')

add(14, "Hemp product icons", "b01_14_hemp_product_icons.png",
    "landscape 16:9", "about 1664×936", "Yes", "C",
    "What the hemp floors make. Used as income icons, order items, shop items and card pictures.",
    "12 icons at 48×48 art pixels, with 32 and 16 pixel versions redrawn from them.",
    "The product list belongs to the Game Designer. These twelve are safe basics.",
    "A sheet of twelve product icons for a cozy pixel-art farming and crafting game, in three rows of four, " + GRID +
    ". Each icon is one simple object seen from slightly above. Any label or stamp on a product shows a small rope knot "
    "or a simple two-leaf sprout.\n\n"
    "Row 1: (1) a coil of thick cream rope. (2) a ball of twine with a loose end. (3) a rolled bolt of cream canvas "
    "cloth. (4) a neatly folded cream linen-style shirt.\n"
    "Row 2: (5) a cream canvas tote bag with rope handles. (6) a stack of cream paper sheets tied with string. (7) a "
    "notebook with a sage-green cover and a ribbon bookmark. (8) one pale cream speckled building block.\n"
    "Row 3: (9) a small stack of such blocks with a trowel resting on top. (10) a burlap sack full of round grey-brown "
    "seeds. (11) a kitchen bottle of golden cooking oil with a cork stopper and a blank label. (12) a bar of pale green "
    "soap with a sprout mark pressed into it, on a small wooden dish.",
    hemp='product')

# ---------------------------------------------------------------- Round 5: second hemp floor (Set A)
add(15, "Rope and textile mill floor: props and two workers", "b01_15_floor_rope_textile_mill.png",
    "very wide landscape 3:1", "about 2160×720", "Yes", "A",
    "The contents of the first hemp product floor, where stalks become rope and cloth.",
    "Sliced into: fibre baskets and shelf, rope wheel, ropemaker, rope run and post, loom, weaver, cloth shelf. "
    "Brought to 360×120.",
    "Floor name and worker names may change.",
    "A row of workshop props and two workers for one floor of a cozy pixel-art idle game, arranged left to right on one "
    "shared ground line, exactly like the attached floor reference: separate objects with small gaps between them, "
    "nothing cut off by the edges.\n\n"
    "Left to right:\n"
    "1. A wooden shelf with baskets of pale blond fibre hanks and a few rope coils hanging from pegs.\n"
    "2. A big wooden rope-making wheel with a hand crank, twisting three thin cream strands into one thick rope. The "
    "rope runs to the right, across to a short wooden post with an iron hook.\n"
    "3. A worker turning the crank: a stout, cheerful young woman with deep brown skin, hair in two round puffs tied "
    "with cream ribbons, a mustard-yellow shirt with rolled sleeves, a brown leather apron and sturdy boots.\n"
    "4. A wooden floor loom with a half-woven sheet of cream canvas on it.\n"
    "5. A worker sitting on a stool at the loom: a tall, thin old man with light skin, a long white moustache, round "
    "glasses, a soft plum-purple cap, a cream shirt and a plum waistcoat, passing a wooden shuttle through the "
    "threads.\n"
    "6. A low wooden shelf with rolled bolts of cream canvas, one folded cream cloth and a large coil of finished "
    "rope.\n\n"
    "Both workers look brisk, proud and wide awake. No plants in this image.",
    hemp='product', cast=True)

add(16, "Back walls: timber mill and craft workshop", "b01_16_backwalls_mill_workshop.png",
    "landscape 3:2", "about 1536×1024", "Around the panels only", "A",
    "The wall layer for the rope and textile mill and for a paper or craft workshop floor.",
    "2 panels at 336×104.",
    "Floor names and the final floor list may change. Both walls are generic enough to reuse.",
    PANELS + "\n\n"
    "TOP PANEL, inside a timber mill: a tall post-and-beam wall of warm brown planks, a row of three tall narrow windows "
    "with golden evening light, a big wooden cog wheel fixed to the wall on the left, and one loop of rope on a peg.\n\n"
    "BOTTOM PANEL, a tidy craft workshop: a cream plaster wall above pale wooden panelling, a wide window with small "
    "panes in the centre showing a plain golden evening sky, a clothesline strung high across the wall with a row of "
    "blank cream paper sheets hanging from wooden pegs, and one empty wall shelf on the right.",
    bg=BG_P)

# ---------------------------------------------------------------- Round 6: UI icons (Set C)
add(17, "Menu and stat icons", "b01_17_ui_icons.png",
    "landscape 16:9", "about 1664×936", "Yes", "C",
    "The designs for the menu buttons and stat symbols. The UI frames and buttons themselves are built by hand, not "
    "generated.",
    "24 icons at 32×32 art pixels. The 24 and 16 pixel versions are redrawn by hand.",
    "The menu list belongs to the Game Designer. Unused icons are simply left out.",
    "A sheet of twenty-four user-interface icons for a cozy pixel-art idle game, in four rows of six, " + GRID +
    ". Each icon is one simple, bold object that is easy to recognise when very small.\n\n"
    "Row 1: (1) a stack of three collectible cards. (2) a lightbulb with a tiny sprout inside. (3) three round nodes "
    "joined by lines, like a small skill tree. (4) a rolled parchment scroll with a ribbon. (5) a small market stall "
    "front with a striped awning. (6) a gold star inside a laurel wreath.\n"
    "Row 2: (7) a gold trophy cup. (8) a thick closed book with a sprout on the cover. (9) a wall calendar page with a "
    "star on it. (10) a settings gear. (11) a loudspeaker. (12) a music note.\n"
    "Row 3: (13) a closed padlock. (14) a green check mark. (15) a red X. (16) a magnifying glass. (17) a green arrow "
    "pointing up. (18) an hourglass.\n"
    "Row 4: (19) a green two-leaf sprout. (20) a yellow lightning bolt. (21) a gold four-point star burst. (22) three "
    "stacked chevrons pointing up. (23) a crescent moon with two tiny stars. (24) a two-leaf sprout made of shiny gold.")

ROUNDS = [
    (1, "Rooms and the hemp field", "A", [1, 2, 3, 4], "Needed first"),
    (2, "Crops", "C", [5, 6, 7], "Needed first"),
    (3, "People", "B", [8, 9, 10], "Needed first"),
    (4, "Chest, cards and products", "C", [11, 12, 13, 14], "Needed next"),
    (5, "The rope and textile mill", "A", [15, 16], "Needed next"),
    (6, "Menu icons", "C", [17], "Needed next"),
]
SETS = {
    "A": ("Scenes", ["B4_floor04_garden_shed_nursery_v2.png", "B4_floor_frame_shell.png"]),
    "B": ("People", ["B22_character_animation_sheet.png", "B21_manager_lineup_2.png"]),
    "C": ("Plants and items", ["B24_plant_growth_stages.png", "B23_exotic_plants.png"]),
}

L = []
w = L.append
w("# Production Asset Batch 1")
w("")
w("Part of the [Style Bible](STYLE_BIBLE.md). Style suffix version: **v1**. Hemp guards version: **v1**.")
w("")
w(f"**{len(P)} images.** Ordered by what the World 1 vertical slice needs first: rooms for the first five floors, the "
  "hemp crop and its floor, workers who can move, managers, a chest opening, cards, then the first hemp product floor "
  "and the menu icons. If you only have time for ten, do prompts 1 to 10.")
w("")
w("Everything here avoids final names. Where a name or list could still change, the prompt's **Name flag** says so.")
w("")
w("## How to do it on your phone")
w("")
w("1. The work is split into **6 rounds**. Each round is **one new ChatGPT chat**.")
w("2. At the start of a round, **attach that round's reference images** from your own packs (two images, or three in "
  "round 3, listed below) and paste the round's first prompt in the same message.")
w("3. Then paste the round's other prompts **one at a time, in the same chat**. You do not need to attach the images "
  "again.")
w("4. Each prompt is one grey box. Copy the whole box, change nothing.")
w("5. Save each result as it comes: **PNG, original size**. No screenshots, no JPG, no cropping or resizing.")
w("6. Upload the results to the project. You do not need to rename them. Upload in number order, or tell me which "
  "number each one is.")
w("7. If a result looks wrong, use the matching sentence from \"If a result is off\" near the bottom. If it is still "
  "off after two tries, upload it anyway and tell me. A lot can be fixed in clean-up.")
w("")
w("### The three reference sets")
w("")
w("| Set | For | Attach these two images |")
w("|---|---|---|")
for k, (name, files) in SETS.items():
    w(f"| **{k}** | {name} | " + " and ".join(f"`{f}`" for f in files) + " |")
w("")
w("All six are from your expansion pack. The B1 key art is the mood anchor for the project, but it is not attached "
  "here, because its soft painted look would pull the results away from clean pixels.")
w("")
w("### The rounds")
w("")
w("| Round | Theme | Attach | Prompts | Priority |")
w("|---|---|---|---|---|")
for r, theme, s, ns, pri in ROUNDS:
    att = f"Set {s}" + (" plus floor 01 v2" if r == 3 else "")
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
    if r == 3:
        hdr += " **For this round also attach** `B4_floor01_windowsill_planter_v2.png` (three images in total)."
    w(hdr)
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
    ("The character changes between poses",
     "Redo the sheet. Every pose must show the exact same character as pose 1: same face, hair, outfit, colours and body size."),
    ("Wrong number of items",
     "Redo with exactly the number of items, rows and columns listed in the prompt."),
    ("Light comes from the right",
     "Same image with the light coming from the upper left."),
    ("Too busy or too detailed",
     "Same image, simpler: fewer details, bigger shapes, only 3 to 4 flat tones per material."),
    ("Hemp looks bushy or has big fan-shaped leaves",
     "Redo the plants as tall slim canes like bamboo: bare lower half, only small drooping narrow leaves near the top, no big fan-shaped leaves, no buds."),
    ("A person looks like someone real or a known cartoon",
     "Redo with a clearly different, original face and hairstyle."),
]
for a, b in FIX:
    w(f"| {a} | `{b}` |")
w("")
w("## Already covered by your two packs")
w("")
w("No new images are needed for these. They go straight to clean-up.")
w("")
w("| Need | Covered by |")
w("|---|---|")
COV = [
    ("Floor shell, locked shutter, construction scene", "`B4_floor_frame_shell`, `B4_floor_locked_shutter`, `B4_floor_under_construction`"),
    ("Props and workers for floors 1 to 10", "The ten `B4_floor..._v2` images"),
    ("Tower roof and entrance", "`B20_tower_parts`"),
    ("Herb managers", "`B5_manager_lineup`, `B21_manager_lineup_2`"),
    ("One animated worker", "`B22_character_animation_sheet`"),
    ("Customers", "`B28_customers_npc_sheet`"),
    ("Herb card pictures, everyday and magical", "`B9_plant_card_art`, `B23_exotic_plants`"),
    ("Mint growth stages", "`B24_plant_growth_stages`"),
    ("Card frames and card layout", "`B8_card_frames_6_rarities`, `B25_card_layout_mockup`"),
    ("Chests, closed and full, six rarities", "`B10_chests_by_rarity`"),
    ("Artifacts", "`B11_artifacts_icons` (compass emblem to be redrawn)"),
    ("Currencies", "`B12_currency_icons` (plus token to be redrawn)"),
    ("Herb seed packets", "`B9b_seed_packets`"),
    ("World 1 background layers", "`B26_world1_parallax_layers`"),
    ("Tap and reward effects", "`B29_tap_feedback_vfx`, `B19_vfx_reference`"),
]
for a, b in COV:
    w(f"| {a} | {b} |")
w("")
w("## What happens after you upload")
w("")
w("1. Each image is checked against Gate A of the style bible. If one needs a redo, you get its number and the exact "
  "sentence to send.")
w("2. Accepted images go through the clean-up route and become game-size sprites.")
w("3. Every hemp image is checked with the five-question hemp review.")
w("4. Batch 2 is planned from what the vertical slice still lacks after this one.")
w("")
open(OUT, "w").write("\n".join(L))
print("prompts", len(P), "chars", sum(len(p['prompt']) for p in P))
for p in P:
    print(p['n'], len(p['prompt']), p['fname'])
