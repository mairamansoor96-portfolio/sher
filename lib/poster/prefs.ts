import { STYLE_IDS } from "@/components/poster/styles";
import { createStore } from "../storage";
import { DEFAULT_OPTIONS, parseOptions, type PosterOptions } from "./options";

/** The last poster options used, remembered on this device. */
const store = createStore<PosterOptions>("sher.poster", (raw) => parseOptions(raw, STYLE_IDS), DEFAULT_OPTIONS);

export const usePosterOptions = store.use;

export function setPosterOption<K extends keyof PosterOptions>(key: K, value: PosterOptions[K]) {
  store.set({ ...store.get(), [key]: value });
}
