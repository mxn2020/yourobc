// src/core/ai/AITestService.ts - Complete test orchestration service

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type { TestConfiguration, TestResult, TestType } from '../types/ai-testing.types';
import type { AITest } from '@/convex/schema';
import { getErrorCode, getErrorDetails } from '../types/extended-error.types';
import type {
  AIGenerateRequest,
  AIObjectRequest,
  AIImageRequest,
  AIEmbeddingRequest,
  AISpeechRequest,
  AITranscriptionRequest
} from '../types/ai-core.types';
import type { ModelProvider } from '../types/ai-models.types';
import { AIService } from './AIService';
import { formatErrorMessage } from '@/features/boilerplate/ai-core/utils';
import { getProviderFromModelId } from '@/features/boilerplate/ai-core/utils';
import { validateTestConfiguration } from '@/features/boilerplate/ai-core/utils';
import { cleanTestParameters } from '@/features/boilerplate/ai-core/utils';
import { Id } from "@/convex/_generated/dataModel";

export interface TestFilter {
  // Note: userId is NOT included here - backend fetches user from JWT token automatically
  publicId?: string;  // For public-facing lookups
  modelId?: string;
  provider?: string;
  type?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  search?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface TestAnalytics {
  totalTests: number;
  totalIterations: number;
  totalCost: number;
  successRate: number;
  avgLatency: number;
  avgCostPerIteration: number;
  testsToday: number;
  testsThisWeek: number;
  testsThisMonth: number;
  modelCounts: Record<string, number>;
  providerCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  recentTests: AITest[];
}

export interface BatchTestOptions {
  configurations: TestConfiguration[];
  concurrentLimit?: number;
  metadata?: Record<string, unknown>;
}

/**
 * AI Test identifier - can be either internal Convex _id or public-facing publicId
 * Following the pattern from projects addon
 */
export type AITestId = Id<"aiTests"> | string;

export class AITestService {
  private convexClient: ConvexHttpClient | null = null;
  private aiService: AIService;

  constructor(convexUrl?: string) {
    this.initializeConvexClient(convexUrl);
    this.aiService = AIService.getInstance();
  }

  private initializeConvexClient(convexUrl?: string): void {
    try {
      const url = convexUrl || process.env.VITE_CONVEX_URL || 'http://localhost:3210';
      if (url) {
        this.convexClient = new ConvexHttpClient(url);
      }
    } catch (error) {
      console.warn('Failed to initialize Convex client for AI Test Service:', error);
      this.convexClient = null;
    }
  }

  /**
   * Helper to determine if an ID is a public ID (string) or internal Convex _id
   * Convex IDs start with lowercase letter (typically 'j'), public IDs don't
   */
  private isPublicId(id: AITestId): boolean {
    return typeof id === 'string' && !id.match(/^[a-z][a-z0-9]{15,}$/);
  }

  /**
   * Execute a single test - handles complete test lifecycle
   * Note: Authentication handled by Convex via JWT session
   */
  async executeTest(
    config: TestConfiguration,
    metadata?: Record<string, unknown>
  ): Promise<TestResult> {
    let databaseTestId: Id<"aiTests"> | null = null;
    const startTime = Date.now();
    const requestId = metadata?.requestId as string || crypto.randomUUID();

    console.log(`[${requestId}] AITestService.executeTest - Starting execution:`, {
      configId: config.id,
      configName: config.name,
      configType: config.type,
      modelId: config.modelId,
      iterations: config.iterations
    });
    
    try {
      // 1. Validate test configuration
      console.log(`[${requestId}] Step 1: Validating test configuration...`);
      const validation = validateTestConfiguration(config);
      if (!validation.valid) {
        console.log(`[${requestId}] Configuration validation failed:`, validation.errors);
        throw new Error(`Invalid test configuration: ${validation.errors.join(', ')}`);
      }
      console.log(`[${requestId}] Configuration validation passed`);

      // 2. Create test record
      console.log(`[${requestId}] Step 2: Creating test record in Convex...`);
      try {
        databaseTestId = await this.createTest(config, {
          ...metadata,
          testRunStartTime: startTime // Use timestamp instead of Date object
        });
        console.log(`[${requestId}] Test record created successfully in Convex`, { databaseTestId });
      } catch (createError) {
        console.error(`[${requestId}] Failed to create test record:`, {
          error: createError instanceof Error ? createError.message : 'Unknown error',
          configId: config.id
        });
        throw createError;
      }

      // 3. Update test status to running
      console.log(`[${requestId}] Step 3: Updating test status to running...`);
      try {
        if (!databaseTestId) {
          throw new Error('Database test ID is null');
        }
        await this.updateTestStatus(databaseTestId, 'running', {
          startedAt: new Date(startTime)
        });
        console.log(`[${requestId}] Test status updated to running successfully`);
      } catch (updateError) {
        console.error(`[${requestId}] Failed to update test status to running:`, {
          error: updateError instanceof Error ? updateError.message : 'Unknown error',
          databaseTestId
        });
        throw updateError;
      }

      // 4. Execute the AI operation through AIService
      console.log(`[${requestId}] Step 4: Executing AI operation...`);
      try {
        const testResult = await this.executeTestOperation(config, metadata);
        console.log(`[${requestId}] AI operation completed successfully:`, {
          resultId: testResult.id,
          status: testResult.status,
          latencyMs: testResult.latencyMs,
          cost: testResult.cost
        });

        // 5. Add test result to the test record
        console.log(`[${requestId}] Step 5: Adding test result to record...`);
        try {
          if (!databaseTestId) {
            throw new Error('Database test ID is null');
          }
          await this.addTestResult(databaseTestId, testResult, testResult.logId);
          console.log(`[${requestId}] Test result added to record successfully`);
        } catch (addResultError) {
          console.error(`[${requestId}] Failed to add test result:`, {
            error: addResultError instanceof Error ? addResultError.message : 'Unknown error',
            databaseTestId,
            resultId: testResult.id
          });
          throw addResultError;
        }

        // 6. Update test status to completed
        console.log(`[${requestId}] Step 6: Updating test status to completed...`);
        try {
          if (!databaseTestId) {
            throw new Error('Database test ID is null');
          }
          await this.updateTestStatus(databaseTestId, 'completed', {
            completedAt: new Date(),
            duration: Date.now() - startTime
          });
          console.log(`[${requestId}] Test status updated to completed successfully`);
        } catch (completeError) {
          console.error(`[${requestId}] Failed to update test status to completed:`, {
            error: completeError instanceof Error ? completeError.message : 'Unknown error',
            databaseTestId
          });
          throw completeError;
        }

        console.log(`[${requestId}] Test execution completed successfully in ${Date.now() - startTime}ms`);
        return testResult;
      } catch (operationError) {
        console.error(`[${requestId}] AI operation failed:`, {
          error: operationError instanceof Error ? operationError.message : 'Unknown error',
          stack: operationError instanceof Error ? operationError.stack : undefined
        });
        throw operationError;
      }

    } catch (error) {
      console.error(`[${requestId}] Test execution failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        databaseTestId,
        duration: Date.now() - startTime
      });

      // Update test status to failed
      console.log(`[${requestId}] Updating test status to failed...`);
      try {
        if (!databaseTestId) {
          throw new Error('Database test ID is null - cannot update test status');
        }
        await this.updateTestStatus(databaseTestId, 'failed', {
          completedAt: new Date(),
          duration: Date.now() - startTime
        });
        console.log(`[${requestId}] Test status updated to failed successfully`);

        // Extract detailed error information
        const errorDetails = getErrorDetails(error);
        const originalError: Error | unknown = errorDetails?.originalError || error;
        const provider = (errorDetails?.provider || getProviderFromModelId(config.modelId)) as ModelProvider;

        // Create enhanced error message for user
        let userFriendlyMessage = error instanceof Error ? error.message : 'Unknown error';
        let detailedMessage = userFriendlyMessage;

        // Check for common validation errors and provide better messages
        if (originalError instanceof Error && originalError.message?.includes('Member must have length greater than or equal to 1')) {
          if (originalError.message.includes('system')) {
            userFriendlyMessage = `System prompt cannot be empty for model ${config.modelId}. Please provide a valid system prompt.`;
            detailedMessage = `Amazon Bedrock validation error: ${originalError.message}`;
          } else {
            userFriendlyMessage = `Input cannot be empty for model ${config.modelId}. Please provide valid input text.`;
            detailedMessage = `Amazon Bedrock validation error: ${originalError.message}`;
          }
        } else if (originalError instanceof Error && originalError.message?.includes('validation error')) {
          userFriendlyMessage = `Model ${config.modelId} validation failed. Please check your input parameters.`;
          detailedMessage = originalError.message;
        }

        // Create a failed test result
        const failedResult: TestResult = {
          id: crypto.randomUUID(),
          testConfigId: config.id,
          testRunId: metadata?.testRunId as string || crypto.randomUUID(),
          modelId: config.modelId,
          provider: provider,
          status: 'failed',
          prompt: config.parameters.prompt || '',
          systemPrompt: config.parameters.systemPrompt,
          parameters: config.parameters,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          cost: 0,
          latencyMs: Date.now() - startTime,
          warnings: [],
          error: {
            message: userFriendlyMessage,
            type: error instanceof Error ? error.constructor.name : 'UnknownError',
            code: getErrorCode(error),
            stack: error instanceof Error ? error.stack : undefined,
            // Add detailed error information
            details: {
              originalMessage: originalError instanceof Error ? originalError.message : undefined,
              provider: provider,
              operation: errorDetails?.operation,
              technicalDetails: detailedMessage,
              timestamp: errorDetails?.timestamp,
              cause: originalError instanceof Error && 'cause' in originalError ? (originalError as Error & { cause?: unknown }).cause : undefined
            }
          },
          metadata: {
            iteration: 1,
            testRunStartTime: metadata?.testRunStartTime ? new Date(metadata.testRunStartTime as number) : new Date(startTime),
            ...metadata
          },
          startedAt: new Date(startTime),
          completedAt: new Date(),
          createdAt: new Date(startTime)
        };

        // Add the failed result to the test record
        console.log(`[${requestId}] Adding failed test result to record...`);
        try {
          if (!databaseTestId) {
            throw new Error('Database test ID is null');
          }
          await this.addTestResult(databaseTestId, failedResult, failedResult.logId);
          console.log(`[${requestId}] Failed test result added to record successfully`);
        } catch (addFailedError) {
          console.error(`[${requestId}] Failed to add failed test result:`, {
            error: addFailedError instanceof Error ? addFailedError.message : 'Unknown error'
          });
        }

        console.log(`[${requestId}] Returning failed test result`);
        return failedResult;
      } catch (statusError) {
        console.error(`[${requestId}] Failed to update test status to failed:`, {
          error: statusError instanceof Error ? statusError.message : 'Unknown error',
          databaseTestId
        });
      }
      throw error;
    }
  }

  /**
   * Execute batch tests with proper orchestration
   * Note: Authentication handled by Convex via JWT session
   */
  async executeBatchTests(
    options: BatchTestOptions
  ): Promise<TestResult[]> {
    const { configurations, concurrentLimit = 3, metadata = {} } = options;
    const results: TestResult[] = [];
    const batchId = crypto.randomUUID();

    // Create all test records first
    for (const config of configurations) {
      await this.createTest(config, {
        ...metadata,
        batchId,
        batchSize: configurations.length,
        totalConfigs: configurations.length
      });
    }

    // Process tests in batches based on concurrency limit
    const batches: TestConfiguration[][] = [];
    for (let i = 0; i < configurations.length; i += concurrentLimit) {
      batches.push(configurations.slice(i, i + concurrentLimit));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(config =>
        this.executeTest(config, {
          ...metadata,
          batchId,
          batchSize: batch.length,
          totalConfigs: configurations.length
        })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          // This case should be rare since executeTest handles its own errors
          console.error('Batch test execution failed:', result.reason);
        }
      });
    }

    return results;
  }

  /**
   * Execute model comparison tests
   * Note: Authentication handled by Convex via JWT session
   */
  async executeModelComparison(
    baselineModelId: string,
    comparisonModels: string[],
    testParameters: any,
    iterations = 1
  ): Promise<TestResult[]> {
    const allModels = [baselineModelId, ...comparisonModels];
    const configurations = allModels.map(modelId => ({
      id: crypto.randomUUID(),
      name: `Model Comparison - ${modelId}`,
      description: `Comparing model performance for ${modelId}`,
      type: 'text_generation' as TestType,
      modelId,
      parameters: testParameters,
      iterations,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return this.executeBatchTests({
      configurations,
      concurrentLimit: Math.min(configurations.length, 5),
      metadata: { testType: 'model_comparison' }
    });
  }

  /**
   * Execute parameter tuning tests
   * Note: Authentication handled by Convex via JWT session
   */
  async executeParameterTuning(
    modelId: string,
    baseParameters: any,
    tuningParameters: Array<{
      name: string;
      values: unknown[];
    }>,
    testPrompt: string
  ): Promise<TestResult[]> {
    const configurations: TestConfiguration[] = [];

    // Generate all parameter combinations
    const generateCombinations = (params: typeof tuningParameters, index = 0, current: Record<string, unknown> = {}): void => {
      if (index >= params.length) {
        configurations.push({
          id: crypto.randomUUID(),
          name: `Parameter Tuning - ${Object.entries(current).map(([k, v]) => `${k}=${v}`).join(', ')}`,
          description: 'Parameter tuning test configuration',
          type: 'text_generation',
          modelId,
          parameters: {
            ...baseParameters,
            ...current,
            prompt: testPrompt
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

    generateCombinations(tuningParameters);

    return this.executeBatchTests({
      configurations,
      concurrentLimit: Math.min(configurations.length, 5),
      metadata: { testType: 'parameter_tuning' }
    });
  }

  /**
   * Execute the actual AI operation based on test type
   */
  private async executeTestOperation(
    config: TestConfiguration,
    metadata?: Record<string, unknown>
  ): Promise<TestResult> {
    const startTime = performance.now();
    const testId = crypto.randomUUID();
    const provider = getProviderFromModelId(config.modelId);
    const startedAt = new Date();

    // Create request metadata that links to the test
    const requestMetadata = {
      ...metadata,
      testId: config.id,
      feature: 'ai_testing'
    };

    try {
      let response: any = null;
      let usage: any = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
      let cost = 0;
      let finishReason: any = undefined;
      let warnings: any[] = [];
      let logId: Id<"aiLogs"> | undefined = undefined;

      switch (config.type) {
        case 'text_generation':
        case 'streaming':
          const textRequest: AIGenerateRequest = {
            modelId: config.modelId,
            prompt: config.parameters.prompt || 'Test prompt',
            systemPrompt: config.parameters.systemPrompt,
            parameters: {
              temperature: config.parameters.temperature,
              maxTokens: config.parameters.maxTokens,
              topP: config.parameters.topP,
              topK: config.parameters.topK,
              frequencyPenalty: config.parameters.frequencyPenalty,
              presencePenalty: config.parameters.presencePenalty,
              stopSequences: config.parameters.stopSequences,
              enableCaching: config.parameters.enableCaching
            },
            metadata: requestMetadata
          };

          const textResult = await this.aiService.generateText(textRequest);
          response = textResult.text;
          usage = textResult.usage;
          cost = textResult.cost;
          finishReason = textResult.finishReason;
          warnings = textResult.warnings || [];
          logId = textResult.logId;
          break;

        case 'object_generation':
          const objectRequest: AIObjectRequest = {
            modelId: config.modelId,
            prompt: config.parameters.prompt || 'Test prompt',
            systemPrompt: config.parameters.systemPrompt,
            parameters: {
              temperature: config.parameters.temperature,
              maxTokens: config.parameters.maxTokens,
              topP: config.parameters.topP,
              topK: config.parameters.topK,
              frequencyPenalty: config.parameters.frequencyPenalty,
              presencePenalty: config.parameters.presencePenalty,
              stopSequences: config.parameters.stopSequences,
              enableCaching: config.parameters.enableCaching
            },
            schema: config.parameters.schema || { type: 'object', properties: { result: { type: 'string' } } },
            outputMode: config.parameters.outputMode,
            metadata: requestMetadata
          };

          const objectResult = await this.aiService.generateObject(objectRequest);
          response = objectResult.object;
          usage = objectResult.usage;
          cost = objectResult.cost;
          finishReason = objectResult.finishReason;
          logId = objectResult.logId;
          break;

        case 'embedding':
          const embeddingRequest: AIEmbeddingRequest = {
            modelId: config.modelId,
            text: config.parameters.prompt || 'Test embedding text',
            metadata: requestMetadata
          };

          const embeddingResult = await this.aiService.generateEmbedding(embeddingRequest);
          response = embeddingResult.embeddings;
          usage = embeddingResult.usage;
          cost = embeddingResult.cost;
          logId = embeddingResult.logId;
          break;

        case 'image_generation':
          const imageRequest: AIImageRequest = {
            modelId: config.modelId,
            prompt: config.parameters.prompt || 'Test image',
            negativePrompt: config.parameters.negativePrompt,
            width: config.parameters.width,
            height: config.parameters.height,
            steps: config.parameters.steps,
            guidance: config.parameters.guidance,
            seed: config.parameters.seed,
            metadata: requestMetadata
          };

          const imageResult = await this.aiService.generateImage(imageRequest);
          response = imageResult.images;
          usage = imageResult.usage;
          cost = imageResult.cost;
          logId = imageResult.logId;
          break;

        case 'speech':
          const speechRequest: AISpeechRequest = {
            modelId: config.modelId,
            text: config.parameters.prompt || 'Test speech',
            voice: config.parameters.voice,
            speed: config.parameters.speed,
            format: config.parameters.format,
            metadata: requestMetadata
          };
          
          const speechResult = await this.aiService.generateSpeech(speechRequest);
          response = speechResult.audio;
          usage = speechResult.usage;
          cost = speechResult.cost;
          logId = speechResult.logId;
          break;

        case 'transcription':
          const transcriptionRequest: AITranscriptionRequest = {
            modelId: config.modelId,
            audio: config.parameters.prompt || 'base64-encoded-audio-data',
            language: config.parameters.language,
            prompt: config.parameters.systemPrompt,
            temperature: config.parameters.temperature,
            format: config.parameters.transcriptionFormat,
            metadata: requestMetadata
          };
          
          const transcriptionResult = await this.aiService.transcribeAudio(transcriptionRequest);
          response = transcriptionResult.text;
          usage = transcriptionResult.usage;
          cost = transcriptionResult.cost;
          logId = transcriptionResult.logId;
          break;

        default:
          throw new Error(`Unsupported test type: ${config.type}`);
      }

      const totalLatency = performance.now() - startTime;

      // Validate results if expected results are provided
      const validationResults = config.expectedResults 
        ? this.validateTestResults(response, usage, cost, totalLatency, config.expectedResults)
        : undefined;

      const testResult: TestResult = {
        id: testId,
        testConfigId: config.id,
        testRunId: metadata?.testRunId as string || crypto.randomUUID(),
        modelId: config.modelId,
        provider,
        status: 'completed',
        prompt: config.parameters.prompt || '',
        systemPrompt: config.parameters.systemPrompt,
        parameters: config.parameters,
        response,
        usage,
        cost,
        latencyMs: totalLatency,
        finishReason,
        warnings,
        logId,
        validationResults,
        metadata: {
          iteration: metadata?.iteration as number || 1,
          testRunStartTime: metadata?.testRunStartTime ? new Date(metadata.testRunStartTime as number) : startedAt,
          userAgent: metadata?.userAgent as string,
          sdkVersion: metadata?.sdkVersion as string,
          requestId: metadata?.requestId as string,
          ...metadata
        },
        startedAt,
        completedAt: new Date(),
        createdAt: startedAt
      };

      return testResult;

    } catch (error) {
      throw error; // Let executeTest handle the error and create failed result
    }
  }

  /**
   * Create a new AI test record
   */
  private async createTest(
    config: TestConfiguration,
    metadata?: Record<string, unknown>
  ): Promise<Id<"aiTests">> {
    if (!this.convexClient) {
      console.error('createTest: Convex client not initialized');
      throw new Error('Convex client not initialized');
    }

    try {
      const provider = getProviderFromModelId(config.modelId);

    // Clean parameters before saving to database
    const cleanParameters = cleanTestParameters(config.parameters);

    console.log('createTest: Calling Convex mutation with:', {
        testId: config.id,
        name: config.name,
        type: config.type,
        modelId: config.modelId,
        provider,
        iterations: config.iterations,
        parametersKeys: Object.keys(cleanParameters),
        metadataKeys: metadata ? Object.keys(metadata) : []
      });

      const testId = await this.convexClient.mutation(api.lib.boilerplate.ai_tests.mutations.createAITest, {
        name: config.name,
        description: config.description,
        type: config.type,
        modelId: config.modelId,
        provider,
        parameters: cleanParameters,
        iterations: config.iterations,
        timeout: config.timeout,
        expectedResults: config.expectedResults,
        metadata: metadata || {}
      });

      console.log('createTest: Convex mutation completed successfully:', { testId });
      return testId;
    } catch (error) {
      console.error('createTest: Convex mutation failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        configId: config.id
      });
      throw new Error(`Failed to create test: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Update test status
   */
  private async updateTestStatus(
    testId: Id<"aiTests">,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    options: {
      startedAt?: Date;
      completedAt?: Date;
      duration?: number;
    } = {}
  ): Promise<void> {
    if (!this.convexClient) {
      console.error('updateTestStatus: Convex client not initialized');
      throw new Error('Convex client not initialized');
    }

    console.log('updateTestStatus: Calling Convex mutation with:', {
      testId,
      status,
      startedAt: options.startedAt?.getTime(),
      completedAt: options.completedAt?.getTime(),
      duration: options.duration
    });

    try {
      await this.convexClient.mutation(api.lib.boilerplate.ai_tests.mutations.updateTestStatus, {
        testId,
        status,
        startedAt: options.startedAt?.getTime(),
        completedAt: options.completedAt?.getTime(),
        duration: options.duration
      });
      console.log('updateTestStatus: Convex mutation completed successfully');
    } catch (error) {
      console.error('updateTestStatus: Convex mutation failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        testId,
        status
      });
      throw new Error(`Failed to update test status: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Add a test result iteration
   */
  private async addTestResult(
    testId: Id<"aiTests">,
    result: TestResult,
    logId: Id<"aiLogs"> | undefined
  ): Promise<void> {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      const testResult = {
        id: result.id,
        iteration: result.metadata?.iteration || 1,
        status: result.status === 'completed' ? 'completed' as const : 'failed' as const,
        response: typeof result.response === 'string'
          ? result.response
          : result.response ? JSON.stringify(result.response) : undefined,
        usage: {
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
          totalTokens: result.usage.totalTokens,
          reasoningTokens: result.usage.reasoningTokens,
          cachedInputTokens: result.usage.cachedInputTokens,
        },
        cost: result.cost,
        latencyMs: result.latencyMs,
        finishReason: result.finishReason,
        warnings: result.warnings || [],
        firstTokenLatencyMs: result.firstTokenLatencyMs,
        tokensPerSecond: result.tokensPerSecond,
        wordsPerMinute: result.wordsPerMinute,
        validationResults: result.validationResults,
        error: result.error,
        logId,
        executedAt: result.completedAt?.getTime() || Date.now(),
      };

      await this.convexClient.mutation(api.lib.boilerplate.ai_tests.mutations.addTestResult, {
        testId,
        result: testResult
      });
    } catch (error) {
      throw new Error(`Failed to add test result: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Get AI tests with filtering
   * Note: Authentication handled by Convex via JWT session
   */
  async getTests(filters: TestFilter): Promise<{
    tests: AITest[];
    total: number;
    hasMore: boolean;
  }> {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      const result = await this.convexClient.query(api.lib.boilerplate.ai_tests.queries.getAITests, {
        modelId: filters.modelId,
        provider: filters.provider,
        type: filters.type,
        status: filters.status,
        search: filters.search,
        startDate: filters.startDate?.getTime(),
        endDate: filters.endDate?.getTime(),
        limit: filters.limit,
        offset: filters.offset
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to get tests: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Get specific test by ID (supports both internal _id and public ID)
   * Note: Authentication handled by Convex via JWT session
   */
  async getTest(testId: AITestId): Promise<AITest | null> {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      // Use public ID query if it's a public ID, otherwise use internal _id query
      if (this.isPublicId(testId)) {
        return await this.convexClient.query(
          api.lib.boilerplate.ai_tests.queries.getAITestByPublicId,
          { publicId: testId as string }
        );
      } else {
        return await this.convexClient.query(
          api.lib.boilerplate.ai_tests.queries.getAITest,
          { testId: testId as Id<"aiTests"> }
        );
      }
    } catch (error) {
      throw new Error(`Failed to get test: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Get specific test by public ID
   * Note: Authentication handled by Convex via JWT session
   */
  async getTestByPublicId(publicId: string): Promise<AITest | null> {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      const test = await this.convexClient.query(api.lib.boilerplate.ai_tests.queries.getAITestByPublicId, {
        publicId
      });

      return test;
    } catch (error) {
      throw new Error(`Failed to get test by publicId: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Delete test (supports both internal _id and public ID)
   * Note: Authentication handled by Convex via JWT session
   */
  async deleteTest(testId: AITestId): Promise<void> {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      // Use public ID mutation if it's a public ID, otherwise use internal _id mutation
      if (this.isPublicId(testId)) {
        await this.convexClient.mutation(
          api.lib.boilerplate.ai_tests.mutations.deleteAITestByPublicId,
          { publicId: testId as string }
        );
      } else {
        await this.convexClient.mutation(
          api.lib.boilerplate.ai_tests.mutations.deleteAITest,
          { testId: testId as Id<"aiTests"> }
        );
      }
    } catch (error) {
      throw new Error(`Failed to delete test: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Delete test by public ID
   * Note: Authentication handled by Convex via JWT session
   */
  async deleteTestByPublicId(publicId: string): Promise<void> {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      await this.convexClient.mutation(api.lib.boilerplate.ai_tests.mutations.deleteAITestByPublicId, {
        publicId
      });
    } catch (error) {
      throw new Error(`Failed to delete test by publicId: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Get test analytics and statistics
   * Note: Backend automatically fetches stats for current user via JWT token
   */
  async getTestAnalytics(timeWindow?: 'day' | 'week' | 'month' | 'all'): Promise<TestAnalytics> {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized');
    }

    try {
      // Backend uses JWT to identify user automatically - no userId needed
      const stats = await this.convexClient.query(api.lib.boilerplate.ai_tests.queries.getAITestStats, {
        timeWindow,
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get test analytics: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Validate test results against expected criteria
   */
  private validateTestResults(
    response: any,
    usage: any,
    cost: number,
    latencyMs: number,
    expected: any
  ): any {
    const checks: Array<{
      name: string;
      passed: boolean;
      expected?: unknown;
      actual?: unknown;
      message?: string;
    }> = [];

    // Token validation
    if (expected.minTokens !== undefined) {
      const passed = usage.totalTokens >= expected.minTokens;
      checks.push({
        name: 'Minimum tokens',
        passed,
        expected: `>= ${expected.minTokens}`,
        actual: usage.totalTokens,
        message: passed ? undefined : `Expected at least ${expected.minTokens} tokens, got ${usage.totalTokens}`
      });
    }

    if (expected.maxTokens !== undefined) {
      const passed = usage.totalTokens <= expected.maxTokens;
      checks.push({
        name: 'Maximum tokens',
        passed,
        expected: `<= ${expected.maxTokens}`,
        actual: usage.totalTokens,
        message: passed ? undefined : `Expected at most ${expected.maxTokens} tokens, got ${usage.totalTokens}`
      });
    }

    // Latency validation
    if (expected.maxLatency !== undefined) {
      const passed = latencyMs <= expected.maxLatency;
      checks.push({
        name: 'Maximum latency',
        passed,
        expected: `<= ${expected.maxLatency}ms`,
        actual: `${latencyMs}ms`,
        message: passed ? undefined : `Expected latency <= ${expected.maxLatency}ms, got ${latencyMs}ms`
      });
    }

    // Cost validation
    if (expected.maxCost !== undefined) {
      const passed = cost <= expected.maxCost;
      checks.push({
        name: 'Maximum cost',
        passed,
        expected: `<= ${expected.maxCost}`,
        actual: `${cost}`,
        message: passed ? undefined : `Expected cost <= ${expected.maxCost}, got ${cost}`
      });
    }

    const passedChecks = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;

    return {
      passed: passedChecks === totalChecks,
      checks,
      score,
      details: {
        tokenValidation: checks.some(c => c.name.includes('tokens')) ? checks.filter(c => c.name.includes('tokens')).every(c => c.passed) : undefined,
        latencyValidation: checks.some(c => c.name.includes('latency')) ? checks.filter(c => c.name.includes('latency')).every(c => c.passed) : undefined,
        costValidation: checks.some(c => c.name.includes('cost')) ? checks.filter(c => c.name.includes('cost')).every(c => c.passed) : undefined,
        outputValidation: checks.some(c => c.name.includes('Output')) ? checks.filter(c => c.name.includes('Output')).every(c => c.passed) : undefined
      }
    };
  }

  /**
   * Export test data to CSV format
   * Note: Authentication handled by Convex via JWT session
   */
  async exportTests(testIds: Id<"aiTests">[]): Promise<string> {
    const tests: AITest[] = [];

    // Fetch all test data
    for (const testId of testIds) {
      try {
        const test = await this.getTest(testId);
        if (test) {
          tests.push(test);
        }
      } catch (error) {
        console.warn(`Failed to fetch test ${testId} for export:`, error);
      }
    }

    // Create CSV headers
    const headers = [
      'Test ID',
      'Test Name',
      'Model ID',
      'Provider',
      'Type',
      'Status',
      'Total Iterations',
      'Passed',
      'Failed',
      'Success Rate (%)',
      'Total Cost ($)',
      'Avg Latency (ms)',
      'Created At',
      'Completed At',
      'Duration (s)'
    ];

    // Create CSV rows
    const rows = tests.map(test => [
      test.publicId,
      `"${test.name.replace(/"/g, '""')}"`, // Escape quotes
      test.modelId,
      test.provider,
      test.type,
      test.status,
      test.summary.totalTests.toString(),
      test.summary.passedTests.toString(),
      test.summary.failedTests.toString(),
      test.summary.successRate.toFixed(2),
      test.summary.totalCost.toFixed(6),
      Math.round(test.summary.avgLatency).toString(),
      new Date(test.createdAt).toISOString(),
      test.completedAt ? new Date(test.completedAt).toISOString() : '',
      test.duration ? (test.duration / 1000).toFixed(2) : ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Get health status of the test service
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    convexConnected: boolean;
    aiServiceHealthy: boolean;
    timestamp: Date;
  }> {
    const timestamp = new Date();
    let convexConnected = false;
    let aiServiceHealthy = false;
    
    try {
      if (this.convexClient) {
        // Simple health check query
        await this.convexClient.query(api.lib.boilerplate.ai_tests.queries.getAITests, {
          limit: 1,
        });
        convexConnected = true;
      }
    } catch (error) {
      console.warn('AI Test Service Convex health check failed:', error);
    }

    try {
      const aiHealth = await this.aiService.healthCheck();
      aiServiceHealthy = aiHealth.status === 'healthy';
    } catch (error) {
      console.warn('AI Service health check failed:', error);
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';
    if (convexConnected && aiServiceHealthy) {
      status = 'healthy';
    } else if (convexConnected || aiServiceHealthy) {
      status = 'degraded';
    }

    return {
      status,
      convexConnected,
      aiServiceHealthy,
      timestamp
    };
  }
}