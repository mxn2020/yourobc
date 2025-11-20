// src/features/system/supporting/forms/examples/ComponentForm.tsx

import { useForm } from '@tanstack/react-form'
import { DefaultFieldContext, DefaultFormContext } from '../hooks/useFormContext'
import {
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  CheckboxField,
  SubmitButton,
  ResetButton,
  FormSection,
} from '../components'
import { validators } from '../hooks/useFieldValidation'

/**
 * Component-based form example using pre-built field components
 *
 * This example demonstrates:
 * - Using pre-built field components (TextField, NumberField, etc.)
 * - Form context for automatic field binding
 * - Form sections for grouping fields
 * - Submit and reset buttons
 */
export function ComponentForm() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 18,
      bio: '',
      country: '',
      acceptTerms: false,
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value)
      alert(JSON.stringify(value, null, 2))
    },
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Component Form Example
      </h1>

      <DefaultFormContext.Provider value={form}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-8"
        >
          <FormSection
            title="Personal Information"
            description="Basic details about yourself"
          >
            <form.Field
              name="firstName"
              validators={{
                onChange: validators.required('First name is required'),
              }}
              children={(field) => (
                <DefaultFieldContext.Provider value={field}>
                  <TextField
                    label="First Name"
                    placeholder="John"
                    required
                  />
                </DefaultFieldContext.Provider>
              )}
            />

            <form.Field
              name="lastName"
              validators={{
                onChange: validators.required('Last name is required'),
              }}
              children={(field) => (
                <DefaultFieldContext.Provider value={field}>
                  <TextField
                    label="Last Name"
                    placeholder="Doe"
                    required
                  />
                </DefaultFieldContext.Provider>
              )}
            />

            <form.Field
              name="email"
              validators={{
                onChange: validators.email(),
              }}
              children={(field) => (
                <DefaultFieldContext.Provider value={field}>
                  <TextField
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </DefaultFieldContext.Provider>
              )}
            />

            <form.Field
              name="age"
              validators={{
                onChange: validators.min(13, 'Must be 13 or older'),
              }}
              children={(field) => (
                <DefaultFieldContext.Provider value={field}>
                  <NumberField
                    label="Age"
                    min={13}
                    max={120}
                    required
                  />
                </DefaultFieldContext.Provider>
              )}
            />
          </FormSection>

          <FormSection
            title="Additional Details"
            description="Optional information"
          >
            <form.Field
              name="bio"
              children={(field) => (
                <DefaultFieldContext.Provider value={field}>
                  <TextareaField
                    label="Biography"
                    placeholder="Tell us about yourself..."
                    rows={5}
                    maxLength={500}
                  />
                </DefaultFieldContext.Provider>
              )}
            />

            <form.Field
              name="country"
              children={(field) => (
                <DefaultFieldContext.Provider value={field}>
                  <SelectField
                    label="Country"
                    options={[
                      { value: 'us', label: 'United States' },
                      { value: 'ca', label: 'Canada' },
                      { value: 'uk', label: 'United Kingdom' },
                      { value: 'au', label: 'Australia' },
                    ]}
                    placeholder="Select your country"
                  />
                </DefaultFieldContext.Provider>
              )}
            />

            <form.Field
              name="acceptTerms"
              validators={{
                onChange: (value) =>
                  value.value ? undefined : 'You must accept the terms',
              }}
              children={(field) => (
                <DefaultFieldContext.Provider value={field}>
                  <CheckboxField
                    checkboxLabel="I accept the terms and conditions"
                    required
                  />
                </DefaultFieldContext.Provider>
              )}
            />
          </FormSection>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={() => (
              <div className="flex gap-4">
                <SubmitButton>Submit Form</SubmitButton>
                <ResetButton>Clear Form</ResetButton>
              </div>
            )}
          />
        </form>
      </DefaultFormContext.Provider>
    </div>
  )
}
