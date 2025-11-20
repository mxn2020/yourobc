// src/features/system/supporting/forms/hooks/useFieldValidation.ts

import { useCallback } from 'react'
import type { ValidationError } from '@tanstack/react-form'

/**
 * Validator function type that matches TanStack Form's signature
 */
export type ValidatorFn<TValue = any> = (params: { value: TValue }) => ValidationError | undefined

/**
 * Common field validation rules
 */
export const validators = {
  /**
   * Required field validator
   */
  required: (message = 'This field is required') => {
    return ({ value }: { value: any }): ValidationError | undefined => {
      if (value === undefined || value === null || value === '') {
        return message
      }
      return undefined
    }
  },

  /**
   * Minimum length validator
   */
  minLength: (min: number, message?: string) => {
    return ({ value }: { value: string }): ValidationError | undefined => {
      if (value && value.length < min) {
        return message || `Must be at least ${min} characters`
      }
      return undefined
    }
  },

  /**
   * Maximum length validator
   */
  maxLength: (max: number, message?: string) => {
    return ({ value }: { value: string }): ValidationError | undefined => {
      if (value && value.length > max) {
        return message || `Must be no more than ${max} characters`
      }
      return undefined
    }
  },

  /**
   * Email validator
   */
  email: (message = 'Invalid email address') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return ({ value }: { value: string }): ValidationError | undefined => {
      if (value && !emailRegex.test(value)) {
        return message
      }
      return undefined
    }
  },

  /**
   * URL validator
   */
  url: (message = 'Invalid URL') => {
    return ({ value }: { value: string }): ValidationError | undefined => {
      try {
        if (value) {
          new URL(value)
        }
        return undefined
      } catch {
        return message
      }
    }
  },

  /**
   * Pattern validator
   */
  pattern: (regex: RegExp, message = 'Invalid format') => {
    return ({ value }: { value: string }): ValidationError | undefined => {
      if (value && !regex.test(value)) {
        return message
      }
      return undefined
    }
  },

  /**
   * Minimum value validator
   */
  min: (min: number, message?: string) => {
    return ({ value }: { value: number }): ValidationError | undefined => {
      if (value !== undefined && value < min) {
        return message || `Must be at least ${min}`
      }
      return undefined
    }
  },

  /**
   * Maximum value validator
   */
  max: (max: number, message?: string) => {
    return ({ value }: { value: number }): ValidationError | undefined => {
      if (value !== undefined && value > max) {
        return message || `Must be no more than ${max}`
      }
      return undefined
    }
  },

  /**
   * Range validator
   */
  range: (min: number, max: number, message?: string) => {
    return ({ value }: { value: number }): ValidationError | undefined => {
      if (value !== undefined && (value < min || value > max)) {
        return message || `Must be between ${min} and ${max}`
      }
      return undefined
    }
  },

  /**
   * Custom validator
   */
  custom: <T>(fn: (value: T) => boolean, message: string) => {
    return ({ value }: { value: T }): ValidationError | undefined => {
      if (!fn(value)) {
        return message
      }
      return undefined
    }
  },
}

/**
 * Compose multiple validators into one
 *
 * @example
 * ```tsx
 * const validate = composeValidators(
 *   validators.required(),
 *   validators.minLength(3),
 *   validators.email()
 * )
 * ```
 */
export function composeValidators<T>(
  ...validatorFns: Array<({ value }: { value: T }) => ValidationError | undefined>
) {
  return ({ value }: { value: T }): ValidationError | undefined => {
    for (const validator of validatorFns) {
      const error = validator({ value })
      if (error) return error
    }
    return undefined
  }
}

/**
 * Hook for using field validation
 *
 * @example
 * ```tsx
 * const { validate } = useFieldValidation({
 *   required: true,
 *   minLength: 3,
 *   email: true
 * })
 * ```
 */
export function useFieldValidation(config: {
  required?: boolean | string
  minLength?: number | { value: number; message: string }
  maxLength?: number | { value: number; message: string }
  email?: boolean | string
  url?: boolean | string
  pattern?: { value: RegExp; message: string }
  min?: number | { value: number; message: string }
  max?: number | { value: number; message: string }
  custom?: Array<({ value }: { value: any }) => ValidationError | undefined>
}) {
  const validate = useCallback(
    ({ value }: { value: any }): ValidationError | undefined => {
      const validatorFns: Array<({ value }: { value: any }) => ValidationError | undefined> = []

      if (config.required) {
        const message = typeof config.required === 'string' ? config.required : undefined
        validatorFns.push(validators.required(message))
      }

      if (config.minLength) {
        const { value: min, message } =
          typeof config.minLength === 'number'
            ? { value: config.minLength, message: undefined }
            : config.minLength
        validatorFns.push(validators.minLength(min, message))
      }

      if (config.maxLength) {
        const { value: max, message } =
          typeof config.maxLength === 'number'
            ? { value: config.maxLength, message: undefined }
            : config.maxLength
        validatorFns.push(validators.maxLength(max, message))
      }

      if (config.email) {
        const message = typeof config.email === 'string' ? config.email : undefined
        validatorFns.push(validators.email(message))
      }

      if (config.url) {
        const message = typeof config.url === 'string' ? config.url : undefined
        validatorFns.push(validators.url(message))
      }

      if (config.pattern) {
        validatorFns.push(validators.pattern(config.pattern.value, config.pattern.message))
      }

      if (config.min) {
        const { value: min, message } =
          typeof config.min === 'number' ? { value: config.min, message: undefined } : config.min
        validatorFns.push(validators.min(min, message))
      }

      if (config.max) {
        const { value: max, message } =
          typeof config.max === 'number' ? { value: config.max, message: undefined } : config.max
        validatorFns.push(validators.max(max, message))
      }

      if (config.custom) {
        validatorFns.push(...config.custom)
      }

      return composeValidators(...validatorFns)({ value })
    },
    [config]
  )

  return { validate }
}
