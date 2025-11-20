// convex/schema/software/yourobc/couriers/validators.ts
// Validators for couriers module

import { v } from 'convex/values';

// Re-export validators from base
export {
  courierStatusValidator,
  commissionTypeValidator,
  commissionSimpleStatusValidator,
  currencyValidator,
  paymentMethodValidator,
  timeEntryTypeValidator,
  quoteServiceTypeValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '../../../yourobc/base';

// Re-export types from base
export type {
  CourierStatus,
  CommissionType,
  CommissionSimpleStatus,
  Currency,
  PaymentMethod,
  TimeEntryType,
  QuoteServiceType,
} from '../../../yourobc/base';

// ============================================================================
// Reusable Schemas
// ============================================================================

/**
 * Time entry schema validator
 */
export const timeEntrySchema = v.object({
  type: v.union(v.literal('login'), v.literal('logout')),
  timestamp: v.number(),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
});

/**
 * Skills schema validator
 */
export const skillsSchema = v.object({
  languages: v.array(v.string()),
  maxCarryWeight: v.optional(v.number()),
  availableServices: v.array(v.union(v.literal('OBC'), v.literal('NFO'))),
  certifications: v.optional(v.array(v.string())),
});

/**
 * Cost profile schema validator
 */
export const costProfileSchema = v.object({
  baseRate: v.optional(v.number()),
  overtimeRate: v.optional(v.number()),
  currency: v.optional(v.union(v.literal('EUR'), v.literal('USD'))),
  notes: v.optional(v.string()),
});

/**
 * Service coverage schema validator
 */
export const serviceCoverageSchema = v.object({
  countries: v.optional(v.array(v.string())),
  airports: v.optional(v.array(v.string())),
  cities: v.optional(v.array(v.string())),
});

/**
 * Current location schema validator
 */
export const currentLocationSchema = v.object({
  country: v.string(),
  countryCode: v.string(),
  city: v.optional(v.string()),
});
