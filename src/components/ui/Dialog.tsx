// src/components/ui/Dialog.tsx
import { createContext, useContext, useState, useCallback, useEffect, useRef, forwardRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

// Context for managing dialog state
interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog compound components must be used within a Dialog component');
  }
  return context;
};

// Root Dialog component
interface DialogProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dialog = memo(function Dialog({ 
  children, 
  open: controlledOpen, 
  defaultOpen = false, 
  onOpenChange 
}: DialogProps) {
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
    <DialogContext.Provider value={{ open, setOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
});

// DialogTrigger component
interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const DialogTrigger = memo(forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, asChild = false, className }, ref) => {
    const { setOpen } = useDialogContext();

    const handleClick = useCallback(() => {
      setOpen(true);
    }, [setOpen]);

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
DialogTrigger.displayName = 'DialogTrigger';

// DialogPortal component for rendering outside the DOM tree
interface DialogPortalProps {
  children: ReactNode;
  container?: HTMLElement;
}

export const DialogPortal = memo(function DialogPortal({ children, container }: DialogPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  const portalContainer = container || document.body;

  return (
    <>
      {portalContainer && (
        <div>
          {children}
        </div>
      )}
    </>
  );
});

// DialogOverlay component
interface DialogOverlayProps {
  className?: string;
}

export const DialogOverlay = memo(forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className }, ref) => {
    const { setOpen } = useDialogContext();

    const handleClick = useCallback((e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setOpen(false);
      }
    }, [setOpen]);

    return (
      <div
        ref={ref}
        onClick={handleClick}
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
DialogOverlay.displayName = 'DialogOverlay';

// DialogContent component
interface DialogContentProps {
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export const DialogContent = memo(forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, showCloseButton = true }, ref) => {
    const { open, setOpen } = useDialogContext();
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

    const handleCloseClick = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    // Handle escape key
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
      <DialogPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogOverlay />
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
            role="dialog"
            aria-modal="true"
            data-state="open"
          >
            {children}
            {showCloseButton && (
              <button
                type="button"
                onClick={handleCloseClick}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            )}
          </div>
        </div>
      </DialogPortal>
    );
  }
));
DialogContent.displayName = 'DialogContent';

// DialogHeader component
interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export const DialogHeader = memo(forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      >
        {children}
      </div>
    );
  }
));
DialogHeader.displayName = 'DialogHeader';

// DialogTitle component
interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export const DialogTitle = memo(forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className }, ref) => {
    return (
      <h2
        ref={ref}
        className={twMerge('text-lg font-semibold leading-none tracking-tight', className)}
      >
        {children}
      </h2>
    );
  }
));
DialogTitle.displayName = 'DialogTitle';

// DialogDescription component
interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const DialogDescription = memo(forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
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
DialogDescription.displayName = 'DialogDescription';

// DialogFooter component
interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const DialogFooter = memo(forwardRef<HTMLDivElement, DialogFooterProps>(
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
DialogFooter.displayName = 'DialogFooter';

// DialogClose component
interface DialogCloseProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const DialogClose = memo(forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, asChild = false, className }, ref) => {
    const { setOpen } = useDialogContext();

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
DialogClose.displayName = 'DialogClose';