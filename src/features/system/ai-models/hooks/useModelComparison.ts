// src/features/ai-models/hooks/useModelComparison.ts
import { useState, useCallback, useMemo } from 'react';
import { compareModels } from '@/features/system/ai-core/utils';
import type { ModelInfo } from '@/features/system/ai-core/types';

export function useModelComparison() {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  
  const toggleModel = useCallback((modelId: string) => {
    setSelectedModelIds(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId].slice(-5) // Max 5 models
    );
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedModelIds([]);
  }, []);
  
  const comparisonData = useMemo(() => {
    return {
      selectedModelIds,
      count: selectedModelIds.length,
      canCompare: selectedModelIds.length >= 2,
    };
  }, [selectedModelIds]);
  
  return {
    ...comparisonData,
    toggleModel,
    clearSelection,
  };
}

export function useModelComparisonResults(models: ModelInfo[]) {
  return useMemo(() => {
    if (models.length < 2) return null;
    
    const comparisons = [];
    for (let i = 0; i < models.length - 1; i++) {
      const comparison = compareModels(models[i], models[i + 1]);
      comparisons.push({
        modelA: models[i],
        modelB: models[i + 1],
        ...comparison,
      });
    }
    
    return comparisons;
  }, [models]);
}

