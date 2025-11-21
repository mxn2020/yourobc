// convex/schema/yourobc/employeeKPIs/employeeKPIs.ts
// Table definitions for employeeKPIs module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { employeeKPIsValidators, employeeKPIsFields } from './validators';

export const employeeKPIsTable = defineTable({
  // Required: Main display field
  kpiName: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Employee Reference
  employeeId: v.id('yourobcEmployees'),

  // KPI Details
  metricType: v.string(), // e.g., "quotes_created", "revenue_generated", "conversion_rate"
  description: v.optional(v.string()),

  // Target Values
  targetValue: v.number(),
  currentValue: v.number(),
  achievementPercentage: v.number(), // currentValue / targetValue * 100

  // Period
  period: employeeKPIsValidators.period,
  year: v.number(),
  month: v.optional(v.number()),
  quarter: v.optional(v.number()),
  week: v.optional(v.number()),
  day: v.optional(v.number()),

  // Date Range
  startDate: v.number(),
  endDate: v.number(),

  // Status
  status: employeeKPIsValidators.status,

  // Historical Tracking
  historicalData: v.optional(v.array(employeeKPIsFields.historicalDataEntry)),

  // Additional Metrics
  previousPeriodValue: v.optional(v.number()),
  changePercentage: v.optional(v.number()), // (currentValue - previousPeriodValue) / previousPeriodValue * 100

  // Thresholds
  warningThreshold: v.optional(v.number()), // percentage below target for "at_risk"
  criticalThreshold: v.optional(v.number()), // percentage below target for "behind"

  // Notes
  notes: v.optional(v.string()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_kpiName', ['kpiName'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_employee', ['employeeId'])
  .index('by_status', ['status'])
  .index('by_period', ['period'])
  .index('by_employee_period', ['employeeId', 'period'])
  .index('by_employee_year_month', ['employeeId', 'year', 'month'])
  .index('by_year_month', ['year', 'month'])
  .index('by_owner_and_status', ['ownerId', 'status']);
