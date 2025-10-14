/**
 * Calculate estimated reading time for text content
 * @param text - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 words per minute)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  // Remove HTML tags if present
  const plainText = text.replace(/<[^>]*>/g, '');

  // Split by whitespace and filter out empty strings
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);

  // Calculate reading time in minutes
  const minutes = words.length / wordsPerMinute;

  // Round up to nearest minute (minimum 1 minute)
  return Math.max(1, Math.ceil(minutes));
}

/**
 * Format reading time as a human-readable string
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Calculate and format reading time in one step
 * @param text - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 words per minute)
 * @returns Formatted reading time string like "5 min read"
 */
export function getReadingTime(text: string, wordsPerMinute: number = 200): string {
  const minutes = calculateReadingTime(text, wordsPerMinute);
  return formatReadingTime(minutes);
}
