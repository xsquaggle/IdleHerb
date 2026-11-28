// Turns the one-file build (dist-single/index.html) into a page body for a claude.ai
// Artifact, which supplies its own <html>, <head> and <body>: keeps the title, the
// style, the stage and the script. Usage: node scripts/artifact-page.mjs <out.html>
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../dist-single/index.html', import.meta.url), 'utf8');
const pick = (re, what) => {
  const m = src.match(re);
  if (!m) throw new Error(`artifact-page: no ${what} in the build`);
  return m[0];
};
const title = pick(/<title>[\s\S]*?<\/title>/, 'title');
const style = pick(/<style>[\s\S]*?<\/style>/, 'style');
const script = pick(/<script type="module">[\s\S]*<\/script>/, 'script');
const body = pick(/<div id="stage"><\/div>\s*<div id="boot">[\s\S]*?<\/div>/, 'stage');
const out = process.argv[2] ?? 'artifact.html';
writeFileSync(out, `${title}\n${style}\n${body}\n${script}\n`);
console.log(`wrote ${out} (${(readFileSync(out).length / 1e6).toFixed(2)} MB)`);
