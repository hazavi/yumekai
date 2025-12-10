import { ref, set, get, remove, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

// Helper to check if database is available
const getDbRef = (path: string) => {
  if (!database) throw new Error('Firebase database not configured');
  return ref(database, path);
};

export interface ContinueWatchingItem {
  animeId: string;           // Slug for the anime
  title: string;
  poster: string;
  currentEpisode: number;
  totalEpisodes: number;
  timestamp: number;         // When this was last updated
  watchedAt: number;         // Timestamp for sorting
}

// Save/update continue watching progress
export async function saveContinueWatching(
  userId: string,
  item: ContinueWatchingItem
): Promise<void> {
  // Use a sanitized key (replace dots and special chars)
  const sanitizedId = item.animeId.replace(/[.#$[\]]/g, '_');
  const itemRef = getDbRef(`continueWatching/${userId}/${sanitizedId}`);
  
  await set(itemRef, {
    ...item,
    watchedAt: Date.now(),
  });
}

// Get all continue watching items for a user
export async function getContinueWatching(
  userId: string
): Promise<ContinueWatchingItem[]> {
  const listRef = getDbRef(`continueWatching/${userId}`);
  const snapshot = await get(listRef);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  const data = snapshot.val();
  const items: ContinueWatchingItem[] = Object.values(data);
  
  // Sort by most recently watched
  return items.sort((a, b) => b.watchedAt - a.watchedAt);
}

// Remove an item from continue watching
export async function removeContinueWatching(
  userId: string,
  animeId: string
): Promise<void> {
  const sanitizedId = animeId.replace(/[.#$[\]]/g, '_');
  const itemRef = getDbRef(`continueWatching/${userId}/${sanitizedId}`);
  await remove(itemRef);
}

// Subscribe to continue watching updates (real-time)
export function subscribeToContinueWatching(
  userId: string,
  callback: (items: ContinueWatchingItem[]) => void
): () => void {
  if (!database) {
    callback([]);
    return () => {};
  }
  
  const listRef = ref(database, `continueWatching/${userId}`);
  
  const listener = onValue(listRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const data = snapshot.val();
    const items: ContinueWatchingItem[] = Object.values(data);
    
    // Sort by most recently watched
    callback(items.sort((a, b) => b.watchedAt - a.watchedAt));
  });
  
  // Return unsubscribe function
  return () => off(listRef, 'value', listener);
}

// Check if an anime is in continue watching
export async function isInContinueWatching(
  userId: string,
  animeId: string
): Promise<ContinueWatchingItem | null> {
  const sanitizedId = animeId.replace(/[.#$[\]]/g, '_');
  const itemRef = getDbRef(`continueWatching/${userId}/${sanitizedId}`);
  const snapshot = await get(itemRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.val() as ContinueWatchingItem;
}
