/**
 * `pnpm content:bundle`: writes the validated tables as one JSON file for the
 * game client (docs/tech/04-content-pipeline.md, "one bundle"). The client
 * cannot read YAML from disk, so it loads this file and calls `hydrateContent`
 * from @sprout/core, exactly as the simulator does after `loadContent`.
 *
 * The tables are design 0.4 (CHANGES.md B.6, PR #12), so no overlay is applied.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { hydrateContent } from '@sprout/core';
import { loadRaw } from './index';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, '../generated/content.json');

const raw = loadRaw();
const text = parse(readFileSync(join(here, '../text/en.yaml'), 'utf8'));
const json = JSON.stringify({ design: '0.4', raw, text });
// The bundle must hydrate after a JSON round trip, or the client would fail at boot.
hydrateContent(JSON.parse(json).raw);
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, json);
console.log(`content: wrote ${outFile} (${(json.length / 1024).toFixed(0)} KB, design 0.4)`);
