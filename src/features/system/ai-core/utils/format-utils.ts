// src/utils/ai/format-utils.ts
import type { ModelInfo, ModelProvider } from '@/features/system/ai-core/types';
import type { TokenUsage } from '@/features/system/ai-core/types';
import { PROVIDER_COLORS, COST_TIERS } from '@/features/system/ai-core/constants';

/**
 * Format latency for display
 */
export function formatLatency(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format percentage with appropriate precision
 */
export function formatPercentage(
  value: number, 
  options: { precision?: number; includeSign?: boolean } = {}
): string {
  const { precision = 1, includeSign = false } = options;
  const formatted = value.toFixed(precision);
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Format model ID for display
 */
export function formatModelId(modelId: string): {
  provider: string;
  model: string;
  displayName: string;
} {
  const parts = modelId.split('/');
  const provider = parts[0] || 'unknown';
  const model = parts.slice(1).join('/') || modelId;
  
  const displayName = model
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Gpt/g, 'GPT')
    .replace(/Api/g, 'API')
    .replace(/Ai/g, 'AI');
  
  return { provider, model, displayName };
}

/**
 * Get provider color with fallback
 */
export function getProviderColor(provider: ModelProvider): string {
  return PROVIDER_COLORS[provider] || '#6B7280';
}

/**
 * Format duration from milliseconds
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  
  return `${seconds}s`;
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  }
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  
  const months = Math.floor(diffDays / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string | number, 
  options: {
    includeTime?: boolean;
    format?: 'short' | 'medium' | 'long';
    relative?: boolean;
  } = {}
): string {
  const { includeTime = true, format = 'medium', relative = false } = options;
  
  // Convert to Date object if needed
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (relative) {
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - dateObj.getTime());
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Use relative time for recent dates
    if (diffHours < 24) {
      return formatRelativeTime(dateObj);
    }
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'short':
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      if (includeTime) {
        formatOptions.hour = 'numeric';
        formatOptions.minute = '2-digit';
      }
      break;
      
    case 'medium':
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      formatOptions.year = 'numeric';
      if (includeTime) {
        formatOptions.hour = 'numeric';
        formatOptions.minute = '2-digit';
      }
      break;
      
    case 'long':
      formatOptions.weekday = 'short';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      formatOptions.year = 'numeric';
      if (includeTime) {
        formatOptions.hour = 'numeric';
        formatOptions.minute = '2-digit';
        formatOptions.second = '2-digit';
      }
      break;
  }
  
  return dateObj.toLocaleDateString('en-US', formatOptions);
}

/**
 * Format number with appropriate units
 */
export function formatNumber(
  value: number,
  options: {
    unit?: string;
    precision?: number;
    compact?: boolean;
    includeUnit?: boolean;
  } = {}
): string {
  const { unit = '', precision = 0, compact = false, includeUnit = true } = options;
  
  if (compact && Math.abs(value) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.log10(Math.abs(value)) / 3 | 0;
    
    if (tier === 0) {
      return value.toString() + (includeUnit ? ` ${unit}` : '');
    }
    
    const scaledValue = value / Math.pow(1000, tier);
    const suffix = units[tier];
    
    return `${scaledValue.toFixed(precision)}${suffix}${includeUnit && unit ? ` ${unit}` : ''}`;
  }
  
  const formatted = value.toFixed(precision);
  return formatted + (includeUnit && unit ? ` ${unit}` : '');
}

/**
 * Get status color and label
 */
export function getStatusDisplay(
  status: string
): {
  color: string;
  backgroundColor: string;
  label: string;
} {
  const statusMap = {
    success: { color: 'text-green-600', backgroundColor: 'bg-green-50', label: 'Success' },
    error: { color: 'text-red-600', backgroundColor: 'bg-red-50', label: 'Error' },
    pending: { color: 'text-yellow-600', backgroundColor: 'bg-yellow-50', label: 'Pending' },
    running: { color: 'text-blue-600', backgroundColor: 'bg-blue-50', label: 'Running' },
    completed: { color: 'text-green-600', backgroundColor: 'bg-green-50', label: 'Completed' },
    failed: { color: 'text-red-600', backgroundColor: 'bg-red-50', label: 'Failed' },
    cancelled: { color: 'text-gray-600', backgroundColor: 'bg-gray-50', label: 'Cancelled' },
    available: { color: 'text-green-600', backgroundColor: 'bg-green-50', label: 'Available' },
    limited: { color: 'text-yellow-600', backgroundColor: 'bg-yellow-50', label: 'Limited' },
    deprecated: { color: 'text-gray-600', backgroundColor: 'bg-gray-50', label: 'Deprecated' }
  };
  
  return statusMap[status as keyof typeof statusMap] || {
    color: 'text-gray-600',
    backgroundColor: 'bg-gray-50',
    label: status
  };
}

/**
 * Format usage summary
 */
export function formatUsageSummary(usage: TokenUsage): string {
  const parts: string[] = [];
  
  if (usage.inputTokens > 0) {
    parts.push(`${usage.inputTokens.toLocaleString()} input`);
  }
  
  if (usage.outputTokens > 0) {
    parts.push(`${usage.outputTokens.toLocaleString()} output`);
  }
  
  if (usage.cachedInputTokens && usage.cachedInputTokens > 0) {
    parts.push(`${usage.cachedInputTokens.toLocaleString()} cached`);
  }
  
  if (usage.reasoningTokens && usage.reasoningTokens > 0) {
    parts.push(`${usage.reasoningTokens.toLocaleString()} reasoning`);
  }
  
  if (parts.length === 0) {
    return '0 tokens';
  }
  
  if (parts.length === 1) {
    return `${parts[0]} tokens`;
  }
  
  return `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]} tokens`;
}

/**
 * Format capability list
 */
export function formatCapabilities(capabilities: Record<string, boolean>): string[] {
  return Object.entries(capabilities)
    .filter(([, enabled]) => enabled)
    .map(([capability]) => {
      // Convert camelCase to readable format
      return capability
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    });
}

/**
 * Get cost tier display information
 */
export function getCostTierDisplay(cost: number): {
  tier: string;
  color: string;
  backgroundColor: string;
  description: string;
} {
  const tiers = Object.entries(COST_TIERS).find(([, tierInfo]) => 
    cost <= tierInfo.max || tierInfo.max === Infinity
  );
  
  if (!tiers) {
    return {
      tier: 'Unknown',
      color: 'text-gray-600',
      backgroundColor: 'bg-gray-50',
      description: 'Cost tier unknown'
    };
  }
  
  const [tierKey, tierInfo] = tiers;
  
  return {
    tier: tierInfo.label,
    color: tierInfo.color,
    backgroundColor: tierInfo.backgroundColor,
    description: `${tierInfo.label} cost tier`
  };
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error).message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Analyze cache type from log metadata
 */
export function analyzeCacheType(metadata: any): {
  type: 'none' | 'application' | 'provider' | 'both';
  details: {
    applicationCache?: {
      hit: boolean;
      key?: string;
      ttl?: number;
    };
    providerCache?: {
      hit: boolean;
      provider: 'anthropic' | 'openai' | 'other';
      cachedTokens?: number;
      cacheType?: 'ephemeral' | 'persistent' | 'automatic';
    };
  };
} {
  const cache = metadata?.cache;
  const legacyCacheHit = metadata?.cacheHit;
  
  const applicationHit = cache?.applicationCache?.hit || false;
  const providerHit = cache?.providerCache?.hit || false;
  
  let type: 'none' | 'application' | 'provider' | 'both';
  
  if (applicationHit && providerHit) {
    type = 'both';
  } else if (applicationHit) {
    type = 'application';
  } else if (providerHit) {
    type = 'provider';
  } else if (legacyCacheHit) {
    // Legacy cache hit detection
    type = 'application';
  } else {
    type = 'none';
  }
  
  return {
    type,
    details: {
      applicationCache: cache?.applicationCache,
      providerCache: cache?.providerCache
    }
  };
}

/**
 * Format cache information for display
 */
export function formatCacheInfo(metadata: any): string {
  const analysis = analyzeCacheType(metadata);
  
  switch (analysis.type) {
    case 'none':
      return 'No cache';
      
    case 'application':
      return 'App cache';
      
    case 'provider':
      const provider = analysis.details.providerCache?.provider;
      const tokens = analysis.details.providerCache?.cachedTokens;
      if (provider && tokens) {
        return `${provider} cache (${tokens} tokens)`;
      }
      return 'Provider cache';
      
    case 'both':
      return 'App + provider cache';
      
    default:
      return 'Unknown cache';
  }
}

/**
 * Get cache badge color for UI
 */
export function getCacheBadgeColor(metadata: any): string {
  const analysis = analyzeCacheType(metadata);
  
  switch (analysis.type) {
    case 'none':
      return 'bg-gray-100 text-gray-700';
      
    case 'application':
      return 'bg-blue-100 text-blue-700';
      
    case 'provider':
      return 'bg-green-100 text-green-700';
      
    case 'both':
      return 'bg-purple-100 text-purple-700';
      
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Format API response time
 */
export function formatResponseTime(startTime: number, endTime?: number): string {
  const end = endTime || Date.now();
  const diff = end - startTime;
  
  return formatLatency(diff);
}

/**
 * Create display-friendly abbreviations
 */
export function createAbbreviation(text: string, maxLength = 20): string {
  if (text.length <= maxLength) return text;
  
  const words = text.split(/[\s-_]+/);
  if (words.length === 1) {
    return text.substring(0, maxLength - 3) + '...';
  }
  
  // Try to create meaningful abbreviation from first letters
  const abbreviation = words
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  if (abbreviation.length <= maxLength) {
    return abbreviation;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  // Always show price per 1M tokens for consistency
  return `$${(price * 1000000).toFixed(2)}/1M tokens`;
}