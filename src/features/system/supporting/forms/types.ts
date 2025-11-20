// src/features/system/supporting/forms/types.ts

import type { FormApi, FieldApi, ValidationError } from '@tanstack/react-form'
import type { ReactNode } from 'react'

/**
 * Base form configuration options
 */
export interface BaseFormOptions<TFormData> {
  /** Default values for the form */
  defaultValues: TFormData
  /** Form-level validation */
  validators?: {
    onChange?: (values: TFormData) => ValidationError | undefined
    onBlur?: (values: TFormData) => ValidationError | undefined
    onSubmit?: (values: TFormData) => ValidationError | undefined
  }
  /** Called when form is submitted */
  onSubmit?: (data: { value: TFormData }) => void | Promise<void>
}

/**
 * Field component binding options
 */
export interface FieldComponentOptions {
  /** Field label */
  label?: string
  /** Field description/help text */
  description?: string
  /** Placeholder text */
  placeholder?: string
  /** Whether field is required */
  required?: boolean
  /** Whether field is disabled */
  disabled?: boolean
  /** Custom className */
  className?: string
}

/**
 * Text field props
 */
export interface TextFieldProps extends FieldComponentOptions {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'url' | 'tel'
  /** Max length */
  maxLength?: number
}

/**
 * Number field props
 */
export interface NumberFieldProps extends FieldComponentOptions {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
}

/**
 * Textarea field props
 */
export interface TextareaFieldProps extends FieldComponentOptions {
  /** Number of rows */
  rows?: number
  /** Max length */
  maxLength?: number
}

/**
 * Select field props
 */
export interface SelectFieldProps<T = string> extends FieldComponentOptions {
  /** Options for the select */
  options: Array<{ value: T; label: string }>
  /** Allow empty selection */
  allowEmpty?: boolean
}

/**
 * Checkbox field props
 */
export interface CheckboxFieldProps extends FieldComponentOptions {
  /** Checkbox label (different from field label) */
  checkboxLabel?: string
}

/**
 * Form context for bound components
 */
export interface FormContextValue<TFormData = any> {
  form: FormApi<TFormData, any, any, any, any, any, any, any, any, any, any, any>
}

/**
 * Field context for bound components
 */
export interface FieldContextValue<TFormData = any, TName = any> {
  field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
}

/**
 * Form hook configuration
 */
export interface FormHookConfig {
  /** Pre-bound field components */
  fieldComponents?: {
    TextField?: React.ComponentType<any>
    NumberField?: React.ComponentType<any>
    TextareaField?: React.ComponentType<any>
    SelectField?: React.ComponentType<any>
    CheckboxField?: React.ComponentType<any>
    [key: string]: React.ComponentType<any> | undefined
  }
  /** Pre-bound form-level components */
  formComponents?: {
    SubmitButton?: React.ComponentType<any>
    ResetButton?: React.ComponentType<any>
    [key: string]: React.ComponentType<any> | undefined
  }
  /** Form context for provider */
  formContext?: React.Context<any>
  /** Field context for provider */
  fieldContext?: React.Context<any>
}

/**
 * Field info display props
 */
export interface FieldInfoProps {
  /** The field API instance */
  field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
  /** Show validation state */
  showValidation?: boolean
}

/**
 * Form preset configuration
 */
export interface FormPreset<TFormData = any> {
  /** Preset name */
  name: string
  /** Description */
  description: string
  /** Default values */
  defaultValues: TFormData
  /** Validation schema or function */
  validators?: BaseFormOptions<TFormData>['validators']
  /** Use case examples */
  useCase: string
}

/**
 * Available form presets
 */
export type FormPresetName =
  | 'userProfile'
  | 'contactForm'
  | 'loginForm'
  | 'registrationForm'
  | 'searchForm'
  | 'settingsForm'

/**
 * Field validator function
 */
export type FieldValidator<T> = (value: T) => ValidationError | undefined

/**
 * Async field validator function
 */
export type AsyncFieldValidator<T> = (value: T) => Promise<ValidationError | undefined>

/**
 * Submit button props
 */
export interface SubmitButtonProps {
  /** Button text */
  children?: ReactNode
  /** Additional className */
  className?: string
  /** Loading state override */
  isLoading?: boolean
}

/**
 * Reset button props
 */
export interface ResetButtonProps {
  /** Button text */
  children?: ReactNode
  /** Additional className */
  className?: string
}

/**
 * Form field error message props
 */
export interface FieldErrorProps {
  /** Errors to display */
  errors?: ValidationError[]
  /** Additional className */
  className?: string
}

/**
 * Form section props for grouping fields
 */
export interface FormSectionProps {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Section content */
  children: ReactNode
  /** Additional className */
  className?: string
}
