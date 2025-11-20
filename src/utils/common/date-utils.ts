// src/utils/common/date-utils.ts
import { useMemo } from 'react';

/**
 * Date range presets for common filtering needs
 */
export const DATE_RANGE_PRESETS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  LAST_3_MONTHS: 'last_3_months',
  LAST_6_MONTHS: 'last_6_months',
  LAST_YEAR: 'last_year',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom'
} as const;

export type DateRangePreset = typeof DATE_RANGE_PRESETS[keyof typeof DATE_RANGE_PRESETS];

/**
 * Get date range for preset
 */
export function getDateRangeForPreset(preset: DateRangePreset): {
  start: Date;
  end: Date;
  label: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case DATE_RANGE_PRESETS.TODAY:
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Today'
      };
      
    case DATE_RANGE_PRESETS.YESTERDAY:
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Yesterday'
      };
      
    case DATE_RANGE_PRESETS.LAST_7_DAYS:
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 7 days'
      };
      
    case DATE_RANGE_PRESETS.LAST_30_DAYS:
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 30 days'
      };
      
    case DATE_RANGE_PRESETS.LAST_3_MONTHS:
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
        end: now,
        label: 'Last 3 months'
      };
      
    case DATE_RANGE_PRESETS.LAST_6_MONTHS:
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
        end: now,
        label: 'Last 6 months'
      };
      
    case DATE_RANGE_PRESETS.LAST_YEAR:
      return {
        start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
        end: now,
        label: 'Last year'
      };
      
    case DATE_RANGE_PRESETS.THIS_MONTH:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
        label: 'This month'
      };
      
    case DATE_RANGE_PRESETS.LAST_MONTH:
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return {
        start: lastMonthStart,
        end: lastMonthEnd,
        label: 'Last month'
      };
      
    default:
      return {
        start: today,
        end: now,
        label: 'Custom'
      };
  }
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Check if date is within the last N days
 */
export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= threshold;
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  }
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Format date for display with various options
 */
export function formatDate(
  date: Date,
  options: {
    includeTime?: boolean;
    format?: 'short' | 'medium' | 'long' | 'full';
    relative?: boolean;
    timezone?: string;
  } = {}
): string {
  const {
    includeTime = false,
    format = 'medium',
    relative = false,
    timezone
  } = options;
  
  if (relative && isWithinDays(date, 7)) {
    return formatRelativeDate(date);
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone
  };
  
  switch (format) {
    case 'short':
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      break;
      
    case 'medium':
      formatOptions.year = 'numeric';
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      break;
      
    case 'long':
      formatOptions.year = 'numeric';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      formatOptions.weekday = 'short';
      break;
      
    case 'full':
      formatOptions.year = 'numeric';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      formatOptions.weekday = 'long';
      break;
  }
  
  if (includeTime) {
    formatOptions.hour = 'numeric';
    formatOptions.minute = '2-digit';
    if (format === 'full') {
      formatOptions.second = '2-digit';
    }
  }
  
  return date.toLocaleDateString('en-US', formatOptions);
}

/**
 * Get time zone offset string
 */
export function getTimezoneOffset(date: Date = new Date()): string {
  const offset = -date.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? '+' : '-';
  
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Generate date range array
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month' = 'day'
): Date[] {
  return useMemo(() => {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      
      switch (interval) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
    
    return dates;
  }, [startDate, endDate, interval]);
}

/**
 * Get start and end of day
 */
export function getStartEndOfDay(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get start and end of week
 */
export function getStartEndOfWeek(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get start and end of month
 */
export function getStartEndOfMonth(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Parse ISO date string safely
 */
export function parseISODate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Check if date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Get business days between two dates
 */
export function getBusinessDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (!isWeekend(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Add business days to a date
 */
export function addBusinessDays(date: Date, businessDays: number): Date {
  const result = new Date(date);
  let days = businessDays;
  
  while (days > 0) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) {
      days--;
    }
  }
  
  return result;
}