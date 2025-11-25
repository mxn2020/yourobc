// convex/schema/system/app_theme_settings/app_theme_settings/validators.ts
// Grouped validators and complex fields for app_theme_settings module

import { v } from 'convex/values';

// Theme values can be simple scalars, arrays, or objects (no v.any)
const themeValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.object({}),
  v.array(v.union(v.string(), v.number(), v.boolean()))
);

export const appThemeSettingsFields = {
  themeValue,
  metadata: v.object({}),
} as const;

export const appThemeSettingsValidators = {} as const;
