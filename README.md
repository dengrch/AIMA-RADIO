# 合間電台

Personal static website prototype for an ambient improvisation radio archive.

## Local Preview

Open `index.html` directly in a browser, or serve the folder with any static server.

## Publishing Notes

This site is ready for GitHub Pages because it uses plain HTML, CSS, JavaScript and relative asset paths.

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, then select the `main` branch and `/ (root)`. After saving, the project site will be published at:

```text
https://dengrch.github.io/AIMA-RADIO/
```

The empty `.nojekyll` file tells GitHub Pages to publish the static files directly without Jekyll processing.

## Release-hosted Audio

Upload episode audio as a GitHub Release asset. Once the upload has completed, replace the episode's `audio` value in `script.js` with the asset URL shown by the Release:

```js
audio: "https://github.com/dengrch/AIMA-RADIO/releases/download/<tag>/<filename>"
```

For example, a tag named `audio-v1` and an asset named `sazanami.m4a` produce:

```js
audio: "https://github.com/dengrch/AIMA-RADIO/releases/download/audio-v1/sazanami.m4a"
```

Do not remove the tracked file in `assets/audio/` until the Release asset URL works in a browser. After switching `script.js`, remove the repository copy with `git rm --cached assets/audio/<filename>`; the `.gitignore` prevents it from being added again.
