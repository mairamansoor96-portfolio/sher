import type { Metadata } from "next";
import { T, type TPath } from "@/components/T";
import { poets, shers } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

/** Distinct printed editions the visible couplets were checked against. */
const editions = [
  ...new Set(
    shers
      .filter((s) => s.source.edition)
      .map((s) => `${s.source.work}, ${s.source.edition}`),
  ),
].sort();

function Section({ title, children }: { title: TPath; children: React.ReactNode }) {
  return (
    <section className="mt-section">
      <h2 className="text-ui-lg font-bold">
        <T k={title} />
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <h1 className="text-ui-lg font-bold">
        <T k="about.title" />
      </h1>
      <p className="mt-2">
        <T k="about.what" />
      </p>

      <Section title="about.poetsTitle">
        <ul className="flex flex-col gap-6">
          {poets.map((p) => (
            <li key={p.key}>
              <p className="font-bold">
                <span lang="ur" dir="rtl" className="font-urdu text-poet-ur leading-nastaliq">
                  {p.nameUr}
                </span>{" "}
                · <span lang="en" dir="ltr">{p.nameEn}</span>{" "}
                <span className="font-normal text-ink-muted" dir="ltr">
                  ({p.years})
                </span>
              </p>
              <p lang="en" dir="ltr" className="mt-1 text-ink-muted">
                {p.bioEn}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="about.editionsTitle">
        {editions.length ? (
          <>
            <p>
              <T k="about.editionsIntro" />
            </p>
            <ul className="mt-2 list-disc ps-6">
              {editions.map((e) => (
                <li key={e} lang="en" dir="ltr">
                  {e}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            <T k="about.editionsNone" />
          </p>
        )}
      </Section>

      <Section title="about.thanksTitle">
        <p>
          <T k="about.thanks" />
        </p>
        <a
          href="https://www.rekhta.org"
          lang="en"
          dir="ltr"
          className="inline-flex min-h-touch items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
        >
          rekhta.org
        </a>
      </Section>

      <Section title="about.copyrightTitle">
        <p>
          <T k="about.copyright" />
        </p>
      </Section>

      <Section title="about.privacyTitle">
        <p>
          <T k="about.privacy" />
        </p>
      </Section>
    </>
  );
}
