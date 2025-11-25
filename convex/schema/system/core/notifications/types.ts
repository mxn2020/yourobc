// convex/schema/system/core/notifications/types.ts
// Type extractions from validators for notifications module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { notificationsFields, notificationsValidators } from './validators';
import { notificationsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type Notification = Doc<'notifications'>;
export type NotificationId = Id<'notifications'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type NotificationSchema = Infer<typeof notificationsTable.validator>;

// ============================================
// Validator Types
// ============================================

export type NotificationType = Infer<typeof notificationsValidators.type>;
export type NotificationEntityType = Infer<typeof notificationsValidators.entityType>;
export type NotificationEntityId = Infer<typeof notificationsValidators.entityId>;

// ============================================
// Field Types
// ============================================

export type NotificationContent = Infer<typeof notificationsFields.content>;
export type NotificationMetadata = Infer<typeof notificationsFields.metadata>;
