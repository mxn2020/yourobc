// convex/schema/software/yourobc/partners/validators.ts
// Grouped validators for partners module

import { v } from 'convex/values';
import {
  partnerStatusValidator,
  partnerServiceTypeValidator,
  currencyValidator,
} from '../../../yourobc/base';

export const partnersValidators = {
  // Partner status
  status: partnerStatusValidator,

  // Service type
  serviceType: partnerServiceTypeValidator,

  // Currency
  currency: currencyValidator,

  // Ranking (1-5 stars)
  ranking: v.union(
    v.literal(1),
    v.literal(2),
    v.literal(3),
    v.literal(4),
    v.literal(5)
  ),

  // Service capabilities flags
  serviceCapabilities: v.object({
    handlesCustoms: v.optional(v.boolean()),
    handlesPickup: v.optional(v.boolean()),
    handlesDelivery: v.optional(v.boolean()),
    handlesNFO: v.optional(v.boolean()),
    handlesTrucking: v.optional(v.boolean()),
  }),
} as const;
