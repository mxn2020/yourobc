// convex/lib/boilerplate/user_settings/user_model_preferences/queries.ts
// Read operations for user model preferences module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { getCurrentUser } from '@/shared/auth.helper';
import { getDefaultModelPreferences } from './utils';
import { USER_MODEL_PREFERENCES_CONSTANTS } from './constants';

/**
 * Get user model preferences
 * Authentication: Optional (returns defaults if not authenticated)
 * Authorization: Users can only access their own preferences
 * Soft Delete Filtering: Applied
 */
export const getUserModelPreferences = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication (optional for this query)
    const user = await getCurrentUser(ctx);
    if (!user) return getDefaultModelPreferences();

    // 2. Query with soft delete filtering
    const preferences = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    // 3. Return preferences or defaults
    return preferences || getDefaultModelPreferences();
  },
});

/**
 * Get default model for a specific type
 * Authentication: Optional
 * Authorization: Users can only access their own preferences
 * Soft Delete Filtering: Applied
 */
export const getDefaultModel = query({
  args: {
    modelType: v.optional(v.string())
  },
  handler: async (ctx, { modelType = 'language' }) => {
    // 1. Authentication
    const user = await getCurrentUser(ctx);
    if (!user) return undefined;

    // 2. Query with soft delete filtering
    const preferences = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    if (!preferences) return undefined;

    // 3. Map modelType to the correct field
    const fieldMap = {
      language: 'defaultLanguageModel',
      embedding: 'defaultEmbeddingModel',
      image: 'defaultImageModel',
      multimodal: 'defaultMultimodalModel',
    } as const;

    const fieldName = fieldMap[modelType as keyof typeof fieldMap];
    return fieldName ? preferences[fieldName] : undefined;
  },
});

/**
 * Get combined user preferences (settings + model preferences)
 * Authentication: Optional (returns defaults if not authenticated)
 * Authorization: Users can only access their own preferences
 * Soft Delete Filtering: Applied
 */
export const getCombinedUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      return {
        settings: getDefaultUserSettings(),
        modelPreferences: getDefaultModelPreferences(),
      };
    }

    // Query both with soft delete filtering
    const [settings, modelPreferences] = await Promise.all([
      ctx.db
        .query('userSettings')
        .withIndex('by_user_id', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .unique(),
      ctx.db
        .query('userModelPreferences')
        .withIndex('by_user_id', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .unique()
    ]);

    return {
      settings: settings || getDefaultUserSettings(),
      modelPreferences: modelPreferences || getDefaultModelPreferences(),
    };
  },
});

/**
 * Get model preferences by public ID
 * Authentication: Required
 * Authorization: Users can only access their own preferences
 * Soft Delete Filtering: Applied
 */
export const getModelPreferencesByPublicId = query({
  args: {
    publicId: v.string()
  },
  handler: async (ctx, { publicId }) => {
    // 1. Authentication
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // 2. Query with soft delete filtering
    const preferences = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    // 3. Authorization check
    if (!preferences || preferences.userId !== user._id) {
      return null;
    }

    return preferences;
  },
});

// Import getDefaultUserSettings for combined query
import { getDefaultUserSettings } from '../user_settings/utils';
