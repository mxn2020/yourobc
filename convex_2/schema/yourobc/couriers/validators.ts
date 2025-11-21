// Grouped validators for couriers module

import { v } from 'convex/values';

export const couriersValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('archived')
  ),

  serviceType: v.union(
    v.literal('OBC'),
    v.literal('NFO'),
    v.literal('express'),
    v.literal('standard'),
    v.literal('freight'),
    v.literal('international'),
    v.literal('domestic')
  ),

  deliverySpeed: v.union(
    v.literal('same_day'),
    v.literal('next_day'),
    v.literal('2_3_days'),
    v.literal('3_5_days'),
    v.literal('5_7_days'),
    v.literal('7_14_days')
  ),

  pricingModel: v.union(
    v.literal('weight_based'),
    v.literal('zone_based'),
    v.literal('flat_rate'),
    v.literal('volumetric'),
    v.literal('custom')
  ),

  apiType: v.union(
    v.literal('rest'),
    v.literal('soap'),
    v.literal('graphql'),
    v.literal('xml'),
    v.literal('none')
  ),

  commissionType: v.union(v.literal('percentage'), v.literal('fixed')),
  commissionSimpleStatus: v.union(v.literal('pending'), v.literal('paid')),
} as const;

/**
 * Complex object schemas for couriers module
 */
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
