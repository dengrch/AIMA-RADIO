# 合間電台

Personal static website prototype for an ambient improvisation radio archive.

## Local Preview

Open `index.html` directly in a browser, or serve the folder with any static server.

## Publishing Notes

This site is ready for GitHub Pages because it uses plain HTML, CSS, JavaScript and local assets.

For real episodes, upload audio files to GitHub Releases and replace the `audio` value in `script.js`:

```js
audio: "https://github.com/<user>/<repo>/releases/download/<tag>/<file>.mp3"
```

Each episode can also carry title, date, duration, short note and source label in the same data object.
