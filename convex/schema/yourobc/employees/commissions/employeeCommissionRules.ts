// convex/schema/yourobc/employees/commissions/employeeCommissionRules.ts
/**
 * Employee Commission Rules Table Schema
 *
 * Configurable commission rules per employee with tiering and filters.
 * Referenced by employeeCommissions via ruleId.
 *
 * @module convex/schema/yourobc/employees/commissions/employeeCommissionRules
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  auditFields,
  softDeleteFields,
} from '@/schema/base'
import { employeeCommissionsFields, employeeCommissionsValidators } from './validators'
import { baseValidators } from '@/schema/base.validators'

/**
 * Employee Commission Rules Table
 * Defines configurable commission calculation rules per employee
 */
export const employeeCommissionRulesTable = defineTable({
  // Core Identity
  publicId: v.string(), // Public-facing unique identifier
  ownerId: v.string(), // Auth user ID who owns this rule

  // References
  employeeId: v.id('yourobcEmployees'),

  // Rule Identity
  name: v.string(),
  description: v.optional(v.string()),

  // Rule Configuration
  type: employeeCommissionsValidators.employeeCommissionType,
  ruleType: v.string(), // Display field - combination of type and tier/rate info

  // Rate Configuration
  rate: v.optional(v.number()), // for percentage and fixed amount types
  tiers: v.optional(v.array(employeeCommissionsFields.tier)), // for tiered type

  // Service Type Filter (optional)
  serviceTypes: v.optional(v.array(baseValidators.serviceType)),
  applicableCategories: v.optional(v.array(v.string())),
  applicableProducts: v.optional(v.array(v.id('products'))),

  // Minimum Thresholds
  minMarginPercentage: v.optional(v.number()), // Only pay if margin > x%
  minOrderValue: v.optional(v.number()), // Only pay if order > x
  minCommissionAmount: v.optional(v.number()), // Minimum payout amount

  // Automation Settings
  autoApprove: v.optional(v.boolean()), // Auto-approve when invoice is paid
  priority: v.optional(v.number()), // Rule priority when multiple rules apply

  // Effective Period
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  effectiveFrom: v.number(),
  effectiveTo: v.optional(v.number()),

  // Status
  isActive: v.boolean(),

  // Notes
  notes: v.optional(v.string()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_employee', ['employeeId'])
  .index('by_employee_active', ['employeeId', 'isActive'])
  .index('by_isActive', ['isActive'])
  .index('by_effectiveFrom', ['effectiveFrom'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])
  .searchIndex('search_ruleType', {
    searchField: 'ruleType',
    filterFields: ['ownerId', 'employeeId', 'isActive', 'deletedAt'],
  })
