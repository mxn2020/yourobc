// src/features/system/supporting/forms/components/FormSection.tsx

import type { FormSectionProps } from '../types'

/**
 * Form section component for grouping related fields
 *
 * @example
 * ```tsx
 * <FormSection title="Personal Information" description="Basic details about yourself">
 *   <form.Field name="firstName">...</form.Field>
 *   <form.Field name="lastName">...</form.Field>
 * </FormSection>
 * ```
 */
export function FormSection({
  title,
  description,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  )
}
