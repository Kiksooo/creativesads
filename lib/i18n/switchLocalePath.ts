import type { Locale } from './messages';
import { isValidLocale } from './messages';

/**
 * Switch locale in path while preserving the rest of the path
 * Example: /en/library/123 -> /ru/library/123
 */
export function switchLocalePath(currentPath: string, newLocale: Locale): string {
  if (!isValidLocale(newLocale)) {
    return currentPath;
  }

  // Remove leading slash
  const pathWithoutLeadingSlash = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
  
  // Split by '/'
  const parts = pathWithoutLeadingSlash.split('/');
  
  // Check if first part is a locale
  if (parts.length > 0 && isValidLocale(parts[0])) {
    // Replace first part with new locale
    parts[0] = newLocale;
    return '/' + parts.join('/');
  }
  
  // If no locale found, prepend new locale
  return '/' + newLocale + (currentPath === '/' ? '' : currentPath);
}

/**
 * Extract locale from path
 * Returns locale or null if not found
 */
export function extractLocaleFromPath(path: string): Locale | null {
  const pathWithoutLeadingSlash = path.startsWith('/') ? path.slice(1) : path;
  const parts = pathWithoutLeadingSlash.split('/');
  
  if (parts.length > 0 && isValidLocale(parts[0])) {
    return parts[0] as Locale;
  }
  
  return null;
}

/**
 * Remove locale from path
 * Example: /en/library/123 -> /library/123
 */
export function removeLocaleFromPath(path: string): string {
  const pathWithoutLeadingSlash = path.startsWith('/') ? path.slice(1) : path;
  const parts = pathWithoutLeadingSlash.split('/');
  
  if (parts.length > 0 && isValidLocale(parts[0])) {
    parts.shift();
    return '/' + (parts.length > 0 ? parts.join('/') : '');
  }
  
  return path;
}
