"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import type { SpotlightItem } from "@/models";
import { PlayIcon, TvIcon, ClockIcon, CalendarIcon } from "./icons";

interface HeroCarouselProps { items: SpotlightItem[]; intervalMs?: number; }

export function HeroCarousel({ items, intervalMs = 6000 }: HeroCarouselProps) {
  // Filter out malformed entries to prevent runtime errors
  const safeItems = (items || []).filter(it => it && typeof it.detail_link === 'string' && it.detail_link.length > 0 && typeof it.thumbnail === 'string');
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance carousel
  useEffect(() => {
    if (!safeItems.length || isDragging) return;
    
    intervalRef.current = setInterval(() => {
      setIndex(i => (i + 1) % safeItems.length);
    }, intervalMs);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [safeItems, intervalMs, isDragging]);

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragOffset(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const offset = e.clientX - dragStart;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 100; // Minimum drag distance to trigger slide change
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Swiped right - go to previous
        setIndex(i => i === 0 ? safeItems.length - 1 : i - 1);
      } else {
        // Swiped left - go to next
        setIndex(i => (i + 1) % safeItems.length);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setDragOffset(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const offset = e.touches[0].clientX - dragStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        setIndex(i => i === 0 ? safeItems.length - 1 : i - 1);
      } else {
        setIndex(i => (i + 1) % safeItems.length);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  if (!safeItems.length) {
    return <div className="h-[410px] md:h-[480px] flex items-center justify-center text-sm text-white/50 glass rounded-2xl">No featured anime available.</div>;
  }

  return (
  <div 
    ref={containerRef}
    className={`relative w-full overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
      {/* Slides container */}
      <div className="relative h-[480px] md:h-[540px]">
        {/* Swipe direction indicators */}
        {isDragging && Math.abs(dragOffset) > 30 && (
          <>
            {dragOffset > 0 && (
              // Right arrow (going to previous slide) - appears on the left side
              <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-black/70 backdrop-blur-sm border border-white/30 transition-all duration-200 ${
                  Math.abs(dragOffset) > 100 ? 'scale-110 bg-black/90' : 'scale-100'
                }`}>
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={2.5} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-7 h-7 text-white"
                  >
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </div>
              </div>
            )}
            {dragOffset < 0 && (
              // Left arrow (going to next slide) - appears on the right side
              <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-black/70 backdrop-blur-sm border border-white/30 transition-all duration-200 ${
                  Math.abs(dragOffset) > 100 ? 'scale-110 bg-black/90' : 'scale-100'
                }`}>
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={2.5} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-7 h-7 text-white"
                  >
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </div>
            )}
          </>
        )}

        {safeItems.map((item, i) => {
          const active = i === index;
          return (
            <div
              key={`${item.detail_link}-${i}`}
              className={`absolute inset-0 transition-all duration-700 ease-out ${active ? "opacity-100" : "opacity-0"}`}
              style={{
                transform: active ? `translateX(${dragOffset}px)` : 'translateX(0)',
                transition: isDragging ? 'none' : 'opacity 700ms ease-out, transform 700ms ease-out'
              }}
            >
              {/* Split layout wrapper */}
              <div className="absolute inset-0 flex flex-col md:flex-row">
                {/* Text / meta column */}
                <div className="relative flex-1 px-6 sm:px-10 flex items-center">
                  <div className={`max-w-xl transition duration-700 ${active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ease-out`}> 
                    {item.spotlight && (
                      <div className="text-sm font-medium mb-4 text-white/70 tracking-wide uppercase">{item.spotlight}</div>
                    )}
                    <h1 className="font-poppins font-semibold text-3xl sm:text-4xl lg:text-[46px] leading-tight mb-6 line-clamp-2 bg-clip-text text-transparent bg-[linear-gradient(to_right,#ffffff,#cfcfcf)]">
                      {item.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-[12px] text-white/70 mb-5">
                      {item.type && <span className="inline-flex items-center gap-1"><TvIcon className="h-3.5 w-3.5" />{item.type}</span>}
                      {item.duration && <span className="inline-flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{item.duration}</span>}
                      {item.date && <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" />{item.date}</span>}
                      {item.quality && (
                        <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium bg-[linear-gradient(to_right,rgba(59,130,246,0.25),rgba(59,130,246,0.08))] ring-1 ring-blue-500/40 text-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.2)] backdrop-blur-sm">
                          {item.quality}
                        </span>
                      )}
                      {(item.sub_ep || item.dub_ep) && (
                        <span className="inline-flex items-center gap-2">
                          {item.sub_ep && (
                            <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium bg-[linear-gradient(to_right,rgba(147,51,234,0.25),rgba(147,51,234,0.08))] ring-1 ring-purple-500/40 text-purple-200 shadow-[0_0_0_1px_rgba(147,51,234,0.2)] backdrop-blur-sm">
                              <img src="/cc.svg" alt="CC" className="w-3.5 h-3.5 brightness-0 invert" /> 
                              {item.sub_ep}
                            </span>
                          )}
                          {item.dub_ep && (
                            <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium bg-[linear-gradient(to_right,rgba(16,185,129,0.25),rgba(16,185,129,0.08))] ring-1 ring-emerald-500/40 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] backdrop-blur-sm">
                              <img src="/mic.svg" alt="MIC" className="w-3.5 h-3.5 brightness-0 invert" />
                              {item.dub_ep}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-white/70 leading-relaxed line-clamp-4 mb-8 max-w-xl">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <Link
                        href={item.watch_link || item.detail_link || "/"}
                        className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition shadow"
                      >
                        <PlayIcon className="h-4 w-4" />
                        Watch Now
                      </Link>
                      <Link
                        href={item.detail_link || "/"}
                        className="inline-flex items-center gap-1 px-5 h-11 rounded-full text-white font-medium text-sm transition bg-white/5 hover:bg-white/10 backdrop-blur-sm ring-1 ring-white/15 hover:ring-white/25 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.6)]"
                      >
                        Detail
                        <svg 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth={2} 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="h-4 w-4"
                        >
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Image panel */}
                <div className="relative w-full md:w-[62%] lg:w-[60%] h-60 md:h-full mt-6 md:mt-0 pointer-events-none">
                  <Image
                    src={item.thumbnail || "/vercel.svg"}
                    alt={item.title || "Anime poster"}
                    fill
                    priority={i === 0}
                    quality={90}
                    sizes="(max-width:768px) 100vw, 62vw"
                    className="object-cover object-center select-none drag-none"
                    draggable={false}
                  />
                  {/* Intensified left blur/fade: wider & darker with subtle blur pass (simulate via layered gradients) */}
                  <div className="hidden md:block pointer-events-none absolute inset-y-0 -left-2 w-[420px] lg:w-[470px] bg-[linear-gradient(to_left,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_30%,rgba(0,0,0,0.78)_58%,rgba(0,0,0,0.94)_78%,#000_92%)]" />
                  {/* Strong top vignette */}
                  <div className="hidden md:block pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,#000,rgba(0,0,0,0.92)_22%,rgba(0,0,0,0.65)_55%,rgba(0,0,0,0)_90%)]" />
                  {/* Strong bottom vignette */}
                  <div className="hidden md:block pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_top,#000,rgba(0,0,0,0.94)_30%,rgba(0,0,0,0.7)_65%,rgba(0,0,0,0)_95%)]" />
                </div>
              </div>
            </div>
          );
        })}
        
      </div>
      {/* Dots removed per request */}
    </div>
  );
}
