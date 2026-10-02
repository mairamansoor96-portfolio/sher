import type { PosterColors, PosterFonts } from "@/lib/poster/canvas";
import type { Poet, Sher } from "@/lib/types";

export interface PosterContent {
  sher: Sher;
  poet?: Poet;
  roman: boolean;
  meaning: boolean;
  width: number;
  height: number;
  fonts: PosterFonts;
  colors: PosterColors;
}

export interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** What a style drew, for checks: the Urdu line boxes and the safe margin. */
export interface PosterLayout {
  margin: number;
  fontSize: number;
  stretch: boolean;
  urdu: Box[];
}

/**
 * A poster style draws a whole poster onto a canvas already sized to the
 * export dimensions. Add a style by adding a file and listing it in index.ts;
 * the editor never changes.
 */
export interface PosterStyle {
  id: string;
  label: string;
  render(ctx: CanvasRenderingContext2D, content: PosterContent): PosterLayout;
}
