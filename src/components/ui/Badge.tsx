// src/components/ui/Badge.tsx
import { forwardRef, memo } from 'react'
import type { HTMLAttributes, ElementRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import type { BadgeVariant, BadgeSize } from './types'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  asChild?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  destructive: 'bg-red-200 text-red-900 border-red-300',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
}

export const Badge = memo(forwardRef<ElementRef<'span'>, BadgeProps>(
  ({
    children,
    variant = 'secondary',
    size = 'md',
    asChild = false,
    className,
    ...props
  }, ref) => {
    const badgeClassName = twMerge(
      'inline-flex items-center rounded-full border font-medium',
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    if (asChild) {
      const child = children as React.ReactElement
      return (
        <span className={badgeClassName} {...props}>
          {child}
        </span>
      )
    }

    return (
      <span
        ref={ref}
        className={badgeClassName}
        {...props}
      >
        {children}
      </span>
    )
  }
))
Badge.displayName = 'Badge'

// Specific badge components for common use cases
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
}

export const StatusBadge = memo(forwardRef<ElementRef<'span'>, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const variants = {
      active: 'success' as const,
      completed: 'primary' as const,
      on_hold: 'warning' as const,
      cancelled: 'danger' as const
    }
    
    return (
      <Badge ref={ref} variant={variants[status]} {...props}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }
))
StatusBadge.displayName = 'StatusBadge'

interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export const PriorityBadge = memo(forwardRef<ElementRef<'span'>, PriorityBadgeProps>(
  ({ priority, ...props }, ref) => {
    const variants = {
      low: 'secondary' as const,
      medium: 'info' as const,
      high: 'warning' as const,
      urgent: 'danger' as const
    }
    
    return (
      <Badge ref={ref} variant={variants[priority]} {...props}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }
))
PriorityBadge.displayName = 'PriorityBadge'