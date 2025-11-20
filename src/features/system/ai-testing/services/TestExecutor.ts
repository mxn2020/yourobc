// src/features/ai-testing/services/TestExecutor.ts
import type { TestConfiguration, TestResult, TestStatus } from '@/features/system/ai-core/types';
import type { 
  TestExecutionRequest, 
  TestComparisonConfig, 
  ParameterTuningConfig, 
  BatchTestConfig 
} from '../types/test.types';
import type { TestExecutionResult } from '../types/test-results.types';
import { addInternalFields } from '@/features/system/ai-core/utils';

// Individual test type configurations
export interface TextGenerationConfig {
  name: string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    seed?: number;
  };
}

export interface StreamingConfig {
  name: string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    seed?: number;
  };
}

export interface ObjectGenerationConfig {
  name: string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  schema: any;
  outputMode?: 'object' | 'array';
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface EmbeddingConfig {
  name: string;
  modelId: string;
  values: string[];
  mode?: 'single' | 'batch';
  parameters?: {
    maxRetries?: number;
  };
}

export interface ImageGenerationConfig {
  name: string;
  modelId: string;
  prompt: string;
  negativePrompt?: string;
  numberOfImages?: number;
  size?: string;
  aspectRatio?: string;
  seed?: number;
  parameters?: {
    maxRetries?: number;
  };
}

export class TestExecutor {
  async executeTests(request: TestExecutionRequest): Promise<TestExecutionResult> {
    const response = await fetch('/api/ai/test/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Test execution failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Test execution failed');
    }

    return this.transformExecutionResult(data.data);
  }

  async executeSingleTest(config: TestConfiguration): Promise<TestResult> {
    const response = await fetch('/api/ai/test/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        configuration: config,
        session_id: crypto.randomUUID(),
        feature: 'ai_testing',
        disable_caching: true
      })
    });

    if (!response.ok) {
      throw new Error(`Test execution failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Test execution failed');
    }

    return this.transformTestResult(data.data);
  }

  // Individual test type execution methods
  async executeTextGeneration(config: TextGenerationConfig): Promise<TestResult> {
    const testConfig: TestConfiguration = {
      id: crypto.randomUUID(),
      name: config.name,
      description: `Text generation test for ${config.modelId}`,
      type: 'text_generation',
      modelId: config.modelId,
       parameters: addInternalFields({
      prompt: config.prompt,
      systemPrompt: config.systemPrompt,
      ...config.parameters
    }),
      iterations: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.executeSingleTest(testConfig);
  }

  async executeTextStreaming(config: StreamingConfig): Promise<ReadableStream> {
    const response = await fetch('/api/ai/generate/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: config.modelId,
        prompt: config.prompt,
        systemPrompt: config.systemPrompt,
        parameters: {
          ...config.parameters,
          _testTimestamp: Date.now(),
          _testId: crypto.randomUUID()
        },
        feature: 'text_streaming_test'
      })
    });

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body available for streaming');
    }

    return response.body;
  }

  async executeObjectGeneration(config: ObjectGenerationConfig): Promise<TestResult> {
    const testConfig: TestConfiguration = {
      id: crypto.randomUUID(),
      name: config.name,
      description: `Object generation test for ${config.modelId}`,
      type: 'object_generation',
      modelId: config.modelId,
      parameters: {
        prompt: config.prompt,
        systemPrompt: config.systemPrompt,
        schema: config.schema,
        outputMode: config.outputMode,
        ...config.parameters,
        _testTimestamp: Date.now(),
        _testId: crypto.randomUUID()
      },
      iterations: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.executeSingleTest(testConfig);
  }

  async executeObjectStreaming(config: ObjectGenerationConfig): Promise<ReadableStream> {
    const response = await fetch('/api/ai/generate/stream-object', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: config.modelId,
        prompt: config.prompt,
        systemPrompt: config.systemPrompt,
        schema: config.schema,
        outputMode: config.outputMode,
        parameters: {
          ...config.parameters,
          _testTimestamp: Date.now(),
          _testId: crypto.randomUUID()
        },
        feature: 'object_streaming_test'
      })
    });

    if (!response.ok) {
      throw new Error(`Object streaming failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body available for streaming');
    }

    return response.body;
  }

  async executeEmbedding(config: EmbeddingConfig): Promise<any> {
    const response = await fetch('/api/ai/generate/embedding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: config.modelId,
        text: config.values.length === 1 ? config.values[0] : config.values,
        parameters: {
          ...config.parameters,
          _testTimestamp: Date.now(),
          _testId: crypto.randomUUID()
        },
        feature: 'embedding_test'
      })
    });

    if (!response.ok) {
      throw new Error(`Embedding generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Embedding generation failed');
    }

    return data.data;
  }

  async executeImageGeneration(config: ImageGenerationConfig): Promise<any> {
    const response = await fetch('/api/ai/generate/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: config.modelId,
        prompt: config.prompt,
        negativePrompt: config.negativePrompt,
        n: config.numberOfImages || 1,
        ...(config.size && { size: config.size }),
        ...(config.aspectRatio && { aspectRatio: config.aspectRatio }),
        ...(config.seed && { seed: config.seed }),
        parameters: {
          ...config.parameters,
          _testTimestamp: Date.now(),
          _testId: crypto.randomUUID()
        },
        feature: 'image_generation_test'
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Image generation failed');
    }

    return data.data;
  }

  async executeComparison(config: TestComparisonConfig): Promise<TestResult[]> {
    const configurations = this.createComparisonConfigurations(config);
    const response = await fetch('/api/ai/test/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configurations,
        concurrentLimit: Math.min(configurations.length, 8)
      })
    });

    if (!response.ok) {
      throw new Error(`Test execution failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Test execution failed');
    }

    return data.data;
  }

  async executeParameterTuning(config: ParameterTuningConfig): Promise<TestResult[]> {
    const configurations = this.createParameterTuningConfigurations(config);
    const response = await fetch('/api/ai/test/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configurations,
        concurrentLimit: Math.min(configurations.length, 5)
      })
    });

    if (!response.ok) {
      throw new Error(`Test execution failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Test execution failed');
    }

    return data.data;
  }

  async executeBatchTest(config: BatchTestConfig): Promise<TestResult[]> {
    const configurations = this.createBatchTestConfigurations(config);
    const response = await fetch('/api/ai/test/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configurations,
        concurrentLimit: Math.min(configurations.length, 5)
      })
    });

    if (!response.ok) {
      throw new Error(`Test execution failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Test execution failed');
    }

    return data.data;
  }

  private createComparisonConfigurations(config: TestComparisonConfig): TestConfiguration[] {
    const allModels = [config.baselineModelId, ...config.comparisonModels];
    return allModels.map(modelId => ({
      id: crypto.randomUUID(),
      name: `Model Comparison - ${modelId}`,
      description: `Comparing model performance for ${modelId}`,
      type: 'text_generation',
      modelId,
      parameters: config.testParameters,
      iterations: config.iterations || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private createParameterTuningConfigurations(config: ParameterTuningConfig): TestConfiguration[] {
    const configurations: TestConfiguration[] = [];
    
    const generateCombinations = (params: typeof config.tuningParameters, index = 0, current: Record<string, unknown> = {}): void => {
      if (index >= params.length) {
        configurations.push({
          id: crypto.randomUUID(),
          name: `Parameter Tuning - ${Object.entries(current).map(([k, v]) => `${k}=${v}`).join(', ')}`,
          description: 'Parameter tuning test configuration',
          type: 'text_generation',
          modelId: config.modelId,
          parameters: {
            ...config.baseParameters,
            ...current,
            prompt: config.testPrompt
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return;
      }

      const param = params[index];
      for (const value of param.values) {
        generateCombinations(params, index + 1, { ...current, [param.name]: value });
      }
    };

    generateCombinations(config.tuningParameters);
    return configurations;
  }

  private createBatchTestConfigurations(config: BatchTestConfig): TestConfiguration[] {
    const configurations: TestConfiguration[] = [];
    
    for (const modelId of config.modelIds) {
      for (const testCase of config.testCases) {
        configurations.push({
          id: crypto.randomUUID(),
          name: `${testCase.name} - ${modelId}`,
          description: `Batch test: ${testCase.name} on ${modelId}`,
          type: 'text_generation',
          modelId,
          parameters: {
            ...config.parameters,
            prompt: testCase.prompt
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    return configurations;
  }

  private transformTestResult(data: any): TestResult {
    return {
      ...data,
      startedAt: typeof data.startedAt === 'string' ? new Date(data.startedAt) : data.startedAt,
      completedAt: data.completedAt ? (typeof data.completedAt === 'string' ? new Date(data.completedAt) : data.completedAt) : undefined,
      createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt,
      metadata: {
        ...data.metadata,
        testRunStartTime: data.metadata?.testRunStartTime ? 
          (typeof data.metadata.testRunStartTime === 'string' ? new Date(data.metadata.testRunStartTime) : data.metadata.testRunStartTime) : 
          new Date()
      }
    };
  }

  private transformExecutionResult(data: unknown): TestExecutionResult {
    // Type guard to safely handle unknown data
    const isValidResult = (obj: unknown): obj is {
      id?: string;
      status?: TestStatus;
      results?: TestResult[];
      startedAt?: string | number;
      completedAt?: string | number;
      duration?: number;
      errors?: string[];
    } => {
      return obj !== null && typeof obj === 'object';
    };

    const result = isValidResult(data) ? data : {};
    return {
      id: result.id || crypto.randomUUID(),
      status: (result.status && ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(result.status)) 
        ? result.status as TestStatus 
        : 'completed',
      results: result.results || [],
      summary: {
        totalTests: result.results?.length || 0,
        passedTests: result.results?.filter((r: TestResult) => r.status === 'completed').length || 0,
        failedTests: result.results?.filter((r: TestResult) => r.status === 'failed').length || 0,
        runningTests: result.results?.filter((r: TestResult) => r.status === 'running').length || 0,
        avgLatency: this.calculateAverage(result.results?.map((r: TestResult) => r.latencyMs) || []),
        totalCost: result.results?.reduce((sum: number, r: TestResult) => sum + r.cost, 0) || 0,
        successRate: (result.results && result.results.length > 0) 
          ? (result.results.filter((r: TestResult) => r.status === 'completed').length / result.results.length) * 100 
          : 0
      },
      startedAt: new Date(result.startedAt || Date.now()),
      completedAt: result.completedAt ? new Date(result.completedAt) : undefined,
      duration: result.duration || 0,
      errors: result.errors || []
    };
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
}