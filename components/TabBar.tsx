"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Bayaz joins in milestone 5.
const TABS = [
  { href: "/", label: "Today" },
  { href: "/moments", label: "Moments" },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 border-t border-rule bg-paper">
      <ul className="mx-auto flex max-w-reading">
        {TABS.map(({ href, label }) => {
          const current = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className="flex min-h-touch items-center justify-center text-ui text-ink-muted aria-[current=page]:font-bold aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:underline-offset-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
