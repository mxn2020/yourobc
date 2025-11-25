import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { notificationsValidators } from './validators';
import { notificationsTable } from './tables';

export type SystemSupportingNotification = Doc<'systemSupportingNotifications'>;
export type SystemSupportingNotificationId = Id<'systemSupportingNotifications'>;
export type SystemSupportingNotificationSchema = Infer<typeof notificationsTable.validator>;
export type SystemSupportingNotificationType = Infer<typeof notificationsValidators.notificationType>;
export type SystemSupportingNotificationPriority = Infer<typeof notificationsValidators.priority>;
