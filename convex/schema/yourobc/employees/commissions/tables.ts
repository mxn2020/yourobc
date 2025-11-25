// convex/schema/yourobc/employees/commissions/tables.ts
// Combined table definitions for employeeCommissions module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, currencyValidator, softDeleteFields } from '@/schema/base';
import { baseValidators } from '@/schema/base.validators';
import {
  employeeCommissionsFields,
  employeeCommissionsValidators,
} from './validators';

export const employeeCommissionsTable = defineTable({
  // Required: Main display field
  commissionId: v.string(), // Auto-generated reference number

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Employee Reference
  employeeId: v.id('yourobcEmployees'),

  // Related Entities
  shipmentId: v.optional(v.id('yourobcShipments')),
  quoteId: v.optional(v.id('yourobcQuotes')),
  invoiceId: v.optional(v.id('yourobcInvoices')),

  // Commission Period
  period: v.string(), // e.g., "2024-01", "Q1-2024"
  periodStartDate: v.number(),
  periodEndDate: v.number(),

  // Financial Details
  baseAmount: v.number(), // Revenue or margin amount
  margin: v.optional(v.number()),
  marginPercentage: v.optional(v.number()),
  commissionPercentage: v.number(),
  totalAmount: v.number(), // Final commission amount
  currency: currencyValidator,

  // Commission Configuration
  type: employeeCommissionsValidators.employeeCommissionType,
  ruleId: v.optional(v.id('yourobcEmployeeCommissionRules')),
  ruleName: v.optional(v.string()),

  // Calculation Breakdown
  calculationBreakdown: v.optional(employeeCommissionsFields.calculationBreakdown),

  // Status & Approval
  status: employeeCommissionsValidators.status,
  approvedBy: v.optional(v.string()), // authUserId
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),

  // Payment Details
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()),
  paymentMethod: v.optional(baseValidators.paymentMethod),
  paidBy: v.optional(v.string()), // authUserId

  // Cancellation
  cancelledBy: v.optional(v.string()),
  cancelledDate: v.optional(v.number()),
  cancellationReason: v.optional(v.string()),

  // Related Tracking
  relatedShipments: v.optional(v.array(v.id('yourobcShipments'))),
  relatedQuotes: v.optional(v.array(v.id('yourobcQuotes'))),

  // Notes
  description: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_commissionId', ['commissionId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_employee', ['employeeId'])
  .index('by_status', ['status'])
  .index('by_shipment', ['shipmentId'])
  .index('by_quote', ['quoteId'])
  .index('by_invoice', ['invoiceId'])
  .index('by_employee_status', ['employeeId', 'status'])
  .index('by_employee_period', ['employeeId', 'period'])
  .index('by_period', ['period'])
  .index('by_owner_and_status', ['ownerId', 'status']);

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
  });
