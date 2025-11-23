// convex/schema/system/notifications/notifications/types.ts
// Type extractions from validators for notifications module

import { Infer } from 'convex/values';
import { notificationsFields, notificationsValidators } from './validators';

export type NotificationType = Infer<typeof notificationsValidators.type>;
export type NotificationContent = Infer<typeof notificationsFields.content>;
export type NotificationMetadata = Infer<typeof notificationsFields.metadata>;
