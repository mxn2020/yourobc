// src/features/ai-testing/utils/test-validators.ts
import type { ValidationResult } from '@/features/boilerplate/ai-core/types';
import type { TestFormData, TestComparisonConfig, ParameterTuningConfig, BatchTestConfig } from '../types/test.types';
import { validateModelId, validatePrompt, validateParameters } from '@/features/boilerplate/ai-core/utils';

export function validateTestForm(data: TestFormData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.name.trim()) errors.push('Test name is required');
  if (!data.type) errors.push('Test type is required');
  if (!data.modelId) errors.push('Model selection is required');
  
  if (data.iterations < 1) errors.push('Iterations must be at least 1');
  if (data.iterations > 100) warnings.push('High iteration count may take significant time');
  
  if (data.timeout < 5000) warnings.push('Very short timeout may cause premature failures');
  if (data.timeout > 300000) warnings.push('Very long timeout may delay test completion');

  const modelValidation = validateModelId(data.modelId);
  errors.push(...modelValidation.errors);
  warnings.push(...modelValidation.warnings);

  if (data.parameters.prompt) {
    const promptValidation = validatePrompt(data.parameters.prompt);
    errors.push(...promptValidation.errors);
    warnings.push(...promptValidation.warnings);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateComparisonConfig(config: TestComparisonConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.baselineModelId) errors.push('Baseline model is required');
  if (config.comparisonModels.length === 0) errors.push('At least one comparison model is required');
  if (config.comparisonModels.length > 5) warnings.push('Many models may increase test duration significantly');

  const allModels = [config.baselineModelId, ...config.comparisonModels];
  const duplicates = allModels.filter((model, index) => allModels.indexOf(model) !== index);
  if (duplicates.length > 0) errors.push('Duplicate models detected in comparison');

  if (!config.testParameters.prompt) errors.push('Test prompt is required for comparison');

  return { valid: errors.length === 0, errors, warnings };
}

export function validateParameterTuning(config: ParameterTuningConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.modelId) errors.push('Model ID is required');
  if (!config.testPrompt.trim()) errors.push('Test prompt is required');
  if (config.tuningParameters.length === 0) errors.push('At least one parameter to tune is required');

  for (const param of config.tuningParameters) {
    if (param.values.length === 0) {
      errors.push(`No values specified for parameter: ${String(param.name)}`);
    }
    if (param.values.length > 10) {
      warnings.push(`Many values for ${String(param.name)} may significantly increase test time`);
    }
  }

  const totalCombinations = config.tuningParameters.reduce((acc, param) => acc * param.values.length, 1);
  if (totalCombinations > 50) {
    warnings.push(`${totalCombinations} parameter combinations will create many tests`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateBatchTest(config: BatchTestConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.modelIds.length === 0) errors.push('At least one model is required');
  if (config.testCases.length === 0) errors.push('At least one test case is required');
  
  if (config.modelIds.length > 5) warnings.push('Many models may increase test duration');
  if (config.testCases.length > 20) warnings.push('Many test cases may increase test duration');

  for (const testCase of config.testCases) {
    if (!testCase.name.trim()) errors.push('Test case name is required');
    if (!testCase.prompt.trim()) errors.push(`Prompt is required for test case: ${testCase.name}`);
  }

  const totalTests = config.modelIds.length * config.testCases.length;
  if (totalTests > 100) {
    warnings.push(`${totalTests} total tests will be created from this batch configuration`);
  }

  return { valid: errors.length === 0, errors, warnings };
}