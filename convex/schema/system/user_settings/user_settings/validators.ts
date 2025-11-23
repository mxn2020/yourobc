// convex/schema/system/user_settings/user_settings/validators.ts
// Grouped validators and complex fields for user settings module

import { v } from 'convex/values';

export const userSettingsValidators = {
  theme: v.union(v.literal('light'), v.literal('dark'), v.literal('auto')),
  layout: v.union(v.literal('header'), v.literal('sidebar')),
  dashboardView: v.union(v.literal('cards'), v.literal('table')),
} as const;

export const userSettingsFields = {
  layoutPreferences: v.object({
    layout: userSettingsValidators.layout,
  }),
  notificationPreferences: v.object({
    email: v.boolean(),
    push: v.boolean(),
    projectUpdates: v.boolean(),
    assignments: v.boolean(),
    deadlines: v.boolean(),
  }),
  dashboardPreferences: v.object({
    defaultView: userSettingsValidators.dashboardView,
    itemsPerPage: v.number(),
    showCompletedProjects: v.boolean(),
  }),
} as const;
