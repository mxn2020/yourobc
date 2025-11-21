// convex/crons.ts

import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

/**
 * Scheduled Events Processor
 * Runs every minute to process all auto-processable scheduled events
 * Handles blog posts, social media posts, and other scheduled content via modular handler system
 */
crons.interval(
  'process-scheduled-events',
  { minutes: 1 },
  internal.lib.system.supporting.scheduling.mutations.processScheduledEvents
)

/**
 * Analytics Hourly Aggregation
 * Aggregates analytics metrics every hour
 */
crons.hourly(
  'aggregate-hourly-analytics',
  { minuteUTC: 5 }, // Run at 5 minutes past each hour
  internal.lib.system.analytics.aggregations.aggregateHourlyMetrics
)

/**
 * Analytics Daily Aggregation
 * Aggregates analytics metrics once per day
 */
crons.daily(
  'aggregate-daily-analytics',
  { hourUTC: 1, minuteUTC: 0 }, // Run at 1:00 AM UTC
  internal.lib.system.analytics.aggregations.aggregateDailyMetrics
)

export default crons
