import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SherListItem } from "@/components/SherListItem";
import { T } from "@/components/T";
import { getPoet, moments, PLACEHOLDER_PARAM, shersForMoment } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return moments.length
    ? moments.map((m) => ({ moment: m.key }))
    : [{ moment: PLACEHOLDER_PARAM }];
}

const findMoment = (key: string) => moments.find((m) => m.key === key);

export async function generateMetadata({
  params,
}: PageProps<"/moments/[moment]">): Promise<Metadata> {
  const moment = findMoment((await params).moment);
  return moment ? { title: moment.label } : {};
}

export default async function MomentPage({ params }: PageProps<"/moments/[moment]">) {
  const moment = findMoment((await params).moment);
  if (!moment) notFound();
  return (
    <>
      <Link
        href="/moments"
        className="inline-flex min-h-touch min-w-touch items-center text-ui-sm text-ink-muted underline underline-offset-4"
      >
        <T k="moments.all" />
      </Link>
      <h1 className="text-ui-lg font-bold">
        <T k={`moment.${moment.key}`} />
      </h1>
      <ul className="mt-6 flex flex-col gap-4">
        {shersForMoment(moment.key).map((sher) => (
          <SherListItem key={sher.id} sher={sher} poet={getPoet(sher.poet)} />
        ))}
      </ul>
    </>
  );
}
