// Package only public site assets, never opt/, development files, or agent metadata.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
rmSync('_site', { recursive: true, force: true });
mkdirSync('_site', { recursive: true });
for (const file of ['index.html', 'styles.css', 'script.js', 'content.js', '.nojekyll', 'assets']) {
  cpSync(file, `_site/${file}`, { recursive: true, filter: source => !source.endsWith('.DS_Store') && source !== 'assets/audio' });
}
console.log('Static site prepared in _site/');
