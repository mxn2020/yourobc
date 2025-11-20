// convex/lib/boilerplate/supporting/shared/types.ts

/**
 * Shared Module Types
 * Common type definitions used across multiple modules
 */

/**
 * Recurrence pattern for repeating events
 */
export type RecurrencePattern = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every N days/weeks/months/years
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  monthOfYear?: number; // 1-12 for yearly
  endDate?: number; // Timestamp when recurrence ends
  maxOccurrences?: number; // Max number of occurrences
};

/**
 * Scheduling Handler Configuration
 * Defines metadata for a scheduling handler type
 */
export type SchedulingHandlerConfig = {
  type: string; // Unique identifier (e.g., 'blog_post', 'social_media', 'event')
  name: string; // Display name
  description: string; // Description of what this handler does
  autoProcess: boolean; // Can be automatically processed by cron
  icon?: string; // Optional icon name
  color?: string; // Optional color for UI display
};

/**
 * Processing status for scheduled items
 */
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
