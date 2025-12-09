'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts';
import { getUserRankings, updateUserRankings, RankedAnime, searchAnimeForRanking } from '@/services/rankingService';

export function EditRankingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const username = params.username as string;

  const [rankings, setRankings] = useState<(RankedAnime | null)[]>(Array(10).fill(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RankedAnime[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Check if user is authorized
  const isOwner = userProfile?.username === username;

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (userProfile && !isOwner) {
      router.push(`/user/${username}`);
      return;
    }

    async function fetchRankings() {
      if (!user) return;
      
      try {
        const userRankings = await getUserRankings(user.uid);
        const rankingsArray: (RankedAnime | null)[] = Array(10).fill(null);
        
        userRankings.forEach((anime) => {
          if (anime.rank >= 1 && anime.rank <= 10) {
            rankingsArray[anime.rank - 1] = anime;
          }
        });
        
        setRankings(rankingsArray);
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
  }, [user, userProfile, username, isOwner, router]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAnimeForRanking(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectAnime = (anime: RankedAnime) => {
    if (selectedSlot === null) return;

    // Check if anime is already in rankings
    const existingIndex = rankings.findIndex(r => r?.animeId === anime.animeId);
    
    if (existingIndex !== -1 && existingIndex !== selectedSlot) {
      // Swap positions
      const newRankings = [...rankings];
      newRankings[existingIndex] = rankings[selectedSlot];
      newRankings[selectedSlot] = { ...anime, rank: selectedSlot + 1 };
      setRankings(newRankings);
    } else if (existingIndex === -1) {
      // Add to selected slot
      const newRankings = [...rankings];
      newRankings[selectedSlot] = { ...anime, rank: selectedSlot + 1 };
      setRankings(newRankings);
    }

    setSelectedSlot(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveAnime = (index: number) => {
    const newRankings = [...rankings];
    newRankings[index] = null;
    setRankings(newRankings);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newRankings = [...rankings];
    const temp = newRankings[draggedIndex];
    newRankings[draggedIndex] = newRankings[targetIndex];
    newRankings[targetIndex] = temp;
    
    // Update ranks
    newRankings.forEach((anime, idx) => {
      if (anime) {
        anime.rank = idx + 1;
      }
    });
    
    setRankings(newRankings);
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Filter out null entries and ensure ranks are correct
      const validRankings = rankings
        .map((anime, index) => anime ? { ...anime, rank: index + 1 } : null)
        .filter((anime): anime is RankedAnime => anime !== null);
      
      await updateUserRankings(user.uid, validRankings);
      router.push(`/user/${username}`);
    } catch (error) {
      console.error('Error saving rankings:', error);
      alert('Failed to save rankings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-black to-blue-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.12),transparent_50%)]" />
      </div>

      <div className="container-padded max-w-4xl">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href={`/user/${username}`}
                className="text-white/40 hover:text-white text-sm mb-2 inline-flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Profile
              </Link>
              <h1 className="text-xl font-semibold text-white">Edit Top 10 Rankings</h1>
              <p className="text-white/40 text-sm mt-1">Drag to reorder or click a slot to add an anime</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm"
            >
              {saving ? 'Saving...' : 'Save Rankings'}
            </button>
          </div>
        </div>

        {/* Search Section (shown when a slot is selected) */}
        {selectedSlot !== null && (
          <div className="mb-6 glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">
                Select anime for rank #{selectedSlot + 1}
              </h3>
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for an anime..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                autoFocus
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                {searchResults.map((anime) => {
                  const isInRankings = rankings.some(r => r?.animeId === anime.animeId);
                  return (
                    <button
                      key={anime.animeId}
                      onClick={() => handleSelectAnime(anime)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={anime.poster}
                          alt={anime.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{anime.title}</p>
                        {isInRankings && (
                          <p className="text-purple-400 text-xs">Already in rankings (will swap)</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {searchQuery && !searching && searchResults.length === 0 && (
              <p className="text-white/30 text-sm mt-4 text-center">No results found</p>
            )}
          </div>
        )}

        {/* Rankings Grid */}
        <div className="glass rounded-2xl p-5">
          <div className="space-y-3">
            {rankings.map((anime, index) => (
              <div
                key={index}
                draggable={anime !== null}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  relative flex items-center gap-4 p-4 rounded-xl border transition-all
                  ${draggedIndex === index ? 'opacity-50' : ''}
                  ${selectedSlot === index 
                    ? 'bg-purple-500/20 border-purple-500/50' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}
                  ${anime ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                `}
                onClick={() => !anime && setSelectedSlot(index)}
              >
                {/* Rank Number */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-lg
                  ${index < 3 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                    : 'bg-white/5 text-white/50 border border-white/10'}
                `}>
                  {index + 1}
                </div>

                {anime ? (
                  <>
                    {/* Anime Info */}
                    <div className="relative w-14 h-[72px] rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={anime.poster}
                        alt={anime.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/${anime.animeId}`}
                        className="text-white font-medium hover:text-purple-400 transition-colors line-clamp-2 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {anime.title}
                      </Link>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlot(index);
                        }}
                        className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Change anime"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAnime(index);
                        }}
                        className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="p-2 text-white/30" title="Drag to reorder">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-4">
                    <div className="text-white/30 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Click to add anime</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-4 mt-6 pt-5 border-t border-white/5">
            <Link
              href={`/user/${username}`}
              className="px-5 py-2 text-white/40 hover:text-white transition-colors text-sm"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm"
            >
              {saving ? 'Saving...' : 'Save Rankings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
