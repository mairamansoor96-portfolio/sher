import Link from "next/link";
import { Couplet } from "@/components/Couplet";
import { firstSentence } from "@/lib/moments";
import type { Poet, Sher } from "@/lib/types";

/** A couplet in a list: Urdu, Roman and a one-line meaning, linking to its page. */
export function SherListItem({ sher, poet }: { sher: Sher; poet?: Poet }) {
  return (
    <li>
      <Link
        href={`/sher/${sher.id}`}
        className="block rounded-md border border-rule px-gutter pb-4 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Couplet sher={sher} size="list" roman />
        <p className="text-ui">{firstSentence(sher.meaningEn)}</p>
        {poet && <p className="mt-1 text-ui-sm text-ink-muted">{poet.nameEn}</p>}
      </Link>
    </li>
  );
}
