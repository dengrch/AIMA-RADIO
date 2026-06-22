const copy = {
  en: {
    siteTitle: "AIMA RADIO",
    navArchive: "archive",
    navText: "text",
    navPhotos: "photos",
    labelText: "text",
    labelArchive: "archive",
    themeLight: "light",
    themeDark: "dark",
    play: "PLAY",
    pause: "STOP"
  },
  zh: {
    siteTitle: "合間電台",
    navArchive: "存檔",
    navText: "文字",
    navPhotos: "照片",
    labelText: "文字",
    labelArchive: "存檔",
    themeLight: "亮",
    themeDark: "暗",
    play: "播放",
    pause: "停止"
  }
};

const episodes = [
  {
    id: "sazanami",
    audio: "assets/audio/sazanami.m4a",
    durationLabel: "07:41",
    photos: [
      "assets/images/sazanami-01.jpg",
      "assets/images/sazanami-02.jpg",
      "assets/images/sazanami-03.jpg"
    ],
    en: {
      title: "Sazanami",
      heading: "Improvisation",
      date: "25 Jan 2026",
      note: "improvisation / texture / afterthought",
      body: [
        "This episode is something left from before the new year. The harmonic choices share some vocabulary with the previous episode, but the switching, arrangement, and texture are quite different.",
        "Calling it texture may be too generous. It is closer to a set of habits in the hands. The amount of playing is objectively sparse, and the imagination of the texture is limited. Once I move away from those habits and try another pattern, the beat can slip or the feel turns bad, especially at a higher BPM. I was not thinking that much while playing. I just enjoyed it first. Still, texture is clearly one of the biggest directions for growth.",
        "The opening talk usually introduces the basic state of the piece, then drifts into music, recent life, and other loose thoughts. I borrowed that structure from the podcast Basic Harmless. The longer wall of text later is where the part of me that wants to expose itself gets temporarily satisfied. That, too, is a basically harmless behavior.",
        "I do write things from time to time in notes and journals. But after a journaling app crashed and deleted a very long paragraph I was still editing, I stopped writing for a while. Maybe stopping is healthier. In any case, this is not exactly a diary. Parts of the radio text may come from there, but not all of it. Accumulated thought needs somewhere to go. It is too suffocating to keep imagining that one day there will be a natural or cultivated occasion for deep communication with another person.",
        "Maybe long thoughts will one day be spoken naturally to someone, or published inside some private or public bonsai-like space. That fantasy lets the impulse to expose myself calm down for a while, so in actual social life I can keep control over how much of myself is revealed.",
        "When the feeling of the present settles and becomes text, music, or another object, the mechanism is probably something like this. Anxiety and insecurity can push a person to expose thought in order to release inner pressure. That is not the same as a real desire to express. Distinguishing the two matters.",
        "The text in the radio should come closer to expression. It may not be literary, interesting, or universal, but at least it has passed through thought. It is a way of turning emotion into conscious experience through reason, just like the music.",
        "This can only happen after a stretch of negative emotion has passed, or during a gap in the middle of running around. That is also where the name Aima comes from.",
        "Maybe this is a sign of the non-readymade nature of the reality we live in. To quote a line from the previous episode: people at the center of adversity do not truly treat adversity as survivorship bias, and neither do people in favorable circumstances. I still like that sentence. The fragility of civilization only truly appears after civilization collapses; the fragility of a person only after death; the fragility of feeling only after a relationship breaks.",
        "It may be only in the interval after something has ended that we can feel a little closer to the real world and to ourselves.",
        "I suddenly remembered high school at Yali. Those were days when a pure desire to express overwhelmed decline, days when deep conversations belonging to nature could appear anytime, anywhere. They were also the days when my worldview was being opened up. Maybe after growing up, more thoughts no longer need so many other eyes observing them. Maybe not. What seems foreseeable is that the days belonging to nature are gradually passing, and you and I both need to learn to embrace the bonsai."
      ]
    },
    zh: {
      title: "Sazanami",
      heading: "即兴演奏",
      date: "2026.01.25",
      note: "即兴 / 织体 / 间隔",
      body: [
        "这一期是年前的存货，和声选择方面其实和上一期有些相同的语彙搭配，但是选择了相当不同的切换、编排和织体。",
        "说是织体，倒不如说是手癖，甚至说是笔者手癖精华都不为过 x。总之是很简单的织体了，演奏量少是很客观的，织体想象力太过受限，而且一旦偏离手癖开始尝试其他排列，又会不可避免地掉拍或者出现不好的听感，尤其在高 bpm 的情况下。当然当时弹的时候没想这么多，自己先爽了再说。咳，织体确实是一个非常非常大的进化方向了。",
        "开头的这种杂谈往往会简单介绍一下曲子的基本情况，然后很随意地讲一些音乐的想法，生活的近况等等，参考了播客《基本无害》的结构；往往到了后面的长篇壁画，才能让我心里那个“暴露狂”被满足，这也是种基本无害的行为。",
        "我平时的确会有意无意写一些东西，在备忘录和手记里。不过自从好像是上上个月手记 app 出 bug 闪退删掉了我还在编辑中的超长一大段文字之后，感觉被 cz，就一直养胃了，停笔断更到现在。不过想想或许断更才是一种更健康的现象吧。",
        "总之这并不属于所谓日记类的东西，电台中的部分内容会部分取材参考自这里，不过并不是全部。积压的思想总要释放，不能老憋着幻想着有一天会有一个或是“自然”或是“盆景”的与他人深度沟通的场合，那就太压抑了。",
        "幻想某天，长篇大论的想法会在“自然”中向某人诉说，或者在私域甚至公域的“盆景”里发表出来。基于这种念头，“暴露癖”才能被暂时性地满足，从而能够办到在现实生活的真正社交中实现绝对的对自我暴露的控制。",
        "这样以后，当下的情绪与感受沉淀下来，形成文字或别的什么实体，原理大概就是像这样吧。这种念头不是平白无故产生的，当焦虑与不安全感太强，人会倾向于通过“暴露”思想来减轻内在的压力，而这并不是真正的表达欲，区分它们是很有必要的事情。",
        "电台里写的东西需要是更偏向表达欲的那部分，即便可能没有任何文学性、趣味性，或者普适性，但起码它们是我过了脑子的东西，是通过理智将情绪转化为意识体验的手段，就和这些音乐一样。",
        "这件事能且仅能在度过某一段负面情绪之后做，或者说在埋头奔走的空档中进行，这也是你台名字「合間」的由来了。",
        "这其实是我们所生活的现实的非现成性的体现。引用下上期的一句：「身处逆境中心的人是不会真的把逆境当作生活的幸存者偏差的，身处顺境的人同样。」我其实还挺喜欢这句的 x。文明的脆弱性只有在文明毁灭之后才能真正体现出来，人的脆弱性只有在人死亡之后才能体现出来，感情的脆弱性只有在关系断裂之后才能体现出来。",
        "好像的确只有在前置结束后的间隔中，才能体会到更接近真实的世界和自己。",
        "突然又回想起了高中在雅礼的日子，那是纯粹的表达欲极大地盖过没落情绪的日子，是随时随地都能生发出真正属于“自然”的深度沟通的日子，也是我世界观拓荒的日子。或许长大以后更多的思想并不需要太多他人的眼睛观测。或许不是。不过可预见的是，属于“自然”的日子正在逐渐过去，你我都需要学着拥抱“盆景”。"
      ]
    }
  }
];

const audio = document.querySelector("#audio");
const playToggle = document.querySelector("#play-toggle");
const seek = document.querySelector("#seek");
const progressText = document.querySelector("#progress-text");
const currentTime = document.querySelector("#current-time");
const duration = document.querySelector("#duration");
const episodeTitle = document.querySelector("#episode-title");
const episodeDate = document.querySelector("#episode-date");
const entryTitle = document.querySelector("#entry-title");
const entryBody = document.querySelector("#entry-body");
const episodeList = document.querySelector("#episode-list");
const photos = document.querySelector("#photos");
const siteTitle = document.querySelector("#site-title");
const langButtons = document.querySelectorAll("[data-lang]");
const themeButtons = document.querySelectorAll("button[data-theme]");

let activeEpisodeId = episodes[0].id;
let lang = "en";
let theme = "light";
const progressUnits = 58;

function formatTime(value) {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderProgress(ratio = 0) {
  const cursor = Math.round(Math.max(0, Math.min(1, ratio)) * (progressUnits - 1));
  progressText.textContent = Array.from({ length: progressUnits }, (_, index) => {
    return index === cursor ? "█" : "░";
  }).join("");
}

function activeEpisode() {
  return episodes.find((item) => item.id === activeEpisodeId) || episodes[0];
}

function renderStaticCopy() {
  const dict = copy[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
  document.body.dataset.lang = lang;
  document.body.dataset.theme = theme;
  document.title = dict.siteTitle;
  siteTitle.textContent = dict.siteTitle;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = dict[node.dataset.i18n];
  });
  playToggle.textContent = audio.paused ? dict.play : dict.pause;
}

function renderBody(paragraphs) {
  entryBody.innerHTML = "";
  paragraphs.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    entryBody.append(paragraph);
  });
}

function renderPhotos(episode) {
  photos.innerHTML = "";
  episode.photos.forEach((src, index) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = src;
    image.alt = `${episode[lang].title} photo ${index + 1}`;
    figure.append(image);
    photos.append(figure);
  });
}

function renderEpisodes() {
  episodeList.innerHTML = "";

  episodes.forEach((episode) => {
    const localized = episode[lang];
    const button = document.createElement("button");
    button.className = "episode-card";
    button.type = "button";
    button.dataset.episode = episode.id;
    button.innerHTML = `
      <time>${localized.date}</time>
      <span>
        <strong>${localized.title}</strong>
        <small>${localized.note}</small>
      </span>
      <span>${episode.durationLabel}</span>
    `;

    button.addEventListener("click", () => selectEpisode(episode.id, true));
    episodeList.append(button);
  });

  markActiveEpisode();
}

function markActiveEpisode() {
  document.querySelectorAll(".episode-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.episode === activeEpisodeId);
  });
}

function selectEpisode(id, shouldScroll = false) {
  const episode = episodes.find((item) => item.id === id);
  if (!episode) return;

  activeEpisodeId = id;
  const localized = episode[lang];
  const sourceChanged = audio.getAttribute("src") !== episode.audio;

  if (sourceChanged) {
    audio.pause();
    audio.src = episode.audio;
    audio.load();
    seek.value = 0;
    currentTime.textContent = "00:00";
    renderProgress(0);
  }

  episodeTitle.textContent = localized.title;
  episodeDate.textContent = `${localized.date} · ${episode.durationLabel}`;
  entryTitle.textContent = localized.heading;
  duration.textContent = episode.durationLabel;
  if (!Number.isFinite(audio.duration) || audio.currentTime === 0) {
    renderProgress(0);
  }
  renderBody(localized.body);
  renderPhotos(episode);
  renderEpisodes();
  renderStaticCopy();

  if (audio.paused) {
    playToggle.classList.remove("is-playing");
    playToggle.setAttribute("aria-label", "Play");
  }

  if (shouldScroll) {
    document.querySelector("#listen").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setLanguage(nextLang) {
  lang = nextLang;
  langButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  });
  selectEpisode(activeEpisodeId);
}

function setTheme(nextTheme) {
  theme = nextTheme;
  document.body.dataset.theme = theme;
  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.theme === theme));
  });
}

playToggle.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
      playToggle.classList.add("is-playing");
      playToggle.textContent = copy[lang].pause;
      playToggle.setAttribute("aria-label", "Pause");
    } catch {
      playToggle.classList.remove("is-playing");
      playToggle.textContent = copy[lang].play;
      playToggle.setAttribute("aria-label", "Play");
    }
    return;
  }

  audio.pause();
  playToggle.classList.remove("is-playing");
  playToggle.textContent = copy[lang].play;
  playToggle.setAttribute("aria-label", "Play");
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
  renderProgress(0);
});

audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration)) return;
  const ratio = audio.currentTime / audio.duration;
  seek.value = ratio * 100;
  currentTime.textContent = formatTime(audio.currentTime);
  renderProgress(ratio);
});

audio.addEventListener("ended", () => {
  playToggle.classList.remove("is-playing");
  playToggle.textContent = copy[lang].play;
  playToggle.setAttribute("aria-label", "Play");
});

seek.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration)) return;
  const ratio = Number(seek.value) / 100;
  audio.currentTime = ratio * audio.duration;
  renderProgress(ratio);
});

langButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.theme));
});

setTheme(theme);
renderProgress(0);
renderStaticCopy();
selectEpisode(activeEpisodeId);
