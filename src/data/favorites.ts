/**
 * In-memory favorites tracker.
 * Records the set of contact IDs the user has starred.
 * Persists for the lifetime of the JS process (session only — no storage).
 *
 * Reactive: components subscribe via `useIsFavorite` / `useFavoritesVersion`
 * (built on useSyncExternalStore) so they re-render the moment a star is toggled.
 */

import { useSyncExternalStore } from "react";

const favoriteIds = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

function emit(): void {
  version++;
  listeners.forEach((l) => l());
}

/** Subscribe to favorite changes; returns an unsubscribe function. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Monotonically increasing token that changes whenever favorites change. */
export function getVersion(): number {
  return version;
}

/** Whether a contact is currently favorited. */
export function isFavorite(id: string): boolean {
  return favoriteIds.has(id);
}

/** Flip a contact's favorite state; returns the new state. */
export function toggleFavorite(id: string): boolean {
  let next: boolean;
  if (favoriteIds.has(id)) {
    favoriteIds.delete(id);
    next = false;
  } else {
    favoriteIds.add(id);
    next = true;
  }
  emit();
  return next;
}

/** Return a snapshot of favorited IDs. */
export function getFavoriteIds(): ReadonlySet<string> {
  return favoriteIds;
}

/** Reactive: re-renders the caller whenever this contact's favorite status flips. */
export function useIsFavorite(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => favoriteIds.has(id),
  );
}

/** Reactive: re-renders the caller whenever any favorite changes. */
export function useFavoritesVersion(): number {
  return useSyncExternalStore(subscribe, getVersion);
}
