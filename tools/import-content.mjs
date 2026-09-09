import { execFileSync } from 'node:child_process';
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync,
  rmSync, statSync, writeFileSync,
} from 'node:fs';
import { basename, extname, join } from 'node:path';

const outputRoot = 'assets/content';
const audioOrigin = 'https://audio.aimaradio.com';
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.heic']);
const audioExtensions = new Set(['.mp3', '.m4a', '.wav', '.flac']);
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function blocks(path) {
  return readFileSync(path, 'utf8').replaceAll('\r\n', '\n').trim()
    .split(/\n\s*\n/).map(value => value.trim()).filter(Boolean);
}

function parseDocument(path, fallbackHeading = '') {
  const parts = blocks(path);
  if (parts.length === 1) return { title: parts[0].split('\n')[0], heading: fallbackHeading, body: [parts[0]] };
  return { title: parts[0], heading: parts[1], body: parts.slice(2) };
}

function probe(path) {
  const result = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration,size,bit_rate:format_tags=title,artist,album,date',
    '-of', 'json', path,
  ], { encoding: 'utf8' }));
  const seconds = Math.round(Number(result.format.duration));
  return {
    durationSeconds: seconds,
    durationLabel: `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`,
    sizeBytes: Number(result.format.size),
    sizeLabel: `${(Number(result.format.size) / 1024 / 1024).toFixed(1)} MB`,
    bitrateKbps: Math.round(Number(result.format.bit_rate) / 1000),
    tags: result.format.tags || {},
  };
}

function datePair(value) {
  const [year, month, day] = value.split('-').map(Number);
  return { zh: `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`, en: `${day} ${months[month - 1]} ${year}` };
}

function fileDate(path) {
  const date = statSync(path).mtime;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function slug(value) {
  const latin = value.toLowerCase().replace(/β/g, 'beta').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return latin || [...value].map(char => char.codePointAt(0).toString(16)).join('-');
}

function publicAudio(folder, filename) {
  return `${audioOrigin}/${folder}/${encodeURIComponent(filename)}`;
}

function exportImage(source, destination) {
  mkdirSync(join(destination, '..'), { recursive: true });
  const extension = extname(source).toLowerCase();
  if (extension === '.heic') {
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', source, '-frames:v', '1', '-q:v', '3', destination]);
    execFileSync('sips', ['-Z', '1600', destination], { stdio: 'ignore' });
  } else if (extension === '.jpg' || extension === '.jpeg') {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', '1600', source, '--out', destination], { stdio: 'ignore' });
  } else {
    copyFileSync(source, destination);
  }
}

function exportPhotos(sourceDirectory, kind, id) {
  const files = readdirSync(sourceDirectory).filter(file => imageExtensions.has(extname(file).toLowerCase()))
    .sort((a, b) => (a.toLowerCase().startsWith('cover.') ? -1 : b.toLowerCase().startsWith('cover.') ? 1 : a.localeCompare(b, 'zh-Hans')));
  return files.map((file, index) => {
    const src = `${outputRoot}/${kind}/${id}/${String(index + 1).padStart(2, '0')}.jpg`;
    exportImage(join(sourceDirectory, file), src);
    return { src, caption: basename(file, extname(file)) };
  });
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

const radioRoot = 'opt/radio';
const episodes = readdirSync(radioRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && /^\d{4}:\d{2}:\d{2} vol\.\d+ /.test(entry.name))
  .map(entry => {
    const match = entry.name.match(/^(\d{4}):(\d{2}):(\d{2}) (vol\.\d+) (\d{8} - .+)$/);
    if (!match) throw new Error(`Unrecognized radio folder: ${entry.name}`);
    const [, year, month, day, volume, title] = match;
    const publishedAt = `${year}-${month}-${day}`;
    const id = slug(title.replace(/^\d{8} - /, ''));
    const directory = join(radioRoot, entry.name);
    const media = readdirSync(directory).find(file => audioExtensions.has(extname(file).toLowerCase()));
    if (!media) throw new Error(`Missing audio in ${directory}`);
    const englishPath = join(directory, 'doc.en.txt');
    if (!existsSync(englishPath)) throw new Error(`Missing English text: ${englishPath}`);
    const zh = parseDocument(join(directory, 'doc.txt'));
    const en = parseDocument(englishPath);
    const dates = datePair(publishedAt);
    Object.assign(zh, { title, date: dates.zh, note: `${volume} / 即兴演奏` });
    Object.assign(en, { title, date: dates.en, note: `${volume} / improvisation` });
    const photos = exportPhotos(directory, 'radio', id);
    return {
      id, volume, category: 'radio', publishedAt, zh, en, photos,
      cover: photos[0]?.src || 'assets/images/radio-cover.jpg',
      audio: publicAudio('radio', `${title}.mp3`), ...probe(join(directory, media)),
    };
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const demos = readdirSync('opt/demo', { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => {
  const directory = join('opt/demo', entry.name);
  const title = entry.name.replace(/^demo-/, '');
  const versions = readdirSync(directory).filter(file => audioExtensions.has(extname(file).toLowerCase())).map(file => {
    const path = join(directory, file);
    return { name: basename(file, extname(file)), filename: file, modifiedAt: fileDate(path), audio: publicAudio('demo', file), ...probe(path) };
  }).sort((a, b) => a.modifiedAt.localeCompare(b.modifiedAt) || a.name.localeCompare(b.name, undefined, { numeric: true }));
  const publishedAt = versions.at(-1)?.modifiedAt || '2026-01-01';
  return { id: slug(title), title, category: 'demo', publishedAt, versions, durationLabel: versions.at(-1)?.durationLabel || '' };
}).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const trackRoot = 'opt/track';
const trackSources = readdirSync(trackRoot, { withFileTypes: true }).flatMap(entry => {
  if (entry.isDirectory()) {
    const directory = join(trackRoot, entry.name);
    return readdirSync(directory).filter(file => audioExtensions.has(extname(file).toLowerCase())).map(file => ({ directory, file }));
  }
  return audioExtensions.has(extname(entry.name).toLowerCase()) ? [{ directory: trackRoot, file: entry.name }] : [];
});
const tracks = trackSources.map(({ directory, file }) => {
  const path = join(directory, file);
  const title = basename(file, extname(file));
  const id = slug(title);
  const photos = exportPhotos(directory, 'track', id);
  const zhNote = existsSync(join(directory, 'doc.txt')) ? readFileSync(join(directory, 'doc.txt'), 'utf8').trim() : '';
  const enNote = existsSync(join(directory, 'doc.en.txt')) ? readFileSync(join(directory, 'doc.en.txt'), 'utf8').trim() : '';
  return {
    id, title, filename: file, category: 'track', publishedAt: fileDate(path),
    zh: { note: zhNote }, en: { note: enNote }, photos, cover: photos[0]?.src || '',
    audio: publicAudio('track', file), ...probe(path),
  };
}).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const noteRoot = 'opt/note';
const notes = readdirSync(noteRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => {
  const match = entry.name.match(/^(\d{4}):(\d{2}):(\d{2})\s+(.+)$/);
  if (!match) throw new Error(`Unrecognized note folder: ${entry.name}`);
  const [, year, month, day, label] = match;
  const publishedAt = `${year}-${month}-${day}`;
  const directory = join(noteRoot, entry.name);
  const zh = parseDocument(join(directory, 'doc.txt'), 'note');
  const englishPath = join(directory, 'doc.en.txt');
  const en = existsSync(englishPath) ? parseDocument(englishPath, 'note') : { title: zh.title, heading: 'note', body: zh.body };
  const dates = datePair(publishedAt);
  zh.date = dates.zh; en.date = dates.en;
  const id = slug(label);
  const photos = exportPhotos(directory, 'note', id);
  return { id, category: 'note', publishedAt, zh, en, photos, cover: photos[0]?.src || '' };
}).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const radioInfo = 'opt/radio/radio-info';
exportImage(join(radioInfo, 'avatar.JPG'), 'assets/images/avatar.jpg');
exportImage(join(radioInfo, 'cover_v2.HEIC'), 'assets/images/radio-cover.jpg');
exportImage(join(radioInfo, 'cover_v1.HEIC'), 'assets/images/radio-cover-old.jpg');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', 'assets/images/radio-cover.jpg', '-vf', 'crop=340:340:710:710,scale=128:128', 'assets/images/favicon.png']);

const firstEpisode = [...episodes].sort((a, b) => a.volume.localeCompare(b.volume, undefined, { numeric: true }))[0];
const generated = new Date();
const generatedDate = `${generated.getFullYear()}-${String(generated.getMonth() + 1).padStart(2, '0')}-${String(generated.getDate()).padStart(2, '0')}`;
const metadataLines = [
  '# AIMA RADIO 音频元数据', '',
  `生成时间：${generatedDate}`, '',
  '此文档由 `node tools/import-content.mjs` 自动生成。R2 地址按本地文件名推导。', '',
  '## Demo', '',
  '| 项目 | 版本 | 本地修改日期 | 时长 | 大小 | 码率 | R2 地址 |',
  '| --- | --- | --- | ---: | ---: | ---: | --- |',
  ...demos.flatMap(group => group.versions.map(version => `| ${group.title} | ${version.name} | ${version.modifiedAt} | ${version.durationLabel} | ${version.sizeLabel} | ${version.bitrateKbps} kbps | ${version.audio} |`)),
  '', '## Track', '',
  '| 标题 | 本地修改日期 | 时长 | 大小 | 码率 | R2 地址 |',
  '| --- | --- | ---: | ---: | ---: | --- |',
  ...tracks.map(track => `| ${track.title} | ${track.publishedAt} | ${track.durationLabel} | ${track.sizeLabel} | ${track.bitrateKbps} kbps | ${track.audio} |`), '',
];
writeFileSync('opt/音频元数据.md', metadataLines.join('\n'));

const output = [
  '// Generated by `node tools/import-content.mjs` from local material in opt/.',
  `const episodes = ${JSON.stringify(episodes, null, 2)};`,
  `const demos = ${JSON.stringify(demos, null, 2)};`,
  `const tracks = ${JSON.stringify(tracks, null, 2)};`,
  `const notes = ${JSON.stringify(notes, null, 2)};`,
  `const siteAudio = ${JSON.stringify({ src: firstEpisode.audio, volume: 1, label: firstEpisode.en.title, href: `#episode/${firstEpisode.id}` }, null, 2)};`,
  '',
].join('\n');
writeFileSync('content.js', output);
console.log(`Imported ${episodes.length} radio episodes, ${demos.length} demo trees, ${tracks.length} tracks, and ${notes.length} notes.`);
