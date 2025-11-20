// src/components/ui/Select.tsx
import { createContext, useContext, useState, useCallback, useEffect, useRef, forwardRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Check } from 'lucide-react';

// Context for managing select state
interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
  labelMap: React.MutableRefObject<Map<string, string>>;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select compound components must be used within a Select component');
  }
  return context;
};

// Root Select component (for compound pattern)
interface SelectProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

const Select = memo(function Select({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  disabled = false,
  label,
  required = false
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [open, setOpen] = useState(false);
  const labelMap = useRef(new Map<string, string>());

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Update selectedLabel when value changes and we have a label in the map
  useEffect(() => {
    if (value && labelMap.current.has(value)) {
      const label = labelMap.current.get(value);
      if (label && label !== selectedLabel) {
        setSelectedLabel(label);
      }
    }
  }, [value, selectedLabel]);

  const handleValueChange = useCallback((newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  }, [isControlled, onValueChange]);

  const handleSetOpen = useCallback((newOpen: boolean) => {
    if (!disabled) {
      setOpen(newOpen);
    }
  }, [disabled]);

  const content = (
    <SelectContext.Provider value={{ open, setOpen: handleSetOpen, value, onValueChange: handleValueChange, selectedLabel, setSelectedLabel, labelMap }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );

  if (disabled) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="opacity-50 cursor-not-allowed">
          {content}
        </div>
      </div>
    );
  }

  if (label) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {content}
      </div>
    );
  }

  return content;
});

// SelectTrigger component
interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
  placeholder?: string;
}

const SelectTrigger = memo(forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, placeholder }, ref) => {
    const { open, setOpen, value, selectedLabel } = useSelectContext();

    const handleClick = useCallback(() => {
      setOpen(!open);
    }, [open, setOpen]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(!open);
      }
    }, [open, setOpen]);

    // Display selectedLabel if available, otherwise fall back to children or placeholder
    const displayText = selectedLabel || (value ? children : placeholder || 'Select an option...');

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={twMerge(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={twMerge('block truncate', !value && 'text-gray-500')}>
          {displayText}
        </span>
        <ChevronDown className={twMerge('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
    );
  }
));
SelectTrigger.displayName = 'SelectTrigger';

// SelectValue component
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectValue = memo(forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className }, ref) => {
    const { value } = useSelectContext();
    
    return (
      <span ref={ref} className={className}>
        {value || placeholder}
      </span>
    );
  }
));
SelectValue.displayName = 'SelectValue';

// SelectContent component
interface SelectContentProps {
  children: ReactNode;
  position?: 'popper' | 'item-aligned';
  className?: string;
}

const SelectContent = memo(forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, position = 'popper', className }, ref) => {
    const { open, setOpen } = useSelectContext();
    const contentRef = useRef<HTMLDivElement>(null);

    // Merge refs
    const mergedRef = useCallback((node: HTMLDivElement | null) => {
      if (contentRef.current !== node) {
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open, setOpen]);

    // Close dropdown on Escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={mergedRef}
        className={twMerge(
          'absolute z-50 mt-1 max-h-60 min-w-[8rem] overflow-hidden rounded-md border bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
          position === 'popper' ? 'w-full' : 'w-full',
          className
        )}
        role="listbox"
      >
        <div className="max-h-60 overflow-auto">
          {children}
        </div>
      </div>
    );
  }
));
SelectContent.displayName = 'SelectContent';

// SelectItem component
interface SelectItemProps {
  children: ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

const SelectItem = memo(forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, value, disabled = false, className }, ref) => {
    const { value: selectedValue, onValueChange, setSelectedLabel, labelMap } = useSelectContext();
    const isSelected = selectedValue === value;

    // Register this item's label in the map when it mounts
    useEffect(() => {
      const label = typeof children === 'string' ? children : value;
      labelMap.current.set(value, label);

      // If this item is currently selected, update the selectedLabel
      if (isSelected && label) {
        setSelectedLabel(label);
      }

      return () => {
        labelMap.current.delete(value);
      };
    }, [value, children, labelMap, isSelected, setSelectedLabel]);

    const handleClick = useCallback(() => {
      if (!disabled) {
        onValueChange(value);
        // Store the label (children) for display
        const label = typeof children === 'string' ? children : value;
        setSelectedLabel(label);
      }
    }, [disabled, onValueChange, value, children, setSelectedLabel]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!disabled) {
          onValueChange(value);
          const label = typeof children === 'string' ? children : value;
          setSelectedLabel(label);
        }
      }
    }, [disabled, onValueChange, value, children, setSelectedLabel]);

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        className={twMerge(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
          disabled
            ? 'pointer-events-none opacity-50'
            : 'focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100',
          isSelected && 'bg-gray-100',
          className
        )}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        <span className="block truncate">{children}</span>
      </div>
    );
  }
));
SelectItem.displayName = 'SelectItem';

// SelectLabel component
interface SelectLabelProps {
  children: ReactNode;
  className?: string;
}

const SelectLabel = memo(forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
      >
        {children}
      </div>
    );
  }
));
SelectLabel.displayName = 'SelectLabel';

// SelectSeparator component
interface SelectSeparatorProps {
  className?: string;
}

const SelectSeparator = memo(forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('-mx-1 my-1 h-px bg-gray-200', className)}
      />
    );
  }
));
SelectSeparator.displayName = 'SelectSeparator';

// Simple Select component with label support (for forms)
interface SimpleSelectProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const SimpleSelect = memo(forwardRef<HTMLSelectElement, SimpleSelectProps>(
  ({
    label,
    value,
    defaultValue,
    onChange,
    options,
    placeholder = 'Select an option...',
    helpText,
    error,
    disabled = false,
    required = false,
    className,
    id,
    name
  }, ref) => {
    const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={twMerge(
            'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
        >
          {placeholder && !value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
));
SimpleSelect.displayName = 'SimpleSelect';

// Export all components
export {
  // Compound component pattern (primary usage)
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  // Simple form component (for forms with label/options props)
  SimpleSelect
};