// src/features/system/supporting/forms/components/CheckboxField.tsx

import { useDefaultFieldContext } from '../hooks/useFormContext'
import { FieldInfo } from './FieldInfo'
import type { CheckboxFieldProps } from '../types'

/**
 * Checkbox field component with built-in validation display
 *
 * @example
 * ```tsx
 * <form.Field name="acceptTerms">
 *   {(field) => (
 *     <CheckboxField
 *       label="Terms"
 *       checkboxLabel="I accept the terms and conditions"
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function CheckboxField({
  label,
  description,
  required,
  disabled,
  className = '',
  checkboxLabel,
}: CheckboxFieldProps) {
  const field = useDefaultFieldContext()

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      <div className="flex items-center">
        <input
          id={field.name}
          name={field.name}
          type="checkbox"
          checked={field.state.value || false}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          disabled={disabled}
          required={required}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
        {checkboxLabel && (
          <label htmlFor={field.name} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {checkboxLabel}
          </label>
        )}
      </div>
      <FieldInfo field={field} />
    </div>
  )
}
