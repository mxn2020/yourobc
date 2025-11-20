// src/components/ui/Alert.tsx
import { forwardRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// Root Alert component
interface AlertProps {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  className?: string;
}

const variantClasses = {
  default: 'bg-blue-50 border-blue-200 text-blue-900',
  destructive: 'bg-red-50 border-red-200 text-red-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900'
};

export const Alert = memo(forwardRef<HTMLDivElement, AlertProps>(
  ({ children, variant = 'default', className }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={twMerge(
          'relative w-full rounded-lg border px-4 py-3 text-sm',
          variantClasses[variant],
          className
        )}
      >
        {children}
      </div>
    );
  }
));
Alert.displayName = 'Alert';

// AlertTitle component
interface AlertTitleProps {
  children: ReactNode;
  className?: string;
}

export const AlertTitle = memo(forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ children, className }, ref) => {
    return (
      <h5
        ref={ref}
        className={twMerge('mb-1 font-medium leading-none tracking-tight', className)}
      >
        {children}
      </h5>
    );
  }
));
AlertTitle.displayName = 'AlertTitle';

// AlertDescription component
interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const AlertDescription = memo(forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('text-sm opacity-90', className)}
      >
        {children}
      </div>
    );
  }
));
AlertDescription.displayName = 'AlertDescription';

// AlertIcon component
interface AlertIconProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  className?: string;
}

const variantIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle
};

const iconColors = {
  default: 'text-blue-600',
  destructive: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-yellow-600'
};

export const AlertIcon = memo(forwardRef<HTMLDivElement, AlertIconProps>(
  ({ variant = 'default', className }, ref) => {
    const IconComponent = variantIcons[variant];
    
    return (
      <div
        ref={ref}
        className={twMerge('mr-2 mt-0.5', className)}
      >
        <IconComponent className={twMerge('h-4 w-4', iconColors[variant])} />
      </div>
    );
  }
));
AlertIcon.displayName = 'AlertIcon';

// Compound Alert with automatic icon
interface CompoundAlertProps {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  title?: string;
  showIcon?: boolean;
  className?: string;
}

export const CompoundAlert = memo(forwardRef<HTMLDivElement, CompoundAlertProps>(
  ({ children, variant = 'default', title, showIcon = true, className }, ref) => {
    return (
      <Alert ref={ref} variant={variant} className={className}>
        <div className="flex">
          {showIcon && <AlertIcon variant={variant} />}
          <div className="flex-1">
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{children}</AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }
));
CompoundAlert.displayName = 'CompoundAlert';