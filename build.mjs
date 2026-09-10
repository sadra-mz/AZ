import { readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const out = resolve(ROOT, 'index.html');
const tmp = resolve(ROOT, '.build.tmp');
const mode = process.argv[2] || 'build';
if (mode !== 'build' && mode !== '--check') {
  console.error('usage: node build.mjs [--check]');
  process.exit(2);
}
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8');
const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const THREE_SRI = 'sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu';
const chunks = [];
chunks.push('<!doctype html>\n<html lang="fa" dir="rtl">\n');
chunks.push(read('src/00-head.html'));
chunks.push('<style>\n');
chunks.push('.hud-scene,.mode-card-art{background-image:url("data:image/webp;base64,' + b64('art/nuketown-street.webp') + '")}\n');
chunks.push('#mapCard[data-map="terminal"] .mode-card-art{background-image:url("data:image/webp;base64,' + b64('art/terminal-apron.webp') + '")}\n');
chunks.push('</style>\n<body>\n');
chunks.push(read('src/01-body.html'));
chunks.push(`<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js" integrity="${THREE_SRI}" crossorigin="anonymous"></script>\n`);
chunks.push(`<script>\nif (typeof THREE === "undefined") {\n  document.write("<scr"+"ipt src=\\"https://unpkg.com/three@0.128.0/build/three.min.js\\" integrity=\\"${THREE_SRI}\\" crossorigin=\\"anonymous\\"></scr"+"ipt>");\n}\n</script>\n`);
for (const f of ['mapspec.js','terminal-mapspec.js','map-registry.js','bots.js','net-protocol.js']) {
  chunks.push(`<script>/* ===== ${f} ===== */\n${read(f)}\n</script>\n`);
}
for (const f of ['src/10-core.js','src/20-world.js','src/25-terminal-world.js','src/30-physics.js','src/35-map-runtime.js','src/40-weapons.js','src/50-actors.js','src/60-fx.js','src/70-game.js','src/72-pickups.js','src/75-network.js','src/78-touch.js','src/80-ui.js','src/90-main.js']) {
  chunks.push(`<script>/* ===== ${f} ===== */\n${read(f)}\n</script>\n`);
}
chunks.push('</body>\n</html>\n');
const result = chunks.join('');
if (mode === '--check') {
  let current = '';
  try { current = readFileSync(out, 'utf8'); } catch {}
  if (current === result) console.log('index.html is current');
  else { console.error('index.html is stale; run npm run build'); process.exit(1); }
} else {
  writeFileSync(tmp, result);
  renameSync(tmp, out);
  console.log(`built index.html (${Buffer.byteLength(result)} bytes)`);
}
