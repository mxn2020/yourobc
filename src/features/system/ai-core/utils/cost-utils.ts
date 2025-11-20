// src/utils/ai/cost-utils.ts
import { useMemo } from 'react';
import type { ModelInfo, ModelPricing } from '@/features/system/ai-core/types';
import type { TokenUsage } from '@/features/system/ai-core/types';
import { 
  COST_TIERS, 
  DEFAULT_COST_CONFIG,
  COST_FORMATTING_OPTIONS,
  PROVIDER_COST_MULTIPLIERS
} from '@/features/system/ai-core/constants';

/**
 * Calculate cost for a request based on token usage and model pricing
 */
export function calculateRequestCost(
  model: ModelInfo,
  usage: TokenUsage
): number {
  const { pricing } = model;
  const multiplier = PROVIDER_COST_MULTIPLIERS[model.provider] || 1.0;
  
  const inputCost = (usage.inputTokens - (usage.cachedInputTokens || 0)) * pricing.input;
  const outputCost = usage.outputTokens * pricing.output;
  const cachedInputCost = (usage.cachedInputTokens || 0) * (pricing.cachedInput || 0);
  
  const totalCost = (inputCost + outputCost + cachedInputCost) * multiplier;
  
  return Number(totalCost.toFixed(DEFAULT_COST_CONFIG.precision));
}

/**
 * Estimate cost for a request based on estimated token counts
 */
export function estimateRequestCost(
  model: ModelInfo,
  estimatedInputTokens: number,
  estimatedOutputTokens: number,
  cachedTokens = 0
): number {
  const usage: TokenUsage = {
    inputTokens: estimatedInputTokens,
    outputTokens: estimatedOutputTokens,
    totalTokens: estimatedInputTokens + estimatedOutputTokens,
    cachedInputTokens: cachedTokens
  };
  
  return calculateRequestCost(model, usage);
}

/**
 * Get cost tier for a given cost amount
 */
export function getCostTier(cost: number): typeof COST_TIERS[keyof typeof COST_TIERS] {
  if (cost === 0) return COST_TIERS.FREE;
  if (cost <= COST_TIERS.VERY_LOW.max) return COST_TIERS.VERY_LOW;
  if (cost <= COST_TIERS.LOW.max) return COST_TIERS.LOW;
  if (cost <= COST_TIERS.MEDIUM.max) return COST_TIERS.MEDIUM;
  if (cost <= COST_TIERS.HIGH.max) return COST_TIERS.HIGH;
  return COST_TIERS.VERY_HIGH;
}

/**
 * Format cost for display with intelligent scaling
 */
export function formatCost(
  cost: number, 
  options: {
    currency?: string;
    showCurrency?: boolean;
    precision?: number;
    useThousandSuffix?: boolean;
  } = {}
): string {
  const {
    currency = DEFAULT_COST_CONFIG.currency,
    showCurrency = true,
    precision = DEFAULT_COST_CONFIG.precision,
    useThousandSuffix = true
  } = options;

  if (cost === 0) {
    return showCurrency ? '$0.00' : '0.00';
  }

  // Determine formatting based on cost magnitude
  let formatOption: typeof COST_FORMATTING_OPTIONS[keyof typeof COST_FORMATTING_OPTIONS] = COST_FORMATTING_OPTIONS.STANDARD;
  
  if (cost < COST_FORMATTING_OPTIONS.MICRO.threshold) {
    formatOption = COST_FORMATTING_OPTIONS.MICRO;
  } else if (cost < COST_FORMATTING_OPTIONS.MILLI.threshold) {
    formatOption = COST_FORMATTING_OPTIONS.MILLI;
  } else if (useThousandSuffix && cost < DEFAULT_COST_CONFIG.costPerThousandCallsThreshold) {
    // Show cost per 1000 calls for very small amounts
    const costPer1000 = cost * 1000;
    return showCurrency 
      ? `$${costPer1000.toFixed(4)}/1K calls`
      : `${costPer1000.toFixed(4)}/1K calls`;
  }

  const formattedAmount = cost.toFixed(precision);
  const currencySymbol = showCurrency ? '$' : '';
  
  return `${currencySymbol}${formattedAmount}${formatOption.suffix}`;
}

/**
 * Format pricing information for display
 */
export function formatPricing(pricing: ModelPricing): string {
  const inputPrice = (pricing.input * 1000000).toFixed(2);
  const outputPrice = (pricing.output * 1000000).toFixed(2);
  
  if (pricing.input === 0) return 'Free';
  
  if (pricing.output && pricing.output !== pricing.input) {
    return `$${inputPrice}/$${outputPrice} per 1M (input/output)`;
  }
  
  return `$${inputPrice}/1M tokens`;
}

/**
 * Calculate cost savings from caching
 */
export function calculateCachingSavings(
  model: ModelInfo,
  usage: TokenUsage
): {
  savedTokens: number;
  savedCost: number;
  savingsPercentage: number;
} {
  const cachedTokens = usage.cachedInputTokens || 0;
  
  if (cachedTokens === 0) {
    return { savedTokens: 0, savedCost: 0, savingsPercentage: 0 };
  }
  
  const savedCost = cachedTokens * (model.pricing.input - (model.pricing.cachedInput || 0));
  const totalInputCost = usage.inputTokens * model.pricing.input;
  const savingsPercentage = totalInputCost > 0 ? (savedCost / totalInputCost) * 100 : 0;
  
  return {
    savedTokens: cachedTokens,
    savedCost: Number(savedCost.toFixed(DEFAULT_COST_CONFIG.precision)),
    savingsPercentage: Number(savingsPercentage.toFixed(2))
  };
}

/**
 * Project costs based on usage patterns
 */
export function projectCosts(
  dailyCost: number,
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
): number {
  const multipliers = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    yearly: 365
  };
  
  return Number((dailyCost * multipliers[period]).toFixed(2));
}

/**
 * Calculate cost per token for a model
 */
export function calculateCostPerToken(model: ModelInfo): {
  inputCostPerToken: number;
  outputCostPerToken: number;
  averageCostPerToken: number;
} {
  return useMemo(() => {
    const inputCostPerToken = model.pricing.input;
    const outputCostPerToken = model.pricing.output;
    const averageCostPerToken = (inputCostPerToken + outputCostPerToken) / 2;
    
    return {
      inputCostPerToken,
      outputCostPerToken,
      averageCostPerToken
    };
  }, [model.pricing]);
}

/**
 * Compare costs between models
 */
export function compareCosts(
  modelA: ModelInfo,
  modelB: ModelInfo,
  estimatedInputTokens = 1000,
  estimatedOutputTokens = 500
): {
  modelA: {
    cost: number;
    costPerToken: number;
  };
  modelB: {
    cost: number;
    costPerToken: number;
  };
  difference: number;
  percentageDifference: number;
  cheaper: 'A' | 'B' | 'equal';
} {
  return useMemo(() => {
    const costA = estimateRequestCost(modelA, estimatedInputTokens, estimatedOutputTokens);
    const costB = estimateRequestCost(modelB, estimatedInputTokens, estimatedOutputTokens);
    
    const totalTokens = estimatedInputTokens + estimatedOutputTokens;
    const costPerTokenA = costA / totalTokens;
    const costPerTokenB = costB / totalTokens;
    
    const difference = Math.abs(costA - costB);
    const percentageDifference = costA > 0 ? (difference / Math.min(costA, costB)) * 100 : 0;
    
    let cheaper: 'A' | 'B' | 'equal' = 'equal';
    if (costA < costB) cheaper = 'A';
    else if (costB < costA) cheaper = 'B';
    
    return {
      modelA: { cost: costA, costPerToken: costPerTokenA },
      modelB: { cost: costB, costPerToken: costPerTokenB },
      difference,
      percentageDifference: Number(percentageDifference.toFixed(2)),
      cheaper
    };
  }, [modelA, modelB, estimatedInputTokens, estimatedOutputTokens]);
}

/**
 * Calculate budget utilization
 */
export function calculateBudgetUtilization(
  spent: number,
  budget: number
): {
  percentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
} {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = Math.max(0, budget - spent);
  
  let status: 'safe' | 'warning' | 'critical' | 'exceeded' = 'safe';
  
  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= DEFAULT_COST_CONFIG.alertThresholds.critical) {
    status = 'critical';
  } else if (percentage >= DEFAULT_COST_CONFIG.alertThresholds.warning) {
    status = 'warning';
  }
  
  return {
    percentage: Number(percentage.toFixed(2)),
    remaining: Number(remaining.toFixed(2)),
    status
  };
}

/**
 * Find most cost-effective models for a given use case
 */
export function findCostEffectiveModels(
  models: ModelInfo[],
  estimatedTokens: { input: number; output: number },
  options: {
    maxResults?: number;
    minQuality?: number; // Minimum benchmark score
    requiredCapabilities?: Array<keyof ModelInfo['capabilities']>;
  } = {}
): Array<{
  model: ModelInfo;
  estimatedCost: number;
  costPerToken: number;
  qualityScore?: number;
}> {
  const { maxResults = 5, minQuality = 0, requiredCapabilities = [] } = options;
  
  return useMemo(() => {
    let filtered = models.filter(model => {
      // Filter by minimum quality if specified
      if (minQuality > 0 && (!model.benchmarks?.mmlu || model.benchmarks.mmlu < minQuality)) {
        return false;
      }
      
      // Filter by required capabilities
      if (requiredCapabilities.length > 0) {
        if (!requiredCapabilities.every(cap => model.capabilities[cap])) {
          return false;
        }
      }
      
      return true;
    });
    
    // Calculate costs and sort by cost-effectiveness
    const withCosts = filtered.map(model => {
      const estimatedCost = estimateRequestCost(
        model, 
        estimatedTokens.input, 
        estimatedTokens.output
      );
      const totalTokens = estimatedTokens.input + estimatedTokens.output;
      const costPerToken = estimatedCost / totalTokens;
      
      return {
        model,
        estimatedCost,
        costPerToken,
        qualityScore: model.benchmarks?.mmlu
      };
    });
    
    // Sort by cost (lower is better)
    withCosts.sort((a, b) => a.estimatedCost - b.estimatedCost);
    
    return withCosts.slice(0, maxResults);
  }, [models, estimatedTokens, maxResults, minQuality, requiredCapabilities]);
}

/**
 * Analyze spending patterns
 */
export function analyzeSpendingPatterns(
  costs: Array<{ date: Date; amount: number; modelId?: string }>
): {
  totalSpent: number;
  avgDailySpend: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  peakDay: { date: Date; amount: number } | null;
  topModels: Array<{ modelId: string; totalCost: number; percentage: number }>;
} {
  return useMemo(() => {
    if (costs.length === 0) {
      return {
        totalSpent: 0,
        avgDailySpend: 0,
        trend: 'stable' as const,
        peakDay: null,
        topModels: []
      };
    }
    
    const totalSpent = costs.reduce((sum, cost) => sum + cost.amount, 0);
    const avgDailySpend = totalSpent / costs.length;
    
    // Calculate trend (simple linear regression)
    const n = costs.length;
    if (n < 2) {
      return {
        totalSpent,
        avgDailySpend,
        trend: 'stable' as const,
        peakDay: null,
        topModels: []
      };
    }
    
    const sortedCosts = [...costs].sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstHalf = sortedCosts.slice(0, Math.floor(n / 2));
    const secondHalf = sortedCosts.slice(Math.floor(n / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, cost) => sum + cost.amount, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, cost) => sum + cost.amount, 0) / secondHalf.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const trendThreshold = 0.1; // 10% change
    const percentageChange = Math.abs(secondHalfAvg - firstHalfAvg) / firstHalfAvg;
    
    if (percentageChange > trendThreshold) {
      trend = secondHalfAvg > firstHalfAvg ? 'increasing' : 'decreasing';
    }
    
    // Find peak day
    const peakDay = costs.reduce((peak, current) => 
      current.amount > peak.amount ? current : peak
    );
    
    // Calculate top models by spending
    const modelSpending = new Map<string, number>();
    costs.forEach(cost => {
      if (cost.modelId) {
        modelSpending.set(cost.modelId, (modelSpending.get(cost.modelId) || 0) + cost.amount);
      }
    });
    
    const topModels = Array.from(modelSpending.entries())
      .map(([modelId, totalCost]) => ({
        modelId,
        totalCost,
        percentage: (totalCost / totalSpent) * 100
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);
    
    return {
      totalSpent: Number(totalSpent.toFixed(2)),
      avgDailySpend: Number(avgDailySpend.toFixed(2)),
      trend,
      peakDay,
      topModels
    };
  }, [costs]);
}