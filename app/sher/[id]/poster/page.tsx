import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PosterMaker } from "@/components/poster/PosterMaker";
import { T } from "@/components/T";
import { getPoet, getSher, PLACEHOLDER_PARAM, shers } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return shers.length ? shers.map((s) => ({ id: s.id })) : [{ id: PLACEHOLDER_PARAM }];
}

export const metadata: Metadata = { title: "Make a poster", robots: { index: false } };

export default async function PosterPage({ params }: PageProps<"/sher/[id]/poster">) {
  const sher = getSher((await params).id);
  if (!sher) notFound();
  return (
    <>
      <h1 className="mb-6 text-ui-lg font-bold">
        <T k="poster.title" />
      </h1>
      <PosterMaker sher={sher} poet={getPoet(sher.poet)} />
    </>
  );
}
