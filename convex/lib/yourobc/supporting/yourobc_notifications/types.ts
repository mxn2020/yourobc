// convex/lib/yourobc/supporting/yourobc_notifications/types.ts
// convex/yourobc/supporting/yourobcNotifications/types.ts
import type { Doc, Id } from '../../../../_generated/dataModel';

export type YourOBCNotification = Doc<'yourobcNotifications'>;
export type YourOBCNotificationId = Id<'yourobcNotifications'>;

export interface CreateYourOBCNotificationData {
  userId: string;
  type: YourOBCNotification['type'];
  title: string;
  message: string;
  entityType: YourOBCNotification['entityType'];
  entityId: string;
  priority?: YourOBCNotification['priority'];
  actionUrl?: string;
}

