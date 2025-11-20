import { ModelSort } from '@/features/boilerplate/ai-core/types';

// src/features/ai-models/types/preferences.types.ts
export interface UserPreferences {
  defaultModels: {
    language: string | null;
    embedding: string | null;
    image: string | null;
    multimodal: string | null;
  };
  favoriteModels: string[];
  hiddenProviders: string[];
  preferredView: 'grid' | 'list';
  sortPreference: ModelSort;
}

