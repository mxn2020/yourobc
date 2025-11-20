// src/components/ui/Collapsible.tsx
import { createContext, useContext, useState, useCallback, forwardRef, ReactNode, useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

// Context for managing collapsible state
interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue | undefined>(undefined);

const useCollapsibleContext = () => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('Collapsible compound components must be used within a Collapsible component');
  }
  return context;
};

// Root Collapsible component
interface CollapsibleProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ 
    children, 
    open: controlledOpen, 
    defaultOpen = false, 
    onOpenChange, 
    disabled = false,
    className 
  }, ref) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    
    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (disabled) return;
      
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [disabled, isControlled, onOpenChange]);

    return (
      <CollapsibleContext.Provider value={{ open, setOpen: handleOpenChange, disabled }}>
        <div
          ref={ref}
          className={className}
          data-state={open ? 'open' : 'closed'}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = 'Collapsible';

// CollapsibleTrigger component
interface CollapsibleTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, asChild = false, className }, ref) => {
    const { open, setOpen, disabled } = useCollapsibleContext();

    const handleClick = () => {
      setOpen(!open);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(!open);
      }
    };

    if (asChild) {
      // If asChild is true, clone the child element and add our props
      const child = children as React.ReactElement;
      return (
        <div onClick={handleClick} onKeyDown={handleKeyDown} className={className}>
          {child}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={twMerge(
          'flex items-center justify-between w-full p-0 text-left',
          !disabled && 'cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        aria-expanded={open}
        aria-controls="collapsible-content"
        data-state={open ? 'open' : 'closed'}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

// CollapsibleContent component
interface CollapsibleContentProps {
  children: ReactNode;
  className?: string;
  forceMount?: boolean;
}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className, forceMount = false }, ref) => {
    const { open } = useCollapsibleContext();
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | 'auto'>(0);
    const [isAnimating, setIsAnimating] = useState(false);

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

    useEffect(() => {
      const element = contentRef.current;
      if (!element) return;

      if (open) {
        setIsAnimating(true);
        // Measure the content height
        const scrollHeight = element.scrollHeight;
        setHeight(scrollHeight);
        
        // Set to auto after animation
        const timer = setTimeout(() => {
          setHeight('auto');
          setIsAnimating(false);
        }, 200); // Match animation duration
        
        return () => clearTimeout(timer);
      } else {
        setIsAnimating(true);
        // First set to actual height, then to 0
        const scrollHeight = element.scrollHeight;
        setHeight(scrollHeight);
        
        requestAnimationFrame(() => {
          setHeight(0);
        });
        
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 200); // Match animation duration
        
        return () => clearTimeout(timer);
      }
    }, [open]);

    if (!open && !forceMount && !isAnimating) {
      return null;
    }

    return (
      <div
        ref={mergedRef}
        id="collapsible-content"
        className={twMerge(
          'overflow-hidden transition-all duration-200 ease-out',
          className
        )}
        style={{ 
          height: height === 'auto' ? 'auto' : `${height}px`
        }}
        data-state={open ? 'open' : 'closed'}
      >
        <div className="pb-0">
          {children}
        </div>
      </div>
    );
  }
);
CollapsibleContent.displayName = 'CollapsibleContent';