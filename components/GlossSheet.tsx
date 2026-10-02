"use client";

import { useEffect, useId, useRef } from "react";
import type { Gloss } from "@/lib/types";

interface Props {
  gloss: Gloss;
  /** Called after the sheet closes (Escape, Close, or a tap outside). */
  onClose: () => void;
}

/**
 * A small bottom sheet for one glossed word: the word in Nastaliq, its Roman
 * form and its meaning. A native modal <dialog>, so focus is trapped and
 * Escape works; the parent returns focus to the word on close.
 */
export function GlossSheet({ gloss, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // The inner div fills the dialog, so a click on the dialog itself is a
      // click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="mx-auto mt-auto mb-0 w-full max-w-reading rounded-t-md border-t border-rule bg-paper p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="reveal px-gutter pt-6 pb-8 text-center">
        <h2
          id={titleId}
          lang="ur"
          dir="rtl"
          className="py-2 font-urdu text-couplet leading-nastaliq"
        >
          {gloss.word}
        </h2>
        <p lang="ur-Latn" className="text-ui-lg font-bold">
          {gloss.roman}
        </p>
        <p className="mt-2">{gloss.meaning}</p>
        <form method="dialog" className="mt-6">
          <button
            type="submit"
            className="min-h-touch min-w-touch rounded-md border border-ink px-6 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Close
          </button>
        </form>
      </div>
    </dialog>
  );
}
