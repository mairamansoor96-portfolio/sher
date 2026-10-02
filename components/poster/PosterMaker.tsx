"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getStyle, POSTER_STYLES } from "@/components/poster/styles";
import { loadPosterFonts, readTheme } from "@/lib/poster/canvas";
import { getSize, POSTER_SIZES } from "@/lib/poster/options";
import { setPosterOption, usePosterOptions } from "@/lib/poster/prefs";
import { useIsClient } from "@/lib/storage";
import type { Poet, Sher } from "@/lib/types";

const CHOICE =
  "flex min-h-touch cursor-pointer items-center gap-3 rounded-md border border-rule px-4 has-checked:border-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent";
const BUTTON =
  "min-h-touch rounded-md border border-ink px-4 text-ui focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * The preview canvas IS the export: it is drawn at full poster size and only
 * scaled down by CSS, so what you see is exactly what is shared or saved.
 */
export function PosterMaker({ sher, poet }: { sher: Sher; poet?: Poet }) {
  const options = usePosterOptions();
  const size = getSize(options.size);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fonts, setFonts] = useState<"loading" | "ready" | "failed">("loading");
  const [status, setStatus] = useState("");
  const isClient = useIsClient();

  useEffect(() => {
    let alive = true;
    const { fonts: f } = readTheme();
    loadPosterFonts(f, {
      urdu: sher.lines.join(" ") + (poet?.nameUr ?? ""),
      ui: [...sher.roman, sher.meaningEn, poet?.nameEn ?? "", "Sher"].join(" "),
    }).then((ok) => alive && setFonts(ok ? "ready" : "failed"));
    return () => {
      alive = false;
    };
  }, [sher, poet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (fonts !== "ready" || !canvas || !ctx) return;
    canvas.width = size.width;
    canvas.height = size.height;
    const { fonts: f, colors } = readTheme();
    const layout = getStyle(options.style).render(ctx, {
      sher,
      poet,
      roman: options.roman,
      meaning: options.meaning,
      width: size.width,
      height: size.height,
      fonts: f,
      colors,
    });
    canvas.dataset.layout = JSON.stringify(layout); // for automated checks
    canvas.dataset.rendered = `${size.id}:${options.style}:${options.roman}:${options.meaning}`;
  }, [fonts, size, options, sher, poet]);

  const fileName = `sher-${sher.id}-${size.id}.png`;
  const toFile = () =>
    new Promise<File | null>((resolve) =>
      canvasRef.current?.toBlob((b) => resolve(b && new File([b], fileName, { type: "image/png" })), "image/png"),
    );

  const canShareFiles =
    isClient &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] });

  async function share() {
    const file = await toFile();
    if (!file) return;
    try {
      await navigator.share({
        files: [file],
        title: poet ? `${poet.nameEn} — Sher` : "Sher",
        url: new URL(`/sher/${sher.id}`, window.location.origin).href,
      });
    } catch (e) {
      if ((e as DOMException).name !== "AbortError") setStatus("Sharing didn’t work. Try Download instead.");
    }
  }

  async function download() {
    const file = await toFile();
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(`Saved ${fileName}`);
  }

  const parts = [options.roman && "Roman", options.meaning && "English meaning"].filter(Boolean);

  return (
    <div className="flex flex-col gap-section">
      <div className="text-center">
        {fonts === "failed" ? (
          <p role="alert" className="py-section text-ink">
            The poster fonts couldn’t load, so the poster can’t be drawn properly. Check your
            connection and reload.
          </p>
        ) : (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Poster preview, ${size.label} ${size.width} by ${size.height}: the couplet in Urdu${
              parts.length ? ` with ${parts.join(" and ")}` : ""
            }, credited to ${poet?.nameEn ?? "the poet"}.`}
            width={size.width}
            height={size.height}
            className="mx-auto block h-auto w-auto max-w-full border border-rule"
            style={{ aspectRatio: `${size.width} / ${size.height}`, maxHeight: "var(--poster-preview-max-h)" }}
          />
        )}
        {fonts === "loading" && <p className="mt-2 text-ui-sm text-ink-muted">Loading fonts…</p>}
      </div>

      <fieldset>
        <legend className="mb-2 text-ui font-bold">Size</legend>
        <div className="grid grid-cols-2 gap-2">
          {POSTER_SIZES.map((s) => (
            <label key={s.id} className={CHOICE}>
              <input
                type="radio"
                name="size"
                value={s.id}
                checked={options.size === s.id}
                onChange={() => setPosterOption("size", s.id)}
                className="size-5 shrink-0 accent-ink"
              />
              <span className="flex flex-col py-2 leading-tight">
                <span>{s.label}</span>
                <span className="text-ui-sm text-ink-muted">
                  {s.hint} · {s.width}×{s.height}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-ui font-bold">Style</legend>
        <div className="grid grid-cols-2 gap-2">
          {POSTER_STYLES.map((s) => (
            <label key={s.id} className={CHOICE}>
              <input
                type="radio"
                name="style"
                value={s.id}
                checked={options.style === s.id}
                onChange={() => setPosterOption("style", s.id)}
                className="size-5 shrink-0 accent-ink"
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-ui font-bold">Include</legend>
        <div className="flex flex-col gap-2">
          <label className={`${CHOICE} cursor-default`}>
            <input type="checkbox" checked disabled className="size-5 shrink-0 accent-ink" />
            Urdu (always)
          </label>
          <label className={CHOICE}>
            <input
              type="checkbox"
              checked={options.roman}
              onChange={(e) => setPosterOption("roman", e.target.checked)}
              className="size-5 shrink-0 accent-ink"
            />
            Roman
          </label>
          <label className={CHOICE}>
            <input
              type="checkbox"
              checked={options.meaning}
              onChange={(e) => setPosterOption("meaning", e.target.checked)}
              className="size-5 shrink-0 accent-ink"
            />
            English meaning
          </label>
        </div>
        <p className="mt-2 text-ui-sm text-ink-muted">
          The poet’s name and the Sher mark are always included.
        </p>
      </fieldset>

      <div className="text-center">
        <div className="flex flex-wrap justify-center gap-2">
          {canShareFiles && (
            <button type="button" onClick={share} disabled={fonts !== "ready"} className={BUTTON}>
              Share
            </button>
          )}
          <button type="button" onClick={download} disabled={fonts !== "ready"} className={BUTTON}>
            Download PNG
          </button>
        </div>
        <p role="status" className="mt-2 min-h-6 text-ui-sm text-ink-muted">
          {status}
        </p>
        <Link
          href={`/sher/${sher.id}`}
          className="inline-flex min-h-touch items-center text-ui-sm text-ink-muted underline underline-offset-4"
        >
          Back to the couplet
        </Link>
      </div>
    </div>
  );
}
