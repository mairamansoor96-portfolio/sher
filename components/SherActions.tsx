"use client";

import { useEffect, useState } from "react";
import { toggleSaved, useIsSaved } from "@/lib/bayaz-store";
import { shareSher } from "@/lib/share";

const BUTTON =
  "min-h-touch rounded-md border border-ink px-4 text-ui aria-pressed:bg-ink aria-pressed:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Save to bayaz (one tap, toggles) and Share link, with a brief confirmation. */
export function SherActions({ id, title }: { id: string; title: string }) {
  const saved = useIsSaved(id);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(""), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => {
            toggleSaved(id);
            setStatus(saved ? "Removed from your bayaz" : "Saved to your bayaz");
          }}
          className={BUTTON}
        >
          {saved && <span aria-hidden="true">✓ </span>}
          Save to bayaz
        </button>
        <button type="button" onClick={async () => setStatus(await shareSher(id, title))} className={BUTTON}>
          Share link
        </button>
      </div>
      <p role="status" className="mt-2 min-h-6 break-all text-ui-sm text-ink-muted">
        {status}
      </p>
    </div>
  );
}
