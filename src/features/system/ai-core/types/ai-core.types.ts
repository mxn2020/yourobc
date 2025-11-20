// src/core/types/ai-core.types.ts
import { Id } from "@/convex/_generated/dataModel";

import type { 
  LanguageModelV2Usage,
  LanguageModelV2FinishReason,
  LanguageModelV2CallWarning,
  SharedV2ProviderMetadata,
  LanguageModelV2ResponseMetadata
} from '@ai-sdk/provider';

export type AIOperationType = 
  | 'text_generation'
  | 'streaming'
  | 'object_generation'
  | 'embedding'
  | 'image_generation'
  | 'speech'
  | 'transcription'
  | 'test';

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
    schema?: object;
  };
  tools?: AITool[];
  enableCaching?: boolean;
  contextLength?: number;
}

export interface AITool {
  type: string;
  name: string;
  description?: string;
  inputSchema?: object;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
}

export interface AIRequest {
  requestId: string;
  userId: Id<"userProfiles">;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters: AIParameters;
  metadata: RequestMetadata;
}

export interface CacheInfo {
  // Application-level cache (CacheManager.ts)
  applicationCache?: {
    hit: boolean;
    key?: string;
    ttl?: number;
  };
  
  // Provider-level prompt caching (Anthropic/OpenAI)
  providerCache?: {
    hit: boolean;
    provider: 'anthropic' | 'openai' | 'other';
    cachedTokens?: number;
    cacheType?: 'ephemeral' | 'persistent' | 'automatic';
  };
  
  // Legacy field for backward compatibility
  cacheHit?: boolean;
}

export interface RequestMetadata {
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  pageUrl?: string;
  feature?: string;
  requestId: string;
  traceId?: string;
  parentRequestId?: string;
  modelVersion?: string;
  sdkVersion?: string;
  providerRequestId?: string;
  
  // Enhanced cache tracking
  cache?: CacheInfo;
  
  // Legacy fields (deprecated but kept for compatibility)
  cacheHit?: boolean;
  cacheWritten?: boolean;
  
  rateLimited?: boolean;
  testRun?: number;
  firstTokenLatency?: number;
  tokensPerSecond?: number;
  wordsPerMinute?: number;
  objectType?: string;
}

export interface AIResponse {
  requestId: string;
  text: string;
  usage: TokenUsage;
  cost: number;
  latency: number;
  finishReason?: LanguageModelV2FinishReason;
  cached?: boolean;
  warnings: LanguageModelV2CallWarning[];
  providerMetadata?: SharedV2ProviderMetadata;
  responseMetadata?: LanguageModelV2ResponseMetadata;
  gatewayMetadata?: GatewayMetadata;
  toolCalls?: AIToolCall[];
  files?: AIFile[];
}

export interface GatewayMetadata {
  routing?: {
    originalModelId: string;
    resolvedProvider: string;
    resolvedProviderApiModelId: string;
    internalResolvedModelId: string;
    fallbacksAvailable: string[];
    internalReasoning: string;
    planningReasoning: string;
    canonicalSlug: string;
    finalProvider: string;
    attempts: RoutingAttempt[];
  };
  cost?: string;
}

export interface RoutingAttempt {
  provider: string;
  internalModelId: string;
  providerApiModelId: string;
  credentialType: string;
  success: boolean;
  startTime: number;
  endTime: number;
  error?: string;
}

export interface AIToolCall {
  id: string;
  name: string;
  input: object;
  output?: object;
  error?: string;
  providerExecuted?: boolean;
}

export interface AIFile {
  type: 'input' | 'output';
  mediaType: string;
  data: string; // base64 or URL
  filename?: string;
}

export interface AIGenerateRequest {
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters?: AIParameters;
  metadata?: Partial<RequestMetadata>;
}

export interface AIGenerateResponse {
  text: string;
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  finishReason?: LanguageModelV2FinishReason;
  warnings: LanguageModelV2CallWarning[];
  toolCalls?: AIToolCall[];
  files?: AIFile[];
  cached?: boolean;
  providerMetadata?: SharedV2ProviderMetadata;
  responseMetadata?: LanguageModelV2ResponseMetadata;
  gatewayMetadata?: GatewayMetadata;
  logId?: Id<"aiLogs">;
}

export interface AIObjectRequest extends AIGenerateRequest {
  schema: object;
  outputMode?: 'object' | 'array' | 'enum';
}

export interface AIObjectResponse {
  object: unknown;
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  finishReason?: LanguageModelV2FinishReason;
  logId?: Id<"aiLogs">;
}

export interface AIImageRequest {
  modelId: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  metadata?: Partial<RequestMetadata>;
}

export interface AIImageResponse {
  images: Array<{
    url?: string;
    base64?: string;
    width: number;
    height: number;
  }>;
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  seed?: number;
  logId?: Id<"aiLogs">;
}

export interface AIEmbeddingRequest {
  modelId: string;
  text: string | string[];
  metadata?: Partial<RequestMetadata>;
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  logId?: Id<"aiLogs">;
}

export interface AISpeechRequest {
  modelId: string;
  text: string;
  voice?: string;
  speed?: number;
  format?: 'mp3' | 'wav' | 'opus' | 'flac';
  metadata?: Partial<RequestMetadata>;
}

export interface AISpeechResponse {
  audio: string; // base64 encoded audio
  format: string;
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  logId?: Id<"aiLogs">;
}

export interface AITranscriptionRequest {
  modelId: string;
  audio: string; // base64 encoded audio or file path
  language?: string;
  prompt?: string;
  temperature?: number;
  format?: 'text' | 'json' | 'srt' | 'vtt';
  metadata?: Partial<RequestMetadata>;
}

export interface AITranscriptionResponse {
  text: string;
  language?: string;
  segments?: TranscriptionSegment[];
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  logId?: Id<"aiLogs">;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence?: number;
}

export interface AIErrorType {
  message: string;
  type: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface Warning {
  type: string;
  message: string;
  details?: Record<string, unknown>;
}