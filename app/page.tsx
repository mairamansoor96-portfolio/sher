import { TodaySher } from "@/components/TodaySher";
import { LAUNCH_DATE, TIME_ZONE } from "@/lib/config";
import { poets, schedule, shers } from "@/lib/content";

export default function TodayPage() {
  return (
    <main className="mx-auto max-w-reading px-gutter py-section">
      <header className="mb-section">
        <h1 className="text-ui-lg font-bold">Sher</h1>
      </header>
      <TodaySher
        shers={shers}
        poets={poets}
        schedule={schedule}
        launchDate={LAUNCH_DATE}
        timeZone={TIME_ZONE}
      />
    </main>
  );
}
