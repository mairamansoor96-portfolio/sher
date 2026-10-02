# Adding and verifying couplets

How a couplet gets from an idea to Today. The rules come from SPEC.md
("Content model" and "Content and copyright rules"); where this guide and the
spec differ, the spec wins.

```sh
npm run check:content   # errors, warnings and a launch-readiness summary
npm run dev             # drafts are visible here, at /sher/{id}
```

The build runs the same rules: a content error fails `npm run build`.

## The workflow

1. **Draft.** Copy [`sher.template.json`](sher.template.json) into
   `data/shers.json` and fill it in, with `"status": "draft"`. A new poet also
   needs an entry from [`poet.template.json`](poet.template.json) in
   `data/poets.json`.
2. **Check.** Run `npm run check:content` until it shows no errors for the
   couplet, then read it at `/sher/{id}` in `npm run dev` with every layer on.
3. **Verify.** Work through the [verification checklist](#verification-checklist)
   with the printed edition open. Only then set `"status": "verified"`.
4. **Schedule.** Append the id to the end of `data/schedule.json`.

Production shows verified couplets only. Drafts never leave development.

## Writing each field

Everything except the Urdu text is **written for Sher, in our own words**. Never
copy or lightly reword Rekhta, a published translation, or another site. Write
the meaning before reading anyone else's, and if you have read one, do not
paraphrase it.

| Field | How to write it |
| --- | --- |
| `id` | `poet-first-words`, lowercase with hyphens, from the Roman: `ghalib-dil-e-nadaan`. Never change it once published: it is the shareable URL. |
| `poet` | A key from `data/poets.json`. |
| `lines` | The two misras exactly as printed in the edition you cite, letter for letter, with its spellings (e.g. مرے if it prints مرے, not میرے). No added punctuation. |
| `roman` | Our transliteration, one line per misra, following the [conventions](#roman-urdu-conventions). |
| `meaningEn` | Plain modern English a 15-year-old would follow. One or two sentences. Say what it means, not what it "evokes". Over 300 characters gets a warning. |
| `meaningUr` | Optional. A simple, everyday Urdu paraphrase, not a scholarly sharh. |
| `whyItLands` | Optional. One to three sentences on what makes it work: the image, the wordplay or double meaning, or the history behind it. No superlatives ("the greatest…"). |
| `glossary` | One to four words a diaspora reader is least likely to know, usually Persian or Arabic. `word` is **copied and pasted from `lines`**, so it matches exactly (hamza and nasal forms included); the build rejects a word that isn't in the lines. `meaning` gives the sense in this couplet first: `"breath; here, life itself"`. |
| `moments` | One to three keys from the [moments list](#moments). Ask: would someone in this moment send it? |
| `source.work` | The collection: `Divan-e-Ghalib`, `Kulliyat-e-Mir`, `Bang-e-Dara`. |
| `source.edition` | The printed edition you checked against: editor, publisher, year. **Required before verifying**, and listed automatically on the About page. |
| `source.page` | The page in that edition. A verified couplet without one gets a warning. |
| `attribution` | `"certain"`, or `"disputed"` if scholars doubt the poet wrote it or it is missing from their own collection. |
| `attributionNote` | Required when disputed, always shown to readers. One plain sentence on what is doubted. |

## Roman Urdu conventions

Follow the seed couplets, so every couplet reads the same way:

- **Long vowels doubled:** aa (armaan, aati), ee (ummeed, raqeeb), oo (soorat).
- **Short vowels** only where pronounced: dard, khat, dil.
- **Izafat** with hyphens: `dil-e-nadaan`, `aalam-e-napaedaar`.
- **Nasal endings** as n: khwahishen, nahin, hazaaron.
- **Common words:** کہ → ke, ہے → hai, ہیں → hain, میں → mein, نہ → na, کیا → kya.
- **Letters:** خ → kh, غ → gh, ق → q, چ → ch, ش → sh, ژ → zh. ع gets no mark (aalam).
- No diacritics, apostrophes or macrons. Capitalise only the first word of each line.
- Transliterate the spelling you print: if the line has مرے, write *mere*.

## Verification checklist

Do this for every couplet, with the printed edition (not a website) open.
Items marked *(checked)* are also enforced by `npm run check:content` and the build.

**Copyright**

- [ ] The poet is on the public-domain list: Ghalib, Mir Taqi Mir, Dagh Dehlvi, Bahadur Shah Zafar, Altaf Hussain Hali, Akbar Allahabadi, Wali Mohammad Wali, Mir Anees, Naji Shakir. *(checked)*
- [ ] Iqbal only for couplets published before 1929, with the collection named. In Urdu that means *Bang-e-Dara* (1924). *(checked)*
- [ ] No modern poet still under copyright, however famous the line (Faiz, Faraz, Jaun Elia, Parveen Shakir…). *(checked)*

**Text and source**

- [ ] Both misras compared word by word with the printed edition. Where editions differ, use the reading of the edition you cite.
- [ ] `source.work`, `source.edition` and `source.page` filled in from that book. *(edition checked)*
- [ ] The couplet appears in the poet's own collection in that edition. If it doesn't, or its authorship is doubted, mark it `disputed` with a note. *(note checked)*

**Our writing**

- [ ] The Roman matches the printed text word for word and follows the conventions above.
- [ ] The meaning, glossary meanings and "why it lands" are our own words, written without copying any translation or site.
- [ ] Glossary words were pasted from `lines`, and each meaning fits this couplet. *(matching checked)*
- [ ] The moments fit.

**Review**

- [ ] A second person, ideally a fluent reader, has read the Urdu against the book and the meaning against the Urdu.
- [ ] `npm run check:content` shows no errors.
- [ ] It looks right at `/sher/{id}` with every layer on, and as a story poster.
- [ ] Now set `"status": "verified"`.

## The schedule

`data/schedule.json` lists couplet ids; day *n* after `LAUNCH_DATE` shows
`schedule[n % length]`.

- **Only ever append.** After launch, reordering or removing ids changes days
  people have already seen and shared. *(checked against the last commit once anything is verified and the launch date has passed)*
- **Only verified couplets**, or production shifts every later day. *(checked after launch)*
- Each id appears once; the schedule repeats by itself. *(checked)*
- **Mix it up:** avoid the same poet two days running (a warning), and vary
  the moods.
- Before launch, reorder freely.

## Moments

| Key | Use it for |
| --- | --- |
| `missing-someone` | Distance from a person or a place |
| `heartbreak` | Love that hurts, ends or isn't returned |
| `longing` | Wanting what you can't have, or can't have enough of |
| `hope` | Holding on, things getting better |
| `rain` | Rain and the season of rain (saawan) |
| `night` | Night, sleeplessness, waiting till dawn |
| `eid` | Eid, the moon, meeting after time apart |
| `friendship` | Friends, and the lack of them |
| `pride` | Self-respect, dignity, refusing to bend |
| `life-is-short` | Mortality, time passing, the world not lasting |
| `humour` | Wit, playful complaint, teasing |

A moment appears only once it has a verified couplet, and needs at least
three before launch (a warning until then).

## Launch checklist

- [ ] The real launch date is set in `lib/config.ts`. **Never change it after launch.**
- [ ] `npm run check:content` shows ✓ on every line of "Launch readiness".
- [ ] The schedule is long enough before it repeats (decide how many days; the spec doesn't say).
- [ ] The About page lists the editions used (automatic from `source.edition`).
- [ ] A native reader has reviewed the Urdu interface text in `lib/i18n.ts`.
- [ ] `npm run build` and `npm run check:a11y` pass.
- [ ] Spot-check the longest couplets as posters at every size.
