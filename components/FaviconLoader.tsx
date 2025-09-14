"use client";

import { useEffect } from 'react';

export function FaviconLoader({ isLoading }: { isLoading: boolean }) {
  useEffect(() => {
    let animationFrame: number | null = null;
    let rotation = 0;
    let running = false;
    let lastUpdateTime = 0;

    const ensureLinkElements = () => {
      const rels = ["icon", "shortcut icon", "apple-touch-icon"];
      const links: HTMLLinkElement[] = [];
      rels.forEach(rel => {
        let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          link.type = 'image/x-icon';
          document.head.appendChild(link);
        }
        links.push(link);
      });
      return links;
    };

    const setFaviconAll = (dataUrl: string, forceUpdate = false) => {
      const now = performance.now();
      // Throttle updates to ~60fps for smoothness
      if (!forceUpdate && now - lastUpdateTime < 16) return;
      
      const links = ensureLinkElements();
      links.forEach(l => { 
        l.href = dataUrl;
      });
      lastUpdateTime = now;
    };
    const createLoadingFavicon = (rotation: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, 32, 32);
      
      const centerX = 16;
      const centerY = 16;
      const radius = 12;
      
      // Create realistic browser loading spinner
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      // Draw main circular arc (like Chrome/Edge spinner)
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 1.5); // 3/4 circle
      ctx.strokeStyle = '#4285f4'; // Google Chrome blue
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Add gradient effect for more realistic look
      const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
      gradient.addColorStop(0, '#4285f4');
      gradient.addColorStop(0.5, '#1a73e8');
      gradient.addColorStop(1, '#0d47a1');
      
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Add spinning dot at the end
      const dotX = radius * Math.cos(Math.PI * 1.5);
      const dotY = radius * Math.sin(Math.PI * 1.5);
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1a73e8';
      ctx.fill();
      
      ctx.restore();
      
      return canvas.toDataURL();
    };

    const createNormalFavicon = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Clear canvas
      ctx.clearRect(0, 0, 32, 32);
      
      // Create gradient for Y
      const gradient = ctx.createLinearGradient(0, 0, 32, 32);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#6366f1');
      
      ctx.fillStyle = gradient;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Y', 16, 16);
      
      return canvas.toDataURL();
    };

    const stop = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = null;
      running = false;
    };

    const start = () => {
      if (running) return; // Avoid multiple loops
      running = true;
      let lastTime = performance.now();
      
      const loop = (currentTime: number) => {
        if (!running) return;
        
        // Calculate smooth rotation based on time, not frame count
        const deltaTime = currentTime - lastTime;
        const rotationSpeed = 0.003; // radians per millisecond for smooth 60fps
        rotation += deltaTime * rotationSpeed;
        
        // Keep rotation in bounds to prevent overflow
        if (rotation > Math.PI * 2) {
          rotation -= Math.PI * 2;
        }
        
        const faviconUrl = createLoadingFavicon(rotation);
        if (faviconUrl) setFaviconAll(faviconUrl);
        
        lastTime = currentTime;
        animationFrame = requestAnimationFrame(loop);
      };
      
      animationFrame = requestAnimationFrame(loop);
    };

    const applyStatic = () => {
      const normal = createNormalFavicon();
      if (normal) setFaviconAll(normal, true); // Force update for static favicon
    };

    const handleVisibility = () => {
      if (document.hidden) {
        // pause animation to save resources
        stop();
      } else if (isLoading) {
        start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    if (isLoading) {
      start();
    } else {
      stop();
      applyStatic();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, [isLoading]);

  return null; // This component doesn't render anything visible
}