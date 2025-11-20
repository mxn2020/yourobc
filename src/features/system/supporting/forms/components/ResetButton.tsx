// src/features/boilerplate/supporting/forms/components/ResetButton.tsx

import { useDefaultFormContext } from '../hooks/useFormContext'
import type { ResetButtonProps } from '../types'

/**
 * Reset button to clear form back to default values
 *
 * @example
 * ```tsx
 * <form.Subscribe>
 *   {() => <ResetButton>Clear Form</ResetButton>}
 * </form.Subscribe>
 * ```
 */
export function ResetButton({
  children = 'Reset',
  className = '',
}: ResetButtonProps) {
  const form = useDefaultFormContext()

  return (
    <button
      type="button"
      onClick={() => form.reset()}
      className={`inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ${className}`}
    >
      {children}
    </button>
  )
}
