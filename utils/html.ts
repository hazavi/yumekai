/**
 * HTML utility functions
 */

/**
 * Decodes HTML entities in a string
 * @param str - String with HTML entities
 * @returns Decoded string
 */
export function decodeHtmlEntities(str: string): string {
  if (typeof document === 'undefined') {
    // Server-side fallback - handle common entities
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Strips HTML tags from a string
 * @param str - String with HTML tags
 * @returns Plain text string
 */
export function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Truncates text to a specified length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncateText(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
