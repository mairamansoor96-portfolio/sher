"use client";

import { useEffect, useState } from "react";

/**
 * Shares the couplet's own URL (it holds only the id, never anything
 * personal): the Web Share API where available, else copy to clipboard.
 */
export function ShareLink({ id, title }: { id: string; title: string }) {
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(""), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  async function share() {
    const url = new URL(`/sher/${id}`, window.location.origin).href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return; // reader cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied");
    } catch {
      setStatus(`Copy this link: ${url}`);
    }
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={share}
        className="min-h-touch rounded-md border border-ink px-4 text-ui focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Share link
      </button>
      <p role="status" className="mt-2 min-h-6 break-all text-ui-sm text-ink-muted">
        {status}
      </p>
    </div>
  );
}
