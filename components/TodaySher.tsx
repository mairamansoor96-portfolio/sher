"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { DraftNote } from "@/components/DraftNote";
import { EmptyState } from "@/components/EmptyState";
import { SherView } from "@/components/SherView";
import { addDays, dateKeyInZone, scheduledId } from "@/lib/today";
import type { Poet, Sher } from "@/lib/types";

interface Props {
  shers: Sher[];
  poets: Poet[];
  schedule: string[];
  launchDate: string;
  timeZone: string;
}

// Re-check the date every minute and when the tab becomes visible, so a page
// left open past midnight in Pakistan moves to the new day.
function subscribe(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export function TodaySher({ shers, poets, schedule, launchDate, timeZone }: Props) {
  // The static HTML is built once, so "today" is only known in the browser.
  // The server snapshot is null and the couplet appears on hydration.
  const todayKey = useSyncExternalStore(
    subscribe,
    () => dateKeyInZone(new Date(), timeZone),
    () => null,
  );

  if (schedule.length === 0) return NOTHING_YET;
  if (todayKey === null) return <div className="min-h-64" aria-busy="true" />;

  const id = scheduledId(schedule, launchDate, todayKey);
  const sher = shers.find((s) => s.id === id);
  if (!sher) return NOTHING_YET;
  const poet = poets.find((p) => p.key === sher.poet);

  const [y, m, d] = todayKey.split("-").map(Number);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));

  return (
    <article aria-labelledby="today-heading">
      <h2 id="today-heading" className="text-ui-sm text-ink-muted">
        <span className="sr-only">Today’s couplet, </span>
        <time dateTime={todayKey}>{dateLabel}</time>
      </h2>
      <SherView sher={sher} poet={poet} />
      <nav aria-label="Other days" className="mt-6 flex justify-center gap-6 text-ui-sm">
        {(
          [
            ["Yesterday", -1],
            ["Tomorrow", 1],
          ] as const
        ).map(([label, offset]) => (
          <Link
            key={label}
            href={`/sher/${scheduledId(schedule, launchDate, addDays(todayKey, offset))}`}
            className="inline-flex min-h-touch items-center px-2 text-ink-muted underline underline-offset-4"
          >
            {label}
          </Link>
        ))}
      </nav>
      <DraftNote sher={sher} />
    </article>
  );
}

const NOTHING_YET = (
  <EmptyState title="The first couplet is on its way">
    Every couplet is checked against a printed edition before it appears here. Please come back
    soon.
  </EmptyState>
);
