<div align="center">

# 🍥 Yumekai Anime UI

Modern glassmorphism + neon anime streaming interface inspired by hianime.to – built with **Next.js App Router** and **Tailwind CSS v4**.

![UI Preview (placeholder)](./public/next.svg)

</div>

## ✨ Features

- Dark atmospheric gradient background with layered blurred radial glows
- Sticky frosted glass navigation bar + responsive mobile menu
- Neon-accent rounded search bar with focus glow
- Hero carousel (auto-play) with frosted glass overlay panel + active slide glow
- Toggle group (Recently Added / Popular) with animated glass highlight
- Responsive anime card grid (2–6 columns) with:  
	- Poster w/ subtle scale hover  
	- Frosted episode tag  
	- SUB/DUB badge  
	- Neon outline glow on hover
- Reusable design tokens + utility classes (`glass`, `neon-ring`, `frost-tag`, etc.)
- Accessible semantic structure and progressive enhancement

## 🗂 Project Structure (Key)

```
app/
	layout.tsx        # Global fonts, background layers
	page.tsx          # Home composition (SSR data fetch)
components/         # UI building blocks
	Navbar.tsx
	HeroCarousel.tsx
	AnimeCard.tsx
	AnimeGrid.tsx
	ToggleGroup.tsx
	SearchBar.tsx
	SectionHeader.tsx
lib/
	api.ts            # API helpers & TypeScript models
```

## 🔌 Data Source (Anime Scraper API)

Base URL: `https://aniscraper-eta.vercel.app`

Used endpoints:

| Endpoint | Purpose |
|----------|---------|
| `/spotlight-slider` | Hero carousel items |
| `/trending` | Trending grid |
| `/recently-updated` | Latest episodes grid |
| `/top-airing`, `/most-popular`, `/top-anime` | (Future sections) |

`lib/api.ts` contains strongly typed wrappers with light error handling.

## 🚀 Getting Started

Install deps & run dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 🛠 Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4 (@import usage)
- next/font (Inter + Poppins)

## 🎨 Design System Utilities

Custom utility classes in `app/globals.css`:

| Class | Description |
|-------|-------------|
| `glass`, `glass-soft`, `glass-strong` | Frosted translucent panels |
| `neon-ring` | Gradient outer glow ring border |
| `pill` | Pill-shaped frosted interactive element |
| `frost-tag` | Small blurred label badge |
| `animate-glow` | Soft pulsing opacity animation |
| `text-gradient` | Purple→blue gradient text |
| `container-padded` | Responsive layout container |
| `carousel-slide-active` | Active hero slide accent |

## 🧭 Next Improvements (TODO)

- Implement Popular toggle content switch
- Add schedule page consuming `/schedule/week`
- Anime details page using dynamic route & `/[slug]`
- Watch page integrating `/watch/{slug}` episode list
- Add skeleton loaders & error boundaries
- Persistent user theme + preferences (future)

## ♿ Accessibility Notes

- Semantic buttons/links, focus-friendly design
- Motion reduced: disables certain animations with `prefers-reduced-motion`
- High contrast neon accents on dark base

## 🧪 Testing (Suggested)

Add component + integration tests (e.g., Playwright or React Testing Library) for:  
- Hero carousel cycling  
- API fetch states  
- Toggle group state transitions

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Fonts not loading | Ensure network access; rebuild | 
| API error | Endpoint down → check network tab / console | 
| Carousel flicker | Verify only one active slide opacity 100 | 

## 📄 License

Educational / demo interface. Ensure you have streaming rights before attaching real media sources.

---
Built with ✨ by adapting a minimal Next.js starter into a styled anime UI.
