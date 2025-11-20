// src/components/ui/Chip.tsx
import { forwardRef, memo, useCallback } from 'react'
import type { HTMLAttributes, ElementRef, ReactNode, MouseEvent } from 'react'
import { X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

type ChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'
type ChipSize = 'sm' | 'md' | 'lg'

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: ChipVariant
  size?: ChipSize
  onRemove?: () => void
  removable?: boolean
  disabled?: boolean
  asChild?: boolean
}

const variantClasses: Record<ChipVariant, string> = {
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200'
}

const sizeClasses: Record<ChipSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

const removeButtonSizeClasses: Record<ChipSize, string> = {
  sm: 'ml-1 -mr-0.5 p-0.5',
  md: 'ml-2 -mr-1 p-0.5',
  lg: 'ml-2 -mr-1 p-1'
}

const iconSizeClasses: Record<ChipSize, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-4 w-4'
}

export const Chip = memo(forwardRef<ElementRef<'span'>, ChipProps>(
  ({
    children,
    variant = 'default',
    size = 'md',
    className,
    onRemove,
    removable = false,
    disabled = false,
    asChild = false,
    onClick,
    ...props
  }, ref) => {
    const hasRemove = removable || onRemove
    const isClickable = Boolean(onClick) && !disabled

    const handleRemove = useCallback((e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (!disabled) {
        onRemove?.()
      }
    }, [onRemove, disabled])

    const handleClick = useCallback((e: MouseEvent<HTMLSpanElement>) => {
      if (!disabled && onClick) {
        onClick(e)
      }
    }, [onClick, disabled])

    const chipClassName = twMerge(
      'inline-flex items-center rounded-full border font-medium transition-colors',
      variantClasses[variant],
      sizeClasses[size],
      isClickable && 'cursor-pointer hover:opacity-80',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )

    if (asChild) {
      const child = children as React.ReactElement
      return (
        <span className={chipClassName} {...props}>
          {child}
          {hasRemove && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className={twMerge(
                'rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-1 focus:ring-black/20',
                removeButtonSizeClasses[size],
                disabled && 'cursor-not-allowed hover:bg-transparent'
              )}
              aria-label="Remove"
              tabIndex={disabled ? -1 : 0}
            >
              <X className={iconSizeClasses[size]} />
            </button>
          )}
        </span>
      )
    }

    return (
      <span
        ref={ref}
        className={chipClassName}
        onClick={handleClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable && !disabled ? 0 : undefined}
        onKeyDown={isClickable ? (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            handleClick(e as any)
          }
        } : undefined}
        {...props}
      >
        {children}
        {hasRemove && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className={twMerge(
              'rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-1 focus:ring-black/20',
              removeButtonSizeClasses[size],
              disabled && 'cursor-not-allowed hover:bg-transparent'
            )}
            aria-label="Remove"
            tabIndex={disabled ? -1 : 0}
          >
            <X className={iconSizeClasses[size]} />
          </button>
        )}
      </span>
    )
  }
))
Chip.displayName = 'Chip'