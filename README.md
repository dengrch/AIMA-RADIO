# 合間電台 / AIMA RADIO

静态音乐档案：首页 news → 单期播放与图文；about 使用电台封面。
支持中英文、明暗切换，标题为 `aima RADIO`。无需安装依赖。

## 本地预览

运行 `node tools/serve.mjs`，打开 http://127.0.0.1:4173。

## 新增内容

编辑 `content.js` 中的 `episodes`：

- `id`：唯一名称，对应 `#episode/<id>`。
- `category`：`radio`、`demo` 或 `notes`。
- `audio`：GitHub Release 的稳定下载地址；纯文字记录可省略。
- `durationLabel`：加载前的时长，加载后使用实际音频时长。
- `publishedAt`：真实发布日期；内容按发布日期倒序排列。
- `cover`：首页正方形封面；`photos`：内页全部图片。
- `en` / `zh`：`title`、`heading`、`date`、`note`、`body`（段落数组）。
- 标题保留录音日期，例如 `20260125 - Sazanami`；列表日期为发布日期。
- `bodyLang` 可指定尚未翻译的正文语言，asleep 暂保留中文原文。

## Release 音频

音频只上传到 GitHub Releases，不提交到 Git，也不进入 Pages 构建产物。
`opt/` 和 `assets/audio/` 都被忽略，本地文件仍然保留。
当前 Sazanami 使用既有 Release 地址；asleep 预留为 `20241115-asleep.mp3`，需先把同名文件补传到 `v1.0.0-beta` Release，再发布页面。上传完成后使用 Release 返回的 `browser_download_url`，不要使用跳转后的临时签名地址。

字符进度条 `░░░█░░░` 随宽度自动调整字符数，支持点击、触摸和键盘。
保留加载、缓冲、失败提示和直接打开音频链接。用户需要主动点击播放。
Release 链接有跨域重定向，移动网络仍可能无法访问下载域名；
前端不能解决域名连通性问题，移动端恢复播放尚需真机验证。

## 首页背景音乐

`content.js` 的 `siteAudio.src` 可填写背景音乐 Release 下载地址。
留空显示「筹备中」。配置后点击开启、循环播放，和节目互斥播放。

## 发布

`node tools/build.mjs` 生成 `_site/`，只包含站点文件与图片、视频等公开资源，排除音频目录。
推送 `main` 会触发 `.github/workflows/jekyll-gh-pages.yml` 部署到 GitHub Pages。
Pages 设置应选择 **GitHub Actions**。
