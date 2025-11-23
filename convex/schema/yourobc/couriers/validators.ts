// convex/schema/yourobc/couriers/validators.ts
/**
 * Couriers Validators
 *
 * Shared enums and complex validators for the couriers module.
 * Aligns with the Convex template structure for clarity and reusability.
 */

import { v } from 'convex/values';

const courierStatuses = ['active', 'inactive', 'archived'] as const;
const courierServiceTypes = [
  'OBC',
  'NFO',
  'express',
  'standard',
  'freight',
  'international',
  'domestic',
] as const;
const courierDeliverySpeeds = [
  'same_day',
  'next_day',
  '2_3_days',
  '3_5_days',
  '5_7_days',
  '7_14_days',
] as const;
const courierPricingModels = [
  'weight_based',
  'zone_based',
  'flat_rate',
  'volumetric',
  'custom',
] as const;
const courierApiTypes = ['rest', 'soap', 'graphql', 'xml', 'none'] as const;

// Grouped validators for couriers module
export const couriersValidators = {
  status: v.union(...courierStatuses.map(value => v.literal(value))),
  serviceType: v.union(...courierServiceTypes.map(value => v.literal(value))),
  deliverySpeed: v.union(...courierDeliverySpeeds.map(value => v.literal(value))),
  pricingModel: v.union(...courierPricingModels.map(value => v.literal(value))),
  apiType: v.union(...courierApiTypes.map(value => v.literal(value))),
  commissionType: v.union(v.literal('percentage'), v.literal('fixed')),
  commissionSimpleStatus: v.union(v.literal('pending'), v.literal('paid')),
} as const;

// Complex object schemas for couriers module
export const couriersFields = {
  serviceCoverage: v.object({
    countries: v.array(v.string()),
    regions: v.optional(v.array(v.string())),
    cities: v.optional(v.array(v.string())),
    airports: v.optional(v.array(v.string())),
  }),

  maxDimensions: v.object({
    length: v.number(),
    width: v.number(),
    height: v.number(),
  }),

  costStructure: v.object({
    baseFee: v.optional(v.number()),
    perKgRate: v.optional(v.number()),
    perKmRate: v.optional(v.number()),
    fuelSurcharge: v.optional(v.number()),
    handlingFee: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),

  deliveryTimes: v.object({
    standardDomestic: v.optional(v.string()),
    standardInternational: v.optional(v.string()),
    expressDomestic: v.optional(v.string()),
    expressInternational: v.optional(v.string()),
    notes: v.optional(v.string()),
  }),

  apiIntegration: v.object({
    enabled: v.boolean(),
    apiType: couriersValidators.apiType,
    baseUrl: v.optional(v.string()),
    apiVersion: v.optional(v.string()),
    hasTracking: v.optional(v.boolean()),
    hasRateQuotes: v.optional(v.boolean()),
    hasLabelGeneration: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  }),

  apiCredentials: v.object({
    apiKey: v.optional(v.string()),
    apiSecret: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    additionalFields: v.optional(v.object({})),
  }),

  metrics: v.object({
    reliabilityScore: v.optional(v.number()),
    onTimeDeliveryRate: v.optional(v.number()),
    averageTransitDays: v.optional(v.number()),
    lastUpdated: v.optional(v.number()),
  }),
} as const;

export const couriersEnumValues = {
  status: courierStatuses,
  serviceType: courierServiceTypes,
  deliverySpeed: courierDeliverySpeeds,
  pricingModel: courierPricingModels,
  apiType: courierApiTypes,
} as const;
