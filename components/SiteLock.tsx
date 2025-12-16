"use client";

import { useState, useEffect, ReactNode, useCallback, useRef } from "react";

const AUTH_CACHE_KEY = "yumekai_auth_cache";
const AUTH_CACHE_TTL = 60 * 1000; // 1 minute client-side cache

interface SiteLockProps {
  children: ReactNode;
}

export function SiteLock({ children }: SiteLockProps) {
  // Use ref to track mount state
  const isMounted = useRef(false);

  // Start with "checking" state
  const [authState, setAuthState] = useState<
    "checking" | "locked" | "unlocked"
  >("checking");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check auth on mount (client-side only)
  useEffect(() => {
    isMounted.current = true;

    const checkAuth = async () => {
      // Check sessionStorage cache first for instant unlock
      try {
        const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
        if (cached) {
          const { authenticated, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < AUTH_CACHE_TTL && authenticated) {
            setAuthState("unlocked");
            // Still verify in background
            fetch("/api/auth/check", { method: "GET", credentials: "include" })
              .then((res) => res.json())
              .then((data) => {
                if (isMounted.current && data.authenticated !== true) {
                  setAuthState("locked");
                  sessionStorage.removeItem(AUTH_CACHE_KEY);
                }
              })
              .catch(() => {});
            return;
          }
        }
      } catch {
        // Ignore cache errors
      }

      // No valid cache, check server
      try {
        const response = await fetch("/api/auth/check", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        const authenticated = data.authenticated === true;
        if (isMounted.current) {
          setAuthState(authenticated ? "unlocked" : "locked");
        }

        if (authenticated) {
          sessionStorage.setItem(
            AUTH_CACHE_KEY,
            JSON.stringify({ authenticated: true, timestamp: Date.now() })
          );
        }
      } catch {
        if (isMounted.current) {
          setAuthState("locked");
        }
      }
    };

    checkAuth();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isLoading) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          sessionStorage.setItem(
            AUTH_CACHE_KEY,
            JSON.stringify({ authenticated: true, timestamp: Date.now() })
          );
          setAuthState("unlocked");
          setPassword("");
        } else {
          setError(data.error || "Incorrect password");
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        }
      } catch {
        setError("Connection error. Please try again.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      } finally {
        setIsLoading(false);
      }
    },
    [password, isLoading]
  );

  return (
    <>
      {/* Main content - always rendered */}
      {children}

      {/* Loading overlay - CSS controlled visibility */}
      <div
        className={`fixed inset-0 bg-black flex items-center justify-center z-[9999] transition-opacity duration-200 ${
          authState === "checking"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={authState !== "checking"}
        suppressHydrationWarning
      >
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>

      {/* Lock screen overlay - CSS controlled visibility */}
      <div
        className={`fixed inset-0 bg-black flex items-center justify-center z-[9999] p-4 transition-opacity duration-200 ${
          authState === "locked"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={authState !== "locked"}
        suppressHydrationWarning
      >
        <div
          className={`relative w-full max-w-sm ${
            isShaking ? "animate-shake" : ""
          }`}
        >
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-[#141414] border border-white/[0.08] rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Yumekai</h1>
              <p className="text-white/30 text-sm">Private access only.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 bg-[#141414] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors duration-200"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-red-400/80 text-sm text-center">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-white/[0.08] hover:cursor-pointer hover:bg-white/[0.12] border border-white/[0.08] text-white font-medium rounded-xl transition-colors duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Unlock"
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-6 text-center text-white/20 text-xs">
              Contact the site owner for access
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
