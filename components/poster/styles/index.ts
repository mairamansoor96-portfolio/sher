import { plainStyle } from "./plain";
import type { PosterStyle } from "./types";

/** Every poster style, in the order the editor offers them. */
export const POSTER_STYLES: PosterStyle[] = [plainStyle];

export const STYLE_IDS = POSTER_STYLES.map((s) => s.id);

export function getStyle(id: string): PosterStyle {
  return POSTER_STYLES.find((s) => s.id === id) ?? POSTER_STYLES[0];
}
