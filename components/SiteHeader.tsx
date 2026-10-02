"use client";

import Link from "next/link";
import { useEffect } from "react";
import { setLang, useLang, useT } from "@/lib/i18n";

const LINK =
  "inline-flex min-h-touch min-w-touch items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Brand, About and the interface language toggle. Also keeps <html lang dir> in sync. */
export function SiteHeader() {
  const lang = useLang();
  const t = useT();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const other = lang === "ur" ? "en" : "ur";
  return (
    <header className="mb-section flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <Link href="/" className={`${LINK} text-ui-lg font-bold`}>
        {t.brand}
      </Link>
      <nav aria-label={t.nav.about} className="flex flex-wrap items-center gap-2 text-ui">
        <Link href="/about" className={`${LINK} px-2 underline underline-offset-4`}>
          {t.nav.about}
        </Link>
        {/* Named in the language it switches to, so each reader can find it. */}
        <button
          type="button"
          lang={other}
          dir={other === "ur" ? "rtl" : "ltr"}
          onClick={() => setLang(other)}
          className={`${LINK} rounded-md border border-ink px-3 ${other === "ur" ? "font-urdu leading-nastaliq" : "font-ui"}`}
        >
          {t.langSwitch}
        </button>
      </nav>
    </header>
  );
}
