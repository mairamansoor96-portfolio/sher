// Interface language: English with an Urdu toggle, separate from the poetry
// layers. Only interface text lives here; content (meanings, bios) stays in
// data/ and is marked lang="en" wherever it appears.

import { createStore } from "./storage";
import type { Moment } from "./types";

export type Lang = "en" | "ur";

const en = {
  brand: "Sher",
  langSwitch: "اردو", // shown in English mode; switches to Urdu
  nav: { main: "Main", today: "Today", moments: "Moments", bayaz: "Bayaz", about: "About" },
  today: {
    heading: "Today",
    label: "Today’s couplet, ",
    otherDays: "Other days",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    emptyTitle: "The first couplet is on its way",
    emptyBody:
      "Every couplet is checked against a printed edition before it appears here. Please come back soon.",
  },
  layers: {
    group: "Understanding layers",
    roman: "Roman",
    words: "Words",
    meaning: "Meaning",
    why: "Why it lands",
  },
  sher: {
    /** Takes the poet's English and Urdu names; each language uses its own. */
    coupletBy: (...[en]: [string, string]) => `Couplet by ${en}`,
    source: "Source:",
    disputed: "Disputed attribution.",
    draft: "Draft — visible in development only",
  },
  actions: {
    save: "Save to bayaz",
    saved: "Saved to your bayaz",
    removed: "Removed from your bayaz",
    share: "Share link",
    poster: "Make a poster",
    copied: "Link copied",
    copyThis: (url: string) => `Copy this link: ${url}`,
  },
  gloss: { close: "Close" },
  moments: {
    title: "Moments",
    intro: "Words for a moment in your life.",
    count: (n: number) => `${n} ${n === 1 ? "couplet" : "couplets"}`,
    all: "All moments",
    emptyTitle: "Moments are on their way",
    emptyBody: "Couplets appear here once they have been checked against a printed edition.",
  },
  bayaz: {
    title: "Bayaz",
    intro: "Your notebook of couplets, kept on this device.",
    emptyTitle: "Your bayaz is empty",
    emptyBody:
      "A bayaz is a personal notebook where lovers of poetry copy out the couplets they want to keep. Tap “Save to bayaz” on any couplet and it will appear here. It stays on this device: no account, nothing sent anywhere.",
    savedOn: (date: string) => `Saved ${date}`,
    removed: "Removed from your bayaz.",
    undo: "Undo",
  },
  poster: {
    title: "Make a poster",
    size: "Size",
    style: "Style",
    include: "Include",
    urduAlways: "Urdu (always)",
    roman: "Roman",
    meaning: "English meaning",
    creditNote: "The poet’s name and the Sher mark are always included.",
    share: "Share",
    download: "Download PNG",
    back: "Back to the couplet",
    loadingFonts: "Loading fonts…",
    fontsFailed:
      "The poster fonts couldn’t load, so the poster can’t be drawn properly. Check your connection and reload.",
    shareFailed: "Sharing didn’t work. Try Download instead.",
    savedFile: (name: string) => `Saved ${name}`,
    sizes: {
      story: ["Story", "WhatsApp or Instagram"],
      square: ["Square", "Post"],
      portrait: ["Portrait", "Post"],
      wallpaper: ["Wallpaper", "Phone"],
    } as Record<string, [string, string]>,
    preview: (size: string, w: number, h: number, extras: string[], poet: string) =>
      `Poster preview, ${size} ${w} by ${h}: the couplet in Urdu${
        extras.length ? ` with ${extras.join(" and ")}` : ""
      }, credited to ${poet}.`,
  },
  about: {
    title: "About Sher",
    what: "Sher shows one classical Urdu couplet a day, the same for everyone. Read it in Nastaliq, in Roman Urdu, word by word or in plain English, and turn it into a poster to share.",
    poetsTitle: "The poets",
    editionsTitle: "Editions",
    editionsIntro: "Every couplet is checked against a printed edition before it appears. Editions used:",
    editionsNone: "Editions will be listed here as couplets are checked.",
    thanksTitle: "Thanks",
    thanks:
      "The text of many couplets started from the open dataset of Rekhta, the great online library of Urdu poetry. Thank you, Rekhta.",
    copyrightTitle: "Copyright",
    copyright:
      "Sher includes only poets whose work is in the public domain: Mirza Ghalib, Mir Taqi Mir, Dagh Dehlvi, Bahadur Shah Zafar, Altaf Hussain Hali, Akbar Allahabadi, Wali Mohammad Wali, Mir Anees and Naji Shakir, and Iqbal only for couplets published before 1929. The Roman transliterations, meanings, word notes and commentary are written for Sher, not copied from Rekhta or published translations.",
    privacyTitle: "Privacy",
    privacy: "No accounts and no tracking. Your bayaz and settings stay on this device.",
  },
  moment: {
    "missing-someone": "Missing someone",
    heartbreak: "Heartbreak",
    longing: "Longing",
    hope: "Hope",
    rain: "Rain",
    night: "Night",
    eid: "Eid",
    friendship: "Friendship",
    pride: "Pride",
    "life-is-short": "Life is short",
    humour: "Humour",
  } as Record<Moment, string>,
};

export type Dict = typeof en;

const ur: Dict = {
  brand: "شعر",
  langSwitch: "English",
  nav: { main: "مرکزی", today: "آج", moments: "لمحے", bayaz: "بیاض", about: "تعارف" },
  today: {
    heading: "آج",
    label: "آج کا شعر، ",
    otherDays: "دوسرے دن",
    yesterday: "گزشتہ کل",
    tomorrow: "آنے والا کل",
    emptyTitle: "پہلا شعر آنے والا ہے",
    emptyBody: "ہر شعر یہاں آنے سے پہلے کسی مطبوعہ نسخے سے ملایا جاتا ہے۔ جلد دوبارہ تشریف لائیں۔",
  },
  layers: {
    group: "سمجھنے کی تہیں",
    roman: "رومن",
    words: "الفاظ",
    meaning: "مطلب",
    why: "کیا خاص ہے",
  },
  sher: {
    coupletBy: (...[, ur]: [string, string]) => `${ur} کا شعر`,
    source: "ماخذ:",
    disputed: "انتساب متنازع ہے۔",
    draft: "مسودہ — صرف ڈیولپمنٹ میں نظر آتا ہے",
  },
  actions: {
    save: "بیاض میں محفوظ کریں",
    saved: "آپ کی بیاض میں محفوظ ہو گیا",
    removed: "آپ کی بیاض سے نکال دیا گیا",
    share: "لنک بھیجیں",
    poster: "پوسٹر بنائیں",
    copied: "لنک کاپی ہو گیا",
    copyThis: (url: string) => `یہ لنک کاپی کریں: ${url}`,
  },
  gloss: { close: "بند کریں" },
  moments: {
    title: "لمحے",
    intro: "زندگی کے کسی لمحے کے لیے الفاظ۔",
    count: (n: number) => `${formatNumber(n, "ur")} شعر`,
    all: "تمام لمحے",
    emptyTitle: "لمحے آنے والے ہیں",
    emptyBody: "اشعار یہاں تب آئیں گے جب انہیں کسی مطبوعہ نسخے سے ملا لیا جائے گا۔",
  },
  bayaz: {
    title: "بیاض",
    intro: "آپ کے اشعار کی بیاض، اسی ڈیوائس پر محفوظ۔",
    emptyTitle: "آپ کی بیاض خالی ہے",
    emptyBody:
      "بیاض وہ ذاتی کاپی ہے جس میں شعر کے شوقین اپنے پسندیدہ اشعار لکھ لیتے ہیں۔ کسی بھی شعر پر ”بیاض میں محفوظ کریں“ دبائیں، وہ یہاں آ جائے گا۔ یہ اسی ڈیوائس پر رہتی ہے: نہ کوئی اکاؤنٹ، نہ کچھ کہیں بھیجا جاتا ہے۔",
    savedOn: (date: string) => `محفوظ کیا: ${date}`,
    removed: "آپ کی بیاض سے نکال دیا گیا۔",
    undo: "واپس لائیں",
  },
  poster: {
    title: "پوسٹر بنائیں",
    size: "سائز",
    style: "انداز",
    include: "شامل کریں",
    urduAlways: "اردو (ہمیشہ)",
    roman: "رومن",
    meaning: "انگریزی مطلب",
    creditNote: "شاعر کا نام اور شعر کا نشان ہمیشہ شامل رہتے ہیں۔",
    share: "بھیجیں",
    download: "PNG ڈاؤن لوڈ کریں",
    back: "شعر پر واپس",
    loadingFonts: "فونٹ لوڈ ہو رہے ہیں…",
    fontsFailed: "پوسٹر کے فونٹ لوڈ نہیں ہو سکے، اس لیے پوسٹر ٹھیک سے نہیں بن سکتا۔ کنکشن دیکھ کر صفحہ دوبارہ کھولیں۔",
    shareFailed: "بھیجا نہیں جا سکا۔ ڈاؤن لوڈ آزمائیں۔",
    savedFile: (name: string) => `محفوظ ہو گیا: ${name}`,
    sizes: {
      story: ["اسٹوری", "واٹس ایپ یا انسٹاگرام"],
      square: ["مربع", "پوسٹ"],
      portrait: ["عمودی", "پوسٹ"],
      wallpaper: ["وال پیپر", "فون"],
    },
    preview: (size: string, w: number, h: number, extras: string[], poet: string) =>
      `پوسٹر کا نمونہ، ${size} ${formatNumber(w, "ur")} ضرب ${formatNumber(h, "ur")}: اردو میں شعر${
        extras.length ? `، ساتھ ${extras.join(" اور ")}` : ""
      }، ${poet} کے نام کے ساتھ۔`,
  },
  about: {
    title: "شعر کا تعارف",
    what: "شعر ہر روز اردو کا ایک کلاسیکی شعر دکھاتا ہے، سب کے لیے ایک ہی۔ اسے نستعلیق میں، رومن اردو میں، لفظ بہ لفظ یا سادہ انگریزی میں پڑھیں، اور پوسٹر بنا کر دوسروں کو بھیجیں۔",
    poetsTitle: "شعرا",
    editionsTitle: "نسخے",
    editionsIntro: "ہر شعر یہاں آنے سے پہلے کسی مطبوعہ نسخے سے ملایا جاتا ہے۔ استعمال شدہ نسخے:",
    editionsNone: "اشعار کی جانچ کے ساتھ ساتھ نسخوں کی فہرست یہاں آتی جائے گی۔",
    thanksTitle: "شکریہ",
    thanks:
      "بہت سے اشعار کا متن ریختہ کے کھلے ڈیٹا سیٹ سے شروع ہوا، جو اردو شاعری کا عظیم آن لائن کتب خانہ ہے۔ ریختہ کا بہت شکریہ۔",
    copyrightTitle: "حقوق",
    copyright:
      "شعر میں صرف ان شعرا کا کلام شامل ہے جن کا کام عوامی ملکیت میں ہے: مرزا غالب، میر تقی میر، داغ دہلوی، بہادر شاہ ظفر، الطاف حسین حالی، اکبر الہ آبادی، ولی محمد ولی، میر انیس اور ناجی شاکر، اور اقبال کے صرف وہ اشعار جو ۱۹۲۹ سے پہلے شائع ہوئے۔ رومن، مطالب، الفاظ کے معنی اور تبصرے شعر کے لیے لکھے گئے ہیں، ریختہ یا شائع شدہ تراجم سے نقل نہیں کیے گئے۔",
    privacyTitle: "رازداری",
    privacy: "نہ کوئی اکاؤنٹ، نہ کوئی ٹریکنگ۔ آپ کی بیاض اور ترتیبات اسی ڈیوائس پر رہتی ہیں۔",
  },
  moment: {
    "missing-someone": "کسی کی یاد",
    heartbreak: "دل ٹوٹنا",
    longing: "آرزو",
    hope: "امید",
    rain: "بارش",
    night: "رات",
    eid: "عید",
    friendship: "دوستی",
    pride: "فخر",
    "life-is-short": "زندگی مختصر ہے",
    humour: "ظرافت",
  },
};

export const DICTS: Record<Lang, Dict> = { en, ur };

/** Urdu uses Extended Arabic-Indic digits (۱۲۳). */
export const locale = (lang: Lang) => (lang === "ur" ? "ur-PK-u-nu-arabext" : "en-GB");

export function formatNumber(n: number, lang: Lang) {
  return new Intl.NumberFormat(locale(lang)).format(n);
}

export function formatDate(date: Date, lang: Lang, timeZone?: string) {
  return new Intl.DateTimeFormat(locale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(date);
}

const store = createStore<Lang>("sher.lang", (raw) => (raw === '"ur"' ? "ur" : "en"), "en");

/** The interface language; English in server HTML and before hydration. */
export const useLang = store.use;
export const setLang = store.set;

export function useT(): Dict {
  return DICTS[useLang()];
}
