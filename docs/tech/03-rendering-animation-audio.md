# 03. Rendering, animation, UI and audio

Status: recommended, Phase 0; updated for the Phase 1 build on 2026-11-28 (phone and PC, portrait views, the reveal player and the moment effect of design 0.5). Owner: Engine Architect. The pixel grid and sprite sizes here are agreed with the Art Director; the style bible (`docs/art/STYLE_BIBLE.md`, section 3 for sizes) is the authority on anything visual and this document follows it.

## Pixel grid and resolution

**The game is drawn on a logical canvas scaled to the display by a whole number.** One art pixel is always a perfect square block of screen pixels. Nothing is ever stretched or blurred. The game plays on phones and PCs (Lawson, 2026-11-28: "It should be playable on phone and PC"), so the canvas has two minimums: 600x360 art pixels on a landscape screen (the 640x360 layout, with a little give so 1366x768 still gets 2x), and 360x420 on a portrait screen such as a phone held upright, where the 360-wide tower fills the width and the HUD sits above and below it.

```
minW, minH   = portrait ? (360, 420) : (600, 360)
scale        = max(1, floor(min(deviceWidth / minW, deviceHeight / minH)))
logicalWidth = floor(deviceWidth / scale)
logicalHeight= floor(deviceHeight / scale)
```

A view narrower than 600 art pixels uses the tall layout: HUD top and bottom, tower full width, panels full width. On phones the layout also keeps out of the safe-area insets (notches and home bars). The code is `packages/game/src/engine/resolution.ts`.

Any leftover strip (less than one art pixel) is split evenly and filled with the backdrop.

| Display | Scale | Logical view (art pixels) |
|---|---|---|
| 1280x720 (minimum window) | 2x | 640x360 |
| 1366x768 | 2x | 683x384 |
| 1600x900 | 2x | 800x450 |
| 1920x1080 | 3x | 640x360 |
| 1920x1200 | 3x | 640x400 |
| 2560x1080 ultrawide | 3x | 853x360 |
| 2560x1440 | 4x | 640x360 |
| 3440x1440 ultrawide | 4x | 860x360 |
| 5120x1440 super ultrawide | 4x | 1280x360 |
| 3840x2160 (4K) | 6x | 640x360 |

360 is the only base height that divides evenly into 1080, 1440 and 2160, which is why the three common monitors all show exactly the same 640x360 view.

**Ultrawide and odd sizes.** The view grows; it never stretches. Landscape layouts are built for 640x360, portrait ones for 360x420, and both anchor to edges and centre, so extra width shows more parallax background and gives side panels room, and extra height shows more tower. The HUD keeps to a centred safe area by default, with a setting to spread it to the screen edges.

**Windows display scaling.** At 125 or 150 percent scaling a web canvas is blurry unless it is sized in true device pixels. The resolution manager sizes the canvas from the browser's device-pixel content box, computes the scale from device pixels, and ignores CSS pixels entirely. The automated crispness test (see 08) runs at device pixel ratios 1, 1.25, 1.5 and 2.

**UI scale setting.** The UI layer has its own whole-number scale, one step below or above the world scale where the 640x360 layout still fits. At 1080p that offers Normal (3x) and Small (2x); at 4K it offers Small (5x) and Normal (6x). Both layers stay pixel-exact.

## Sizes the art is built to

From the Art Director's style bible. Repeated here because layouts and code constants depend on them.

| Asset | Size in art pixels |
|---|---|
| Floor module, including its frame shell | 360x120. Three floors fill the 360 height. Beams 8, interior about 336x104, floor line at y = 112 |
| Shell, shutter, construction and floor contents | Same 360x120 canvas, overlaid 1:1 |
| Actors | Adult 64 tall on an 80x80 canvas, feet at y = 76 |
| Plants in planters | About 48x60, delivered as foliage and planter separately with the pivot at the soil line. Fibre hemp crop about 32x96 |
| Cards | Large 180x240 with an art window about 108x100. Grid card 64x88 from a 48x48 icon |
| Icons | 16, 24, 32, 48, each drawn at its own size, never scaled from another |
| Parallax layers | Strips 320 to 360 tall. Sky is a procedural table of flat colour bands plus cloud sprites, so it never stretches |

At 640 wide, a 360 wide tower leaves 140 art pixels on each side for the HUD and docked panels.

## Layers, back to front

1. Sky: flat colour bands drawn from a per-world table, sun or moon, cloud sprites.
2. Parallax strips: far, mid, near. Tiled or extended sideways for ultrawide.
3. Tower: per floor, room back, props, plants, actors, frame shell, floor state overlays (dimmed while waiting for a tap, shutter, construction).
4. World effects: particles in world space.
5. Light: soft additive light pools and window shafts, and a multiply layer for evening and night moods.
6. Glow: emissive sprites drawn to a half-resolution buffer, blurred and added back. Used for rare-drop bloom.
7. Screen effects: flashes, the tier colour flood of a reveal, rings, vignette.
8. UI: HUD, panels, then UI effects (coins and leaves flying to counters), tooltips, cursor.

A per-world colour grade is applied to layers 1 to 5. Screen shake moves the world layers by whole device pixels and never moves the UI.

The Art Director allows soft, non-pixel rendering only for lamp pools, window light shafts and rare-drop bloom, all generated by the engine. Every sprite, particle and UI piece is hard-edged pixel art.

## Rules that keep pixel art crisp

| Situation | Rule |
|---|---|
| Texture sampling | Nearest neighbour. Atlases packed with 1 pixel edge extrusion and 2 pixels padding. No mipmaps on pixel sprites |
| At rest | Every position is a whole art pixel |
| Moving | Positions may land between art pixels but are rounded to whole device pixels, so motion is smooth and edges stay hard |
| Squash and stretch | Allowed briefly (about 200 ms) and must settle back to exactly 1. Lasting scale is whole numbers only |
| Rotation | Avoided on pixel sprites. Use 90 degree steps, or spin frames for coins and leaves. Small brief tilts are acceptable on impact effects |
| Plant sway | Row shear: each pixel row shifts sideways by a small amount. No rotation, stays crisp |
| Animation timing | Each clip declares a frame rate (6 to 12 fps typical) and playback steps at that rate, for a hand-animated look |
| Shaders | Work in art-pixel space. An effect such as a shockwave or dissolve is quantised to the art grid so it looks pixelled |

A stricter mode exists as a per-layer switch: draw the layer at 640x360 and upscale it, which forces even motion onto the art grid. It costs nothing to keep available; the Art Director and animation lead choose per layer.

Two things are verified automatically (see 08): the calibration scene is pixel-exact at every tested resolution, and every committed sprite passes an art lint (colours only from the locked palette, alpha either fully clear or fully solid unless flagged as a soft layer, size correct for its class).

## Character animation

No animation editor is available, and bending a pixel sprite with bones smears its pixels. So characters are **cutout rigs described in JSON**: a few hand-posed body frames, with the head, face and props attached at pivots and animated by keyframes and small procedural motions. This gives lively characters from a small number of clean sprites, which suits art that is generated one image at a time.

Per actor, from the style bible: 9 body pose frames, one separate head sprite attached at a neck pivot, a shared Face Kit (eyes, brows, mouth as tiny sprites, giving blinks and expressions), and held tools as separate sprites.

Illustrative rig file (field names settle when the runtime is written):

```json
{
  "id": "actor.gardener_a",
  "canvas": [80, 80],
  "baseline": 76,
  "body": {
    "idle_0": { "sprite": "actors/gardener_a/idle_0", "anchors": { "neck": [40, 28], "hand_r": [54, 46] } },
    "work_0": { "sprite": "actors/gardener_a/work_0", "anchors": { "neck": [42, 30], "hand_r": [58, 40] } }
  },
  "attach": {
    "head": { "sprite": "actors/gardener_a/head", "pivot": [16, 30], "to": "neck", "z": 1 },
    "face": { "kit": "facekit.round", "parent": "head", "at": [16, 14], "z": 2 },
    "tool": { "sprite": "props/shears", "pivot": [2, 10], "to": "hand_r", "z": 3 }
  },
  "clips": {
    "idle":  { "fps": 6,  "loop": true,  "body": ["idle_0", "idle_1"],
               "tracks": [{ "target": "head", "prop": "y", "keys": [[0, 0], [0.5, 1], [1, 0]] }] },
    "work":  { "fps": 8,  "loop": true,  "body": ["work_0", "work_1"],
               "events": [[0.125, "sfx.snip"], [0.125, "fx.leaf_puff@hand_r"]] },
    "cheer": { "fps": 10, "loop": false, "body": ["cheer_0"], "face": "happy",
               "tracks": [{ "target": "root", "prop": "y", "keys": [[0, 0], [0.15, -6], [0.3, 0]], "ease": "outQuad" }] }
  },
  "blink": { "every": [2.5, 6] }
}
```

What the runtime supports:

- Body frame swaps, each frame carrying its own anchor points so the head and tools follow the pose.
- Attached parts with pivots, draw order, and swappable sprites (tools, expressions).
- Keyframe tracks on position, scale, visibility and tint, with easing. Clips cross-fade.
- Procedural layers on top: breathing bob, blink timers, look-at-cursor, squash on landing, a white flash on hit.
- Timeline events that fire sounds and effects at an anchor, so audio and particles stay in sync with motion.
- Plants use the same system with growth-stage frames. Foliage and planter are separate sprites; the foliage sways by row shear anchored at the soil-line pivot and the planter stays still.

**How agents check animation without an editor.** `pnpm rig:preview <id>` renders every clip of a rig as a labelled contact sheet and an animated image, using the real game renderer. The animator looks at the frames, reviewers see them in the pull request, and Lawson can see them on the phone.

## Particles and effects

Effects are data, one file each, played by one pooled system.

```yaml
id: fx.coin_burst
burst: [8, 14]                 # how many
sprite: [fx/coin_spin]         # animated by spin frames, not rotation
life: [0.5, 0.9]
velocity: { angle: [-150, -30], speed: [90, 160] }
gravity: 420
drag: 0.6
bounce: { floorY: 0, restitution: 0.4 }
then: { flyTo: hud.coins, duration: 0.35, ease: inBack }   # second phase: fly to the counter
motion: decorative             # reduce-motion class
```

- Particles are hard-edged pixel sprites that fade by frame or by palette ramp rather than by soft transparency, unless the style bible says otherwise for a given effect.
- The "fly to counter" phase crosses from world space to UI space, and the counter ticks up when particles arrive.
- A global cap and pooling keep the worst case bounded. Big moments scale the number of particles to the size of the reward within that cap.

**One effect for every big moment** (design 0.5, EXPANSION 4.2). `moment(tier, place, form)` in `packages/game/src/scene/moment.ts` plays particles, a light ring, a screen flash, shake, hit-pause and a sound chord, all scaled by the `juice` row of that tier in `tables/tiers.yaml`. `tables/moments.yaml` says which tier each event is (a Bumper tap is Uncommon, a Harvest Festival Mythic, a first Festival Exotic), so the juice goes where the moment is biggest and one table tunes it all. A short moment flashes at half strength and pauses half as long. Reduce motion keeps the particles and the sound and drops the shake, the flash and the pause.

**One reveal player** (EXPANSION 4.1). Chest and card reveals take a tier and a form. The full form is Arrive, Build, Tell, Burst and Show, and its length comes from the tier row (`reveal.total`, 0.4 seconds for Common to 9 seconds for Grailed); the short form is the climb, the burst and the chime. A tier with no art of its own yet borrows the nearest tier below that has one, plus a band in its own colours, so tiers 6 to 11 work before their art arrives. Development builds have a reveal theatre (Settings, Reveal theatre) that plays any of the eleven in either form.

Planned shader set, all GLSL ES 3.0: row-shear sway, one-pixel outline for hover and selection, white flash, palette tint, pixel dissolve for reveals, rarity colour flood, pixel shockwave ring, glow composite, light composite, colour grade.

Screen-level juice (hit-pause, shake, flashes) lives in one `Juice` service on the presentation clock, so the screen-shake and reduce-motion settings and a flash-rate limit for photosensitivity apply to everything in one place.

## UI

The whole UI is drawn in the same PixiJS canvas as the world, on the same pixel grid, so it shares fonts, shaders, colour grading and screenshots with everything else. No HTML UI on top.

- **Components** (the UI kit, built in Phase 1): button, icon button, toggle, slider, tabs, panel with nine-slice frames, virtualised scroll list and grid, progress bar, card, tooltip, modal stack, toast, tree canvas with pan and zoom (skills, research), key-binding capture.
- **Layout**: anchors plus row, column and grid containers. Evaluate `@pixi/layout` for this before writing our own.
- **Text**: bitmap pixel fonts with tabular digits so counters do not jitter. The Display font is a custom bitmap font supplied by art. Body and Small are SIL OFL pixel fonts (free to ship), picked from the style bible's candidates after a legibility test in the engine at 2x, 3x, 4x and 6x during Phase 1. A small rich-text layer supports inline icons, colour runs and wrapping for tooltips and descriptions.
- **Numbers**: every number on screen goes through the one formatter in 05. Counters animate toward the true value in the presentation layer only.
- **Tooltips**: stat breakdowns come straight from the core's modifier breakdown, so they are always complete and always correct.
- **Transitions**: panels and screens use the shared tween system; every interactive element has hover, pressed, disabled and focused states defined in the kit, not per screen.
- **UI kit gallery**: a page in development builds that shows every component in every state. It is screenshotted in CI, which makes UI consistency reviewable.

## Input

**Phone and PC are equal.** Everything plays by tap and hold alone, and keyboard and mouse add shortcuts on top (EXPANSION 0, "Phone and PC"). All input goes through an action map (`collect`, `collectAll`, `buyLevel`, `buyMax`, `buyMode`, `spurt`, `ability1` to `ability4`, `openCards`, `closePanel`, `floorUp`, `floorDown` and so on) with default bindings, a rebinding screen, and conflicts flagged.

- **Touch and mouse**, through pointer events: tap, hold to repeat, drag to scroll the tower with inertia, long press for what hover shows on PC.
- **Mouse extras**: the wheel scrolls the tower, hover shows tooltips.
- **Keyboard extras**: Space taps (held, it repeats at the hold rate), F starts a Growth Spurt, B changes the buy amount, the arrows and W and S scroll, Escape closes the top panel, Tab and the arrows move focus. **The number keys 1 to 4 press the four abilities of the world on screen, in floor order** (GDD 7.1). F11 and Alt+Enter switch full screen in the Windows app.
- **Counted taps are a flag on the input source** (design 0.5, EXPANSION 15.1 item 7). A tap command carries its source (`tower`, `key` or `field`), and only counted sources act on the tower, its Combo and its stats, so taps in the later field activities never count as tower taps.

The GDD chooses the actual hotkeys.

## Accessibility hooks

Built into the engine layer so features cannot skip them: reduce motion, screen shake off, flash limiting, colour-blind-safe tier cues (each tier has pips, an emblem and a frame pattern as well as a colour), UI scale, full key rebinding, separate volume sliders, and a number format choice.

## Audio

Web Audio API with a small mixer of our own.

```
SFX voices ----> [sfx bus] ----\
UI sounds -----> [ui bus] ------+--> [master gain] --> [limiter] --> output
Ambience ------> [amb bus] ----/
Music stems ---> [music bus] --> [low-pass, used when a menu is open]
```

- **Adaptive music**: each track is a set of stems of identical length and tempo, started on the same audio-clock tick so they stay sample-aligned. Stems fade in and out as income milestones and world state change. Big moments duck the music briefly.
- **Budget for the Audio Director**: up to 6 stems per track, loop length up to about 96 seconds, 44.1 kHz. Decoded audio is held in memory for gapless looping, about 34 MB per stereo stem at that length, so one world's music is roughly 170 to 200 MB and only one world's music is loaded at a time.
- **SFX**: several variations per sound, small random pitch and volume changes, a voice limit per sound and a priority order so a hundred collects in one second do not turn into noise.
- **Ambience**: per-floor loops cross-faded by which floors are on screen.
- **Files**: OGG Vorbis in the repository, loop points as metadata beside each file. Uncompressed masters stay in project files, not in git.
- **What agents can and cannot check**: loudness, peaks, clipping, silence and loop seams can be measured automatically with ffmpeg. Whether it sounds good is judged by Lawson on a build.
