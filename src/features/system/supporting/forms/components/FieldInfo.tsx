// src/features/system/supporting/forms/components/FieldInfo.tsx

import type { FieldApi } from '@tanstack/react-form'

export interface FieldInfoProps {
  /** The field API instance */
  field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
  /** Show validation state */
  showValidation?: boolean
}

/**
 * Display field validation errors and loading state
 *
 * @example
 * ```tsx
 * <form.Field name="email">
 *   {(field) => (
 *     <>
 *       <input {...field} />
 *       <FieldInfo field={field} />
 *     </>
 *   )}
 * </form.Field>
 * ```
 */
export function FieldInfo({ field, showValidation = true }: FieldInfoProps) {
  if (!showValidation) return null

  const { meta } = field.state

  return (
    <>
      {meta.isTouched && meta.errors.length > 0 ? (
        <em className="text-sm text-red-600 dark:text-red-400">
          {meta.errors.join(', ')}
        </em>
      ) : null}
      {meta.isValidating ? (
        <span className="text-sm text-gray-500 dark:text-gray-400">Validating...</span>
      ) : null}
    </>
  )
}
