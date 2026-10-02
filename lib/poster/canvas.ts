// Canvas helpers shared by every poster style. Browser-only.

import { balance } from "../balance";

export interface PosterFonts {
  /** Quoted font-family names of the real web fonts (no fallbacks). */
  urdu: string;
  ui: string;
}

export interface PosterColors {
  paper: string;
  ink: string;
  inkMuted: string;
  accent: string;
}

const primaryFamily = (list: string) => list.split(",")[0].trim().replace(/^["']|["']$/g, "");

/**
 * Fonts and colours come from the same CSS variables as the page (tokens).
 * Only the real web font is used: next/font's fallback faces point at
 * local("Arial"), which many phones lack, and a poster must never fall back.
 */
export function readTheme(): { fonts: PosterFonts; colors: PosterColors } {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const family = (name: string) => `"${primaryFamily(v(name))}"`;
  return {
    fonts: { urdu: family("--font-noto-nastaliq-urdu"), ui: family("--font-atkinson-hyperlegible") },
    colors: {
      paper: v("--color-paper"),
      ink: v("--color-ink"),
      inkMuted: v("--color-ink-muted"),
      accent: v("--color-accent"),
    },
  };
}

/**
 * Loads every font a poster draws with, for the exact text it will draw.
 * Resolves false if a real web font is missing, so the canvas never falls
 * back to a system font.
 */
export async function loadPosterFonts(
  fonts: PosterFonts,
  text: { urdu: string; ui: string },
): Promise<boolean> {
  const requests: [string, string, string][] = [
    [`400 48px ${fonts.urdu}`, text.urdu, primaryFamily(fonts.urdu)],
    [`400 48px ${fonts.ui}`, text.ui, primaryFamily(fonts.ui)],
    [`700 48px ${fonts.ui}`, text.ui, primaryFamily(fonts.ui)],
  ];
  try {
    const results = await Promise.all(requests.map(([font, t]) => document.fonts.load(font, t)));
    return results.every((faces, i) => faces.some((f) => primaryFamily(f.family) === requests[i][2]));
  } catch {
    return false;
  }
}

export const font = (weight: 400 | 700, px: number, family: string) => `${weight} ${px}px ${family}`;

export interface CoupletFit {
  fontSize: number;
  /** Shared line width (the wider line's natural width at fontSize). */
  width: number;
  stretch: boolean;
  /** Tallest real glyph extents of the two lines, from the baseline. */
  ascent: number;
  descent: number;
  /** Ink that reaches past the line box on each side (e.g. the stroke of ک). */
  overhangLeft: number;
  overhangRight: number;
}

/**
 * The couplet balancing rule, measured on the canvas. Fits the real glyph
 * bounds, not just advance widths: Nastaliq strokes can overhang the line box
 * by a third of an em, and they must never reach the poster's edge.
 */
export function fitCouplet(
  ctx: CanvasRenderingContext2D,
  lines: readonly [string, string],
  family: string,
  baseSize: number,
  maxWidth: number,
): CoupletFit {
  const measure = (size: number) => {
    ctx.font = font(400, size, family);
    ctx.direction = "rtl";
    ctx.textAlign = "right"; // anchor = right edge of the line box
    const m = lines.map((l) => ctx.measureText(l));
    return {
      widths: m.map((x) => x.width) as [number, number],
      // Each line is drawn across the same box, so overhang is relative to it.
      left: Math.max(0, ...m.map((x) => x.actualBoundingBoxLeft - x.width)),
      right: Math.max(0, ...m.map((x) => x.actualBoundingBoxRight)),
      ascent: Math.max(...m.map((x) => x.actualBoundingBoxAscent)),
      descent: Math.max(...m.map((x) => x.actualBoundingBoxDescent)),
    };
  };

  const base = measure(baseSize);
  const wider = Math.max(...base.widths);
  // Everything scales linearly, so give balance() the room left for the
  // box once the overhangs (at the same scale) are accounted for.
  const room = (maxWidth * wider) / (wider + base.left + base.right);
  const { scale, stretch } = balance(base.widths, room);

  const fontSize = baseSize * scale;
  const fitted = measure(fontSize);
  return {
    fontSize,
    width: Math.max(...fitted.widths),
    stretch,
    ascent: fitted.ascent,
    descent: fitted.descent,
    overhangLeft: fitted.left,
    overhangRight: fitted.right,
  };
}

/**
 * Draws one Urdu line across [left, left + width]. Justified lines widen the
 * word spaces only (each word drawn whole, right to left); never letter-spacing.
 * Unjustified lines are natural and centred. ctx.font must already be set.
 */
export function drawUrduLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  left: number,
  width: number,
  baseline: number,
  justify: boolean,
) {
  ctx.direction = "rtl";
  const words = text.split(" ").filter(Boolean);
  if (!justify || words.length < 2) {
    ctx.textAlign = "center";
    ctx.fillText(text, left + width / 2, baseline);
    return;
  }
  const widths = words.map((w) => ctx.measureText(w).width);
  const gap = (width - widths.reduce((a, b) => a + b, 0)) / (words.length - 1);
  ctx.textAlign = "right";
  let x = left + width;
  words.forEach((word, i) => {
    ctx.fillText(word, x, baseline);
    x -= widths[i] + gap;
  });
}

/** Greedy word wrap for Latin text at the current ctx.font. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Real glyph height of Latin text at the current ctx.font. */
export function latinExtents(ctx: CanvasRenderingContext2D, sample = "ÅHgjpqy") {
  const m = ctx.measureText(sample);
  return { ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent };
}
