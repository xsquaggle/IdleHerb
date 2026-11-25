# Sprout Tower Style Bible v1

Status: v1.1, Phase 0. Owner: Art Director. Applies to every sprite, background, UI piece, icon, effect and marketing image in the game.

This is the single source of truth for how Sprout Tower looks. If an asset and this document disagree, the asset is wrong, or this document gets a new version. Nobody "interprets around" it.

Companion pages:

- [HEMP_ART.md](HEMP_ART.md): the exact look of hemp, the planned hemp art, and the never list.
- [CLEANUP_ROUTE.md](CLEANUP_ROUTE.md): how a generated image becomes a production sprite, with real before/after results.
- [ASSET_BATCH_01.md](ASSET_BATCH_01.md): the first numbered prompt batch.
- [palette/](palette/): the locked master palette in four file formats.

---

## 1. The direction in one minute

**HD pixel art, warm golden hour, cozy purples and greens, chunky cheerful characters.** A tall, friendly tower of little rooms where people grow herbs and industrial hemp and turn them into nice things. It should feel like a warm window at dusk: you want to step inside.

The style is settled. The B1 key art is the mood anchor. The expansion pack (B20 to B29 and the "v2" floors) is the rendering anchor.

### Five pillars

| # | Pillar | What it means in practice |
|---|---|---|
| 1 | **Golden hour, always warm** | One sun, low and golden, from the upper left. Shadows lean purple, highlights lean yellow. Even night and the Moon keep a warm lamp in frame. |
| 2 | **Chunky and readable** | Big heads, big hands, squat rounded props. Everything passes the silhouette test at 100% size. |
| 3 | **One grid, one palette, no exceptions** | Every sprite is drawn on the same 640×360 art-pixel grid and uses only the 76 master colours. No mixed pixel sizes, no stray colours, no soft edges. |
| 4 | **Alive** | Nothing is a still picture. Rooms are built from separate parts so plants sway, workers move, lamps flicker and coins bounce. |
| 5 | **A farm, not a pharmacy** | Hemp is a tall field crop that becomes rope, cloth, paper and building blocks. Herbs are kitchen and garden herbs. Nothing on screen could be mistaken for drug imagery. |

### Why these choices

- **Rendering follows the expansion pack** (flat cel shading, 3 to 4 tones per material, bold dark outline, transparent backgrounds, a different cast on every floor). It is cleaner, it animates, and it is what a small team can keep consistent across hundreds of assets.
- **Mood, light and colour follow the first pack** (B1 key art and the B2 lighting board). That is where the golden hour and the purple and green warmth live.
- Where the two packs overlap, **the expansion pack wins**. The first-pack floors, managers and workers are mood reference only.

---

## 2. What the reference packs taught us

Both packs were measured, not just looked at. The numbers below drive the rest of this document.

| Finding | First pack (B1 to B19, 29 images) | Expansion pack (B20 to B29 and v2 floors, 23 images) |
|---|---|---|
| Real pixel grid | **None.** No block size explains the image better than any other (best fit only 1 to 3% better). The "pixels" are painted stair-steps 2 to 4 image pixels wide. | **Yes.** Every image is an exact 2× enlargement, and the visible art pixel is about **6 image pixels**. |
| Colours per image | 217,000 to 1,050,000 | 104 to 192 |
| Edges | Soft, blended, anti-aliased | Hard |
| Transparency | B8 "transparent" file is dirty: only 0.02% of pixels are fully opaque, 13.5% are a faint haze | Clean on-or-off transparency |
| Floors | Full painted scenes with a baked frame, baked sky and the same three gardeners on every floor | Props and two unique workers on a transparent background, 2160×720, which is exactly **360×120 art pixels at 6×** |
| Sky | Inconsistent (floor 02 sunset, floors 03 and 05 blue midday) | Not baked in |
| Use in production | Mood, light, palette, card frames, chests, artifacts, currencies, world backgrounds after clean-up | Direct base for production sprites after clean-up |

Things found in the references that production must fix:

- **B11 compass lid** carries a many-fingered fan-leaf emblem. Replace with the two-leaf sprout. See the never list in HEMP_ART.md.
- **B12** has a purple "plus" token that can read as a medical cross. Redesign as a gem or a seed.
- **B29** bakes "+$" into the art and includes a flame row. Text and currency signs are drawn by the game. Flames are for stoves and ember herbs only.
- **B5 beach-shirt manager** and **B21 sleepy night-shift manager** are fine characters, but default art and story hires never place them on hemp floors.
- **B28 customer and the floor 09 perfumer** sniff herbs. Fine on herb floors, never on hemp floors.
- **v2 floor 03** becomes the Backyard Hemp Patch. Its two gardeners stay. Its side shelf (jars, hanging dried bunches) and potting table (mortar and pestle) are replaced with hemp-patch props, because those items are on the hemp never list.
- **v2 floor 09** becomes the Soap and Scent Workshop. Its copper still with a flame and its lab flasks are replaced with a soap kettle, moulds and drying racks, so nothing reads as a laboratory.
- **v2 floor 08** (spice kitchen) moves to World 2. World 1 floor 8 is the new Ropewalk and Twine Shop.
- **B27** is named `world4_moon_greenhouse`. In the game design document the Moon is world 5.

---

## 3. Canvas and pixel scale

One rule: **every art pixel in the game is the same size on screen.** The game renders a 640×360 art-pixel canvas and scales it by a whole number (3× at 1080p, 4× at 1440p, 6× at 4K). Ultrawide screens show a wider view, never a stretched one.

- No sprite is ever scaled by a non-whole number, rotated more than a few degrees, or shown at a "zoomed" size next to normal sprites.
- No full-screen illustrations at another pixel scale. The title screen, chest opening and world map are composed from in-game sprites. B1 stays as marketing art.

### Size table (art pixels)

| Asset class | Size | Notes |
|---|---|---|
| Screen | 640×360 | Three floors fill the height |
| Floor module | 360×120 | Includes the shell. Shell, locked shutter, construction scene, contents and back wall all overlay 1:1 |
| Floor shell | beams 8 tall (top and bottom), posts about 12 wide | Interior about 336×104 |
| Floor content zone | x 20 to 340, floor line at y 112 | Feet and pot bases sit on y 112 |
| Room back wall | 336×104 | Opaque, quiet, sits behind everything |
| Adult actor | 64 tall on an 80×80 canvas | Feet baseline y 76. Children 44 to 52 tall |
| Manager portrait | 48×48 bust | Cut from the actor's head and shoulders, redrawn |
| Potted herb | up to 48×60 | Pot about 32 wide |
| Fibre hemp | 32×96 per clump | Taller than a person on purpose |
| Seed hemp | about 48×66 to 72 | |
| Giant show-hemp | cane 6 thick, spans floors | Base, tileable middle, top |
| Small prop | 16 to 32 | Tools, pots, jars, baskets |
| Furniture | 48 to 96 wide | Benches, shelves, stalls |
| Chest | 96×80 hero, 32×32 icon | Closed, ajar, open |
| Large card | 180×240 | Art window about 108×100 |
| Small grid card | 64×88 | 48×48 picture |
| Icons | 16, 24, 32, 48 | Drawn separately at each size, never scaled |
| Artifact icon | 48×48 | |
| UI panel 9-slice | corner 8 | |
| Buttons | 16, 20 or 24 tall | Smallest click target 16×16 |
| Parallax strip | 320 to 360 tall, 640 or wider | Tiles left to right |
| Particles | 3×3 to 9×9 | On the grid |

### What the engine needs from art

- Transparent PNGs, drawn at 1×, sampled nearest-neighbour. Transparency is fully on or fully off.
- Actors arrive as parts: body pose frames, one head, face pieces, held tools (section 10).
- Plants arrive as foliage and pot separately, with the pivot at the soil line, so the game can sway the foliage.
- Every sprite has a pivot (feet for actors, base centre for props). Pivots live in JSON next to the sprite.
- Cleaned sprites go in the repo under `art/` by class: `floors/`, `actors/`, `plants/`, `props/`, `cards/`, `icons/`, `ui/`, `vfx/`, `bg/`. File names are lowercase snake case: `class_subject_variant_state_frame.png`, for example `plant_mint_stage3.png`, `actor_gardener01_walk_2.png`.
- Raw generated images stay in project files, never in git. Atlases are built by script and never committed.

---

## 4. Shape language

- **Characters are 2.3 to 2.6 heads tall.** Head about 26 of the 64 pixels. Round bodies, short legs, big mitten hands, small feet.
- **Props are squat and rounded.** Corners are cut by 1 to 2 pixels. No straight edge runs longer than 24 pixels without a break such as a chip, knot, rivet or leaf.
- **Big, medium, small.** Each sprite has one big mass, two or three medium shapes and a few small accents. Even detail everywhere reads as noise.
- **Silhouette test.** Fill the sprite with one dark colour at 100% size. If you cannot name it, simplify it.
- **View.** Rooms and actors are seen straight from the side, like a dollhouse. Pots, baskets, chests and icons are seen from slightly above so the rim shows.
- **Smallest readable feature is 2 pixels.** Single pixels are for sparkles and eye glints only.
- **Curves step in even runs** (for example 3, 2, 1, 1, 2, 3). A lone single-pixel step in a long run is a jaggy and gets fixed.

---

## 5. Line

- **Outline:** 1 pixel, colour `ink-1` `#1A1024`, around every in-world sprite (actors, props, plants, shell).
- **Inner lines** use the darkest step of that material's own ramp (for example `wood-1` for board seams). Ink is used inside a sprite only where two different objects overlap.
- **Lit edges (optional, large sprites only):** on the upper-left edge the outline may lighten to `ink-2` or the ramp's darkest step.
- **Depth:** far background layers have no outline. Middle layers use `stone-1`. The play layer uses `ink-1`.
- **UI:** 1 pixel ink outline plus a 1 pixel inner bevel.
- **No anti-aliasing against transparency.** Inside a sprite, a single in-between pixel from the same ramp may smooth a large curve. Use it rarely.
- **Shadows are not drawn into sprites.** The game draws the contact shadow.

---

## 6. Rendering

- **Flat cel shading.** 3 tones for sprites under 32 pixels, 4 to 5 for large ones.
- **Ramps are hue-shifted.** Each ramp gets cooler and more purple as it darkens and warmer and yellower as it lightens. This is where the golden-hour feeling comes from.
- **No gradients, no dithering, no noise.** The sky is the one exception and it uses flat bands (section 14).
- **Colour budgets:** up to 16 colours for a prop or plant, 24 for an actor, 32 for a whole floor or card.
- **No pillow shading.** Shade follows the light direction, never the outline.
- **Highlights:** one specular tick of 1 to 3 pixels on glossy things only (glass, glazed pots, metal, eyes).
- **Texture:** at most 2 to 4 texture marks per 16×16 area (grain dashes, stone specks), in the neighbouring ramp step.

---

## 7. Lighting

- **Key light:** golden, from the upper left at about 10 o'clock, in every world. The direction never changes, so any sprite works in any room.
- **Fill:** purple, from the lower right.
- **Lamps:** the lamp sprite is hard-edged. The game adds a warm pool of light around it.
- **Waiting rooms dim.** A floor waiting for a tap is about 25% darker and cooler. It warms up the moment it runs.
- **Soft light is allowed in exactly three places**, all made by the game and never drawn into sprites: lamp pools, window light shafts, and the bloom behind a rare drop.

### Mood per world

World names are from the game design document.

| World | Time and mood | Dominant ramps | Accent | Art so far |
|---|---|---|---|---|
| 1 Thymeford, home town | Golden hour, always | wood, clay, gold, leaf, lavender | rose clouds | B3, B26, floors, cast |
| 2 Loomington, hemp-industry city | Blue night, lit windows | sky, stone, lavender | gold windows, a little teal | B17 background only |
| 3 Papaya Cay, island | Bright late afternoon | teal, sky, leaf, cream sand | rose and red flowers | B18 background only |
| 4 Mount Mitten, winter | Snowy dusk, cabin lamps | sky, steel, lavender, with `white` and `sky-5` snow | gold lamps, red scarves | none |
| 5 The Moon | Earthlight outside, warm lamps inside | stone, steel, sky | teal glass, gold lamps | B27 background only |
| 6 Nebula Nursery | Deep space, glowing nebula bands | ink, lavender, rose, teal | gold lamps, white stars | none |

Every world uses the same 76 colours. A world chooses which five or six ramps cover most of the screen. If a world truly needs a new colour, the palette gets a new version, with at most 8 added colours per world.

---

## 8. Palette

**Sprout Tower Master v1: 76 colours in 18 ramps.** Files: [`sprout_master_palette_v1.png`](palette/sprout_master_palette_v1.png) (labelled sheet), `.hex`, `.gpl` (GIMP, Aseprite), `.json` (tools).

![Master palette](palette/sprout_master_palette_v1.png)

Steps are numbered from dark to light, so `leaf-1` is the darkest leaf green.

| Ramp | Colours, dark to light | Used for |
|---|---|---|
| ink | `#1A1024` `#2C1D3A` | Outlines, deepest shadow |
| wood | `#3B1D29` `#5E2C2A` `#8C4426` `#BC642B` `#E48F3C` `#F7BC66` | Beams, shelves, crates, frames |
| clay | `#5C2230` `#933A30` `#C4532E` `#E97B3D` `#F9AA6E` | Terracotta, brick, warm roof tile |
| gold | `#7A4A12` `#B9781A` `#EBA92B` `#FFD447` `#FFF19C` | Coins, trim, lamp light, UI accents, ripe hemp stalk |
| cream | `#B48A66` `#DDB98C` `#F6DDB0` `#FFF5DA` | Paper, plaster, parchment UI, cloth, fibre |
| skin | `#4B2A24` `#73412C` `#A2603A` `#CE8752` `#EDAE7E` `#FBD0A8` | All skin tones, deep to light |
| blush | `#E8706C` | Cheeks, noses, warm lips |
| leaf | `#12332B` `#1D5A38` `#35853A` `#6BB536` `#B2D838` `#E9EE62` | Herb foliage, the hero green |
| sage | `#17403F` `#2A6A5B` `#4F9474` `#86BD92` `#C2E2B6` | Hemp, rosemary, sage, cool foliage |
| lavender | `#27194A` `#432E79` `#6746AE` `#8F68DA` `#BB99F0` `#E3D2FC` | Brand purple, roofs, flowers, UI |
| stone | `#2B243F` `#473D62` `#6B5F87` `#978BAC` `#C8BFD5` | Cobbles, walls, cool shadow masses |
| sky | `#191F68` `#2944B4` `#487AE8` `#7DB3F4` `#BEE0FA` | Dusk sky, windows, night |
| teal | `#0D4F5C` `#178688` `#3BBFB1` `#98E8D6` | Glass, water |
| rose | `#822660` `#CC4690` `#F083BC` `#FFC2DC` | Sunset clouds, blossoms |
| red | `#741C2E` `#BE2D35` `#EC5440` | Awning stripes, alerts, hibiscus |
| steel | `#353E54` `#69768E` `#A6B3C4` `#E1E8EF` | Tin, tools, hinges, cool metal |
| ash | `#4B4551` `#7B7481` `#AEA8B2` `#DFDBE1` | Grey hair, pewter, disabled UI |
| white | `#FFFBEF` | Sparkles, speculars, text on dark |

Rules:

- Sprites use these colours and nothing else. The clean-up tool enforces it.
- Shade within a ramp. To go darker than a ramp allows, step to `ink-2`, never to pure black.
- Foliage is `leaf` for herbs and `sage` for hemp. That split is deliberate: hemp reads as a cooler, greyer field crop next to the juicy herb greens.

### Rarity colours

Rarity is always shown **twice**: by colour and by a second cue that works for colour-blind players.

| Rarity | Colour | Second cue | Pips on small cards |
|---|---|---|---|
| Common | wood and iron | Plain frame with rivets | 1 |
| Uncommon | leaf green | Leaf pair at the top | 2 |
| Rare | sapphire blue (`sky`) | Diamond gem | 3 |
| Epic | amethyst (`lavender`) | Tall crystal | 4 |
| Legendary | gold | Sun and laurel medallion | 5 |
| Exotic | prismatic (teal, rose, lavender) | Winged prism, moving shimmer | 6 |

---

## 9. Materials

Each material has one recipe. Steps are ramp steps, dark to light.

| Material | Recipe |
|---|---|
| Wood | `wood-3` body, `wood-2` shade, `wood-5` lit top edge, `wood-1` seams. Grain is 2 or 3 short dashes per plank. Never draw every board line |
| Cream stone and plaster | `cream-3` body, `cream-2` shade, `cream-4` light, corner chips in `cream-1` |
| Terracotta pots | `clay-3` body, `clay-2` shade, `clay-4` light, rim one step lighter, one `clay-5` tick |
| Tower roof | `clay` tiles in rows of rounded scallops |
| Town roofs (background) | `lavender-2` to `lavender-4`, so the tower's warm roof stands out |
| Glass | `teal-3` body, `teal-4` diagonal streak, `teal-1` frame shade, one white tick |
| Brass | `gold-2` body, `gold-1` shade, `gold-4` light, one `gold-5` tick |
| Tin and steel | `steel-2` body, `steel-1` shade, `steel-3` light, one `steel-4` tick |
| Iron (dark) | `stone-1` body, `ink-2` shade, `stone-3` edge light |
| Striped awnings | 6 to 8 pixel stripes, `cream-3` with `red-2`, `lavender-3` or `leaf-3`, scalloped edge |
| Herb foliage | `leaf-3` body, `leaf-2` shade, `leaf-4` light, `leaf-5` on the newest leaves, `leaf-1` deep gaps |
| Water | `teal-3` with `teal-4` ripples and white drops |
| Parchment | `cream-3` body, `cream-4` centre, `cream-2` edge, `cream-1` curl |
| Coin | `gold-3` face, `gold-4` rim light, `gold-1` edge, sprout mark in `leaf-3` |
| **Hemp stalk** | `sage-3` body, `sage-4` lit side, ring joints in `sage-2`. Ripening turns it `gold-3` and `gold-2` from the base upward |
| **Hemp leaf** | `sage-3` body, `sage-2` shade, `leaf-5` tips |
| **Hemp fibre** | `cream-3` body, `cream-2` strands, `gold-5` light. Looks like blond straw or a horse's tail |
| **Rope** | `cream-2` body, `cream-1` twist marks every 3 pixels on a slant, `cream-3` light |
| **Canvas and cloth** | `cream-3` body, `cream-2` folds, a visible weave tick here and there |
| **Hemp paper** | `cream-4` sheets, `cream-2` edges, deckled (slightly uneven) edge |
| **Hempcrete** | `cream-2` block, `cream-1` shade, speckles in `ash-2` and `gold-2`, slightly rough edge |
| **Hemp seed** | `cream-1` and `ash-2`, round, 2 to 3 pixels, a darker dot |
| **Seed oil** | `gold-4` in a `teal` glass bottle with a cork. A kitchen bottle, never a dropper |
| **Soap** | `cream-3` or `sage-5` bar with a pressed sprout mark |

---

## 10. Characters

- **Size:** 64 tall on an 80×80 canvas, feet on y 76. Children 44 to 52.
- **Build:** chunky, 2.3 to 2.6 heads tall. Bodies vary a lot: tall, short, round, lanky. Ages, skin tones, hair and abilities vary too. The expansion pack's cast is the benchmark, including the gardener who uses a wheelchair.
- **Read by silhouette:** each character has one signature hat, hairstyle or tool that nobody else has.
- **Clothes tell the job.** The apron or main garment carries the floor's accent colour.
- **Faces:** happy closed-eye smiles are the default, as in the references. Open eyes are 2×3 pixels with a 1 pixel glint. Cheeks get a `blush` patch.
- **Moods we use:** happy, proud, focused, surprised, comically grumpy, sleepy. Sleepy never appears on hemp floors.
- **A different pair of workers on every floor.** No worker is copied between floors. Managers are separate characters (see below).
- **Original characters only.** No real people, no celebrity likenesses, no existing cartoon characters.

### Managers

Managers are collectible cards that the player can assign to any floor in any world. So:

- **A manager never depends on a floor.** The pose is floor-neutral: standing or sitting, facing the viewer or slightly right, holding only their own signature item. No floor tools, no floor furniture drawn into the sprite.
- **Frames:** stand, blink, cheer, and one "boost" gesture (ring the bell, point, clap). No walk cycle. Same 64 pixel height and 80×80 canvas as workers.
- **Card and portrait** are cut from the same design: full body for the large card, a 48×48 bust for lists.
- **Every floor has a manager spot** (section 13). An unassigned spot shows the empty stool.
- The beach-shirt and sleepy night-shift managers are valid cards. Default art and story hires never place them on hemp floors.

### How characters are built so they can move

Tested in the clean-up proof: bodies survive automated clean-up, faces do not (CLEANUP_ROUTE.md). So:

1. **Body pose frames**, swapped by the game: stand, blink, cheer, walk (3 drawn frames make a 4-step cycle), work (2 frames), carry. Nine frames per character, as on the B22 sheet.
2. **One head sprite per character**, attached at a neck pivot. The head never changes between frames, which stops face flicker.
3. **A shared Face Kit**: eyes, brows and mouths as tiny hand-built sprites, placed on the head for blinks and expressions.
4. **Held tools as separate sprites** (watering can, rake, rope coil).

The game adds the rest: breathing squash, head bob, a lean into the walk, a hop on cheer.

---

## 11. Plants

- **Pot view:** from slightly above, rim visible. Foliage straight on.
- **Each herb has its own silhouette:** mint is a round bush of broad toothed leaves. Basil is a glossy dome of big cupped ovals. Rosemary is upright needle spikes. Lavender is thin stems with purple flower heads. Chamomile is daisies on feathery green. Sage is long soft grey-green ovals. Chives are tubes with pink pom-poms.
- **Five growth stages** for every crop: seed mound, sprout, young, mature, harvest-ready. Each stage changes size and shape clearly (B24 mint is the model). The harvest sparkle is added by the game.
- **Magical variants** keep the base herb's silhouette and add one element: frost, ember, moon, crystal, star or storm. The element shows in the leaves, the pot motif and the particles (B23 is the model).
- **Pots are a shared kit:** small, medium and large terracotta, glazed cream, and one magic pot per element. Foliage and pot are separate sprites.
- **Hemp** is never potted like a herb. See section 12.

---

## 12. Hemp

Full definition, chart, product list and never list: [HEMP_ART.md](HEMP_ART.md). The short form:

> **A tall field crop that becomes rope, cloth, paper and building blocks. Drawn like bamboo or tall corn: a cane first, leaves second.**

![Hemp silhouette chart](hemp/hemp_silhouette_chart.png)

- Stalk-dominant, taller than a person, bare in the lower half, small drooping leaf groups seen from the side.
- Whole plants in farm context only. Never a lone leaf, never a close-up of the plant top.
- Coloured with `sage` and `gold`, never neon green, never purple-black.
- The fun of hemp is in the **products**: rope, canvas, paper, hempcrete, seed snacks, oil, soap.

---

## 13. Tower and floors

A floor is a 360×120 module built from layers, back to front:

1. **Back wall** (336×104, opaque, quiet)
2. **Light shafts** (game-made)
3. **Back props** (shelves, windows, wall racks)
4. **Plants** (foliage sways)
5. **Actors**
6. **Front props** (benches, baskets, carts)
7. **Shell** (beams, posts, ivy)
8. **Floor UI plate** (name, level, buttons)

Rules:

- **The tap target is the star.** The crop or machine the player taps is the biggest, brightest thing in the room and sits near the centre (about x 130 to 230).
- **Back walls are quiet.** Lower contrast, slightly darker and cooler than the props, few details. The room should read from the props and people, not the wallpaper.
- **Outdoor floors are open to the sky.** Balcony, backyard and field floors have a low back layer (wall, fence, hedge) and the world's sky shows above it.
- **Two workers per floor** as in the v2 floors, flanking the tap target.
- **One manager spot per floor,** always at the right end (about x 292 to 336). It holds a low stool, crate or small desk, no taller than 24 pixels, themed to the floor, and nothing tall in front of it. The assigned manager stands or sits there. In the v2 floors the right-hand furniture is moved or trimmed to make this room.
- **States:** locked (B4 shutter with the sprout sign), under construction (B4 scaffold scene), built and waiting (dimmed), built and running.
- **Tower extras** from B20: roof, entrance, side walls. Tower roof is warm terracotta so it stands out from the purple town roofs.

### World 1 floors and where their art comes from

Names are from the game design document, still in review.

| Floor | Name | Contents | Back wall |
|---|---|---|---|
| 1 | Windowsill Planter | v2 floor 01 | Batch 1, prompt 1 |
| 2 | Balcony Boxes | v2 floor 02 | Batch 1, prompt 1 |
| 3 | Backyard Hemp Patch | v2 floor 03 gardeners, hemp props from Batch 1 prompt 4, crop from prompt 5 | Batch 1, prompt 2 |
| 4 | Potting Shed Nursery | v2 floor 04 | Batch 1, prompt 2 |
| 5 | Glass Greenhouse | v2 floor 05 | Batch 1, prompt 3 |
| 6 | Farmers' market (name to confirm) | v2 floor 06 | Batch 1, prompt 16 |
| 7 | Tea house (name to confirm) | v2 floor 07 | Batch 1, prompt 16 |
| 8 | Ropewalk and Twine Shop | Batch 1, prompt 15 | Batch 1, prompt 3 |
| 9 | Soap and Scent Workshop | v2 floor 09 with the still and flasks replaced | Batch 2 |
| 10 | Sprout Tower HQ | v2 floor 10 | Batch 2 |

---

## 14. Backgrounds and parallax

From B26, cleaned to the grid. Layers, back to front, with suggested scroll speed relative to the tower:

| Layer | Content | Outline | Scroll |
|---|---|---|---|
| Sky | Flat colour bands drawn by the game, plus separate cloud sprites | none | 0 to 0.05 |
| Far | Hills, lake | none | 0.15 |
| Town | House rows, purple roofs, lit windows | `stone-1` | 0.5 |
| Street | Cobbles, lamp posts, fences | `ink-1` | 1.0 |
| Foreground | A few dark leaves and posts at the screen edge | `ink-1` | 1.15 |

**World 1 sky bands**, horizon upward: `gold-4`, `clay-5`, `rose-3`, `lavender-4`, `lavender-3`, `lavender-2`, `sky-1`, `lavender-1`, `ink-2`, then stars. Bands get taller as they go up (about 10, 14, 18, 24, 32, 48, 64 pixels, then as needed). Flat bands, no dithering. This lets the tower climb from the street to the stars without a seam.

---

## 15. Cards, chests, artifacts, currencies

- **Large card (180×240):** layout from B25 at one sixth size. Name banner on top, art window (about 108×100), level badge, progress bar, two stat rows. Frame shape and ornament from B8, one per rarity.
- **Small card (64×88):** 48×48 picture, rarity frame colour, pips 1 to 6, level number drawn by the game.
- **Card art:** the plant or person sits on a simple two-band backdrop in the rarity colour. No scenery.
- **Chests (B10):** six rarities, closed and open. Material tells the rarity: wood and iron, green enamel, blue with sapphires, purple with amethyst, gold with laurel, prismatic crystal. Opening is done by the game: shake, squash, lid swap, burst, cards fly out.
- **Artifacts (B11):** 48×48 icons, one clear object each, with the B11 compass emblem fixed.
- **Currencies (B12, B29):** coin with the sprout mark is the main one. Which currencies exist is the Game Designer's list. The purple plus token gets redesigned.

---

## 16. UI kit

The UI is **built by hand on the grid** from the palette, not generated. B13 and B14 are layout and mood references only.

| Element | Look |
|---|---|
| HUD chips (money, premium currency) | Dark green enamel (`sage-1`, `leaf-1`) with brass trim (`gold-2`, `gold-4`), icon on the left, number in `white` |
| Panels and windows | Wood frame (`wood` ramp) with 8 pixel corners, parchment inside |
| Text areas | Parchment (`cream-3`, `cream-4`) with `ink-1` text |
| Primary button | Leaf green (`leaf-3` body, `leaf-4` top, `leaf-2` bottom), `white` label |
| Secondary button | Wood |
| Premium or prestige button | Gold |
| Danger (hard reset) | `red-2`, used nowhere else |
| Progress bar | Track `ink-2`, fill `leaf-4` with a `leaf-5` top line |
| Notification pip | `red-3` dot, 6 pixels, `white` number |
| Tooltip | Small parchment panel, 1 pixel `ink-1` outline |

**Button states:** normal, hover (one step lighter and 1 pixel up), pressed (one step darker and 1 pixel down, bevel flipped), disabled (`ash` ramp, no bevel), keyboard focus (2 pixel `gold-4` ring).

**Sizes:** smallest click target 16×16 art pixels (48 real pixels at 1080p). Button heights 16, 20 or 24. Panels are 9-slice with 8 pixel corners.

**Colour meaning:** green means "go, you can afford it". Gold means special. Red means warning only. Grey means not yet.

---

## 17. Iconography

- **The brand mark is the two-leaf sprout.** It is the only plant emblem in the game. It appears on coins, signs, the shutter, the app icon and the logo.
- Icons show **one object, from slightly above**, with a 1 pixel ink outline, 3 tones and one accent colour.
- **No letters, numbers or currency signs in art.** The game draws all text.
- Sizes 16 (inline in text), 24 (buttons), 32 (tabs, list rows), 48 (artifacts, features). Each size is drawn on its own.
- Fixed meanings: sprout = yield, lightning bolt = speed, star = critical, moon = offline earnings, hourglass = time, chevrons = combo, padlock = locked, star in laurel = prestige, golden sprout = lucky pickup.

---

## 18. Typography

All text is a bitmap pixel font drawn by the game. Fonts must be under the SIL Open Font License or made by us.

| Role | Use | Size |
|---|---|---|
| **Display** | Money, big numbers, titles, floor names | Capital height 9 to 11 pixels, chunky slab, tabular (equal width) digits |
| **Body** | Descriptions, buttons, lists | Capital height 7 pixels |
| **Small** | Labels, units, pips | Capital height 5 pixels, capitals and digits only |

- **Display is custom.** Numbers are the star of an idle game, so we draw our own digits and capitals to match the wooden sign lettering in B16. It is a small job (about 50 glyphs to start).
- **Body and Small come from open pixel fonts.** Candidates to test at 3×: Pixelify Sans, Silkscreen, Jersey 10, Tiny5, Micro 5. Each licence file is checked when the font is added to the repo.
- Text on the world gets a 1 pixel `ink-1` outline and a 1 pixel drop shadow. Text on parchment is plain `ink-1`.
- Art may contain **squiggles that look like writing** on packets and signs, never real words.

---

## 19. Effects and motion look

- **Particles are pixel sprites on the grid** (B29 and B19 after clean-up): coin pop, four-point sparkle, leaf burst, dust puff, water drops, level-up ring.
- **Rarity beams** are hard-edged vertical bars in the rarity colour.
- **Snappy, bouncy timing.** A tap gets a squash and pop within about 120 milliseconds. Coins arc to the counter in about half a second.
- **Flame** appears only on stoves and ember herbs. **Never near hemp.**
- **Steam** is white puffs from a visible kettle or vat only.
- A **reduce motion** setting turns off screen shake and flashes.

---

## 20. Do and don't

![Do](boards/board_do.png)

![Don't](boards/board_dont.png)

**Do**

- Draw on the grid, in the palette, with a 1 pixel ink outline.
- Keep golden light from the upper left in every asset.
- Make each plant and person recognisable as a flat silhouette.
- Deliver everything on a transparent background, in parts.
- Show rarity by colour and by shape.
- Draw hemp as a tall cane crop in a farm or workshop setting.

**Don't**

- Don't blend, blur, glow, dither or anti-alias.
- Don't mix pixel sizes in one image, or scale a sprite to fit.
- Don't bake text, numbers or currency signs into art.
- Don't bake sky, frames or characters into a floor.
- Don't reuse a worker on another floor. Managers are cards and can go anywhere.
- Don't use any leaf as an emblem except the two-leaf sprout.
- Don't show smoke, anything held to a face on hemp floors, or any item on the never list in HEMP_ART.md.
- Don't copy anything from Cash, Inc. or any other game: no names, characters, art or layouts.

---

## 21. The fixed prompt suffix

Every image prompt ends with this block, word for word. It is what makes two images from different days match.

```text
STYLE (Sprout Tower house style v1): cozy 2D pixel art that looks like low-resolution game sprites enlarged, with big, clearly visible square pixels on one even grid, the same pixel size everywhere in the image. Flat cel shading with only 3 to 4 tones per material. Bold dark plum-black outline around every object. Crisp hard edges only: no anti-aliasing, no blur, no soft gradients, no glow, no noise, no dithering. Chunky, rounded, friendly shapes with simple readable silhouettes. Warm golden-hour light from the upper left; shadows lean purple, highlights lean golden yellow. Limited cozy palette: wood browns, terracotta orange, golden yellow, cream, fresh herb greens, lavender purple, dusk blue. Match the pixel size, outline and shading of the attached reference images exactly. Family-friendly, original designs only. No text, letters, numbers, logos, watermark or signature.
```

Background line, one of:

```text
BACKGROUND: transparent (PNG with alpha). No ground shadow, no floor, no scenery, no frame.
```

```text
BACKGROUND: transparent (PNG with alpha) around and between the panels. Each panel itself is fully painted edge to edge.
```

Any prompt that shows a hemp **plant** also carries this guard, word for word:

```text
HEMP LOOK: industrial fibre hemp drawn as a tall farm crop, like bamboo or tall corn: a straight slim green cane with ringed joints, bare in its lower half, with small drooping groups of 3 to 5 narrow leaflets seen from the side in the upper half and a slim leafy tuft on top. Whole plants only, in farm context. No flower buds, no close-up of plant tops, no single fan-shaped leaf shown alone or used as an emblem, no smoke, no jars of dried leaves, nothing held to a face.
```

Any prompt that shows hemp **products or harvested stalks** but no living plant carries this one instead:

```text
HEMP PRODUCTS: everything here is made from industrial hemp fibre and seed, shown as plain farm and workshop goods. Harvested stalks are long, straight and pale, like thin bamboo canes or straw. Any mark on a product is a rope knot or a simple two-leaf sprout. No fan-shaped leaf anywhere as an emblem, pattern or decoration, no plant close-ups, no smoke, no jars of dried leaves, nothing held to a face.
```

### Prompt grammar

Every prompt is built in the same order:

1. **What it is** in one sentence.
2. **Layout:** grid, count, spacing, baseline.
3. **Content:** a numbered list, one line per item or pose.
4. **Hemp guard** (plant or products), if hemp appears.
5. **Style suffix.**
6. **Background line.**
7. **Shape of the image** (for example "Wide 3:1 image").

Reference images are attached to the chat, not described. Three fixed sets are used (see ASSET_BATCH_01.md).

When this suffix changes, it gets a new version number, and the batch file says which version it used.

---

## 22. Acceptance checklist

### Gate A: the raw image from ChatGPT

Reject and ask again if any of these is true. The exact sentence to send back is in ASSET_BATCH_01.md.

1. Soft, blurry or painted look instead of hard pixels.
2. Pixel size differs between parts of the image.
3. Background is baked in where transparent was asked.
4. Items touch, overlap or are cut off by the edge.
5. Text, numbers or logos appear.
6. A character is missing from a pose, or changes outfit, colours or proportions between poses.
7. Light comes from the wrong side.
8. Anything on the hemp never list appears.
9. A character resembles a real person or a known cartoon character.
10. Wrong count (five stages asked, four delivered).

### Gate B: the cleaned sprite

A sprite is production-ready when all of these are true. A reviewer can check each with a tool or at a glance.

1. Size matches the size table.
2. 100% of its colours are master palette colours.
3. Colour count is within budget (16, 24 or 32).
4. Transparency is fully on or off. No haze.
5. Outline is 1 pixel, continuous, `ink-1`.
6. No orphan pixels, no jaggies on main curves.
7. Light from the upper left.
8. Passes the silhouette test at 100%.
9. Pivot is set and the sprite sits correctly on the floor line.
10. Hemp assets pass the five-question hemp review in HEMP_ART.md.

---

## 23. What is missing

After both packs, this is still to be made. Batch 1 covers the items marked **B1**.

| Missing | Notes |
|---|---|
| All hemp art | Crop, growth stages, floors, products, cast, cards, packets. **B1** |
| Room back walls for every floor | The shell interiors are transparent. World 1 floors 1 to 8 in **B1** |
| Growth stages for every plant except mint | Basil, rosemary, lavender in **B1** |
| Animation sheets for every worker except the B22 gardener | Lead workers of floors 1, 2 and 3 in **B1** |
| In-world manager sprites in floor-neutral poses | 30 managers in the design document. B5 and B21 exist as lineups only. Batch 2, once the manager list is settled |
| Manager spot props | Stool and crate for floor 3 and counter stool for floor 8 in **B1**. The rest by hand |
| Floor 9 rework | Soap kettle, moulds and racks to replace the still and flasks |
| Chest opening in-between frames | Lid ajar, half open, open and empty. **B1** |
| Face Kit | Hand-built |
| UI kit | Hand-built |
| Icon set at 16, 24, 32 | Designs in **B1**, small sizes redrawn by hand |
| Fonts | Custom Display font, plus tested open fonts |
| Card back, frames in B25 layout for five rarities, small card | B25 shows Epic only |
| Shared pot kit, lamp sprite, tower side walls and floor plates | |
| Upper sky, stars, separate clouds | Sky bands are specified here |
| Worlds 2 (Loomington) and 3 (Papaya Cay) | Backgrounds only so far. No floors, cast or plants. The weaving mill, paper workshop, tailor and hempcrete floors belong to World 2 |
| World 4 (Mount Mitten) and World 6 (Nebula Nursery) | No art at all |
| World 5 (The Moon) | Background only |
| Final logo | Pick: the B16 top-left wooden arch sign with lanterns, redrawn on the grid, with a rope border so hemp is in the brand |
| Golden sprout pickup, combo and critical hit styles | |
| B11 compass emblem and B12 plus token | Redesign |
| Windows app icon | The two-leaf sprout in a pot, 16 to 256 pixels |

---

## 24. Interfaces and names that may change

- **Game Designer** owns the names and lists of floors, plants, managers, currencies and worlds, in `docs/design/`. This bible describes looks by type ("the windowsill room", "the ropewalk") and quotes design names where they are known. Agreed so far: World 1 floor names (section 13), six worlds (section 7), six hemp cards (HEMP_ART.md), managers as cards for any floor. Still open on the art side: the names of floors 6 and 7, the manager list, which currencies exist.
- **Engine** owns the tech. Agreed contract: 640×360 canvas, whole-number scaling, nearest-neighbour transparent PNGs, cutout actors from parts with pivots in JSON, bitmap fonts, soft light made by the engine only.
- **A fresh-eyes art review** checks later assets against section 22.

---

## 25. Change log

- **v1:** first version, built from both reference packs, with the measured grid, the 76-colour palette, the hemp definition and the clean-up proof.
- **v1.1:** aligned with the game design document. World 1 floor table, six worlds, six named hemp cards, managers as floor-neutral cards with a manager spot on every floor, fixes owed on v2 floors 03 and 09. The look, grid, palette and prompt suffix are unchanged.
