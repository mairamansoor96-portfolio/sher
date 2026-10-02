import { drawUrduLine, fitCouplet, font, latinExtents, wrapText } from "@/lib/poster/canvas";
import type { Box, PosterContent, PosterStyle } from "./types";

/**
 * The provisional placeholder style: paper background, ink couplet centred,
 * optional Roman and meaning, credit at the foot. No decoration.
 * All sizes are fractions of the poster width, so every size scales alike.
 */
export const plainStyle: PosterStyle = {
  id: "plain",
  label: "Plain",
  render(ctx, c) {
    const { width: W, height: H, colors } = c;
    const margin = Math.round(W * 0.09);
    const contentW = W - 2 * margin;

    ctx.fillStyle = colors.paper;
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "alphabetic";
    ctx.letterSpacing = "0px";

    // Credit, always on, anchored to the bottom margin.
    const creditTop = drawCredit(ctx, c, margin);
    const top = margin;
    const available = creditTop - margin * 0.75 - top;

    // Shrink the couplet group together until it fits above the credit.
    let k = 1;
    let plan = planBody(ctx, c, contentW, k);
    while (plan.height > available && k > 0.3) {
      k *= 0.95;
      plan = planBody(ctx, c, contentW, k);
    }
    const urdu = plan.draw(top + Math.max(0, (available - plan.height) / 2));
    return { margin, fontSize: plan.fontSize, stretch: plan.stretch, urdu };
  },
};

function planBody(ctx: CanvasRenderingContext2D, c: PosterContent, contentW: number, k: number) {
  const { width: W, fonts, colors, sher } = c;
  const fit = fitCouplet(ctx, sher.lines, fonts.urdu, W * 0.075 * k, contentW);
  // Centre the ink, not just the line box.
  const left = (W - fit.width - fit.overhangLeft - fit.overhangRight) / 2 + fit.overhangLeft;
  const urduH = fit.ascent + fit.descent;

  const romanSize = W * 0.03 * k;
  ctx.font = font(400, romanSize, fonts.ui);
  ctx.direction = "ltr";
  const roman = c.roman ? sher.roman.map((r) => wrapText(ctx, r, fit.width)) : null;
  const romanExt = latinExtents(ctx);
  const romanLH = romanSize * 1.35;
  const romanH = (n: number) => (n - 1) * romanLH + romanExt.ascent + romanExt.descent;

  const meaningSize = W * 0.034 * k;
  ctx.font = font(400, meaningSize, fonts.ui);
  const meaning = c.meaning ? wrapText(ctx, sher.meaningEn, contentW) : [];
  const meaningExt = latinExtents(ctx);
  const meaningLH = meaningSize * 1.4;
  const meaningH = meaning.length
    ? (meaning.length - 1) * meaningLH + meaningExt.ascent + meaningExt.descent
    : 0;

  const toRoman = fit.fontSize * 0.25;
  const betweenLines = fit.fontSize * 0.45;
  const toMeaning = fit.fontSize * 0.9;

  let height = 2 * urduH + betweenLines;
  if (roman) height += 2 * toRoman + romanH(roman[0].length) + romanH(roman[1].length);
  if (meaning.length) height += toMeaning + meaningH;

  const draw = (y: number): Box[] => {
    const boxes: Box[] = [];
    for (let i = 0; i < 2; i++) {
      ctx.font = font(400, fit.fontSize, fonts.urdu);
      ctx.fillStyle = colors.ink;
      drawUrduLine(ctx, sher.lines[i], left, fit.width, y + fit.ascent, fit.stretch);
      boxes.push({ top: y, bottom: y + urduH, left, right: left + fit.width });
      y += urduH;
      if (roman) {
        y += toRoman;
        ctx.font = font(400, romanSize, fonts.ui);
        ctx.fillStyle = colors.inkMuted;
        ctx.direction = "ltr";
        ctx.textAlign = "left";
        roman[i].forEach((line, j) => ctx.fillText(line, left, y + romanExt.ascent + j * romanLH));
        y += romanH(roman[i].length);
      }
      if (i === 0) y += betweenLines;
    }
    if (meaning.length) {
      y += toMeaning;
      ctx.font = font(400, meaningSize, fonts.ui);
      ctx.fillStyle = colors.ink;
      ctx.direction = "ltr";
      ctx.textAlign = "center";
      meaning.forEach((line, j) => ctx.fillText(line, W / 2, y + meaningExt.ascent + j * meaningLH));
    }
    return boxes;
  };

  return { height, draw, fontSize: fit.fontSize, stretch: fit.stretch };
}

/** Draws poet (Urdu, English) and the Sher mark; returns the credit's top. */
function drawCredit(ctx: CanvasRenderingContext2D, c: PosterContent, margin: number): number {
  const { width: W, height: H, fonts, colors, poet } = c;
  const cx = W / 2;

  ctx.font = font(700, W * 0.022, fonts.ui);
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  const mark = latinExtents(ctx, "Sher");
  let baseline = H - margin - mark.descent;
  ctx.fillStyle = colors.inkMuted;
  ctx.fillText("Sher", cx, baseline);
  let top = baseline - mark.ascent;
  if (!poet) return top;

  ctx.font = font(400, W * 0.028, fonts.ui);
  const en = latinExtents(ctx);
  baseline = top - W * 0.03 - en.descent;
  ctx.fillStyle = colors.ink;
  ctx.fillText(poet.nameEn, cx, baseline);
  top = baseline - en.ascent;

  ctx.font = font(400, W * 0.04, fonts.urdu);
  ctx.direction = "rtl";
  const ur = ctx.measureText(poet.nameUr);
  baseline = top - W * 0.012 - ur.actualBoundingBoxDescent;
  ctx.fillText(poet.nameUr, cx, baseline);
  return baseline - ur.actualBoundingBoxAscent;
}
