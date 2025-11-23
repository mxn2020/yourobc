// convex/schema/system/notifications/notifications/types.ts
// Type extractions from validators for notifications module

import { Infer } from 'convex/values';
import { notificationsFields, notificationsValidators } from './validators';

export type NotificationType = Infer<typeof notificationsValidators.type>;
export type NotificationEntityType = Infer<typeof notificationsValidators.entityType>;
export type NotificationEntityId = Infer<typeof notificationsValidators.entityId>;
export type NotificationContent = Infer<typeof notificationsFields.content>;
export type NotificationMetadata = Infer<typeof notificationsFields.metadata>;
