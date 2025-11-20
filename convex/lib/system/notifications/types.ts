// convex/lib/boilerplate/notifications/types.ts
// convex/notifications/types.ts

import type { Doc, Id } from '@/generated/dataModel';

export type Notification = Doc<'notifications'>;
export type NotificationId = Id<'notifications'>;

export interface CreateNotificationData {
  userId: Id<'userProfiles'>;
  type: Notification['type'];
  title: string;
  message: string;
  emoji?: string;
  actionUrl?: string;
  entityType?: Notification['entityType'];
  entityId?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: Notification['type'][];
  entityType?: Notification['entityType'];
  dateFrom?: number;
  dateTo?: number;
}

export interface NotificationsListOptions {
  limit?: number;
  offset?: number;
  filters?: NotificationFilters;
}

