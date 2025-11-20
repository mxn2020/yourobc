// src/features/boilerplate/supporting/forms/hooks/useFormContext.ts

import { createContext, useContext } from 'react'
import type { FormApi } from '@tanstack/react-form'

/**
 * Create form and field contexts for type-safe form composition
 *
 * @example
 * ```tsx
 * const { FormContext, FieldContext, useFormContext, useFieldContext } = createFormContexts()
 *
 * // Use in your form components
 * <FormContext.Provider value={form}>
 *   <FieldContext.Provider value={field}>
 *     <MyFieldComponent />
 *   </FieldContext.Provider>
 * </FormContext.Provider>
 * ```
 */
export function createFormContexts<TFormData = any>() {
  const FormContext = createContext<FormApi<TFormData, any, any, any, any, any, any, any, any, any, any, any> | null>(null)
  const FieldContext = createContext<any>(null)

  const useFormContext = () => {
    const context = useContext(FormContext)
    if (!context) {
      throw new Error('useFormContext must be used within a FormContext.Provider')
    }
    return context
  }

  const useFieldContext = () => {
    const context = useContext(FieldContext)
    if (!context) {
      throw new Error('useFieldContext must be used within a FieldContext.Provider')
    }
    return context
  }

  return {
    FormContext,
    FieldContext,
    useFormContext,
    useFieldContext,
  }
}

/**
 * Default form contexts for simple use cases
 */
export const {
  FormContext: DefaultFormContext,
  FieldContext: DefaultFieldContext,
  useFormContext: useDefaultFormContext,
  useFieldContext: useDefaultFieldContext,
} = createFormContexts()
