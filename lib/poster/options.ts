// Poster sizes and options (SPEC.md, "Poster maker"). Pure, no DOM.

export const POSTER_SIZES = [
  { id: "story", label: "Story", hint: "WhatsApp or Instagram", width: 1080, height: 1920 },
  { id: "square", label: "Square", hint: "Post", width: 1080, height: 1080 },
  { id: "portrait", label: "Portrait", hint: "Post", width: 1080, height: 1350 },
  { id: "wallpaper", label: "Wallpaper", hint: "Phone", width: 1170, height: 2532 },
] as const;

export type PosterSize = (typeof POSTER_SIZES)[number];
export type PosterSizeId = PosterSize["id"];

export interface PosterOptions {
  size: PosterSizeId;
  style: string;
  /** Urdu and the credit are always included; these are optional. */
  roman: boolean;
  meaning: boolean;
}

export const DEFAULT_OPTIONS: PosterOptions = {
  size: "story",
  style: "plain",
  roman: false,
  meaning: false,
};

export function getSize(id: string): PosterSize {
  return POSTER_SIZES.find((s) => s.id === id) ?? POSTER_SIZES[0];
}

/** Parses saved options, keeping only known values. */
export function parseOptions(raw: string | null, styleIds: readonly string[]): PosterOptions {
  const v = raw ? JSON.parse(raw) : {};
  return {
    size: POSTER_SIZES.some((s) => s.id === v?.size) ? v.size : DEFAULT_OPTIONS.size,
    style: styleIds.includes(v?.style) ? v.style : DEFAULT_OPTIONS.style,
    roman: v?.roman === true,
    meaning: v?.meaning === true,
  };
}
