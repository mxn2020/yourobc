// src/features/ai-models/hooks/useCostCalculation.ts
import { useMemo } from 'react';
import { estimateRequestCost } from '@/features/boilerplate/ai-core/utils';
import { estimateTokenCount } from '@/features/boilerplate/ai-core/utils';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';

export function useCostCalculation(
  model: ModelInfo | null,
  inputText: string,
  outputTokens: number,
  requestsPerMonth: number = 1000
) {
  return useMemo(() => {
    if (!model) return null;
    
    const inputTokens = estimateTokenCount(inputText);
    const costPerRequest = estimateRequestCost(model, inputTokens, outputTokens);
    const monthlyCost = costPerRequest * requestsPerMonth;
    const dailyCost = monthlyCost / 30;
    const yearlyCost = monthlyCost * 12;
    
    return {
      inputTokens,
      outputTokens,
      costPerRequest,
      dailyCost,
      monthlyCost,
      yearlyCost,
    };
  }, [model, inputText, outputTokens, requestsPerMonth]);
}

