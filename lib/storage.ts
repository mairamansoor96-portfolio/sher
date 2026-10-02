// A tiny localStorage-backed store for per-device state (layers, bayaz).
// localStorage can throw (private mode, blocked storage), so every access is
// wrapped and the store falls back to in-memory state for the visit.

import { useSyncExternalStore } from "react";

export interface Store<T> {
  get(): T;
  set(next: T): void;
  /** Current value; `initial` in server HTML and before hydration. */
  use(): T;
}

export function createStore<T>(key: string, parse: (raw: string | null) => T, initial: T): Store<T> {
  let memory: { value: T } | null = null;
  let cachedRaw: string | null | undefined;
  let cached = initial;
  const listeners = new Set<() => void>();

  function get(): T {
    if (memory) return memory.value;
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return initial;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cached = parse(raw);
      } catch {
        cached = initial;
      }
    }
    return cached;
  }

  function set(next: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
      memory = null;
    } catch {
      memory = { value: next };
    }
    listeners.forEach((notify) => notify());
  }

  function subscribe(notify: () => void) {
    listeners.add(notify);
    // Keep other open tabs in step.
    const onStorage = (e: StorageEvent) => e.key === key && notify();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(notify);
      window.removeEventListener("storage", onStorage);
    };
  }

  return {
    get,
    set,
    use: () => useSyncExternalStore(subscribe, get, () => initial),
  };
}

const noop = () => () => {};

/** False in server HTML and during hydration, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
