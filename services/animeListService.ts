import { ref, set, get, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';

// Helper to check if database is available
const getDbRef = (path: string) => {
  if (!database) throw new Error('Firebase database not configured');
  return ref(database, path);
};

export type AnimeListStatus = 'watching' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-watch';

export interface AnimeListItem {
  animeId: string;
  title: string;
  thumbnail: string;
  type: string;
  status: AnimeListStatus;
  addedAt: number;
  updatedAt: number;
  progress?: number;
  totalEpisodes?: number;
  rating?: number;
  notes?: string;
}

export interface UserAnimeList {
  watching: AnimeListItem[];
  completed: AnimeListItem[];
  'on-hold': AnimeListItem[];
  dropped: AnimeListItem[];
  'plan-to-watch': AnimeListItem[];
}

export interface TopRankAnime {
  rank: number;
  animeId: string;
  title: string;
  thumbnail: string;
  type: string;
  addedAt: number;
}

export interface UserSearchResult {
  uid: string;
  username: string;
  displayName: string | null;
  photoURL: string | null;
}

export const LIST_STATUS_LABELS: Record<AnimeListStatus, string> = {
  'watching': 'Watching',
  'completed': 'Completed',
  'on-hold': 'On Hold',
  'dropped': 'Dropped',
  'plan-to-watch': 'Plan to Watch',
};

export const LIST_STATUS_COLORS: Record<AnimeListStatus, string> = {
  'watching': 'bg-blue-500',
  'completed': 'bg-green-500',
  'on-hold': 'bg-yellow-500',
  'dropped': 'bg-red-500',
  'plan-to-watch': 'bg-purple-500',
};

export const LIST_STATUS_ICONS: Record<AnimeListStatus, string> = {
  'watching': '👁️',
  'completed': '✅',
  'on-hold': '⏸️',
  'dropped': '❌',
  'plan-to-watch': '📋',
};

// Add anime to user's list
export async function addAnimeToList(
  userId: string,
  anime: Omit<AnimeListItem, 'addedAt' | 'updatedAt'>
): Promise<void> {
  const animeRef = getDbRef(`animeLists/${userId}/${anime.animeId}`);
  const now = Date.now();
  
  await set(animeRef, {
    ...anime,
    addedAt: now,
    updatedAt: now,
  });
}

// Update anime status in list
export async function updateAnimeStatus(
  userId: string,
  animeId: string,
  status: AnimeListStatus
): Promise<void> {
  const animeRef = getDbRef(`animeLists/${userId}/${animeId}`);
  await update(animeRef, {
    status,
    updatedAt: Date.now(),
  });
}

// Update anime in list (progress, rating, notes)
export async function updateAnimeInList(
  userId: string,
  animeId: string,
  data: Partial<AnimeListItem>
): Promise<void> {
  const animeRef = getDbRef(`animeLists/${userId}/${animeId}`);
  await update(animeRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

// Remove anime from list
export async function removeAnimeFromList(
  userId: string,
  animeId: string
): Promise<void> {
  const animeRef = getDbRef(`animeLists/${userId}/${animeId}`);
  await remove(animeRef);
}

// Get user's anime by ID (check if anime is in list)
export async function getAnimeFromList(
  userId: string,
  animeId: string
): Promise<AnimeListItem | null> {
  const animeRef = getDbRef(`animeLists/${userId}/${animeId}`);
  const snapshot = await get(animeRef);
  return snapshot.exists() ? (snapshot.val() as AnimeListItem) : null;
}

// Get all anime in user's list
export async function getUserAnimeList(userId: string): Promise<AnimeListItem[]> {
  const listRef = getDbRef(`animeLists/${userId}`);
  const snapshot = await get(listRef);
  
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.values(data) as AnimeListItem[];
}

// Get user's anime list grouped by status
export async function getUserAnimeListGrouped(userId: string): Promise<UserAnimeList> {
  const animeList = await getUserAnimeList(userId);
  
  const grouped: UserAnimeList = {
    'watching': [],
    'completed': [],
    'on-hold': [],
    'dropped': [],
    'plan-to-watch': [],
  };
  
  for (const anime of animeList) {
    if (grouped[anime.status]) {
      grouped[anime.status].push(anime);
    }
  }
  
  // Sort each list by updatedAt (most recent first)
  for (const status of Object.keys(grouped) as AnimeListStatus[]) {
    grouped[status].sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  return grouped;
}

// Get user's list counts
export async function getUserListCounts(userId: string): Promise<Record<AnimeListStatus | 'total', number>> {
  const animeList = await getUserAnimeList(userId);
  
  const counts: Record<AnimeListStatus | 'total', number> = {
    'watching': 0,
    'completed': 0,
    'on-hold': 0,
    'dropped': 0,
    'plan-to-watch': 0,
    'total': animeList.length,
  };
  
  for (const anime of animeList) {
    if (counts[anime.status] !== undefined) {
      counts[anime.status]++;
    }
  }
  
  return counts;
}

// Top 10 Rankings
export async function setTopRankAnime(
  userId: string,
  anime: Omit<TopRankAnime, 'addedAt'>
): Promise<void> {
  const rankRef = getDbRef(`topRankings/${userId}/${anime.rank}`);
  await set(rankRef, {
    ...anime,
    addedAt: Date.now(),
  });
}

export async function removeTopRankAnime(userId: string, rank: number): Promise<void> {
  const rankRef = getDbRef(`topRankings/${userId}/${rank}`);
  await remove(rankRef);
}

export async function getUserTopRankings(userId: string): Promise<(TopRankAnime | null)[]> {
  const rankingsRef = getDbRef(`rankings/${userId}`);
  const snapshot = await get(rankingsRef);
  
  const rankings: (TopRankAnime | null)[] = Array(10).fill(null);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const [rank, anime] of Object.entries(data)) {
      const rankIndex = parseInt(rank) - 1;
      if (rankIndex >= 0 && rankIndex < 10) {
        const animeData = anime as { rank: number; animeId: string; title: string; poster?: string; thumbnail?: string; type?: string; addedAt?: number };
        rankings[rankIndex] = {
          rank: animeData.rank,
          animeId: animeData.animeId,
          title: animeData.title,
          thumbnail: animeData.thumbnail || animeData.poster || '',
          type: animeData.type || '',
          addedAt: animeData.addedAt || Date.now(),
        };
      }
    }
  }
  
  return rankings;
}

// Search users by username
export async function searchUsers(searchQuery: string): Promise<Array<{
  uid: string;
  username: string;
  displayName: string | null;
  photoURL: string | null;
}>> {
  const usersRef = getDbRef('users');
  const snapshot = await get(usersRef);
  
  if (!snapshot.exists()) return [];
  
  const users = snapshot.val();
  const results: Array<{
    uid: string;
    username: string;
    displayName: string | null;
    photoURL: string | null;
  }> = [];
  
  const searchLower = searchQuery.toLowerCase();
  
  for (const [uid, userData] of Object.entries(users)) {
    const user = userData as { username?: string; displayName?: string; photoURL?: string; isPublic?: boolean };
    if (!user.isPublic) continue;
    
    const username = user.username || '';
    const displayName = user.displayName || '';
    
    if (username.toLowerCase().includes(searchLower) || displayName.toLowerCase().includes(searchLower)) {
      results.push({
        uid,
        username: username,
        displayName: displayName || null,
        photoURL: user.photoURL || null,
      });
    }
  }
  
  return results.slice(0, 20);
}

// Get public user profile by username (uses usernames index for efficient lookup)
export async function getUserByUsername(username: string): Promise<{
  uid: string;
  username: string;
  displayName: string | null;
  photoURL: string | null;
  bio: string | null;
  createdAt: number;
  lastUsernameChange?: number;
} | null> {
  // First, look up the uid from the usernames index
  const usernameRef = getDbRef(`usernames/${username.toLowerCase()}`);
  const usernameSnapshot = await get(usernameRef);
  
  if (!usernameSnapshot.exists()) return null;
  
  const uid = usernameSnapshot.val() as string;
  
  // Then fetch the user profile
  const userRef = getDbRef(`users/${uid}`);
  const userSnapshot = await get(userRef);
  
  if (!userSnapshot.exists()) return null;
  
  const user = userSnapshot.val() as { 
    username?: string; 
    displayName?: string; 
    photoURL?: string; 
    bio?: string;
    createdAt?: number;
    isPublic?: boolean;
    lastUsernameChange?: number;
  };
  
  // Check if profile is public
  if (user.isPublic === false) return null;
  
  return {
    uid,
    username: user.username || username,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    bio: user.bio || null,
    createdAt: user.createdAt || Date.now(),
    lastUsernameChange: user.lastUsernameChange,
  };
}
