"use client";
import { useState } from "react";
import { SearchIcon } from "./icons";

export function SearchBar() {
  const [query, setQuery] = useState("");
  // Future: integrate search endpoint if available
  return (
    <form
      className="relative group transition rounded-full"
      role="search"
      onSubmit={e => { e.preventDefault(); if(!query) return; /* placeholder */ }}
    >
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search anime..."
        className="w-full h-11 pl-4 pr-12 rounded-full bg-black/1 outline-none text-sm placeholder:text-white/60 backdrop-blur-xs text-white focus:border-white/40 focus:ring-0 transition"
      />
      <button
        type="submit"
        className="absolute right-2 top-1.5 h-8 w-8 inline-flex items-center justify-center text-white/70 hover:text-white transition"
        aria-label="Search"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
      {query && (
        <div className="absolute left-0 top-full mt-2 w-full backdrop-blur-xl bg-black/50 border border-white/10 rounded-xl p-3 text-xs hidden group-focus-within:block">
          <p className="opacity-70">No live search implemented yet.</p>
          <a href="#" className="mt-2 inline-block text-white/60 hover:text-white font-medium">Advanced search →</a>
        </div>
      )}
    </form>
  );
}
