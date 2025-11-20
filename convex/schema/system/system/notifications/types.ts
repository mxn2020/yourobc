// convex/schema/boilerplate/system/notifications/types.ts
// Type extractions from validators for notifications module

import { Infer } from 'convex/values';
import { notificationsValidators } from './validators';

// Extract types from validators
export type NotificationType = Infer<typeof notificationsValidators.type>;
