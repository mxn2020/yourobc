// convex/schema/system/user_settings/user_settings/validators.ts
// Grouped validators for user settings module

import { v } from 'convex/values';

export const userSettingsValidators = {
  // Theme validator
  theme: v.union(
    v.literal('light'),
    v.literal('dark'),
    v.literal('auto')
  ),

  // Layout type validator
  layout: v.union(
    v.literal('header'),
    v.literal('sidebar')
  ),

  // Layout preferences validator
  layoutPreferences: v.object({
    layout: v.union(v.literal('header'), v.literal('sidebar')),
  }),

  // Notification preferences validator
  notificationPreferences: v.object({
    email: v.boolean(),
    push: v.boolean(),
    projectUpdates: v.boolean(),
    assignments: v.boolean(),
    deadlines: v.boolean(),
  }),

  // Dashboard view type validator
  dashboardView: v.union(
    v.literal('cards'),
    v.literal('table')
  ),

  // Dashboard preferences validator
  dashboardPreferences: v.object({
    defaultView: v.union(v.literal('cards'), v.literal('table')),
    itemsPerPage: v.number(),
    showCompletedProjects: v.boolean(),
  }),
} as const;
