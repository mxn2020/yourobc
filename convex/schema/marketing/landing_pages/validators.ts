// convex/schema/marketing/landing_pages/validators.ts
// Grouped validators for landing_pages module

import { v } from 'convex/values';

export const landingPagesValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('published'),
    v.literal('archived'),
    v.literal('scheduled')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  sectionType: v.union(
    v.literal('hero'),
    v.literal('features'),
    v.literal('testimonials'),
    v.literal('pricing'),
    v.literal('cta'),
    v.literal('form'),
    v.literal('custom')
  ),
} as const;
