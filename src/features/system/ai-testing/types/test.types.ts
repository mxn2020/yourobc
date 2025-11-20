// src/features/ai-testing/types/test.types.ts
import type { 
  TestType, 
  TestConfiguration, 
  TestParameters, 
  ExpectedResults 
} from '@/features/boilerplate/ai-core/types';
import type { ModelProvider } from '@/features/boilerplate/ai-core/types';
import { Id } from "@/convex/_generated/dataModel";

export interface TestFormData {
  name: string;
  description: string;
  type: TestType;
  modelId: string;
  parameters: TestParameters;
  expectedResults?: ExpectedResults;
  iterations: number;
  timeout: number;
}

export interface TestExecutionRequest {
  configurations: TestConfiguration[];
  concurrentLimit?: number;
  metadata?: {
    batchId?: string;
    userId?: Id<"userProfiles">;
    sessionId?: string;
  };
}

export interface TestComparisonConfig {
  baselineModelId: string;
  comparisonModels: string[];
  testParameters: TestParameters;
  iterations?: number;
}

export interface ParameterTuningConfig {
  modelId: string;
  baseParameters: TestParameters;
  tuningParameters: Array<{
    name: keyof TestParameters;
    values: unknown[];
  }>;
  testPrompt: string;
}

export interface BatchTestConfig {
  modelIds: string[];
  testCases: Array<{
    name: string;
    prompt: string;
    expectedOutput?: string;
  }>;
  parameters: TestParameters;
}

export type TestViewMode = 'grid' | 'list' | 'timeline';
export type TestSortField = 'createdAt' | 'name' | 'status' | 'duration' | 'cost';
export type TestFilterStatus = 'all' | 'running' | 'completed' | 'failed';