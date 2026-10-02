import { isSaved, parseBayaz, restore, toggle, type BayazEntry } from "./bayaz";
import { createStore } from "./storage";

const store = createStore<BayazEntry[]>("sher.bayaz", parseBayaz, []);

export const useBayaz = store.use;

export function useIsSaved(id: string): boolean {
  return isSaved(store.use(), id);
}

export function toggleSaved(id: string) {
  store.set(toggle(store.get(), id, new Date()));
}

export function restoreEntry(entry: BayazEntry) {
  store.set(restore(store.get(), entry));
}
