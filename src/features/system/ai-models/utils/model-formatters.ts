// src/features/ai-models/utils/model-formatters.ts
import { formatContextWindow } from '@/features/boilerplate/ai-core/utils';
import { getCostTier } from '@/features/boilerplate/ai-core/utils';
import { getProviderColor } from '@/features/boilerplate/ai-core/utils';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import { formatPrice } from '@/features/boilerplate/ai-core/utils';

export function formatModelDisplay(model: ModelInfo) {
  return {
    displayName: model.name,
    providerColor: getProviderColor(model.provider),
    contextWindowFormatted: formatContextWindow(model.contextWindow),
    priceFormatted: formatPrice(model.pricing.input),
    costTier: getCostTier(model.pricing.input),
    availabilityColor: model.availability === 'available' ? 'text-green-600' : 
                      model.availability === 'limited' ? 'text-yellow-600' : 'text-gray-600',
  };
}

export function formatModelCard(model: ModelInfo) {
  const formatted = formatModelDisplay(model);
  
  return {
    ...formatted,
    capabilitiesCount: Object.values(model.capabilities).filter(Boolean).length,
    benchmarkScore: model.benchmarks?.mmlu,
    useCasesDisplay: model.useCases.slice(0, 3),
    hasMoreUseCases: model.useCases.length > 3,
  };
}

