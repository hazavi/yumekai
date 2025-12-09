"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "./icons";
import { api } from "@/services/api";

interface SearchResult {
  title: string;
  link: string;
  thumbnail: string;
  type?: string;
  latest_episode?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
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
      setResults([]);
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
        const data = await api.search(query.trim());
        setResults(data.results?.slice(0, 5) || []); // Show top 5 results
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
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
            query.length >= 2 && results.length > 0 && setShowResults(true)
          }
          placeholder="Search anime..."
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
        <div className="absolute left-0 top-full mt-2 w-full backdrop-blur-xl bg-black/95 border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-white/60 text-sm">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-1.5 space-y-0.5">
                {results.map((result, index) => (
                  <Link
                    key={index}
                    href={result.link}
                    onClick={handleResultClick}
                    className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-white/5 transition group"
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
            <div className="p-3 text-center">
              <p className="text-white/60 text-xs">
                No results found for "{query}"
              </p>
              <p className="text-white/40 text-[10px] mt-0.5">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
