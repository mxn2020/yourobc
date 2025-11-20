// src/components/ui/Button.tsx
import React, { forwardRef, memo, useCallback } from 'react'
import type { ButtonHTMLAttributes, ElementRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import type { ButtonVariant, ButtonSize } from './types'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
  asChild?: boolean
}

interface ChildElementProps {
  className?: string
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  [key: string]: any
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-transparent focus:ring-gray-500',
  success: 'bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent focus:ring-yellow-500',
  error: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
  destructive: 'bg-red-700 hover:bg-red-800 text-white border-transparent focus:ring-red-600',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent focus:ring-gray-500',
  outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 focus:ring-blue-500'
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

const LoadingSpinner = memo(() => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
))
LoadingSpinner.displayName = 'LoadingSpinner'

export const Button = memo(forwardRef<ElementRef<'button'>, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    className,
    children,
    onClick,
    asChild = false,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        onClick(e)
      }
    }, [isDisabled, onClick])

    const buttonClasses = twMerge(
      'inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    // If asChild is true, apply button classes to the child element
    if (asChild) {
      const child = children as React.ReactElement<ChildElementProps>
      const childProps = child.props
      return React.cloneElement<ChildElementProps>(child, {
        ref,
        className: twMerge(buttonClasses, childProps.className),
        disabled: isDisabled || childProps.disabled,
        onClick: handleClick,
        ...props,
      })
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        className={buttonClasses}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    )
  }
))
Button.displayName = 'Button'