// src/features/system/supporting/forms/components/SelectField.tsx

import { useDefaultFieldContext } from '../hooks/useFormContext'
import { FieldInfo } from './FieldInfo'
import type { SelectFieldProps } from '../types'

/**
 * Select dropdown field component with built-in validation display
 *
 * @example
 * ```tsx
 * <form.Field name="country">
 *   {(field) => (
 *     <SelectField
 *       label="Country"
 *       options={[
 *         { value: 'us', label: 'United States' },
 *         { value: 'ca', label: 'Canada' },
 *       ]}
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function SelectField<T = string>({
  label,
  description,
  placeholder,
  required,
  disabled,
  className = '',
  options,
  allowEmpty = true,
}: SelectFieldProps<T>) {
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
      <select
        id={field.name}
        name={field.name}
        value={field.state.value || ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value as T)}
        disabled={disabled}
        required={required}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
      >
        {allowEmpty && (
          <option value="">{placeholder || 'Select an option...'}</option>
        )}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldInfo field={field} />
    </div>
  )
}
