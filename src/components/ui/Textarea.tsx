// src/components/ui/Textarea.tsx
import { forwardRef, useId, memo, useCallback } from 'react'
import type { TextareaHTMLAttributes, ElementRef } from 'react'
import { twMerge } from 'tailwind-merge'
import type { FormComponentProps } from './types'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FormComponentProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

const resizeClasses = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize'
}

export const Textarea = memo(forwardRef<ElementRef<'textarea'>, TextareaProps>(
  ({ 
    label,
    error,
    helpText,
    size = 'md',
    resize = 'vertical',
    className,
    id,
    disabled = false,
    required = false,
    onChange,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const textareaId = id || generatedId
    const hasError = Boolean(error)

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e)
    }, [onChange])

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId} 
            className={twMerge(
              'block text-sm font-medium text-gray-700 mb-1',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          className={twMerge(
            'block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors min-h-[80px]',
            sizeClasses[size],
            resizeClasses[resize],
            hasError && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${textareaId}-error` : 
            helpText ? `${textareaId}-help` : undefined
          }
          {...props}
        />
        
        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={`${textareaId}-help`} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
))
Textarea.displayName = 'Textarea'