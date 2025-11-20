// convex/schema/software/yourobc/trackingMessages/trackingMessages.ts
// Table definitions for trackingMessages module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { trackingMessagesValidators } from './validators';

export const trackingMessagesTable = defineTable({
  // Required: Main display field
  messageId: v.string(), // Auto-generated or custom identifier

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Message details
  status: trackingMessagesValidators.status,
  messageType: trackingMessagesValidators.messageType,
  priority: v.optional(trackingMessagesValidators.priority),

  // Message content
  subject: v.optional(v.string()),
  content: v.string(),
  templateId: v.optional(v.string()),

  // Shipment reference
  shipmentId: v.optional(v.id('yourobcShipments')),
  shipmentNumber: v.optional(v.string()),

  // Recipients
  recipients: v.array(v.object({
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    name: v.optional(v.string()),
    userId: v.optional(v.id('userProfiles')),
  })),

  // Delivery tracking
  deliveryChannel: v.optional(trackingMessagesValidators.deliveryChannel),
  sentAt: v.optional(v.number()),
  deliveredAt: v.optional(v.number()),
  readAt: v.optional(v.number()),
  readBy: v.optional(v.id('userProfiles')),

  // Attachments
  attachments: v.optional(v.array(v.object({
    id: v.string(),
    name: v.string(),
    url: v.string(),
    type: v.string(),
    size: v.optional(v.number()),
  }))),

  // Timeline tracking
  timelineEvents: v.optional(v.array(v.object({
    id: v.string(),
    timestamp: v.number(),
    event: v.string(),
    description: v.optional(v.string()),
    userId: v.optional(v.id('userProfiles')),
  }))),

  // Routing info
  routingInfo: v.optional(v.object({
    origin: v.optional(v.string()),
    destination: v.optional(v.string()),
    currentLocation: v.optional(v.string()),
    estimatedDelivery: v.optional(v.number()),
  })),

  // Classification
  tags: v.optional(v.array(v.string())),
  category: v.optional(v.string()),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_message_id', ['messageId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_shipment', ['shipmentId'])
  .index('by_message_type', ['messageType'])
  .index('by_sent_at', ['sentAt'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_shipment_and_type', ['shipmentId', 'messageType'])
  .index('by_created_at', ['createdAt']);
