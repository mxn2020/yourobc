// convex/lib/system/supporting/notifications/types.ts
// Type definitions for system notifications module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  SystemSupportingNotificationType,
  SystemSupportingNotificationPriority,
} from '@/schema/system/supporting/notifications/types';

export type SystemNotification = Doc<'notifications'>;
export type SystemNotificationId = Id<'notifications'>;

export interface CreateSystemNotificationData {
  name: string;
  message: string;
  type: SystemSupportingNotificationType;
  priority: SystemSupportingNotificationPriority;
  recipientId: Id<'userProfiles'>;
  entityType?: string;
  entityId?: string;
}

export interface UpdateSystemNotificationData {
  isRead?: boolean;
}

export interface SystemNotificationFilters {
  type?: SystemSupportingNotificationType;
  priority?: SystemSupportingNotificationPriority;
  isRead?: boolean;
}

export interface SystemNotificationListResponse {
  items: SystemNotification[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}
