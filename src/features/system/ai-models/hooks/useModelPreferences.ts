// src/features/ai-models/hooks/useModelPreferences.ts
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { UserPreferences } from '../types/preferences.types';
import type { ModelSort } from '@/features/system/ai-core/types';
import { Id } from "@/convex/_generated/dataModel";

export function useModelPreferences() {
  const preferences = useQuery(
    api.lib.system.user_settings.queries.getUserModelPreferences,
    {}
  );
  
  // Convert from Convex format to UserPreferences format
  const userPreferences: UserPreferences | null = preferences ? {
    defaultModels: {
      language: preferences.defaultLanguageModel || null,
      embedding: preferences.defaultEmbeddingModel || null,
      image: preferences.defaultImageModel || null,
      multimodal: preferences.defaultMultimodalModel || null,
    },
    favoriteModels: preferences.favoriteModels || [],
    hiddenProviders: preferences.hiddenProviders || [],
    preferredView: preferences.preferredView || 'grid',
    sortPreference: preferences.sortPreference ? {
      field: preferences.sortPreference.field as ModelSort['field'],
      direction: preferences.sortPreference.direction as ModelSort['direction']
    } : { field: 'name' as const, direction: 'asc' as const },
  } : null;

    const getDefaultModel = (modelType?: 'language' | 'embedding' | 'image' | 'multimodal'): string | null => {
    if (!userPreferences) return null;

    if (!modelType) {
      return userPreferences.defaultModels.language;
    }

    switch (modelType) {
      case 'language':
        return userPreferences.defaultModels.language;
      case 'embedding':
        return userPreferences.defaultModels.embedding;
      case 'image':
        return userPreferences.defaultModels.image;
      case 'multimodal':
        return userPreferences.defaultModels.multimodal || userPreferences.defaultModels.language;
      default:
        return null;
    }
  };
  
  return {
    data: userPreferences,
    isLoading: preferences === undefined,
    error: null,
    getDefaultModel
  };
}

export function useUpdateModelPreferences() {
  return useMutation(api.lib.system.user_settings.mutations.updateUserModelPreferences);
}

export function useSetDefaultModel() {
  return useMutation(api.lib.system.user_settings.mutations.setDefaultModel);
}

export function useToggleFavoriteModel() {
  return useMutation(api.lib.system.user_settings.mutations.toggleFavoriteModel);
}

export function useClearDefaultModel() {
  return useMutation(api.lib.system.user_settings.mutations.clearDefaultModel);
}

