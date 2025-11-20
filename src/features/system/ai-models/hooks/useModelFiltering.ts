// src/features/ai-models/hooks/useModelFiltering.ts
import { useMemo } from 'react';
import { filterModels, sortModels } from '@/features/system/ai-core/utils';
import type { ModelInfo, ModelFilter, ModelSort } from '@/features/system/ai-core/types';

export function useModelFiltering(
  models: ModelInfo[],
  filters: ModelFilter,
  sort?: ModelSort
) {
  return useMemo(() => {
    let filtered = filterModels(models, filters);
    
    if (sort) {
      filtered = sortModels(filtered, sort);
    }
    
    return filtered;
  }, [models, filters, sort]);
}

export function useActiveFilterCount(filters: ModelFilter) {
  return useMemo(() => {
    let count = 0;
    
    if (filters.search) count++;
    if (filters.type?.length) count++;
    if (filters.provider?.length) count++;
    if (filters.availability?.length) count++;
    if (filters.contextWindowMin || filters.contextWindowMax) count++;
    if (filters.priceRange?.min || filters.priceRange?.max) count++;
    if (filters.capabilities?.length) count++;
    if (filters.tags?.length) count++;
    
    return count;
  }, [filters]);
}

