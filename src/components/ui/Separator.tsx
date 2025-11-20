// src/components/ui/Separator.tsx
import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator = memo(function Separator({ 
  orientation = 'horizontal', 
  className 
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={twMerge(
        'shrink-0 bg-gray-200',
        orientation === 'horizontal' 
          ? 'h-px w-full' 
          : 'h-full w-px',
        className
      )}
    />
  );
});

