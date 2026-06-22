const { spawn } = require("child_process");

const width = 640;
const height = 360;
const fps = 24;
const seconds = 14;
const frames = fps * seconds;
const out = "assets/video/aima-light.mp4";

const ffmpeg = spawn("ffmpeg", [
  "-y",
  "-f", "rawvideo",
  "-pixel_format", "rgb24",
  "-video_size", `${width}x${height}`,
  "-framerate", String(fps),
  "-i", "-",
  "-vf", "gblur=sigma=2.6,format=yuv420p",
  "-c:v", "libx264",
  "-preset", "slow",
  "-crf", "24",
  "-movflags", "+faststart",
  out
], { stdio: ["pipe", "inherit", "inherit"] });

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lineDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy || 1;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / len, 0, 1);
  const x = ax + t * dx;
  const y = ay + t * dy;
  return Math.hypot(px - x, py - y);
}

function leaf(px, py, cx, cy, rx, ry, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = px - cx;
  const y = py - cy;
  const u = (x * cos + y * sin) / rx;
  const v = (-x * sin + y * cos) / ry;
  return u * u + v * v;
}

for (let frame = 0; frame < frames; frame += 1) {
  const t = frame / fps;
  const loop = (Math.sin((t / seconds) * Math.PI * 2) + 1) * 0.5;
  const sway = Math.sin(t * 0.42) * 18 + Math.sin(t * 0.17) * 9;
  const drift = Math.cos(t * 0.31) * 11;
  const buffer = Buffer.alloc(width * height * 3);

  const branches = [
    [70 + sway, -16, 244 + drift, 214],
    [386 + drift, -24, 248 + sway * 0.42, 184],
    [598 + sway * 0.42, 18, 438 + drift, 168],
    [690 + drift, 122, 468 + sway * 0.2, 260]
  ];

  const leaves = [
    [136 + sway, 88 + drift, 36, 12, 0.75],
    [216 + sway * 0.65, 142, 42, 13, -0.42],
    [302 + drift, 84 + sway * 0.25, 34, 11, 0.18],
    [406 + drift, 112, 40, 13, -0.8],
    [486 + sway * 0.4, 62 + drift, 35, 11, 0.5],
    [552 + sway * 0.55, 158, 46, 14, -0.3],
    [596 + drift * 0.5, 226 + sway * 0.16, 50, 15, 0.4]
  ];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / width;
      const ny = y / height;
      let shade = 0;

      for (const branch of branches) {
        const d = lineDistance(x, y, ...branch);
        shade += Math.exp(-(d * d) / 280) * 0.24;
      }

      for (const item of leaves) {
        const d = leaf(x, y, item[0], item[1], item[2], item[3], item[4] + loop * 0.18);
        shade += Math.exp(-d * 2.45) * 0.23;
      }

      const warmth = 1 - ny * 0.07 + nx * 0.018;
      const veil = 1 - clamp(shade, 0, 0.5);
      const r = clamp(238 * warmth * veil + 12, 0, 255);
      const g = clamp(231 * warmth * veil + 11, 0, 255);
      const b = clamp(218 * warmth * veil + 9, 0, 255);
      const i = (y * width + x) * 3;
      buffer[i] = r;
      buffer[i + 1] = g;
      buffer[i + 2] = b;
    }
  }

  ffmpeg.stdin.write(buffer);
}

ffmpeg.stdin.end();
