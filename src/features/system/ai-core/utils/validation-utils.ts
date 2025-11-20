// src/utils/ai/validation-utils.ts
import type { ModelInfo, ModelProvider } from '@/features/system/ai-core/types';
import type { AIOperationType, AIParameters, ValidationResult } from '@/features/system/ai-core/types';
import { PROVIDER_CONFIGS } from '@/features/system/ai-core/constants';
import { TestConfiguration } from '@/features/system/ai-core/types';
import { AIUsageFilter } from '@/features/system/ai-core/types';
import { LanguageModelV2FinishReason } from '@ai-sdk/provider';
import { getProviderFromModelId } from './model-utils';
import { Id } from '@/convex/_generated/dataModel'

/**
 * Validate model ID format
 */
export function validateModelId(modelId: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!modelId) {
    errors.push('Model ID is required');
    return { valid: false, errors, warnings };
  }
  
  if (typeof modelId !== 'string') {
    errors.push('Model ID must be a string');
    return { valid: false, errors, warnings };
  }
  
  const parts = modelId.split('/');
  if (parts.length < 2) {
    errors.push('Model ID must be in format: provider/model-name');
    return { valid: false, errors, warnings };
  }
  
  const [provider, ...modelParts] = parts;
  const modelName = modelParts.join('/');
  
  if (!provider || provider.length === 0) {
    errors.push('Provider name cannot be empty');
  }
  
  if (!modelName || modelName.length === 0) {
    errors.push('Model name cannot be empty');
  }
  
  // Use the getProviderFromModelId function to resolve provider aliases
  const resolvedProvider = getProviderFromModelId(modelId);
  
  // Check if resolved provider is known
  if (!(resolvedProvider in PROVIDER_CONFIGS)) {
    if (resolvedProvider !== provider) {
      warnings.push(`Unknown provider: ${resolvedProvider} (resolved from: ${provider})`);
    } else {
      warnings.push(`Unknown provider: ${provider}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate AI parameters against model constraints
 */
export function validateParameters(
  parameters: AIParameters,
  model: ModelInfo
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Temperature validation
  if (parameters.temperature !== undefined) {
    if (parameters.temperature < 0 || parameters.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    } else if (parameters.temperature > 1.5) {
      warnings.push('High temperature may produce less coherent results');
    }
  }
  
  // Max tokens validation
  if (parameters.maxTokens !== undefined) {
    if (parameters.maxTokens < 1) {
      errors.push('Max tokens must be at least 1');
    }
    
    if (model.maxOutputTokens && parameters.maxTokens > model.maxOutputTokens) {
      errors.push(`Max tokens cannot exceed model limit of ${model.maxOutputTokens}`);
    }
    
    if (parameters.maxTokens > model.contextWindow) {
      errors.push(`Max tokens cannot exceed context window of ${model.contextWindow}`);
    }
    
    if (parameters.maxTokens > model.contextWindow * 0.8) {
      warnings.push('Requesting tokens close to context window limit may cause truncation');
    }
  }
  
  // Top-p validation
  if (parameters.topP !== undefined) {
    if (parameters.topP < 0 || parameters.topP > 1) {
      errors.push('Top-p must be between 0 and 1');
    }
  }
  
  // Top-k validation
  if (parameters.topK !== undefined) {
    if (parameters.topK < 1) {
      errors.push('Top-k must be at least 1');
    } else if (parameters.topK > 100) {
      warnings.push('Very high top-k values may reduce output quality');
    }
  }
  
  // Frequency and presence penalty validation
  if (parameters.frequencyPenalty !== undefined) {
    if (parameters.frequencyPenalty < -2 || parameters.frequencyPenalty > 2) {
      errors.push('Frequency penalty must be between -2 and 2');
    }
  }
  
  if (parameters.presencePenalty !== undefined) {
    if (parameters.presencePenalty < -2 || parameters.presencePenalty > 2) {
      errors.push('Presence penalty must be between -2 and 2');
    }
  }
  
  // Response format validation
  if (parameters.responseFormat) {
    if (!model.capabilities.jsonMode && parameters.responseFormat.type === 'json') {
      errors.push('Model does not support JSON mode');
    }
  }
  
  // Tools validation
  if (parameters.tools && parameters.tools.length > 0) {
    if (!model.capabilities.functionCalling) {
      errors.push('Model does not support function calling');
    }
    
    for (const tool of parameters.tools) {
      if (!tool.name) {
        errors.push('Tool name is required');
      }
      
      if (!tool.inputSchema) {
        warnings.push(`Tool "${tool.name}" has no input schema defined`);
      }
    }
  }
  
  // Stop sequences validation
  if (parameters.stopSequences) {
    if (parameters.stopSequences.length > 4) {
      warnings.push('More than 4 stop sequences may not be supported by all providers');
    }
    
    for (const sequence of parameters.stopSequences) {
      if (sequence.length > 20) {
        warnings.push(`Stop sequence "${sequence}" is longer than recommended (20 chars)`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate prompt content
 */
export function validatePrompt(prompt: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!prompt) {
    errors.push('Prompt is required');
    return { valid: false, errors, warnings };
  }
  
  if (typeof prompt !== 'string') {
    errors.push('Prompt must be a string');
    return { valid: false, errors, warnings };
  }
  
  if (prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
    return { valid: false, errors, warnings };
  }
  
  // Check for potentially problematic content
  if (prompt.length > 50000) {
    warnings.push('Very long prompts may exceed token limits');
  }
  
  if (prompt.includes('\\n\\n\\n\\n')) {
    warnings.push('Excessive line breaks detected - may waste tokens');
  }
  
  // Check for common prompt injection patterns
  const suspiciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /disregard\s+the\s+above/i,
    /forget\s+everything/i,
    /new\s+task\s*:/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(prompt)) {
      warnings.push('Prompt contains patterns that may be interpreted as prompt injection');
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitize prompt content
 */
export function sanitizePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') {
    return '';
  }
  
  return prompt
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    // Remove excessive newlines
    .replace(/\n{4,}/g, '\n\n\n')
    // Trim
    .trim();
}

/**
 * Validate system prompt
 */
export function validateSystemPrompt(systemPrompt: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!systemPrompt) {
    return { valid: true, errors, warnings };
  }
  
  if (typeof systemPrompt !== 'string') {
    errors.push('System prompt must be a string');
    return { valid: false, errors, warnings };
  }
  
  if (systemPrompt.length > 10000) {
    warnings.push('Long system prompts may consume significant tokens');
  }
  
  // Check for role confusion
  if (/you\s+are\s+(the\s+)?(user|human)/i.test(systemPrompt)) {
    warnings.push('System prompt should not instruct the AI to be the user');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate JSON schema for object generation
 */
export function validateJsonSchema(schema: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!schema) {
    errors.push('Schema is required for object generation');
    return { valid: false, errors, warnings };
  }
  
  if (typeof schema !== 'object' || Array.isArray(schema)) {
    errors.push('Schema must be a valid JSON object');
    return { valid: false, errors, warnings };
  }
  
  const schemaObj = schema as Record<string, unknown>;
  
  // Basic JSON Schema validation
  if (!schemaObj.type) {
    warnings.push('Schema should specify a type');
  }
  
  if (schemaObj.type === 'object' && !schemaObj.properties) {
    warnings.push('Object type should define properties');
  }
  
  if (schemaObj.type === 'array' && !schemaObj.items) {
    warnings.push('Array type should define items');
  }
  
  // Check for overly complex schemas
  const stringified = JSON.stringify(schema);
  if (stringified.length > 5000) {
    warnings.push('Very large schemas may impact generation quality');
  }
  
  // Check for circular references (basic check)
  try {
    JSON.stringify(schema);
  } catch (error) {
    errors.push('Schema contains circular references');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate request against rate limits
 */
export function validateRateLimit(
  requests: Array<{ timestamp: number }>,
  provider: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const providerConfig = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
  if (!providerConfig) {
    warnings.push(`Unknown provider: ${provider}`);
    return { valid: true, errors, warnings };
  }
  
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  const recentRequests = requests.filter(req => req.timestamp > oneMinuteAgo);
  
  if (recentRequests.length >= providerConfig.rateLimit.rpm) {
    errors.push(`Rate limit exceeded: ${recentRequests.length}/${providerConfig.rateLimit.rpm} requests per minute`);
  } else if (recentRequests.length >= providerConfig.rateLimit.rpm * 0.8) {
    warnings.push(`Approaching rate limit: ${recentRequests.length}/${providerConfig.rateLimit.rpm} requests per minute`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate file upload for multimodal requests
 */
export function validateFile(
  file: { type: string; size: number; data: string },
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 10 * 1024 * 1024 // 10MB
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${maxSize / 1024 / 1024}MB`);
  }
  
  if (file.size > maxSize * 0.8) {
    warnings.push('Large files may take longer to process');
  }
  
  // Basic base64 validation
  if (file.data && !file.data.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
    errors.push('Invalid file data format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate complete AI request
 */
export function validateAIRequest(request: {
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  parameters?: AIParameters;
  schema?: unknown;
  files?: Array<{ type: string; size: number; data: string }>;
}): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // Validate model ID
  const modelValidation = validateModelId(request.modelId);
  allErrors.push(...modelValidation.errors);
  allWarnings.push(...modelValidation.warnings);
  
  // Validate prompt
  const promptValidation = validatePrompt(request.prompt);
  allErrors.push(...promptValidation.errors);
  allWarnings.push(...promptValidation.warnings);
  
  // Validate system prompt if provided
  if (request.systemPrompt) {
    const systemPromptValidation = validateSystemPrompt(request.systemPrompt);
    allErrors.push(...systemPromptValidation.errors);
    allWarnings.push(...systemPromptValidation.warnings);
  }
  
  // Validate schema if provided (for object generation)
  if (request.schema) {
    const schemaValidation = validateJsonSchema(request.schema);
    allErrors.push(...schemaValidation.errors);
    allWarnings.push(...schemaValidation.warnings);
  }
  
  // Validate files if provided
  if (request.files) {
    for (const file of request.files) {
      const fileValidation = validateFile(file);
      allErrors.push(...fileValidation.errors);
      allWarnings.push(...fileValidation.warnings);
    }
  }
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Type guard to validate sort field values from URL parameters
 */
function isValidSortField(
  field: string | null
): field is 'createdAt' | 'cost' | 'latencyMs' | 'usage.totalTokens' {
  return field !== null && ['createdAt', 'cost', 'latencyMs', 'usage.totalTokens'].includes(field);
}

/**
 * Parse log filters from URL search parameters
 */
export function parseLogFilters(params: URLSearchParams): AIUsageFilter {
  const filters: AIUsageFilter = {};

  // Note: user_id URL param is not supported because userId requires Id<"userProfiles">
  // which cannot be safely constructed from URL strings. Use authenticated queries instead.
  // If you need to filter by user, use the authUserId parameter in the backend query.
  if (params.get('model_id')) filters.modelId = params.get('model_id')!.split(',');
  if (params.get('provider')) filters.provider = params.get('provider')!.split(',') as ModelProvider[];
  if (params.get('request_type')) filters.requestType = params.get('request_type')!.split(',') as AIOperationType[];
  if (params.get('success')) filters.success = params.get('success') === 'true';
  if (params.get('finish_reason')) filters.finishReason = params.get('finish_reason')!.split(',') as LanguageModelV2FinishReason[];
  if (params.get('has_tool_calls')) filters.hasToolCalls = params.get('has_tool_calls') === 'true';
  if (params.get('has_files')) filters.hasFiles = params.get('has_files') === 'true';
  
  // Date range
  if (params.get('date_start') && params.get('date_end')) {
    filters.dateRange = {
      start: new Date(params.get('date_start')!),
      end: new Date(params.get('date_end')!)
    };
  }
  
  // Cost range
  if (params.get('cost_min') || params.get('cost_max')) {
    filters.costRange = {
      min: params.get('cost_min') ? parseFloat(params.get('cost_min')!) : 0,
      max: params.get('cost_max') ? parseFloat(params.get('cost_max')!) : Infinity
    };
  }
  
  // Latency range
  if (params.get('latency_min') || params.get('latency_max')) {
    filters.latencyRange = {
      min: params.get('latency_min') ? parseInt(params.get('latency_min')!) : 0,
      max: params.get('latency_max') ? parseInt(params.get('latency_max')!) : Infinity
    };
  }
  
  // Token range
  if (params.get('token_min') || params.get('token_max')) {
    filters.tokenRange = {
      min: params.get('token_min') ? parseInt(params.get('token_min')!) : 0,
      max: params.get('token_max') ? parseInt(params.get('token_max')!) : Infinity
    };
  }
  
  if (params.get('search')) filters.search = params.get('search')!;
  if (params.get('limit')) filters.limit = parseInt(params.get('limit')!);
  if (params.get('offset')) filters.offset = parseInt(params.get('offset')!);
  
  // Sort
  if (params.get('sort_field') && params.get('sort_direction')) {
    const sortField = params.get('sort_field');
    const sortDirection = params.get('sort_direction');

    // Validate sort field is one of the allowed values
    if (isValidSortField(sortField) && (sortDirection === 'asc' || sortDirection === 'desc')) {
      filters.sort = {
        field: sortField,
        direction: sortDirection
      };
    }
  }
  
  return filters;
}

/**
 * Validate test configuration
 */
export function validateTestConfiguration(config: TestConfiguration): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.id) errors.push('Test configuration ID is required');
  if (!config.name) errors.push('Test name is required');
  if (!config.modelId) errors.push('Model ID is required');
  if (!config.type) errors.push('Test type is required');

  // Validate model ID format
  const modelValidation = validateModelId(config.modelId);
  errors.push(...modelValidation.errors);
  warnings.push(...modelValidation.warnings);

  // Validate parameters based on test type
  if (config.parameters) {
    if (config.type === 'text_generation' && !config.parameters.prompt) {
      errors.push('Prompt is required for text generation tests');
    }

    if (config.type === 'object_generation') {
      if (!config.parameters.prompt) errors.push('Prompt is required for object generation tests');
      if (!config.parameters.schema) errors.push('Schema is required for object generation tests');
    }

    if (config.type === 'image_generation' && !config.parameters.prompt) {
      errors.push('Prompt is required for image generation tests');
    }
  }

  // Validate expected results
  if (config.expectedResults) {
    const { expectedResults } = config;
    
    if (expectedResults.minTokens !== undefined && expectedResults.minTokens < 1) {
      errors.push('Minimum tokens must be at least 1');
    }

    if (expectedResults.maxTokens !== undefined && expectedResults.maxTokens < 1) {
      errors.push('Maximum tokens must be at least 1');
    }

    if (expectedResults.minTokens && expectedResults.maxTokens && 
        expectedResults.minTokens > expectedResults.maxTokens) {
      errors.push('Minimum tokens cannot exceed maximum tokens');
    }

    if (expectedResults.maxLatency !== undefined && expectedResults.maxLatency < 0) {
      errors.push('Maximum latency cannot be negative');
    }

    if (expectedResults.maxCost !== undefined && expectedResults.maxCost < 0) {
      errors.push('Maximum cost cannot be negative');
    }
  }

  // Validate iterations and timeout
  if (config.iterations !== undefined && config.iterations < 1) {
    errors.push('Iterations must be at least 1');
  }

  if (config.timeout !== undefined && config.timeout < 1000) {
    warnings.push('Very short timeouts may cause premature test failures');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
