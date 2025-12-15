"use client";
// Using plain anchor tags for hard reload navigation
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar, NavItem } from ".";
import { useAuth } from "@/contexts";

// SVG Icons
const Icons = {
  user: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  logout: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  chevronDown: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
};

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
  const [mobileBrowseOpen, setMobileBrowseOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { user, userProfile, loading, logout } = useAuth();

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Optimized scroll handler with requestAnimationFrame throttling
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const shouldScroll = window.scrollY > 32;
        setScrolled((prev) => (prev !== shouldScroll ? shouldScroll : prev));
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
      className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 top-4 w-[min(1450px,100%)] px-3`}
    >
      <div
        className={`flex items-center gap-2 md:gap-6 rounded-full px-3 md:px-5 lg:px-8 backdrop-blur-sm shadow-[0_4px_25px_-8px_rgba(0,0,0,0.6)] transition-colors duration-300 h-[60px] ${
          scrolled ? "bg-black/80" : "bg-black/40"
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            className="lg:hidden p-2 rounded-md text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Toggle navigation"
            onClick={() => setOpenMobile((o) => !o)}
          >
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
          <Link href="/" className="flex items-center" aria-label="Home">
            <Image
              src="/yumelogo.svg"
              alt="YumeKai"
              width={96}
              height={48}
              style={{ width: "auto", height: "48px" }}
              className="object-contain md:h-[64px]"
              priority
            />
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-sm shrink-0">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href}>
              {item.label}
            </NavItem>
          ))}

          {/* Browse Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className={`px-1 py-1 font-medium text-sm tracking-wide transition relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-white/80 after:transition-all after:duration-300 flex items-center gap-1 ${
                dropdownOpen
                  ? "text-white after:w-full"
                  : "text-white/70 hover:text-white after:w-0 hover:after:w-full"
              }`}
            >
              Browse
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
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

          {/* Watch2gether Link */}
          <NavItem href="/watch2gether">
            <span className="flex items-center gap-1.5">Watch2gether</span>
          </NavItem>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="w-full max-w-[200px] sm:max-w-xs md:max-w-sm">
            <SearchBar />
          </div>

          {/* Auth Section */}
          {!loading && (
            <>
              {user && userProfile?.username ? (
                <div
                  className={`relative ${
                    openMobile ? "hidden" : "hidden sm:block"
                  }`}
                  ref={userDropdownRef}
                >
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-1.5 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {/* Profile Image */}
                    {userProfile.photoURL ? (
                      <Image
                        src={userProfile.photoURL}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center text-white text-sm font-medium">
                        {(
                          userProfile.displayName ||
                          userProfile.username ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    {/* Display Name */}
                    <span className="text-sm font-medium text-white/80 whitespace-nowrap">
                      {userProfile.displayName || userProfile.username}
                    </span>

                    {/* Chevron */}
                    <svg
                      className={`w-4 h-4 text-white/50 transition-transform duration-200 ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 z-80">
                      <div className="rounded-xl backdrop-blur-xl bg-black/80 border border-white/10 py-2 shadow-lg">
                        <Link
                          href={`/user/${userProfile.username}`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {Icons.user}
                          Profile
                        </Link>
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {Icons.logout}
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : user ? (
                <span
                  className={`${
                    openMobile ? "hidden" : "hidden sm:flex"
                  } px-1 py-1 font-medium text-sm tracking-wide text-white/50`}
                >
                  Loading...
                </span>
              ) : (
                <Link
                  href="/login"
                  className={`${
                    openMobile ? "hidden" : "hidden sm:flex"
                  } px-1 py-1 font-medium text-sm tracking-wide transition relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-white/80 after:transition-all after:duration-300 text-white/70 hover:text-white after:w-0 hover:after:w-full whitespace-nowrap`}
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
      {openMobile && (
        <div className="lg:hidden mt-2 rounded-2xl glass-dark py-3 px-2 flex flex-col gap-1 shadow-lg animate-fadeIn">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setOpenMobile(false)}
            >
              {item.label}
            </a>
          ))}

          {/* Mobile Browse Dropdown */}
          <div className="border-t border-white/10 mt-1 pt-1">
            <button
              onClick={() => setMobileBrowseOpen(!mobileBrowseOpen)}
              className="w-full px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium flex items-center justify-between"
            >
              <span>Browse</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  mobileBrowseOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {mobileBrowseOpen && (
              <div className="mt-1 space-y-0.5 animate-fadeIn">
                {dropdownItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 pl-6"
                    onClick={() => {
                      setOpenMobile(false);
                      setMobileBrowseOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Watch2gether Mobile Link */}
          <Link
            href="/watch2gether"
            onClick={() => setOpenMobile(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
          >
            Watch2gether
          </Link>

          {/* Mobile Auth */}
          {!loading && (
            <div className="border-t border-white/10 mt-1 pt-2">
              {user && userProfile?.username ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    {userProfile.photoURL ? (
                      <Image
                        src={userProfile.photoURL}
                        alt=""
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center text-white text-sm font-medium">
                        {(
                          userProfile.displayName ||
                          userProfile.username ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white/80">
                      {userProfile.displayName || userProfile.username}
                    </span>
                  </div>

                  {/* Profile Link */}
                  <Link
                    href={`/user/${userProfile.username}`}
                    onClick={() => setOpenMobile(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    {Icons.user}
                    Profile
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={async () => {
                      setOpenMobile(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    {Icons.logout}
                    Log Out
                  </button>
                </>
              ) : user ? (
                <span className="block px-3 py-2.5 text-sm text-white/50 rounded-lg font-medium">
                  Loading...
                </span>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpenMobile(false)}
                  className="block px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
