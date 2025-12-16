"use client";

import { useState, useEffect } from "react";

const ADBLOCKER_DISMISSED_KEY = "yumekai_adblocker_tip_dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function AdBlockerTip() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if user dismissed the tip recently
    try {
      const dismissed = localStorage.getItem(ADBLOCKER_DISMISSED_KEY);
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        if (Date.now() - dismissedTime < DISMISS_DURATION) {
          return; // Don't show if dismissed within 7 days
        }
      }
      // Show after a slight delay so it doesn't flash
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(ADBLOCKER_DISMISSED_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Dark Liquid Glass Container */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(15,15,20,0.9) 50%, rgba(0,0,0,0.9) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.1) inset",
        }}
      >
        {/* Glass Reflection Effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)",
          }}
        />

        {/* Header */}
        <div className="relative p-4 pb-2">
          <div className="flex items-start gap-3">
            {/* Shield Icon */}
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(22,163,74,0.1) 100%)",
                border: "1px solid rgba(34,197,94,0.3)",
                boxShadow: "0 0 20px rgba(34,197,94,0.2)",
              }}
            >
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-sm">
                💡 Pro Tip: Block Video Ads
              </h4>
              <p className="text-white/50 text-xs mt-1">
                Install an adblocker for ad-free viewing
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1.5 hover:cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label="Dismiss"
            >
              <svg
                className="w-4 h-4 text-white/40 hover:text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable content */}
        <div
          className={`relative overflow-hidden transition-all duration-300 ease-out ${
            isExpanded ? "max-h-[500px]" : "max-h-0"
          }`}
        >
          <div className="px-4 pb-4 space-y-3">
            {/* Separator */}
            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent)",
              }}
            />

            <p className="text-white/40 text-xs">
              Recommended free browser extensions:
            </p>

            {/* Extension Links */}
            <div className="space-y-2">
              {/* uBlock Origin */}
              <a
                href="https://ublockorigin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(220,38,38,0.05) 100%)";
                  e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(220,38,38,0.25) 0%, rgba(185,28,28,0.15) 100%)",
                    border: "1px solid rgba(220,38,38,0.3)",
                  }}
                >
                  <span className="text-base">🛡️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/90 text-sm font-medium group-hover:text-red-300 transition-colors">
                    uBlock Origin
                  </div>
                  <div className="text-white/40 text-xs">
                    Most popular • All browsers
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              {/* AdGuard */}
              <a
                href="https://adguard.com/en/adguard-browser-extension/overview.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(104,211,145,0.15) 0%, rgba(74,222,128,0.05) 100%)";
                  e.currentTarget.style.borderColor = "rgba(104,211,145,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(104,211,145,0.25) 0%, rgba(74,222,128,0.15) 100%)",
                    border: "1px solid rgba(104,211,145,0.3)",
                  }}
                >
                  <span className="text-base">🛡️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/90 text-sm font-medium group-hover:text-green-300 transition-colors">
                    AdGuard
                  </div>
                  <div className="text-white/40 text-xs">
                    Advanced filtering • Privacy
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              {/* AdBlock Plus */}
              <a
                href="https://adblockplus.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.05) 100%)";
                  e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249,115,22,0.25) 0%, rgba(234,88,12,0.15) 100%)",
                    border: "1px solid rgba(249,115,22,0.3)",
                  }}
                >
                  <span className="text-base">🚫</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/90 text-sm font-medium group-hover:text-orange-300 transition-colors">
                    AdBlock Plus
                  </div>
                  <div className="text-white/40 text-xs">
                    Easy setup • All browsers
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <p className="text-white/30 text-[10px] text-center pt-1">
              After installing, refresh this page for ad-free viewing
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative p-3 pt-0 flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 py-2 px-3 text-white/70 hover:cursor-pointer hover:text-white text-xs font-medium rounded-xl transition-all duration-200"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {isExpanded ? "Show Less" : "Show Options"}
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 text-white text-xs font-medium rounded-xl transition-all duration-200 hover:cursor-pointer hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.4) 0%, rgba(22,163,74,0.3) 100%)",
              border: "1px solid rgba(34,197,94,0.4)",
              boxShadow: "0 0 20px rgba(34,197,94,0.15)",
            }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
