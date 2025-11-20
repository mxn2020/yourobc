// src/utils/common/string-utils.ts
import { useMemo } from 'react';

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s-_]+/)
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(
  str: string,
  maxLength: number,
  options: {
    ellipsis?: string;
    preserveWords?: boolean;
  } = {}
): string {
  const { ellipsis = '...', preserveWords = false } = options;
  
  if (str.length <= maxLength) return str;
  
  const truncateLength = maxLength - ellipsis.length;
  
  if (preserveWords) {
    const words = str.substring(0, truncateLength).split(' ');
    words.pop(); // Remove potentially truncated last word
    return words.join(' ') + ellipsis;
  }
  
  return str.substring(0, truncateLength) + ellipsis;
}

/**
 * Generate slug from string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate random string
 */
export function generateRandomString(
  length: number,
  charset: 'alphanumeric' | 'alpha' | 'numeric' | 'hex' = 'alphanumeric'
): string {
  const charsets = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789',
    hex: '0123456789abcdef'
  };
  
  const chars = charsets[charset];
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  
  return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'"
  };
  
  return str.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, entity => 
    htmlUnescapes[entity] || entity
  );
}

/**
 * Extract initials from name
 */
export function getInitials(name: string, maxInitials = 2): string {
  if (!name) return '';
  
  const words = name
    .split(/\s+/)
    .filter(word => word.length > 0)
    .slice(0, maxInitials);
  
  return words
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Format name for display
 */
export function formatName(
  firstName?: string,
  lastName?: string,
  options: {
    format?: 'full' | 'first-last' | 'last-first' | 'first' | 'initials';
    maxLength?: number;
  } = {}
): string {
  const { format = 'full', maxLength } = options;
  
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  if (!first && !last) return '';
  
  let formatted = '';
  
  switch (format) {
    case 'first':
      formatted = first;
      break;
    case 'first-last':
      formatted = [first, last].filter(Boolean).join(' ');
      break;
    case 'last-first':
      formatted = [last, first].filter(Boolean).join(', ');
      break;
    case 'initials':
      formatted = getInitials([first, last].filter(Boolean).join(' '));
      break;
    case 'full':
    default:
      formatted = [first, last].filter(Boolean).join(' ');
      break;
  }
  
  if (maxLength && formatted.length > maxLength) {
    return truncate(formatted, maxLength, { preserveWords: true });
  }
  
  return formatted;
}

/**
 * Highlight search terms in text
 */
export function highlightText(
  text: string,
  searchTerm: string,
  highlightClass = 'highlight'
): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
}

/**
 * Escape special regex characters
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if string contains only whitespace
 */
export function isWhitespace(str: string): boolean {
  return /^\s*$/.test(str);
}

/**
 * Count words in text
 */
export function wordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count characters in text (excluding whitespace)
 */
export function charCount(text: string, excludeSpaces = false): number {
  if (!text) return 0;
  return excludeSpaces ? text.replace(/\s/g, '').length : text.length;
}

/**
 * Extract email addresses from text
 */
export function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.match(emailRegex) || [];
}

/**
 * Extract URLs from text
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

/**
 * Format text with line breaks for HTML
 */
export function formatTextWithLineBreaks(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

/**
 * Remove extra whitespace and normalize line endings
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')   // Mac line endings
    .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single space
    .replace(/\n[ \t]*/g, '\n') // Remove trailing whitespace on lines
    .replace(/\n{3,}/g, '\n\n') // Multiple newlines to double newline
    .trim();
}

/**
 * Parse comma-separated values with trimming
 */
export function parseCSV(str: string): string[] {
  if (!str) return [];
  
  return str
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Check if string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Mask sensitive information (like API keys, emails, etc.)
 */
export function maskSensitive(
  str: string,
  type: 'email' | 'apikey' | 'custom',
  options: {
    maskChar?: string;
    visibleStart?: number;
    visibleEnd?: number;
    customPattern?: RegExp;
  } = {}
): string {
  const { maskChar = '*', visibleStart = 2, visibleEnd = 2 } = options;
  
  if (!str) return str;
  
  switch (type) {
    case 'email':
      const [localPart, domain] = str.split('@');
      if (!domain) return str;
      
      const maskedLocal = localPart.length > 4
        ? localPart.substring(0, 2) + maskChar.repeat(localPart.length - 4) + localPart.slice(-2)
        : maskChar.repeat(localPart.length);
      
      return `${maskedLocal}@${domain}`;
      
    case 'apikey':
      if (str.length <= visibleStart + visibleEnd) {
        return maskChar.repeat(str.length);
      }
      
      return str.substring(0, visibleStart) +
             maskChar.repeat(str.length - visibleStart - visibleEnd) +
             str.slice(-visibleEnd);
             
    case 'custom':
      if (options.customPattern) {
        return str.replace(options.customPattern, match => 
          maskChar.repeat(match.length)
        );
      }
      return str;
      
    default:
      return str;
  }
}

/**
 * Search and filter strings by relevance
 */
export function searchStrings(
  strings: string[],
  searchTerm: string,
  options: {
    caseSensitive?: boolean;
    exactMatch?: boolean;
    minScore?: number;
  } = {}
): Array<{ text: string; score: number; matchedTerms: string[] }> {
  const { caseSensitive = false, exactMatch = false, minScore = 0 } = options;
  
  if (!searchTerm) {
    return strings.map(text => ({ text, score: 1, matchedTerms: [] }));
  }
  
  const normalizedSearch = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  const searchTerms = normalizedSearch.split(/\s+/).filter(term => term.length > 0);
  
  return useMemo(() => {
    const results = strings.map(text => {
      const normalizedText = caseSensitive ? text : text.toLowerCase();
      let score = 0;
      const matchedTerms: string[] = [];
      
      for (const term of searchTerms) {
        if (exactMatch) {
          if (normalizedText === term) {
            score += 1;
            matchedTerms.push(term);
          }
        } else {
          const index = normalizedText.indexOf(term);
          if (index !== -1) {
            // Higher score for matches at the beginning
            const positionBonus = index === 0 ? 0.5 : 0.1;
            // Higher score for exact word matches
            const wordBoundary = /\b/.test(normalizedText.substring(index - 1, index + term.length + 1));
            const wordBonus = wordBoundary ? 0.3 : 0;
            
            score += 0.5 + positionBonus + wordBonus;
            matchedTerms.push(term);
          }
        }
      }
      
      // Normalize score by number of search terms
      score = score / searchTerms.length;
      
      return { text, score, matchedTerms };
    });
    
    return results
      .filter(result => result.score >= minScore)
      .sort((a, b) => b.score - a.score);
  }, [strings, searchTerm, caseSensitive, exactMatch, minScore]);
}