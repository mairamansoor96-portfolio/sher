// Accessibility pass for milestone 7 (SPEC.md, "Accessibility"). Starts a dev
// server (drafts visible), then for every page in English and Urdu, with all
// layers off and on, checks: axe-core WCAG 2.2 AA, lang/dir on all text, 200%
// text at 320px and 390px, 48px touch targets, keyboard focus, screen-reader
// order and reduced motion.
//
//   npm run check:a11y            (uses Chromium from PLAYWRIGHT_BROWSERS_PATH)
//   BASE=http://localhost:3000 npm run check:a11y   (use a running server)

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const shers = JSON.parse(readFileSync("data/shers.json", "utf8"));
const LAUNCH = readFileSync("lib/config.ts", "utf8").match(/LAUNCH_DATE = "([\d-]+)"/)[1];

let server;
let BASE = process.env.BASE;
if (!BASE) {
  BASE = "http://localhost:3999";
  server = spawn("npx", ["next", "dev", "-p", "3999"], { stdio: ["ignore", "pipe", "pipe"], detached: true });
  let log = "";
  let exited = false;
  server.stdout.on("data", (d) => (log += d));
  server.stderr.on("data", (d) => (log += d));
  server.on("exit", () => (exited = true));
  let up = false;
  for (let i = 0; i < 60 && !exited && !up; i++) {
    try { up = (await fetch(BASE)).ok; } catch {}
    if (!up) await new Promise((r) => setTimeout(r, 1000));
  }
  if (!up) {
    console.error(`Could not start the dev server (stop any other \`next dev\` in this folder):\n${log}`);
    if (!exited) process.kill(-server.pid);
    process.exit(1);
  }
}

// Always stop our dev server, even if a check throws.
const stopServer = () => {
  try {
    if (server && server.exitCode === null) process.kill(-server.pid);
  } catch {}
};
process.on("exit", stopServer);
process.on("SIGINT", () => process.exit(130));
process.on("uncaughtException", (e) => {
  console.error(e);
  process.exit(1);
});

const sher = shers.find((s) => s.attribution === "disputed") ?? shers[0];
// The clock is fixed to launch day, so Today shows schedule[0].
const schedule = JSON.parse(readFileSync("data/schedule.json", "utf8"));
const todaySher = shers.find((s) => s.id === schedule[0]);
const moment = shers[0].moments[0];
const ROUTES = ["/", "/moments", `/moments/${moment}`, "/bayaz", `/sher/${sher.id}`, `/sher/${sher.id}/poster`, "/about"];
const ALL_LAYERS = { roman: true, words: true, meaning: true, why: true };

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_BROWSERS_PATH ? { executablePath: `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium` } : {},
).catch(() => chromium.launch());

const failures = [];
const fail = (where, what) => failures.push(`${where}: ${what}`);

async function openPage({ route, lang, layers, width = 390, textScale = 1, reducedMotion = "no-preference" }) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90_000); // the dev server compiles each route on first visit
  const where = `${lang} ${route}`;
  page.on("pageerror", (e) => fail(where, `page error: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && fail(where, `console error: ${m.text().slice(0, 200)}`));
  if (textScale !== 1) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Page.setFontSizes", { fontSizes: { standard: 16 * textScale } });
  }
  await page.clock.setFixedTime(new Date(`${LAUNCH}T07:00:00Z`));
  await page.addInitScript(
    ([lang, layers, saved]) => {
      localStorage.setItem("sher.lang", JSON.stringify(lang));
      localStorage.setItem("sher.layers", JSON.stringify(layers));
      localStorage.setItem("sher.bayaz", JSON.stringify([{ id: saved, savedAt: "2026-10-01T00:00:00.000Z" }]));
    },
    [lang, layers ? ALL_LAYERS : {}, sher.id],
  );
  try {
    await page.goto(BASE + route);
    await page.waitForFunction((l) => document.documentElement.lang === l, lang);
    await page.evaluate(() => document.fonts.ready);
    if (route.endsWith("/poster")) await page.waitForSelector("canvas[data-rendered]");
    else if (["/", "/bayaz"].includes(route) || route.startsWith("/sher/") || route.startsWith("/moments/"))
      await page.waitForSelector("p.whitespace-nowrap");
    await page.waitForTimeout(250);
  } catch (e) {
    await page.screenshot({ path: "a11y-failure.png", fullPage: true }).catch(() => {});
    console.error(`Page did not finish loading: ${where} (screenshot: a11y-failure.png)\n${failures.join("\n")}`);
    throw e;
  }
  return { page, ctx };
}

for (const lang of ["en", "ur"]) {
  for (const route of ROUTES) {
    for (const layers of route === `/sher/${sher.id}` || route === "/" ? [false, true] : [false]) {
      const where = `${lang} ${route}${layers ? " (all layers)" : ""}`;
      const { page, ctx } = await openPage({ route, lang, layers });

      // 1. axe-core, WCAG 2.2 A/AA
      await page.addScriptTag({ content: AXE });
      const axe = await page.evaluate(() =>
        window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }),
      );
      for (const v of axe.violations)
        fail(where, `axe ${v.id}: ${v.help} — ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(", ")}`);

      // 2. lang and dir on every text node
      const langIssues = await page.evaluate((uiLang) => {
        const issues = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const ARABIC = /[؀-ۿ]/;
        const LATIN_WORD = /[A-Za-z]{2,}/;
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const text = n.textContent.trim();
          const el = n.parentElement;
          if (!text || el.closest("script,style,[aria-hidden=true]") || el.closest("nextjs-portal")) continue;
          const lang = el.closest("[lang]")?.getAttribute("lang");
          const dir = el.closest("[dir]")?.getAttribute("dir");
          if (ARABIC.test(text) && (lang !== "ur" || dir !== "rtl"))
            issues.push(`Urdu text without lang=ur dir=rtl: "${text.slice(0, 30)}" (${lang}/${dir})`);
          if (uiLang === "ur" && !ARABIC.test(text) && LATIN_WORD.test(text) && !["en", "ur-Latn"].includes(lang))
            issues.push(`English text without lang=en: "${text.slice(0, 30)}"`);
        }
        return issues;
      }, lang);
      langIssues.forEach((i) => fail(where, i));

      // 3. touch targets ≥ 48px
      const small = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden])")) {
          if (el.closest("nextjs-portal") || !el.checkVisibility()) continue;
          let target = el.matches("input") ? el.closest("label") ?? el : el;
          let { width, height } = target.getBoundingClientRect();
          if (el.classList.contains("gloss-word")) {
            const a = getComputedStyle(el, "::after");
            width = Math.max(width, parseFloat(a.width));
            height = Math.max(height, parseFloat(a.height));
          }
          if (width < 47.5 || height < 47.5) out.push(`${target.tagName} "${target.textContent.trim().slice(0, 20)}" ${Math.round(width)}×${Math.round(height)}`);
        }
        return out;
      });
      small.forEach((s) => fail(where, `touch target under 48px: ${s}`));

      // 4. keyboard: tab through everything, focus always visible, no positive tabindex
      const kb = await page.evaluate(() => {
        const focusable = [...document.querySelectorAll("a[href], button:not([disabled]), input:not([disabled])")]
          .filter((e) => !e.closest("nextjs-portal") && e.checkVisibility());
        return { count: focusable.length, positive: document.querySelectorAll("[tabindex]:not([tabindex='0']):not([tabindex='-1'])").length };
      });
      if (kb.positive) fail(where, `${kb.positive} element(s) with a positive tabindex`);
      const reached = new Set();
      for (let i = 0; i < kb.count + 5; i++) {
        await page.keyboard.press("Tab");
        const f = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body || el.closest("nextjs-portal")) return null;
          const s = getComputedStyle(el);
          const label = el.closest("label");
          const ls = label && getComputedStyle(label);
          const visible = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || (ls && ls.outlineStyle !== "none" && parseFloat(ls.outlineWidth) > 0);
          el.dataset.kbSeen = "1";
          return { id: el.outerHTML.slice(0, 60), visible };
        });
        if (!f) continue;
        reached.add(f.id);
        if (!f.visible) fail(where, `no visible focus indicator on ${f.id}`);
      }
      const unreached = await page.evaluate(() =>
        [...document.querySelectorAll("a[href], button:not([disabled]), input:not([disabled])")]
          .filter((e) => !e.closest("nextjs-portal") && e.checkVisibility() && !e.dataset.kbSeen)
          // radios in a group are reached with arrow keys, one stop per group
          .filter((e) => !(e.type === "radio" && document.querySelector(`input[name="${e.name}"][data-kb-seen]`)))
          .map((e) => e.outerHTML.slice(0, 60)),
      );
      unreached.forEach((u) => fail(where, `not reachable by keyboard: ${u}`));

      // 5. screen-reader order on a couplet with all layers on
      if (layers) {
        const shown = route === "/" ? todaySher : sher;
        const order = await page.evaluate((s) => {
          const t = document.querySelector("main").textContent;
          return [s.lines[0], s.lines[1], s.roman[0], s.roman[1], s.meaningEn].map((x) => t.indexOf(x));
        }, shown);
        const sorted = order.every((v, i) => v >= 0 && (i === 0 || v > order[i - 1]));
        if (!sorted) fail(where, `reading order is not Urdu, Roman, meaning: ${order.join(",")}`);
        const snap = await page.locator("main").ariaSnapshot();
        // One word, since glossed words are separate buttons when Words is on.
        const firstWord = shown.lines[0].split(" ")[0];
        const seen = snap.split(firstWord).length - 1;
        if (seen !== 1) fail(where, `couplet's first word reaches screen readers ${seen} times, not once`);
      }
      await ctx.close();

      // 6. 200% text at phone widths: no sideways scroll, nothing off screen
      for (const width of [320, 390]) {
        const big = await openPage({ route, lang, layers, width, textScale: 2 });
        const res = await big.page.evaluate(() => {
          const off = [];
          for (const el of document.querySelectorAll("main *, header *, nav *")) {
            if (!el.checkVisibility({ visibilityProperty: true }) || el.closest("[aria-hidden=true], .sr-only")) continue;
            const r = el.getBoundingClientRect();
            if (r.width && (r.right > innerWidth + 1 || r.left < -1)) off.push(`${el.tagName}.${el.className.toString().slice(0, 30)}`);
          }
          return { scroll: document.documentElement.scrollWidth > innerWidth, off: off.slice(0, 3) };
        });
        if (res.scroll) fail(`${where} @200% ${width}px`, "horizontal scrolling");
        res.off.forEach((o) => fail(`${where} @200% ${width}px`, `off screen: ${o}`));
        await big.ctx.close();
      }
    }
  }
}

// 7. reduced motion: reveals appear instantly
{
  const { page, ctx } = await openPage({ route: `/sher/${sher.id}`, lang: "en", layers: true, reducedMotion: "reduce" });
  const d = await page.$eval(".reveal", (el) => parseFloat(getComputedStyle(el).animationDuration));
  if (d > 0.001) fail("reduced motion", `reveal animation still ${d}s`);
  await ctx.close();
}

await browser.close();
const pages = ROUTES.length * 2;
if (failures.length) {
  console.log(failures.join("\n"));
  console.log(`\n${failures.length} accessibility problem(s).`);
  process.exit(1);
}
console.log(`Accessibility checks passed: ${ROUTES.length} routes × 2 languages (${pages} pages, plus all-layers variants), 200% text at 320/390px, keyboard, targets, reading order, reduced motion.`);
process.exit(0); // also stops our dev server (see stopServer)
