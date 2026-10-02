import type { Metadata } from "next";
import { BayazList } from "@/components/BayazList";
import { T } from "@/components/T";
import { poets, shers } from "@/lib/content";

export const metadata: Metadata = { title: "Bayaz" };

export default function BayazPage() {
  return (
    <>
      <h1 className="text-ui-lg font-bold">
        <T k="bayaz.title" />
      </h1>
      <p className="mt-1 text-ink-muted">
        <T k="bayaz.intro" />
      </p>
      <BayazList shers={shers} poets={poets} />
    </>
  );
}
