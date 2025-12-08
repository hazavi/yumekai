# Yumekai

A modern anime streaming platform built with Next.js 16, featuring a sleek glassmorphism design with neon accents.

---

## Overview

Yumekai is a full-featured anime streaming interface that combines elegant design with powerful functionality. The platform offers seamless browsing, watching, and scheduling capabilities with an immersive user experience inspired by modern anime streaming sites.

---

## Features

### Design & UI

- Dark atmospheric gradient background with layered radial glows
- Sticky frosted glass navigation bar with responsive mobile menu
- Neon-accent search bar with focus effects
- Auto-playing hero carousel with glass overlay panels
- Toggle group controls (Recently Added / Popular) with animated highlights
- Responsive anime card grid (2–6 columns)
  - Poster images with subtle hover scaling
  - Frosted episode tags
  - SUB/DUB indicator badges
  - Neon outline glow on hover

### Architecture

- Server-side rendering (SSR) with Next.js App Router
- TypeScript for type safety
- Reusable design tokens and utility classes
- Semantic HTML structure for accessibility
- Progressive enhancement support

---

## Project Structure

```
app/
  layout.tsx          # Global fonts, background layers
  page.tsx            # Home page with SSR data fetching
  watch/[slug]/       # Watch page with video player
  schedule/           # Schedule page with daily/weekly views
  genre/[genre]/      # Genre-specific anime listings

components/           # Reusable UI components
  Navbar.tsx
  HeroCarousel.tsx
  AnimeCard.tsx
  AnimeGrid.tsx
  ToggleGroup.tsx
  SearchBar.tsx
  ScheduleCard.tsx

lib/
  api.ts              # API client with TypeScript types

models/
  anime.ts            # Type definitions and interfaces
```

---

## Core Functionality

### Watch Page

- Integrated video player with iframe support
- Episode list with navigation
- Server switching (SUB/DUB)
- Episode search and jump functionality
- Expandable video mode
- "Lights off" mode for immersive viewing
- Other seasons navigation
- Related anime recommendations

### Schedule Page

- Daily and weekly schedule views

### Homepage

- Dynamic spotlight carousel with featured anime
- Trending anime section with real-time updates
- Recently updated episodes grid
- Genre-based navigation and filtering
- Fully responsive grid layouts (mobile to desktop)

### Browse & Discover

- Multiple category pages (Top Airing, Most Popular, Most Favorite, Completed)
- Genre-specific listings with pagination
- Recently added and recently updated sections
- Advanced search functionality
- Quick navigation with breadcrumb trails

---

## Tech Stack

| Technology       | Version | Purpose                              |
| ---------------- | ------- | ------------------------------------ |
| **Next.js**      | 16.0.7  | App Router, SSR, and routing         |
| **React**        | 19.1.0  | UI components and state management   |
| **TypeScript**   | 5.x     | Type safety and developer experience |
| **Tailwind CSS** | 4.x     | Utility-first styling                |
| **ESLint**       | 9.x     | Code quality and consistency         |

### Key Dependencies

- `next/font` for optimized font loading (Inter & Poppins)
- Turbopack for faster development builds
- Custom API client with TypeScript interfaces

---

## API Integration

The platform integrates with a custom anime scraper API providing:

- Real-time anime data and metadata
- Episode information and streaming sources
- Schedule data (daily and weekly)
- Genre classifications
- Search and filtering capabilities

All endpoints are fully typed with TypeScript interfaces for type safety.

---

## Accessibility

- **Semantic HTML:** Proper heading hierarchy and landmark regions
- **Keyboard Navigation:** Full keyboard support for all interactive elements
- **Focus Management:** Clear focus indicators and logical tab order
- **ARIA Labels:** Screen reader support for complex components
- **Motion Preferences:** Respects `prefers-reduced-motion` for animations
- **Contrast:** High contrast neon accents on dark backgrounds for readability

---

## Performance

- Server-side rendering (SSR) for optimal initial load
- Image optimization with Next.js Image component
- Lazy loading for below-the-fold content
- API response caching with configurable TTL
- Turbopack for rapid development builds

---

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## License

This project is for educational and demonstration purposes. All anime content and metadata are provided through third-party.
