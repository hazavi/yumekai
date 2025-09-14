"use client";
// Using plain anchor tags for hard reload navigation
import { useState, useEffect } from "react";
import { SearchBar, NavItem } from ".";

const navItems = [
  { href: "/most-popular", label: "Most Popular" },
  { href: "/top-airing", label: "Top Airing" },
  { href: "/schedule", label: "Schedule" },
];

const dropdownItems = [
  { href: "/most-favorite", label: "Most Favorite" },
  { href: "/tv", label: "TV Serie" },
  { href: "/movie", label: "Movie" },
  { href: "/ona", label: "ONA" },
  { href: "/ova", label: "OVA" },
  { href: "/special", label: "Special" },
];

export function Navbar() {
  const [openMobile, setOpenMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          
          {/* Browse Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className={`px-1 py-1 font-medium text-sm tracking-wide transition relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-white/80 after:transition-all after:duration-300 flex items-center gap-1 ${
                dropdownOpen ? "text-white after:w-full" : "text-white/70 hover:text-white after:w-0 hover:after:w-full"
              }`}
            >
              Browse
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 pt-2 w-48 z-50">
                <div className="rounded-xl backdrop-blur-xl bg-black/80 border border-white/10 py-2 shadow-lg">
                  {dropdownItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
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
              className="px-2 py-2 text-sm text-white/80 hover:text-white border-b border-white/10"
              onClick={() => setOpenMobile(false)}
            >
              {item.label}
            </a>
          ))}
          
          {/* Mobile Browse Section */}
          <div className="border-t border-white/10 pt-2 mt-2">
            <div className="px-2 py-1 text-xs text-white/60 font-medium">Browse</div>
            {dropdownItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                className="px-2 py-2 text-sm text-white/80 hover:text-white pl-4"
                onClick={() => setOpenMobile(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
