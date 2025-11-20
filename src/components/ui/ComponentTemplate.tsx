// ComponentTemplate.tsx - Use this as a template for creating new components

import { forwardRef, memo } from 'react'
import type { HTMLAttributes, ElementRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import type { ComponentVariant, ComponentSize, FormComponentProps } from './types'

// 1. Define component-specific types
interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: ComponentVariant
  size?: ComponentSize
  // Add component-specific props here
  customProp?: string
  // For form components, extend FormComponentProps
  // error?: string
  // helpText?: string
  // disabled?: boolean
}

// 2. Define variant and size mappings
const variantClasses: Record<ComponentVariant, string> = {
  default: 'bg-gray-100 text-gray-900 border-gray-200',
  primary: 'bg-blue-100 text-blue-900 border-blue-200',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  destructive: 'bg-red-100 text-red-800 border-red-200'
}

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
  xl: 'px-6 py-4 text-xl',
  '2xl': 'px-8 py-6 text-2xl'
}

// 3. Create the component with forwardRef and proper typing
export const Component = memo(forwardRef<ElementRef<'div'>, ComponentProps>(
  ({ 
    children,
    variant = 'default',
    size = 'md',
    customProp,
    className,
    // For form components, include these:
    // error,
    // helpText, 
    // disabled = false,
    ...props 
  }, ref) => {
    // 4. Component logic here
    // const hasError = Boolean(error)

    return (
      <div
        ref={ref}
        className={twMerge(
          // Base classes
          'inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          // Variant classes
          variantClasses[variant],
          // Size classes
          sizeClasses[size],
          // Conditional classes
          // disabled && 'opacity-50 cursor-not-allowed',
          // hasError && 'border-red-300 focus:ring-red-500',
          // Custom className override
          className
        )}
        // Add accessibility attributes
        // aria-invalid={hasError}
        // aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    )
  }
))

// 5. Always set displayName
Component.displayName = 'Component'

// 6. Export patterns to follow:

// Single component export:
// export { Component }

// Multiple related components:
// export { Component, ComponentVariant, ComponentSize }

// With compound components:
// export { 
//   Component, 
//   ComponentTrigger, 
//   ComponentContent,
//   ComponentHeader,
//   ComponentBody,
//   ComponentFooter
// }

/*
CHECKLIST FOR NEW COMPONENTS:

✅ Uses forwardRef with proper typing
✅ Extends appropriate HTML element props 
✅ Has displayName set
✅ Uses memo for pure components (optional but recommended)
✅ Follows consistent prop naming (variant, size, error, helpText, disabled)
✅ Uses twMerge for className merging
✅ Includes proper TypeScript types
✅ Has accessibility attributes where needed
✅ Follows consistent export pattern
✅ Has consistent variant/size systems
✅ Includes proper error handling for form components
✅ Uses proper ElementRef typing
✅ Spreads remaining props with {...props}
✅ Has proper default values for props

PERFORMANCE CONSIDERATIONS:

- Use memo() for components that render frequently
- Use useCallback for event handlers in compound components
- Use useMemo for expensive calculations
- Avoid inline objects/functions as props
- Use proper dependency arrays in useEffect/useCallback/useMemo

ACCESSIBILITY CONSIDERATIONS:

- Include proper ARIA attributes
- Support keyboard navigation where appropriate
- Provide screen reader friendly content
- Use semantic HTML elements
- Include proper focus management
- Support high contrast mode
- Provide proper error messaging

TESTING CONSIDERATIONS:

- Test with different prop combinations
- Test accessibility with screen readers
- Test keyboard navigation
- Test error states
- Test responsive behavior
- Test with different content lengths
*/