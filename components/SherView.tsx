"use client";

import { useState } from "react";
import { Couplet } from "@/components/Couplet";
import { GlossSheet } from "@/components/GlossSheet";
import { SherActions } from "@/components/SherActions";
import { useT } from "@/lib/i18n";
import { setLayer, useLayers, type Layer } from "@/lib/layers";
import type { Gloss, Poet, Sher } from "@/lib/types";

interface Props {
  sher: Sher;
  poet?: Poet;
}

/**
 * A couplet with its understanding layers: the poem, the poet, the layer
 * toggles and whichever layers are on, then source and attribution, which
 * always show. Used by Today and (milestone 4) couplet pages.
 */
export function SherView({ sher, poet }: Props) {
  const layers = useLayers();
  const t = useT();
  const [open, setOpen] = useState<{ gloss: Gloss; trigger: HTMLElement } | null>(null);

  const controls: { layer: Layer; label: string; show: boolean }[] = [
    { layer: "roman", label: t.layers.roman, show: true },
    { layer: "words", label: t.layers.words, show: sher.glossary.length > 0 },
    { layer: "meaning", label: t.layers.meaning, show: true },
    { layer: "why", label: t.layers.why, show: Boolean(sher.whyItLands) },
  ];

  const closeSheet = () => {
    const trigger = open?.trigger;
    setOpen(null);
    trigger?.focus();
  };

  return (
    <>
      <Couplet
        sher={sher}
        roman={layers.roman}
        onGloss={layers.words ? (gloss, trigger) => setOpen({ gloss, trigger }) : undefined}
      />

      {poet && (
        <p className="text-center">
          <span lang="ur" dir="rtl" className="block font-urdu text-poet-ur leading-nastaliq">
            {poet.nameUr}
          </span>
          <span lang="en" dir="ltr" className="block text-ui text-ink-muted">
            {poet.nameEn}
          </span>
        </p>
      )}

      <div
        role="group"
        aria-label={t.layers.group}
        className="mt-section flex flex-wrap justify-center gap-2"
      >
        {controls
          .filter((c) => c.show)
          .map(({ layer, label }) => (
            <button
              key={layer}
              type="button"
              aria-pressed={layers[layer]}
              onClick={() => setLayer(layer, !layers[layer])}
              className="min-h-touch rounded-md border border-ink px-4 text-ui aria-pressed:bg-ink aria-pressed:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {label}
            </button>
          ))}
      </div>

      {layers.meaning && (
        <section aria-label={t.layers.meaning} className="reveal mt-section">
          <h3 className="text-ui-sm font-bold text-ink-muted">{t.layers.meaning}</h3>
          <p lang="en" dir="ltr" className="mt-1 text-ui-lg">
            {sher.meaningEn}
          </p>
          {sher.meaningUr && (
            <p lang="ur" dir="rtl" className="mt-2 font-urdu text-poet-ur leading-nastaliq">
              {sher.meaningUr}
            </p>
          )}
        </section>
      )}

      {layers.why && sher.whyItLands && (
        <section aria-label={t.layers.why} className="reveal mt-section">
          <h3 className="text-ui-sm font-bold text-ink-muted">{t.layers.why}</h3>
          <p lang="en" dir="ltr" className="mt-1">
            {sher.whyItLands}
          </p>
        </section>
      )}

      <div className="mt-section">
        <SherActions id={sher.id} title={`${sher.roman[0]}${poet ? ` — ${poet.nameEn}` : ""}`} />
      </div>

      <footer className="mt-section border-t border-rule pt-4 text-ui-sm text-ink-muted">
        <p>
          {t.sher.source}{" "}
          <span lang="en" dir="ltr">
            <cite>{sher.source.work}</cite>
            {sher.source.edition && `, ${sher.source.edition}`}
            {sher.source.page && `, p. ${sher.source.page}`}
          </span>
        </p>
        {sher.attribution === "disputed" && (
          <p className="mt-1">
            <strong className="text-ink">{t.sher.disputed}</strong>{" "}
            <span lang="en" dir="ltr">{sher.attributionNote}</span>
          </p>
        )}
      </footer>

      {open && <GlossSheet gloss={open.gloss} onClose={closeSheet} />}
    </>
  );
}
