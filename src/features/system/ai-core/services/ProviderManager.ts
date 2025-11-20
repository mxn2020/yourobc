// src/core/ai/ProviderManager.ts
import { gateway } from '@ai-sdk/gateway';
import { generateText, generateObject, streamText, streamObject, jsonSchema, embed } from 'ai';
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
  AITranscriptionResponse
} from '../types/ai-core.types';
import type { ModelProvider } from '../types/ai-models.types';
import { PROVIDER_CONFIGS } from '../constants/ai-providers';
import { extractProvider } from '@/features/boilerplate/ai-core/utils';
import { formatErrorMessage } from '@/features/boilerplate/ai-core/utils';
import { ResponseFormatter } from '../utils/response-formatter';
import { ErrorHandler } from '../utils/error-handler';

export interface ProviderHealth {
  provider: ModelProvider;
  isHealthy: boolean;
  latency: number;
  lastCheck: Date;
  errorRate: number;
  consecutiveErrors: number;
}

export class ProviderManager {
  private readonly healthStatus = new Map<ModelProvider, ProviderHealth>();
  private readonly responseFormatter = new ResponseFormatter();
  private readonly errorHandler = new ErrorHandler();
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeProviderHealth();
    this.startHealthChecks();
  }

  /**
   * Generate text using language models
   */
  public async generateText(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const provider = extractProvider(request.modelId);
    
    try {
      const startTime = performance.now();
      
      // Prepare AI SDK options
      const aiOptions = {
        model: gateway.languageModel(request.modelId),
        prompt: request.prompt,
        system: request.systemPrompt,
        temperature: request.parameters?.temperature,
        maxTokens: request.parameters?.maxTokens,
        topP: request.parameters?.topP,
        topK: request.parameters?.topK,
        frequencyPenalty: request.parameters?.frequencyPenalty,
        presencePenalty: request.parameters?.presencePenalty,
        stopSequences: request.parameters?.stopSequences,
        responseFormat: request.parameters?.responseFormat,
        tools: request.parameters?.tools?.reduce((acc, tool) => {
          acc[tool.name] = {
            description: tool.description,
            parameters: tool.inputSchema || {}
          };
          return acc;
        }, {} as Record<string, any>)
      };

      // Execute generation
      const result = await generateText(aiOptions);
      const endTime = performance.now();

      // Update provider health
      this.updateProviderHealth(provider, true, endTime - startTime);

      // Format response
      return this.responseFormatter.formatTextResponse(result, endTime - startTime);
      
    } catch (error) {
      // Update provider health
      this.updateProviderHealth(provider, false, 0);
      
      // Handle error
      throw this.errorHandler.handleProviderError(error, provider, 'text_generation');
    }
  }


  /**
   * Generate structured objects using language models
   */
  public async generateObject(request: AIObjectRequest): Promise<AIObjectResponse> {
    const provider = extractProvider(request.modelId);
    
    try {
      const startTime = performance.now();
      
      // Prepare AI SDK options
      const aiOptions = {
        model: gateway.languageModel(request.modelId),
        prompt: request.prompt,
        system: request.systemPrompt,
        schema: jsonSchema(request.schema),
        mode: (request.outputMode || 'json') as 'json' | 'auto' | 'tool',
        temperature: request.parameters?.temperature,
        maxTokens: request.parameters?.maxTokens,
        topP: request.parameters?.topP
      };

      // Execute object generation
      const result = await generateObject(aiOptions);
      const endTime = performance.now();

      // Update provider health
      this.updateProviderHealth(provider, true, endTime - startTime);

      // Format response
      return this.responseFormatter.formatObjectResponse(result, endTime - startTime);
      
    } catch (error) {
      // Update provider health
      this.updateProviderHealth(provider, false, 0);
      
      // Handle error
      throw this.errorHandler.handleProviderError(error, provider, 'object_generation');
    }
  }

  /**
   * Stream structured objects using language models
   */
  public async generateObjectStream(request: AIObjectRequest): Promise<ReadableStream> {
    const provider = extractProvider(request.modelId);
    
    try {
      const startTime = performance.now();
      
      // Prepare AI SDK options
      const aiOptions = {
        model: gateway.languageModel(request.modelId),
        prompt: request.prompt,
        system: request.systemPrompt,
        schema: jsonSchema(request.schema),
        mode: (request.outputMode as 'auto' | 'tool' | 'json') || 'auto',
        temperature: request.parameters?.temperature,
        maxTokens: request.parameters?.maxTokens,
        topP: request.parameters?.topP,
        topK: request.parameters?.topK,
        frequencyPenalty: request.parameters?.frequencyPenalty,
        presencePenalty: request.parameters?.presencePenalty,
      };

      const result = await streamObject(aiOptions);
      
      // Update provider health on success
      const endTime = performance.now();
      this.updateProviderHealth(provider, true, endTime - startTime);

      // Create streaming response
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const part of result.partialObjectStream) {
              const chunk = new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: 'object-delta',
                  partialObject: part,
                  timestamp: Date.now()
                })}\n\n`
              );
              controller.enqueue(chunk);
            }

            // Send final object and completion
            const finalResult = await result.object;
            const usage = await result.usage;
            
            const finalChunk = new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'object-complete',
                object: finalResult,
                usage: {
                  promptTokens: usage.inputTokens || 0,
                  completionTokens: usage.outputTokens || 0,
                  totalTokens: usage.totalTokens || 0
                },
                timestamp: Date.now()
              })}\n\n`
            );
            controller.enqueue(finalChunk);
            controller.close();
          } catch (error) {
            const errorChunk = new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown streaming error',
                timestamp: Date.now()
              })}\n\n`
            );
            controller.enqueue(errorChunk);
            controller.error(error);
          }
        }
      });
      
    } catch (error) {
      // Update provider health on failure
      this.updateProviderHealth(provider, false, 0);
      
      // Handle error
      throw this.errorHandler.handleProviderError(error, provider, 'object_generation');
    }
  }

  /**
   * Generate images using image models
   */
  public async generateImage(request: AIImageRequest): Promise<AIImageResponse> {
    const provider = extractProvider(request.modelId);
    
    try {
      const startTime = performance.now();
      
      // Build provider options for image generation
      const providerOptions: any = {};
      
      // Configure provider-specific options for image generation
      if (provider === 'google' || request.modelId.includes('gemini')) {
        providerOptions.google = { 
          responseModalities: ['TEXT', 'IMAGE'] 
        };
      }
      
      // Use generateText with provider options for image generation
      const result = await generateText({
        model: gateway(request.modelId),
        prompt: request.prompt,
        providerOptions,
        seed: request.seed
      });
      
      const endTime = performance.now();
      const latencyMs = endTime - startTime;
      
      // Update provider health
      this.updateProviderHealth(provider, true, latencyMs);
      
      // Format response using the response formatter
      return this.responseFormatter.formatImageResponse(result, latencyMs);
      
    } catch (error) {
      // Update provider health
      this.updateProviderHealth(provider, false, 0);
      
      // Handle error
      throw this.errorHandler.handleProviderError(error, provider, 'image_generation');
    }
  }

  /**
   * Generate embeddings using embedding models
   */
  public async generateEmbedding(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    const provider = extractProvider(request.modelId);
    
    try {
      const startTime = performance.now();
      
      // Handle single text or array of texts
      const isArrayInput = Array.isArray(request.text);
      const textsToEmbed = isArrayInput ? request.text : [request.text];
      
      // Generate embeddings using AI SDK
      const results = [];
      for (const text of textsToEmbed) {
        const result = await embed({
          model: gateway.textEmbeddingModel(request.modelId),
          value: text
        });
        results.push(result);
      }
      
      const endTime = performance.now();
      const latencyMs = endTime - startTime;
      
      // Update provider health
      this.updateProviderHealth(provider, true, latencyMs);
      
      // Format response - embeddings should be array of vectors
      const embeddings = results.map(result => result.embedding);
      const totalUsage = results.reduce((sum, result) => sum + (result.usage?.tokens || 0), 0);
      
      const response: AIEmbeddingResponse = {
        embeddings: embeddings, // Always return as array of vectors
        usage: {
          inputTokens: totalUsage,
          outputTokens: 0,
          totalTokens: totalUsage
        },
        cost: 0, // Would need to calculate based on usage
        latencyMs
      };
      
      return response;
      
    } catch (error) {
      // Update provider health
      this.updateProviderHealth(provider, false, 0);
      
      // Handle error
      throw this.errorHandler.handleProviderError(error, provider, 'embedding');
    }
  }

  /**
   * Generate speech using speech synthesis models
   */
  public async generateSpeech(request: AISpeechRequest): Promise<AISpeechResponse> {
    const provider = extractProvider(request.modelId);
    
    try {
      const startTime = performance.now();
      
      // Speech generation would need to be implemented
      // based on provider-specific APIs
      throw new Error('Speech generation not yet implemented');
      
    } catch (error) {
      // Update provider health
      this.updateProviderHealth(provider, false, 0);
      
      // Handle error
      throw this.errorHandler.handleProviderError(error, provider, 'speech');
    }
  }

  /**
   * Transcribe audio using transcription models
   */
  public async transcribeAudio(request: AITranscriptionRequest): Promise<AITranscriptionResponse> {
    const provider = extractProvider(request.modelId);
    
    try {
      const startTime = performance.now();
      
      // Audio transcription would need to be implemented
      // based on provider-specific APIs
      throw new Error('Audio transcription not yet implemented');
      
    } catch (error) {
      // Update provider health
      this.updateProviderHealth(provider, false, 0);
      
      // Handle error
      throw this.errorHandler.handleProviderError(error, provider, 'transcription');
    }
  }

  /**
   * Generate text with streaming
   */
  public async generateTextStream(request: AIGenerateRequest): Promise<ReadableStream> {
    const provider = extractProvider(request.modelId);
    
    try {
      const aiOptions = {
        model: gateway.languageModel(request.modelId),
        prompt: request.prompt,
        system: request.systemPrompt,
        temperature: request.parameters?.temperature,
        maxTokens: request.parameters?.maxTokens,
        topP: request.parameters?.topP,
        topK: request.parameters?.topK,
        frequencyPenalty: request.parameters?.frequencyPenalty,
        presencePenalty: request.parameters?.presencePenalty
      };

      // Execute streaming generation
      const result = await streamText(aiOptions);
      
      // Create readable stream from AI SDK stream
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const textPart of result.textStream) {
              const chunk = new TextEncoder().encode(textPart);
              controller.enqueue(chunk);
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });
      
    } catch (error) {
      // Update provider health
      this.updateProviderHealth(provider, false, 0);
      
      // Handle error
      throw this.errorHandler.handleProviderError(error, provider, 'streaming');
    }
  }

  /**
   * Get provider health status
   */
  public getProviderHealth(provider: ModelProvider): ProviderHealth | null {
    return this.healthStatus.get(provider) || null;
  }

  /**
   * Get all provider health statuses
   */
  public getAllProviderHealth(): ProviderHealth[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Check if provider manager is healthy
   */
  public isHealthy(): boolean {
    const healthyProviders = Array.from(this.healthStatus.values())
      .filter(health => health.isHealthy).length;
    
    const totalProviders = this.healthStatus.size;
    
    // Consider healthy if at least 50% of providers are healthy
    return healthyProviders >= Math.ceil(totalProviders / 2);
  }

  /**
   * Manually trigger health check for all providers
   */
  public async runHealthChecks(): Promise<void> {
    const healthCheckPromises = Array.from(this.healthStatus.keys())
      .map(provider => this.checkProviderHealth(provider));
    
    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Get provider statistics
   */
  public getStats(): {
    totalProviders: number;
    healthyProviders: number;
    averageLatency: number;
    averageErrorRate: number;
  } {
    const healthStatuses = Array.from(this.healthStatus.values());
    const healthyProviders = healthStatuses.filter(h => h.isHealthy).length;
    const totalLatency = healthStatuses.reduce((sum, h) => sum + h.latency, 0);
    const totalErrorRate = healthStatuses.reduce((sum, h) => sum + h.errorRate, 0);
    
    return {
      totalProviders: healthStatuses.length,
      healthyProviders,
      averageLatency: healthStatuses.length > 0 ? totalLatency / healthStatuses.length : 0,
      averageErrorRate: healthStatuses.length > 0 ? totalErrorRate / healthStatuses.length : 0
    };
  }

  /**
   * Shutdown provider manager
   */
  public shutdown(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Initialize provider health tracking
   */
  private initializeProviderHealth(): void {
    for (const provider of Object.keys(PROVIDER_CONFIGS) as ModelProvider[]) {
      this.healthStatus.set(provider, {
        provider,
        isHealthy: true, // Start optimistic
        latency: 0,
        lastCheck: new Date(),
        errorRate: 0,
        consecutiveErrors: 0
      });
    }
  }

  /**
   * Update provider health status
   */
  private updateProviderHealth(
    provider: ModelProvider,
    success: boolean,
    latency: number
  ): void {
    const current = this.healthStatus.get(provider);
    if (!current) return;

    const now = new Date();
    
    if (success) {
      // Successful request
      current.consecutiveErrors = 0;
      current.latency = latency;
      current.isHealthy = true;
      current.errorRate = Math.max(0, current.errorRate - 0.1); // Slowly decrease error rate
    } else {
      // Failed request
      current.consecutiveErrors++;
      current.errorRate = Math.min(100, current.errorRate + 1); // Increase error rate
      
      // Mark as unhealthy if too many consecutive errors
      if (current.consecutiveErrors >= 3) {
        current.isHealthy = false;
      }
    }
    
    current.lastCheck = now;
    this.healthStatus.set(provider, current);
  }

  /**
   * Perform health check for a specific provider
   */
  private async checkProviderHealth(provider: ModelProvider): Promise<void> {
    try {
      const startTime = performance.now();
      
      // Simple health check with a minimal request
      const result = await generateText({
        model: gateway.languageModel(`${provider}/health-check-model`),
        prompt: 'Say "OK"',
        maxOutputTokens: 10
      });
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      this.updateProviderHealth(provider, true, latency);
      
    } catch (error) {
      this.updateProviderHealth(provider, false, 0);
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.runHealthChecks();
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}