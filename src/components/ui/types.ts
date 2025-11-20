// src/components/ui/types.ts
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'destructive'
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger' | 'destructive' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'destructive' | 'info' | 'outline' | 'error'
export type BadgeSize = 'sm' | 'md' | 'lg'
export type InputSize = 'sm' | 'md' | 'lg'

// Utility type for creating variant class mappings
export type VariantClasses<T extends string> = Record<T, string>

// Common props for form components
export interface FormComponentProps {
  error?: string
  helpText?: string
  disabled?: boolean
}

// Common props for components with variants and sizes
export interface StyledComponentProps {
  variant?: ComponentVariant
  size?: ComponentSize
}