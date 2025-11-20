// src/components/ui/RadioGroup.tsx
import { forwardRef, useId, useCallback, createContext, useContext, memo } from 'react'
import type { InputHTMLAttributes, ElementRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import type { FormComponentProps } from './types'

// ============================================================================
// CONTEXT
// ============================================================================

interface RadioGroupContextValue {
  value?: string
  name?: string
  disabled?: boolean
  onChange?: (value: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext)
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup')
  }
  return context
}

// ============================================================================
// RADIO GROUP
// ============================================================================

interface RadioGroupProps extends Omit<FormComponentProps, 'disabled'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  disabled?: boolean
  className?: string
  children: ReactNode
  orientation?: 'horizontal' | 'vertical'
}

export const RadioGroup = memo(forwardRef<HTMLDivElement, RadioGroupProps>(
  ({
    value,
    defaultValue,
    onValueChange,
    name,
    disabled = false,
    error,
    helpText,
    className,
    children,
    orientation = 'vertical',
    ...props
  }, ref) => {
    const generatedId = useId()
    const groupName = name || generatedId
    const hasError = Boolean(error)

    const handleChange = useCallback((newValue: string) => {
      onValueChange?.(newValue)
    }, [onValueChange])

    return (
      <div ref={ref} {...props}>
        <RadioGroupContext.Provider
          value={{
            value: value ?? defaultValue,
            name: groupName,
            disabled,
            onChange: handleChange,
          }}
        >
          <div
            className={twMerge(
              'flex',
              orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4',
              className
            )}
            role="radiogroup"
            aria-invalid={hasError}
            aria-describedby={
              error ? `${groupName}-error` :
              helpText ? `${groupName}-help` : undefined
            }
          >
            {children}
          </div>

          {error && (
            <p id={`${groupName}-error`} className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {helpText && !error && (
            <p id={`${groupName}-help`} className="mt-2 text-sm text-gray-500">
              {helpText}
            </p>
          )}
        </RadioGroupContext.Provider>
      </div>
    )
  }
))
RadioGroup.displayName = 'RadioGroup'

// ============================================================================
// RADIO GROUP ITEM
// ============================================================================

interface RadioGroupItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value' | 'size'> {
  value: string
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    radio: 'w-3.5 h-3.5',
    dot: 'w-1.5 h-1.5',
    text: 'text-xs'
  },
  md: {
    radio: 'w-4 h-4',
    dot: 'w-2 h-2',
    text: 'text-sm'
  },
  lg: {
    radio: 'w-5 h-5',
    dot: 'w-2.5 h-2.5',
    text: 'text-base'
  }
}

export const RadioGroupItem = memo(forwardRef<ElementRef<'input'>, RadioGroupItemProps>(
  ({
    value,
    label,
    description,
    size = 'md',
    disabled: itemDisabled,
    className,
    id,
    ...props
  }, ref) => {
    const context = useRadioGroupContext()
    const generatedId = useId()
    const radioId = id || generatedId

    const isDisabled = itemDisabled || context.disabled
    const isChecked = context.value === value
    const sizes = sizeClasses[size]

    const handleChange = useCallback(() => {
      if (!isDisabled) {
        context.onChange?.(value)
      }
    }, [isDisabled, context, value])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
        e.preventDefault()
        context.onChange?.(value)
      }
    }, [isDisabled, context, value])

    return (
      <div className={twMerge('flex items-start', className)}>
        <div className="flex items-center h-5">
          <div className="relative">
            <input
              ref={ref}
              id={radioId}
              type="radio"
              name={context.name}
              value={value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={handleChange}
              className="sr-only"
              {...props}
            />
            <div
              className={twMerge(
                'border rounded-full transition-all cursor-pointer flex items-center justify-center',
                sizes.radio,
                isChecked
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-300 hover:border-gray-400',
                'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={handleChange}
              role="radio"
              aria-checked={isChecked}
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={handleKeyDown}
            >
              {isChecked && (
                <div
                  className={twMerge(
                    'bg-white rounded-full transition-transform',
                    sizes.dot
                  )}
                />
              )}
            </div>
          </div>
        </div>

        {(label || description) && (
          <div className={twMerge('ml-2', sizes.text)}>
            {label && (
              <label
                htmlFor={radioId}
                className={twMerge(
                  'block font-medium cursor-pointer text-gray-900',
                  isDisabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}

            {description && (
              <p className={twMerge(
                'mt-0.5 text-gray-500',
                isDisabled && 'opacity-50'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
))
RadioGroupItem.displayName = 'RadioGroupItem'
