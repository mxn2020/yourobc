import { v } from 'convex/values';

export const notificationsValidators = {
  notificationType: v.union(
    v.literal('info'),
    v.literal('success'),
    v.literal('warning'),
    v.literal('error')
  ),
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high')
  ),
} as const;

export const notificationsFields = {} as const;
