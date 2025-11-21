// convex/schema/yourobc/trackingMessages/trackingMessages.ts
// Table definitions for trackingMessages module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, classificationFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';
import {
  trackingMessagesValidators,
  trackingMessagesFields
} from './validators';
import { shipmentIdSchema } from '../shipments/schemas';

export const trackingMessagesTable = defineTable({
  // Required: Main display field
  messageId: v.string(), // Auto-generated or custom identifier

  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Message details
  status: trackingMessagesValidators.status,
  messageType: trackingMessagesValidators.messageType,
  priority: v.optional(trackingMessagesValidators.priority),

  // Message content
  subject: v.optional(v.string()),
  content: v.string(),
  templateId: v.optional(v.string()),

  // Shipment reference
  shipmentId: v.optional(shipmentIdSchema),
  shipmentNumber: v.optional(v.string()),

  // Recipients
  recipients: v.array(trackingMessagesFields.recipient),

  // Delivery tracking
  deliveryChannel: v.optional(trackingMessagesValidators.deliveryChannel),
  sentAt: v.optional(v.number()),
  deliveredAt: v.optional(v.number()),
  readAt: v.optional(v.number()),
  readBy: v.optional(userProfileIdSchema),

  // Attachments
  attachments: v.optional(v.array(trackingMessagesFields.attachment)),

  // Timeline tracking
  timelineEvents: v.optional(v.array(trackingMessagesFields.timelineEvent)),

  // Routing info
  routingInfo: v.optional(trackingMessagesFields.routingInfo),

  // Classification
  ...classificationFields,

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
