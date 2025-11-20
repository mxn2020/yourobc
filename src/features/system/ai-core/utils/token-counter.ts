// src/core/ai/utils/token-counter.ts
import type { TokenUsage } from '@/features/boilerplate/ai-core/types';
import { 
  estimateTokenCount, 
  estimatePromptTokens,
  calculateTokensPerSecond,
  calculateWordsPerMinute 
} from '@/features/boilerplate/ai-core/utils';

export interface TokenCountResult {
  estimatedTokens: number;
  confidence: 'low' | 'medium' | 'high';
  breakdown: {
    prompt: number;
    system: number;
    total: number;
  };
}

export interface TokenAnalysis {
  usage: TokenUsage;
  efficiency: {
    inputOutputRatio: number;
    cachedPercentage: number;
    rating: 'excellent' | 'good' | 'average' | 'poor';
  };
  performance: {
    tokensPerSecond?: number;
    wordsPerMinute?: number;
    firstTokenLatency?: number;
  };
  cost: {
    estimatedInputCost: number;
    estimatedOutputCost: number;
    cachingSavings: number;
  };
}

export class TokenCounter {
  private readonly modelTokenLimits = new Map<string, {
    contextWindow: number;
    maxOutput: number;
  }>();

  /**
   * Count tokens in text with confidence estimation
   */
  public countTokens(
    text: string,
    contentType: 'english' | 'code' | 'multilingual' | 'technical' | 'conversational' = 'english'
  ): TokenCountResult {
    const estimatedTokens = estimateTokenCount(text, contentType);
    
    // Confidence based on text characteristics
    let confidence: 'low' | 'medium' | 'high' = 'medium';
    
    if (text.length < 100) {
      confidence = 'high'; // Short text is easier to estimate
    } else if (text.length > 10000) {
      confidence = 'low'; // Very long text has more variability
    } else if (contentType === 'code' || contentType === 'technical') {
      confidence = 'medium'; // Technical content has different token density
    }

    return {
      estimatedTokens,
      confidence,
      breakdown: {
        prompt: estimatedTokens,
        system: 0,
        total: estimatedTokens
      }
    };
  }

  /**
   * Count tokens for AI request
   */
  public countRequestTokens(
    prompt: string,
    systemPrompt?: string,
    additionalContext?: string
  ): TokenCountResult {
    const promptEstimate = estimatePromptTokens(prompt, systemPrompt);
    const contextTokens = additionalContext ? estimateTokenCount(additionalContext) : 0;
    
    const totalTokens = promptEstimate.totalTokens + contextTokens;
    
    // Confidence decreases with complexity
    let confidence: 'low' | 'medium' | 'high' = 'high';
    
    if (systemPrompt && systemPrompt.length > 1000) confidence = 'medium';
    if (additionalContext && additionalContext.length > 5000) confidence = 'low';
    if (totalTokens > 50000) confidence = 'low';

    return {
      estimatedTokens: totalTokens,
      confidence,
      breakdown: {
        prompt: promptEstimate.promptTokens,
        system: promptEstimate.systemTokens,
        total: totalTokens
      }
    };
  }

  /**
   * Analyze token usage efficiency and performance
   */
  public analyzeTokenUsage(
    usage: TokenUsage,
    latencyMs: number,
    responseText?: string,
    modelPricing?: { input: number; output: number; cachedInput?: number }
  ): TokenAnalysis {
    // Calculate efficiency metrics
    const inputOutputRatio = usage.inputTokens > 0 
      ? usage.outputTokens / usage.inputTokens 
      : 0;
    
    const cachedPercentage = usage.inputTokens > 0
      ? ((usage.cachedInputTokens || 0) / usage.inputTokens) * 100
      : 0;
    
    // Determine efficiency rating
    let rating: 'excellent' | 'good' | 'average' | 'poor' = 'average';
    
    if (cachedPercentage > 50) {
      rating = 'excellent';
    } else if (cachedPercentage > 20 || inputOutputRatio > 0.5) {
      rating = 'good';
    } else if (inputOutputRatio < 0.1) {
      rating = 'poor';
    }

    // Calculate performance metrics
    const tokensPerSecond = calculateTokensPerSecond(usage.outputTokens, latencyMs);
    const wordsPerMinute = responseText 
      ? calculateWordsPerMinute(responseText, latencyMs)
      : undefined;

    // Calculate cost estimates
    let costEstimates = {
      estimatedInputCost: 0,
      estimatedOutputCost: 0,
      cachingSavings: 0
    };

    if (modelPricing) {
      const inputCost = (usage.inputTokens - (usage.cachedInputTokens || 0)) * modelPricing.input;
      const outputCost = usage.outputTokens * modelPricing.output;
      const cachedInputCost = (usage.cachedInputTokens || 0) * (modelPricing.cachedInput || 0);
      const cachingSavings = (usage.cachedInputTokens || 0) * 
        (modelPricing.input - (modelPricing.cachedInput || 0));

      costEstimates = {
        estimatedInputCost: inputCost + cachedInputCost,
        estimatedOutputCost: outputCost,
        cachingSavings
      };
    }

    return {
      usage,
      efficiency: {
        inputOutputRatio,
        cachedPercentage,
        rating
      },
      performance: {
        tokensPerSecond: tokensPerSecond > 0 ? tokensPerSecond : undefined,
        wordsPerMinute,
        firstTokenLatency: undefined // Would need to be tracked separately
      },
      cost: costEstimates
    };
  }

  /**
   * Validate token limits for a model
   */
  public validateTokenLimits(
    modelId: string,
    inputTokens: number,
    maxOutputTokens?: number
  ): {
    valid: boolean;
    warnings: string[];
    errors: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Get model limits (would normally come from model manager)
    const limits = this.modelTokenLimits.get(modelId) || {
      contextWindow: 4096, // Default fallback
      maxOutput: 2048
    };

    const requestedOutput = maxOutputTokens || 1000;
    const totalTokens = inputTokens + requestedOutput;

    // Check context window
    if (totalTokens > limits.contextWindow) {
      errors.push(
        `Total tokens (${totalTokens}) exceed context window (${limits.contextWindow})`
      );
      suggestions.push('Reduce input length or max output tokens');
    } else if (totalTokens > limits.contextWindow * 0.9) {
      warnings.push('Approaching context window limit - may cause truncation');
    }

    // Check output limits
    if (limits.maxOutput && requestedOutput > limits.maxOutput) {
      errors.push(
        `Requested output tokens (${requestedOutput}) exceed model limit (${limits.maxOutput})`
      );
    }

    // Check input efficiency
    if (inputTokens > limits.contextWindow * 0.8) {
      warnings.push('Large input may impact performance');
      suggestions.push('Consider using prompt caching for repeated content');
    }

    // Performance suggestions
    if (inputTokens > 10000) {
      suggestions.push('Consider breaking long inputs into smaller chunks');
    }

    if (requestedOutput > inputTokens * 2) {
      warnings.push('Requesting more output than input tokens - may be inefficient');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      suggestions
    };
  }

  /**
   * Compare token efficiency across requests
   */
  public compareTokenEfficiency(
    requests: Array<{
      id: string;
      usage: TokenUsage;
      latencyMs: number;
      cost: number;
    }>
  ): Array<{
    id: string;
    efficiency: {
      tokensPerSecond: number;
      costPerToken: number;
      inputOutputRatio: number;
    };
    ranking: number;
    percentile: number;
  }> {
    const analyzed = requests.map(req => {
      const tokensPerSecond = calculateTokensPerSecond(req.usage.totalTokens, req.latencyMs);
      const costPerToken = req.usage.totalTokens > 0 ? req.cost / req.usage.totalTokens : 0;
      const inputOutputRatio = req.usage.inputTokens > 0 
        ? req.usage.outputTokens / req.usage.inputTokens 
        : 0;

      return {
        id: req.id,
        efficiency: {
          tokensPerSecond,
          costPerToken,
          inputOutputRatio
        },
        // Composite efficiency score (higher is better)
        score: (tokensPerSecond * 0.4) + ((1 / (costPerToken + 0.001)) * 0.3) + (inputOutputRatio * 0.3)
      };
    });

    // Sort by efficiency score and add rankings
    analyzed.sort((a, b) => b.score - a.score);
    
    return analyzed.map((item, index) => ({
      id: item.id,
      efficiency: item.efficiency,
      ranking: index + 1,
      percentile: ((analyzed.length - index) / analyzed.length) * 100
    }));
  }

  /**
   * Generate token optimization suggestions
   */
  public generateOptimizationSuggestions(
    usage: TokenUsage,
    prompt: string,
    response: string,
    modelId: string
  ): Array<{
    type: 'prompt_optimization' | 'caching' | 'model_selection' | 'parameter_tuning';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    estimatedSavings?: number;
  }> {
    const suggestions: Array<{
      type: 'prompt_optimization' | 'caching' | 'model_selection' | 'parameter_tuning';
      priority: 'high' | 'medium' | 'low';
      suggestion: string;
      estimatedSavings?: number;
    }> = [];

    // Prompt optimization suggestions
    if (usage.inputTokens > 5000) {
      suggestions.push({
        type: 'prompt_optimization',
        priority: 'high',
        suggestion: 'Consider optimizing prompt length - current input uses many tokens',
        estimatedSavings: Math.floor(usage.inputTokens * 0.2)
      });
    }

    // Caching suggestions
    if (usage.cachedInputTokens === undefined || usage.cachedInputTokens === 0) {
      if (usage.inputTokens > 1000) {
        suggestions.push({
          type: 'caching',
          priority: 'medium',
          suggestion: 'Enable prompt caching to save on repeated content',
          estimatedSavings: Math.floor(usage.inputTokens * 0.3)
        });
      }
    }

    // Model selection suggestions
    const inputOutputRatio = usage.inputTokens > 0 ? usage.outputTokens / usage.inputTokens : 0;
    if (inputOutputRatio < 0.1 && usage.outputTokens < 100) {
      suggestions.push({
        type: 'model_selection',
        priority: 'medium',
        suggestion: 'Consider using a smaller, faster model for short responses'
      });
    }

    // Parameter tuning suggestions
    if (usage.outputTokens > usage.inputTokens * 3) {
      suggestions.push({
        type: 'parameter_tuning',
        priority: 'low',
        suggestion: 'Consider reducing max_tokens parameter to limit output length'
      });
    }

    return suggestions;
  }

  /**
   * Track model token limits for validation
   */
  public setModelLimits(
    modelId: string,
    limits: { contextWindow: number; maxOutput?: number }
  ): void {
    this.modelTokenLimits.set(modelId, {
      contextWindow: limits.contextWindow,
      maxOutput: limits.maxOutput || Math.floor(limits.contextWindow * 0.5)
    });
  }

  /**
   * Get detailed token breakdown for debugging
   */
  public getDetailedBreakdown(usage: TokenUsage): {
    breakdown: Array<{
      component: string;
      tokens: number;
      percentage: number;
      cost?: number;
    }>;
    summary: {
      total: number;
      cached: number;
      effective: number;
    };
  } {
    const components = [
      {
        component: 'Input Tokens',
        tokens: usage.inputTokens,
        percentage: (usage.inputTokens / usage.totalTokens) * 100
      },
      {
        component: 'Output Tokens',
        tokens: usage.outputTokens,
        percentage: (usage.outputTokens / usage.totalTokens) * 100
      }
    ];

    if (usage.cachedInputTokens && usage.cachedInputTokens > 0) {
      components.push({
        component: 'Cached Input Tokens',
        tokens: usage.cachedInputTokens,
        percentage: (usage.cachedInputTokens / usage.totalTokens) * 100
      });
    }

    if (usage.reasoningTokens && usage.reasoningTokens > 0) {
      components.push({
        component: 'Reasoning Tokens',
        tokens: usage.reasoningTokens,
        percentage: (usage.reasoningTokens / usage.totalTokens) * 100
      });
    }

    return {
      breakdown: components,
      summary: {
        total: usage.totalTokens,
        cached: usage.cachedInputTokens || 0,
        effective: usage.totalTokens - (usage.cachedInputTokens || 0)
      }
    };
  }
}