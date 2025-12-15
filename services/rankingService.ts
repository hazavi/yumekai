import { ref, set, get, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { api } from './api';

// Helper to check if database is available
const getDbRef = (path: string) => {
  if (!database) throw new Error('Firebase database not configured');
  return ref(database, path);
};

export interface RankedAnime {
  rank: number;
  animeId: string;
  title: string;
  poster: string;
  addedAt?: number;
}

// Get user's rankings
export async function getUserRankings(userId: string): Promise<RankedAnime[]> {
  const rankingsRef = getDbRef(`rankings/${userId}`);
  const snapshot = await get(rankingsRef);
  
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.values(data) as RankedAnime[];
}

// Update all rankings at once
export async function updateUserRankings(userId: string, rankings: RankedAnime[]): Promise<void> {
  const rankingsRef = getDbRef(`rankings/${userId}`);
  
  // Create an object with rank as key
  const rankingsData: Record<string, RankedAnime> = {};
  rankings.forEach((anime) => {
    rankingsData[anime.rank.toString()] = {
      ...anime,
      addedAt: anime.addedAt || Date.now(),
    };
  });
  
  await set(rankingsRef, rankingsData);
}

// Set a single rank
export async function setRankedAnime(userId: string, anime: RankedAnime): Promise<void> {
  const rankRef = getDbRef(`rankings/${userId}/${anime.rank}`);
  await set(rankRef, {
    ...anime,
    addedAt: anime.addedAt || Date.now(),
  });
}

// Remove a rank
export async function removeRankedAnime(userId: string, rank: number): Promise<void> {
  const rankRef = getDbRef(`rankings/${userId}/${rank}`);
  await remove(rankRef);
}

// Search anime for ranking (using existing search API)
export async function searchAnimeForRanking(query: string): Promise<RankedAnime[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await api.search(query);
    
    // Handle empty or invalid response
    if (!response?.results || !Array.isArray(response.results)) {
      return [];
    }
    
    return response.results.slice(0, 10).map((anime) => ({
      rank: 0, // Will be set when adding to rankings
      animeId: anime.link,
      title: anime.title,
      poster: anime.thumbnail,
    }));
  } catch (error) {
    // Don't log timeout errors as they're expected sometimes
    if (error instanceof Error && !error.message.includes('timeout')) {
      console.error('Error searching anime:', error);
    }
    return [];
  }
}
