const copy = {
  en: {
    light: 'light', dark: 'dark', newsNote: 'New and unfinished sounds, in one place.', aboutLabel: 'About this radio',
    aboutHeading: 'In the intervals of everyday life.',
    aboutOne: 'Aima means an interval: a little time left for music. This is a home for improvisations, original demos, finished tracks, and the words and photographs around them.',
    aboutTwo: 'The radio began as a place to keep imperfect long improvisations. A missed beat or rough recording stays when it carries a voicing, a texture, or a feeling worth returning to.',
    aboutThree: 'Demos preserve the route a piece took before it became complete. Notes hold the things that happened beside the music, including books, walks, images, and other interests.',
    aboutFour: 'It updates without a fixed schedule. Perhaps one sound here will become part of a walk, a room, or a particular stretch of your life.',
    words: 'Words & photographs', notFound: 'This entry could not be found.', direct: 'open audio ↗', play: 'play', pause: 'pause',
    loading: 'loading audio…', error: 'audio could not load', ready: '', buffering: 'buffering…', seek: 'playback position',
    loadMore: 'load more', demoIntro: 'Every save is a shape the piece once had.',
    navRadio: 'radio', navDemo: 'demo', navTrack: 'track', navNote: 'note',
    archiveRadio: 'Long improvisations and broadcasts kept as listening records.',
    archiveDemo: 'Unfinished pieces shown through their saved versions.',
    archiveTrack: 'Finished music, collected in its final form.',
    archiveNote: 'Words and images from music and everything around it.',
  },
  zh: {
    light: '亮', dark: '暗', newsNote: '新的声音，以及仍在变化的声音。', aboutLabel: '关于合間',
    aboutHeading: '在埋头奔走的空档中。',
    aboutOne: '「合間」是间隔，也是留给音乐的一点时间。这里收集即兴演奏、原创 demo、已经完成的 track，还有围绕它们写下的文字和拍下的照片。',
    aboutTwo: '电台最初用来保存并不完美的长即兴。一次掉拍、一段粗糙的录音，只要留下了值得重听的 voicing、织体或感受，就可以继续留在这里。',
    aboutThree: 'demo 保存一首曲子完成以前走过的路径；note 则记录音乐旁边发生的事情，包括书、散步、影像，以及其他爱好。',
    aboutFour: '这里没有固定更新周期。希望某一段声音，能够和你走过的路、待过的房间，或某一段生活联系起来。',
    words: '文字与影像', notFound: '没有找到这篇记录。', direct: '打开音频 ↗', play: '播放', pause: '暂停',
    loading: '正在加载音频…', error: '音频加载失败', ready: '', buffering: '正在缓冲…', seek: '播放进度',
    loadMore: '加载更多', demoIntro: '每次保存，都是它曾经存在过的样子。',
    navRadio: 'radio', navDemo: 'demo', navTrack: 'track', navNote: 'note',
    archiveRadio: '保存长篇即兴、声音片段与每一期电台记录。',
    archiveDemo: '以一次次保存的版本，记录未完成作品的变化。',
    archiveTrack: '已经完成并决定保留下来的音乐作品。',
    archiveNote: '音乐以及日常兴趣旁边发生的文字与影像。',
  },
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const audio = $('#audio');
const background = $('#background-audio');
const seek = $('#seek');
const sharedPlayer = $('#shared-player');
const views = ['#home-view', '#news-view', '#episode-view', '#demo-view', '#track-view', '#note-view', '#not-found'];
let lang = 'en';
let status = 'ready';
let currentMedia = null;
let homeVisibleCount = 5;
let archiveCategory = 'radio';
let archiveYear = 'all';
let recommendationIndex = 0;
let recommendationTimer = 0;
let scrubbing = false;
let playbackRequest = 0;
let brandSection = 'Radio';
let brandAnimation = null;
let sectionFrame = 0;

function formatTime(value) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function displayDate(value) {
  const [year, month, day] = value.split('-');
  if (lang === 'zh') return `${year}.${month}.${day}`;
  return `${Number(day)} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(month) - 1]} ${year}`;
}

function entryText(entry) {
  if (entry.category === 'radio' || entry.category === 'note') return entry[lang];
  if (entry.category === 'demo') return { title: entry.title, note: `${entry.versions.length} ${lang === 'zh' ? '个版本' : 'versions'}` };
  return { title: entry.title, note: entry[lang]?.note || (lang === 'zh' ? '完成作品' : 'finished track') };
}

function allEntries() {
  return [
    ...episodes.map(item => ({ ...item, href: `#episode/${item.id}` })),
    ...demos.map(item => ({ ...item, href: `#demo/${item.id}` })),
    ...tracks.map(item => ({ ...item, href: `#track/${item.id}` })),
    ...notes.map(item => ({ ...item, href: `#note/${item.id}` })),
  ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function brandLabel(value) {
  return value;
}

function setBrandContext(value, force = false) {
  brandSection = value;
  const context = $('#brand-context');
  const label = brandLabel(value);
  if (!force && context.textContent === label) return;
  context.textContent = label;
  context.classList.add('is-visible');
  brandAnimation?.cancel();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    brandAnimation = context.animate(
      [{ opacity: 0, transform: 'translateY(.1em)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 180, easing: 'ease-out' },
    );
  }
}

function setStatus(value) {
  status = value;
  $('#audio-status').textContent = copy[lang][value] || '';
}

function renderCopy() {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
  document.body.dataset.lang = lang;
  $('#site-title').innerHTML = '<span class="title-aima">aima</span>';
  $('#site-title').setAttribute('aria-label', 'aima — home');
  setBrandContext(brandSection, true);
  $$('[data-i18n]').forEach(node => { node.textContent = copy[lang][node.dataset.i18n] || ''; });
  $$('[data-lang]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.lang === lang)));
  $$('.content-nav a').forEach(node => { node.textContent = copy[lang][`nav${node.dataset.category[0].toUpperCase()}${node.dataset.category.slice(1)}`]; });
  seek.setAttribute('aria-label', copy[lang].seek);
  $$('[data-skip]').forEach(button => button.setAttribute('aria-label', lang === 'zh' ? (Number(button.dataset.skip) < 0 ? '后退 5 秒' : '前进 5 秒') : (Number(button.dataset.skip) < 0 ? 'Back 5 seconds' : 'Forward 5 seconds')));
  $('#play-toggle').textContent = audio.paused ? copy[lang].play : copy[lang].pause;
  setStatus(status);
}

function seededRandom(value) {
  let seed = 2166136261;
  for (const char of value) seed = Math.imul(seed ^ char.codePointAt(0), 16777619);
  return () => {
    seed += 0x6d2b79f5;
    let result = seed;
    result = Math.imul(result ^ result >>> 15, result | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

function createDemoGraphic(entry) {
  const graphic = document.createElement('span'); graphic.className = 'entry-graphic demo-graphic'; graphic.setAttribute('aria-hidden', 'true');
  const random = seededRandom(entry.id);
  const versions = entry.versions.slice(-4);
  graphic.style.setProperty('--trunk-x', `${(28 + random() * 12).toFixed(1)}%`);
  const start = 20 + random() * 10;
  const spacing = 14 + random() * 4;
  const branchScale = .8 + random() * .35;
  versions.forEach((_, index) => {
    const node = document.createElement('i');
    node.style.setProperty('--node-y', `${(start + index * spacing + (random() - .5) * 3).toFixed(1)}%`);
    node.style.setProperty('--branch-length', `${(((30 + index * 6) * branchScale + (random() - .5) * 10) / 116 * 100).toFixed(2)}cqw`);
    node.style.setProperty('--branch-angle', `${((index - 1) * 4 + (random() - .5) * 14).toFixed(1)}deg`);
    graphic.append(node);
  });
  return graphic;
}

function createGraphic(entry) {
  if (entry.cover) {
    const image = document.createElement('img'); image.src = entry.cover; image.alt = ''; image.loading = 'lazy'; return image;
  }
  if (entry.category === 'demo') return createDemoGraphic(entry);
  const graphic = document.createElement('span'); graphic.className = `entry-graphic ${entry.category}-graphic`; graphic.setAttribute('aria-hidden', 'true');
  [...entry.title].forEach(char => { const span = document.createElement('i'); span.textContent = char; graphic.append(span); });
  return graphic;
}

function newsCard(entry) {
  const text = entryText(entry);
  const card = document.createElement('a'); card.className = 'news-card reveal'; card.href = entry.href;
  const date = document.createElement('time'); date.className = 'system-type'; date.textContent = displayDate(entry.publishedAt);
  const type = document.createElement('span'); type.className = 'entry-type system-type'; type.textContent = entry.category;
  const body = document.createElement('span'); body.className = 'news-copy';
  const title = document.createElement('strong'); title.textContent = text.title;
  const note = document.createElement('small'); note.className = 'system-type'; note.textContent = [text.note, entry.durationLabel].filter(Boolean).join(' · ');
  body.append(title, note);
  const arrow = document.createElement('span'); arrow.className = 'news-arrow system-type'; arrow.textContent = '↗';
  card.append(date, type, body, createGraphic(entry), arrow);
  return card;
}

function observeReveals(root = document) {
  const observer = new IntersectionObserver(entries => entries.forEach(item => {
    if (item.isIntersecting) { item.target.classList.add('is-visible'); observer.unobserve(item.target); }
  }), { threshold: 0.08 });
  root.querySelectorAll('.reveal:not(.is-visible)').forEach(node => observer.observe(node));
}

function renderHomeNews(append = false) {
  const entries = allEntries();
  const list = $('#home-news-list'); const cards = entries.slice(0, homeVisibleCount);
  if (append) list.append(...cards.slice(list.children.length).map(newsCard));
  else list.replaceChildren(...cards.map(newsCard));
  $('#load-more').hidden = homeVisibleCount >= entries.length;
  observeReveals(list);
}

function recommendationEntries() {
  const latest = episodes[0];
  const extras = [demos[Math.floor(Math.random() * demos.length)], tracks[0], notes[0]].filter(Boolean);
  return [latest, ...extras].map(item => ({ ...item, href: item.category === 'radio' ? `#episode/${item.id}` : `#${item.category}/${item.id}` }));
}

function renderRecommendations() {
  const entries = recommendationEntries();
  const track = $('#recommendation-track'); track.replaceChildren();
  entries.forEach((entry, index) => {
    const text = entryText(entry);
    const link = document.createElement('a'); link.className = 'recommendation'; link.href = entry.href; link.dataset.index = index;
    const visual = document.createElement('span'); visual.className = 'recommendation-visual'; visual.append(createGraphic(entry));
    const meta = document.createElement('span'); meta.className = 'recommendation-meta system-type'; meta.textContent = `${entry.category} / ${displayDate(entry.publishedAt)}`;
    const title = document.createElement('strong'); title.textContent = text.title;
    const hint = document.createElement('span'); hint.className = 'recommendation-hint system-type'; hint.textContent = text.note || '';
    link.append(visual, meta, title, hint); track.append(link);
  });
  recommendationIndex = 0; updateRecommendationCount(); startRecommendationTimer();
}

function updateRecommendationCount() {
  const total = $('#recommendation-track').children.length;
  $('#recommendation-count').textContent = `${String(recommendationIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

function goRecommendation(delta) {
  const track = $('#recommendation-track'); const total = track.children.length;
  recommendationIndex = (recommendationIndex + delta + total) % total;
  track.scrollTo({ left: recommendationIndex * track.clientWidth, behavior: 'smooth' });
  updateRecommendationCount(); startRecommendationTimer();
}

function startRecommendationTimer() {
  clearInterval(recommendationTimer);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  recommendationTimer = setInterval(() => goRecommendation(1), 7000);
}

function renderArchive() {
  const source = allEntries().filter(entry => entry.category === archiveCategory);
  const years = [...new Set(source.map(entry => entry.publishedAt.slice(0, 4)))].sort().reverse();
  const filters = $('#year-filters'); filters.replaceChildren();
  ['all', ...years].forEach(year => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.year = year; button.textContent = year === 'all' ? 'All' : year;
    button.setAttribute('aria-pressed', String(year === archiveYear)); filters.append(button);
  });
  const visible = source.filter(entry => archiveYear === 'all' || entry.publishedAt.startsWith(archiveYear));
  $('#archive-title').textContent = archiveCategory;
  $('#archive-description').textContent = copy[lang][`archive${archiveCategory[0].toUpperCase()}${archiveCategory.slice(1)}`];
  const list = $('#archive-list'); list.replaceChildren(...visible.map(newsCard)); observeReveals(list);
}

function paintProgress(value) {
  const ratio = Math.max(0, Math.min(100, value)); seek.value = ratio; renderCharacterProgress(ratio);
  const seconds = Number.isFinite(audio.duration) ? ratio * audio.duration / 100 : 0;
  $('#current-time').textContent = formatTime(seconds);
  seek.setAttribute('aria-valuetext', `${formatTime(seconds)} / ${formatTime(audio.duration)}`);
}

function renderCharacterProgress(value = Number(seek.value)) {
  const track = $('#progress-text');
  const ratio = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) / 100 : 0;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '14px "Fragment Mono", monospace';
  const cellWidth = context.measureText('░').width + .7;
  const units = Math.max(1, Math.floor(track.clientWidth / cellWidth));
  const cursor = Math.round(ratio * (units - 1));
  track.textContent = '░'.repeat(cursor) + '█' + '░'.repeat(units - cursor - 1);
}

function setNowPlaying(kind, title, href, playing) {
  $('#sound-kind').textContent = kind;
  $('#sound-title').textContent = title;
  $('#now-playing-link').href = href;
  $('.sound-status').classList.toggle('is-playing', playing);
}

function setMedia(media, slot) {
  slot.append(sharedPlayer); sharedPlayer.hidden = false;
  if (currentMedia?.audio !== media.audio) {
    playbackRequest++; audio.pause(); audio.src = media.audio; audio.load(); seek.disabled = true; paintProgress(0);
    $('#duration').textContent = media.durationLabel || '00:00'; $('#audio-direct').href = media.audio; setStatus('loading');
  }
  currentMedia = media;
  setNowPlaying(media.kind, media.label, media.href, !audio.paused);
}

async function playMedia(media, slot) {
  setMedia(media, slot); background.pause(); const request = ++playbackRequest;
  try { await audio.play(); } catch (error) { if (request === playbackRequest && error.name !== 'AbortError') setStatus('error'); }
}

function appendStory(container, item, text) {
  container.dataset.entry = item.id;
  container.replaceChildren(); container.lang = lang === 'zh' ? 'zh-Hans' : 'en';
  const positions = item.photos.map((_, index) => Math.min(text.body.length - 1, Math.floor(index * text.body.length / Math.max(1, item.photos.length))));
  text.body.forEach((value, paragraphIndex) => {
    positions.forEach((position, photoIndex) => {
      if (position !== paragraphIndex) return;
      const photo = item.photos[photoIndex]; const figure = document.createElement('figure'); figure.className = 'story-photo reveal';
      if (item.id === 'oboro' && photo.caption !== 'cover') figure.classList.add('publication-photo');
      const image = document.createElement('img'); image.src = photo.src; image.alt = photo.caption; image.loading = 'lazy';
      const caption = document.createElement('figcaption'); caption.className = 'system-type'; caption.textContent = photo.caption === 'cover' ? `${text.title} / cover` : photo.caption;
      figure.append(image, caption); container.append(figure);
    });
    const paragraph = document.createElement('p'); paragraph.textContent = value; container.append(paragraph);
  });
  observeReveals(container);
}

function renderEpisode(item) {
  const text = item[lang]; $('#episode-date').textContent = `${text.date} / radio / ${item.durationLabel}`;
  $('#episode-title').textContent = text.title; $('#episode-note').textContent = text.note; $('#entry-title').textContent = text.heading;
  appendStory($('#entry-body'), item, text);
  setMedia({ audio: item.audio, durationLabel: item.durationLabel, kind: 'radio', label: text.title, href: `#episode/${item.id}` }, $('#episode-player-slot'));
}

function renderDemo(item) {
  $('#demo-title').textContent = item.title; const tree = $('#demo-tree'); tree.replaceChildren();
  item.versions.forEach((version, index) => {
    const row = document.createElement('button'); row.type = 'button'; row.className = 'demo-version reveal';
    row.dataset.version = index; row.innerHTML = `<span class="tree-node" aria-hidden="true"></span><strong>${version.name}</strong><span class="system-type">${version.modifiedAt} / ${version.durationLabel} / ${version.sizeLabel}</span><i class="system-type">play</i>`;
    tree.append(row);
  });
  const latest = item.versions.at(-1);
  setMedia({ audio: latest.audio, durationLabel: latest.durationLabel, kind: 'demo', label: latest.name, href: `#demo/${item.id}` }, $('#demo-player-slot'));
  observeReveals(tree);
}

function renderTrack(item) {
  $('#track-title').textContent = item.title; $('#track-meta').textContent = `${displayDate(item.publishedAt)} / ${item.durationLabel} / ${item.sizeLabel}`;
  $('#track-description').textContent = item[lang]?.note || '';
  $('#track-cover').src = item.cover || '';
  $('#track-cover').alt = `${item.title} cover`;
  setMedia({ audio: item.audio, durationLabel: item.durationLabel, kind: 'track', label: item.title, href: `#track/${item.id}` }, $('#track-player-slot'));
}

function renderNote(item) {
  const text = item[lang]; $('#note-date').textContent = `${text.date} / note`; $('#note-title').textContent = text.title; $('#note-heading').textContent = text.heading;
  appendStory($('#note-body'), item, text);
}

function hideViews() { views.forEach(selector => { $(selector).hidden = true; }); sharedPlayer.hidden = true; }

function setActiveNav(category = '') {
  $$('.content-nav a').forEach(link => link.setAttribute('aria-current', link.getAttribute('href') === `#news/${category}` ? 'page' : 'false'));
}

let bgmAutoAttempted = false;
let bgmAwaitingGesture = false;
function startHomeBgm() {
  if (!audio.paused || !background.paused) return;
  bgmAwaitingGesture = false;
  background.play().catch(error => {
    if (error.name === 'NotAllowedError') bgmAwaitingGesture = true;
  });
}

document.addEventListener('click', event => {
  if (!bgmAwaitingGesture || $('#home-view').hidden) return;
  if (event.target.closest('#sound-toggle, #play-toggle')) return;
  const link = event.target.closest('a');
  if (link && !['#main', '#about', '#home-news'].includes(link.getAttribute('href'))) return;
  startHomeBgm();
});

function route({ preserveScroll = false } = {}) {
  if (!preserveScroll) hideViews();
  const hash = location.hash || '#main'; const parts = hash.slice(1).split('/'); let title = 'aima Radio'; let focus = null;
  if (parts[0] === 'news' && ['radio', 'demo', 'track', 'note'].includes(parts[1])) {
    archiveCategory = parts[1]; if (!preserveScroll) archiveYear = 'all'; $('#news-view').hidden = false; renderArchive(); setBrandContext(archiveCategory); setActiveNav(archiveCategory); title = `${archiveCategory} — aima Radio`;
  } else if (parts[0] === 'episode') {
    const item = episodes.find(value => value.id === parts[1]); if (item) { $('#episode-view').hidden = false; renderEpisode(item); setBrandContext('radio'); setActiveNav('radio'); title = `${item[lang].title} — aima Radio`; focus = $('#episode-title'); } else $('#not-found').hidden = false;
  } else if (parts[0] === 'demo') {
    const item = demos.find(value => value.id === parts[1]); if (item) { $('#demo-view').hidden = false; renderDemo(item); setBrandContext('demo'); setActiveNav('demo'); title = `${item.title} — aima Radio`; focus = $('#demo-title'); } else $('#not-found').hidden = false;
  } else if (parts[0] === 'track') {
    const item = tracks.find(value => value.id === parts[1]); if (item) { $('#track-view').hidden = false; renderTrack(item); setBrandContext('track'); setActiveNav('track'); title = `${item.title} — aima Radio`; focus = $('#track-title'); } else $('#not-found').hidden = false;
  } else if (parts[0] === 'note') {
    const item = notes.find(value => value.id === parts[1]); if (item) { $('#note-view').hidden = false; renderNote(item); setBrandContext('note'); setActiveNav('note'); title = `${item[lang].title} — aima Radio`; focus = $('#note-title'); } else $('#not-found').hidden = false;
  } else {
    $('#home-view').hidden = false; setBrandContext('Radio'); setActiveNav(''); renderHomeNews(); renderRecommendations();
    if (!preserveScroll && (hash === '#about' || hash === '#home-news')) requestAnimationFrame(() => requestAnimationFrame(() => $(hash)?.scrollIntoView({ block: 'start' })));
  }
  document.title = title; renderCopy();
  if (!$('#home-view').hidden && !bgmAutoAttempted) {
    bgmAutoAttempted = true;
    startHomeBgm();
  }
  if (!preserveScroll && hash !== '#about' && hash !== '#home-news') window.scrollTo(0, 0);
  if (focus && !preserveScroll) focus.focus({ preventScroll: true });
  requestAnimationFrame(updateScrollContext);
}

new ResizeObserver(() => renderCharacterProgress()).observe($('.progress-wrap'));
function updateScrollContext() {
  sectionFrame = 0;
  if ($('#home-view').hidden) return;
  const trigger = window.innerHeight * .34;
  let active = 'Radio';
  $$('.observe-section').forEach(section => {
    if (section.getBoundingClientRect().top <= trigger) active = section.dataset.sectionLabel;
  });
  setBrandContext(active);
}
window.addEventListener('scroll', () => {
  if (!sectionFrame) sectionFrame = requestAnimationFrame(updateScrollContext);
}, { passive: true });
window.addEventListener('resize', updateScrollContext);

$('#load-more').addEventListener('click', () => { homeVisibleCount += 5; renderHomeNews(true); });
$('#recommendation-prev').addEventListener('click', () => goRecommendation(-1));
$('#recommendation-next').addEventListener('click', () => goRecommendation(1));
$('#recommendation-track').addEventListener('scroll', event => {
  const width = event.currentTarget.clientWidth; recommendationIndex = Math.round(event.currentTarget.scrollLeft / width); updateRecommendationCount();
}, { passive: true });
$('#year-filters').addEventListener('click', event => { if (!event.target.dataset.year) return; archiveYear = event.target.dataset.year; renderArchive(); });
$('#demo-tree').addEventListener('click', event => {
  const button = event.target.closest('[data-version]'); if (!button) return;
  const item = demos.find(value => value.id === location.hash.split('/')[1]); const version = item?.versions[Number(button.dataset.version)];
  if (version) playMedia({ audio: version.audio, durationLabel: version.durationLabel, kind: 'demo', label: version.name, href: `#demo/${item.id}` }, $('#demo-player-slot'));
});

$('#play-toggle').addEventListener('click', async () => {
  if (!audio.paused) { playbackRequest++; audio.pause(); return; }
  if (!currentMedia) return; await playMedia(currentMedia, sharedPlayer.parentElement);
});
audio.addEventListener('play', () => { background.pause(); $('#play-toggle').textContent = copy[lang].pause; setNowPlaying(currentMedia.kind, currentMedia.label, currentMedia.href, true); });
audio.addEventListener('pause', () => { $('#play-toggle').textContent = copy[lang].play; if (currentMedia && background.paused) setNowPlaying(currentMedia.kind, currentMedia.label, currentMedia.href, false); });
audio.addEventListener('loadedmetadata', () => { seek.disabled = false; $('#duration').textContent = formatTime(audio.duration); paintProgress(0); setStatus('ready'); });
audio.addEventListener('durationchange', () => { if (Number.isFinite(audio.duration) && audio.duration > 0) { seek.disabled = false; $('#duration').textContent = formatTime(audio.duration); } });
audio.addEventListener('timeupdate', () => { if (!scrubbing && Number.isFinite(audio.duration) && audio.duration > 0) paintProgress(audio.currentTime / audio.duration * 100); });
audio.addEventListener('waiting', () => setStatus('buffering')); audio.addEventListener('playing', () => setStatus('ready')); audio.addEventListener('error', () => setStatus('error'));

seek.addEventListener('pointerdown', event => {
  scrubbing = true; if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const bounds = seek.getBoundingClientRect(); const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  paintProgress(ratio * 100); audio.currentTime = ratio * audio.duration;
});
seek.addEventListener('input', () => { if (Number.isFinite(audio.duration) && audio.duration > 0) { paintProgress(Number(seek.value)); audio.currentTime = Number(seek.value) / 100 * audio.duration; } });
function endScrub() { scrubbing = false; }
$$('[data-skip]').forEach(button => button.addEventListener('click', () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + Number(button.dataset.skip)));
  paintProgress(audio.currentTime / audio.duration * 100);
}));
seek.addEventListener('change', endScrub); window.addEventListener('pointerup', endScrub); window.addEventListener('pointercancel', endScrub);

background.src = siteAudio.src; background.volume = siteAudio.volume;
audio.addEventListener('play', () => { bgmAutoAttempted = true; bgmAwaitingGesture = false; });
background.addEventListener('play', () => { bgmAwaitingGesture = false; });
background.addEventListener('play', () => { audio.pause(); setNowPlaying('background', siteAudio.label, siteAudio.href, true); });
background.addEventListener('pause', () => { if (audio.paused) setNowPlaying('background', siteAudio.label, siteAudio.href, false); });
$('#sound-toggle').addEventListener('click', async () => {
  bgmAutoAttempted = true; bgmAwaitingGesture = false;
  if (!audio.paused) { audio.pause(); return; }
  if (!background.paused) { background.pause(); return; }
  if (currentMedia && !sharedPlayer.hidden) { await playMedia(currentMedia, sharedPlayer.parentElement); return; }
  try { await background.play(); } catch { setStatus('error'); }
});

$$('[data-lang]').forEach(button => button.addEventListener('click', () => {
  const scrollPosition = { left: window.scrollX, top: window.scrollY };
  lang = button.dataset.lang;
  route({ preserveScroll: true });
  const previousBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(scrollPosition);
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = previousBehavior;
    updateScrollContext();
  });
}));
function applyTheme(theme) {
  const backgroundColor = theme === 'dark' ? '#000000' : '#f8f9f7';

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.body.dataset.theme = theme;
  $$('.theme-switch [data-theme]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.theme === theme)));
  // Compatibility for browsers that honor theme-color; not a Safari repaint API.
  $('#safari-theme-color').setAttribute('content', backgroundColor);
}
applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
$$('.theme-switch [data-theme]').forEach(button => button.addEventListener('click', () => {
  applyTheme(button.dataset.theme);
  try { localStorage.setItem('aima-theme', button.dataset.theme); } catch {}
}));
$('.skip-link').addEventListener('click', event => { event.preventDefault(); $('#main').focus(); $('#main').scrollIntoView(); });
$('.site-footer a').addEventListener('click', event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
window.addEventListener('hashchange', () => route());
$('#year').textContent = new Date().getFullYear();
$('#brand-context').classList.add('is-visible');
setNowPlaying('background', siteAudio.label, siteAudio.href, false);
route();
