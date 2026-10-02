"use client";

import { useT } from "@/lib/i18n";
import type { Sher } from "@/lib/types";

export function DraftNote({ sher }: { sher: Sher }) {
  const t = useT();
  if (sher.status !== "draft") return null;
  return (
    <p className="mt-section text-center text-ui-sm text-accent">
      {t.sher.draft}
    </p>
  );
}
