// convex/schema/yourobc/trackingMessages/schemas.ts
// Schema exports for trackingMessages module

import { v } from 'convex/values';
import { trackingMessagesTable } from './tables';

export const trackingMessageIdSchema = v.id('yourobcTrackingMessages')

export const yourobcTrackingMessagesSchemas = {
  yourobcTrackingMessages: trackingMessagesTable,
};
