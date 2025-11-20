// src/components/ui/Skeleton.tsx
import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
});

