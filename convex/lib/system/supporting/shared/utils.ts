// convex/lib/boilerplate/supporting/scheduling/shared/utils.ts

import { ScheduledEvent } from '../scheduling';

/**
 * Get next occurrence for recurring event
 */
export function calculateNextOccurrence(event: ScheduledEvent): number | null {
  if (!event.isRecurring || !event.recurrencePattern) {
    return null;
  }

  const pattern = event.recurrencePattern;
  const currentStart = new Date(event.startTime);
  let nextStart = new Date(currentStart);

  switch (pattern.frequency) {
    case 'daily':
      nextStart.setDate(nextStart.getDate() + pattern.interval);
      break;

    case 'weekly':
      nextStart.setDate(nextStart.getDate() + 7 * pattern.interval);
      break;

    case 'monthly':
      nextStart.setMonth(nextStart.getMonth() + pattern.interval);
      break;

    case 'yearly':
      nextStart.setFullYear(nextStart.getFullYear() + pattern.interval);
      break;
  }

  // Check if exceeds end date
  if (pattern.endDate && nextStart.getTime() > pattern.endDate) {
    return null;
  }

  return nextStart.getTime();
}
