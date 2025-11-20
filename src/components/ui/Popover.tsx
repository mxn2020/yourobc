// src/components/ui/Popover.tsx

import { createContext, useContext, useState, useCallback, useEffect, useRef, forwardRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';

// Context for managing popover state
interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = createContext<PopoverContextValue | undefined>(undefined);

const usePopoverContext = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover compound components must be used within a Popover component');
  }
  return context;
};

// Root Popover component
interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export const Popover = memo(function Popover({ 
  children, 
  open: controlledOpen, 
  defaultOpen = false, 
  onOpenChange,
  modal = false
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);

  return (
    <PopoverContext.Provider value={{ open, setOpen: handleOpenChange }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
});

// PopoverTrigger component
interface PopoverTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const PopoverTrigger = memo(forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, asChild = false, className }, ref) => {
    const { open, setOpen } = usePopoverContext();

    const handleClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setOpen(!open);
    }, [open, setOpen]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(!open);
      }
    }, [open, setOpen]);

    if (asChild) {
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
        className={twMerge(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        aria-expanded={open}
        aria-haspopup="true"
        data-state={open ? 'open' : 'closed'}
      >
        {children}
      </button>
    );
  }
));
PopoverTrigger.displayName = 'PopoverTrigger';

// PopoverAnchor component (optional positioning anchor)
interface PopoverAnchorProps {
  children: ReactNode;
  className?: string;
}

export const PopoverAnchor = memo(forwardRef<HTMLDivElement, PopoverAnchorProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
));
PopoverAnchor.displayName = 'PopoverAnchor';

// PopoverContent component
interface PopoverContentProps {
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  className?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
}

export const PopoverContent = memo(forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ 
    children, 
    side = 'bottom', 
    align = 'center', 
    sideOffset = 4,
    alignOffset = 0,
    className,
    onEscapeKeyDown,
    onPointerDownOutside
  }, ref) => {
    const { open, setOpen } = usePopoverContext();
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

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          onPointerDownOutside?.(event as any);
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open, setOpen, onPointerDownOutside]);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onEscapeKeyDown?.(event);
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, setOpen, onEscapeKeyDown]);

    // Focus management
    useEffect(() => {
      if (open && contentRef.current) {
        const focusableElements = contentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        if (firstElement) {
          firstElement.focus();
        }
      }
    }, [open]);

    if (!open) return null;

    // Position classes based on side and align
    const sideClasses = {
      top: 'bottom-full mb-1',
      right: 'left-full ml-1',
      bottom: 'top-full mt-1',
      left: 'right-full mr-1'
    };

    const alignClasses = {
      start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
      center: side === 'top' || side === 'bottom' ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2',
      end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0'
    };

    return (
      <div
        ref={mergedRef}
        className={twMerge(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          sideClasses[side],
          alignClasses[align],
          className
        )}
        style={{
          marginTop: side === 'bottom' ? sideOffset : side === 'top' ? -sideOffset : 0,
          marginLeft: side === 'right' ? sideOffset : side === 'left' ? -sideOffset : alignOffset,
          marginRight: side === 'left' ? sideOffset : side === 'right' ? -sideOffset : 0,
          marginBottom: side === 'top' ? sideOffset : side === 'bottom' ? -sideOffset : 0
        }}
        data-state={open ? 'open' : 'closed'}
        data-side={side}
        data-align={align}
      >
        {children}
      </div>
    );
  }
));
PopoverContent.displayName = 'PopoverContent';

// PopoverArrow component (optional arrow pointing to trigger)
interface PopoverArrowProps {
  className?: string;
  width?: number;
  height?: number;
}

export const PopoverArrow = memo(forwardRef<SVGSVGElement, PopoverArrowProps>(
  ({ className, width = 10, height = 5 }, ref) => {
    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox="0 0 30 10"
        preserveAspectRatio="none"
        className={twMerge('fill-white stroke-gray-200 stroke-1', className)}
      >
        <polygon points="0,0 30,0 15,10" />
      </svg>
    );
  }
));
PopoverArrow.displayName = 'PopoverArrow';

// PopoverClose component
interface PopoverCloseProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const PopoverClose = memo(forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ children, asChild = false, className }, ref) => {
    const { setOpen } = usePopoverContext();

    const handleClick = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    if (asChild) {
      const child = children as React.ReactElement;
      return (
        <div onClick={handleClick} className={className}>
          {child}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={className}
      >
        {children}
      </button>
    );
  }
));
PopoverClose.displayName = 'PopoverClose';