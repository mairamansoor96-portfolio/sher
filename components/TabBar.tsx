"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";

const TABS = [
  { href: "/", key: "today" },
  { href: "/moments", key: "moments" },
  { href: "/bayaz", key: "bayaz" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav aria-label={t.nav.main} className="fixed inset-x-0 bottom-0 border-t border-rule bg-paper">
      <ul className="mx-auto flex max-w-reading">
        {TABS.map(({ href, key }) => {
          const current = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className="flex min-h-touch items-center justify-center text-ui text-ink-muted aria-[current=page]:font-bold aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:underline-offset-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                {t.nav[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
