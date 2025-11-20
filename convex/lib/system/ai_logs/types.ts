// convex/lib/boilerplate/ai_logs/types.ts

import { Doc, Id } from '@/generated/dataModel';

/**
 * AI Log document type from Convex database
 */
export type AILog = Doc<'aiLogs'>;
export type AILogId = Id<'aiLogs'>;

/**
 * Filter parameters for querying AI logs
 */
export interface AILogFilters {
  search?: string;
  userId?: Id<'userProfiles'>;
  modelId?: string;
  provider?: string;
  requestType?: string;
  success?: boolean;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
  authUserId?: string;
}

/**
 * Response from getAILogs query
 */
export interface AILogsResponse {
  logs: AILog[];
  total: number;
  hasMore: boolean;
}

/**
 * Statistics response from getAILogStats query
 * Matches frontend AIUsageStats interface
 */
export interface AILogStats {
  // Basic metrics
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  successRate: number;
  avgLatency: number;
  avgCostPerToken: number;

  // Time series data
  requestsByDay: Array<{
    date: string;
    requests: number;
    cost: number;
    tokens: number;
    avgLatency: number;
    successRate: number;
  }>;

  // Model performance
  topModels: Array<{
    modelId: string;
    requests: number;
    cost: number;
    tokens: number;
    avgLatency: number;
    successRate: number;
    avgCostPerToken: number;
  }>;

  // Provider breakdown
  providerBreakdown: Array<{
    provider: string;
    requests: number;
    cost: number;
    tokens: number;
    avgLatency: number;
    successRate: number;
    modelsUsed: string[];
  }>;

  // Feature usage
  featureBreakdown: Array<{
    feature: string;
    requests: number;
    cost: number;
    avgLatency: number;
  }>;

  // Error analysis
  errorBreakdown: Array<{
    errorType: string;
    count: number;
    percentage: number;
    recentExamples: string[];
  }>;

  // Finish reason analysis
  finishReasonBreakdown: Array<{
    finishReason: string;
    count: number;
    percentage: number;
  }>;

  // Token usage patterns
  tokenUsage: {
    avgInputTokens: number;
    avgOutputTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    tokenDistribution: Array<{
      range: string;
      count: number;
    }>;
  };
  // Simple count objects for quick lookups
  modelCounts: Record<string, number>;
  providerCounts: Record<string, number>;
  requestTypeCounts: Record<string, number>;
}

/**
 * Parameters for AI requests
 */
export interface AIParameters {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  responseFormat?: {
    type: 'text' | 'json';
    schema?: any;
  };
  tools?: Array<{
    type: string;
    name: string;
    description?: string;
    inputSchema?: any;
  }>;
  schema?: any;
  enableCaching?: boolean;
  contextLength?: number;
}

/**
 * Token usage information
 */
export interface AIUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
}

/**
 * Tool call information
 */
export interface AIToolCall {
  id: string;
  name: string;
  input: any;
  output?: any;
  providerExecuted?: boolean;
}

/**
 * Cache information
 */
export interface AICacheInfo {
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
  cacheHit?: boolean;
}

/**
 * Metadata for AI requests
 */
export interface AIMetadata {
  requestId: string;
  traceId?: string;
  parentRequestId?: string;
  sessionId?: string;
  feature?: string;
  userAgent?: string;
  sdkVersion?: string;
  providerRequestId?: string;
  cacheHit?: boolean;
  rateLimited?: boolean;
  objectType?: string;
  cache?: AICacheInfo;
  cacheWritten?: boolean;
  testRun?: number;
  firstTokenLatency?: number;
  tokensPerSecond?: number;
  wordsPerMinute?: number;
}

/**
 * File information for AI requests
 */
export interface AIFile {
  type: 'input' | 'output';
  mediaType: string;
  data: string;
  filename?: string;
}

/**
 * Data for updating an AI log
 */
export interface UpdateAILogData {
  response?: string;
  usage?: AIUsage;
  finishReason?: string;
  warnings?: any[];
  providerMetadata?: any;
  responseMetadata?: any;
  gatewayMetadata?: any;
  toolCalls?: AIToolCall[];
  files?: AIFile[];
  cost?: number;
  latencyMs?: number;
  success?: boolean;
  errorMessage?: string;
  errorType?: string;
  retryCount?: number;
  requestHeaders?: any;
  responseHeaders?: any;
  requestBody?: any;
  responseBody?: any;
  metadata?: AIMetadata;
}

/**
 * Request type for AI logs
 */
export type AIRequestType =
  | 'text_generation'
  | 'streaming'
  | 'object_generation'
  | 'embedding'
  | 'image_generation'
  | 'speech'
  | 'transcription'
  | 'test';
