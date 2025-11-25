// convex/schema/yourobc/trackingMessages/validators.ts
// Grouped validators for trackingMessages module

import { v } from 'convex/values';
import { userProfileIdSchema } from '@/schema/base';

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

export const trackingMessagesFields = {
  recipient: v.object({
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    name: v.optional(v.string()),
    userId: v.optional(userProfileIdSchema),
  }),

  attachment: v.object({
    id: v.string(),
    name: v.string(),
    url: v.string(),
    type: v.string(),
    size: v.optional(v.number()),
  }),

  timelineEvent: v.object({
     id: v.string(),
       timestamp: v.number(),
       event: v.string(),
       description: v.optional(v.string()),
       userId: v.optional(userProfileIdSchema),
  }),

  routingInfo: v.object({
    origin: v.optional(v.string()),
    destination: v.optional(v.string()),
    currentLocation: v.optional(v.string()),
    estimatedDelivery: v.optional(v.number()),
  }),
};