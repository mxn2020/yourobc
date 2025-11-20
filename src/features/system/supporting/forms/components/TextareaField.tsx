// src/features/boilerplate/supporting/forms/components/TextareaField.tsx

import { useDefaultFieldContext } from '../hooks/useFormContext'
import { FieldInfo } from './FieldInfo'
import type { TextareaFieldProps } from '../types'

/**
 * Textarea field component with built-in validation display
 *
 * @example
 * ```tsx
 * <form.Field name="bio">
 *   {(field) => <TextareaField label="Biography" rows={5} />}
 * </form.Field>
 * ```
 */
export function TextareaField({
  label,
  description,
  placeholder,
  required,
  disabled,
  className = '',
  rows = 4,
  maxLength,
}: TextareaFieldProps) {
  const field = useDefaultFieldContext()

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      <textarea
        id={field.name}
        name={field.name}
        value={field.state.value || ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
      />
      <FieldInfo field={field} />
    </div>
  )
}
