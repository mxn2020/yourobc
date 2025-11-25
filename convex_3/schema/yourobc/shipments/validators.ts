// convex/schema/yourobc/shipments/validators.ts
// Grouped validators for shipments module

import { v } from 'convex/values';

/**
 * Simple union validators for shipments
 * Used for status fields, enums, and simple type constraints
 */
export const shipmentsValidators = {
  status: v.union(
    v.literal('quoted'),
    v.literal('booked'),
    v.literal('pickup'),
    v.literal('in_transit'),
    v.literal('delivered'),
    v.literal('customs'),
    v.literal('document'),
    v.literal('invoiced'),
    v.literal('cancelled')
  ),

  priority: v.union(
    v.literal('standard'),
    v.literal('urgent'),
    v.literal('critical')
  ),

  communicationChannel: v.union(
    v.literal('email'),
    v.literal('whatsapp'),
    v.literal('phone'),
    v.literal('other')
  ),

  slaStatus: v.union(
    v.literal('on_track'),
    v.literal('at_risk'),
    v.literal('breached')
  ),

  documentStatus: v.union(
    v.literal('pending'),
    v.literal('received'),
    v.literal('verified'),
    v.literal('missing')
  ),

  currency: v.union(
    v.literal('EUR'),
    v.literal('USD')
  ),

  contactRole: v.union(
    v.literal('Entscheider'), // Decision maker
    v.literal('Buchhaltung'), // Accounting
    v.literal('Logistik'), // Logistics
    v.literal('Einkauf'), // Purchasing
    v.literal('Geschäftsführung'), // Management
    v.literal('Sonstiges') // Other
  ),

  preferredContactMethod: v.union(
    v.literal('email'),
    v.literal('phone'),
    v.literal('mobile')
  ),

  dimensionUnit: v.union(
    v.literal('cm'),
    v.literal('inch')
  ),

  weightUnit: v.union(
    v.literal('kg'),
    v.literal('lb')
  ),

  documentCompletionStatus: v.union(
    v.literal('missing'),
    v.literal('pending'),
    v.literal('complete')
  ),
} as const;

/**
 * Complex object validators for shipments
 * Used for nested data structures and composed objects
 */
export const shipmentsFields = {
  currencyAmount: v.object({
    amount: v.number(),
    currency: shipmentsValidators.currency,
    exchangeRate: v.optional(v.number()),
    exchangeRateDate: v.optional(v.number()),
  }),

  address: v.object({
    street: v.optional(v.string()),
    city: v.string(),
    postalCode: v.optional(v.string()),
    country: v.string(),
    countryCode: v.string(),
  }),

  contact: v.object({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    isPrimary: v.boolean(),
    role: v.optional(shipmentsValidators.contactRole),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    mobile: v.optional(v.string()),
    preferredContactMethod: v.optional(shipmentsValidators.preferredContactMethod),
  }),

  dimensions: v.object({
    length: v.number(),
    width: v.number(),
    height: v.number(),
    weight: v.number(),
    unit: shipmentsValidators.dimensionUnit,
    weightUnit: shipmentsValidators.weightUnit,
    chargeableWeight: v.optional(v.number()),
  }),

  sla: v.object({
    deadline: v.number(),
    status: shipmentsValidators.slaStatus,
    remainingHours: v.optional(v.number()),
  }),

  nextTask: v.object({
    description: v.string(),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: shipmentsValidators.priority,
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

  routing: v.object({
    outboundFlight: v.optional(v.object({
      flightNumber: v.optional(v.string()),
      airline: v.optional(v.string()),
      airlineCode: v.optional(v.string()),
      departureTime: v.optional(v.number()),
      arrivalTime: v.optional(v.number()),
      departureAirport: v.optional(v.string()),
      arrivalAirport: v.optional(v.string()),
    })),
    returnFlight: v.optional(v.object({
      flightNumber: v.optional(v.string()),
      airline: v.optional(v.string()),
      airlineCode: v.optional(v.string()),
      departureTime: v.optional(v.number()),
      arrivalTime: v.optional(v.number()),
      departureAirport: v.optional(v.string()),
      arrivalAirport: v.optional(v.string()),
    })),
    cwt: v.optional(v.number()),
    preAlertCwt: v.optional(v.number()),
  }),

  documentStatusSchema: v.object({
    awb: shipmentsValidators.documentCompletionStatus,
    hawb: v.optional(shipmentsValidators.documentCompletionStatus),
    mawb: v.optional(shipmentsValidators.documentCompletionStatus),
    pod: shipmentsValidators.documentCompletionStatus,
  }),

  customsInfo: v.object({
    hasExport: v.boolean(),
    hasImport: v.boolean(),
    hasTransit: v.boolean(),
    exportDocuments: v.optional(v.array(v.string())),
    importDocuments: v.optional(v.array(v.string())),
    transitDocuments: v.optional(v.array(v.string())),
    customsValue: v.optional(v.object({
      amount: v.number(),
      currency: shipmentsValidators.currency,
      exchangeRate: v.optional(v.number()),
      exchangeRateDate: v.optional(v.number()),
    })),
    customsNotes: v.optional(v.string()),
  }),

  scheduledTime: v.object({
    utcTimestamp: v.number(),
    timezone: v.string(),
  }),
} as const;
