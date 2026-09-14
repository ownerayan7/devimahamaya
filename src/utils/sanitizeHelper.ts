/**
 * Security & Sanitization Utilities for 11 Star Club
 * Prevents malicious XSS URLs, javascript: links, and sanitizes user input
 */

export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Disallow dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('vbscript:')
  ) {
    return '#';
  }

  // Allow http, https, mailto, tel, blob, data:image, and relative links
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('blob:') ||
    lower.startsWith('data:image/') ||
    lower.startsWith('/') ||
    lower.startsWith('#')
  ) {
    return trimmed;
  }

  // If no scheme, default to https
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  // Remove zero-width characters and control characters that could cause rendering glitches
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}
