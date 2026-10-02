import type { Metadata } from "next";
import { BayazList } from "@/components/BayazList";
import { poets, shers } from "@/lib/content";

export const metadata: Metadata = { title: "Bayaz" };

export default function BayazPage() {
  return (
    <>
      <h1 className="text-ui-lg font-bold">
        Bayaz{" "}
        <span lang="ur" dir="rtl" className="font-urdu font-normal leading-nastaliq text-ink-muted">
          بیاض
        </span>
      </h1>
      <p className="mt-1 text-ink-muted">Your notebook of couplets, kept on this device.</p>
      <BayazList shers={shers} poets={poets} />
    </>
  );
}
