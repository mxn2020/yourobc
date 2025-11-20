// convex/schema/system/supporting/supporting/validators.ts
// Grouped validators for supporting module

import { v } from 'convex/values';

// Wiki Entries Validators
export const wikiValidators = {
  type: v.union(
    v.literal('guide'),
    v.literal('tutorial'),
    v.literal('reference'),
    v.literal('faq'),
    v.literal('article'),
    v.literal('documentation')
  ),
  status: v.union(
    v.literal('draft'),
    v.literal('published'),
    v.literal('archived'),
    v.literal('review')
  ),
  visibility: v.union(
    v.literal('public'),
    v.literal('private'),
    v.literal('team'),
    v.literal('restricted')
  ),
} as const;

// Comments Validators
export const commentValidators = {
  type: v.union(
    v.literal('comment'),
    v.literal('note'),
    v.literal('feedback'),
    v.literal('question'),
    v.literal('answer')
  ),
} as const;

// Reminders Validators
export const reminderValidators = {
  type: v.union(
    v.literal('task'),
    v.literal('reminder'),
    v.literal('follow_up'),
    v.literal('deadline'),
    v.literal('meeting')
  ),
  status: v.union(
    v.literal('pending'),
    v.literal('in_progress'),
    v.literal('completed'),
    v.literal('cancelled'),
    v.literal('snoozed')
  ),
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),
  recurrenceFrequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('yearly'),
    v.literal('custom')
  ),
} as const;

// Documents Validators
export const documentValidators = {
  type: v.union(
    v.literal('file'),
    v.literal('image'),
    v.literal('video'),
    v.literal('audio'),
    v.literal('document'),
    v.literal('spreadsheet'),
    v.literal('presentation'),
    v.literal('pdf'),
    v.literal('other')
  ),
  status: v.union(
    v.literal('uploaded'),
    v.literal('processing'),
    v.literal('ready'),
    v.literal('failed'),
    v.literal('archived')
  ),
} as const;

// Scheduled Events Validators
export const scheduledEventValidators = {
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
} as const;

// Shared/Common Validators
export const commonValidators = {
  recurrenceFrequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('yearly'),
    v.literal('custom')
  ),
} as const;
