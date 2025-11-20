// src/core/constants/ai-models.ts
import type { ModelType, ModelCategory } from '../types/ai-models.types';

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    id: 'language',
    name: 'Language Models',
    description: 'Text generation, completion, and conversation models',
    icon: 'MessageSquare',
    count: 0
  },
  {
    id: 'embedding',
    name: 'Embedding Models',
    description: 'Text and document embedding models for semantic search',
    icon: 'Layers',
    count: 0
  },
  {
    id: 'image',
    name: 'Image Models',
    description: 'Image generation, editing, and analysis models',
    icon: 'Image',
    count: 0
  },
  {
    id: 'multimodal',
    name: 'Multimodal Models',
    description: 'Models that can process multiple input types',
    icon: 'Zap',
    count: 0
  }
] as const;

export const PROVIDER_COLORS = {
  openai: '#10A37F',
  anthropic: '#D97706',
  google: '#4285F4',
  xai: '#000000',
  meta: '#1877F2',
  mistral: '#FF6B35',
  cohere: '#39C5BB',
  bedrock: '#FF9900',
  vertex: '#4285F4',
  azure: '#0078D4',
  groq: '#F55036',
  deepseek: '#1E40AF',
  perplexity: '#20B2AA',
  fireworks: '#FF6B35',
  cerebras: '#6366F1'
} as const;

export const MODEL_CAPABILITIES = [
  'functionCalling',
  'jsonMode',
  'vision',
  'codeGeneration',
  'reasoning',
  'multilingual',
  'streaming',
  'multimodal'
] as const;

export const DEFAULT_MODEL_PREFERENCES = {
  language: 'openai/gpt-4o',
  embedding: 'openai/text-embedding-3-large',
  image: 'google/gemini-2.5-flash-image-preview'
} as const;

export const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  language: 'Language Model',
  embedding: 'Embedding Model',
  image: 'Image Model',
  multimodal: 'Multimodal Model'
} as const;

export const MODEL_TYPE_DESCRIPTIONS: Record<ModelType, string> = {
  language: 'Generate and understand text, engage in conversations, and perform text-based tasks',
  embedding: 'Convert text into numerical vectors for semantic search and similarity matching',
  image: 'Generate, edit, and analyze images from text descriptions',
  multimodal: 'Process and generate content across multiple modalities (text, images, audio)'
} as const;

export const CONTEXT_WINDOW_RANGES = [
  { label: '< 8K', min: 0, max: 8192 },
  { label: '8K - 32K', min: 8192, max: 32768 },
  { label: '32K - 128K', min: 32768, max: 131072 },
  { label: '128K - 1M', min: 131072, max: 1048576 },
  { label: '1M+', min: 1048576, max: Infinity }
] as const;

export const PRICE_RANGES = [
  { label: 'Free', min: 0, max: 0 },
  { label: '< $0.01', min: 0, max: 0.01 },
  { label: '$0.01 - $0.10', min: 0.01, max: 0.10 },
  { label: '$0.10 - $1.00', min: 0.10, max: 1.00 },
  { label: '$1.00+', min: 1.00, max: Infinity }
] as const;

export const DEFAULT_TEST_PROMPTS = {
  language: 'Write a brief summary about artificial intelligence in 2-3 sentences.',
  embedding: 'The quick brown fox jumps over the lazy dog.',
  image: 'A serene landscape with mountains and a lake at sunset',
  multimodal: 'Describe what you see in this image and provide a creative interpretation.'
} as const;

export const BENCHMARK_LABELS = {
  mmlu: 'MMLU (Massive Multitask Language Understanding)',
  hellaswag: 'HellaSwag (Common Sense)',
  humaneval: 'HumanEval (Code Generation)',
  truthfulqa: 'TruthfulQA (Truthfulness)',
  arc: 'ARC (AI2 Reasoning Challenge)',
  gsm8k: 'GSM8K (Math Problem Solving)'
} as const;

export const CAPABILITY_ICONS = {
  functionCalling: 'Function',
  jsonMode: 'Code2',
  vision: 'Eye',
  codeGeneration: 'FileCode',
  reasoning: 'Brain',
  multilingual: 'Languages',
  streaming: 'Zap',
  multimodal: 'Layers3'
} as const;

export const PROVIDER_DOCUMENTATION_URLS = {
  openai: 'https://platform.openai.com/docs',
  anthropic: 'https://docs.anthropic.com',
  google: 'https://ai.google.dev/docs',
  xai: 'https://docs.x.ai/docs',
  meta: 'https://llama.meta.com/docs',
  mistral: 'https://docs.mistral.ai',
  cohere: 'https://docs.cohere.com',
  bedrock: 'https://docs.aws.amazon.com/bedrock',
  vertex: 'https://cloud.google.com/vertex-ai/docs',
  azure: 'https://docs.microsoft.com/azure/cognitive-services/openai',
  groq: 'https://console.groq.com/docs',
  deepseek: 'https://platform.deepseek.com/docs',
  perplexity: 'https://docs.perplexity.ai',
  fireworks: 'https://docs.fireworks.ai',
  cerebras: 'https://docs.cerebras.ai'
} as const;