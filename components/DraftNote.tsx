import type { Sher } from "@/lib/types";

export function DraftNote({ sher }: { sher: Sher }) {
  if (sher.status !== "draft") return null;
  return (
    <p className="mt-section text-center text-ui-sm text-accent">
      Draft — visible in development only
    </p>
  );
}
