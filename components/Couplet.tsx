"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { balance, type Balance } from "@/lib/balance";
import type { Sher } from "@/lib/types";

const SIZE_TOKEN = {
  today: "--text-couplet",
  list: "--text-couplet-list",
} as const;

interface Props {
  sher: Sher;
  size?: keyof typeof SIZE_TOKEN;
}

/**
 * The two misras in Noto Nastaliq Urdu, set to equal width as in calligraphy
 * (SPEC.md, "Couplet typography"):
 * - a hidden copy measures each line's natural width at the base size;
 * - both lines shrink together until the wider one fits;
 * - the shorter line is stretched by widening word spaces only (justify),
 *   unless that needs more than 40% extra, when it stays natural and centred.
 * Never use letter-spacing here, and never overflow: hidden — it clips Nastaliq.
 */
export function Couplet({ sher, size = "today" }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const measure0 = useRef<HTMLSpanElement>(null);
  const measure1 = useRef<HTMLSpanElement>(null);
  const [layout, setLayout] = useState<Balance | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const m0 = measure0.current;
    const m1 = measure1.current;
    if (!box || !m0 || !m1) return;

    const update = () => {
      const next = balance(
        [m0.getBoundingClientRect().width, m1.getBoundingClientRect().width],
        box.clientWidth,
      );
      setLayout((prev) =>
        prev &&
        prev.stretch === next.stretch &&
        Math.abs(prev.scale - next.scale) < 0.001 &&
        Math.abs(prev.width - next.width) < 0.5
          ? prev
          : next,
      );
    };

    // Fires on first observe, on resize, on text-size changes (the hidden copy
    // is sized in rem) and when the web font swaps in.
    const observer = new ResizeObserver(update);
    observer.observe(box);
    observer.observe(m0);
    observer.observe(m1);
    document.fonts?.ready.then(update);
    return () => observer.disconnect();
  }, [sher.id, size]);

  const baseSize = `var(${SIZE_TOKEN[size]})`;
  // Before the first measurement (server HTML, no JS) lines wrap and centre,
  // so nothing can overflow.
  const lineClass = !layout
    ? "block text-center"
    : layout.stretch
      ? "block whitespace-nowrap text-justify [text-align-last:justify] [text-justify:inter-word]"
      : "block whitespace-nowrap text-center";

  return (
    <div ref={boxRef} className="relative py-couplet-pad">
      <div
        lang="ur"
        dir="rtl"
        className="mx-auto font-urdu leading-nastaliq"
        style={{
          fontSize: layout ? `calc(${baseSize} * ${layout.scale})` : baseSize,
          width: layout ? `${Math.ceil(layout.width) + 1}px` : undefined,
          maxWidth: "100%",
        }}
      >
        <p className={lineClass}>{sher.lines[0]}</p>
        <p className={lineClass}>{sher.lines[1]}</p>
      </div>

      {/* Hidden measuring copy: natural widths at the base size. */}
      <div
        aria-hidden="true"
        lang="ur"
        dir="rtl"
        className="invisible pointer-events-none absolute top-0 right-0 font-urdu leading-nastaliq whitespace-nowrap"
        style={{ fontSize: baseSize }}
      >
        <span ref={measure0} className="block w-max">{sher.lines[0]}</span>
        <span ref={measure1} className="block w-max">{sher.lines[1]}</span>
      </div>
    </div>
  );
}
