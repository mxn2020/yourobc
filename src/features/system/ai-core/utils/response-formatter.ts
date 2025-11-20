// src/core/ai/utils/response-formatter.ts
import type {
  AIGenerateResponse,
  AIObjectResponse,
  AIImageResponse,
  AIEmbeddingResponse,
  AISpeechResponse,
  AITranscriptionResponse,
  TokenUsage,
  AIToolCall,
  AIFile
} from '../types/ai-core.types';
import type {
  LanguageModelV2Usage,
  LanguageModelV2FinishReason,
  LanguageModelV2CallWarning,
  SharedV2ProviderMetadata,
  LanguageModelV2ResponseMetadata
} from '@ai-sdk/provider';
import { getErrorCode } from '../types/extended-error.types';

export class ResponseFormatter {
  /**
   * Format text generation response from AI SDK
   */
  public formatTextResponse(
    result: any, // AI SDK result
    latencyMs: number
  ): AIGenerateResponse {
    return {
      text: result.text || '',
      usage: this.extractTokenUsage(result.usage),
      cost: 0, // Will be calculated by cost tracker
      latencyMs,
      finishReason: result.finishReason,
      warnings: this.sanitizeWarnings(result.warnings || []),
      toolCalls: this.extractToolCalls(result.toolCalls),
      files: this.extractFiles(result),
      providerMetadata: this.sanitizeProviderMetadata(result.providerMetadata),
      responseMetadata: this.extractResponseMetadata(result.response),
      gatewayMetadata: this.extractGatewayMetadata(result.providerMetadata)
    };
  }

  /**
   * Format object generation response from AI SDK
   */
  public formatObjectResponse(
    result: any, // AI SDK result
    latencyMs: number
  ): AIObjectResponse {
    return {
      object: result.object || {},
      usage: this.extractTokenUsage(result.usage),
      cost: 0, // Will be calculated by cost tracker
      latencyMs,
      finishReason: result.finishReason
    };
  }

  /**
   * Format image generation response
   */
  public formatImageResponse(
    result: any,
    latencyMs: number
  ): AIImageResponse {
    return {
      images: this.extractImages(result),
      usage: this.extractTokenUsage(result.usage),
      cost: 0,
      latencyMs,
      seed: result.seed
    };
  }

  /**
   * Format embedding response
   */
  public formatEmbeddingResponse(
    result: any,
    latencyMs: number
  ): AIEmbeddingResponse {
    return {
      embeddings: result.embeddings || [],
      usage: this.extractTokenUsage(result.usage),
      cost: 0,
      latencyMs
    };
  }

  /**
   * Format speech generation response
   */
  public formatSpeechResponse(
    result: any,
    latencyMs: number
  ): AISpeechResponse {
    return {
      audio: result.audio || '',
      format: result.format || 'mp3',
      usage: this.extractTokenUsage(result.usage),
      cost: 0,
      latencyMs
    };
  }

  /**
   * Format transcription response
   */
  public formatTranscriptionResponse(
    result: any,
    latencyMs: number
  ): AITranscriptionResponse {
    return {
      text: result.text || '',
      language: result.language,
      segments: result.segments,
      usage: this.extractTokenUsage(result.usage),
      cost: 0,
      latencyMs
    };
  }

  /**
   * Format streaming response metadata
   */
  public formatStreamingMetadata(
    result: any,
    latencyMs: number,
    firstTokenLatency?: number,
    tokensPerSecond?: number
  ): {
    usage: TokenUsage;
    finishReason?: LanguageModelV2FinishReason;
    cost: number;
    latencyMs: number;
    performance: {
      firstTokenLatency?: number;
      tokensPerSecond?: number;
    };
  } {
    return {
      usage: this.extractTokenUsage(result.usage),
      finishReason: result.finishReason,
      cost: 0, // Will be calculated by cost tracker
      latencyMs,
      performance: {
        firstTokenLatency,
        tokensPerSecond
      }
    };
  }

  /**
   * Extract token usage from AI SDK result
   */
  private extractTokenUsage(usage?: LanguageModelV2Usage): TokenUsage {
    if (!usage) {
      return {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0
      };
    }

    return {
      inputTokens: usage.inputTokens || 0,
      outputTokens: usage.outputTokens || 0,
      totalTokens: usage.totalTokens || (usage.inputTokens || 0) + (usage.outputTokens || 0),
      reasoningTokens: usage.reasoningTokens,
      cachedInputTokens: usage.cachedInputTokens
    };
  }


  /**
   * Sanitize warnings for safe storage
   */
  private sanitizeWarnings(warnings: LanguageModelV2CallWarning[]): LanguageModelV2CallWarning[] {
    return warnings.map(warning => {
      switch (warning.type) {
        case 'unsupported-setting':
          return {
            type: 'unsupported-setting',
            setting: warning.setting,
            ...(warning.details && { details: this.sanitizeString(warning.details) })
          };

        case 'unsupported-tool':
          return {
            type: 'unsupported-tool',
            tool: warning.tool, // Keep the tool object as-is since it's part of the interface
            ...(warning.details && { details: this.sanitizeString(warning.details) })
          };

        case 'other':
          return {
            type: 'other',
            message: this.sanitizeString(warning.message)
          };

        default:
          // Fallback for any unknown warning types
          return {
            type: 'other',
            message: this.sanitizeString('Unknown warning type')
          };
      }
    });
  }

  /**
   * Extract tool calls from result
   */
  private extractToolCalls(toolCalls?: any[]): AIToolCall[] | undefined {
    if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
      return undefined;
    }

    return toolCalls.map(call => ({
      id: call.toolCallId || call.id || crypto.randomUUID(),
      name: call.toolName || call.name || 'unknown',
      input: this.sanitizeObject(call.args || call.input) || {},
      output: call.output ? this.sanitizeObject(call.output) : undefined,
      error: call.error ? this.sanitizeString(call.error) : undefined,
      providerExecuted: Boolean(call.providerExecuted)
    }));
  }

  /**
   * Extract files from result
   */
  private extractFiles(result: any): AIFile[] | undefined {
    if (!result.files || !Array.isArray(result.files)) {
      return undefined;
    }

    return result.files.map((file: any) => ({
      type: file.type || 'output',
      mediaType: file.mediaType || 'text/plain',
      data: file.data || '',
      filename: file.filename
    }));
  }

  /**
   * Sanitize provider metadata for storage
   */
  private sanitizeProviderMetadata(metadata?: SharedV2ProviderMetadata): any {
    if (!metadata) return undefined;

    const sanitized: any = {};

    // Common provider metadata fields
    if (metadata.anthropic) {
      sanitized.anthropic = this.sanitizeObject(metadata.anthropic);
    }

    if (metadata.openai) {
      sanitized.openai = this.sanitizeObject(metadata.openai);
    }

    if (metadata.google) {
      sanitized.google = this.sanitizeObject(metadata.google);
    }

    // Generic provider metadata
    for (const [key, value] of Object.entries(metadata)) {
      if (!['anthropic', 'openai', 'google'].includes(key)) {
        sanitized[key] = this.sanitizeObject(value);
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  /**
   * Extract response metadata
   */
  private extractResponseMetadata(response?: any): LanguageModelV2ResponseMetadata | undefined {
    if (!response) return undefined;

    return {
      id: response.id,
      timestamp: response.timestamp ? new Date(response.timestamp) : undefined,
      modelId: response.modelId
    };
  }

  /**
   * Extract gateway-specific metadata
   */
  private extractGatewayMetadata(providerMetadata?: any): any {
    if (!providerMetadata?.gateway) return undefined;

    return this.sanitizeObject(providerMetadata.gateway);
  }

  /**
   * Extract images from generation result
   */
  private extractImages(result: any): Array<{
    url?: string;
    base64?: string;
    width: number;
    height: number;
  }> {
    // Handle AI SDK v5 format with files array
    if (result.files && Array.isArray(result.files)) {
      const imageFiles = result.files.filter((file: any) => 
        file.mediaType && file.mediaType.startsWith('image/')
      );
      
      return imageFiles.map((file: any) => ({
        base64: file.base64,
        url: `data:${file.mediaType};base64,${file.base64}`,
        width: 1024, // Default dimensions - would need actual image parsing
        height: 1024
      }));
    }

    // Handle legacy format
    if (!result.images || !Array.isArray(result.images)) {
      return [];
    }

    return result.images.map((img: any) => ({
      url: img.url,
      base64: img.base64,
      width: img.width || 512,
      height: img.height || 512
    }));
  }

  /**
   * Sanitize string content
   */
  private sanitizeString(str: unknown): string {
    if (typeof str !== 'string') {
      return String(str || '');
    }

    // Remove or escape potentially problematic characters
    return str
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();
  }

  /**
   * Sanitize object for safe storage
   */
  private sanitizeObject(obj: unknown): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)).filter(item => item !== null);
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};

      for (const [key, value] of Object.entries(obj)) {
        const sanitizedValue = this.sanitizeObject(value);
        if (sanitizedValue !== null && sanitizedValue !== undefined) {
          // Ensure key is safe for storage
          const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
          sanitized[sanitizedKey] = sanitizedValue;
        }
      }

      return Object.keys(sanitized).length > 0 ? sanitized : null;
    }

    return null;
  }

  /**
   * Format error response
   */
  public formatErrorResponse(
    error: Error,
    latencyMs: number,
    partialUsage?: LanguageModelV2Usage
  ): {
    error: {
      message: string;
      type: string;
      code?: string;
    };
    usage: TokenUsage;
    cost: number;
    latencyMs: number;
  } {
    return {
      error: {
        message: this.sanitizeString(error.message),
        type: error.constructor.name,
        code: getErrorCode(error)
      },
      usage: this.extractTokenUsage(partialUsage),
      cost: 0,
      latencyMs
    };
  }

  /**
   * Format response for different content types
   */
  public formatByContentType(
    result: any,
    contentType: 'text' | 'json' | 'binary',
    latencyMs: number
  ): any {
    const baseResponse = {
      usage: this.extractTokenUsage(result.usage),
      cost: 0,
      latencyMs,
      finishReason: result.finishReason,
      warnings: this.sanitizeWarnings(result.warnings || [])
    };

    switch (contentType) {
      case 'text':
        return {
          ...baseResponse,
          text: this.sanitizeString(result.text || result.content || '')
        };

      case 'json':
        return {
          ...baseResponse,
          object: this.sanitizeObject(result.object || result.json || {})
        };

      case 'binary':
        return {
          ...baseResponse,
          data: result.data || result.buffer,
          format: result.format || 'binary',
          size: result.size || 0
        };

      default:
        return {
          ...baseResponse,
          data: result
        };
    }
  }

  /**
   * Create response summary for logging
   */
  public createResponseSummary(response: any): {
    hasText: boolean;
    hasObject: boolean;
    hasFiles: boolean;
    hasToolCalls: boolean;
    tokenCount: number;
    responseSize: number;
    contentType: string;
  } {
    const text = response.text || response.content;
    const object = response.object;
    const files = response.files;
    const toolCalls = response.toolCalls;

    let responseSize = 0;
    let contentType = 'unknown';

    if (text) {
      responseSize = text.length;
      contentType = 'text';
    } else if (object) {
      responseSize = JSON.stringify(object).length;
      contentType = 'json';
    } else if (files && files.length > 0) {
      responseSize = files.reduce((total: number, file: any) =>
        total + (file.data?.length || 0), 0);
      contentType = 'files';
    } else if (response.audio) {
      responseSize = response.audio.length;
      contentType = 'audio';
    }

    return {
      hasText: Boolean(text),
      hasObject: Boolean(object),
      hasFiles: Boolean(files && files.length > 0),
      hasToolCalls: Boolean(toolCalls && toolCalls.length > 0),
      tokenCount: response.usage?.totalTokens || 0,
      responseSize,
      contentType
    };
  }

  /**
   * Validate response structure
   */
  public validateResponse(response: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!response.usage) {
      errors.push('Missing usage information');
    } else {
      if (typeof response.usage.totalTokens !== 'number') {
        errors.push('Invalid token usage data');
      }
    }

    if (typeof response.latencyMs !== 'number' || response.latencyMs < 0) {
      errors.push('Invalid latency data');
    }

    // Check content
    const hasContent = response.text || response.object || response.audio ||
      response.embeddings || response.images;

    if (!hasContent) {
      errors.push('Response missing content');
    }

    // Warnings for suspicious data
    if (response.usage && response.usage.totalTokens === 0 && hasContent) {
      warnings.push('Response has content but zero token usage');
    }

    if (response.latencyMs > 60000) {
      warnings.push('Very high latency detected');
    }

    if (response.text && response.text.length > 100000) {
      warnings.push('Very large text response');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Compress response for storage if needed
   */
  public compressResponse(response: any, maxSize: number = 100000): any {
    const responseStr = JSON.stringify(response);

    if (responseStr.length <= maxSize) {
      return response;
    }

    const compressed = { ...response };

    // Truncate large text fields
    if (compressed.text && compressed.text.length > maxSize * 0.7) {
      const truncateAt = Math.floor(maxSize * 0.7);
      compressed.text = compressed.text.substring(0, truncateAt) + '... [truncated]';
      compressed._truncated = true;
    }

    // Remove large metadata
    if (compressed.providerMetadata) {
      compressed.providerMetadata = this.compressMetadata(compressed.providerMetadata);
    }

    // Limit tool calls
    if (compressed.toolCalls && compressed.toolCalls.length > 10) {
      compressed.toolCalls = compressed.toolCalls.slice(0, 10);
      compressed._toolCallsTruncated = true;
    }

    return compressed;
  }

  /**
   * Compress metadata object
   */
  private compressMetadata(metadata: any): any {
    if (!metadata || typeof metadata !== 'object') {
      return metadata;
    }

    const compressed: any = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' && value.length > 1000) {
        compressed[key] = value.substring(0, 1000) + '... [truncated]';
      } else if (Array.isArray(value) && value.length > 50) {
        compressed[key] = value.slice(0, 50);
      } else {
        compressed[key] = value;
      }
    }

    return compressed;
  }
}

export function isTokenUsage(usage: unknown): usage is TokenUsage {
  return (
    typeof usage === 'object' &&
    usage !== null &&
    'inputTokens' in usage &&
    'outputTokens' in usage &&
    'totalTokens' in usage &&
    typeof usage.inputTokens === 'number' &&
    typeof usage.outputTokens === 'number' &&
    typeof usage.totalTokens === 'number'
  )
}
