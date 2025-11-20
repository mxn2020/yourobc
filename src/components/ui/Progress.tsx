// src/components/ui/Progress.tsx
import { memo, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

interface ProgressProps {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const variantClasses = {
  default: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600'
};

export const Progress = memo(function Progress({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  className
}: ProgressProps) {
  const percentage = useMemo(() => {
    return Math.min(Math.max((value / max) * 100, 0), 100);
  }, [value, max]);

  return (
    <div className={twMerge('w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={twMerge(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={twMerge(
            'h-full transition-all duration-300 ease-in-out rounded-full',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showLabel && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
});