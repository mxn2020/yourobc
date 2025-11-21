// convex/schema/yourobc/shipments/validators.ts
// Grouped validators for shipments module

import { v } from 'convex/values';

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

  serviceType: v.union(
    v.literal('OBC'),
    v.literal('NFO')
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
} as const;
