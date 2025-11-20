// src/features/system/supporting/forms/examples/SimpleForm.tsx

import { useForm } from '@tanstack/react-form'
import { FieldInfo } from '../components/FieldInfo'

/**
 * Simple form example using TanStack Form
 *
 * This example demonstrates:
 * - Basic form setup with useForm
 * - Field-level validation
 * - Async validation with debouncing
 * - Form submission handling
 */
export function SimpleForm() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log('Form submitted:', value)
      alert(JSON.stringify(value, null, 2))
    },
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Simple Form Example
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <div>
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'A first name is required'
                  : value.length < 3
                    ? 'First name must be at least 3 characters'
                    : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return (
                  value.includes('error') && 'No "error" allowed in first name'
                )
              },
            }}
            children={(field) => {
              return (
                <div className="space-y-2">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    First Name:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                  <FieldInfo field={field} />
                </div>
              )
            }}
          />
        </div>

        <div>
          <form.Field
            name="lastName"
            children={(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last Name:
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                <FieldInfo field={field} />
              </div>
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        />
      </form>
    </div>
  )
}
