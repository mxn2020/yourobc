// src/components/ui/Card.tsx
import { forwardRef, ReactNode, memo, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg'
}

export const Card = memo(forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  className,
  padding = 'none', // Changed default to none since compound components handle their own padding
  shadow = 'sm',
  hover = false,
  onClick
}, ref) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <div
      ref={ref}
      className={twMerge(
        'rounded-lg border bg-white text-gray-950 shadow-sm',
        paddingClasses[padding],
        shadowClasses[shadow],
        hover || onClick ? 'hover:shadow-md transition-shadow cursor-pointer' : '',
        className
      )}
      onClick={onClick ? handleClick : undefined}
    >
      {children}
    </div>
  );
}));
Card.displayName = 'Card';

export const CardHeader = memo(forwardRef<HTMLDivElement, CardHeaderProps>(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge('flex flex-col space-y-1.5 p-6', className)}
    >
      {children}
    </div>
  );
}));
CardHeader.displayName = 'CardHeader';

export const CardTitle = memo(forwardRef<HTMLParagraphElement, CardTitleProps>(({ children, className }, ref) => {
  return (
    <h3
      ref={ref}
      className={twMerge('text-2xl font-semibold leading-none tracking-tight', className)}
    >
      {children}
    </h3>
  );
}));
CardTitle.displayName = 'CardTitle';

export const CardDescription = memo(forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ children, className }, ref) => {
  return (
    <p
      ref={ref}
      className={twMerge('text-sm text-gray-500', className)}
    >
      {children}
    </p>
  );
}));
CardDescription.displayName = 'CardDescription';

export const CardContent = memo(forwardRef<HTMLDivElement, CardContentProps>(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge('p-6 pt-0', className)}
    >
      {children}
    </div>
  );
}));
CardContent.displayName = 'CardContent';

export const CardFooter = memo(forwardRef<HTMLDivElement, CardFooterProps>(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge('flex items-center p-6 pt-0', className)}
    >
      {children}
    </div>
  );
}));
CardFooter.displayName = 'CardFooter';