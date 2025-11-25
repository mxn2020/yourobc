import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { notificationsValidators } from './validators';
import { notificationsTable } from './tables';

export type SupportingNotification = Doc<'notifications'>;
export type SupportingNotificationId = Id<'notifications'>;
export type SupportingNotificationSchema = Infer<typeof notificationsTable.validator>;
export type SupportingNotificationType = Infer<typeof notificationsValidators.notificationType>;
export type SupportingNotificationPriority = Infer<typeof notificationsValidators.priority>;
