// convex/schema/software/freelancer_dashboard/projects/project_calendar/types.ts

import { Infer } from 'convex/values';
import { projectCalendarValidators, projectCalendarFields } from './validators';

export type EventType = Infer<typeof projectCalendarValidators.eventType>;
export type EventStatus = Infer<typeof projectCalendarValidators.status>;
export type ReminderTiming = Infer<typeof projectCalendarValidators.reminderTiming>;
export type Recurrence = Infer<typeof projectCalendarFields.recurrence>;
export type Attendee = Infer<typeof projectCalendarFields.attendee>;
