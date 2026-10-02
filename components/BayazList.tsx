"use client";

import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { SherListItem } from "@/components/SherListItem";
import type { BayazEntry } from "@/lib/bayaz";
import { restoreEntry, toggleSaved, useBayaz } from "@/lib/bayaz-store";
import { useIsClient } from "@/lib/storage";
import type { Poet, Sher } from "@/lib/types";

const savedOn = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Saved couplets, newest first. Read from this device, so client-only. */
export function BayazList({ shers, poets }: { shers: Sher[]; poets: Poet[] }) {
  const isClient = useIsClient();
  const entries = useBayaz();
  const [removed, setRemoved] = useState<BayazEntry | null>(null);
  const undoRef = useRef<HTMLButtonElement>(null);

  // The removed card's button is gone, so move focus to Undo.
  useEffect(() => {
    if (removed) undoRef.current?.focus();
  }, [removed]);

  if (!isClient) return <div aria-busy="true" className="min-h-64" />;

  // Entries for couplets this build doesn't show (e.g. a draft) are skipped.
  const items = entries.flatMap((entry) => {
    const sher = shers.find((s) => s.id === entry.id);
    return sher ? [{ entry, sher }] : [];
  });

  return (
    <>
      <div role="status" className="mt-4 min-h-touch">
        {removed && (
          <p className="flex flex-wrap items-center gap-2 text-ui-sm text-ink-muted">
            Removed from your bayaz.
            <button
              ref={undoRef}
              type="button"
              onClick={() => {
                restoreEntry(removed);
                setRemoved(null);
              }}
              className="min-h-touch px-2 text-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Undo
            </button>
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="Your bayaz is empty">
          A bayaz is a personal notebook where lovers of poetry copy out the couplets they want to
          keep. Tap “Save to bayaz” on any couplet and it will appear here. It stays on this device:
          no account, nothing sent anywhere.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-6">
          {items.map(({ entry, sher }) => (
            <SherListItem key={sher.id} sher={sher} poet={poets.find((p) => p.key === sher.poet)}>
              <div className="mt-1 flex items-center justify-between gap-2 text-ui-sm text-ink-muted">
                <span>Saved {savedOn.format(new Date(entry.savedAt))}</span>
                <button
                  type="button"
                  aria-pressed="true"
                  aria-describedby={`saved-${sher.id}`}
                  onClick={() => {
                    toggleSaved(sher.id);
                    setRemoved(entry);
                  }}
                  className="min-h-touch rounded-md border border-ink bg-ink px-4 text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span aria-hidden="true">✓ </span>Save to bayaz
                </button>
                <span id={`saved-${sher.id}`} className="sr-only">
                  {sher.roman[0]}
                </span>
              </div>
            </SherListItem>
          ))}
        </ul>
      )}
    </>
  );
}
