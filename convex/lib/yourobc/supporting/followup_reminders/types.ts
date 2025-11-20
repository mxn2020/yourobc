// convex/lib/yourobc/supporting/followup_reminders/types.ts
// convex/yourobc/supporting/followupReminders/types.ts
import type { Doc, Id } from '../../../../_generated/dataModel';

export type FollowupReminder = Doc<'yourobcFollowupReminders'>;
export type FollowupReminderId = Id<'yourobcFollowupReminders'>;

export interface CreateReminderData {
  title: string;
  description?: string;
  type: FollowupReminder['type'];
  entityType: FollowupReminder['entityType'];
  entityId: string;
  dueDate: number;
  priority?: FollowupReminder['priority'];
  assignedTo: string;
  emailReminder?: boolean;
}

