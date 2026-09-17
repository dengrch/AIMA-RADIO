// Package only public site assets, never opt/, development files, or agent metadata.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
rmSync('_site', { recursive: true, force: true });
mkdirSync('_site', { recursive: true });
for (const file of ['index.html', 'styles.css', 'script.js', 'content.js', '.nojekyll', 'assets']) {
  cpSync(file, `_site/${file}`, { recursive: true, filter: source => !source.endsWith('.DS_Store') && source !== 'assets/audio' });
}
// A changed file gets a new URL, so returning readers do not reuse stale content.
const html = readFileSync('_site/index.html', 'utf8').replace(
  /\b(src|href)="(content\.js|script\.js|styles\.css)(?:\?[^"\s]*)?"/g,
  (_, attribute, file) => {
    const version = createHash('sha256').update(readFileSync(`_site/${file}`)).digest('hex').slice(0, 16);
    return `${attribute}="${file}?v=${version}"`;
  },
);
writeFileSync('_site/index.html', html);
console.log('Static site prepared in _site/');
