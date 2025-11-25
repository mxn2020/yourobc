import { v } from 'convex/values';

export const inquirySourcesValidators = {
  sourceType: v.union(
    v.literal('website'),
    v.literal('email'),
    v.literal('phone'),
    v.literal('referral'),
    v.literal('social_media'),
    v.literal('advertisement'),
    v.literal('other')
  ),
} as const;

export const inquirySourcesFields = {} as const;
