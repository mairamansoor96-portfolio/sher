import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DraftNote } from "@/components/DraftNote";
import { SherView } from "@/components/SherView";
import { getPoet, getSher, PLACEHOLDER_PARAM, shers } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return shers.length ? shers.map((s) => ({ id: s.id })) : [{ id: PLACEHOLDER_PARAM }];
}

export async function generateMetadata({ params }: PageProps<"/sher/[id]">): Promise<Metadata> {
  const sher = getSher((await params).id);
  if (!sher) return {};
  const poet = getPoet(sher.poet);
  return {
    title: `${sher.roman[0]}${poet ? ` — ${poet.nameEn}` : ""}`,
    description: sher.meaningEn,
  };
}

export default async function SherPage({ params }: PageProps<"/sher/[id]">) {
  const sher = getSher((await params).id);
  if (!sher) notFound();
  const poet = getPoet(sher.poet);
  return (
    <article>
      <h1 className="sr-only">Couplet{poet ? ` by ${poet.nameEn}` : ""}</h1>
      <SherView sher={sher} poet={poet} />
      <DraftNote sher={sher} />
    </article>
  );
}
