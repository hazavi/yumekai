"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "./icons";
import { api } from "@/services/api";
import { searchUsers } from "@/services/animeListService";

interface SearchResult {
  title: string;
  link: string;
  thumbnail: string;
  type?: string;
  latest_episode?: string;
}

interface UserResult {
  uid: string;
  username: string;
  displayName: string | null;
  photoURL: string | null;
}

type SearchTab = 'anime' | 'users';

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>('anime');
  const [animeResults, setAnimeResults] = useState<SearchResult[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setAnimeResults([]);
      setUserResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Search both anime and users in parallel
        const [animeData, usersData] = await Promise.all([
          api.search(query.trim()),
          searchUsers(query.trim())
        ]);
        
        setAnimeResults(animeData.results?.slice(0, 5) || []);
        setUserResults(usersData.slice(0, 5));
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setAnimeResults([]);
        setUserResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Navigate to search results page with full results
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative">
      <form
        className="relative group transition rounded-full"
        role="search"
        onSubmit={handleSubmit}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() =>
            query.length >= 2 && (animeResults.length > 0 || userResults.length > 0) && setShowResults(true)
          }
          placeholder="Search anime or user..."
          className="w-full h-11 pl-4 pr-12 rounded-full bg-black/1 outline-none text-sm placeholder:text-white/60 backdrop-blur-xs text-white focus:border-white/40 focus:ring-0 transition"
        />
        <button
          type="submit"
          className="absolute right-2 top-1.5 h-8 w-8 inline-flex items-center justify-center text-white/70 hover:text-white transition"
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5 hover:cursor-pointer" />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && query.length >= 2 && (
        <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 w-[calc(100vw-24px)] sm:w-72 max-w-[320px] backdrop-blur-xl bg-black/95 border border-white/10 rounded-xl shadow-2xl z-50 max-h-[420px] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('anime')}
              className={`flex-1 px-4 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeTab === 'anime'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                Anime
                {animeResults.length > 0 && (
                  <span className="text-[10px] bg-white/10 px-1.5 rounded-full">{animeResults.length}</span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-4 py-2.5 text-xs font-medium transition cursor-pointer ${
                activeTab === 'users'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Users
                {userResults.length > 0 && (
                  <span className="text-[10px] bg-white/10 px-1.5 rounded-full">{userResults.length}</span>
                )}
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[350px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-white/60 text-sm">
                Searching...
              </div>
            ) : activeTab === 'anime' ? (
              // Anime Results
              animeResults.length > 0 ? (
                <>
                  <div className="p-1.5 space-y-0.5">
                    {animeResults.map((result, index) => (
                      <Link
                        key={index}
                        href={result.link}
                        onClick={handleResultClick}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition group"
                      >
                        <div className="relative w-9 h-12 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={result.thumbnail}
                            alt={result.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-white truncate group-hover:text-purple-400 transition leading-tight">
                            {result.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {result.type && (
                              <span className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
                                {result.type}
                              </span>
                            )}
                            {result.latest_episode && (
                              <span className="text-[10px] text-white/50">
                                {result.latest_episode}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-white/10 p-2">
                    <button
                      onClick={handleSubmit}
                      className="w-full text-center text-xs text-purple-400 hover:cursor-pointer hover:text-purple-300 font-medium transition"
                    >
                      View all results for "{query}"
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-white/60 text-xs">No anime found for "{query}"</p>
                </div>
              )
            ) : (
              // User Results
              userResults.length > 0 ? (
                <div className="p-1.5 space-y-0.5">
                  {userResults.map((user) => (
                    <Link
                      key={user.uid}
                      href={`/user/${user.username}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group"
                    >
                      {/* User Avatar */}
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt=""
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center text-white text-sm font-medium">
                          {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-white truncate group-hover:text-purple-400 transition">
                          {user.displayName || user.username}
                        </h4>
                        <p className="text-[10px] text-white/40 truncate">@{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-white/60 text-xs">No users found for "{query}"</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
