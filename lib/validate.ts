// Content rules from SPEC.md, as one pure function shared by the build
// (lib/content.ts) and `npm run check:content` (scripts/check-content.mjs).
// Errors fail the build; warnings are launch-readiness gaps.
// Relative imports carry .ts so plain Node can load this file too.

import { findWord } from "./gloss.ts";
import { MOMENT_KEYS, MOMENTS } from "./moments.ts";
import type { Poet, Sher } from "./types";

/**
 * SPEC.md, "Content and copyright rules": public-domain poets only, keyed as
 * in data/poets.json. Adding a poet means checking their work is in the public
 * domain and updating SPEC.md first.
 */
export const PUBLIC_DOMAIN_POETS: Record<string, string> = {
  ghalib: "Mirza Ghalib",
  mir: "Mir Taqi Mir",
  dagh: "Dagh Dehlvi",
  zafar: "Bahadur Shah Zafar",
  hali: "Altaf Hussain Hali",
  akbar: "Akbar Allahabadi",
  wali: "Wali Mohammad Wali",
  anees: "Mir Anees",
  naji: "Naji Shakir",
  iqbal: "Muhammad Iqbal",
};

/** Iqbal only for couplets published before 1929: his Urdu collection from then. */
export const IQBAL_PRE_1929_WORKS = ["Bang-e-Dara"];

export const MIN_PER_MOMENT = 3;

export interface ValidateInput {
  shers: Sher[];
  poets: Poet[];
  schedule: string[];
  /**
   * The launch date has passed. Once anything is verified, the schedule is
   * then fixed: every scheduled couplet must be verified, and past days
   * never change.
   */
  launched?: boolean;
  /** The schedule as last committed, to check that past days never change. */
  previousSchedule?: string[];
}

export interface ValidateResult {
  errors: string[];
  warnings: string[];
}

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const sentences = (text: string) => text.split(/[.?!](\s|$)/).filter((s) => s && s.trim()).length;

export function validate({ shers, poets, schedule, launched = false, previousSchedule }: ValidateInput): ValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Poets
  const poetKeys = new Set<string>();
  for (const p of poets) {
    poetKeys.add(p.key);
    if (!(p.key in PUBLIC_DOMAIN_POETS)) {
      errors.push(`poet "${p.key}": not on the public-domain list in SPEC.md (copyright)`);
    }
    for (const field of ["nameEn", "nameUr", "years", "bioEn"] as const) {
      if (!nonEmpty(p[field])) errors.push(`poet "${p.key}": ${field} is empty`);
    }
    if (JSON.stringify(p).includes("TODO")) errors.push(`poet "${p.key}": still has TODO placeholders`);
  }

  // Couplets
  const ids = new Set<string>();
  for (const s of shers) {
    const at = s.id ?? "(no id)";
    if (!ID.test(s.id ?? "")) errors.push(`${at}: id must be lowercase-words-with-hyphens`);
    if (ids.has(s.id)) errors.push(`${at}: duplicate id`);
    ids.add(s.id);
    if (JSON.stringify(s).includes("TODO")) errors.push(`${at}: still has TODO placeholders from the template`);

    if (!poetKeys.has(s.poet)) errors.push(`${at}: unknown poet "${s.poet}"`);
    if (s.poet === "iqbal" && !IQBAL_PRE_1929_WORKS.some((w) => s.source?.work?.includes(w))) {
      errors.push(`${at}: Iqbal only for couplets published before 1929; name the collection (${IQBAL_PRE_1929_WORKS.join(", ")}) in source.work`);
    }

    if (!Array.isArray(s.lines) || s.lines.length !== 2 || !s.lines.every(nonEmpty)) {
      errors.push(`${at}: lines must be exactly 2 non-empty misras`);
    }
    if (!Array.isArray(s.roman) || s.roman.length !== 2 || !s.roman.every(nonEmpty)) {
      errors.push(`${at}: roman must be exactly 2 non-empty lines`);
    }
    if (!nonEmpty(s.meaningEn)) errors.push(`${at}: meaningEn is empty`);

    for (const g of s.glossary ?? []) {
      if (!nonEmpty(g.word) || !nonEmpty(g.roman) || !nonEmpty(g.meaning)) {
        errors.push(`${at}: every glossary entry needs word, roman and meaning`);
        continue;
      }
      const line = s.lines?.find((l) => l.includes(g.word));
      if (!line) errors.push(`${at}: glossary word "${g.word}" not found in lines (must match exactly)`);
      else if (!s.lines.some((l) => isWholeWord(l, g.word))) {
        warnings.push(`${at}: glossary word "${g.word}" only matches inside a longer word`);
      }
    }

    if (!Array.isArray(s.moments) || s.moments.length === 0) errors.push(`${at}: needs at least one moment`);
    for (const m of s.moments ?? []) {
      if (!MOMENT_KEYS.has(m)) errors.push(`${at}: unknown moment "${m}"`);
    }

    if (!nonEmpty(s.source?.work)) errors.push(`${at}: source.work is empty`);
    if (s.attribution !== "certain" && s.attribution !== "disputed") {
      errors.push(`${at}: attribution must be "certain" or "disputed"`);
    }
    if (s.attribution === "disputed" && !nonEmpty(s.attributionNote)) {
      errors.push(`${at}: disputed attribution needs an attributionNote`);
    }
    if (s.status !== "draft" && s.status !== "verified") errors.push(`${at}: status must be "draft" or "verified"`);

    if (s.status === "verified") {
      if (!nonEmpty(s.source?.edition)) {
        errors.push(`${at}: verified, but source.edition is empty (name the printed edition it was checked against)`);
      }
      if (!nonEmpty(s.source?.page)) warnings.push(`${at}: verified without source.page`);
    }
    if (s.whyItLands && sentences(s.whyItLands) > 3) warnings.push(`${at}: whyItLands is over 3 sentences`);
    if (s.meaningEn && s.meaningEn.length > 300) warnings.push(`${at}: meaningEn is long (${s.meaningEn.length} characters)`);
  }

  // Schedule. The after-launch rules protect days readers have already seen;
  // until something is verified, production has only shown the empty state.
  const verified = new Set(shers.filter((s) => s.status === "verified").map((s) => s.id));
  const live = launched && verified.size > 0;
  const seen = new Set<string>();
  schedule.forEach((id, day) => {
    if (!ids.has(id)) errors.push(`schedule day ${day}: unknown sher id "${id}"`);
    if (seen.has(id)) errors.push(`schedule day ${day}: "${id}" is already scheduled (the schedule repeats by itself)`);
    seen.add(id);
    if (ids.has(id) && !verified.has(id)) {
      (live ? errors : warnings).push(`schedule day ${day}: "${id}" is not verified${live ? " (production would shift every later day)" : ""}`);
    }
  });
  if (previousSchedule && live) {
    const changed = previousSchedule.findIndex((id, i) => schedule[i] !== id);
    if (changed !== -1) {
      errors.push(`schedule day ${changed}: changed after launch; only append new ids to the end`);
    }
  }
  const poetOf = new Map(shers.map((s) => [s.id, s.poet]));
  for (let i = 1; i < schedule.length; i++) {
    if (poetOf.get(schedule[i]) && poetOf.get(schedule[i]) === poetOf.get(schedule[i - 1])) {
      warnings.push(`schedule days ${i - 1}–${i}: same poet two days running`);
    }
  }
  for (const id of verified) {
    if (!seen.has(id)) warnings.push(`${id}: verified but not in the schedule (it shows in Moments only)`);
  }

  // Moments (verified couplets only, as production shows them)
  for (const { key } of MOMENTS) {
    const n = shers.filter((s) => s.status === "verified" && s.moments?.includes(key)).length;
    if (n > 0 && n < MIN_PER_MOMENT) {
      warnings.push(`moment "${key}": ${n} verified couplet(s); launch needs at least ${MIN_PER_MOMENT}`);
    }
  }

  return { errors, warnings };
}

function isWholeWord(line: string, word: string) {
  const i = findWord(line, word);
  const before = line[i - 1];
  const after = line[i + word.length];
  const boundary = (ch: string | undefined) => ch === undefined || /[\s،۔؟!.,]/.test(ch);
  return i >= 0 && boundary(before) && boundary(after);
}
