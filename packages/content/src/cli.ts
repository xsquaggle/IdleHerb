/**
 * `pnpm content:build`: validates every table and prints a short summary.
 * A broken table fails here, long before a game or a simulation starts.
 */
import { loadContent } from './index';

const content = loadContent();
const launch = content.worlds.filter((w) => w.launch);
console.log('content: tables are valid');
console.log(`  worlds      ${content.worlds.length} (${launch.length} at launch)`);
console.log(`  floors      ${content.worlds.reduce((n, w) => n + w.floors.length, 0)} (${launch.reduce((n, w) => n + w.floors.length, 0)} at launch)`);
console.log(`  managers    ${content.managers.length} (${content.managers.filter((m) => m.launch).length} at launch)`);
console.log(`  plants      ${content.plants.length} (${content.plants.filter((p) => p.launch).length} at launch)`);
console.log(`  heirlooms   ${content.artifacts.length}`);
console.log(`  skills      ${content.skills.length} (${content.skills.reduce((n, s) => n + s.ranks, 0)} points)`);
console.log(`  research    ${content.research.length}`);
console.log(`  story steps ${content.story.length}`);
