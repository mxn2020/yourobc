// convex/schema/boilerplate/system/appThemeSettings/validators.ts
// Grouped validators for appThemeSettings module

import { v } from 'convex/values';
import { metadataSchema } from '../../../base';

export const appThemeSettingsValidators = {
  // Setting key (e.g., 'primaryColor', 'logo', 'fontFamily', 'navigationItems')
  key: v.string(),

  // Setting value (can be any type)
  value: v.any(),

  // Category (e.g., 'theme', 'branding', 'navigation', 'layout')
  category: v.string(),

  // Optional description
  description: v.optional(v.string()),

  // Standard metadata
  metadata: metadataSchema,
} as const;
