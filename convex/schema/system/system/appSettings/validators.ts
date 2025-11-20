// convex/schema/system/system/appSettings/validators.ts
// Grouped validators for appSettings module

import { v } from 'convex/values';
import { metadataSchema } from '../../../base';

export const appSettingsValidators = {
  // Setting key
  key: v.string(),

  // Setting value (can be any type)
  value: v.any(),

  // Category for organization
  category: v.string(),

  // Optional description
  description: v.optional(v.string()),

  // Public accessibility flag
  isPublic: v.boolean(),

  // Standard metadata
  metadata: metadataSchema,
} as const;
