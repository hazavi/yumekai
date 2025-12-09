/**
 * Navigation items for the app
 */
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'TV', href: '/tv' },
  { label: 'Movies', href: '/movie' },
  { label: 'OVA', href: '/ova' },
  { label: 'ONA', href: '/ona' },
  { label: 'Special', href: '/special' },
  { label: 'Schedule', href: '/schedule' },
] as const;

/**
 * Browse category items
 */
export const BROWSE_CATEGORIES = [
  { label: 'Top Airing', href: '/top-airing' },
  { label: 'Most Popular', href: '/most-popular' },
  { label: 'Most Favorite', href: '/most-favorite' },
  { label: 'Completed', href: '/completed' },
  { label: 'Recently Added', href: '/recently-added' },
  { label: 'Recently Updated', href: '/recently-updated' },
  { label: 'Top Upcoming', href: '/top-upcoming' },
] as const;

/**
 * Top anime category tabs
 */
export const TOP_ANIME_TABS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
] as const;
