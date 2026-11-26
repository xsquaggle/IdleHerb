# 06. Save system

Status: recommended, Phase 0. Owner: Engine Architect. Implemented in Phase 1 by the Save and Offline programmer.

## Goals

1. A crash, a power cut or a forced shutdown at any instant never costs more than the last few seconds of play.
2. A damaged save file is detected, set aside, and replaced from a backup automatically, and the player is told what happened.
3. A save from any earlier version loads in every later version.
4. The player can export a save, move it to another PC and import it.
5. All of the above is proven by automated tests, including on real Windows.

Saves are not encrypted or obfuscated. This is a single-player, non-commercial game; a readable save is easier to debug and to trust. The checksum exists to detect damage, not to stop editing.

## Where saves live

| Install type | Folder |
|---|---|
| Installed | `%APPDATA%\Sprout Tower\` |
| Portable | `SproutTowerData\` beside the .exe |

`%APPDATA%` is not synced by OneDrive by default, which avoids a common source of locked files.

```
saves/main/
  save.sprout               the current save
  save.tmp-<seq>            only exists briefly during a write
  backups/                  automatic rolling backups
  snapshots/                safety copies taken before risky operations
  corrupt/                  files that failed validation, kept for diagnosis
settings.json               player settings, separate from the save
logs/
```

The folder layout supports more than one profile (`saves/<profile>/`). Whether the game offers profiles is a design decision; version 1 can ship with one.

## File format

A one-line header, then a JSON body.

```
SPROUTSAVE 1 sha256=9f2c...e1 bytes=48213
{
  "game": "0.3.0",
  "struct": 1,
  "seq": 4812,
  "createdAt": 1795620000000,
  "savedAt": 1795706400000,
  "content": "a1b2c3d4",
  "slices": {
    "wallet": { "v": 1, "d": { "cur.coins": "1.2345678901234567e12" } },
    "floors": { "v": 3, "d": { } },
    "time":   { "v": 1, "d": { } },
    "rng":    { "v": 1, "d": { } }
  }
}
```

- The header carries the byte length and a SHA-256 of the body, so truncation and corruption are caught before the body is even parsed. The hash is a small pure TypeScript function in the kernel, tested against the published test vectors, because the core may not use Node or browser crypto. The game, the simulator, the browser preview and the tests therefore all compute it the same way.
- `seq` goes up by one on every write. Recovery uses it to find the newest good file.
- Each system owns one slice with its own version number `v`. This is what lets several programmers change their own save data without colliding on one global version.
- Big numbers are exact strings (see 05). Content is referred to by id.

Encoding and decoding, validation and migrations are pure functions in `packages/core`. Touching the disk is `packages/save-io`. They are tested separately.

## Writing a save

Done in the Electron main process, never on the render thread.

1. The renderer serialises the state (well under a millisecond at this size) and sends the bytes to the main process. The main process keeps the newest bytes in memory.
2. One write runs at a time. If newer bytes arrive during a write, they replace anything waiting.
3. Write the bytes to `save.tmp-<seq>`, flush to disk, close.
4. Read the temp file back and compare its hash. A full disk or an interfering antivirus shows up here rather than later.
5. If a backup is due, copy the current `save.sprout` into `backups/` first.
6. Rename the temp file over `save.sprout`. On NTFS this replace is atomic: a reader sees either the old complete file or the new complete file.
7. If the rename is refused because another program holds the file (antivirus, indexer), retry with increasing delays. If it still fails, leave the temp file where it is, show a small "save delayed" indicator, and try again at the next autosave. Recovery can use the temp file.

There is no moment at which the only copy of the player's progress is a half-written file.

## When saves happen

- Every 30 seconds.
- Within 2 seconds of an important action (opening a floor, opening a chest, a Replant or a Harvest Festival, a large purchase). Commands are flagged for this in the core.
- When the window loses focus, is minimised, or the PC is about to sleep.
- On quit. The main process asks the renderer for a final snapshot, writes it, then closes the window.
- If the renderer crashes or Windows is shutting down and the renderer cannot answer, the main process writes the newest snapshot it already holds.

## Backups

| Kind | Kept |
|---|---|
| Rolling | One every 10 minutes of play: newest 6. Then one per hour: 12. Then one per day: 14 |
| Before a migration | The untouched pre-upgrade file, newest 10 |
| Before an import or a hard reset | Newest 5 of each |

At well under a megabyte per file the whole folder stays small. The settings screen lists backups with their date and progress summary and can restore any of them; restoring first snapshots the current save.

## Loading and recovery

1. Collect candidates: `save.sprout`, any `save.tmp-*`, everything in `backups/`.
2. In order of newest `seq` first, validate each: header length and hash, JSON parse, known structure, run migrations, validate every slice against its schema.
3. Load the first one that passes.
4. If that was not `save.sprout`, tell the player plainly: which backup was used and how much time it is behind. Never silently.
5. Move every file that failed into `corrupt/` with a timestamp. Nothing is deleted.
6. If nothing passes, start a new game, keep everything in `corrupt/`, and offer import.
7. If the save is from a **newer** version of the game than the one running, do not load it and do not overwrite it. Say so.

After a successful load a sanitising pass runs: unknown content ids are resolved through `retired.yaml` or parked rather than dropped, impossible values are clamped, and anything it had to fix is logged.

## Migrations

- Each system keeps its own ordered upgrade functions in `migrations.ts`: version 1 to 2, 2 to 3, and so on. They run in sequence from whatever version the file has.
- A separate short list of structural migrations handles the rare change that moves data between systems.
- Migrations are pure, never deleted, and never depend on current content tables being unchanged.
- **Fixtures.** At every released version a deterministic bot plays to several stages (fresh, ten minutes, first Replant, first Harvest Festival, late game) and the resulting saves are committed under `tests/fixtures/saves/<version>/`. CI loads every fixture ever committed into the current build, checks invariants (no NaN, no negative currency, all ids known), saves it again and confirms the reload is identical. This is the "save-migration test from every prior version" the brief asks for at ship, running from the first tagged build of Phase 1 onward, so Lawson's own test saves keep working throughout development.

## Export and import

- **Export to file**: writes the same format as the save file through a normal Windows save dialog (`.sprout`).
- **Copy to clipboard**: the same bytes, compressed and text-encoded with a short prefix, for pasting into a note or message.
- **Import**: the file or text is decoded and put through the full load pipeline in memory first. Only if it passes is the current save snapshotted and replaced. A file whose checksum does not match but which otherwise validates is offered with a warning rather than refused.

No cloud saves in version 1: they need a server, which costs money and adds accounts.

## Torture tests

Run in CI. The file-level tests run on both Linux and a Windows runner, because rename and locking behaviour is what differs on NTFS.

| Test | Method | Pass condition |
|---|---|---|
| Crash mid-save | A child process saves in a loop and is killed at random moments, 500 times | Every restart loads a valid save no older than the previous completed write |
| Failure at each step | Fault injection in the file layer: fail after N bytes, fail on flush, fail on rename, full disk | Same as above, and no temp files accumulate |
| Locked file | Another process holds `save.sprout` open during the rename | Retries succeed or the temp file is recovered next launch |
| Corruption | Truncate, flip random bits, zero the file, empty file, random bytes, valid JSON with wrong shape | Detected, quarantined, newest good backup loaded, player message produced |
| Everything damaged | All candidates invalid | New game starts, files preserved in `corrupt/` |
| Newer-version save | Header or slice version above what the build knows | Not loaded, not overwritten |
| Version migration | Every committed fixture from every version | Loads, passes invariants, re-saves identically |
| Round trip | Random valid states | Save then load gives an identical state |
| Import | Good export, damaged export, edited export, another game's file | Good one loads; others are refused or warned without touching the current save |
| Quit paths | Normal close, renderer killed, simulated Windows session end | Final state is on disk in each case |
| Two instances | Launch a second copy | Second copy focuses the first and exits |

The offline and clock tests are listed in 07.
