// src/core/ai/AIModelManager.ts
import { gateway } from '@ai-sdk/gateway';
import type { 
  ModelInfo, 
  ModelFilter, 
  ModelSort, 
  ModelProvider,
  ModelType 
} from '../types/ai-models.types';
import type { AIOperationType } from '../types/ai-core.types';
import { extractProvider } from '@/features/system/ai-core/utils';
import { sortModels, filterModels } from '@/features/system/ai-core/utils';

export interface ModelManagerConfig {
  cacheTimeout?: number;
  maxCacheSize?: number;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

interface CachedModelData {
  models: ModelInfo[];
  timestamp: number;
  etag?: string;
}

export class AIModelManager {
  private cache: CachedModelData | null = null;
  private readonly config: Required<ModelManagerConfig>;
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly providerHealthCache = new Map<ModelProvider, {
    isHealthy: boolean;
    lastCheck: number;
    checkInterval: number;
  }>();

  constructor(config: ModelManagerConfig = {}) {
    this.config = {
      cacheTimeout: config.cacheTimeout ?? 15 * 60 * 1000, // 15 minutes
      maxCacheSize: config.maxCacheSize ?? 1000,
      enableAutoRefresh: config.enableAutoRefresh ?? true,
      refreshInterval: config.refreshInterval ?? 10 * 60 * 1000 // 10 minutes
    };

    if (this.config.enableAutoRefresh) {
      this.startAutoRefresh();
    }
  }

  /**
   * Get all models with optional filtering and sorting
   */
  public async getModels(options: {
    filters?: ModelFilter;
    sort?: ModelSort;
    limit?: number;
    forceRefresh?: boolean;
  } = {}): Promise<ModelInfo[]> {
    const { filters, sort, limit, forceRefresh = false } = options;

    // Get models from cache or fetch
    const allModels = await this.getAllModels(forceRefresh);
    
    // Apply client-side filtering
    let filteredModels = filters ? filterModels(allModels, filters) : allModels;
    
    // Apply client-side sorting
    if (sort) {
      filteredModels = sortModels(filteredModels, sort);
    }
    
    // Apply limit
    if (limit && limit > 0) {
      filteredModels = filteredModels.slice(0, limit);
    }
    
    return filteredModels;
  }

  /**
   * Get a specific model by ID
   */
  public async getModel(modelId: string): Promise<ModelInfo | null> {
    const models = await this.getAllModels();
    return models.find(model => model.id === modelId) || null;
  }

  /**
   * Get models by provider
   */
  public async getModelsByProvider(provider: ModelProvider): Promise<ModelInfo[]> {
    const models = await this.getAllModels();
    return models.filter(model => model.provider === provider);
  }

  /**
   * Get models by type
   */
  public async getModelsByType(type: ModelType): Promise<ModelInfo[]> {
    const models = await this.getAllModels();
    return models.filter(model => model.type === type);
  }

  /**
   * Check if model supports a specific operation
   */
  public supportsOperation(model: ModelInfo, operation: AIOperationType): boolean {
    switch (operation) {
      case 'text_generation':
        return model.type === 'language' || model.type === 'multimodal';
      
      case 'object_generation':
        return (model.type === 'language' || model.type === 'multimodal') && 
               Boolean(model.capabilities.jsonMode);
      
      case 'embedding':
        return model.type === 'embedding';
      
      case 'image_generation':
        // Support dedicated image models
        if (model.type === 'image') return true;
        
        // Support multimodal models that can generate images (like Gemini 2.5 Flash Image)
        if (model.type === 'multimodal' && model.id.includes('image')) return true;
        
        // Support language models with image generation capabilities
        if (model.id.includes('gemini') && model.id.includes('image')) return true;
        
        return false;
      
      case 'speech':
      case 'transcription':
        return model.type === 'multimodal';
      
      case 'test':
        return model.type === 'language' || model.type === 'multimodal';
      
      default:
        return false;
    }
  }

  /**
   * Validate model for specific parameters
   */
  public validateModelForRequest(
    model: ModelInfo,
    operation: AIOperationType,
    parameters: Record<string, unknown> = {}
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if model supports operation
    if (!this.supportsOperation(model, operation)) {
      errors.push(`Model ${model.id} does not support ${operation}`);
    }

    // Check context window limits
    if (parameters.maxTokens && typeof parameters.maxTokens === 'number') {
      if (model.maxOutputTokens && parameters.maxTokens > model.maxOutputTokens) {
        errors.push(`Max tokens ${parameters.maxTokens} exceeds model limit of ${model.maxOutputTokens}`);
      }

      if (parameters.maxTokens > model.contextWindow * 0.9) {
        warnings.push('Requested tokens may approach context window limit');
      }
    }

    // Check temperature bounds
    if (parameters.temperature && typeof parameters.temperature === 'number') {
      if (parameters.temperature < 0 || parameters.temperature > 2) {
        errors.push('Temperature must be between 0 and 2');
      }
    }

    // Check if model is available
    if (model.availability === 'deprecated') {
      warnings.push(`Model ${model.id} is deprecated and may be removed in the future`);
    } else if (model.availability === 'limited') {
      warnings.push(`Model ${model.id} has limited availability`);
    }

    // Check provider health
    const providerHealth = this.getProviderHealth(model.provider);
    if (!providerHealth.isHealthy) {
      warnings.push(`Provider ${model.provider} may be experiencing issues`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get provider health status
   */
  public getProviderHealth(provider: ModelProvider): {
    isHealthy: boolean;
    lastCheck: number;
    checkInterval: number;
  } {
    const cached = this.providerHealthCache.get(provider);
    if (cached) {
      return cached;
    }

    // Default to healthy if not cached
    const defaultHealth = {
      isHealthy: true,
      lastCheck: Date.now(),
      checkInterval: 5 * 60 * 1000 // 5 minutes
    };

    this.providerHealthCache.set(provider, defaultHealth);
    return defaultHealth;
  }

  /**
   * Update provider health status
   */
  public updateProviderHealth(provider: ModelProvider, isHealthy: boolean): void {
    const existing = this.getProviderHealth(provider);
    this.providerHealthCache.set(provider, {
      ...existing,
      isHealthy,
      lastCheck: Date.now()
    });
  }

  /**
   * Get unique providers from cached models
   */
  public async getProviders(): Promise<ModelProvider[]> {
    const models = await this.getAllModels();
    const providers = new Set(models.map(model => model.provider));
    return Array.from(providers).sort();
  }

  /**
   * Get unique model types from cached models
   */
  public async getModelTypes(): Promise<ModelType[]> {
    const models = await this.getAllModels();
    const types = new Set(models.map(model => model.type));
    return Array.from(types).sort();
  }

  /**
   * Clear model cache
   */
  public clearCache(): void {
    this.cache = null;
    this.providerHealthCache.clear();
  }

  /**
   * Force refresh models from API
   */
  public async refreshModels(): Promise<ModelInfo[]> {
    this.cache = null;
    return this.getAllModels(true);
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    cacheSize: number;
    lastUpdate: number | null;
    cacheHitRate: number;
    providerHealthCount: number;
    autoRefreshEnabled: boolean;
  } {
    return {
      cacheSize: this.cache?.models.length || 0,
      lastUpdate: this.cache?.timestamp || null,
      cacheHitRate: 0, // Would need to track hits/misses for this
      providerHealthCount: this.providerHealthCache.size,
      autoRefreshEnabled: this.config.enableAutoRefresh
    };
  }

  /**
   * Shutdown the manager
   */
  public shutdown(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get all models from cache or API
   */
  private async getAllModels(forceRefresh = false): Promise<ModelInfo[]> {
    // Check cache validity
    if (!forceRefresh && this.isCacheValid()) {
      return this.cache!.models;
    }

    try {
      // Fetch from AI Gateway API
      const availableModels = await gateway.getAvailableModels();
      
      // Transform raw models to our ModelInfo format
      const models = this.transformRawModels(availableModels.models || []);
      
      // Update cache
      this.cache = {
        models,
        timestamp: Date.now()
      };

      // Trim cache if too large
      if (models.length > this.config.maxCacheSize) {
        this.cache.models = models.slice(0, this.config.maxCacheSize);
      }

      console.log(`📚 Loaded ${models.length} AI models`);
      return models;

    } catch (error) {
      console.error('Failed to fetch models from AI Gateway:', error);
      
      // Return cached models if available, otherwise empty array
      if (this.cache?.models) {
        console.warn('Using cached models due to fetch failure');
        return this.cache.models;
      }
      
      return [];
    }
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    if (!this.cache) return false;
    
    const now = Date.now();
    const cacheAge = now - this.cache.timestamp;
    
    return cacheAge < this.config.cacheTimeout;
  }

  /**
   * Transform raw gateway models to our ModelInfo format
   */
  private transformRawModels(rawModels: any[]): ModelInfo[] {
    return rawModels.map(rawModel => this.transformModel(rawModel))
                    .filter(model => model !== null) as ModelInfo[];
  }

  /**
   * Transform individual model from gateway format to ModelInfo
   */
  private transformModel(rawModel: any): ModelInfo | null {
    try {
      const provider = extractProvider(rawModel.id);
      const modelType = this.mapModelType(rawModel.modelType || rawModel.type || 'language');
      
      return {
        id: rawModel.id,
        name: rawModel.name || this.generateModelName(rawModel.id),
        provider,
        type: modelType,
        description: rawModel.description || `${rawModel.name || rawModel.id} model`,
        contextWindow: rawModel.contextWindow || rawModel.contextLength || 4096,
        maxOutputTokens: rawModel.maxTokens || rawModel.maxOutputTokens,
        pricing: {
          input: parseFloat(rawModel.pricing?.input || '0'),
          output: parseFloat(rawModel.pricing?.output || '0'),
          cachedInput: parseFloat(rawModel.pricing?.cachedInput || '0'),
          cacheCreationInput: parseFloat(rawModel.pricing?.cacheCreationInput || '0'),
          currency: rawModel.pricing?.currency || 'USD',
          unit: rawModel.pricing?.unit || '1M tokens'
        },
        capabilities: {
          functionCalling: Boolean(rawModel.supportsTools || rawModel.capabilities?.functionCalling),
          jsonMode: Boolean(rawModel.supportsJson || rawModel.capabilities?.jsonMode),
          vision: Boolean(rawModel.supportsVision || rawModel.capabilities?.vision),
          codeGeneration: Boolean(rawModel.capabilities?.codeGeneration),
          reasoning: Boolean(rawModel.capabilities?.reasoning),
          multilingual: Boolean(rawModel.capabilities?.multilingual),
          streaming: Boolean(rawModel.supportsStreaming ?? true), // Most models support streaming
          multimodal: Boolean(rawModel.capabilities?.multimodal)
        },
        supportedFormats: rawModel.supportedFormats,
        latencyP95: rawModel.latencyP95,
        availability: rawModel.availability || 'available',
        benchmarks: rawModel.benchmarks || undefined,
        limitations: rawModel.limitations || [],
        useCases: this.generateUseCases(modelType, rawModel.capabilities),
        tags: this.generateTags(rawModel),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`Failed to transform model ${rawModel.id}:`, error);
      return null;
    }
  }

  /**
   * Map raw model type to our ModelType
   */
  private mapModelType(type: string): ModelType {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('embed')) return 'embedding';
    if (lowerType.includes('image') || lowerType.includes('dalle')) return 'image';
    if (lowerType.includes('multimodal') || lowerType.includes('vision')) return 'multimodal';
    return 'language';
  }

  /**
   * Generate user-friendly model name from ID
   */
  private generateModelName(modelId: string): string {
    const parts = modelId.split('/');
    const modelPart = parts[parts.length - 1];
    
    return modelPart
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Gpt/g, 'GPT')
      .replace(/Api/g, 'API')
      .replace(/Ai/g, 'AI');
  }

  /**
   * Generate use cases based on model type and capabilities
   */
  private generateUseCases(type: ModelType, capabilities: any = {}): string[] {
    const useCases: string[] = [];

    switch (type) {
      case 'language':
        useCases.push('Text generation', 'Chat', 'Content creation');
        if (capabilities.functionCalling) useCases.push('Function calling');
        if (capabilities.codeGeneration) useCases.push('Code generation');
        break;
        
      case 'embedding':
        useCases.push('Text embeddings', 'Semantic search', 'Similarity matching');
        break;
        
      case 'image':
        useCases.push('Image generation', 'Image editing', 'Visual content creation');
        break;
        
      case 'multimodal':
        useCases.push('Multimodal understanding', 'Image analysis', 'Visual Q&A');
        if (capabilities.vision) useCases.push('Image description');
        break;
    }

    return useCases;
  }

  /**
   * Generate tags for a model
   */
  private generateTags(rawModel: any): string[] {
    const tags: string[] = ['ai'];
    
    if (rawModel.pricing?.input === 0) tags.push('free');
    if (rawModel.supportsStreaming) tags.push('streaming');
    if (rawModel.supportsTools) tags.push('function-calling');
    if (rawModel.supportsVision) tags.push('vision');
    if (rawModel.supportsJson) tags.push('json-mode');
    
    return tags;
  }

  /**
   * Start auto refresh timer
   */
  private startAutoRefresh(): void {
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshModels();
      } catch (error) {
        console.error('Auto refresh failed:', error);
      }
    }, this.config.refreshInterval);
  }
}