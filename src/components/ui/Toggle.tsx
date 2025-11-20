// src/components/ui/Toggle.tsx
import { forwardRef, memo, useCallback, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ToggleProps {
  children?: ReactNode;
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  asChild?: boolean;
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base'
};

const variantClasses = {
  default: {
    base: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
    pressed: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
  },
  outline: {
    base: 'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50',
    pressed: 'border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100'
  }
};

export const Toggle = memo(forwardRef<HTMLButtonElement, ToggleProps>(
  ({
    children,
    pressed = false,
    onPressedChange,
    disabled = false,
    className,
    size = 'md',
    variant = 'default',
    asChild = false,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const handleClick = useCallback(() => {
      if (!disabled) {
        onPressedChange?.(!pressed);
      }
    }, [disabled, pressed, onPressedChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        onPressedChange?.(!pressed);
      }
    }, [disabled, pressed, onPressedChange]);

    const variantStyles = variantClasses[variant];

    const toggleClassName = twMerge(
      'inline-flex items-center justify-center rounded-md font-medium',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      sizeClasses[size],
      pressed ? variantStyles.pressed : variantStyles.base,
      disabled && 'cursor-not-allowed opacity-50',
      className
    )

    if (asChild) {
      const child = children as React.ReactElement;
      return (
        <div onClick={handleClick} onKeyDown={handleKeyDown} className={toggleClassName}>
          {child}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={pressed}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={toggleClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
));
Toggle.displayName = 'Toggle';
