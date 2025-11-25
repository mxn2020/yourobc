// convex/schema/yourobc/supporting/notifications/types.ts
// Type definitions for notifications module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { notificationsValidators } from './validators';
import { notificationsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type Notification = Doc<'yourobcNotifications'>;
export type NotificationId = Id<'yourobcNotifications'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type NotificationSchema = Infer<typeof notificationsTable.validator>;

// ============================================
// Validator Types
// ============================================

export type NotificationType = Infer<typeof notificationsValidators.notificationType>;
export type NotificationPriority = Infer<typeof notificationsValidators.notificationPriority>;
