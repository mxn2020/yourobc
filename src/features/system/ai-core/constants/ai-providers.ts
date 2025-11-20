// src/core/constants/ai-providers.ts
import type { ModelProvider } from '../types/ai-models.types';

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  models: string[];
  rateLimit: {
    rpm: number; // requests per minute
    tpm: number; // tokens per minute
  };
  supportedFeatures: {
    streaming: boolean;
    functionCalling: boolean;
    jsonMode: boolean;
    vision: boolean;
    embedding: boolean;
    imageGeneration: boolean;
    speechGeneration: boolean;
    transcription: boolean;
    caching: boolean;
  };
  maxContextWindow: number;
  defaultModel: string;
}

export const PROVIDER_CONFIGS: Record<ModelProvider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'gpt-4-vision-preview',
      'text-embedding-3-large',
      'text-embedding-3-small',
      'dall-e-3',
      'dall-e-2',
      'whisper-1',
      'tts-1',
      'tts-1-hd'
    ],
    rateLimit: { rpm: 10000, tpm: 2000000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: true,
      imageGeneration: true,
      speechGeneration: true,
      transcription: true,
      caching: true
    },
    maxContextWindow: 128000,
    defaultModel: 'gpt-4o-mini'
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    rateLimit: { rpm: 4000, tpm: 400000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: false,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: true
    },
    maxContextWindow: 200000,
    defaultModel: 'claude-3-5-sonnet-20241022'
  },
  google: {
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      'gemini-2.5-flash',
      'gemini-2.5-flash-image-preview',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'text-embedding-004'
    ],
    rateLimit: { rpm: 1500, tpm: 1000000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: true,
      imageGeneration: true,
      speechGeneration: false,
      transcription: false,
      caching: true
    },
    maxContextWindow: 2000000,
    defaultModel: 'gemini-2.5-flash'
  },
  xai: {
    name: 'xAI',
    baseUrl: 'https://api.x.ai/v1',
    models: [
      'grok-beta',
      'grok-vision-beta'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: false,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 131072,
    defaultModel: 'grok-beta'
  },
  meta: {
    name: 'Meta',
    baseUrl: 'https://api.llama.meta.com/v1',
    models: [
      'llama-3.2-90b-vision-instruct',
      'llama-3.2-11b-vision-instruct',
      'llama-3.2-3b-instruct',
      'llama-3.2-1b-instruct'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: false,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 131072,
    defaultModel: 'llama-3.2-11b-vision-instruct'
  },
  mistral: {
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    models: [
      'mistral-large-latest',
      'mistral-medium-latest',
      'mistral-small-latest',
      'codestral-latest',
      'mistral-embed'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: false,
      embedding: true,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 131072,
    defaultModel: 'mistral-large-latest'
  },
  cohere: {
    name: 'Cohere',
    baseUrl: 'https://api.cohere.ai/v1',
    models: [
      'command-r-plus',
      'command-r',
      'command',
      'embed-english-v3.0',
      'embed-multilingual-v3.0'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: false,
      vision: false,
      embedding: true,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 128000,
    defaultModel: 'command-r-plus'
  },
  bedrock: {
    name: 'Amazon Bedrock',
    baseUrl: 'https://bedrock-runtime.amazonaws.com',
    models: [
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'anthropic.claude-3-haiku-20240307-v1:0',
      'meta.llama3-2-90b-instruct-v1:0',
      'amazon.titan-embed-text-v2:0',
      'amazon.nova-micro-v1:0',
      'amazon.nova-lite-v1:0',
      'amazon.nova-pro-v1:0'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: true,
      imageGeneration: true,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 200000,
    defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
  },
  vertex: {
    name: 'Google Vertex AI',
    baseUrl: 'https://api.vertex.ai/v1',
    models: [
      'gemini-2.5-flash',
      'gemini-1.5-pro',
      'text-embedding-004'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: true,
      imageGeneration: true,
      speechGeneration: false,
      transcription: false,
      caching: true
    },
    maxContextWindow: 2000000,
    defaultModel: 'gemini-2.5-flash'
  },
  azure: {
    name: 'Azure OpenAI',
    baseUrl: 'https://api.cognitive.microsoft.com/sts/v1.0',
    models: [
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'text-embedding-3-large',
      'dall-e-3'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: true,
      imageGeneration: true,
      speechGeneration: true,
      transcription: true,
      caching: false
    },
    maxContextWindow: 128000,
    defaultModel: 'gpt-4o'
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.1-405b-reasoning',
      'llama-3.1-70b-versatile',
      'llama-3.2-90b-vision-preview',
      'gemma2-9b-it'
    ],
    rateLimit: { rpm: 14400, tpm: 14400 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: false,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 131072,
    defaultModel: 'llama-3.1-70b-versatile'
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      'deepseek-chat',
      'deepseek-coder',
      'deepseek-reasoner'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: false,
      embedding: false,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 65536,
    defaultModel: 'deepseek-chat'
  },
  perplexity: {
    name: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai',
    models: [
      'llama-3.1-sonar-large-128k-online',
      'llama-3.1-sonar-small-128k-online',
      'llama-3.1-sonar-large-128k-chat',
      'llama-3.1-sonar-small-128k-chat'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: false,
      jsonMode: false,
      vision: false,
      embedding: false,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 131072,
    defaultModel: 'llama-3.1-sonar-large-128k-online'
  },
  fireworks: {
    name: 'Fireworks AI',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    models: [
      'accounts/fireworks/models/llama-v3p1-405b-instruct',
      'accounts/fireworks/models/llama-v3p1-70b-instruct',
      'accounts/fireworks/models/qwen2p5-72b-instruct'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: true,
      jsonMode: true,
      vision: true,
      embedding: false,
      imageGeneration: true,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 131072,
    defaultModel: 'accounts/fireworks/models/llama-v3p1-70b-instruct'
  },
  cerebras: {
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    models: [
      'llama3.1-70b',
      'llama3.1-8b'
    ],
    rateLimit: { rpm: 1000, tpm: 100000 },
    supportedFeatures: {
      streaming: true,
      functionCalling: false,
      jsonMode: false,
      vision: false,
      embedding: false,
      imageGeneration: false,
      speechGeneration: false,
      transcription: false,
      caching: false
    },
    maxContextWindow: 131072,
    defaultModel: 'llama3.1-70b'
  }
} as const;

export const PROVIDER_NAMES = Object.fromEntries(
  Object.entries(PROVIDER_CONFIGS).map(([key, config]) => [key, config.name])
) as Record<ModelProvider, string>;

export const PROVIDERS_WITH_VISION = Object.entries(PROVIDER_CONFIGS)
  .filter(([, config]) => config.supportedFeatures.vision)
  .map(([provider]) => provider as ModelProvider);

export const PROVIDERS_WITH_EMBEDDING = Object.entries(PROVIDER_CONFIGS)
  .filter(([, config]) => config.supportedFeatures.embedding)
  .map(([provider]) => provider as ModelProvider);

export const PROVIDERS_WITH_IMAGE_GENERATION = Object.entries(PROVIDER_CONFIGS)
  .filter(([, config]) => config.supportedFeatures.imageGeneration)
  .map(([provider]) => provider as ModelProvider);

export const PROVIDERS_WITH_CACHING = Object.entries(PROVIDER_CONFIGS)
  .filter(([, config]) => config.supportedFeatures.caching)
  .map(([provider]) => provider as ModelProvider);

export const PROVIDER_STATUS_URLS = {
  openai: 'https://status.openai.com',
  anthropic: 'https://status.anthropic.com',
  google: 'https://status.cloud.google.com',
  xai: null,
  meta: null,
  mistral: 'https://status.mistral.ai',
  cohere: 'https://status.cohere.com',
  bedrock: 'https://status.aws.amazon.com',
  vertex: 'https://status.cloud.google.com',
  azure: 'https://status.azure.com',
  groq: 'https://status.groq.com',
  deepseek: null,
  perplexity: null,
  fireworks: null,
  cerebras: null
} as const;