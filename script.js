const copy = {
  en: { light: 'light', dark: 'dark', intro: 'Music, in the intervals.', openingSide: 'Improvisations, fragments, and the echoes of life.', newsNote: 'Updates from AIMA', all: 'all', radio: 'radio', notes: 'music notes', empty: 'Still taking shape. More to come.', aboutLabel: 'About this radio', aboutHeading: 'In the intervals of everyday life.', aboutOne: 'Aima means an interval — a little time left for music. This is a home for improvisations, original demos, and the words and photographs that surround them.', aboutTwo: 'Some sounds become radio episodes. Others remain unfinished fragments. Keeping them here is a way of keeping a little of the life around them, too.', aboutThree: 'Updated from time to time. Perhaps a piece of music here can keep you company for a while.', back: '← All updates', direct: 'Open audio ↗', backup: 'Backup audio ↗', words: 'Words & photographs', notFound: 'This entry could not be found.', play: 'PLAY', pause: 'PAUSE', loading: 'Loading audio…', error: 'Audio could not load. Retry playback or open the audio link.', ready: '', buffering: 'Buffering…', seek: 'Playback position', more: 'Listen & read', read: 'Read more', bgSoon: 'background music / coming soon', bgOff: 'background music / off', bgOn: 'background music / on', bgError: 'Soundtrack could not load. Tap to retry.' },
  zh: { light: '亮', dark: '暗', intro: '把一点时间，留给声音。', openingSide: '即兴、片段，以及生活的余音。', newsNote: '来自合間的更新', all: '全部', radio: '电台', notes: '音乐记录', empty: '这里还在慢慢积累，之后见。', aboutLabel: '关于合間', aboutHeading: '在埋头奔走的空档中。', aboutOne: '「合間」是间隔，也是留给音乐的一点时间。这里收集即兴演奏、原创 demo，还有围绕它们写下的文字和拍下的照片。', aboutTwo: '有些声音已经成为一期电台，有些还只是未完成的片段。把它们留在这里，也把当时的生活留在这里。', aboutThree: '不定期更新。希望某一段声音，能陪你走一会儿。', back: '← 返回所有内容', direct: '直接打开音频 ↗', backup: '备用音频 ↗', words: '文字与影像', notFound: '没有找到这篇记录。', play: '播放', pause: '暂停', loading: '正在加载音频…', error: '音频加载失败，请重试播放，或直接打开音频链接。', ready: '', buffering: '正在缓冲…', seek: '播放进度', more: '收听与阅读', read: '阅读全文', bgSoon: '背景音乐 / 筹备中', bgOff: '背景音乐 / 关', bgOn: '背景音乐 / 开', bgError: '背景音乐加载失败，请点击重试。' }
};
const $ = (selector) => document.querySelector(selector);
const audio = $('#audio');
const seek = $('#seek');
const background = $('#background-audio');
let lang = 'en';
let activeId = null;
let filter = 'all';
let status = 'ready';
let scrubbing = false;
let playbackRequest = 0;
function formatTime(value) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
function activeEpisode() { return episodes.find(episode => episode.id === activeId); }
function setStatus(value) { status = value; $('#audio-status').textContent = copy[lang][value]; }
function renderPlayback() {
  $('#play-toggle').textContent = audio.paused ? copy[lang].play : copy[lang].pause;
  $('#play-toggle').setAttribute('aria-label', audio.paused ? copy[lang].play : copy[lang].pause);
}
function paintProgress(value) {
  const ratio = Math.max(0, Math.min(100, value));
  seek.value = ratio;
  renderCharacterProgress(ratio);
  const seconds = Number.isFinite(audio.duration) ? ratio * audio.duration / 100 : 0;
  $('#current-time').textContent = formatTime(seconds);
  seek.setAttribute('aria-valuetext', `${formatTime(seconds)} / ${formatTime(audio.duration)}`);
}
function renderCharacterProgress(value = Number(seek.value)) {
  const track = $('#progress-text');
  const units = Math.max(2, Math.floor(track.clientWidth / 10));
  const cursor = Math.round(Math.max(0, Math.min(100, value)) / 100 * (units - 1));
  if (track.children.length !== units) {
    track.replaceChildren(...Array.from({ length: units }, () => document.createElement('span')));
  }
  Array.from(track.children).forEach((cell, index) => { cell.textContent = index === cursor ? '█' : '░'; });
}
new ResizeObserver(() => renderCharacterProgress()).observe($('.progress-wrap'));
function renderBackground() {
  const available = Boolean(siteAudio.src);
  $('#background-toggle').setAttribute('aria-disabled', String(!available));
  $('#background-toggle').setAttribute('aria-pressed', String(!background.paused));
  $('#background-label').textContent = copy[lang][!available ? 'bgSoon' : background.paused ? 'bgOff' : 'bgOn'];
}
function renderCopy() {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
  document.body.dataset.lang = lang;
  $('#site-title').innerHTML = lang === 'zh' ? '合間電台' : '<span class="title-aima">aima</span> <span class="title-radio">RADIO</span>';
  document.title = activeEpisode() ? `${activeEpisode()[lang].title} — AIMA RADIO` : 'AIMA RADIO';
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = copy[lang][node.dataset.i18n]; });
  document.querySelectorAll('[data-lang]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.lang === lang)));
  seek.setAttribute('aria-label', copy[lang].seek);
  setStatus(status);
  renderPlayback();
  renderBackground();
}
function renderEpisodes() {
  $('#episode-list').replaceChildren();
  const visible = episodes.filter(episode => filter === 'all' || episode.category === filter);
  $('#empty-list').hidden = visible.length > 0;
  visible.forEach(episode => {
    const text = episode[lang];
    const card = document.createElement('a');
    card.className = 'episode-card';
    card.href = `#episode/${encodeURIComponent(episode.id)}`;
    const date = document.createElement('time'); date.textContent = text.date;
    const category = document.createElement('span'); category.className = 'category'; category.textContent = copy[lang][episode.category] || episode.category;
    const body = document.createElement('span'); body.className = 'card-copy';
    const title = document.createElement('strong'); title.textContent = text.title;
    const note = document.createElement('small'); note.textContent = [text.note, episode.durationLabel].filter(Boolean).join(" · ");
    const more = document.createElement('small'); more.className = 'read-more'; more.textContent = copy[lang][episode.audio ? "more" : "read"];
    body.append(title, note, more);
    const image = document.createElement('img'); image.className = 'card-image'; image.src = episode.cover || episode.photos[0] || "assets/images/radio-cover.jpg"; image.alt = ''; image.loading = 'lazy';
    const arrow = document.createElement('span'); arrow.className = 'card-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
    card.append(date, category, body, image, arrow); $('#episode-list').append(card);
  });
}
function renderStory(episode) {
  const text = episode[lang];
  $('#episode-date').textContent = [text.date, copy[lang][episode.category] || episode.category, episode.durationLabel].filter(Boolean).join(" / ");
  $('#episode-title').textContent = text.title;
  $('#episode-note').textContent = text.note;
  $('#entry-title').textContent = text.heading;
  const story = $('#entry-body'); story.replaceChildren(); story.lang = text.bodyLang || (lang === 'zh' ? 'zh-Hans' : 'en');
  // Floats share one continuous text flow, so prose can wrap around each photograph.
  const photoPositions = episode.photos.map((_, index) => Math.floor((index + 0.5) * text.body.length / Math.max(1, episode.photos.length)));
  text.body.forEach((value, paragraphIndex) => {
    photoPositions.forEach((position, photoIndex) => {
      if (position !== paragraphIndex) return;
      const figure = document.createElement('figure'); figure.className = 'story-photo';
      const image = document.createElement('img'); image.src = episode.photos[photoIndex]; image.alt = `${text.title} — ${lang === 'zh' ? '随记照片' : 'photograph'} ${photoIndex + 1}`; image.loading = 'lazy';
      const caption = document.createElement('figcaption'); caption.textContent = `${text.title} / ${String(photoIndex + 1).padStart(2, '0')}`;
      figure.append(image, caption); story.append(figure);
    });
    const paragraph = document.createElement('p'); paragraph.textContent = value; story.append(paragraph);
  });
}
function route() {
  const hash = location.hash;
  const isEpisode = hash.startsWith('#episode/');
  let id = null;
  try { if (isEpisode) id = decodeURIComponent(hash.slice(9)); } catch { /* Invalid route becomes not-found. */ }
  const episode = episodes.find(item => item.id === id);
  $('#home-view').hidden = isEpisode;
  $('.site-head nav').hidden = isEpisode;
  $('#site-title').setAttribute('aria-label', lang === 'zh' ? '合間電台 — 返回首页' : 'AIMA RADIO — Home');
  $('#episode-view').hidden = !episode;
  $('#not-found').hidden = !isEpisode || Boolean(episode);
  if (activeId !== (episode?.id || null)) {
    playbackRequest++;
    audio.pause(); scrubbing = false;
    activeId = episode?.id || null;
    if (episode?.audio) {
      background.pause();
      audio.src = episode.audio; audio.load();
      seek.disabled = true; paintProgress(0);
      $('#duration').textContent = episode.durationLabel;
      $('#audio-direct').href = episode.audio;
      $('#audio-backup').hidden = !episode.backupAudio;
      if (episode.backupAudio) $('#audio-backup').href = episode.backupAudio;
      setStatus('loading');
    } else { audio.removeAttribute('src'); audio.load(); setStatus('ready'); }
  }
  $('.player').hidden = !episode?.audio;
  $('.audio-help').hidden = !episode?.audio;
  if (episode) renderStory(episode);
  renderCopy();
  if (isEpisode) { window.scrollTo(0, 0); if (episode) $('#episode-title').focus({ preventScroll: true }); }
  else if (hash) { requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView()); }
}
$('#play-toggle').addEventListener('click', async () => {
  if (!audio.paused) { playbackRequest++; audio.pause(); return; }
  const request = ++playbackRequest;
  background.pause();
  if (audio.error) { audio.load(); setStatus('loading'); }
  try { await audio.play(); } catch (error) { if (request === playbackRequest && error.name !== 'AbortError') setStatus('error'); }
});
['play', 'pause', 'ended'].forEach(event => audio.addEventListener(event, renderPlayback));
audio.addEventListener('play', () => background.pause());
audio.addEventListener('loadedmetadata', () => {
  seek.disabled = !Number.isFinite(audio.duration) || audio.duration <= 0;
  $('#duration').textContent = seek.disabled ? activeEpisode()?.durationLabel || '00:00' : formatTime(audio.duration);
  paintProgress(0); setStatus('ready');
});
audio.addEventListener('durationchange', () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) { seek.disabled = false; $('#duration').textContent = formatTime(audio.duration); }
});
audio.addEventListener('timeupdate', () => { if (!scrubbing && Number.isFinite(audio.duration) && audio.duration > 0) paintProgress(audio.currentTime / audio.duration * 100); });
audio.addEventListener('error', () => { if (activeId) setStatus('error'); });
audio.addEventListener('waiting', () => setStatus('buffering'));
audio.addEventListener('playing', () => setStatus('ready'));
audio.addEventListener('canplay', () => setStatus('ready'));
seek.addEventListener('pointerdown', () => { scrubbing = true; });
seek.addEventListener('input', () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const ratio = Number(seek.value); paintProgress(ratio);
  audio.currentTime = ratio / 100 * audio.duration;
});
function endScrub() { scrubbing = false; }
seek.addEventListener('change', endScrub);
window.addEventListener('pointerup', endScrub);
window.addEventListener('pointercancel', endScrub);
seek.addEventListener('blur', endScrub);
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {
  lang = button.dataset.lang; renderCopy(); renderEpisodes(); if (activeEpisode()) renderStory(activeEpisode());
}));
document.querySelectorAll('button[data-theme]').forEach(button => button.addEventListener('click', () => {
  document.body.dataset.theme = button.dataset.theme;
  document.querySelectorAll('button[data-theme]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
}));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
  renderEpisodes();
}));
if (siteAudio.src) { background.src = siteAudio.src; background.volume = siteAudio.volume; }
$('#background-toggle').addEventListener('click', async () => {
  if (!siteAudio.src) return;
  if (!background.paused) { background.pause(); return; }
  playbackRequest++; audio.pause(); $('#background-status').textContent = '';
  try { await background.play(); } catch { $('#background-status').textContent = copy[lang].bgError; }
});
['play', 'pause', 'ended'].forEach(event => background.addEventListener(event, renderBackground));
background.addEventListener('error', () => { $('#background-status').textContent = copy[lang].bgError; });
$('.skip-link').addEventListener('click', event => {
  event.preventDefault(); $('#main').focus(); $('#main').scrollIntoView();
});
$('.site-footer a').addEventListener('click', event => {
  event.preventDefault(); window.scrollTo(0, 0); $('#site-title').setAttribute('tabindex', '-1'); $('#site-title').focus({ preventScroll: true });
});
window.addEventListener('hashchange', route);
$('#year').textContent = new Date().getFullYear();
renderEpisodes(); route();
