import { copyFile, cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist');
const pages = ['index.html', 'styles.css', 'refinements.css', 'script.js'];
const references = new Set();

for (const filename of pages) {
  const source = await readFile(join(root, filename), 'utf8');
  if (/(?:file:\/\/|\/Users\/|[A-Za-z]:\\)/i.test(source)) {
    throw new Error(`Local computer path found in ${filename}`);
  }
  if (filename.endsWith('.css')) {
    for (const match of source.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) references.add(match[1]);
  }
  if (filename.endsWith('.html')) {
    for (const match of source.matchAll(/\b(?:src|href)="([^"]+)"/g)) references.add(match[1]);
  }
}

let validated = 0;
for (const reference of references) {
  if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) continue;
  if (reference.startsWith('/') || reference.includes('..')) {
    throw new Error(`Unsafe asset path: ${reference}`);
  }
  const local = join(root, reference.split(/[?#]/)[0]);
  const info = await stat(local).catch(() => null);
  if (!info?.isFile()) throw new Error(`Missing local asset: ${reference}`);
  validated++;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const filename of pages) {
  await mkdir(dirname(join(output, filename)), { recursive: true });
  await copyFile(join(root, filename), join(output, filename));
}
await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });
console.log(`Built dist/ with ${validated} validated local references.`);
