// Understanding-layer preferences, remembered on this device only.

import { createStore } from "./storage";

export type Layer = "roman" | "words" | "meaning" | "why";
export type Layers = Record<Layer, boolean>;

const ALL_OFF: Layers = { roman: false, words: false, meaning: false, why: false };

const store = createStore<Layers>(
  "sher.layers",
  (raw) => {
    const value = raw ? JSON.parse(raw) : {};
    const layers = { ...ALL_OFF };
    for (const key of Object.keys(ALL_OFF) as Layer[]) layers[key] = value?.[key] === true;
    return layers;
  },
  ALL_OFF,
);

export const useLayers = store.use;

export function setLayer(layer: Layer, on: boolean) {
  store.set({ ...store.get(), [layer]: on });
}
