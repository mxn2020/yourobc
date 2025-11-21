// convex/lib/system/user_settings/user_model_preferences/queries.ts
// Read operations for user_model_preferences module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { getDefaultModelPreferences } from './utils';
import { requireViewModelPreferencesAccess } from './permissions';

/**
 * Get user model preferences
 */
export const getUserModelPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const preferences = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    return preferences || getDefaultModelPreferences();
  },
});

/**
 * Get default model for a specific type
 */
export const getDefaultModel = query({
  args: {
    modelType: v.optional(v.string())
  },
  handler: async (ctx, { modelType = 'language' }) => {
    const user = await requireCurrentUser(ctx);

    const preferences = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    if (!preferences) return undefined;

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
 */
export const getCombinedUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

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
 */
export const getModelPreferencesByPublicId = query({
  args: {
    publicId: v.string()
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const preferences = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    if (!preferences) {
      throw new Error('Preferences not found');
    }

    await requireViewModelPreferencesAccess(ctx, preferences, user);

    return preferences;
  },
});

// Import getDefaultUserSettings for combined query
import { getDefaultUserSettings } from '../user_settings/utils';
