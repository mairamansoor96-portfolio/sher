import type { Dict } from "./i18n";

/**
 * Shares a couplet's own URL (it holds only the id, never anything personal):
 * the Web Share API where available, else copy to clipboard. Returns a short
 * confirmation to announce, or "" when the reader cancelled.
 */
export async function shareSher(id: string, title: string, t: Dict): Promise<string> {
  const url = new URL(`/sher/${id}`, window.location.origin).href;
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return "";
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return "";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return t.actions.copied;
  } catch {
    return t.actions.copyThis(url);
  }
}
