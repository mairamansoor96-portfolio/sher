// Understanding-layer preferences, remembered on this device only.
// localStorage can throw (private mode, blocked storage), so every access is
// wrapped and the layers fall back to in-memory state for the visit.

import { useSyncExternalStore } from "react";

export type Layer = "roman" | "words" | "meaning" | "why";
export type Layers = Record<Layer, boolean>;

const KEY = "sher.layers";
const ALL_OFF: Layers = { roman: false, words: false, meaning: false, why: false };

let memory: Layers | null = null;
let cachedRaw: string | null | undefined;
let cached: Layers = ALL_OFF;
const listeners = new Set<() => void>();

function parse(raw: string | null): Layers {
  try {
    const value = raw ? JSON.parse(raw) : {};
    const layers = { ...ALL_OFF };
    for (const key of Object.keys(ALL_OFF) as Layer[]) {
      layers[key] = value?.[key] === true;
    }
    return layers;
  } catch {
    return ALL_OFF;
  }
}

function read(): Layers {
  if (memory) return memory;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return ALL_OFF;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

export function setLayer(layer: Layer, on: boolean) {
  const next = { ...read(), [layer]: on };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    memory = null;
  } catch {
    memory = next;
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  // Keep other open tabs in step.
  const onStorage = (e: StorageEvent) => e.key === KEY && notify();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

/** Current layers. Everything is off in server HTML and before hydration. */
export function useLayers(): Layers {
  return useSyncExternalStore(subscribe, read, () => ALL_OFF);
}
