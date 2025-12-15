"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const ticking = useRef(false);

  // Throttled scroll handler using requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const shouldShow = window.scrollY > 300;
        setIsVisible((prev) => (prev !== shouldShow ? shouldShow : prev));
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Scroll to top smoothly
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 hover:cursor-pointer hover:shadow-xl group ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{ willChange: "opacity, transform" }}
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
    >
      <svg
        className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
