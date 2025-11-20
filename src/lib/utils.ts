// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge class names with Tailwind CSS support
 * Combines clsx for conditional classes and twMerge for Tailwind conflict resolution
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'px-4') // => 'py-1 bg-blue-500 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
