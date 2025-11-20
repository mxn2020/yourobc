// src/features/system/analytics/utils/date-utils.ts

import { DateRangePreset, DateRange } from "../types";

/**
 * Get date range from preset
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return {
        start: today.getTime(),
        end: now,
      };

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return {
        start: yesterday.getTime(),
        end: endOfYesterday.getTime(),
      };
    }

    case "last_7_days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case "last_30_days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case "last_90_days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case "this_month": {
      const start = new Date(today);
      start.setDate(1);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case "last_month": {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      const end = new Date(today);
      end.setDate(0); // Last day of previous month
      end.setHours(23, 59, 59, 999);
      return {
        start: start.getTime(),
        end: end.getTime(),
      };
    }

    case "this_year": {
      const start = new Date(today);
      start.setMonth(0, 1);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case "custom":
      // Return last 30 days as default
      return getDateRangeFromPreset("last_30_days");

    default:
      return getDateRangeFromPreset("last_30_days");
  }
}

/**
 * Format date range for display
 */
export function formatDateRange(start: number, end: number): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time for display
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} at ${formatTime(timestamp)}`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}
