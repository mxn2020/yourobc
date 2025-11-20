// src/components/ui/DropdownMenu.tsx
import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';

// Context for managing dropdown state
interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined);

const useDropdownMenuContext = () => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu compound components must be used within a DropdownMenu component');
  }
  return context;
};

// Root DropdownMenu component
interface DropdownMenuProps {
  children: ReactNode;
}

export const DropdownMenu = memo(function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const handleSetOpen = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen: handleSetOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
});

// DropdownMenuTrigger component
interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: ReactNode;
  className?: string;
}

export const DropdownMenuTrigger = memo(function DropdownMenuTrigger({ 
  asChild = false, 
  children, 
  className 
}: DropdownMenuTriggerProps) {
  const { open, setOpen } = useDropdownMenuContext();

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  if (asChild) {
    // If asChild is true, clone the child element and add our props
    const child = children as React.ReactElement;
    return (
      <div onClick={handleClick} className={className}>
        {child}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={twMerge(
        'inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className
      )}
      aria-expanded={open}
      aria-haspopup="true"
    >
      {children}
    </button>
  );
});

// DropdownMenuContent component
interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const DropdownMenuContent = memo(function DropdownMenuContent({ 
  children, 
  align = 'end', 
  className 
}: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);

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

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div
      ref={contentRef}
      className={twMerge(
        'absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none',
        alignmentClasses[align],
        className
      )}
      role="menu"
      aria-orientation="vertical"
    >
      <div className="py-1" role="none">
        {children}
      </div>
    </div>
  );
});

// DropdownMenuItem component
interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const DropdownMenuItem = memo(function DropdownMenuItem({ 
  children, 
  onClick, 
  disabled = false, 
  className 
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext();

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
      setOpen(false);
    }
  }, [disabled, onClick, setOpen]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={twMerge(
        'w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      role="menuitem"
    >
      {children}
    </button>
  );
});

// Additional components for completeness

// DropdownMenuSeparator component
interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator = memo(function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <div
      className={twMerge('h-px bg-gray-200 my-1', className)}
      role="separator"
    />
  );
});

// DropdownMenuLabel component
interface DropdownMenuLabelProps {
  children: ReactNode;
  className?: string;
}

export const DropdownMenuLabel = memo(function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div
      className={twMerge('px-4 py-2 text-sm font-semibold text-gray-900', className)}
      role="none"
    >
      {children}
    </div>
  );
});

// DropdownMenuCheckboxItem component
interface DropdownMenuCheckboxItemProps {
  children: ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const DropdownMenuCheckboxItem = memo(function DropdownMenuCheckboxItem({ 
  children, 
  checked = false, 
  onCheckedChange, 
  disabled = false, 
  className 
}: DropdownMenuCheckboxItemProps) {
  const handleClick = useCallback(() => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  }, [disabled, onCheckedChange, checked]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={twMerge(
        'w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      role="menuitemcheckbox"
      aria-checked={checked}
    >
      <span className="mr-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
});