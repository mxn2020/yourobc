// convex/lib/system/system/notifications/types.ts
// TypeScript type definitions for notifications module

import type { Doc, Id } from '@/generated/dataModel';

export type Notification = Doc<'notifications'>;
export type NotificationId = Id<'notifications'>;

export interface CreateNotificationData {
  title: string;
  [key: string]: any;
}

export interface UpdateNotificationData {
  title?: string;
  [key: string]: any;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  hasMore: boolean;
}
