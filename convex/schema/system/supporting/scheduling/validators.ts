// convex/schema/system/supporting/scheduling/validators.ts
// Grouped validators for scheduling module

import { v } from 'convex/values';

export const schedulingValidators = {
  type: v.union(
    v.literal('meeting'),
    v.literal('event'),
    v.literal('deadline'),
    v.literal('task'),
    v.literal('reminder'),
    v.literal('blog_post'),
    v.literal('social_media'),
    v.literal('other')
  ),
  status: v.union(
    v.literal('scheduled'),
    v.literal('confirmed'),
    v.literal('cancelled'),
    v.literal('completed'),
    v.literal('in_progress'),
    v.literal('postponed')
  ),
  processingStatus: v.union(
    v.literal('pending'),
    v.literal('processing'),
    v.literal('completed'),
    v.literal('failed'),
    v.literal('skipped')
  ),
  visibility: v.union(
    v.literal('public'),
    v.literal('private'),
    v.literal('team'),
    v.literal('restricted')
  ),
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent'),
    v.literal('critical')
  ),
  attendeeStatus: v.union(
    v.literal('pending'),
    v.literal('accepted'),
    v.literal('declined'),
    v.literal('tentative')
  ),
  locationType: v.union(
    v.literal('physical'),
    v.literal('virtual'),
    v.literal('phone'),
    v.literal('other')
  ),
  reminderType: v.union(
    v.literal('email'),
    v.literal('notification'),
    v.literal('sms')
  ),
  recurrenceFrequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('yearly'),
    v.literal('custom')
  ),
} as const;
