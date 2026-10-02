import { T } from "@/components/T";
import { TodaySher } from "@/components/TodaySher";
import { LAUNCH_DATE, TIME_ZONE } from "@/lib/config";
import { poets, schedule, shers } from "@/lib/content";

export default function TodayPage() {
  return (
    <>
      <h1 className="sr-only">
        <T k="today.heading" />
      </h1>
      <TodaySher
        shers={shers}
        poets={poets}
        schedule={schedule}
        launchDate={LAUNCH_DATE}
        timeZone={TIME_ZONE}
      />
    </>
  );
}
