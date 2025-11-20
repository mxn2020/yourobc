// src/features/ai-testing/services/TestValidator.ts
import type { ValidationResult } from '@/features/system/ai-core/types';
import type { TestConfiguration } from '@/features/system/ai-core/types';
import type { TestFormData } from '../types/test.types';
import { validateTestConfiguration } from '@/features/system/ai-core/utils';
import { validateTestForm } from '../utils/test-validators';

export class TestValidator {
  validateForm(data: TestFormData): ValidationResult {
    return validateTestForm(data);
  }

  validateConfiguration(config: TestConfiguration): ValidationResult {
    return validateTestConfiguration(config);
  }

  validateBatch(configurations: TestConfiguration[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (configurations.length === 0) {
      errors.push('At least one test configuration is required');
      return { valid: false, errors, warnings };
    }

    if (configurations.length > 50) {
      warnings.push(`${configurations.length} tests may take significant time to complete`);
    }

    for (const [index, config] of configurations.entries()) {
      const validation = this.validateConfiguration(config);
      
      validation.errors.forEach(error => 
        errors.push(`Test ${index + 1}: ${error}`)
      );
      validation.warnings.forEach(warning => 
        warnings.push(`Test ${index + 1}: ${warning}`)
      );
    }

    const totalCost = this.estimateBatchCost(configurations);
    if (totalCost > 10) {
      warnings.push(`Estimated batch cost: $${totalCost.toFixed(2)}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateModelAvailability(modelIds: string[]): Promise<ValidationResult> {
    return this.checkModelAvailability(modelIds);
  }

  private async checkModelAvailability(modelIds: string[]): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const response = await fetch('/api/ai/models', {
        method: 'GET'
      });

      if (!response.ok) {
        warnings.push('Unable to verify model availability');
        return { valid: true, errors, warnings };
      }

      const data = await response.json();
      const availableModels = new Set(data.data?.map((m: any) => m.id) || []);

      for (const modelId of modelIds) {
        if (!availableModels.has(modelId)) {
          errors.push(`Model not available: ${modelId}`);
        }
      }
    } catch {
      warnings.push('Model availability check failed');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private estimateBatchCost(configurations: TestConfiguration[]): number {
    return configurations.reduce((total, config) => {
      const promptTokens = Math.ceil((config.parameters.prompt?.length || 0) / 4);
      const maxTokens = config.parameters.maxTokens || 500;
      const iterations = config.iterations || 1;
      
      const estimatedCost = ((promptTokens * 0.000015) + (maxTokens * 0.00006)) * iterations;
      return total + estimatedCost;
    }, 0);
  }
}