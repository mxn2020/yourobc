// convex/schema/system/user_settings/user_model_preferences/validators.ts
// Grouped validators for user model preferences module

import { v } from 'convex/values';

export const userModelPreferencesValidators = {
  // Preferred view type validator
  preferredView: v.union(
    v.literal('grid'),
    v.literal('list')
  ),

  // Sort direction validator
  sortDirection: v.union(
    v.literal('asc'),
    v.literal('desc')
  ),

  // Sort preference validator
  sortPreference: v.object({
    field: v.string(),
    direction: v.union(v.literal('asc'), v.literal('desc')),
  }),

  // Testing defaults validator
  testingDefaults: v.object({
    temperature: v.number(),
    maxTokens: v.number(),
    topP: v.number(),
  }),
} as const;
