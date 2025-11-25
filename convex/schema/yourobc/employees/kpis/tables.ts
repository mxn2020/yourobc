// convex/schema/yourobc/employees/kpis/tables.ts
// Combined table definitions for employee KPIs module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { employeeKPIsFields, employeeKPIsValidators } from './validators';

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

export const employeeTargetsTable = defineTable({
  // Identity
  publicId: v.string(), // Public-facing identifier (e.g., TARGET-2024-Q1-001)
  ownerId: v.id('userProfiles'), // authUserId who owns this target record

  // Employee Reference
  employeeId: v.id('yourobcEmployees'),

  // Optional KPI Reference (links to specific KPI record)
  kpiId: v.optional(v.id('yourobcEmployeeKPIs')),

  // Time Period
  year: v.number(),
  month: v.optional(v.number()), // null for yearly targets
  quarter: v.optional(v.number()), // 1, 2, 3, or 4
  period: v.string(), // Display field: "2024-Q1", "2024-03", "2024"

  // Target Values
  quotesTarget: v.optional(v.number()),
  ordersTarget: v.optional(v.number()),
  revenueTarget: v.optional(v.number()),
  conversionTarget: v.optional(v.number()), // percentage
  commissionsTarget: v.optional(v.number()),

  // Target Metadata
  setBy: v.string(), // authUserId who set the target
  setDate: v.number(),
  notes: v.optional(v.string()),

  // Standard fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_kpiId', ['kpiId'])
  .index('employee', ['employeeId'])
  .index('employee_year', ['employeeId', 'year'])
  .index('employee_period', ['employeeId', 'year', 'month'])
  .index('year_month', ['year', 'month'])
  .searchIndex('search_period', {
    searchField: 'period',
    filterFields: ['ownerId', 'employeeId', 'deletedAt'],
  });
