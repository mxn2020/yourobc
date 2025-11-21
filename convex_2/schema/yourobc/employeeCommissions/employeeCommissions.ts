// convex/schema/yourobc/employeeCommissions/employeeCommissions.ts
// Table definitions for employeeCommissions module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  currencyValidator,
  auditFields,
  softDeleteFields,
} from '@/schema/base';
import {
  employeeCommissionsValidators,
  employeeCommissionsFields,
} from './validators';
import { baseValidators } from '@/schema/base.validators';

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
