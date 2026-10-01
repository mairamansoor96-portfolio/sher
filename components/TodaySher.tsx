"use client";

import { useSyncExternalStore } from "react";
import { Couplet } from "@/components/Couplet";
import { dateKeyInZone, scheduledId } from "@/lib/today";
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

  if (schedule.length === 0) return <EmptyState />;
  if (todayKey === null) return <div className="min-h-64" aria-busy="true" />;

  const id = scheduledId(schedule, launchDate, todayKey);
  const sher = shers.find((s) => s.id === id);
  if (!sher) return <EmptyState />;
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
      <Couplet sher={sher} />
      {poet && (
        <p className="text-center">
          <span lang="ur" dir="rtl" className="block font-urdu text-poet-ur leading-nastaliq">
            {poet.nameUr}
          </span>
          <span className="block text-ui text-ink-muted">{poet.nameEn}</span>
        </p>
      )}
      {sher.status === "draft" && (
        <p className="mt-section text-center text-ui-sm text-accent">
          Draft — visible in development only
        </p>
      )}
    </article>
  );
}

function EmptyState() {
  return (
    <section className="py-section text-center">
      <h2 className="text-ui-lg font-bold">The first couplet is on its way</h2>
      <p className="mt-4 text-ink-muted">
        Every couplet is checked against a printed edition before it appears here.
        Please come back soon.
      </p>
    </section>
  );
}
