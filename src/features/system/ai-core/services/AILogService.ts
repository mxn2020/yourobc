// src/core/ai/AILogService.ts (Updated with missing methods)
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type {
  AIUsageLog,
  AIUsageFilter,
  AIUsageStats,
  LogQueryResult,
  LogParameters,
  UsageFilters
} from '../types/ai-logging.types';
import type { AIOperationType, GatewayMetadata } from '../types/ai-core.types';
import type { ModelProvider } from '../types/ai-models.types';
import type {
  SharedV2ProviderMetadata,
  LanguageModelV2ResponseMetadata,
  JSONValue
} from '@ai-sdk/provider';
import { getProviderFromModelId } from '@/features/boilerplate/ai-core/utils';
import { formatErrorMessage } from '@/features/boilerplate/ai-core/utils';
import { cleanTestParameters } from '@/features/boilerplate/ai-core/utils';
import { TestParameters } from '../types/ai-testing.types';
import { Id } from "@/convex/_generated/dataModel";

// Type for data sent to Convex (without timestamps, _id, and publicId - those are auto-generated)
type ConvexLogData = Omit<AIUsageLog, 'createdAt' | 'updatedAt' | '_id' | 'publicId'>;

export interface LoggingConfig {
  convexUrl?: string;
  enableBatching?: boolean;
  batchSize?: number;
  flushInterval?: number;
  enableDebugLogging?: boolean;
  maxRetries?: number;
  enableCompression?: boolean;
}

interface PendingLog {
  data: ConvexLogData;
  timestamp: number;
  retries: number;
}

export class AILogService {
  private readonly config: Required<LoggingConfig>;
  private readonly pendingLogs: Map<string, PendingLog> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private convexClient: ConvexHttpClient | null = null;

  constructor(config: LoggingConfig = {}) {
    this.config = {
      convexUrl: config.convexUrl || process.env.VITE_CONVEX_URL || 'http://localhost:3210',
      enableBatching: config.enableBatching ?? true,
      batchSize: config.batchSize ?? 10,
      flushInterval: config.flushInterval ?? 5000,
      enableDebugLogging: config.enableDebugLogging ?? false,
      maxRetries: config.maxRetries ?? 3,
      enableCompression: config.enableCompression ?? true
    };
    
    // Initialize Convex client
    this.initializeConvexClient();
    
    if (this.config.enableBatching) {
      this.startFlushTimer();
    }

    // Cleanup on process exit
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => this.cleanup());
      process.on('SIGINT', () => this.cleanup());
      process.on('SIGTERM', () => this.cleanup());
    }
  }

  /**
   * Initialize Convex client for database operations
   */
  private initializeConvexClient(): void {
    try {
      if (this.config.convexUrl) {
        this.convexClient = new ConvexHttpClient(this.config.convexUrl);
      }
    } catch (error) {
      console.warn('Failed to initialize Convex client:', error);
      this.convexClient = null;
    }
  }

  /**
   * Log when a request starts
   */
  public async logRequestStart(
    requestId: string,
    operationType: AIOperationType,
    _request: unknown
  ): Promise<void> {
    if (this.config.enableDebugLogging) {
      console.log(`🚀 AI Request started: ${requestId} (${operationType})`);
    }

    // Store start time for latency calculation
    this.pendingLogs.set(`${requestId}_start`, {
      data: {} as ConvexLogData,
      timestamp: Date.now(),
      retries: 0
    });
  }

  /**
   * Log successful request completion
   */
  public async logRequestSuccess(
    requestId: string,
    request: unknown,
    response: unknown
  ): Promise<void> {
    try {
      const logData = this.buildLogEntry(requestId, request, response, true);
      
      // Detect and log provider cache hits
      const providerCacheInfo = this.detectProviderCacheHit(request, response);
      if (providerCacheInfo) {
        logData.metadata.cache = {
          ...logData.metadata.cache,
          providerCache: providerCacheInfo,
          cacheHit: true // Legacy compatibility
        };
        logData.metadata.cacheHit = true; // Legacy field
        
        if (this.config.enableDebugLogging) {
          console.log(`🏪 Provider cache detected: ${requestId}`, providerCacheInfo);
        }
      }
      
      await this.createLog(logData);

      if (this.config.enableDebugLogging) {
        const cacheType = logData.metadata.cache?.applicationCache?.hit ? 'app-cache' : 
                          logData.metadata.cache?.providerCache?.hit ? 'provider-cache' : 'no-cache';
        console.log(`✅ AI Request completed: ${requestId}`, {
          cost: logData.cost,
          tokens: logData.usage.totalTokens,
          latency: logData.latencyMs,
          cacheType
        });
      }
    } catch (error) {
      console.error('Failed to log successful request:', error);
    }
  }

  /**
   * Log failed request
   */
  public async logRequestError(
    requestId: string,
    request: unknown,
    error: unknown
  ): Promise<void> {
    try {
      const logData = this.buildErrorLogEntry(requestId, request, error);
      await this.createLog(logData);

      if (this.config.enableDebugLogging) {
        console.log(`❌ AI Request failed: ${requestId}`, {
          error: logData.errorMessage,
          type: logData.errorType
        });
      }
    } catch (loggingError) {
      console.error('Failed to log error request:', loggingError);
    }
  }

  /**
   * Log application-level cache hit (CacheManager)
   */
  public async logCacheHit(
    requestId: string,
    request: unknown,
    cachedResponse: unknown,
    cacheKey?: string,
    ttl?: number
  ): Promise<void> {
    try {
      const logData = this.buildLogEntry(requestId, request, cachedResponse, true);
      
      // Set application cache info
      logData.metadata.cache = {
        applicationCache: {
          hit: true,
          key: cacheKey,
          ttl: ttl
        },
        cacheHit: true // Legacy compatibility
      };
      
      // Legacy field
      logData.metadata.cacheHit = true;
      
      logData.latencyMs = 0; // Cache hits are instantaneous
      logData.cost = 0; // Cache hits don't cost anything

      await this.createLog(logData);

      if (this.config.enableDebugLogging) {
        console.log(`💾 Application cache hit: ${requestId}`, { cacheKey, ttl });
      }
    } catch (error) {
      console.error('Failed to log application cache hit:', error);
    }
  }

  /**
   * Log provider-level cache hit (Anthropic/OpenAI prompt caching)
   */
  public async logProviderCacheHit(
    requestId: string,
    request: unknown,
    response: unknown,
    provider: 'anthropic' | 'openai' | 'other',
    cachedTokens?: number,
    cacheType?: 'ephemeral' | 'persistent' | 'automatic'
  ): Promise<void> {
    try {
      const logData = this.buildLogEntry(requestId, request, response, true);
      
      // Set provider cache info
      logData.metadata.cache = {
        providerCache: {
          hit: true,
          provider,
          cachedTokens,
          cacheType
        },
        cacheHit: true // Legacy compatibility
      };
      
      // Legacy field
      logData.metadata.cacheHit = true;
      
      // Provider cache reduces cost but not necessarily to zero
      // Cost calculation should account for cached tokens
      
      await this.createLog(logData);

      if (this.config.enableDebugLogging) {
        console.log(`🏪 Provider cache hit: ${requestId}`, { provider, cachedTokens, cacheType });
      }
    } catch (error) {
      console.error('Failed to log provider cache hit:', error);
    }
  }

  /**
   * Query logs with filters
   */
  public async queryLogs(filters: AIUsageFilter = {}): Promise<LogQueryResult> {
    try {
      if (!this.convexClient) {
        console.warn('Convex client not initialized, returning empty results');
        return { logs: [], total: 0, hasMore: false };
      }

      // Convert our filter format to match Convex query expectations
      const convexArgs: any = {};
      
      if (filters.userId) convexArgs.userId = filters.userId;
      if (filters.modelId?.length) convexArgs.modelId = filters.modelId[0]; // Convex expects single value
      if (filters.provider?.length) convexArgs.provider = filters.provider[0]; // Convex expects single value
      if (filters.requestType?.length) convexArgs.requestType = filters.requestType[0]; // Convex expects single value
      if (filters.success !== undefined) convexArgs.success = filters.success;
      if (filters.search) convexArgs.search = filters.search;
      if (filters.limit) convexArgs.limit = filters.limit;
      if (filters.offset) convexArgs.offset = filters.offset;

      // Date range
      if (filters.dateRange) {
        convexArgs.startDate = filters.dateRange.start.getTime();
        convexArgs.endDate = filters.dateRange.end.getTime();
      }

      // Query logs from Convex
      const result = await this.convexClient.query(api.lib.boilerplate.ai_logs.queries.getAILogs, convexArgs);

      return {
        logs: result.logs.map((log) => ({
          ...log,
          provider: log.provider as ModelProvider,
          usage: {
            inputTokens: log.usage.inputTokens || 0,
            outputTokens: log.usage.outputTokens || 0,
            totalTokens: log.usage.totalTokens || 0,
            reasoningTokens: log.usage.reasoningTokens,
            cachedInputTokens: log.usage.cachedInputTokens
          },
          warnings: log.warnings || [],
          finishReason: log.finishReason as 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown' | undefined,
          metadata: log.extendedMetadata,
          createdAt: new Date(log.createdAt),
          updatedAt: new Date(log.updatedAt ?? log.createdAt)
        })),
        total: result.total,
        hasMore: result.hasMore
      };
    } catch (error) {
      console.error('Failed to query logs:', error);
      throw new Error(`Failed to query logs: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Get specific log by ID (Convex internal _id)
   */
  public async getLogById(logId: Id<"aiLogs">): Promise<AIUsageLog | null> {
    try {
      if (!this.convexClient) {
        console.warn('Convex client not initialized');
        return null;
      }

      const result = await this.convexClient.query(api.lib.boilerplate.ai_logs.queries.getAILog, { logId });
      
      if (!result) {
        return null;
      }

      return {
        ...result,
        provider: result.provider as ModelProvider,
        usage: {
          inputTokens: result.usage.inputTokens || 0,
          outputTokens: result.usage.outputTokens || 0,
          totalTokens: result.usage.totalTokens || 0,
          reasoningTokens: result.usage.reasoningTokens,
          cachedInputTokens: result.usage.cachedInputTokens
        },
        warnings: result.warnings || [],
        finishReason: result.finishReason as 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown' | undefined,
        metadata: result.extendedMetadata,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt ?? result.createdAt)
      };
    } catch (error) {
      console.error('Failed to get log by ID:', error);
      throw new Error(`Failed to get log: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Get specific log by public ID
   */
  public async getLogByPublicId(publicId: string): Promise<AIUsageLog | null> {
    try {
      if (!this.convexClient) {
        console.warn('Convex client not initialized');
        return null;
      }

      const result = await this.convexClient.query(api.lib.boilerplate.ai_logs.queries.getAILogByPublicId, { publicId });

      if (!result) {
        return null;
      }

      return {
        ...result,
        provider: result.provider as ModelProvider,
        usage: {
          inputTokens: result.usage.inputTokens || 0,
          outputTokens: result.usage.outputTokens || 0,
          totalTokens: result.usage.totalTokens || 0,
          reasoningTokens: result.usage.reasoningTokens,
          cachedInputTokens: result.usage.cachedInputTokens
        },
        warnings: result.warnings || [],
        finishReason: result.finishReason as 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown' | undefined,
        metadata: result.extendedMetadata,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt ?? result.createdAt)
      };
    } catch (error) {
      console.error('Failed to get log by public ID:', error);
      throw new Error(`Failed to get log: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Delete log by Convex ID
   * @param logId - The log ID to delete
   * Note: Authentication handled by Convex via JWT session
   */
  public async deleteLog(logId: Id<"aiLogs">): Promise<boolean> {
    try {
      if (!this.convexClient) {
        console.warn('Convex client not initialized');
        return false;
      }

      await this.convexClient.mutation(api.lib.boilerplate.ai_logs.mutations.deleteAILog, {
        logId
      });

      return true;
    } catch (error) {
      console.error('Failed to delete log:', error);
      return false;
    }
  }

  /**
   * Delete log by public ID
   * @param publicId - The public ID to delete
   * Note: Authentication handled by Convex via JWT session
   */
  public async deleteLogByPublicId(publicId: string): Promise<boolean> {
    try {
      if (!this.convexClient) {
        console.warn('Convex client not initialized');
        return false;
      }

      await this.convexClient.mutation(api.lib.boilerplate.ai_logs.mutations.deleteAILogByPublicId, {
        publicId
      });

      return true;
    } catch (error) {
      console.error('Failed to delete log by public ID:', error);
      return false;
    }
  }

  /**
   * Get usage statistics
   */
  public async getStats(_filters: UsageFilters = {}): Promise<AIUsageStats> {
    try {
      if (!this.convexClient) {
        console.warn('Convex client not initialized, returning empty stats');
        return this.getEmptyStats();
      }

      // Get stats from Convex
      const rawStats = await this.convexClient.query(api.lib.boilerplate.ai_logs.queries.getAILogStats, {});
      
      // Return stats directly - Convex schema should match our expected format
      return {
        totalRequests: rawStats.totalRequests || 0,
        totalCost: rawStats.totalCost || 0,
        totalTokens: rawStats.totalTokens || 0,
        successRate: rawStats.successRate || 0,
        avgLatency: rawStats.avgLatency || 0,
        avgCostPerToken: rawStats.avgCostPerToken || 0,
        requestsByDay: [], // Will need to be calculated from requestsToday/Week/Month
        topModels: Object.entries(rawStats.modelCounts).map(([modelId, count]) => ({
          modelId,
          requests: count as number,
          cost: 0, // Would need additional calculation from logs
          tokens: 0,
          avgLatency: 0,
          successRate: 0,
          avgCostPerToken: 0
        })),
        providerBreakdown: Object.entries(rawStats.providerCounts).map(([provider, count]) => ({
          provider: provider as ModelProvider,
          requests: count as number,
          cost: 0,
          tokens: 0,
          avgLatency: 0,
          successRate: 0,
          modelsUsed: []
        })),
        featureBreakdown: Object.entries(rawStats.requestTypeCounts).map(([feature, count]) => ({
          feature,
          requests: count as number,
          cost: 0,
          avgLatency: 0
        })),
        errorBreakdown: [],
        finishReasonBreakdown: [],
        tokenUsage: {
          avgInputTokens: 0,
          avgOutputTokens: 0,
          totalInputTokens: rawStats.totalTokens || 0,
          totalOutputTokens: rawStats.totalTokens || 0,
          tokenDistribution: []
        }
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw new Error(`Failed to get usage stats: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Export logs to CSV format
   */
  public async exportToCsv(logs: any[]): Promise<string> {
    const headers = [
      'ID',
      'User ID',
      'Model ID',
      'Provider',
      'Request Type',
      'Prompt',
      'Response',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Cost',
      'Latency (ms)',
      'Success',
      'Error Message',
      'Created At'
    ];

    const rows = logs.map(log => [
      log.id,
      log.userId,
      log.modelId,
      log.provider,
      log.requestType,
      `"${(log.prompt || '').replace(/"/g, '""')}"`, // Escape quotes
      `"${(log.response || '').replace(/"/g, '""')}"`, // Escape quotes
      log.usage?.inputTokens?.toString() || '0',
      log.usage?.outputTokens?.toString() || '0',
      log.usage?.totalTokens?.toString() || '0',
      log.cost?.toString() || '0',
      log.latencyMs?.toString() || '0',
      log.success?.toString() || 'false',
      `"${(log.errorMessage || '').replace(/"/g, '""')}"`, // Escape quotes
      new Date(log.createdAt).toISOString()
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Delete old logs (cleanup)
   */
  public async cleanupOldLogs(olderThanDays: number): Promise<number> {
    try {
      if (!this.convexClient) {
        console.warn('Convex client not initialized, skipping cleanup');
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      // Get logs older than cutoff date and delete them
      const oldLogs = await this.queryLogs({
        dateRange: {
          start: new Date(0), // Very old date
          end: cutoffDate
        },
        limit: 1000
      });

      let deletedCount = 0;
      for (const log of oldLogs.logs) {
        try {
          // Authentication handled by Convex via session
          // Use publicId instead of internal _id
          await this.deleteLogByPublicId(log.publicId);
          deletedCount++;
        } catch (error) {
          console.warn(`Failed to delete log ${log.publicId}:`, error);
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return 0;
    }
  }

  /**
   * Flush pending logs immediately
   */
  public async flush(): Promise<void> {
    if (this.pendingLogs.size === 0) return;

    const logsToFlush = Array.from(this.pendingLogs.entries())
      .filter(([key]) => !key.endsWith('_start'));
    
    if (logsToFlush.length === 0) return;

    // Clear the logs we're about to flush
    logsToFlush.forEach(([requestId]) => {
      this.pendingLogs.delete(requestId);
      this.pendingLogs.delete(`${requestId}_start`); // Also cleanup start markers
    });

    const promises = logsToFlush.map(async ([requestId, pendingLog]) => {
      try {
        if (this.convexClient) {
          // Map streaming to text_generation for Convex compatibility until types are regenerated
          const logData = {
            ...pendingLog.data,
            requestType: pendingLog.data.requestType === 'streaming' ? 'text_generation' : pendingLog.data.requestType
          };
          await this.convexClient.mutation(api.lib.boilerplate.ai_logs.mutations.createAILog, logData);
        }
        
        if (this.config.enableDebugLogging) {
          console.log(`📝 Flushed log: ${requestId}`);
        }
      } catch (error) {
        console.error(`Failed to flush log ${requestId}:`, error);
        
        // Retry logic with exponential backoff
        if (pendingLog.retries < this.config.maxRetries) {
          pendingLog.retries++;
          this.pendingLogs.set(requestId, pendingLog);
        } else {
          console.error(`Max retries exceeded for log ${requestId}, dropping log`);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get pending logs count (useful for monitoring)
   */
  public getPendingLogsCount(): number {
    return Array.from(this.pendingLogs.keys()).filter(key => !key.endsWith('_start')).length;
  }

  /**
   * Force flush and cleanup resources
   */
  public async cleanup(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    await this.flush();
  }

  /**
   * Create log entry (with batching if enabled)
   */
  private async createLog(logData: ConvexLogData): Promise<void> {
    if (this.config.enableBatching) {
      // Use requestId from metadata as the key (not _id which doesn't exist on ConvexLogData)
      const requestId = logData.metadata.requestId;
      this.pendingLogs.set(requestId, {
        data: logData,
        timestamp: Date.now(),
        retries: 0
      });

      if (this.getPendingLogsCount() >= this.config.batchSize) {
        await this.flush();
      }
    } else {
      // Direct logging without batching
      if (this.convexClient) {
        try {
          await this.convexClient.mutation(api.lib.boilerplate.ai_logs.mutations.createAILog, logData);
        } catch (error) {
          console.error('Failed to create log directly:', error);
        }
      }
    }
  }

  /**
   * Build log entry from successful request/response
   */
  private buildLogEntry(
    requestId: string,
    request: any,
    response: any,
    success: boolean
  ): ConvexLogData {
    // Calculate latency from start marker
    const startMarker = this.pendingLogs.get(`${requestId}_start`);
    const latencyMs = startMarker ? Date.now() - startMarker.timestamp : response?.latencyMs || 0;

    return {
      // DO NOT set _id here - Convex auto-generates it
      // DO NOT set publicId here - Convex mutation generates it
      userId: request.userId || request.metadata?.userId || 'anonymous',
      modelId: request.modelId,
      provider: getProviderFromModelId(request.modelId),
      requestType: this.inferRequestType(request),
      prompt: request.prompt || '',
      systemPrompt: request.systemPrompt,
      parameters: this.sanitizeParameters(request.parameters),
      response: this.extractResponseText(response),
      usage: {
        inputTokens: response?.usage?.inputTokens || 0,
        outputTokens: response?.usage?.outputTokens || 0,
        totalTokens: response?.usage?.totalTokens || 0,
        reasoningTokens: response?.usage?.reasoningTokens,
        cachedInputTokens: response?.usage?.cachedInputTokens
      },
      finishReason: response?.finishReason,
      warnings: response?.warnings || [],
      providerMetadata: this.sanitizeProviderMetadata(response?.providerMetadata),
      responseMetadata: this.sanitizeResponseMetadata(response?.responseMetadata),
      gatewayMetadata: this.sanitizeGatewayMetadata(response?.gatewayMetadata),
      toolCalls: this.sanitizeToolCalls(response?.toolCalls),
      files: response?.files,
      cost: response?.cost || 0,
      latencyMs,
      success,
      metadata: {
        requestId,
        traceId: request.metadata?.traceId,
        parentRequestId: request.metadata?.parentRequestId,
        sessionId: request.metadata?.sessionId,
        feature: request.metadata?.feature || 'unknown',
        userAgent: request.metadata?.userAgent,
        sdkVersion: request.metadata?.sdkVersion,
        providerRequestId: response?.responseMetadata?.id,
        cacheHit: response?.cached || false,
        rateLimited: false,
        cacheWritten: response?.cacheWritten,
        testRun: request.metadata?.testRun,
        firstTokenLatency: response?.performance?.firstTokenLatency,
        tokensPerSecond: response?.performance?.tokensPerSecond,
        wordsPerMinute: response?.performance?.wordsPerMinute,
        objectType: request.outputMode || (request.schema ? 'object' : undefined)
      }
    };
  }

  /**
   * Build log entry for failed requests
   */
  private buildErrorLogEntry(
    requestId: string,
    request: any,
    error: unknown
  ): ConvexLogData {
    const errorMessage = formatErrorMessage(error);
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';

    // Calculate latency from start marker
    const startMarker = this.pendingLogs.get(`${requestId}_start`);
    const latencyMs = startMarker ? Date.now() - startMarker.timestamp : 0;

    return {
      // DO NOT set _id here - Convex auto-generates it
      // DO NOT set publicId here - Convex mutation generates it
      userId: request.userId || request.metadata?.userId || 'anonymous',
      modelId: request.modelId,
      provider: getProviderFromModelId(request.modelId),
      requestType: this.inferRequestType(request),
      prompt: request.prompt || '',
      systemPrompt: request.systemPrompt,
      parameters: this.sanitizeParameters(request.parameters),
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0
      },
      warnings: [],
      cost: 0,
      latencyMs,
      success: false,
      errorMessage,
      errorType,
      metadata: {
        requestId,
        sessionId: request.metadata?.sessionId,
        feature: request.metadata?.feature || 'unknown',
        userAgent: request.metadata?.userAgent
      }
    };
  }

  /**
   * Get empty stats structure
   */
  private getEmptyStats(): AIUsageStats {
    return {
      totalRequests: 0,
      totalCost: 0,
      totalTokens: 0,
      successRate: 0,
      avgLatency: 0,
      avgCostPerToken: 0,
      requestsByDay: [],
      topModels: [],
      providerBreakdown: [],
      featureBreakdown: [],
      errorBreakdown: [],
      finishReasonBreakdown: [],
      tokenUsage: {
        avgInputTokens: 0,
        avgOutputTokens: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        tokenDistribution: []
      }
    };
  }

  /**
   * Start flush timer for batching
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      if (this.getPendingLogsCount() > 0) {
        await this.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * Infer request type from request object
   */
  private inferRequestType(request: any): AIOperationType {
    if (request.schema) return 'object_generation';
    if (request.text && Array.isArray(request.text)) return 'embedding';
    if (request.audio) return 'transcription';
    if (request.voice) return 'speech';
    if (request.width || request.height) return 'image_generation';
    return 'text_generation';
  }

  /**
   * Extract response text for logging
   */
  private extractResponseText(response: any): string | undefined {
    if (typeof response?.text === 'string') return response.text;
    if (typeof response?.object === 'object') return JSON.stringify(response.object);
    return undefined;
  }

  /**
   * Sanitize parameters to match LogParameters type
   */
  private sanitizeParameters(data: TestParameters): LogParameters {
    if (!data || typeof data !== 'object') {
      return {};
    }
    
    try {
      // First clean the test parameters to remove internal fields like _testId, _testTimestamp
      const cleaned = cleanTestParameters(data);
      const sanitized = JSON.parse(JSON.stringify(cleaned)) as Record<string, unknown>;
      
      // Filter and type-check known parameters
      const logParams: LogParameters = {};
      
      if (typeof sanitized.temperature === 'number') {
        logParams.temperature = sanitized.temperature;
      }
      if (typeof sanitized.maxTokens === 'number') {
        logParams.maxTokens = sanitized.maxTokens;
      }
      if (typeof sanitized.topP === 'number') {
        logParams.topP = sanitized.topP;
      }
      if (typeof sanitized.topK === 'number') {
        logParams.topK = sanitized.topK;
      }
      if (typeof sanitized.frequencyPenalty === 'number') {
        logParams.frequencyPenalty = sanitized.frequencyPenalty;
      }
      if (typeof sanitized.presencePenalty === 'number') {
        logParams.presencePenalty = sanitized.presencePenalty;
      }
      if (Array.isArray(sanitized.stopSequences)) {
        logParams.stopSequences = sanitized.stopSequences.filter(
          (item): item is string => typeof item === 'string'
        );
      }
      if (sanitized.responseFormat && typeof sanitized.responseFormat === 'object') {
        logParams.responseFormat = sanitized.responseFormat as LogParameters['responseFormat'];
      }
      if (Array.isArray(sanitized.tools)) {
        logParams.tools = sanitized.tools;
      }
      if (sanitized.schema && typeof sanitized.schema === 'object') {
        logParams.schema = sanitized.schema;
      }
      if (typeof sanitized.enableCaching === 'boolean') {
        logParams.enableCaching = sanitized.enableCaching;
      }
      if (typeof sanitized.contextLength === 'number') {
        logParams.contextLength = sanitized.contextLength;
      }
      
      // Add any additional parameters (internal test fields already filtered out)
      Object.keys(sanitized).forEach(key => {
        if (!(key in logParams)) {
          logParams[key] = sanitized[key];
        }
      });
      
      return logParams;
    } catch {
      return {};
    }
  }

  /**
   * Sanitize provider metadata to match SharedV2ProviderMetadata type
   */
  private sanitizeProviderMetadata(data: unknown): SharedV2ProviderMetadata | undefined {
    if (!data || typeof data !== 'object') return undefined;
    
    try {
      const sanitized = this.deepSanitizeForConvex(data);
      
      // Ensure it matches SharedV2ProviderMetadata structure
      const providerMetadata: SharedV2ProviderMetadata = {};
      
      for (const [providerKey, providerValue] of Object.entries(sanitized as Record<string, unknown>)) {
        if (typeof providerValue === 'object' && providerValue !== null) {
          const providerRecord: Record<string, JSONValue> = {};
          
          for (const [key, value] of Object.entries(providerValue as Record<string, unknown>)) {
            if (this.isJSONValue(value)) {
              providerRecord[key] = value;
            }
          }
          
          if (Object.keys(providerRecord).length > 0) {
            providerMetadata[providerKey] = providerRecord;
          }
        }
      }
      
      return Object.keys(providerMetadata).length > 0 ? providerMetadata : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Sanitize gateway metadata
   */
  private sanitizeGatewayMetadata(data: unknown): GatewayMetadata | undefined {
    if (!data || typeof data !== 'object') return undefined;
    
    try {
      const sanitized = this.deepSanitizeForConvex(data);
      return sanitized as GatewayMetadata;
    } catch {
      return undefined;
    }
  }

  /**
   * Sanitize response metadata for storage (convert dates to timestamps)
   */
  private sanitizeResponseMetadata(data: unknown): LanguageModelV2ResponseMetadata | undefined {
    if (!data || typeof data !== 'object') return undefined;
    
    try {
      const sanitized = this.deepSanitizeForConvex(data);
      return sanitized as LanguageModelV2ResponseMetadata;
    } catch {
      return undefined;
    }
  }

  /**
   * Check if value is a valid JSONValue
   */
  private isJSONValue(value: unknown): value is JSONValue {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return true;
    }
    
    if (Array.isArray(value)) {
      return value.every(item => this.isJSONValue(item));
    }
    
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).every(val => this.isJSONValue(val));
    }
    
    return false;
  }

  /**
   * Sanitize tool calls for storage
   */
  private sanitizeToolCalls(toolCalls: any[]): Array<{
    id: string;
    name: string;
    input: Record<string, unknown>;
    output?: Record<string, unknown>;
    providerExecuted?: boolean;
  }> | undefined {
    if (!Array.isArray(toolCalls) || toolCalls.length === 0) return undefined;
    
    return toolCalls.map(call => ({
      id: call.id || crypto.randomUUID(),
      name: call.name || 'unknown',
      input: this.sanitizeForStorage(call.input) || {},
      output: call.output ? this.sanitizeForStorage(call.output) : undefined,
      providerExecuted: Boolean(call.providerExecuted)
    }));
  }

  /**
   * Generic sanitization for storage (recursively converts Date objects to timestamps)
   */
  private sanitizeForStorage(data: unknown): Record<string, unknown> | undefined {
    if (!data || typeof data !== 'object') return undefined;
    
    try {
      const sanitized = this.deepSanitizeForConvex(data);
      return Object.keys(sanitized as object).length > 0 ? sanitized as Record<string, unknown> : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Deep sanitization that converts Date objects to timestamps for Convex compatibility
   */
  private deepSanitizeForConvex(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (data instanceof Date) {
      return data.getTime(); // Convert Date to timestamp
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.deepSanitizeForConvex(item));
    }
    
    if (typeof data === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.deepSanitizeForConvex(value);
      }
      return result;
    }
    
    return data;
  }


  /**
   * Detect provider cache hits from response metadata
   */
  private detectProviderCacheHit(_request: any, response: any): {
    hit: boolean;
    provider: 'anthropic' | 'openai' | 'other';
    cachedTokens?: number;
    cacheType?: 'ephemeral' | 'persistent' | 'automatic';
  } | null {
    if (!response || typeof response !== 'object') return null;

    const providerMetadata = response.providerMetadata;
    if (!providerMetadata || typeof providerMetadata !== 'object') return null;

    // Check for Anthropic cache hits
    if (providerMetadata.anthropic) {
      const cachedTokens = providerMetadata.anthropic.cachedInputTokens || 0;
      if (cachedTokens > 0) {
        return {
          hit: true,
          provider: 'anthropic',
          cachedTokens,
          cacheType: 'ephemeral' // Anthropic uses ephemeral caching
        };
      }
    }

    // Check for OpenAI cache hits
    if (providerMetadata.openai) {
      const cachedTokens = providerMetadata.openai.cachedPromptTokens || 
                          providerMetadata.openai.cached_tokens || 0;
      if (cachedTokens > 0) {
        return {
          hit: true,
          provider: 'openai',
          cachedTokens,
          cacheType: 'automatic' // OpenAI uses automatic caching
        };
      }
    }

    // Check for other providers with generic cache indicators
    for (const [, providerValue] of Object.entries(providerMetadata)) {
      if (typeof providerValue === 'object' && providerValue !== null) {
        const pv = providerValue as Record<string, any>;
        const cachedTokens = pv.cachedTokens || pv.cached_tokens || pv.cachedInputTokens || 0;
        if (cachedTokens > 0) {
          return {
            hit: true,
            provider: 'other',
            cachedTokens,
            cacheType: 'automatic'
          };
        }
      }
    }

    return null;
  }
}