// src/features/ai-models/hooks/useModels.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { ModelService } from '../services/ModelService';
import type { ModelInfo, ModelFilter, ModelSort } from '@/features/system/ai-core/types';

export function useModels(filters?: ModelFilter, sort?: ModelSort) {
  return useQuery({
    queryKey: ['models', filters, sort],
    queryFn: () => ModelService.getModels({ filters, sort }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useModel(modelId: string) {
  return useQuery({
    queryKey: ['model', modelId],
    queryFn: () => ModelService.getModel(modelId),
    enabled: Boolean(modelId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRefreshModels() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['models'] });
  }, [queryClient]);
}

export function useAIProviders() {
  const { data: models, ...rest } = useModels();
  
  const providers = useMemo(() => {
    if (!models) return [];
    
    const providerSet = new Set<string>();
    models.forEach(model => {
      if (model.provider) {
        providerSet.add(model.provider);
      }
    });
    
    return Array.from(providerSet).sort();
  }, [models]);
  
  return { data: providers, ...rest };
}

export function useModelsByProvider(provider?: string) {
  const { data: allModels, ...rest } = useModels();
  
  const models = useMemo(() => {
    if (!allModels || !provider) return [];
    return allModels.filter(model => model.provider === provider);
  }, [allModels, provider]);
  
  return { data: models, ...rest };
}

