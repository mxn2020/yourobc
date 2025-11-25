// convex/lib/system/supporting/types.ts
// Shared types for supporting library modules

import type { Doc, Id } from '@/generated/dataModel';
import { supportingValidators, supportingFields } from '@/schema/system/supporting/validators';

export type Comment = Doc<'comments'>;
export type Document = Doc<'documents'>;
export type ExchangeRate = Doc<'exchangeRates'>;
export type FollowupReminder = Doc<'followupReminders'>;
export type InquirySource = Doc<'inquirySources'>;
export type Notification = Doc<'notifications'>;
export type Counter = Doc<'counters'>;
export type WikiEntry = Doc<'wikiEntries'>;

export type CommentId = Id<'comments'>;
export type DocumentId = Id<'documents'>;
export type ExchangeRateId = Id<'exchangeRates'>;
export type FollowupReminderId = Id<'followupReminders'>;
export type InquirySourceId = Id<'inquirySources'>;
export type NotificationId = Id<'notifications'>;
export type CounterId = Id<'counters'>;
export type WikiEntryId = Id<'wikiEntries'>;

export { supportingValidators, supportingFields };
