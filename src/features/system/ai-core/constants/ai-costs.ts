// src/core/constants/ai-costs.ts
import type { ModelProvider } from '../types/ai-models.types';

export interface CostConfiguration {
  currency: 'USD' | 'EUR' | 'GBP';
  precision: number; // decimal places for cost display
  minimumCharge: number; // minimum cost to display (e.g., 0.0001)
  costPerThousandCallsThreshold: number; // when to show cost per 1000 calls
  budgetLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  alertThresholds: {
    warning: number; // percentage of budget
    critical: number; // percentage of budget
  };
}

export const DEFAULT_COST_CONFIG: CostConfiguration = {
  currency: 'USD',
  precision: 6,
  minimumCharge: 0.0001,
  costPerThousandCallsThreshold: 0.0001,
  budgetLimits: {
    daily: 100,
    weekly: 500,
    monthly: 1000
  },
  alertThresholds: {
    warning: 80,
    critical: 95
  }
} as const;

export const COST_TIERS = {
  FREE: { 
    min: 0, 
    max: 0, 
    label: 'Free', 
    color: '#10B981', 
    backgroundColor: '#ECFDF5',
    description: 'No cost incurred'
  },
  VERY_LOW: { 
    min: 0, 
    max: 0.001, 
    label: 'Very Low', 
    color: '#3B82F6', 
    backgroundColor: '#EFF6FF',
    description: 'Minimal cost impact'
  },
  LOW: { 
    min: 0.001, 
    max: 0.01, 
    label: 'Low', 
    color: '#06B6D4', 
    backgroundColor: '#ECFEFF',
    description: 'Low cost usage'
  },
  MEDIUM: { 
    min: 0.01, 
    max: 0.1, 
    label: 'Medium', 
    color: '#F59E0B', 
    backgroundColor: '#FFFBEB',
    description: 'Moderate cost usage'
  },
  HIGH: { 
    min: 0.1, 
    max: 1, 
    label: 'High', 
    color: '#EF4444', 
    backgroundColor: '#FEF2F2',
    description: 'High cost usage - monitor carefully'
  },
  VERY_HIGH: { 
    min: 1, 
    max: Infinity, 
    label: 'Very High', 
    color: '#7C2D12', 
    backgroundColor: '#FEF7F0',
    description: 'Very high cost usage - review immediately'
  }
} as const;

export const TOKEN_ESTIMATION_RATIOS = {
  // Characters to tokens ratio for different languages/content types
  english: 4, // ~4 characters per token
  code: 3.5, // code is typically more token-dense
  multilingual: 3, // non-English languages often use more tokens
  technical: 3.8, // technical content
  conversational: 4.2 // casual conversation
} as const;

export const COST_CALCULATION_MODES = {
  EXACT: 'exact', // Use exact token counts from API
  ESTIMATED: 'estimated', // Use character-based estimation
  HYBRID: 'hybrid' // Use estimation with API correction
} as const;

export const PROVIDER_COST_MULTIPLIERS: Record<ModelProvider, number> = {
  // Some providers might have additional fees or discounts
  openai: 1.0,
  anthropic: 1.0,
  google: 1.0,
  xai: 1.0,
  meta: 1.0,
  mistral: 1.0,
  cohere: 1.0,
  bedrock: 1.05, // slight markup for AWS infrastructure
  vertex: 1.03, // slight markup for GCP infrastructure
  azure: 1.02, // slight markup for Azure infrastructure
  groq: 1.0,
  deepseek: 1.0,
  perplexity: 1.0,
  fireworks: 1.0,
  cerebras: 1.0
} as const;

export const BATCH_PROCESSING_DISCOUNTS = {
  // Volume discounts for batch processing
  SMALL: { threshold: 100, discount: 0.95 }, // 5% discount
  MEDIUM: { threshold: 1000, discount: 0.90 }, // 10% discount
  LARGE: { threshold: 10000, discount: 0.85 }, // 15% discount
  ENTERPRISE: { threshold: 100000, discount: 0.80 } // 20% discount
} as const;

export const COST_TRACKING_PERIODS = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const;

export const COST_ALERT_TYPES = {
  BUDGET_WARNING: 'budget_warning',
  BUDGET_CRITICAL: 'budget_critical',
  BUDGET_EXCEEDED: 'budget_exceeded',
  UNUSUAL_SPENDING: 'unusual_spending',
  HIGH_COST_MODEL: 'high_cost_model'
} as const;

export const COST_FORMATTING_OPTIONS = {
  // Different ways to display costs based on magnitude
  MICRO: { threshold: 0.0001, format: '$0.000000', suffix: '' },
  MILLI: { threshold: 0.01, format: '$0.0000', suffix: '' },
  STANDARD: { threshold: 1, format: '$0.00', suffix: '' },
  PER_THOUSAND: { threshold: Infinity, format: '$0.0000', suffix: '/1K calls' }
} as const;

export const BUDGET_CATEGORIES = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  PRODUCTION: 'production',
  RESEARCH: 'research',
  PERSONAL: 'personal'
} as const;

export const COST_OPTIMIZATION_STRATEGIES = {
  MODEL_SELECTION: 'model_selection', // Choose cheaper models when possible
  CACHING: 'caching', // Use prompt caching to reduce costs
  BATCHING: 'batching', // Batch requests for better rates
  COMPRESSION: 'compression', // Compress prompts to reduce token usage
  EARLY_STOPPING: 'early_stopping' // Stop generation early when possible
} as const;