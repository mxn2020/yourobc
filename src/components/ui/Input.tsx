// src/components/ui/Input.tsx
import { forwardRef, useId, memo, useCallback } from 'react'
import type { InputHTMLAttributes, ElementRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import type { InputSize, FormComponentProps } from './types'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, FormComponentProps {
  label?: string
  size?: InputSize
  icon?: ReactNode
  endIcon?: ReactNode
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

export const Input = memo(forwardRef<ElementRef<'input'>, InputProps>(
  ({ 
    label,
    error,
    helpText,
    size = 'md',
    icon,
    endIcon,
    className,
    id,
    disabled = false,
    required = false,
    onChange,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const hasError = Boolean(error)

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
    }, [onChange])

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className={twMerge(
              'block text-sm font-medium text-gray-700 mb-1',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            className={twMerge(
              'block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors',
              sizeClasses[size],
              icon && 'pl-10',
              endIcon && 'pr-10',
              hasError && 'border-red-300 focus:ring-red-500 focus:border-red-500',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : 
              helpText ? `${inputId}-help` : undefined
            }
            {...props}
          />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              {endIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
))
Input.displayName = 'Input'