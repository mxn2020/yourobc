// convex/schema/yourobc/quotes/validators.ts
// Grouped validators for quotes module

import { baseFields } from '@/schema/base.validators';
import { v } from 'convex/values';

export const quotesValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('sent'),
    v.literal('pending'),
    v.literal('accepted'),
    v.literal('rejected'),
    v.literal('expired')
  ),

  priority: v.union(
    v.literal('standard'),
    v.literal('urgent'),
    v.literal('critical')
  ),

  shipmentType: v.union(
    v.literal('door-door'),
    v.literal('door-airport'),
    v.literal('airport-door'),
    v.literal('airport-airport')
  ),

  currency: v.union(
    v.literal('EUR'),
    v.literal('USD')
  ),

  dimensionUnit: v.union(
    v.literal('cm'),
    v.literal('inch')
  ),

  weightUnit: v.union(
    v.literal('kg'),
    v.literal('lb')
  ),
} as const;

export const quotesFields = {
  dimensions: v.object({
    length: v.number(),
    width: v.number(),
    height: v.number(),
    weight: v.number(),
    unit: quotesValidators.dimensionUnit,
    weightUnit: quotesValidators.weightUnit,
    chargeableWeight: v.optional(v.number()),
  }),

  flightDetails: v.object({
    flightNumber: v.optional(v.string()),
    airline: v.optional(v.string()),
    airlineCode: v.optional(v.string()),
    departureTime: v.optional(v.number()),
    arrivalTime: v.optional(v.number()),
    departureAirport: v.optional(v.string()),
    arrivalAirport: v.optional(v.string()),
  }),

  partnerQuote: v.object({
    partnerId: v.id('yourobcPartners'),
    partnerName: v.string(),
    quotedPrice: baseFields.currencyAmount,
    transitTime: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    receivedAt: v.number(),
    notes: v.optional(v.string()),
    isSelected: v.optional(v.boolean()),
  }),

  airlineRules: v.object({
    airlineCode: v.string(),
    airlineName: v.string(),
    maxBaggageWeight: v.number(),
    maxBaggagePieces: v.number(),
    excessBaggageFee: v.optional(v.number()),
    couriersRequired: v.optional(v.number()),
  }),
};
