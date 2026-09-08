# 合間電台 / AIMA RADIO

静态音乐档案：首页 news → 单期播放与图文；about 使用电台封面。
支持中英文、明暗切换，标题为 `aima RADIO`。无需安装依赖。

## 本地预览

运行 `node tools/serve.mjs`，打开 http://127.0.0.1:4173。

## 新增内容

本地素材按 `opt/radio`、`opt/demo`、`opt/track`、`opt/note` 分类。执行 `node tools/import-content.mjs` 生成 `content.js`、网页图片与音频元数据文档。完整步骤见 `opt/网站更新流程.md`。

## R2 音频

音频上传到 Cloudflare R2 的 `radio/`，由 `https://audio.aimaradio.com` 提供，不提交到 Git，也不进入 Pages 构建产物。`opt/` 中只有更新流程进入版本控制，原始素材保留在本地。

字符进度条 `░░░█░░░` 随宽度自动调整字符数，支持点击、触摸和键盘。
保留加载、缓冲、失败提示和直接打开音频链接。用户需要主动点击播放。
播放器使用 R2 自定义域名，支持电脑与手机浏览器。

## 首页背景音乐

主页背景音乐使用第一期 Oboro，点击后循环播放，并与节目播放器互斥。

## 发布

`node tools/build.mjs` 生成 `_site/`，只包含站点文件与图片、视频等公开资源，排除音频目录。
推送 `main` 会触发 `.github/workflows/jekyll-gh-pages.yml` 部署到 GitHub Pages。
Pages 设置应选择 **GitHub Actions**。
