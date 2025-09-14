"use client";
// Using plain anchor tags for hard reload navigation
import { useState, useEffect } from "react";
import { SearchBar, NavItem } from ".";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/most-popular", label: "Popular" },
  { href: "/most-favorite", label: "Favorite" },
  { href: "/tv", label: "TV" },
  { href: "/movie", label: "Movie" },
  { href: "/schedule", label: "Schedule" },
];

export function Navbar() {
  const [openMobile, setOpenMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 32) {
        if (!scrolled) setScrolled(true);
      } else {
        if (scrolled) setScrolled(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrolled]);

  return (
    <header className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 top-4 w-[min(1200px,95%)] px-3`}>      
      <div className={`flex items-center gap-6 rounded-full px-5 md:px-8 backdrop-blur-xs shadow-[0_4px_25px_-8px_rgba(0,0,0,0.6)] transition-colors duration-300 h-[60px] ${scrolled ? 'bg-black/65' : 'bg-black/40'}`}>        
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden px-3 py-2 rounded-md text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Toggle navigation"
            onClick={() => setOpenMobile(o => !o)}
          >
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
          <a href="/" className="flex items-center" aria-label="Home">
            <img src="/yumelogo.png" alt="YumeKai" className="h-16 w-auto object-contain" />
          </a>
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {navItems.map(item => (
            <NavItem key={item.href} href={item.href}>{item.label}</NavItem>
          ))}
        </nav>
        <div className="ml-auto w-full max-w-sm">
          <SearchBar />
        </div>
      </div>
      {openMobile && (
        <div className="lg:hidden mt-2 rounded-2xl backdrop-blur-xl bg-black/50 border border-white/10 py-3 px-4 flex flex-col gap-2 shadow-lg">
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="px-2 py-2 text-sm text-white/80 hover:text-white border-b last:border-b-0 border-white/10"
              onClick={() => setOpenMobile(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
