// src/utils/ai/token-utils.ts
import { useMemo } from 'react';
import type { TokenUsage } from '@/features/boilerplate/ai-core/types';
import { TOKEN_ESTIMATION_RATIOS } from '@/features/boilerplate/ai-core/constants';

/**
 * Estimate token count from text length
 */
export function estimateTokenCount(
  text: string,
  contentType: keyof typeof TOKEN_ESTIMATION_RATIOS = 'english'
): number {
  if (!text || typeof text !== 'string') return 0;
  
  const ratio = TOKEN_ESTIMATION_RATIOS[contentType] || TOKEN_ESTIMATION_RATIOS.english;
  const estimatedTokens = Math.ceil(text.length / ratio);
  
  return Math.max(1, estimatedTokens); // Minimum 1 token
}

/**
 * Estimate tokens for different types of prompts
 */
export function estimatePromptTokens(prompt: string, systemPrompt?: string): {
  promptTokens: number;
  systemTokens: number;
  totalTokens: number;
} {
  return useMemo(() => {
    const promptTokens = estimateTokenCount(prompt, 'conversational');
    const systemTokens = systemPrompt ? estimateTokenCount(systemPrompt, 'technical') : 0;
    const totalTokens = promptTokens + systemTokens;
    
    return { promptTokens, systemTokens, totalTokens };
  }, [prompt, systemPrompt]);
}

/**
 * Format token count for display
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) {
    return `${count} tokens`;
  }
  
  if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K tokens`;
  }
  
  return `${(count / 1000000).toFixed(1)}M tokens`;
}

/**
 * Format context window size
 */
export function formatContextWindow(contextWindow: number): string {
  if (contextWindow >= 1000000) {
    return `${(contextWindow / 1000000).toFixed(1)}M tokens`;
  }
  
  if (contextWindow >= 1000) {
    const value = contextWindow / 1000;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}K tokens`;
  }
  
  return `${contextWindow} tokens`;
}

/**
 * Calculate tokens per second
 */
export function calculateTokensPerSecond(tokens: number, latencyMs: number): number {
  if (latencyMs <= 0 || tokens <= 0) return 0;
  
  const tokensPerSecond = (tokens / latencyMs) * 1000;
  return Number(tokensPerSecond.toFixed(2));
}

/**
 * Calculate words per minute
 */
export function calculateWordsPerMinute(text: string, latencyMs: number): number {
  if (latencyMs <= 0 || !text) return 0;
  
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const wordsPerMinute = (wordCount / latencyMs) * 60000; // Convert ms to minutes
  
  return Number(wordsPerMinute.toFixed(2));
}

/**
 * Get token usage efficiency metrics
 */
export function calculateTokenEfficiency(usage: TokenUsage): {
  inputOutputRatio: number;
  cachedPercentage: number;
  efficiency: 'excellent' | 'good' | 'average' | 'poor';
} {
  return useMemo(() => {
    const inputOutputRatio = usage.inputTokens > 0 
      ? Number((usage.outputTokens / usage.inputTokens).toFixed(2))
      : 0;
    
    const cachedPercentage = usage.inputTokens > 0
      ? Number(((usage.cachedInputTokens || 0) / usage.inputTokens * 100).toFixed(2))
      : 0;
    
    // Determine efficiency based on caching and input/output ratio
    let efficiency: 'excellent' | 'good' | 'average' | 'poor' = 'average';
    
    if (cachedPercentage > 50) {
      efficiency = 'excellent';
    } else if (cachedPercentage > 20 || inputOutputRatio > 0.5) {
      efficiency = 'good';
    } else if (inputOutputRatio < 0.1) {
      efficiency = 'poor';
    }
    
    return {
      inputOutputRatio,
      cachedPercentage,
      efficiency
    };
  }, [usage]);
}

/**
 * Validate context window limits
 */
export function validateContextWindow(
  inputTokens: number,
  contextWindow: number,
  reservedOutputTokens = 1000
): {
  valid: boolean;
  availableTokens: number;
  utilizationPercentage: number;
  warning?: string;
} {
  const availableTokens = contextWindow - reservedOutputTokens;
  const utilizationPercentage = (inputTokens / contextWindow) * 100;
  
  const valid = inputTokens <= availableTokens;
  let warning: string | undefined;
  
  if (!valid) {
    warning = `Input exceeds context window limit by ${inputTokens - availableTokens} tokens`;
  } else if (utilizationPercentage > 90) {
    warning = `High context utilization (${utilizationPercentage.toFixed(1)}%)`;
  } else if (utilizationPercentage > 75) {
    warning = `Context window is ${utilizationPercentage.toFixed(1)}% full`;
  }
  
  return {
    valid,
    availableTokens: Math.max(0, availableTokens - inputTokens),
    utilizationPercentage: Number(utilizationPercentage.toFixed(2)),
    warning
  };
}

/**
 * Optimize token usage for cost efficiency
 */
export function optimizeTokenUsage(
  prompt: string,
  maxTokens: number,
  options: {
    preserveStructure?: boolean;
    compressionLevel?: 'light' | 'medium' | 'aggressive';
  } = {}
): {
  optimizedPrompt: string;
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  compressionRatio: number;
} {
  const { preserveStructure = true, compressionLevel = 'medium' } = options;
  
  return useMemo(() => {
    const originalTokens = estimateTokenCount(prompt);
    let optimizedPrompt = prompt;
    
    // Apply different compression strategies based on level
    switch (compressionLevel) {
      case 'light':
        // Remove extra whitespace
        optimizedPrompt = prompt.replace(/\s+/g, ' ').trim();
        break;
        
      case 'medium':
        // Remove extra whitespace and some redundant words
        optimizedPrompt = prompt
          .replace(/\s+/g, ' ')
          .replace(/\b(very|really|quite|somewhat|rather)\s+/gi, '')
          .replace(/\b(the|a|an)\s+(?=\w+\s+(is|are|was|were))/gi, '')
          .trim();
        break;
        
      case 'aggressive':
        // More aggressive compression
        optimizedPrompt = prompt
          .replace(/\s+/g, ' ')
          .replace(/\b(very|really|quite|somewhat|rather|actually|basically|literally)\s+/gi, '')
          .replace(/\b(the|a|an)\s+/gi, '')
          .replace(/\b(is|are|was|were)\s+(a|an|the)\s+/gi, '')
          .replace(/\b(in order to)\b/gi, 'to')
          .replace(/\b(due to the fact that)\b/gi, 'because')
          .trim();
        break;
    }
    
    // Ensure we don't exceed maxTokens
    const optimizedTokens = estimateTokenCount(optimizedPrompt);
    if (optimizedTokens > maxTokens) {
      // Truncate if still too long
      const maxChars = maxTokens * TOKEN_ESTIMATION_RATIOS.english;
      optimizedPrompt = optimizedPrompt.substring(0, maxChars - 10) + '...';
    }
    
    const finalTokens = estimateTokenCount(optimizedPrompt);
    const tokensSaved = originalTokens - finalTokens;
    const compressionRatio = originalTokens > 0 ? (finalTokens / originalTokens) : 1;
    
    return {
      optimizedPrompt,
      originalTokens,
      optimizedTokens: finalTokens,
      tokensSaved: Math.max(0, tokensSaved),
      compressionRatio: Number(compressionRatio.toFixed(3))
    };
  }, [prompt, maxTokens, compressionLevel, preserveStructure]);
}

/**
 * Calculate token distribution for analytics
 */
export function calculateTokenDistribution(usageLogs: TokenUsage[]): {
  ranges: Array<{
    label: string;
    min: number;
    max: number;
    count: number;
    percentage: number;
  }>;
  averageUsage: TokenUsage;
  totalUsage: TokenUsage;
} {
  return useMemo(() => {
    if (usageLogs.length === 0) {
      return {
        ranges: [],
        averageUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        totalUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      };
    }
    
    const ranges = [
      { label: '0-1K', min: 0, max: 1000 },
      { label: '1K-10K', min: 1000, max: 10000 },
      { label: '10K-50K', min: 10000, max: 50000 },
      { label: '50K-100K', min: 50000, max: 100000 },
      { label: '100K+', min: 100000, max: Infinity }
    ];
    
    const distribution = ranges.map(range => {
      const count = usageLogs.filter(usage => 
        usage.totalTokens >= range.min && usage.totalTokens < range.max
      ).length;
      
      return {
        ...range,
        count,
        percentage: Number(((count / usageLogs.length) * 100).toFixed(2))
      };
    });
    
    const totalUsage = usageLogs.reduce((total, usage) => ({
      inputTokens: total.inputTokens + usage.inputTokens,
      outputTokens: total.outputTokens + usage.outputTokens,
      totalTokens: total.totalTokens + usage.totalTokens,
      cachedInputTokens: (total.cachedInputTokens || 0) + (usage.cachedInputTokens || 0),
      reasoningTokens: (total.reasoningTokens || 0) + (usage.reasoningTokens || 0)
    }), { inputTokens: 0, outputTokens: 0, totalTokens: 0 });
    
    const averageUsage: TokenUsage = {
      inputTokens: Math.round(totalUsage.inputTokens / usageLogs.length),
      outputTokens: Math.round(totalUsage.outputTokens / usageLogs.length),
      totalTokens: Math.round(totalUsage.totalTokens / usageLogs.length),
      cachedInputTokens: Math.round((totalUsage.cachedInputTokens || 0) / usageLogs.length),
      reasoningTokens: Math.round((totalUsage.reasoningTokens || 0) / usageLogs.length)
    };
    
    return {
      ranges: distribution,
      averageUsage,
      totalUsage
    };
  }, [usageLogs]);
}

/**
 * Detect potential token anomalies
 */
export function detectTokenAnomalies(
  usage: TokenUsage,
  baseline: TokenUsage
): Array<{
  type: 'high_input' | 'high_output' | 'unusual_ratio' | 'low_efficiency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}> {
  const anomalies: Array<{
    type: 'high_input' | 'high_output' | 'unusual_ratio' | 'low_efficiency';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
  }> = [];
  
  const inputRatio = baseline.inputTokens > 0 ? usage.inputTokens / baseline.inputTokens : 1;
  const outputRatio = baseline.outputTokens > 0 ? usage.outputTokens / baseline.outputTokens : 1;
  const ioRatio = usage.inputTokens > 0 ? usage.outputTokens / usage.inputTokens : 0;
  const baselineIoRatio = baseline.inputTokens > 0 ? baseline.outputTokens / baseline.inputTokens : 0;
  
  // High input usage
  if (inputRatio > 3) {
    anomalies.push({
      type: 'high_input',
      severity: inputRatio > 5 ? 'high' : 'medium',
      message: `Input tokens ${inputRatio.toFixed(1)}x higher than baseline`,
      suggestion: 'Consider prompt optimization or caching for repeated content'
    });
  }
  
  // High output usage
  if (outputRatio > 3) {
    anomalies.push({
      type: 'high_output',
      severity: outputRatio > 5 ? 'high' : 'medium',
      message: `Output tokens ${outputRatio.toFixed(1)}x higher than baseline`,
      suggestion: 'Consider reducing max_tokens or using more concise prompts'
    });
  }
  
  // Unusual input/output ratio
  if (Math.abs(ioRatio - baselineIoRatio) > 1 && baselineIoRatio > 0) {
    anomalies.push({
      type: 'unusual_ratio',
      severity: 'medium',
      message: `Input/output ratio significantly different from baseline`,
      suggestion: 'Review prompt efficiency and expected output length'
    });
  }
  
  // Low caching efficiency
  const cachingEfficiency = usage.inputTokens > 0 
    ? (usage.cachedInputTokens || 0) / usage.inputTokens 
    : 0;
  
  if (usage.inputTokens > 1000 && cachingEfficiency < 0.1) {
    anomalies.push({
      type: 'low_efficiency',
      severity: 'low',
      message: 'Low caching efficiency detected',
      suggestion: 'Consider enabling prompt caching for repeated content'
    });
  }
  
  return anomalies;
}