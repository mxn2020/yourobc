// src/core/ai/AIService.ts (Simplified - core AI operations only)
import type {
  AIGenerateRequest,
  AIGenerateResponse,
  AIObjectRequest,
  AIObjectResponse,
  AIImageRequest,
  AIImageResponse,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AISpeechRequest,
  AISpeechResponse,
  AITranscriptionRequest,
  AITranscriptionResponse,
  AIOperationType,
  ValidationResult,
  AIParameters,
  TokenUsage
} from '../types/ai-core.types';

import type {
  AIUsageFilter,
  LogQueryResult
} from '../types/ai-logging.types';

import type { ModelInfo } from '../types/ai-models.types';
import { AILogService } from './AILogService';
import { AIModelManager } from './AIModelManager';
import { CostTracker } from './CostTracker';
import { CacheManager } from './CacheManager';
import { ProviderManager } from './ProviderManager';
import { validateAIRequest } from '@/features/system/ai-core/utils';
import { formatErrorMessage } from '@/features/system/ai-core/utils';
import { TokenCounter } from '../utils/token-counter';
import { isTokenUsage } from '../utils/response-formatter';

export interface AIServiceConfig {
  enableLogging?: boolean;
  enableCaching?: boolean;
  defaultTimeout?: number;
  maxRetries?: number;
  cacheTTL?: number;
}

/**
 * Type representing a response with added metadata properties.
 * This allows us to safely add cost, latency, and request ID to responses.
 */
type ResponseWithMetadata<T> = T & {
  cost?: number;
  latencyMs?: number;
  requestId?: string;
}

export class AIService {
  private static instance: AIService | null = null;

  private readonly logService: AILogService;
  private readonly modelManager: AIModelManager;
  private readonly costTracker: CostTracker;
  private readonly cacheManager: CacheManager;
  private readonly providerManager: ProviderManager;
  private readonly tokenCounter: TokenCounter;

  private readonly config: Required<AIServiceConfig>;

  private constructor(config: AIServiceConfig = {}) {
    this.config = {
      enableLogging: config.enableLogging ?? true,
      enableCaching: config.enableCaching ?? true,
      defaultTimeout: config.defaultTimeout ?? 30000,
      maxRetries: config.maxRetries ?? 2,
      cacheTTL: config.cacheTTL ?? 3600000 // 1 hour
    };

    // Initialize services
    this.logService = new AILogService();
    this.modelManager = new AIModelManager();
    this.costTracker = new CostTracker();
    this.cacheManager = new CacheManager(this.config.cacheTTL);
    this.providerManager = new ProviderManager();
    this.tokenCounter = new TokenCounter();
  }

  public static getInstance(config?: AIServiceConfig): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService(config);
    }
    return AIService.instance;
  }

  /**
   * Generate text using language models
   */
  public async generateText(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    return this.executeGeneration('text_generation', request, async (model, validatedRequest) => {
      return this.providerManager.generateText({
        modelId: validatedRequest.modelId,
        prompt: validatedRequest.prompt,
        systemPrompt: validatedRequest.systemPrompt,
        parameters: validatedRequest.parameters || {},
        metadata: validatedRequest.metadata || {}
      });
    });
  }

  /**
   * Generate streaming text response
   */
  public async generateTextStream(request: AIGenerateRequest): Promise<ReadableStream> {
    // Use existing requestId from metadata if provided, otherwise generate new one
    const requestId = request.metadata?.requestId || crypto.randomUUID();
    const startTime = performance.now();

    try {
      // Validate request
      const validation = await validateAIRequest(request);
      if (!validation.valid) {
        throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
      }

      // Get and validate model
      const model = await this.modelManager.getModel(request.modelId);
      if (!model) {
        throw new Error(`Model ${request.modelId} not found`);
      }

      // Log request start
      if (this.config.enableLogging) {
        await this.logService.logRequestStart(requestId, 'streaming', request);
      }

      // Generate streaming response through provider
      const stream = await this.providerManager.generateTextStream({
        modelId: request.modelId,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        parameters: request.parameters || {},
        metadata: { ...request.metadata, requestId }
      });

      return stream;
    } catch (error) {
      if (this.config.enableLogging) {
        await this.logService.logRequestError(requestId, request, error);
      }
      throw error;
    }
  }

  /**
   * Generate structured objects using language models
   */
  public async generateObject(request: AIObjectRequest): Promise<AIObjectResponse> {
    return this.executeGeneration('object_generation', request, async (model, validatedRequest) => {
      return this.providerManager.generateObject({
        modelId: validatedRequest.modelId,
        prompt: validatedRequest.prompt,
        systemPrompt: validatedRequest.systemPrompt,
        schema: validatedRequest.schema,
        outputMode: validatedRequest.outputMode,
        parameters: validatedRequest.parameters || {},
        metadata: validatedRequest.metadata || {}
      });
    });
  }

  /**
   * Stream structured objects using language models
   */
  public async generateObjectStream(request: AIObjectRequest): Promise<ReadableStream> {
    try {
      // Validate model
      const model = await this.modelManager.getModel(request.modelId);
      if (!model) {
        throw new Error(`Model not found: ${request.modelId}`);
      }

      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
      }

      return this.providerManager.generateObjectStream({
        modelId: request.modelId,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        schema: request.schema,
        outputMode: request.outputMode,
        parameters: request.parameters || {},
        metadata: request.metadata || {}
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate images using image models
   */
  public async generateImage(request: AIImageRequest): Promise<AIImageResponse> {
    return this.executeGeneration('image_generation', request, async (model, validatedRequest) => {
      return this.providerManager.generateImage({
        modelId: validatedRequest.modelId,
        prompt: validatedRequest.prompt,
        negativePrompt: validatedRequest.negativePrompt,
        width: validatedRequest.width,
        height: validatedRequest.height,
        steps: validatedRequest.steps,
        guidance: validatedRequest.guidance,
        seed: validatedRequest.seed,
        metadata: validatedRequest.metadata || {}
      });
    });
  }

  /**
   * Generate embeddings using embedding models
   */
  public async generateEmbedding(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    return this.executeGeneration('embedding', request, async (model, validatedRequest) => {
      return this.providerManager.generateEmbedding({
        modelId: validatedRequest.modelId,
        text: validatedRequest.text,
        metadata: validatedRequest.metadata || {}
      });
    });
  }

  /**
   * Generate speech using speech synthesis models
   */
  public async generateSpeech(request: AISpeechRequest): Promise<AISpeechResponse> {
    return this.executeGeneration('speech', request, async (model, validatedRequest) => {
      return this.providerManager.generateSpeech({
        modelId: validatedRequest.modelId,
        text: validatedRequest.text,
        voice: validatedRequest.voice,
        speed: validatedRequest.speed,
        format: validatedRequest.format,
        metadata: validatedRequest.metadata || {}
      });
    });
  }

  /**
   * Transcribe audio using transcription models
   */
  public async transcribeAudio(request: AITranscriptionRequest): Promise<AITranscriptionResponse> {
    return this.executeGeneration('transcription', request, async (model, validatedRequest) => {
      return this.providerManager.transcribeAudio({
        modelId: validatedRequest.modelId,
        audio: validatedRequest.audio,
        language: validatedRequest.language,
        prompt: validatedRequest.prompt,
        temperature: validatedRequest.temperature,
        format: validatedRequest.format,
        metadata: validatedRequest.metadata || {}
      });
    });
  }

  /**
   * Get available models with caching
   */
  public async getModels(filters?: Parameters<AIModelManager['getModels']>[0]): Promise<ModelInfo[]> {
    return this.modelManager.getModels(filters);
  }

  /**
   * Get specific model by ID
   */
  public async getModel(modelId: string): Promise<ModelInfo | null> {
    return this.modelManager.getModel(modelId);
  }

  /**
   * Get logs - Direct access to logs (not tests)
   */
  public async getLogs(filters?: AIUsageFilter): Promise<LogQueryResult> {
    return this.logService.queryLogs(filters);
  }

  /**
   * Health check for the AI service
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    timestamp: Date;
  }> {
    const timestamp = new Date();
    const services: Record<string, boolean> = {};

    try {
      // Check model manager
      services.modelManager = await this.checkServiceHealth(() =>
        this.modelManager.getModels({ limit: 1 })
      );

      // Check cache manager
      services.cacheManager = await this.checkServiceHealth(() =>
        this.cacheManager.get('health-check-key')
      );

      // Check provider manager
      services.providerManager = this.providerManager.isHealthy();

      const healthyServices = Object.values(services).filter(Boolean).length;
      const totalServices = Object.keys(services).length;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (healthyServices === totalServices) {
        status = 'healthy';
      } else if (healthyServices >= totalServices / 2) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return { status, services, timestamp };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        services,
        timestamp
      };
    }
  }

  /**
   * Clear all caches
   */
  public async clearCaches(): Promise<void> {
    await Promise.all([
      this.cacheManager.clear(),
      this.modelManager.clearCache()
    ]);
  }

  /**
   * Get service statistics
   */
  public getStats(): {
    cacheStats: ReturnType<CacheManager['getStats']>;
    modelStats: ReturnType<AIModelManager['getStats']>;
    costStats: ReturnType<CostTracker['getStats']>;
  } {
    return {
      cacheStats: this.cacheManager.getStats(),
      modelStats: this.modelManager.getStats(),
      costStats: this.costTracker.getStats()
    };
  }

  // === PRIVATE METHODS ===

  /**
   * Private method to execute any AI generation with common logic
   */
  private async executeGeneration<TRequest, TResponse>(
    operationType: AIOperationType,
    request: TRequest & { modelId: string; metadata?: { requestId?: string } },
    generationFn: (model: ModelInfo, request: TRequest) => Promise<TResponse>
  ): Promise<TResponse> {
    // Use existing requestId from metadata if provided, otherwise generate new one
    const requestId = request.metadata?.requestId || crypto.randomUUID();
    const startTime = performance.now();
    let model: ModelInfo | null = null;

    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Get model information
      model = await this.modelManager.getModel(request.modelId);
      if (!model) {
        throw new Error(`Model not found: ${request.modelId}`);
      }

      // Validate model supports operation
      if (!this.modelManager.supportsOperation(model, operationType)) {
        throw new Error(`Model ${request.modelId} does not support ${operationType}`);
      }

      // Check cache if enabled
      if (this.config.enableCaching) {
        const cacheKey = this.cacheManager.generateKey(request);
        const cachedResponse = await this.cacheManager.get<TResponse>(cacheKey);

        if (cachedResponse) {
          if (this.config.enableLogging) {
            const cacheTTL = this.cacheManager.getDefaultTTL();
            await this.logService.logCacheHit(requestId, request, cachedResponse, cacheKey, cacheTTL);
          }
          return cachedResponse;
        }
      }

      // Log request start
      if (this.config.enableLogging) {
        await this.logService.logRequestStart(requestId, operationType, request);
      }

      // Execute generation with retries
      const response = await this.executeWithRetries(
        () => generationFn(model!, request),
        this.config.maxRetries
      );

      // Calculate cost
      if (response && typeof response === 'object' && 'usage' in response && isTokenUsage(response.usage)) {
        const cost = await this.costTracker.calculateCost(
          model,
          response.usage as TokenUsage
        );

        // Add cost to response with proper typing
        const responseWithMeta = response as ResponseWithMetadata<TResponse>;
        responseWithMeta.cost = cost;
      }

      // Add metadata
      const endTime = performance.now();
      const responseWithMeta = response as ResponseWithMetadata<TResponse>;
      responseWithMeta.latencyMs = endTime - startTime;
      responseWithMeta.requestId = requestId;

      // Cache response if enabled
      if (this.config.enableCaching) {
        const cacheKey = this.cacheManager.generateKey(request);
        await this.cacheManager.set(cacheKey, response);
      }

      // Log successful completion
      if (this.config.enableLogging) {
        await this.logService.logRequestSuccess(requestId, request, response);
      }

      return response;

    } catch (error) {
      const endTime = performance.now();
      const errorMessage = formatErrorMessage(error);

      // Log error
      if (this.config.enableLogging) {
        await this.logService.logRequestError(requestId, request, error);
      }

      // Re-throw with context, preserving detailed error information
      const contextualError = new Error(
        `${operationType} failed for model ${request.modelId}: ${errorMessage}`
      );
      contextualError.cause = error;

      // Add structured error details for better error reporting
      if ('details' in contextualError) {
        contextualError.details = {
          originalError: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause
          } : error,
          provider: request.modelId.split('/')[0],
          operation: operationType,
          modelId: request.modelId,
          timestamp: new Date().toISOString()
        };
      }

      throw contextualError;
    }
  }

  /**
   * Validate request using validation utilities
   */
  private validateRequest(request: unknown): ValidationResult {
    // Basic validation - can be extended based on request type
    if (!request || typeof request !== 'object') {
      return {
        valid: false,
        errors: ['Invalid request format'],
        warnings: []
      };
    }

    const typedRequest = request as Record<string, unknown>;

    if (!typedRequest.modelId || typeof typedRequest.modelId !== 'string') {
      return {
        valid: false,
        errors: ['Model ID is required and must be a string'],
        warnings: []
      };
    }

    // For embedding requests, text is required instead of prompt
    if (typedRequest.text) {
      // This is an embedding request - validate text instead of prompt
      if (!typedRequest.text || (Array.isArray(typedRequest.text) && typedRequest.text.length === 0)) {
        return {
          valid: false,
          errors: ['Text is required for embedding generation'],
          warnings: []
        };
      }

      // For embedding requests, we don't need prompt validation
      return {
        valid: true,
        errors: [],
        warnings: []
      };
    }

    // Use validation utilities for comprehensive validation (text generation, image generation, etc.)
    return validateAIRequest({
      modelId: typedRequest.modelId,
      prompt: typedRequest.prompt as string || '',
      systemPrompt: typedRequest.systemPrompt as string,
      parameters: typedRequest.parameters as AIParameters | undefined,
      schema: typedRequest.schema,
      files: typedRequest.files as { type: string; size: number; data: string; }[] | undefined
    });
  }

  /**
   * Execute function with retries
   */
  private async executeWithRetries<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    delay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(healthCheckFn: () => Promise<unknown>): Promise<boolean> {
    try {
      await Promise.race([
        healthCheckFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        )
      ]);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();