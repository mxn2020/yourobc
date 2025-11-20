// src/core/types/ai-models.types.ts
import { Id } from "@/convex/_generated/dataModel";

export type ModelType = 'language' | 'embedding' | 'image' | 'multimodal';

export type ModelProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'xai' 
  | 'meta' 
  | 'mistral' 
  | 'cohere' 
  | 'bedrock' 
  | 'vertex' 
  | 'azure' 
  | 'groq' 
  | 'deepseek' 
  | 'perplexity' 
  | 'fireworks' 
  | 'cerebras';

export type ModelAvailability = 'available' | 'limited' | 'deprecated';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ModelProvider;
  type: ModelType;
  description: string;
  contextWindow: number;
  maxOutputTokens?: number;
  pricing: ModelPricing;
  capabilities: ModelCapabilities;
  supportedFormats?: string[];
  latencyP95?: number;
  availability: ModelAvailability;
  benchmarks?: ModelBenchmarks;
  limitations?: string[];
  useCases: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModelPricing {
  input: number;
  output: number;
  cachedInput?: number;
  cacheCreationInput?: number;
  currency: string;
  unit: string;
}

export interface ModelCapabilities {
  functionCalling?: boolean;
  jsonMode?: boolean;
  vision?: boolean;
  codeGeneration?: boolean;
  reasoning?: boolean;
  multilingual?: boolean;
  streaming?: boolean;
  multimodal?: boolean;
}

export interface ModelBenchmarks {
  mmlu?: number;
  hellaswag?: number;
  humaneval?: number;
  truthfulqa?: number;
  arc?: number;
  gsm8k?: number;
}

export interface ModelFilter {
  search?: string;
  type?: ModelType[];
  provider?: ModelProvider[];
  availability?: ModelAvailability[];
  contextWindowMin?: number;
  contextWindowMax?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  capabilities?: string[];
  tags?: string[];
}

export interface ModelSort {
  field: 'name' | 'provider' | 'pricing.input' | 'contextWindow' | 'createdAt' | 'benchmarks.mmlu';
  direction: 'asc' | 'desc';
}

export interface ModelCategory {
  id: ModelType;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface ModelPreferences {
  id: string;
  userId: Id<"userProfiles">;
  defaultModels: {
    language: string;
    embedding: string;
    image: string;
  };
  providerConfigs: ModelProviderConfig[];
  routingStrategy: 'priority' | 'cost' | 'latency' | 'quality';
  fallbackChain: string[];
  costLimits: {
    dailyLimit: number;
    monthlyLimit: number;
    alertThreshold: number;
  };
  testingConfig: {
    defaultTemperature: number;
    defaultMaxTokens: number;
    defaultTopP: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelProviderConfig {
  id: string;
  provider: ModelProvider;
  name: string;
  enabled: boolean;
  priority: number;
  apiKey?: string;
  baseUrl?: string;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  healthStatus: 'healthy' | 'degraded' | 'down';
  lastHealthCheck: string;
}

export interface ModelTestRequest {
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  metadata?: {
    userId?: Id<"userProfiles">;
    sessionId?: string;
    testType?: string;
  };
}

export interface ModelTestResponse {
  id: string;
  modelId: string;
  provider: ModelProvider;
  prompt: string;
  response: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latencyMs: number;
  timestamp: Date;
  metadata?: {
    finishReason?: string;
    warnings?: unknown[];
  };
}

export interface ModelComparison {
  models: ModelInfo[];
  criteria: {
    performance: boolean;
    cost: boolean;
    capabilities: boolean;
    benchmarks: boolean;
  };
}

export interface CostEstimate {
  modelId: string;
  estimatedTokens: number;
  estimatedCost: number;
  breakdown: {
    inputCost: number;
    outputCost: number;
  };
  dailyProjection?: number;
  monthlyProjection?: number;
}

export interface ProviderHealth {
  provider: ModelProvider;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  uptimePercentage: number;
  errorRate: number;
  lastCheck: Date;
  issues?: string[];
}