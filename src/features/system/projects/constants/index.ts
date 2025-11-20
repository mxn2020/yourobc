// features/system/projects/constants/index.ts

import { PROJECT_CONSTANTS } from '@/convex/lib/system/projects/constants';

// Only UI-specific constants should be here
export { PROJECT_CONSTANTS };

export const PROJECT_STATUS_COLORS = {
  [PROJECT_CONSTANTS.STATUS.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [PROJECT_CONSTANTS.STATUS.COMPLETED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [PROJECT_CONSTANTS.STATUS.ON_HOLD]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [PROJECT_CONSTANTS.STATUS.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const;

export const PRIORITY_COLORS = {
  [PROJECT_CONSTANTS.PRIORITY.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  [PROJECT_CONSTANTS.PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [PROJECT_CONSTANTS.PRIORITY.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [PROJECT_CONSTANTS.PRIORITY.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [PROJECT_CONSTANTS.PRIORITY.CRITICAL]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
} as const;

export const PRIORITY_ICONS = {
  [PROJECT_CONSTANTS.PRIORITY.LOW]: '⬇️',
  [PROJECT_CONSTANTS.PRIORITY.MEDIUM]: '➡️',
  [PROJECT_CONSTANTS.PRIORITY.HIGH]: '⬆️',
  [PROJECT_CONSTANTS.PRIORITY.URGENT]: '🔥',
  [PROJECT_CONSTANTS.PRIORITY.CRITICAL]: '🚨',
} as const;

export const STATUS_ICONS = {
  [PROJECT_CONSTANTS.STATUS.ACTIVE]: '🟢',
  [PROJECT_CONSTANTS.STATUS.COMPLETED]: '✅',
  [PROJECT_CONSTANTS.STATUS.ON_HOLD]: '⏸️',
  [PROJECT_CONSTANTS.STATUS.CANCELLED]: '❌',
} as const;
