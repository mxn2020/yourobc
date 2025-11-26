// convex/schema/marketing/social_scheduler/validators.ts
// Grouped validators for social_scheduler module

import { v } from 'convex/values';

export const socialSchedulerValidators = {
  platform: v.union(
    v.literal('twitter'),
    v.literal('facebook'),
    v.literal('instagram'),
    v.literal('linkedin'),
    v.literal('tiktok'),
    v.literal('youtube'),
    v.literal('pinterest')
  ),

  postStatus: v.union(
    v.literal('draft'),
    v.literal('scheduled'),
    v.literal('published'),
    v.literal('failed'),
    v.literal('archived')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  mediaType: v.union(
    v.literal('image'),
    v.literal('video'),
    v.literal('carousel'),
    v.literal('none')
  ),
} as const;
