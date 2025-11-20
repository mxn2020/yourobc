// src/features/ai-models/services/ModelValidator.ts
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import { validateModelId } from '@/features/boilerplate/ai-core/utils';

export class ModelValidator {
  static validateModel(model: ModelInfo): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const modelIdValidation = validateModelId(model.id);
    if (!modelIdValidation.valid) {
      errors.push(...modelIdValidation.errors);
    }
    
    if (!model.name) errors.push('Model name is required');
    if (!model.provider) errors.push('Provider is required');
    if (!model.type) errors.push('Model type is required');
    if (model.contextWindow <= 0) errors.push('Context window must be positive');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

