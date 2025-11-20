// convex/schema/software/yourobc/shipments/validators.ts
// Validators for shipments module

import { v } from 'convex/values';

// ============================================================================
// Status Validators
// ============================================================================

/**
 * Shipment status validator
 */
export const shipmentStatusValidator = v.union(
  v.literal('quoted'),
  v.literal('booked'),
  v.literal('pickup'),
  v.literal('in_transit'),
  v.literal('delivered'),
  v.literal('customs'),
  v.literal('document'),
  v.literal('invoiced'),
  v.literal('cancelled')
);

/**
 * SLA status validator
 */
export const slaStatusValidator = v.union(
  v.literal('on_time'),
  v.literal('warning'),
  v.literal('overdue')
);

/**
 * Document completion status validator
 */
export const documentCompletionStatusValidator = v.union(
  v.literal('missing'),
  v.literal('pending'),
  v.literal('complete')
);

// ============================================================================
// Service Type Validators
// ============================================================================

/**
 * Service type validator
 */
export const serviceTypeValidator = v.union(
  v.literal('OBC'),
  v.literal('NFO')
);

/**
 * Service priority validator
 */
export const servicePriorityValidator = v.union(
  v.literal('standard'),
  v.literal('urgent'),
  v.literal('critical')
);

/**
 * Communication channel validator
 */
export const communicationChannelValidator = v.union(
  v.literal('email'),
  v.literal('whatsapp'),
  v.literal('phone'),
  v.literal('other')
);

// ============================================================================
// Dimension and Unit Validators
// ============================================================================

/**
 * Dimension unit validator
 */
export const dimensionUnitValidator = v.union(
  v.literal('cm'),
  v.literal('inch')
);

/**
 * Weight unit validator
 */
export const weightUnitValidator = v.union(
  v.literal('kg'),
  v.literal('lb')
);

// ============================================================================
// Currency Validator
// ============================================================================

/**
 * Currency validator
 */
export const currencyValidator = v.union(
  v.literal('EUR'),
  v.literal('USD')
);

// ============================================================================
// Complex Schema Validators
// ============================================================================

/**
 * Address schema validator
 */
export const addressSchema = v.object({
  street: v.optional(v.string()),
  city: v.string(),
  postalCode: v.optional(v.string()),
  country: v.string(),
  countryCode: v.string(),
});

/**
 * Dimensions schema validator
 */
export const dimensionsSchema = v.object({
  length: v.number(),
  width: v.number(),
  height: v.number(),
  weight: v.number(),
  unit: dimensionUnitValidator,
  weightUnit: weightUnitValidator,
  chargeableWeight: v.optional(v.number()),
});

/**
 * Currency amount schema validator
 */
export const currencyAmountSchema = v.object({
  amount: v.number(),
  currency: currencyValidator,
  exchangeRate: v.optional(v.number()),
  exchangeRateDate: v.optional(v.number()),
});

/**
 * SLA schema validator
 */
export const slaSchema = v.object({
  deadline: v.number(),
  status: slaStatusValidator,
  remainingHours: v.optional(v.number()),
});

/**
 * Next task schema validator
 */
export const nextTaskSchema = v.object({
  description: v.string(),
  assignedTo: v.optional(v.string()),
  dueDate: v.optional(v.number()),
  priority: servicePriorityValidator,
});

/**
 * Flight details schema validator
 */
export const flightDetailsSchema = v.object({
  flightNumber: v.optional(v.string()),
  airline: v.optional(v.string()),
  airlineCode: v.optional(v.string()),
  departureTime: v.optional(v.number()),
  arrivalTime: v.optional(v.number()),
  departureAirport: v.optional(v.string()),
  arrivalAirport: v.optional(v.string()),
});

/**
 * Routing schema validator
 */
export const routingSchema = v.object({
  outboundFlight: v.optional(flightDetailsSchema),
  returnFlight: v.optional(flightDetailsSchema),
  cwt: v.optional(v.number()),
  preAlertCwt: v.optional(v.number()),
});

/**
 * Document status schema validator
 */
export const documentStatusSchema = v.object({
  awb: documentCompletionStatusValidator,
  hawb: v.optional(documentCompletionStatusValidator),
  mawb: v.optional(documentCompletionStatusValidator),
  pod: documentCompletionStatusValidator,
});

/**
 * Customs information schema validator
 */
export const customsInfoSchema = v.object({
  hasExport: v.boolean(),
  hasImport: v.boolean(),
  hasTransit: v.boolean(),
  exportDocuments: v.optional(v.array(v.string())),
  importDocuments: v.optional(v.array(v.string())),
  transitDocuments: v.optional(v.array(v.string())),
  customsValue: v.optional(currencyAmountSchema),
  customsNotes: v.optional(v.string()),
});

/**
 * Scheduled time schema validator
 */
export const scheduledTimeSchema = v.object({
  utcTimestamp: v.number(),
  timezone: v.string(),
});

// ============================================================================
// Metadata and Audit Fields
// ============================================================================

/**
 * Metadata schema validator
 */
export const metadataSchema = {
  tags: v.array(v.string()),
  category: v.optional(v.string()),
  customFields: v.optional(v.object({})),
};

/**
 * Audit fields
 */
export const auditFields = {
  createdBy: v.string(),
  createdAt: v.number(),
  updatedBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
};

/**
 * Soft delete fields
 */
export const softDeleteFields = {
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.string()),
};
