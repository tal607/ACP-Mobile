/**
 * In-memory recents tracker.
 * Records the last MAX_RECENTS unique contact IDs the user has opened.
 * Persists for the lifetime of the JS process (session only — no storage).
 */

const MAX_RECENTS = 5;
const recentIds: string[] = [];

/** Push a contact ID to the front of the recents list. */
export function recordRecent(id: string): void {
  const idx = recentIds.indexOf(id);
  if (idx !== -1) recentIds.splice(idx, 1);
  recentIds.unshift(id);
  if (recentIds.length > MAX_RECENTS) recentIds.pop();
}

/** Return a snapshot of recent IDs, most-recent first. */
export function getRecentIds(): readonly string[] {
  return recentIds;
}

/** Wipe all recents (e.g. after "Clear" is tapped in the overlay). */
export function clearRecents(): void {
  recentIds.length = 0;
}
