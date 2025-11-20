// src/features/ai-testing/types/test-results.types.ts
import type { 
  TestResult, 
  TestStatus, 
  TestMetrics,
  ValidationResults 
} from '@/features/boilerplate/ai-core/types';
import type { TokenUsage } from '@/features/boilerplate/ai-core/types';
import type { ModelProvider } from '@/features/boilerplate/ai-core/types';

export interface TestResultSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  runningTests: number;
  avgLatency: number;
  totalCost: number;
  successRate: number;
}

export interface TestExecutionResult {
  id: string;
  status: TestStatus;
  results: TestResult[];
  summary: TestResultSummary;
  startedAt: Date;
  completedAt?: Date;
  duration: number;
  errors: string[];
}

export interface TestComparisonResult {
  modelId: string;
  provider: ModelProvider;
  results: TestResult[];
  metrics: TestMetrics;
  rank: number;
  score: number;
}

export interface ParameterTuningResult {
  parameterName: string;
  parameterValue: unknown;
  results: TestResult[];
  avgLatency: number;
  avgCost: number;
  successRate: number;
  score: number;
}

export interface TestHistoryItem {
  id: string;
  name: string;
  type: string;
  modelId: string;
  status: TestStatus;
  summary: TestResultSummary;
  createdAt: Date;
  completedAt?: Date;
  duration?: number;
}

export interface TestAnalytics {
  testsOverTime: Array<{
    date: string;
    count: number;
    successRate: number;
  }>;
  modelPerformance: Array<{
    modelId: string;
    provider: ModelProvider;
    avgLatency: number;
    avgCost: number;
    successRate: number;
    testCount: number;
  }>;
  costTrends: Array<{
    date: string;
    totalCost: number;
    avgCostPerTest: number;
  }>;
}