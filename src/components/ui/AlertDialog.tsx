// src/components/ui/AlertDialog.tsx
import { createContext, useContext, useState, useCallback, useEffect, useRef, forwardRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

// Context for managing alert dialog state
interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | undefined>(undefined);

const useAlertDialogContext = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog compound components must be used within an AlertDialog component');
  }
  return context;
};

// Root AlertDialog component
interface AlertDialogProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AlertDialog = memo(function AlertDialog({ 
  children, 
  open: controlledOpen, 
  defaultOpen = false, 
  onOpenChange 
}: AlertDialogProps) {
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
    <AlertDialogContext.Provider value={{ open, setOpen: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
});

// AlertDialogTrigger component
interface AlertDialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const AlertDialogTrigger = memo(forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  ({ children, asChild = false, className }, ref) => {
    const { setOpen } = useAlertDialogContext();

    const handleClick = useCallback(() => {
      setOpen(true);
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
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

// AlertDialogPortal component
interface AlertDialogPortalProps {
  children: ReactNode;
  container?: HTMLElement;
}

export const AlertDialogPortal = memo(function AlertDialogPortal({ children, container }: AlertDialogPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      {children}
    </div>
  );
});

// AlertDialogOverlay component
interface AlertDialogOverlayProps {
  className?: string;
}

export const AlertDialogOverlay = memo(forwardRef<HTMLDivElement, AlertDialogOverlayProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
        data-state="open"
      />
    );
  }
));
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

// AlertDialogContent component
interface AlertDialogContentProps {
  children: ReactNode;
  className?: string;
}

export const AlertDialogContent = memo(forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, className }, ref) => {
    const { open, setOpen } = useAlertDialogContext();
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

    // Handle escape key - AlertDialog typically shouldn't close on escape
    // but we can optionally support it
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        // AlertDialogs usually don't close on escape for accessibility reasons
        // Uncomment the line below if you want escape key support
        // if (event.key === 'Escape') setOpen(false);
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, setOpen]);

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

    // Body scroll lock
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'unset';
        };
      }
    }, [open]);

    if (!open) return null;

    return (
      <AlertDialogPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialogOverlay />
          <div
            ref={mergedRef}
            className={twMerge(
              'relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200',
              'sm:rounded-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
              'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
              className
            )}
            role="alertdialog"
            aria-modal="true"
            data-state="open"
          >
            {children}
          </div>
        </div>
      </AlertDialogPortal>
    );
  }
));
AlertDialogContent.displayName = 'AlertDialogContent';

// AlertDialogHeader component
interface AlertDialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export const AlertDialogHeader = memo(forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('flex flex-col space-y-2 text-center sm:text-left', className)}
      >
        {children}
      </div>
    );
  }
));
AlertDialogHeader.displayName = 'AlertDialogHeader';

// AlertDialogTitle component
interface AlertDialogTitleProps {
  children: ReactNode;
  className?: string;
}

export const AlertDialogTitle = memo(forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ children, className }, ref) => {
    return (
      <h2
        ref={ref}
        className={twMerge('text-lg font-semibold', className)}
      >
        {children}
      </h2>
    );
  }
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

// AlertDialogDescription component
interface AlertDialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const AlertDialogDescription = memo(forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  ({ children, className }, ref) => {
    return (
      <p
        ref={ref}
        className={twMerge('text-sm text-gray-500', className)}
      >
        {children}
      </p>
    );
  }
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

// AlertDialogFooter component
interface AlertDialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const AlertDialogFooter = memo(forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      >
        {children}
      </div>
    );
  }
));
AlertDialogFooter.displayName = 'AlertDialogFooter';

// AlertDialogAction component
interface AlertDialogActionProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const AlertDialogAction = memo(forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ children, asChild = false, className, onClick, disabled }, ref) => {
    const { setOpen } = useAlertDialogContext();

    const handleClick = useCallback(() => {
      onClick?.();
      setOpen(false);
    }, [onClick, setOpen]);

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
        disabled={disabled}
        className={twMerge(
          'inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white ring-offset-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
      >
        {children}
      </button>
    );
  }
));
AlertDialogAction.displayName = 'AlertDialogAction';

// AlertDialogCancel component
interface AlertDialogCancelProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const AlertDialogCancel = memo(forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ children, asChild = false, className, onClick, disabled }, ref) => {
    const { setOpen } = useAlertDialogContext();

    const handleClick = useCallback(() => {
      onClick?.();
      setOpen(false);
    }, [onClick, setOpen]);

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
        disabled={disabled}
        className={twMerge(
          'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-offset-white transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0',
          className
        )}
      >
        {children}
      </button>
    );
  }
));
AlertDialogCancel.displayName = 'AlertDialogCancel';