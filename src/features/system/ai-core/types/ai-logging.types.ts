// src/core/types/ai-logging.types.ts
import type { 
  LanguageModelV2Usage,
  LanguageModelV2FinishReason,
  LanguageModelV2CallWarning,
  SharedV2ProviderMetadata,
  LanguageModelV2ResponseMetadata
} from '@ai-sdk/provider';
import type { ModelProvider } from './ai-models.types';
import type { AIOperationType, AIToolCall, AIFile, RequestMetadata, GatewayMetadata } from './ai-core.types';
import { Id } from "@/convex/_generated/dataModel";

export interface AIUsageLog {
  _id: Id<"aiLogs">;
  publicId: string;
  userId: Id<"userProfiles">;
  modelId: string;
  provider: ModelProvider;
  requestType: AIOperationType;
  
  // Request data
  prompt: string;
  systemPrompt?: string;
  parameters: LogParameters;

  // Response data
  response?: string;
  usage: LanguageModelV2Usage;
  finishReason?: LanguageModelV2FinishReason;
  warnings: LanguageModelV2CallWarning[];
  
  // Provider metadata
  providerMetadata?: SharedV2ProviderMetadata;
  responseMetadata?: LanguageModelV2ResponseMetadata;
  gatewayMetadata?: GatewayMetadata;
  
  // Tool calls and files
  toolCalls?: AIToolCall[];
  files?: AIFile[];
  
  // Performance and cost
  cost: number;
  latencyMs: number;
  
  // Status and errors
  success: boolean;
  errorMessage?: string;
  errorType?: string;
  retryCount?: number;
  
  // Request/Response metadata
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: object;
  responseBody?: object;
  
  // Session and context
  metadata: RequestMetadata;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LogParameters {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  responseFormat?: {
    type: 'text' | 'json';
    schema?: object;
  };
  tools?: Array<{
    type: string;
    name: string;
    description?: string;
    inputSchema?: object;
  }>;
  schema?: object;
  enableCaching?: boolean;
  contextLength?: number;
  [key: string]: unknown;
}

export interface AIUsageFilter {
  userId?: Id<"userProfiles">;
  modelId?: string[];
  provider?: ModelProvider[];
  requestType?: AIOperationType[];
  success?: boolean;
  finishReason?: LanguageModelV2FinishReason[];
  hasToolCalls?: boolean;
  hasFiles?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  costRange?: {
    min: number;
    max: number;
  };
  latencyRange?: {
    min: number;
    max: number;
  };
  tokenRange?: {
    min?: number;
    max?: number;
  };
  search?: string;
  sort?: {
    field: 'createdAt' | 'cost' | 'latencyMs' | 'usage.totalTokens';
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface AIUsageStats {
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
    provider: ModelProvider;
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
    finishReason: LanguageModelV2FinishReason;
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
  modelCounts?: Record<string, number>;
  providerCounts?: Record<string, number>;
  requestTypeCounts?: Record<string, number>;
}

export interface LogQueryResult {
  logs: AIUsageLog[];
  total: number;
  hasMore: boolean;
}

export interface UsageFilters {
  userId?: Id<"userProfiles">;
  dateRange?: {
    start: Date;
    end: Date;
  };
  modelId?: string[];
  provider?: ModelProvider[];
}

export interface GatewayResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: number;
    provider?: string;
    cached?: boolean;
    fallback?: boolean;
    reason?: string;
    traceId?: string;
    processingTimeMs?: number;
    cachingEnabled?: boolean;
    [key: string]: unknown;
  };
}