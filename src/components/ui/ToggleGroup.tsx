// src/components/ui/ToggleGroup.tsx
import { createContext, useContext, forwardRef, memo, ReactNode, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

// Context for managing toggle group state
interface ToggleGroupContextValue {
  value: string | string[];
  onValueChange: (value: string) => void;
  type: 'single' | 'multiple';
  disabled?: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | undefined>(undefined);

const useToggleGroupContext = () => {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error('ToggleGroupItem must be used within a ToggleGroup component');
  }
  return context;
};

// Root ToggleGroup component
interface ToggleGroupProps {
  children: ReactNode;
  type: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ToggleGroup = memo(forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({
    children,
    type,
    value = type === 'single' ? '' : [],
    onValueChange,
    disabled = false,
    className,
    orientation = 'horizontal'
  }, ref) => {
    const handleValueChange = useCallback((itemValue: string) => {
      if (disabled) return;

      if (type === 'single') {
        onValueChange?.(itemValue);
      } else {
        const currentValue = Array.isArray(value) ? value : [];
        const newValue = currentValue.includes(itemValue)
          ? currentValue.filter(v => v !== itemValue)
          : [...currentValue, itemValue];
        onValueChange?.(newValue);
      }
    }, [type, value, onValueChange, disabled]);

    return (
      <ToggleGroupContext.Provider
        value={{
          value,
          onValueChange: handleValueChange,
          type,
          disabled
        }}
      >
        <div
          ref={ref}
          className={twMerge(
            'inline-flex rounded-md shadow-sm',
            orientation === 'horizontal' ? 'flex-row' : 'flex-col',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          role="group"
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
));
ToggleGroup.displayName = 'ToggleGroup';

// ToggleGroupItem component
interface ToggleGroupItemProps {
  children: ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const ToggleGroupItem = memo(forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({
    children,
    value: itemValue,
    disabled: itemDisabled = false,
    className,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const { value, onValueChange, type, disabled: groupDisabled } = useToggleGroupContext();

    const isDisabled = groupDisabled || itemDisabled;

    const isSelected = type === 'single'
      ? value === itemValue
      : Array.isArray(value) && value.includes(itemValue);

    const handleClick = useCallback(() => {
      if (!isDisabled) {
        onValueChange(itemValue);
      }
    }, [isDisabled, onValueChange, itemValue]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
        e.preventDefault();
        onValueChange(itemValue);
      }
    }, [isDisabled, onValueChange, itemValue]);

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={isSelected}
        aria-label={ariaLabel}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={twMerge(
          'inline-flex items-center justify-center px-4 py-2 text-sm font-medium',
          'border border-gray-300 transition-colors duration-200',
          'focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
          'first:rounded-l-md last:rounded-r-md',
          '-ml-px first:ml-0',
          isSelected
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
            : 'bg-white text-gray-700 hover:bg-gray-50',
          isDisabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
));
ToggleGroupItem.displayName = 'ToggleGroupItem';
