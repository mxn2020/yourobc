// src/features/boilerplate/admin/types/config.types.ts
/**
 * TypeScript types for Feature Configuration Management
 */

import type { Id } from '@/convex/_generated/dataModel';

// ============================================
// CORE TYPES
// ============================================

export type FeatureName =
  | 'auth'
  | 'projects'
  | 'notifications'
  | 'blog'
  | 'payments'
  | 'ai'
  | 'integrations'
  | 'analytics'
  | 'logging'
  | 'supporting';

export type FeatureCategory = 'core' | 'business' | 'integration' | 'utility';

export type ConfigScope = 'global' | 'tenant' | 'user';

export type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export type OverrideSource = 'admin' | 'api' | 'migration' | 'system';

// ============================================
// FEATURE INFO
// ============================================

export interface FeatureInfo {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  category: FeatureCategory;
  dependencies?: string[];
  hasValidation: boolean;
  overrideCount: number;
}

export interface FeatureConfig {
  feature: string;
  config: Record<string, any>;
  metadata: {
    name: string;
    version: string;
    enabled: boolean;
    category: FeatureCategory;
    dependencies?: string[];
  };
  overrides: AppConfig[];
}

// ============================================
// APP CONFIG (from database)
// ============================================

export interface AppConfig {
  _id: Id<'appConfigs'>;
  _creationTime: number;

  // Configuration identification
  feature: string;
  key: string;
  value: any;
  valueType: ValueType;

  // Configuration metadata
  category: string;
  section?: string;
  description?: string;

  // Access control
  scope: ConfigScope;
  tenantId?: string;
  userId?: Id<'userProfiles'>;

  // Validation and constraints
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    required?: boolean;
  };

  // Default and override tracking
  defaultValue: any;
  isOverridden: boolean;
  overrideSource?: OverrideSource;

  // UI presentation
  displayOrder?: number;
  isVisible: boolean;
  isEditable: boolean;
  requiresRestart: boolean;

  // Change tracking
  changeHistory?: Array<{
    value: any;
    changedBy: string;
    changedAt: number;
    reason?: string;
  }>;

  // Standard fields
  metadata: Record<string, any>;
  createdAt: number;
  createdBy: Id<"userProfiles">;
  updatedAt: number;
  updatedBy: string;
  deletedAt?: number;
  deletedBy?: string;
}

// ============================================
// STATE MANAGEMENT
// ============================================

export interface ConfigChange {
  feature: string;
  key: string;
  oldValue: any;
  newValue: any;
  valueType: ValueType;
  requiresRestart: boolean;
  affectedDependencies?: string[];
}

export interface FeatureConfigState {
  [featureId: string]: {
    [key: string]: any;
  };
}

export interface UnsavedChanges {
  changes: Map<string, ConfigChange>;
  hasChanges: boolean;
  criticalChanges: ConfigChange[];
}

// ============================================
// VALIDATION
// ============================================

export interface ValidationError {
  feature: string;
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ValidationResult {
  feature: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationSummary {
  valid: boolean;
  results: ValidationResult[];
  summary: {
    totalFeatures: number;
    validFeatures: number;
    invalidFeatures: number;
    totalErrors: number;
    totalWarnings: number;
  };
}

// ============================================
// UI STATE
// ============================================

export interface ConfigFieldProps {
  feature: string;
  fieldKey: string;
  label: string;
  value: any;
  defaultValue: any;
  valueType: ValueType;
  description?: string;
  advanced?: boolean;
  requiresRestart?: boolean;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    required?: boolean;
  };
  disabled?: boolean;
  onChange: (key: string, value: any) => void;
  onReset: (key: string) => void;
}

export interface FeatureConfigSectionProps {
  feature: FeatureInfo;
  config: Record<string, any>;
  showAdvanced: boolean;
  unsavedChanges: Map<string, ConfigChange>;
  validationErrors: ValidationError[];
  onChange: (key: string, value: any) => void;
  onReset: (featureId: string) => void;
  onResetField: (featureId: string, key: string) => void;
}

export interface ConfigChangeDialogProps {
  open: boolean;
  change: ConfigChange | null;
  onConfirm: () => void;
  onCancel: () => void;
}

// ============================================
// API RESPONSES
// ============================================

export interface SetConfigResponse {
  id: Id<'appConfigs'>;
  action: 'created' | 'updated';
}

export interface ResetConfigResponse {
  success: boolean;
  action?: 'deleted' | 'soft-deleted';
  message?: string;
}

export interface BatchUpdateResponse {
  totalUpdates: number;
  successful: number;
  failed: number;
  results: Array<{
    feature: string;
    key: string;
    value: any;
    valueType: ValueType;
    success: boolean;
    result?: SetConfigResponse;
    error?: string;
  }>;
}

// ============================================
// CONFIGURATION SECTIONS
// ============================================

export interface ConfigSection {
  id: string;
  name: string;
  description?: string;
  fields: string[];
  advanced?: boolean;
}

export interface FeatureConfigDefinition {
  feature: FeatureName;
  sections: ConfigSection[];
  simpleFields: string[]; // Keys to show in simple mode
  advancedFields: string[]; // Keys to show only in advanced mode
}
