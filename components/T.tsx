"use client";

import { useT, type Dict } from "@/lib/i18n";

type Leaf = string | ((...args: never[]) => string);
type Paths<T> = {
  [K in keyof T & string]: T[K] extends Leaf
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${Paths<T[K]>}`
      : never;
}[keyof T & string];

export type TPath = Paths<Dict>;

/**
 * Interface text for Server Components, which can't pass functions to the
 * client: <T k="moments.title" /> or <T k="moments.count" args={[3]} />.
 */
export function T({ k, args = [] }: { k: TPath; args?: (string | number)[] }) {
  const value = k.split(".").reduce<unknown>((o, key) => (o as Record<string, unknown>)[key], useT());
  return typeof value === "function" ? (value as (...a: unknown[]) => string)(...args) : (value as string);
}
