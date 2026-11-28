/**
 * `pnpm content:bundle`: writes the validated tables as one JSON file for the
 * game client (docs/tech/04-content-pipeline.md, "one bundle"). The client
 * cannot read YAML from disk, so it loads this file and calls `hydrateContent`
 * from @sprout/core, exactly as the simulator does after `loadContent`.
 *
 * Design 0.4 (PR #7) is the design 0.3 tables with the balance simulator's
 * accepted overlays laid on top. Until the simulator thread rebuilds the tables
 * from 0.4 and retires the overlays (CHANGES.md B.6), the game applies the same
 * four overlays here, so it plays the frozen 0.4 numbers.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { hydrateContent } from '@sprout/core';
import { loadRaw, readOverlay } from './index';

export const DESIGN_04_OVERLAYS = ['p1-levels', 'p2-taps', 'p4-gates', 'p5-late-research'];

const here = dirname(fileURLToPath(import.meta.url));
const proposalsDir = join(here, '../../../apps/sim/proposals');
const outFile = join(here, '../generated/content.json');

const overlays = DESIGN_04_OVERLAYS.map((id) => readOverlay(join(proposalsDir, `${id}.yaml`)));
const raw = loadRaw({ overlays });
const text = parse(readFileSync(join(here, '../text/en.yaml'), 'utf8'));
const json = JSON.stringify({ design: '0.4', overlays: DESIGN_04_OVERLAYS, raw, text });
// The bundle must hydrate after a JSON round trip, or the client would fail at boot.
hydrateContent(JSON.parse(json).raw);
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, json);
console.log(`content: wrote ${outFile} (${(json.length / 1024).toFixed(0)} KB, design 0.4 = 0.3 tables + ${DESIGN_04_OVERLAYS.join(', ')})`);
