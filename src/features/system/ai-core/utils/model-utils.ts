// src/utils/ai/model-utils.ts
import type { 
  ModelInfo, 
  ModelProvider, 
  ModelType, 
  ModelFilter, 
  ModelSort,
  ModelCapabilities, 
  ModelAvailability
} from '@/features/boilerplate/ai-core/types';
import { PROVIDER_COLORS, MODEL_TYPE_LABELS, CAPABILITY_ICONS } from '@/features/boilerplate/ai-core/constants';

/**
 * Extract provider from model ID
 */
// Model ID mappings for user-friendly names to internal provider format
const MODEL_ID_MAPPINGS: Record<string, string> = {
  // Amazon Nova models (user-friendly -> bedrock format)
  'amazon/nova-micro': 'bedrock/amazon.nova-micro-v1:0',
  'amazon/nova-lite': 'bedrock/amazon.nova-lite-v1:0', 
  'amazon/nova-pro': 'bedrock/amazon.nova-pro-v1:0',
  // Add more mappings as needed
};

// Provider aliases (user-friendly provider -> internal provider)
const PROVIDER_ALIASES: Record<string, ModelProvider> = {
  'amazon': 'bedrock',
  'aws': 'bedrock',
  'anthropic': 'bedrock', // for anthropic models on bedrock
  'meta': 'bedrock', // for llama models on bedrock
};

/**
 * Resolve user-friendly model ID to internal format
 */
function resolveModelId(modelId: string): string {
  return MODEL_ID_MAPPINGS[modelId] || modelId;
}

export function getProviderFromModelId(modelId: string): ModelProvider {
  // First resolve the model ID to internal format
  const resolvedModelId = resolveModelId(modelId);
  const provider = resolvedModelId.split('/')[0];
  
  // Check for provider aliases
  const actualProvider = PROVIDER_ALIASES[provider] || provider;
  
  return actualProvider as ModelProvider || 'openai';
}

/**
 * Extract provider from model ID (alias for compatibility)
 */
export function extractProvider(modelId: string): ModelProvider {
  const provider = modelId.split('/')[0];
  return provider as ModelProvider || 'openai';
}

/**
 * Format model name for display
 */
export function formatModelName(modelId: string): string {
  const parts = modelId.split('/');
  if (parts.length === 1) return modelId;
  
  // Remove provider prefix and clean up the model name
  const modelName = parts.slice(1).join('/');
  return modelName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Gpt/g, 'GPT')
    .replace(/Api/g, 'API')
    .replace(/Ai/g, 'AI');
}

/**
 * Get model display name with provider
 */
export function getModelDisplayName(model: ModelInfo): string {
  return `${model.name} (${model.provider})`;
}

/**
 * Check if model has specific capability
 */
export function isModelCapable(model: ModelInfo, capability: keyof ModelCapabilities): boolean {
  return Boolean(model.capabilities[capability]);
}

/**
 * Get capability icon name
 */
export function getCapabilityIcon(capability: keyof ModelCapabilities): string {
  return CAPABILITY_ICONS[capability] || 'Circle';
}

/**
 * Filter models based on criteria
 */
export function filterModels(models: ModelInfo[], filter: ModelFilter): ModelInfo[] {
  let filtered = [...models];

  if (filter.search) {
    const searchTerm = filter.search.toLowerCase();
    filtered = filtered.filter(model =>
      model.name.toLowerCase().includes(searchTerm) ||
      model.description.toLowerCase().includes(searchTerm) ||
      model.provider.toLowerCase().includes(searchTerm) ||
      model.id.toLowerCase().includes(searchTerm)
    );
  }

  if (filter.type?.length) {
    filtered = filtered.filter(model => filter.type!.includes(model.type));
  }

  if (filter.provider?.length) {
    filtered = filtered.filter(model => filter.provider!.includes(model.provider));
  }

  if (filter.availability?.length) {
    filtered = filtered.filter(model => filter.availability!.includes(model.availability));
  }

  if (filter.contextWindowMin !== undefined) {
    filtered = filtered.filter(model => model.contextWindow >= filter.contextWindowMin!);
  }

  if (filter.contextWindowMax !== undefined) {
    filtered = filtered.filter(model => model.contextWindow <= filter.contextWindowMax!);
  }

  if (filter.priceRange) {
    filtered = filtered.filter(model => {
      const price = model.pricing.input;
      const { min = 0, max = Infinity } = filter.priceRange!;
      return price >= min && price <= max;
    });
  }

  if (filter.capabilities?.length) {
    filtered = filtered.filter(model =>
      filter.capabilities!.some(cap => 
        model.capabilities[cap as keyof ModelCapabilities]
      )
    );
  }

  if (filter.tags?.length) {
    filtered = filtered.filter(model =>
      filter.tags!.some(tag => model.tags.includes(tag))
    );
  }

  return filtered;
}

/**
 * Sort models based on criteria
 */
export function sortModels(models: ModelInfo[], sort: ModelSort): ModelInfo[] {
  const sorted = [...models];

  sorted.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sort.field) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'provider':
        aValue = a.provider.toLowerCase();
        bValue = b.provider.toLowerCase();
        break;
      case 'pricing.input':
        aValue = a.pricing.input;
        bValue = b.pricing.input;
        break;
      case 'contextWindow':
        aValue = a.contextWindow;
        bValue = b.contextWindow;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'benchmarks.mmlu':
        aValue = a.benchmarks?.mmlu || 0;
        bValue = b.benchmarks?.mmlu || 0;
        break;
      default:
        return 0;
    }

    const comparison = typeof aValue === 'string' 
      ? aValue.localeCompare(bValue as string)
      : aValue - (bValue as number);

    return sort.direction === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Group models by provider
 */
export function groupModelsByProvider(models: ModelInfo[]): Record<ModelProvider, ModelInfo[]> {
  return models.reduce((groups, model) => {
    const provider = model.provider;
    if (!groups[provider]) {
      groups[provider] = [];
    }
    groups[provider].push(model);
    return groups;
  }, {} as Record<ModelProvider, ModelInfo[]>);
}

/**
 * Group models by type
 */
export function groupModelsByType(models: ModelInfo[]): Record<ModelType, ModelInfo[]> {
  return models.reduce((groups, model) => {
    const type = model.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(model);
    return groups;
  }, {} as Record<ModelType, ModelInfo[]>);
}

/**
 * Get models by type
 */
export function getModelsByType(models: ModelInfo[], type: ModelType): ModelInfo[] {
  return models.filter(model => model.type === type);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(models: ModelInfo[], provider: ModelProvider): ModelInfo[] {
  return models.filter(model => model.provider === provider);
}

/**
 * Get unique providers from models
 */
export function getUniqueProviders(models: ModelInfo[]): ModelProvider[] {
  const providers = new Set(models.map(model => model.provider));
  return Array.from(providers).sort();
}

/**
 * Get unique model types from models
 */
export function getUniqueTypes(models: ModelInfo[]): ModelType[] {
  const types = new Set(models.map(model => model.type));
  return Array.from(types).sort();
}

/**
 * Get model type label
 */
export function getModelTypeLabel(type: ModelType): string {
  return MODEL_TYPE_LABELS[type] || type;
}

/**
 * Check if model supports operation type
 */
export function supportsOperationType(model: ModelInfo, operationType: string): boolean {
  switch (operationType) {
    case 'text_generation':
      return model.type === 'language' || model.type === 'multimodal';
    case 'object_generation':
      return (model.type === 'language' || model.type === 'multimodal') && 
             Boolean(model.capabilities.jsonMode);
    case 'embedding':
      return model.type === 'embedding';
    case 'image_generation':
      const isImageType = model.type === 'image';
      const hasImageTag = model.tags && model.tags.includes('image-generation');
      // Fallback: check if model name or description indicates image generation
      const nameIndicatesImage = model.name.toLowerCase().includes('image') || 
                                  model.id.toLowerCase().includes('image');
      const descriptionIndicatesImage = Boolean(model.description && typeof model.description === 'string' &&
                                        (model.description.toLowerCase().includes('image generation') ||
                                         model.description.toLowerCase().includes('generate images') ||
                                         model.description.toLowerCase().includes('text and images')));
      return isImageType || hasImageTag || nameIndicatesImage || descriptionIndicatesImage;
    case 'speech':
    case 'transcription':
      return model.type === 'multimodal';
    default:
      return true;
  }
}

/**
 * Get recommended models for use case
 */
export function getRecommendedModels(
  models: ModelInfo[], 
  useCase: string,
  options: {
    maxResults?: number;
    preferredProvider?: ModelProvider;
    maxCost?: number;
    minContextWindow?: number;
  } = {}
): ModelInfo[] {
  const { 
    maxResults = 3, 
    preferredProvider, 
    maxCost = Infinity,
    minContextWindow = 0
  } = options;

  let filtered = models.filter(model => {
    // Filter by use case
    if (!model.useCases.some(uc => 
      uc.toLowerCase().includes(useCase.toLowerCase())
    )) {
      return false;
    }

    // Filter by cost
    if (model.pricing.input > maxCost) {
      return false;
    }

    // Filter by context window
    if (model.contextWindow < minContextWindow) {
      return false;
    }

    return true;
  });

  // Sort by preference: preferred provider first, then by benchmarks/quality
  filtered.sort((a, b) => {
    // Preferred provider gets priority
    if (preferredProvider) {
      if (a.provider === preferredProvider && b.provider !== preferredProvider) return -1;
      if (b.provider === preferredProvider && a.provider !== preferredProvider) return 1;
    }

    // Then sort by benchmarks (if available)
    const aScore = a.benchmarks?.mmlu || 0;
    const bScore = b.benchmarks?.mmlu || 0;
    if (aScore !== bScore) return bScore - aScore;

    // Finally by cost (lower is better for same quality)
    return a.pricing.input - b.pricing.input;
  });

  return filtered.slice(0, maxResults);
}

/**
 * Compare two models
 */
export function compareModels(modelA: ModelInfo, modelB: ModelInfo): {
  better: 'a' | 'b' | 'tie';
  reasons: string[];
} {
  const reasons: string[] = [];
  let scoreA = 0;
  let scoreB = 0;

  // Compare pricing (lower is better)
  if (modelA.pricing.input < modelB.pricing.input) {
    scoreA += 1;
    reasons.push(`${modelA.name} is more cost-effective`);
  } else if (modelB.pricing.input < modelA.pricing.input) {
    scoreB += 1;
    reasons.push(`${modelB.name} is more cost-effective`);
  }

  // Compare context window (higher is better)
  if (modelA.contextWindow > modelB.contextWindow) {
    scoreA += 1;
    reasons.push(`${modelA.name} has larger context window`);
  } else if (modelB.contextWindow > modelA.contextWindow) {
    scoreB += 1;
    reasons.push(`${modelB.name} has larger context window`);
  }

  // Compare benchmarks if available
  const benchmarkA = modelA.benchmarks?.mmlu || 0;
  const benchmarkB = modelB.benchmarks?.mmlu || 0;
  if (benchmarkA > benchmarkB) {
    scoreA += 1;
    reasons.push(`${modelA.name} has better benchmark scores`);
  } else if (benchmarkB > benchmarkA) {
    scoreB += 1;
    reasons.push(`${modelB.name} has better benchmark scores`);
  }

  // Compare capabilities
  const capabilitiesA = Object.values(modelA.capabilities).filter(Boolean).length;
  const capabilitiesB = Object.values(modelB.capabilities).filter(Boolean).length;
  if (capabilitiesA > capabilitiesB) {
    scoreA += 1;
    reasons.push(`${modelA.name} has more capabilities`);
  } else if (capabilitiesB > capabilitiesA) {
    scoreB += 1;
    reasons.push(`${modelB.name} has more capabilities`);
  }

  if (scoreA > scoreB) return { better: 'a', reasons };
  if (scoreB > scoreA) return { better: 'b', reasons };
  return { better: 'tie', reasons };
}

/**
 * Parse model filters from URL search parameters
 */
export function parseModelFilters(params: URLSearchParams): ModelFilter {
  const filters: ModelFilter = {};

  if (params.get('search')) {
    filters.search = params.get('search')!;
  }

  if (params.get('type')) {
    filters.type = params.get('type')!.split(',') as ModelType[];
  }

  if (params.get('provider')) {
    filters.provider = params.get('provider')!.split(',') as ModelProvider[];
  }

  if (params.get('availability')) {
    filters.availability = params.get('availability')!.split(',') as ModelAvailability[];
  }

  if (params.get('context_min')) {
    filters.contextWindowMin = parseInt(params.get('context_min')!);
  }

  if (params.get('context_max')) {
    filters.contextWindowMax = parseInt(params.get('context_max')!);
  }

  if (params.get('price_min') || params.get('price_max')) {
    filters.priceRange = {};
    if (params.get('price_min')) {
      filters.priceRange.min = parseFloat(params.get('price_min')!);
    }
    if (params.get('price_max')) {
      filters.priceRange.max = parseFloat(params.get('price_max')!);
    }
  }

  if (params.get('capabilities')) {
    filters.capabilities = params.get('capabilities')!.split(',');
  }

  if (params.get('tags')) {
    filters.tags = params.get('tags')!.split(',');
  }

  return filters;
}

/**
 * Parse model sort from URL search parameters
 */
export function parseModelSort(params: URLSearchParams): ModelSort {
  const field = params.get('sort_field') as ModelSort['field'] || 'name';
  const direction = params.get('sort_direction') as 'asc' | 'desc' || 'asc';

  return { field, direction };
}