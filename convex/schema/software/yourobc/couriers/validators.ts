// convex/schema/software/yourobc/couriers/validators.ts
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
} as const;
