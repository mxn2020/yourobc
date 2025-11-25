// convex/schema/yourobc/supporting/notifications/types.ts
import { Infer } from 'convex/values';
import { notificationsValidators } from './validators';

export type NotificationType = Infer<typeof notificationsValidators.notificationType>;
export type NotificationPriority = Infer<typeof notificationsValidators.notificationPriority>;
