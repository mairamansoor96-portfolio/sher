import type { Sher } from "@/lib/types";

/**
 * The two misras in Noto Nastaliq Urdu. Milestone 2 adds the equal-width
 * balancing rule; until then lines are simply centred.
 * No overflow: hidden here or on any ancestor — it clips Nastaliq dots.
 */
export function Couplet({ sher }: { sher: Sher }) {
  return (
    <div
      lang="ur"
      dir="rtl"
      className="py-couplet-pad text-center font-urdu text-couplet leading-nastaliq"
    >
      <p>{sher.lines[0]}</p>
      <p>{sher.lines[1]}</p>
    </div>
  );
}
