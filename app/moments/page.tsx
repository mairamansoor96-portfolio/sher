import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { moments, shersForMoment } from "@/lib/content";

export const metadata: Metadata = { title: "Moments" };

export default function MomentsPage() {
  return (
    <>
      <h1 className="text-ui-lg font-bold">Moments</h1>
      <p className="mt-1 text-ink-muted">Words for a moment in your life.</p>
      {moments.length === 0 ? (
        <EmptyState title="Moments are on their way">
          Couplets appear here once they have been checked against a printed edition.
        </EmptyState>
      ) : (
        <ul className="mt-section grid grid-cols-2 gap-2">
          {moments.map(({ key, label }) => {
            const n = shersForMoment(key).length;
            return (
              <li key={key}>
                <Link
                  href={`/moments/${key}`}
                  className="flex min-h-touch flex-col justify-center rounded-md border border-rule px-4 py-3 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="text-ui font-bold">{label}</span>
                  <span className="text-ui-sm text-ink-muted">
                    {n} {n === 1 ? "couplet" : "couplets"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
