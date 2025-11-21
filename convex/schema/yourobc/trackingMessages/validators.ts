// convex/schema/yourobc/trackingMessages/validators.ts
// Grouped validators for trackingMessages module

import { v } from 'convex/values';

export const trackingMessagesValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('sent'),
    v.literal('delivered'),
    v.literal('read'),
    v.literal('archived')
  ),

  messageType: v.union(
    v.literal('event'),
    v.literal('note'),
    v.literal('alert'),
    v.literal('update'),
    v.literal('notification')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('normal'),
    v.literal('high'),
    v.literal('urgent')
  ),

  deliveryChannel: v.union(
    v.literal('email'),
    v.literal('sms'),
    v.literal('push'),
    v.literal('internal')
  ),
} as const;
