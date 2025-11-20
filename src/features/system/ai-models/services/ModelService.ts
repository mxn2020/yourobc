// src/features/ai-models/services/ModelService.ts
import type { ModelInfo, ModelFilter, ModelSort } from '@/features/system/ai-core/types';
import type { GatewayResponse } from '@/features/system/ai-core/types';

export class ModelService {
  static async getModels(options: {
    filters?: ModelFilter;
    sort?: ModelSort;
    limit?: number;
    forceRefresh?: boolean;
  } = {}): Promise<ModelInfo[]> {
    const params = new URLSearchParams();
    
    if (options.filters?.search) params.set('search', options.filters.search);
    if (options.filters?.type?.length) params.set('type', options.filters.type.join(','));
    if (options.filters?.provider?.length) params.set('provider', options.filters.provider.join(','));
    if (options.filters?.availability?.length) params.set('availability', options.filters.availability.join(','));
    if (options.sort?.field) params.set('sort_field', options.sort.field);
    if (options.sort?.direction) params.set('sort_direction', options.sort.direction);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.forceRefresh) params.set('force_refresh', 'true');

    const response = await fetch(`/api/ai/models?${params}`);
    const data: GatewayResponse<ModelInfo[]> = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }

  static async getModel(modelId: string): Promise<ModelInfo> {
    const encodedModelId = encodeURIComponent(modelId);
    const url = `/api/ai/models/${encodedModelId}`;
    
    console.log('🔍 [ModelService] Fetching model:', {
      originalModelId: modelId,
      encodedModelId,
      url
    });
    
    const response = await fetch(url);
    
    console.log('🔍 [ModelService] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });
    
    const data: GatewayResponse<ModelInfo> = await response.json();
    
    console.log('🔍 [ModelService] Response data:', {
      success: data.success,
      error: data.error,
      hasData: !!data.data
    });
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
}

