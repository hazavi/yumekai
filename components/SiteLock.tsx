"use client";

import { useState, useEffect, ReactNode } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";

const STORAGE_KEY = "yumekai_site_unlocked";
const LOCK_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface SiteLockProps {
  children: ReactNode;
}

export function SiteLock({ children }: SiteLockProps) {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [adminSettings, setAdminSettings] = useState<{
    sitePassword?: string;
    sitePasswordVersion?: number;
  } | null>(null);

  // Fetch admin settings (site password from database)
  useEffect(() => {
    const fetchAdminSettings = async () => {
      if (!database) {
        setAdminSettings({});
        return;
      }

      try {
        const settingsRef = ref(database, "adminSettings/public");
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          setAdminSettings(snapshot.val());
        } else {
          setAdminSettings({});
        }
      } catch (error) {
        // Permission denied or other error - use defaults
        console.warn("Could not fetch admin settings, using defaults");
        setAdminSettings({});
      }
    };

    fetchAdminSettings();
  }, []);

  useEffect(() => {
    // Wait for admin settings to load
    if (adminSettings === null) return;

    // Check if user has previously unlocked the site
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { timestamp, version } = JSON.parse(stored);
        const now = Date.now();
        const currentVersion = adminSettings?.sitePasswordVersion || 1;

        // Check if session is expired or password version changed
        if (
          now - timestamp < LOCK_DURATION &&
          (!version || version >= currentVersion)
        ) {
          setIsUnlocked(true);
          return;
        }
      } catch {
        // Invalid stored data
      }
      // Expired or version mismatch, remove from storage
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsUnlocked(false);
  }, [adminSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Use database password (required - no env fallback)
    const sitePassword = adminSettings?.sitePassword;

    if (!sitePassword) {
      setError("Site password not configured");
      return;
    }

    if (password === sitePassword) {
      const currentVersion = adminSettings?.sitePasswordVersion || 1;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          version: currentVersion,
        })
      );
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Loading state
  if (isUnlocked === null) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  // Locked state - show password form
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] p-4">
        {/* Dark liquid glass card */}
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-[#141414] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors duration-200"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-red-400/80 text-sm text-center">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white/[0.08] hover:cursor-pointer hover:bg-white/[0.12] border border-white/[0.08] text-white font-medium rounded-xl transition-colors duration-200 active:scale-[0.98]"
              >
                Unlock
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-6 text-center text-white/20 text-xs">
              Contact the site owner for access
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked - render children
  return <>{children}</>;
}
