// src/core/ai/utils/error-handler.ts
import type { ModelProvider } from '../types/ai-models.types';
import type { AIOperationType } from '../types/ai-core.types';
import { Id } from "@/convex/_generated/dataModel";

export interface AIErrorContext {
  provider: ModelProvider;
  operation: AIOperationType;
  modelId?: string;
  requestId?: string;
  userId?: Id<"userProfiles">;
  retryCount?: number;
}

export interface ProcessedError {
  message: string;
  type: ErrorType;
  code?: string;
  isRetryable: boolean;
  retryDelay?: number;
  userMessage: string;
  technicalDetails: string;
  context: AIErrorContext;
}

export type ErrorType =
  | 'rate_limit'
  | 'authentication'
  | 'authorization'
  | 'invalid_request'
  | 'validation'
  | 'model_not_found'
  | 'context_length_exceeded'
  | 'content_filter'
  | 'network_error'
  | 'timeout'
  | 'server_error'
  | 'quota_exceeded'
  | 'unknown';

export class AIError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly isRetryable: boolean;
  public readonly retryDelay?: number;
  public readonly context: AIErrorContext;
  public readonly technicalDetails: string;
  public readonly recoverySuggestions: string[];

  constructor(
    message: string,
    type: ErrorType,
    options: {
      code?: string;
      isRetryable: boolean;
      retryDelay?: number;
      context: AIErrorContext;
      technicalDetails: string;
      recoverySuggestions: string[];
    }
  ) {
    super(message);
    this.name = 'AIError';
    this.type = type;
    this.code = options.code;
    this.isRetryable = options.isRetryable;
    this.retryDelay = options.retryDelay;
    this.context = options.context;
    this.technicalDetails = options.technicalDetails;
    this.recoverySuggestions = options.recoverySuggestions;
  }
}

/**
 * Internal representation of extracted error data
 */
interface BaseError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * Extended Error type with optional properties that may exist on various error objects
 */
interface ExtendedError extends Error {
  code?: string;
  status?: number;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export class ErrorHandler {
  private readonly retryableErrors = new Set<ErrorType>([
    'rate_limit',
    'network_error',
    'timeout',
    'server_error'
  ]);

  private readonly retryDelays: Record<ErrorType, number> = {
    'rate_limit': 60000, // 1 minute
    'network_error': 5000, // 5 seconds
    'timeout': 10000, // 10 seconds
    'server_error': 30000, // 30 seconds
    'authentication': 0,
    'authorization': 0,
    'invalid_request': 0,
    'validation': 0,
    'model_not_found': 0,
    'context_length_exceeded': 0,
    'content_filter': 0,
    'quota_exceeded': 86400000, // 24 hours
    'unknown': 5000
  };

  /**
   * Handle provider-specific errors
   */
  public handleProviderError(
    error: unknown,
    provider: ModelProvider,
    operation: AIOperationType,
    context: Partial<AIErrorContext> = {}
  ): never {
    const processedError = this.processError(error, { provider, operation, ...context });

    // Log error for monitoring
    this.logError(processedError);

    // Create enhanced error with context
    const enhancedError = this.createEnhancedError(processedError);

    throw enhancedError;
  }

  /**
   * Process raw error into structured format
   */
  public processError(error: unknown, context: AIErrorContext): ProcessedError {
    const baseError = this.extractBaseError(error);
    const errorType = this.classifyError(baseError, context.provider);

    return {
      message: baseError.message,
      type: errorType,
      code: baseError.code,
      isRetryable: this.retryableErrors.has(errorType),
      retryDelay: this.retryDelays[errorType],
      userMessage: this.generateUserMessage(errorType, context),
      technicalDetails: this.generateTechnicalDetails(baseError, context),
      context
    };
  }

  /**
   * Check if error is retryable
   */
  public isRetryable(error: ProcessedError): boolean {
    return error.isRetryable && (error.context.retryCount || 0) < 3;
  }

  /**
   * Get retry delay for error
   */
  public getRetryDelay(error: ProcessedError): number {
    const baseDelay = error.retryDelay || 5000;
    const retryCount = error.context.retryCount || 0;

    // Exponential backoff
    return baseDelay * Math.pow(2, retryCount);
  }

  /**
   * Create error recovery suggestions
   */
  public getRecoverySuggestions(error: ProcessedError): string[] {
    const suggestions: string[] = [];

    switch (error.type) {
      case 'rate_limit':
        suggestions.push('Wait before retrying');
        suggestions.push('Consider reducing request frequency');
        suggestions.push('Use request batching if available');
        break;

      case 'context_length_exceeded':
        suggestions.push('Reduce input text length');
        suggestions.push('Use prompt caching for repeated content');
        suggestions.push('Consider using a model with larger context window');
        break;

      case 'authentication':
        suggestions.push('Check API key configuration');
        suggestions.push('Verify API key is still valid');
        suggestions.push('Check provider account status');
        break;

      case 'model_not_found':
        suggestions.push('Verify model ID is correct');
        suggestions.push('Check if model is available in your region');
        suggestions.push('Try alternative model');
        break;

      case 'content_filter':
        suggestions.push('Review prompt content for policy violations');
        suggestions.push('Rephrase sensitive content');
        suggestions.push('Use content moderation guidelines');
        break;

      case 'quota_exceeded':
        suggestions.push('Check account usage limits');
        suggestions.push('Upgrade account plan if needed');
        suggestions.push('Wait for quota reset');
        break;

      case 'timeout':
        suggestions.push('Retry with shorter content');
        suggestions.push('Check network connectivity');
        suggestions.push('Consider using streaming for long responses');
        break;

      default:
        suggestions.push('Check provider status page');
        suggestions.push('Try again in a few moments');
        suggestions.push('Contact support if issue persists');
    }

    return suggestions;
  }

  /**
   * Generate user-friendly error report
   */
  public generateErrorReport(error: ProcessedError): {
    title: string;
    description: string;
    suggestions: string[];
    severity: 'low' | 'medium' | 'high';
    category: string;
  } {
    const severity = this.getErrorSeverity(error.type);
    const category = this.getErrorCategory(error.type);

    return {
      title: this.getErrorTitle(error.type),
      description: error.userMessage,
      suggestions: this.getRecoverySuggestions(error),
      severity,
      category
    };
  }

  /**
   * Extract base error information
   */
  private extractBaseError(error: unknown): BaseError {
    // Handle Error instances
    if (error instanceof Error) {
      const extError = error as ExtendedError;
      return {
        message: extError.message,
        code: extError.code,
        status: extError.status ?? (extError.statusCode as number | undefined),
        details: extError.details
      };
    }

    // Handle plain objects
    if (typeof error === 'object' && error !== null) {
      const obj = error as Record<string, unknown>;
      return {
        message: this.extractString(obj.message ?? obj.error) || 'Unknown error',
        code: this.extractString(obj.code ?? obj.error_code),
        status: this.extractNumber(obj.status ?? obj.statusCode ?? obj.status_code),
        details: this.extractObject(obj.details ?? obj.data)
      };
    }

    // Handle primitives
    return {
      message: String(error || 'Unknown error occurred')
    };
  }

  /**
   * Safely extract string value from unknown
   */
  private extractString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Safely extract number value from unknown
   */
  private extractNumber(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
  }

  /**
   * Safely extract object value from unknown
   */
  private extractObject(value: unknown): Record<string, unknown> | undefined {
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : undefined;
  }

  /**
   * Classify error by type
   */
  private classifyError(baseError: BaseError, provider: ModelProvider): ErrorType {
    const message = baseError.message.toLowerCase();
    const code = baseError.code?.toLowerCase();
    const status = baseError.status;

    // Status code based classification
    if (status === 401) return 'authentication';
    if (status === 403) return 'authorization';
    if (status === 404) return 'model_not_found';
    if (status === 413) return 'context_length_exceeded';
    if (status === 429) return 'rate_limit';
    if (status && status >= 500) return 'server_error';

    // Message-based classification
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'rate_limit';
    }

    if (message.includes('context length') || message.includes('token limit')) {
      return 'context_length_exceeded';
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout';
    }

    if (message.includes('network') || message.includes('connection')) {
      return 'network_error';
    }

    if (message.includes('api key') || message.includes('unauthorized')) {
      return 'authentication';
    }

    if (message.includes('quota') || message.includes('billing')) {
      return 'quota_exceeded';
    }

    if (message.includes('content policy') || message.includes('filtered')) {
      return 'content_filter';
    }

    if (message.includes('model not found') || message.includes('unknown model')) {
      return 'model_not_found';
    }

    if (message.includes('validation error') || message.includes('failed to satisfy constraint')) {
      return 'validation';
    }

    // Provider-specific classifications
    switch (provider) {
      case 'openai':
        return this.classifyOpenAIError(message, code);
      case 'anthropic':
        return this.classifyAnthropicError(message, code);
      case 'google':
        return this.classifyGoogleError(message, code);
      case 'bedrock':
        return this.classifyBedrockError(message, code);
      default:
        return 'unknown';
    }
  }

  /**
   * Classify OpenAI specific errors
   */
  private classifyOpenAIError(message: string, code?: string): ErrorType {
    if (code === 'insufficient_quota') return 'quota_exceeded';
    if (code === 'model_not_found') return 'model_not_found';
    if (code === 'context_length_exceeded') return 'context_length_exceeded';
    if (code === 'content_filter') return 'content_filter';

    return 'unknown';
  }

  /**
   * Classify Anthropic specific errors
   */
  private classifyAnthropicError(message: string, code?: string): ErrorType {
    if (message.includes('overloaded')) return 'server_error';
    if (message.includes('invalid request')) return 'invalid_request';

    return 'unknown';
  }

  /**
   * Classify Google specific errors
   */
  private classifyGoogleError(message: string, code?: string): ErrorType {
    if (message.includes('quota exceeded')) return 'quota_exceeded';
    if (message.includes('safety')) return 'content_filter';

    return 'unknown';
  }

  /**
   * Classify Bedrock (Amazon) specific errors
   */
  private classifyBedrockError(message: string, code?: string): ErrorType {
    if (message.includes('validation error') || message.includes('failed to satisfy constraint')) {
      return 'validation';
    }
    if (message.includes('throttling') || message.includes('rate limit')) {
      return 'rate_limit';
    }
    if (message.includes('access denied') || message.includes('unauthorized')) {
      return 'authentication';
    }
    if (message.includes('model not found') || message.includes('unknown model')) {
      return 'model_not_found';
    }

    return 'unknown';
  }

  /**
   * Generate user-friendly message
   */
  private generateUserMessage(errorType: ErrorType, context: AIErrorContext): string {
    const provider = context.provider;
    const operation = context.operation;

    switch (errorType) {
      case 'rate_limit':
        return `${provider} rate limit exceeded. Please wait before making more requests.`;
      case 'authentication':
        return `Authentication failed with ${provider}. Please check your API key.`;
      case 'authorization':
        return `Access denied by ${provider}. Check your account permissions.`;
      case 'validation':
        return `Invalid input parameters. Please check your request format and required fields.`;
      case 'model_not_found':
        return `The requested model is not available on ${provider}.`;
      case 'context_length_exceeded':
        return `Input is too long for the selected model's context window.`;
      case 'content_filter':
        return `Content was filtered by ${provider}'s safety systems.`;
      case 'quota_exceeded':
        return `Usage quota exceeded for ${provider}. Check your billing settings.`;
      case 'timeout':
        return `Request timed out. The ${operation} operation took too long to complete.`;
      case 'network_error':
        return `Network error occurred while connecting to ${provider}.`;
      case 'server_error':
        return `${provider} is experiencing technical difficulties. Please try again.`;
      default:
        return `An error occurred during ${operation} with ${provider}.`;
    }
  }

  /**
   * Generate technical details
   */
  private generateTechnicalDetails(baseError: BaseError, context: AIErrorContext): string {
    const details = [
      `Provider: ${context.provider}`,
      `Operation: ${context.operation}`,
      `Error: ${baseError.message}`
    ];

    if (context.modelId) details.push(`Model: ${context.modelId}`);
    if (context.requestId) details.push(`Request ID: ${context.requestId}`);
    if (baseError.code) details.push(`Code: ${baseError.code}`);
    if (baseError.status) details.push(`Status: ${baseError.status}`);
    if (context.retryCount) details.push(`Retry: ${context.retryCount}`);

    return details.join(' | ');
  }

  /**
   * Create enhanced error object
   */
  private createEnhancedError(processedError: ProcessedError): AIError {
    return new AIError(processedError.userMessage, processedError.type, {
      code: processedError.code,
      isRetryable: processedError.isRetryable,
      retryDelay: processedError.retryDelay,
      context: processedError.context,
      technicalDetails: processedError.technicalDetails,
      recoverySuggestions: this.getRecoverySuggestions(processedError)
    });
  }

  /**
   * Log error for monitoring
   */
  private logError(error: ProcessedError): void {
    const logLevel = this.getLogLevel(error.type);
    const logMessage = `AI Error [${error.type}]: ${error.message}`;

    switch (logLevel) {
      case 'error':
        console.error(logMessage, {
          context: error.context,
          technicalDetails: error.technicalDetails
        });
        break;
      case 'warn':
        console.warn(logMessage, error.context);
        break;
      case 'info':
        console.info(logMessage, error.context);
        break;
    }
  }

  /**
   * Get appropriate log level for error type
   */
  private getLogLevel(errorType: ErrorType): 'error' | 'warn' | 'info' {
    switch (errorType) {
      case 'authentication':
      case 'server_error':
      case 'unknown':
        return 'error';
      case 'rate_limit':
      case 'quota_exceeded':
      case 'timeout':
        return 'warn';
      default:
        return 'info';
    }
  }

  /**
   * Get error severity
   */
  private getErrorSeverity(errorType: ErrorType): 'low' | 'medium' | 'high' {
    switch (errorType) {
      case 'authentication':
      case 'server_error':
      case 'quota_exceeded':
        return 'high';
      case 'rate_limit':
      case 'context_length_exceeded':
      case 'timeout':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Get error category
   */
  private getErrorCategory(errorType: ErrorType): string {
    switch (errorType) {
      case 'authentication':
      case 'authorization':
        return 'Authentication';
      case 'rate_limit':
      case 'quota_exceeded':
        return 'Rate Limiting';
      case 'context_length_exceeded':
      case 'content_filter':
      case 'invalid_request':
        return 'Request Validation';
      case 'network_error':
      case 'timeout':
        return 'Network';
      case 'server_error':
        return 'Provider Issues';
      default:
        return 'General';
    }
  }

  /**
   * Get error title
   */
  private getErrorTitle(errorType: ErrorType): string {
    switch (errorType) {
      case 'rate_limit':
        return 'Rate Limit Exceeded';
      case 'authentication':
        return 'Authentication Failed';
      case 'authorization':
        return 'Access Denied';
      case 'context_length_exceeded':
        return 'Input Too Long';
      case 'content_filter':
        return 'Content Filtered';
      case 'quota_exceeded':
        return 'Quota Exceeded';
      case 'timeout':
        return 'Request Timeout';
      case 'network_error':
        return 'Network Error';
      case 'server_error':
        return 'Server Error';
      case 'model_not_found':
        return 'Model Not Found';
      default:
        return 'Request Failed';
    }
  }
}