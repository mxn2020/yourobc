// convex/lib/system/user_settings/user_model_preferences/mutations.ts
// Write operations for user model preferences module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { userModelPreferencesValidators } from '@/schema/system/user/user_model_preferences/validators';
import {
  getDefaultModelPreferences,
  validateModelPreferences,
  trimModelPreferencesData,
  generateModelPreferencesDisplayName,
} from './utils';
import { USER_MODEL_PREFERENCES_CONSTANTS } from './constants';
import type { UpdateModelPreferencesData } from './types';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Update user model preferences
 * Authentication: Required
 * Authorization: Users can only update their own preferences
 * Validation: Applied with trimming and validation rules
 * Audit Log: Created for all updates
 */
export const updateUserModelPreferences = mutation({
  args: {
    defaultLanguageModel: v.optional(v.string()),
    defaultEmbeddingModel: v.optional(v.string()),
    defaultImageModel: v.optional(v.string()),
    defaultMultimodalModel: v.optional(v.string()),
    favoriteModels: v.optional(v.array(v.string())),
    hiddenProviders: v.optional(v.array(v.string())),
    preferredView: v.optional(userModelPreferencesValidators.preferredView),
    sortPreference: v.optional(userModelPreferencesValidators.sortPreference),
    testingDefaults: v.optional(userModelPreferencesValidators.testingDefaults),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedArgs = trimModelPreferencesData(args);

    // 3. Validate the updates
    const errors = validateModelPreferences(trimmedArgs);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. Get existing preferences
    const existing = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .unique();

    const now = Date.now();

    // 5. Prepare update data, excluding undefined values
    const updateData: Partial<UpdateModelPreferencesData> & {
      updatedAt: number;
      updatedBy: typeof user._id;
      version?: number;
    } = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (trimmedArgs.defaultLanguageModel !== undefined) updateData.defaultLanguageModel = trimmedArgs.defaultLanguageModel;
    if (trimmedArgs.defaultEmbeddingModel !== undefined) updateData.defaultEmbeddingModel = trimmedArgs.defaultEmbeddingModel;
    if (trimmedArgs.defaultImageModel !== undefined) updateData.defaultImageModel = trimmedArgs.defaultImageModel;
    if (trimmedArgs.defaultMultimodalModel !== undefined) updateData.defaultMultimodalModel = trimmedArgs.defaultMultimodalModel;
    if (trimmedArgs.favoriteModels !== undefined) updateData.favoriteModels = trimmedArgs.favoriteModels;
    if (trimmedArgs.hiddenProviders !== undefined) updateData.hiddenProviders = trimmedArgs.hiddenProviders;
    if (trimmedArgs.preferredView !== undefined) updateData.preferredView = trimmedArgs.preferredView;
    if (trimmedArgs.sortPreference !== undefined) updateData.sortPreference = trimmedArgs.sortPreference;
    if (trimmedArgs.testingDefaults !== undefined) updateData.testingDefaults = trimmedArgs.testingDefaults;

    let preferencesId;

    if (existing) {
      // 6. Update existing preferences
      updateData.version = existing.version + 1;
      preferencesId = existing._id;
      await ctx.db.patch(preferencesId, updateData);
    } else {
      // 6. Create new preferences with publicId and displayName
      const defaults = getDefaultModelPreferences();
      const publicId = crypto.randomUUID();
      const displayName = generateModelPreferencesDisplayName(user.name || user.email || 'User');

      preferencesId = await ctx.db.insert('userModelPreferences', {
        publicId,
        userId: user._id,
        ownerId: user._id,
        displayName,
        ...defaults,
        ...updateData,
        version: 1,
        createdAt: now,
        createdBy: user._id,
      });
    }

    // 7. Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'user.model_preferences_updated',
      entityType: USER_MODEL_PREFERENCES_CONSTANTS.ENTITY_TYPE,
      entityId: preferencesId,
      description: 'Updated user model preferences',
      metadata: {
        operation: existing ? 'update' : 'create',
        ...(existing && {
          oldValues: {
            preferredView: existing.preferredView,
            defaultLanguageModel: existing.defaultLanguageModel ?? null,
            defaultEmbeddingModel: existing.defaultEmbeddingModel ?? null,
          },
          newValues: {
            preferredView: updateData.preferredView ?? existing.preferredView,
            defaultLanguageModel: (updateData.defaultLanguageModel ?? existing.defaultLanguageModel) ?? null,
            defaultEmbeddingModel: (updateData.defaultEmbeddingModel ?? existing.defaultEmbeddingModel) ?? null,
          },
        }),
        data: {
          changedFields: Object.keys(trimmedArgs),
        },
      },
      createdAt: now,
    });

    // 8. Return preferences ID
    return preferencesId;
  },
});

/**
 * Set default model for a specific type
 * Authentication: Required
 * Authorization: Users can only update their own preferences
 * Audit Log: Created for update
 */
export const setDefaultModel = mutation({
  args: {
    modelId: v.string(),
    modelType: v.string(),
  },
  handler: async (ctx, { modelId, modelType }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedModelId = modelId.trim();
    const trimmedModelType = modelType.trim();

    // 3. Get existing preferences
    const existing = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .unique();

    const now = Date.now();
    const updateData: Partial<UpdateModelPreferencesData> & {
      updatedAt: number;
      updatedBy: typeof user._id;
      version?: number;
    } = { updatedAt: now, updatedBy: user._id };

    // 4. Set default model based on type
    switch (trimmedModelType) {
      case USER_MODEL_PREFERENCES_CONSTANTS.MODEL_TYPES.LANGUAGE:
        updateData.defaultLanguageModel = trimmedModelId;
        break;
      case USER_MODEL_PREFERENCES_CONSTANTS.MODEL_TYPES.EMBEDDING:
        updateData.defaultEmbeddingModel = trimmedModelId;
        break;
      case USER_MODEL_PREFERENCES_CONSTANTS.MODEL_TYPES.IMAGE:
        updateData.defaultImageModel = trimmedModelId;
        break;
      case USER_MODEL_PREFERENCES_CONSTANTS.MODEL_TYPES.MULTIMODAL:
        updateData.defaultMultimodalModel = trimmedModelId;
        break;
      default:
        throw new Error(`Invalid model type: ${trimmedModelType}`);
    }

    let preferencesId;

    if (existing) {
      // 5. Update existing preferences
      updateData.version = existing.version + 1;
      preferencesId = existing._id;
      await ctx.db.patch(preferencesId, updateData);
    } else {
      // 5. Create new preferences
      const defaults = getDefaultModelPreferences();
      const publicId = crypto.randomUUID();
      const displayName = generateModelPreferencesDisplayName(user.name || user.email || 'User');

      preferencesId = await ctx.db.insert('userModelPreferences', {
        publicId,
        userId: user._id,
        ownerId: user._id,
        displayName,
        ...defaults,
        ...updateData,
        version: 1,
        createdAt: now,
        createdBy: user._id,
      });
    }

    // 6. Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'user.default_model_set',
      entityType: USER_MODEL_PREFERENCES_CONSTANTS.ENTITY_TYPE,
      entityId: preferencesId,
      description: `Set default ${trimmedModelType} model to ${trimmedModelId}`,
      metadata: {
        data: {
          modelId: trimmedModelId,
          modelType: trimmedModelType,
          operation: existing ? 'update' : 'create',
        },
      },
      createdAt: now,
    });

    // 7. Return preferences ID
    return preferencesId;
  },
});

/**
 * Toggle a model as favorite
 * Authentication: Required
 * Authorization: Users can only update their own preferences
 * Validation: Applied to ensure limits are respected
 * Audit Log: Created for toggle operation
 */
export const toggleFavoriteModel = mutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, { modelId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedModelId = modelId.trim();

    // 3. Get existing preferences
    const existing = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .unique();

    // 4. Toggle favorite
    const currentFavorites = existing?.favoriteModels || [];
    const isFavorite = currentFavorites.includes(trimmedModelId);
    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== trimmedModelId)
      : [...currentFavorites, trimmedModelId];

    // 5. Validate the new favorites list
    const errors = validateModelPreferences({ favoriteModels: newFavorites });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    let preferencesId;

    if (existing) {
      // 6. Update existing preferences
      preferencesId = existing._id;
      await ctx.db.patch(preferencesId, {
        favoriteModels: newFavorites,
        version: existing.version + 1,
        updatedAt: now,
        updatedBy: user._id,
      });
    } else {
      // 6. Create new preferences
      const defaults = getDefaultModelPreferences();
      const publicId = crypto.randomUUID();
      const displayName = generateModelPreferencesDisplayName(user.name || user.email || 'User');

      preferencesId = await ctx.db.insert('userModelPreferences', {
        publicId,
        userId: user._id,
        ownerId: user._id,
        displayName,
        ...defaults,
        favoriteModels: newFavorites,
        version: 1,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    // 7. Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: isFavorite ? 'user.model_unfavorited' : 'user.model_favorited',
      entityType: USER_MODEL_PREFERENCES_CONSTANTS.ENTITY_TYPE,
      entityId: preferencesId,
      description: `${isFavorite ? 'Removed' : 'Added'} ${trimmedModelId} ${isFavorite ? 'from' : 'to'} favorites`,
      metadata: {
        operation: existing ? 'update' : 'create',
        data: {
          modelId: trimmedModelId,
          action: isFavorite ? 'remove' : 'add',
          ...(existing && {
            oldValues: {
              favoriteModels: existing.favoriteModels,
            },
            newValues: {
              favoriteModels: newFavorites,
            },
          }),
        },
      },
      createdAt: now,
    });

    // 8. Return preferences ID
    return preferencesId;
  },
});

/**
 * Clear default model for a specific type
 * Authentication: Required
 * Authorization: Users can only update their own preferences
 * Audit Log: Created for clear operation
 */
export const clearDefaultModel = mutation({
  args: {
    modelType: v.union(
      v.literal('language'),
      v.literal('embedding'),
      v.literal('image'),
      v.literal('multimodal')
    ),
  },
  handler: async (ctx, { modelType }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get existing preferences
    const existing = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .unique();

    if (!existing) return null;

    const now = Date.now();
    const updateData: Partial<UpdateModelPreferencesData> & {
      updatedAt: number;
      updatedBy: typeof user._id;
      version: number;
    } = {
      updatedAt: now,
      updatedBy: user._id,
      version: existing.version + 1,
    };

    // 3. Clear the appropriate default model field
    switch (modelType) {
      case 'language':
        updateData.defaultLanguageModel = undefined;
        break;
      case 'embedding':
        updateData.defaultEmbeddingModel = undefined;
        break;
      case 'image':
        updateData.defaultImageModel = undefined;
        break;
      case 'multimodal':
        updateData.defaultMultimodalModel = undefined;
        break;
    }

    // 4. Update preferences
    await ctx.db.patch(existing._id, updateData);

    // 5. Create audit log
    const getModelFieldValue = (type: string) => {
      switch (type) {
        case 'language': return existing.defaultLanguageModel;
        case 'embedding': return existing.defaultEmbeddingModel;
        case 'image': return existing.defaultImageModel;
        case 'multimodal': return existing.defaultMultimodalModel;
        default: return undefined;
      }
    };

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'user.default_model_cleared',
      entityType: USER_MODEL_PREFERENCES_CONSTANTS.ENTITY_TYPE,
      entityId: existing._id,
      description: `Cleared default ${modelType} model`,
      metadata: {
        operation: 'clear',
        data: {
          modelType,
          oldValue: getModelFieldValue(modelType) || null,
          newValue: null,
        },
      },
      createdAt: now,
    });

    return existing._id;
  },
});

/**
 * Reset user model preferences to defaults
 * Authentication: Required
 * Authorization: Users can only reset their own preferences
 * Audit Log: Created for reset operation
 */
export const resetUserModelPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get existing preferences
    const existing = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .unique();

    const defaults = getDefaultModelPreferences();
    const now = Date.now();

    if (existing) {
      // 3. Update to defaults
      await ctx.db.patch(existing._id, {
        ...defaults,
        publicId: existing.publicId,
        userId: existing.userId,
        displayName: existing.displayName,
        version: existing.version + 1,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 4. Create audit log
      await ctx.db.insert('auditLogs', {
        publicId: await generateUniquePublicId(ctx, 'auditLogs'),
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user.model_preferences_reset',
        entityType: USER_MODEL_PREFERENCES_CONSTANTS.ENTITY_TYPE,
        entityId: existing._id,
        description: 'Reset user model preferences to defaults',
        metadata: {
          operation: 'reset',
          oldValues: {
            preferredView: existing.preferredView,
            defaultLanguageModel: existing.defaultLanguageModel ?? null,
            defaultEmbeddingModel: existing.defaultEmbeddingModel ?? null,
          },
          newValues: {
            preferredView: defaults.preferredView,
            defaultLanguageModel: defaults.defaultLanguageModel ?? null,
            defaultEmbeddingModel: defaults.defaultEmbeddingModel ?? null,
          },
        },
        createdAt: now,
      });

      return existing._id;
    } else {
      // 3. Create new preferences with defaults
      const publicId = crypto.randomUUID();
      const displayName = generateModelPreferencesDisplayName(user.name || user.email || 'User');

      const preferencesId = await ctx.db.insert('userModelPreferences', {
        publicId,
        userId: user._id,
        ownerId: user._id,
        displayName,
        ...defaults,
        version: 1,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 4. Create audit log
      await ctx.db.insert('auditLogs', {
        publicId: await generateUniquePublicId(ctx, 'auditLogs'),
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user.model_preferences_reset',
        entityType: USER_MODEL_PREFERENCES_CONSTANTS.ENTITY_TYPE,
        entityId: preferencesId,
        description: 'Created default user model preferences',
        metadata: {
          operation: 'create',
        },
        createdAt: now,
      });

      return preferencesId;
    }
  },
});

/**
 * Soft delete user model preferences
 * Authentication: Required
 * Authorization: Users can only delete their own preferences
 * Audit Log: Created for deletion
 */
export const deleteUserModelPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get existing preferences
    const existing = await ctx.db
      .query('userModelPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .unique();

    if (!existing) {
      throw new Error('User model preferences not found');
    }

    const now = Date.now();
    const preferencesId = existing._id;

    // 3. Soft delete (set deletedAt and deletedBy)
    await ctx.db.patch(preferencesId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'user.model_preferences_deleted',
      entityType: USER_MODEL_PREFERENCES_CONSTANTS.ENTITY_TYPE,
      entityId: preferencesId,
      description: 'Deleted user model preferences',
      metadata: {
        operation: 'soft_delete',
        data: {
          deletedPreferences: {
            preferredView: existing.preferredView,
            defaultLanguageModel: existing.defaultLanguageModel,
            defaultEmbeddingModel: existing.defaultEmbeddingModel,
            favoriteModelsCount: existing.favoriteModels.length,
          },
        },
      },
      createdAt: now,
    });

    return preferencesId;
  },
});
