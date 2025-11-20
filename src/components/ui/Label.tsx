// src/components/ui/Label.tsx
import { forwardRef, LabelHTMLAttributes, memo } from 'react';
import { twMerge } from 'tailwind-merge';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'muted';
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

const variantClasses = {
  default: 'text-gray-900 font-medium',
  subtle: 'text-gray-700 font-normal',
  muted: 'text-gray-500 font-normal'
};

export const Label = memo(forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    children, 
    className, 
    required = false, 
    disabled = false,
    size = 'md',
    variant = 'default',
    ...props 
  }, ref) => {
    return (
      <label
        ref={ref}
        className={twMerge(
          'leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'cursor-not-allowed opacity-70',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span 
            className="ml-1 text-red-500" 
            aria-label="Required field"
            title="This field is required"
          >
            *
          </span>
        )}
      </label>
    );
  }
));
Label.displayName = 'Label';