# Sample Overlay Generator

A small [Remotion](https://www.remotion.dev) sample for the write-up **Motion graphics made easy: Stitch + Remotion + Cursor**.

It is a public, simplified pipeline: write the look down, turn it into React compositions, then render a transparent clip you drop on footage. It is not a pixel-perfect copy of a private channel toolkit.

```text
DESIGN.md + design-sample/  →  Remotion comps  →  overlays CLI  →  NLE
```

## What you get

| Composition  | Job                                                              |
| ------------ | ---------------------------------------------------------------- |
| `LowerThird` | Guest / place / note card. Same glass, new props.                |
| `PriceCard`  | Count-up price. Live USD conversion at render time (not an LLM). |
| `Chart`      | Highcharts reveal (line, spline, area, column, pie, gantt).      |
| `Turntable`  | BabylonJS mesh, one frame at a time. Remotion owns the clock.    |

All four render at **1920×1080 @ 30fps** on a transparent canvas.

## Setup

Needs Node 18+, Chrome/Chromium, and FFmpeg (Remotion will prompt if FFmpeg is missing).

```bash
npm install
npm run dev
```

Studio is the preview. Open `design-sample/index.html` in a browser if you want the static layout the compositions copy.

## Render

Mac encodes **ProRes 4444** `.mov`. Other platforms encode **VP9** `.webm`. Both use PNG frames so the alpha survives.

Prompt CLI (Enter keeps the default in brackets):

```bash
npm run overlays
# or, from this repo:
npx overlays
```

Agent / script door — same questions, already answered:

```bash
npx overlays --no-prompt --composition lower-third --props-file props/lower-third.json
npx overlays --no-prompt --composition price-card --props-file props/price-card.json
npx overlays --no-prompt --composition chart --props-file props/chart.json
npx overlays --no-prompt --composition turntable --props-file props/turntable.json
```

Raw Remotion, as in the article:

```bash
npx remotion render src/index.ts LowerThird out/mika.mov \
  --props '{"kicker":"GUEST","title":"Mika Tanaka","subtitle":"Chef · Osaka","kind":"person","durationInSeconds":5}' \
  --codec prores \
  --prores-profile 4444 \
  --image-format png \
  --pixel-format yuva444p10le
```

On Windows / Linux, swap the codec flags for `--codec vp9 --image-format png --pixel-format yuva420p` and a `.webm` path.

## In the editor

The file is not enough. After you drop the clip on the timeline, tell the NLE it has an alpha channel:

- Premiere / After Effects: Interpret Footage → Alpha
- DaVinci: clip attributes → Alpha mode
- Others: look for transparency / composite

If you leave that off, a perfect ProRes 4444 still shows as a black box.

## Design source

- [`DESIGN.md`](DESIGN.md) — tokens, type, motion
- [`design-sample/`](design-sample/) — static HTML/CSS snapshot (reference, not a Remotion target)

Point a coding LLM at those two files when you add a new overlay. Change the tokens once; keep the motion.

## Licenses

- This repo is MIT.
- [Highcharts](https://www.highcharts.com) is **not** MIT. It is free for non-commercial use; you need a Highcharts license for commercial work. Swap the chart component if that does not fit.
- Sora and JetBrains Mono are loaded from Google Fonts (OFL).
