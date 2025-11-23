// convex/lib/yourobc/supporting/notifications/types.ts
// TypeScript type definitions for notifications module

import type { Doc, Id } from '@/generated/dataModel';

// Entity types
export type Notification = Doc<'yourobcNotifications'>;
export type NotificationId = Id<'yourobcNotifications'>;

// Create operation
export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  priority?: string;
  actionUrl?: string;
}

// List response
export interface NotificationListResponse {
  items: Notification[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Notification stats
export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}
