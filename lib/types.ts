// Content model — mirrors the "Content model" section of SPEC.md exactly.
// Change SPEC.md first if this needs to change.

export type Moment =
  | "missing-someone" | "heartbreak" | "longing" | "hope" | "rain"
  | "night" | "eid" | "friendship" | "pride" | "life-is-short" | "humour";

export interface Gloss {
  word: string;        // exactly as it appears in the Urdu line
  roman: string;       // "armaan"
  meaning: string;     // "deep wishes, cherished hopes"
}

export interface Sher {
  id: string;          // "ghalib-hazaaron-khwahishen-1"
  poet: string;        // key into poets
  lines: [string, string];       // Urdu, the two misras
  roman: [string, string];       // our own transliteration
  meaningEn: string;   // plain English, our own words
  meaningUr?: string;  // simple Urdu paraphrase
  whyItLands?: string; // 1-3 sentences on the image, wordplay, or context
  glossary: Gloss[];
  moments: Moment[];
  source: {
    work: string;      // "Divan-e-Ghalib"
    edition?: string;  // printed edition checked against
    page?: string;
  };
  attribution: "certain" | "disputed";
  attributionNote?: string;      // shown when disputed
  status: "draft" | "verified";
}

export interface Poet {
  key: string;         // "ghalib"
  nameEn: string;      // "Mirza Ghalib"
  nameUr: string;      // "مرزا غالب"
  years: string;       // "1797-1869"
  bioEn: string;       // two sentences
}
