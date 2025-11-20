// src/features/boilerplate/supporting/forms/components/SubmitButton.tsx

import { useDefaultFormContext } from '../hooks/useFormContext'
import type { SubmitButtonProps } from '../types'

/**
 * Submit button with automatic disabled state based on form validation
 *
 * @example
 * ```tsx
 * <form.Subscribe>
 *   {() => <SubmitButton>Save Changes</SubmitButton>}
 * </form.Subscribe>
 * ```
 */
export function SubmitButton({
  children = 'Submit',
  className = '',
  isLoading,
}: SubmitButtonProps) {
  const form = useDefaultFormContext()
  const canSubmit = form.state.canSubmit
  const isSubmitting = isLoading ?? form.state.isSubmitting

  return (
    <button
      type="submit"
      disabled={!canSubmit || isSubmitting}
      className={`inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 ${className}`}
    >
      {isSubmitting ? 'Submitting...' : children}
    </button>
  )
}
