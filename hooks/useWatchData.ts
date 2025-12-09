'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import type { WatchData, Episode, ServerItem, SimpleServer } from '@/types';

interface UseWatchDataResult {
  data: WatchData | null;
  loading: boolean;
  error: Error | null;
  currentIframeSrc: string;
  setCurrentIframeSrc: (src: string) => void;
}

/**
 * Custom hook for fetching and managing watch page data
 */
export function useWatchData(slug: string, ep: string | null): UseWatchDataResult {
  const [data, setData] = useState<WatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentIframeSrc, setCurrentIframeSrc] = useState<string>('');
  
  const fetchingRef = useRef<{ key: string; done: boolean }>({
    key: '',
    done: false,
  });

  useEffect(() => {
    let active = true;

    async function fetchData() {
      const fetchKey = `${slug}|${ep}`;
      
      // Skip if already fetched this combination
      if (fetchingRef.current.done && fetchingRef.current.key === fetchKey) {
        return;
      }
      
      fetchingRef.current.done = true;
      fetchingRef.current.key = fetchKey;

      try {
        const watchData = await api.watch(slug, ep || undefined) as WatchData;
        
        if (!active) return;

        setData(watchData);
        setError(null);

        // Set initial iframe source
        if (watchData) {
          const currentEpNumber = ep ? parseInt(ep) : 1;
          const currentEpisode = 
            watchData.episodes.find((episode) => episode.episode_nr === currentEpNumber) || 
            watchData.episodes[0];

          const iframeSrc = getIframeSrc(currentEpisode);
          if (iframeSrc) {
            setCurrentIframeSrc(iframeSrc);
          }
        }
      } catch (e) {
        console.error('Error loading watch data:', e);
        if (active) {
          setData(null);
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [slug, ep]);

  return {
    data,
    loading,
    error,
    currentIframeSrc,
    setCurrentIframeSrc,
  };
}

/**
 * Helper function to extract iframe source from an episode
 */
function getIframeSrc(episode: Episode | undefined): string | null {
  if (!episode) return null;

  // Use iframe_src if available
  if (episode.iframe_src) {
    return episode.iframe_src;
  }

  // Check sub servers
  if (episode.servers?.sub) {
    if (Array.isArray(episode.servers.sub)) {
      const serverItem = episode.servers.sub[0] as ServerItem;
      if (serverItem?.ifram_src) {
        return serverItem.ifram_src;
      }
    } else if ('src' in episode.servers.sub) {
      return (episode.servers.sub as SimpleServer).src;
    }
  }

  // Check dub servers
  if (episode.servers?.dub) {
    if (Array.isArray(episode.servers.dub)) {
      const serverItem = episode.servers.dub[0] as ServerItem;
      if (serverItem?.ifram_src) {
        return serverItem.ifram_src;
      }
    } else if ('src' in episode.servers.dub) {
      return (episode.servers.dub as SimpleServer).src;
    }
  }

  return null;
}

/**
 * Get iframe source from an episode - exported for use in components
 */
export { getIframeSrc };
