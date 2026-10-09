// Subset Material Symbols per page: scan each HTML page (and the local scripts
// it loads) for icon names, then rewrite `icon_names=` in <link data-icons>.
// Run after editing markup: `npm run icons`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = [
  'index.html',
  'portfolio/lumbung-niaga/index.html',
  'portfolio/rara-roastery/index.html',
  'portfolio/kirana-ubud/index.html',
];
const ALWAYS = ['close', 'dark_mode', 'light_mode', 'check', 'menu', 'arrow_back'];

const patterns = [
  /class="ms[^"]*"[^>]*>\s*([a-z0-9_]+)\s*</g,      // <span class="ms">icon</span>
  /\bicon:\s*'([a-z0-9_]+)'/g,                       // { icon: 'name' } in JS data
  /data-icon="([a-z0-9_]+)"/g,
  /\/\*\s*icons:\s*([a-z0-9_,\s]+)\*\//g,            // /* icons: a, b */ hints in JS
];

for (const page of PAGES) {
  const file = resolve(root, page);
  if (!existsSync(file)) { console.log('skip (missing)', page); continue; }
  let html = readFileSync(file, 'utf8');
  const sources = [html];
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
    const js = resolve(dirname(file), m[1]);
    if (existsSync(js)) sources.push(readFileSync(js, 'utf8'));
  }
  const names = new Set(ALWAYS);
  for (const src of sources) {
    for (const re of patterns) {
      for (const m of src.matchAll(re)) m[1].split(/[,\s]+/).filter(Boolean).forEach((n) => names.add(n));
    }
  }
  const list = [...names].sort().join(',');
  const before = html;
  html = html.replace(/(<link[^>]*?icon_names=)[^&"]*([^>]*data-icons)/, `$1${list}$2`);
  if (html !== before) writeFileSync(file, html);
  console.log(relative(root, file), names.size, 'icons', html !== before ? '(updated)' : '(unchanged)');
}
