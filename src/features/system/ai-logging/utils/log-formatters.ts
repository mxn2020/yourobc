// src/features/ai-logging/utils/log-formatters.ts
import type { AIUsageLog } from '@/features/system/ai-core/types';
import type { FormattedExportLog } from '../types/log.types';
import { formatLatency, formatDate, formatNumber, getStatusDisplay } from '@/features/system/ai-core/utils';
import { formatTokenCount } from '@/features/system/ai-core/utils';
import { formatCost } from '@/features/system/ai-core/utils';

export function formatLogForDisplay(log: AIUsageLog) {
  return {
    id: log.publicId,
    displayId: log.publicId,
    timestamp: formatDate(log.createdAt, { includeTime: true, format: 'medium' }),
    modelName: log.modelId.split('/')[1] || log.modelId,
    provider: log.provider,
    statusDisplay: getStatusDisplay(log.success ? 'success' : 'error'),
    latencyFormatted: formatLatency(log.latencyMs),
    costFormatted: formatCost(log.cost),
    tokensFormatted: formatTokenCount(log.usage.totalTokens || 0),
    promptPreview: log.prompt.length > 100 ? `${log.prompt.substring(0, 100)}...` : log.prompt,
    responsePreview: log.response ? 
      log.response.length > 100 ? `${log.response.substring(0, 100)}...` : log.response :
      null,
    hasWarnings: log.warnings && log.warnings.length > 0,
    warningCount: log.warnings?.length || 0,
    hasToolCalls: log.toolCalls && log.toolCalls.length > 0,
    toolCallCount: log.toolCalls?.length || 0
  };
}

export function formatLogMetrics(log: AIUsageLog) {
  const usage = log.usage;
  return {
    inputTokens: formatNumber(usage.inputTokens || 0, { compact: true }),
    outputTokens: formatNumber(usage.outputTokens || 0, { compact: true }),
    totalTokens: formatNumber(usage.totalTokens || 0, { compact: true }),
    reasoningTokens: usage.reasoningTokens ? formatNumber(usage.reasoningTokens, { compact: true }) : null,
    cachedTokens: usage.cachedInputTokens ? formatNumber(usage.cachedInputTokens, { compact: true }) : null,
    cost: formatCost(log.cost),
    latency: formatLatency(log.latencyMs),
    tokensPerSecond: log.metadata.tokensPerSecond ? 
      formatNumber(log.metadata.tokensPerSecond, { precision: 1, unit: 'tokens/s' }) : null,
    efficiency: usage.cachedInputTokens && usage.inputTokens ? 
      `${Math.round((usage.cachedInputTokens / usage.inputTokens) * 100)}% cached` : null
  };
}

export function formatLogForExport(log: AIUsageLog): FormattedExportLog {
  return {
    id: log.publicId,
    timestamp: new Date(log.createdAt).toISOString(),
    model: log.modelId,
    provider: log.provider,
    requestType: log.requestType,
    success: log.success,
    prompt: log.prompt,
    response: log.response || '',
    inputTokens: log.usage.inputTokens || 0,
    outputTokens: log.usage.outputTokens || 0,
    totalTokens: log.usage.totalTokens || 0,
    reasoningTokens: log.usage.reasoningTokens || 0,
    cachedTokens: log.usage.cachedInputTokens || 0,
    cost: log.cost,
    latencyMs: log.latencyMs,
    finishReason: log.finishReason || '',
    errorMessage: log.errorMessage || '',
    warningCount: log.warnings?.length || 0,
    toolCallCount: log.toolCalls?.length || 0,
    sessionId: log.metadata.sessionId || '',
    feature: log.metadata.feature || ''
  };
}