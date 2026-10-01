# Sher — Spec

*One couplet a day, made understandable and shareable.*

## Overview

Sher shows one classical Urdu couplet each day, the same for everyone. Each couplet can be understood in layers, from the original Nastaliq to a plain meaning, and turned into a beautiful poster to share.

The problem: many people love Urdu poetry but can't fully access it. Some read Nastaliq slowly, much of the diaspora can't read it at all, and classical poets use Persian and Arabic words most people don't know. So people share couplets they half understand, or skip them.

## Principles

- **One a day.** No feed, no infinite scroll. Restraint is part of the experience.
- **Understanding on demand.** The poem is the hero. Every other layer appears only when someone asks for it.
- **Real, sourced poetry.** Every couplet shows where it comes from. Disputed attributions are labelled, never hidden.
- **Craft over decoration.** The two lines of every couplet are set to equal width, as in calligraphy.
- **No accounts, no backend.** Everything personal stays in the browser.

## Who it's for

| Reader | What they can do | What they need |
| --- | --- | --- |
| Fluent reader | Reads Nastaliq and classical vocabulary | The poem, beautifully set, and a quick way to share it |
| Speaks, reads slowly | Understands spoken Urdu, struggles with script or rare words | Roman Urdu, tap-to-gloss words |
| Diaspora or English-first | May not read Urdu script at all | Roman Urdu, a plain English meaning, and context |
| Sharer | Wants words for a moment in their life | Browsing by mood or occasion, posters sized for WhatsApp and Instagram |

## Content model

All content lives in one static file, `data/shers.json`, bundled with the app. There is no backend.

```typescript
type Moment =
  | "missing-someone" | "heartbreak" | "longing" | "hope" | "rain"
  | "night" | "eid" | "friendship" | "pride" | "life-is-short" | "humour";

interface Gloss {
  word: string;        // exactly as it appears in the Urdu line
  roman: string;       // "armaan"
  meaning: string;     // "deep wishes, cherished hopes"
}

interface Sher {
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

interface Poet {
  key: string;         // "ghalib"
  nameEn: string;      // "Mirza Ghalib"
  nameUr: string;      // "مرزا غالب"
  years: string;       // "1797-1869"
  bioEn: string;       // two sentences
}
```

**Rules:**

- Production builds show only `status: "verified"` couplets. Drafts are visible only in development.
- `glossary[].word` must match text in `lines` exactly, so the word can be found and made tappable.
- `attribution: "disputed"` always shows its note. Never hide a dispute.

## Today's sher

Everyone sees the same couplet on the same day.

- The day changes at midnight Pakistan time (Asia/Karachi), the main audience's day.
- `data/schedule.json` is an ordered list of sher ids. Today's sher is `schedule[daysSinceLaunch % schedule.length]`.
- New couplets are appended to the end of the schedule, so past days never change.
- A date picker is out of scope; people can browse yesterday's and tomorrow's from Today.

## Content and copyright rules

- **Public-domain poets only:** Ghalib, Mir Taqi Mir, Dagh Dehlvi, Bahadur Shah Zafar, Altaf Hussain Hali, Akbar Allahabadi, Wali Mohammad Wali, Mir Anees, Naji Shakir. Iqbal only for couplets published before 1929, with the collection named.
- **No modern poets** still under copyright, such as Faiz, Faraz, Jaun Elia, or Parveen Shakir.
- **Our own words:** Roman transliterations, meanings, glosses, and notes are written for Sher, not copied from Rekhta or published translations.
- **Source text:** the open dataset parsed from Rekhta is a starting point only. Every couplet is checked against a printed edition before it's marked verified.
- **Credit:** an About page thanks Rekhta and lists the editions used.

## Screens and flows

Three tabs in a bottom bar: **Today**, **Moments**, and **Bayaz**. The poster maker opens from any couplet. About is reached from Today's header.

| Screen | What it does | Done when |
| --- | --- | --- |
| Today | Today's couplet as the hero, poet name, date. Below it: the understanding layers, Save to bayaz, Make a poster, and small Yesterday and Tomorrow links. | The couplet is readable within one second of load, before any other content. |
| Understanding layers | Layer controls under the couplet: **Roman** toggles transliteration under each line; **Words** makes glossed words tappable; **Meaning** reveals the English and simple Urdu meaning; **Why it lands** reveals the note. Source and attribution always show at the bottom in small type. | Each layer opens independently and remembers its last state. With everything off, only the poem shows. |
| Word gloss | Tapping a glossed word opens a small sheet: the word in Nastaliq, its Roman form, and its meaning. | Works by touch and keyboard; glossed words are visibly marked only when Words is on. |
| Moments | A grid of moments ("Missing someone," "Rain," "Eid"). Each opens a list of couplets for that moment, showing the Urdu, Roman, and a one-line meaning. | Every moment has at least three couplets before launch; empty moments are hidden. |
| Couplet page | The same layout as Today, for any couplet opened from Moments or the bayaz, with its own shareable URL (`/sher/{id}`). | Opening a shared link shows that couplet directly. |
| Bayaz | Saved couplets, newest first, styled like a personal notebook. Remove by toggling Save again. | Saved state survives reloads; an empty bayaz explains what it is. |
| Poster maker | Choose a style, a size, and what to include, preview live, then share or download. | See the poster spec below. |
| About | What Sher is, the poets with short bios, the editions used, thanks to Rekhta, and the copyright rules. | Linked from Today's header and every poster credit. |

**Behaviours:**

- **Save to bayaz** is one tap from Today and every couplet page, with a brief confirmation.
- **Share link** uses the Web Share API, falling back to copying the URL.
- **Language of the interface** is English with an Urdu toggle, separate from the poetry layers.

## Couplet typography

This is Sher's signature craft detail. In classical calligraphy, the two lines of a couplet are set to the same width so they sit as a balanced pair.

**Balancing rule:**

1. Render both lines in Noto Nastaliq Urdu at the target size and measure their natural widths.
2. Set the shared line width to the wider of the two.
3. Stretch the shorter line to that width by widening its word spaces only (`text-align: justify` with `text-align-last: justify` on each line). Never use `letter-spacing` on Urdu; it breaks joined letters.
4. If the wider line doesn't fit its container, reduce the font size for both lines together until it does. Never shrink one line alone.
5. If the shorter line would need more than about 40% extra space, keep it natural and centred instead, so it never looks gappy.

**Nastaliq safety:** line height at least 2.2, generous padding above and below, and no `overflow: hidden` on couplet containers, so dots and stacked letters are never clipped.

Roman lines sit under their Urdu line, left-aligned to the same width, in a smaller size. They are never balanced by stretching.

## Poster maker

Posters are generated in the browser on an HTML canvas and shared as image files.

| Setting | Options |
| --- | --- |
| Size | WhatsApp or Instagram story 1080×1920, square 1080×1080, portrait post 1080×1350, phone wallpaper 1170×2532 |
| Style | Three styles, defined after visual exploration; start with one plain placeholder style |
| Include | Urdu (always), Roman (optional), English meaning (optional) |
| Credit | Poet name in English and Urdu, plus a small "Sher" mark. Always on. |

**Rules:**

- The couplet uses the same balancing rule on the poster, recalculated for each size.
- Wait for `document.fonts.load()` for every font before drawing, so the canvas never falls back to a system font.
- Measure real glyph bounds (`actualBoundingBoxAscent` and `Descent`) and keep a safe margin, so nothing is clipped.
- **Share** uses the Web Share API with the image file where supported; otherwise **Download** saves a PNG.
- The preview shows the poster exactly as it will export.

## Accessibility

- Every Urdu element has `lang="ur"` and `dir="rtl"`; Roman lines have `lang="ur-Latn"`.
- Screen readers meet each couplet in a sensible order: Urdu lines, then Roman (if on), then the meaning (if on). Decorative elements are `aria-hidden`.
- Layer controls are real toggle buttons with `aria-pressed`. The word sheet is a labelled dialog that returns focus to the word.
- Text meets WCAG AA contrast, touch targets are at least 48 px, and the layout holds at 200% text size.
- Couplet size scales with the user's text size; the balancing rule recalculates.
- Reduced motion is respected: reveals fade or appear instantly.

## Privacy

- No accounts, no backend, no analytics that track people.
- The bayaz and layer preferences are stored in `localStorage` on the device, wrapped in try/catch.
- Shared links contain only a couplet id, never anything personal.

## Stack

| Area | Decision |
| --- | --- |
| Framework | Next.js (App Router), TypeScript, static export |
| Styling | Tailwind CSS, design tokens in one file |
| Hosting | Vercel free tier |
| Content | `data/shers.json`, `data/poets.json`, `data/schedule.json` |
| Fonts | Noto Nastaliq Urdu for poetry and Urdu UI; Atkinson Hyperlegible for English UI (provisional) |
| Posters | HTML canvas, Web Share API with download fallback |

## Provisional visual foundation

The visual direction will be explored separately, as with Waqt Pe. Until then, build with a deliberately plain, swappable foundation:

- All colours, type sizes, spacing, and radii come from one tokens file, so the final theme replaces values rather than components.
- Neutral placeholder palette: near-white background, near-black ink, one muted accent.
- Couplet sizes: 34 px on Today, 26 px in lists, with line height 2.2.
- No decorative patterns, shadows, or one-side border accents yet.
- Poster styles are separate components, so new styles can be added without touching the editor.

## Build milestones

Each milestone is roughly one Claude Code session. Deploy after each and check it on a real phone.

| # | Milestone | Done when |
| --- | --- | --- |
| 1 | Scaffold, tokens file, types, data loading, schedule logic | Today shows the correct seed couplet for the date in Pakistan time |
| 2 | Couplet component with the balancing rule and Nastaliq safety | Both lines match in width at every screen size and text size, with nothing clipped |
| 3 | Understanding layers and the word gloss sheet | Every layer toggles independently and remembers its state |
| 4 | Couplet pages, shareable URLs, and Moments | A shared `/sher/{id}` link opens that couplet; each moment lists its couplets |
| 5 | Bayaz | Saved couplets survive reloads; the empty state explains the bayaz |
| 6 | Poster maker: one style, four sizes, include options, share and download | Exported images match the preview, with balanced, unclipped Urdu |
| 7 | About page, Urdu interface toggle, accessibility pass | Passes 200% text, screen-reader order, and keyboard checks |
| 8 | Final content and visual theme | Only verified couplets ship; the chosen visual direction is applied through tokens |

## Out of scope for the MVP

- Audio recitations (a strong next feature, recorded by real voices)
- Accounts, comments, or social features
- Notifications and a WhatsApp channel
- Search across all poetry
- Poets beyond the public-domain list

## Seed data

A starter `shers.seed.json`, `poets.seed.json`, and `schedule.seed.json` with five draft couplets (Ghalib, Dagh, and Zafar) are provided so the app can be built before the final list is ready. They are marked `draft` and show only in development. One of them, the Zafar couplet, is deliberately marked `disputed` to exercise the attribution note.
