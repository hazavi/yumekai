/**
 * Application configuration constants
 */

/**
 * Default number of items per page for paginated lists
 */
export const DEFAULT_PAGE_SIZE = 24;

/**
 * API cache TTL values in milliseconds
 */
export const CACHE_TTL = {
  SHORT: 60_000,      // 1 minute
  MEDIUM: 300_000,    // 5 minutes
  LONG: 3600_000,     // 1 hour
  DAY: 86400_000,     // 24 hours
} as const;

/**
 * Iframe sandbox permissions for video player
 */
export const IFRAME_SANDBOX = 
  'allow-scripts allow-same-origin allow-forms allow-pointer-lock ' +
  'allow-orientation-lock allow-presentation allow-top-navigation ' +
  'allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads';

/**
 * Iframe allow permissions for video player
 */
export const IFRAME_ALLOW = 
  'autoplay *; encrypted-media *; fullscreen *; picture-in-picture *; ' +
  'accelerometer *; gyroscope *; clipboard-write *; web-share *';

/**
 * Image quality settings
 */
export const IMAGE_QUALITY = {
  THUMBNAIL: 75,
  POSTER: 85,
  HERO: 90,
} as const;
