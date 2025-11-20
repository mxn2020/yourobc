// src/features/ai-testing/hooks/useTestComparison.ts
import { useMemo, useCallback } from 'react';
import type { TestResult } from '@/features/system/ai-core/types';
import type { TestComparisonResult, ParameterTuningResult } from '../types/test-results.types';
import { groupBy, sortBy } from '@/utils/common/array-utils';
import { getProviderFromModelId } from '@/features/system/ai-core/utils';

export function useTestComparison() {
  const compareModelResults = useCallback((results: TestResult[]): TestComparisonResult[] => {
    const groupedByModel = groupBy(results, result => result.modelId);
    
    return Object.entries(groupedByModel).map(([modelId, modelResults]) => {
      const provider = getProviderFromModelId(modelId);
      const completed = modelResults.filter(r => r.status === 'completed');
      
      const avgLatency = completed.length > 0 
        ? completed.reduce((sum, r) => sum + r.latencyMs, 0) / completed.length
        : 0;
      
      const avgCost = completed.length > 0
        ? completed.reduce((sum, r) => sum + r.cost, 0) / completed.length
        : 0;
      
      const successRate = modelResults.length > 0
        ? (completed.length / modelResults.length) * 100
        : 0;
      
      const validationScore = completed.length > 0
        ? completed.reduce((sum, r) => sum + (r.validationResults?.score || 0), 0) / completed.length
        : 0;
      
      const score = (successRate * 0.4) + (validationScore * 0.3) + ((1 / (avgLatency || 1)) * 100 * 0.2) + ((1 / (avgCost || 0.001)) * 0.1);
      
      return {
        modelId,
        provider,
        results: modelResults,
        metrics: {
          avgLatency,
          avgCost,
          avgTokens: completed.length > 0 
            ? completed.reduce((sum, r) => sum + r.usage.totalTokens, 0) / completed.length 
            : 0,
          successRate,
          avgTokensPerSecond: completed.filter(r => r.tokensPerSecond).length > 0
            ? completed.reduce((sum, r) => sum + (r.tokensPerSecond || 0), 0) / completed.filter(r => r.tokensPerSecond).length
            : undefined,
          avgFirstTokenLatency: completed.filter(r => r.firstTokenLatencyMs).length > 0
            ? completed.reduce((sum, r) => sum + (r.firstTokenLatencyMs || 0), 0) / completed.filter(r => r.firstTokenLatencyMs).length
            : undefined
        },
        rank: 0,
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index + 1 }));
  }, []);

  const analyzeParameterTuning = useCallback((
    results: TestResult[],
    parameterName: keyof TestResult['parameters']
  ): ParameterTuningResult[] => {
    const groupedByValue = groupBy(results, result => {
      const value = result.parameters[parameterName];
      return String(value);
    });

    return Object.entries(groupedByValue).map(([valueStr, valueResults]) => {
      const completed = valueResults.filter(r => r.status === 'completed');
      
      const avgLatency = completed.length > 0
        ? completed.reduce((sum, r) => sum + r.latencyMs, 0) / completed.length
        : 0;
      
      const avgCost = completed.length > 0
        ? completed.reduce((sum, r) => sum + r.cost, 0) / completed.length
        : 0;
      
      const successRate = valueResults.length > 0
        ? (completed.length / valueResults.length) * 100
        : 0;
      
      const validationScore = completed.length > 0
        ? completed.reduce((sum, r) => sum + (r.validationResults?.score || 0), 0) / completed.length
        : 0;
      
      const score = (successRate * 0.4) + (validationScore * 0.4) + ((1 / (avgLatency || 1)) * 100 * 0.1) + ((1 / (avgCost || 0.001)) * 0.1);
      
      let parameterValue: unknown = valueStr;
      if (!isNaN(Number(valueStr))) parameterValue = Number(valueStr);
      else if (valueStr === 'true' || valueStr === 'false') parameterValue = valueStr === 'true';
      
      return {
        parameterName: String(parameterName),
        parameterValue,
        results: valueResults,
        avgLatency,
        avgCost,
        successRate,
        score
      };
    })
    .sort((a, b) => b.score - a.score);
  }, []);

  const getBestPerformingModel = useCallback((comparisons: TestComparisonResult[]): TestComparisonResult | null => {
    return comparisons.length > 0 ? comparisons[0] : null;
  }, []);

  const getModelRankings = useCallback((comparisons: TestComparisonResult[]) => {
    return sortBy(comparisons, [{ field: 'score', direction: 'desc' }]);
  }, []);

  const calculateCostEfficiency = useCallback((comparisons: TestComparisonResult[]) => {
    return comparisons.map(comparison => ({
      ...comparison,
      costEfficiency: comparison.metrics.avgCost > 0 
        ? (comparison.metrics.successRate / 100) / comparison.metrics.avgCost
        : 0
    })).sort((a, b) => b.costEfficiency - a.costEfficiency);
  }, []);

  const calculateSpeedRankings = useCallback((comparisons: TestComparisonResult[]) => {
    return sortBy(comparisons, [{ field: (c) => c.metrics.avgLatency, direction: 'asc' }]);
  }, []);

  const findOptimalParameters = useCallback((tuningResults: ParameterTuningResult[]) => {
    const parameterGroups = groupBy(tuningResults, r => r.parameterName);
    
    return Object.entries(parameterGroups).reduce((optimal, [paramName, results]) => {
      const best = sortBy(results, [{ field: 'score', direction: 'desc' }])[0];
      if (best) {
        optimal[paramName] = best.parameterValue;
      }
      return optimal;
    }, {} as Record<string, unknown>);
  }, []);

  return {
    compareModelResults,
    analyzeParameterTuning,
    getBestPerformingModel,
    getModelRankings,
    calculateCostEfficiency,
    calculateSpeedRankings,
    findOptimalParameters
  };
}