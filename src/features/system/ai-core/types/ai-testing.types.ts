// src/core/types/ai-testing.types.ts
import { Id } from "@/convex/_generated/dataModel";
import type { ModelProvider } from './ai-models.types';
import type { AIOperationType, TokenUsage } from './ai-core.types';
import type { LanguageModelV2FinishReason, LanguageModelV2CallWarning } from '@ai-sdk/provider';

export type TestType = 
  | 'text_generation'
  | 'object_generation'
  | 'embedding'
  | 'image_generation'
  | 'speech'
  | 'transcription'
  | 'streaming'
  | 'tool_calling'
  | 'caching'
  | 'multimodal'
  | 'error_handling';

export type TestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TestConfiguration {
  id: string;
  name: string;
  description: string;
  type: TestType;
  modelId: string;
  parameters: TestParameters;
  expectedResults?: ExpectedResults;
  iterations?: number;
  timeout?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestParameters {
  // Common parameters
  prompt?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  
  // Object generation specific
  schema?: object;
  outputMode?: 'object' | 'array' | 'enum';
  
  // Image generation specific
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  negativePrompt?: string;
  
  // Speech specific
  voice?: string;
  speed?: number;
  format?: 'mp3' | 'wav' | 'opus' | 'flac';
  
  // Transcription specific
  language?: string;
  transcriptionFormat?: 'text' | 'json' | 'srt' | 'vtt';
  
  // Tool calling specific
  tools?: Array<{
    name: string;
    description: string;
    inputSchema: object;
  }>;
  
  // Caching specific
  enableCaching?: boolean;
  contextLength?: number;
  context?: string;
  
  // Streaming specific
  streamingMode?: boolean;
  
  // Custom parameters
  [key: string]: unknown;
}

export interface ExpectedResults {
  minTokens?: number;
  maxTokens?: number;
  maxLatency?: number;
  maxCost?: number;
  requiredFinishReasons?: LanguageModelV2FinishReason[];
  forbiddenFinishReasons?: LanguageModelV2FinishReason[];
  outputValidation?: {
    type: 'regex' | 'json_schema' | 'custom';
    pattern?: string;
    schema?: object;
    validator?: string; // Function name or code
  };
  performanceThresholds?: {
    minTokensPerSecond?: number;
    maxFirstTokenLatency?: number;
    minSuccessRate?: number;
  };
}

export interface TestResult {
  id: string;
  testConfigId: string;
  testRunId: string;
  modelId: string;
  provider: ModelProvider;
  status: TestStatus;

  // Request data
  prompt: string;
  systemPrompt?: string;
  parameters: TestParameters;

  // Response data
  response?: string | object;
  usage: TokenUsage;
  cost: number;
  latencyMs: number;
  finishReason?: LanguageModelV2FinishReason;
  warnings: LanguageModelV2CallWarning[];
  logId?: Id<"aiLogs">;
  
  // Test-specific metrics
  firstTokenLatencyMs?: number;
  tokensPerSecond?: number;
  wordsPerMinute?: number;
  
  // Validation results
  validationResults?: ValidationResults;
  
  // Error information
  error?: {
    message: string;
    type: string;
    code?: string;
    stack?: string;
    details?: {
      originalMessage?: string;
      provider?: string;
      operation?: string;
      technicalDetails?: string;
      timestamp?: string;
      cause?: unknown;
    };
  };
  
  // Metadata
  metadata: {
    iteration: number;
    testRunStartTime: Date;
    userAgent?: string;
    sdkVersion?: string;
    [key: string]: unknown;
  };
  
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface ValidationResults {
  passed: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    expected?: unknown;
    actual?: unknown;
    message?: string;
  }>;
  score?: number; // 0-100
  details?: {
    tokenValidation?: boolean;
    latencyValidation?: boolean;
    costValidation?: boolean;
    outputValidation?: boolean;
    performanceValidation?: boolean;
  };
}

export interface TestRun {
  id: string;
  name: string;
  description?: string;
  testConfigs: string[]; // TestConfiguration IDs
  status: TestStatus;
  totalTests: number;
  completedTests: number;
  passedTests: number;
  failedTests: number;
  
  // Aggregated metrics
  totalCost: number;
  totalTokens: number;
  avgLatency: number;
  avgTokensPerSecond?: number;
  
  // Test execution settings
  parallel?: boolean;
  maxConcurrency?: number;
  stopOnFailure?: boolean;
  
  // Metadata
  createdBy: Id<"userProfiles">;
  environment?: 'development' | 'staging' | 'production';
  tags?: string[];
  
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testConfigurations: TestConfiguration[];
  schedule?: TestSchedule;
  
  // Suite-level settings
  defaultParameters?: Partial<TestParameters>;
  globalExpectedResults?: Partial<ExpectedResults>;
  
  // Metadata
  createdBy: Id<"userProfiles">;
  tags?: string[];
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSchedule {
  enabled: boolean;
  cronExpression: string;
  timezone: string;
  nextRun?: Date;
  lastRun?: Date;
}

export interface TestComparison {
  baselineRunId: string;
  comparisonRunId: string;
  results: Array<{
    testConfigId: string;
    testName: string;
    baseline: TestMetrics;
    comparison: TestMetrics;
    diff: TestMetricsDiff;
    regression?: boolean;
  }>;
  summary: {
    totalComparisons: number;
    improvements: number;
    regressions: number;
    noChange: number;
    significantChanges: number;
  };
}

export interface TestMetrics {
  avgLatency: number;
  avgCost: number;
  avgTokens: number;
  successRate: number;
  avgTokensPerSecond?: number;
  avgFirstTokenLatency?: number;
}

export interface TestMetricsDiff {
  latencyChange: number; // percentage
  costChange: number; // percentage
  tokenChange: number; // percentage
  successRateChange: number; // percentage
  tokensPerSecondChange?: number; // percentage
  firstTokenLatencyChange?: number; // percentage
}

export interface TestFilter {
  status?: TestStatus[];
  testType?: TestType[];
  modelId?: string[];
  provider?: ModelProvider[];
  createdBy?: Id<"userProfiles">[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  sort?: {
    field: 'createdAt' | 'name' | 'status' | 'totalTests' | 'passedTests' | 'avgLatency' | 'totalCost';
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface TestAnalytics {
  overview: {
    totalTests: number;
    totalRuns: number;
    avgSuccessRate: number;
    avgLatency: number;
    totalCost: number;
  };
  
  trendsOverTime: Array<{
    date: string;
    testsRun: number;
    successRate: number;
    avgLatency: number;
    avgCost: number;
  }>;
  
  modelPerformance: Array<{
    modelId: string;
    provider: ModelProvider;
    testsRun: number;
    successRate: number;
    avgLatency: number;
    avgCost: number;
    avgTokensPerSecond?: number;
  }>;
  
  testTypeBreakdown: Array<{
    testType: TestType;
    count: number;
    successRate: number;
    avgLatency: number;
  }>;
  
  errorPatterns: Array<{
    errorType: string;
    count: number;
    recentExamples: string[];
  }>;
}