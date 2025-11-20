// src/features/system/supporting/forms/index.ts

/**
 * Forms Module - TanStack Form Integration
 *
 * This module provides a complete form solution using TanStack Form:
 * 1. Pre-built Field Components - Ready-to-use form fields
 * 2. Composable Hooks - Flexible hooks for custom implementations
 * 3. Configuration Presets - Quick-start form configurations
 * 4. Validation Utilities - Common validators and composition helpers
 *
 * @example
 * ```tsx
 * // Option 1: Use pre-built components
 * import { TextField, NumberField, SubmitButton } from '@/features/system/supporting/forms'
 *
 * // Option 2: Use hooks and validators
 * import { validators, composeValidators } from '@/features/system/supporting/forms'
 *
 * // Option 3: Use presets
 * import { formPresets, getPreset } from '@/features/system/supporting/forms'
 * const config = getPreset('userProfile')
 * ```
 */

// ============================================================================
// BASE FIELD COMPONENTS
// ============================================================================
export { TextField } from './components/TextField'
export { NumberField } from './components/NumberField'
export { TextareaField } from './components/TextareaField'
export { SelectField } from './components/SelectField'
export { CheckboxField } from './components/CheckboxField'

// ============================================================================
// FORM COMPONENTS
// ============================================================================
export { SubmitButton } from './components/SubmitButton'
export { ResetButton } from './components/ResetButton'

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================
export { FieldInfo } from './components/FieldInfo'
export { FormSection } from './components/FormSection'

// ============================================================================
// PATTERN COMPONENTS
// ============================================================================
export * from './components/patterns'

// ============================================================================
// CONTEXT HOOKS
// ============================================================================
export {
  createFormContexts,
  DefaultFormContext,
  DefaultFieldContext,
  useDefaultFormContext,
  useDefaultFieldContext,
} from './hooks/useFormContext'

// ============================================================================
// VALIDATION HOOKS
// ============================================================================
export {
  validators,
  composeValidators,
  useFieldValidation,
} from './hooks/useFieldValidation'

// ============================================================================
// PATTERN HOOKS
// ============================================================================
export * from './hooks/patterns'

// ============================================================================
// UTILITIES & PRESETS
// ============================================================================
export {
  formPresets,
  getPreset,
  extendPreset,
  presetRecommendations,
  presetExamples,
} from './utils/presets'

// ============================================================================
// TYPES
// ============================================================================
export type {
  BaseFormOptions,
  FieldComponentOptions,
  TextFieldProps,
  NumberFieldProps,
  TextareaFieldProps,
  SelectFieldProps,
  CheckboxFieldProps,
  FormContextValue,
  FieldContextValue,
  FormHookConfig,
  FieldInfoProps,
  FormPreset,
  FormPresetName,
  FieldValidator,
  AsyncFieldValidator,
  SubmitButtonProps,
  ResetButtonProps,
  FieldErrorProps,
  FormSectionProps,
} from './types'

// ============================================================================
// EXAMPLES
// ============================================================================
export { SimpleForm, ComponentForm } from './examples'

// ============================================================================
// RE-EXPORTS FROM TANSTACK FORM
// ============================================================================
export { useForm, useField } from '@tanstack/react-form'
export type { FormApi, FieldApi, ValidationError } from '@tanstack/react-form'
