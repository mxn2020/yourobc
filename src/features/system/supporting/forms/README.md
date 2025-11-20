# Forms Feature

A comprehensive form management system using TanStack Form with TypeScript support, validation, and pre-built components.

## Overview

TanStack Form provides a powerful and flexible approach to form management with first-class TypeScript support, headless UI components, and a framework-agnostic design. This module provides **three approaches** to form building:

1. **Pre-built Components** - Ready-to-use form fields and controls
2. **Composable Hooks** - Flexible hooks for custom implementations
3. **Configuration Presets** - Quick-start form configurations

## Features

### Base Field Components
- **TextField** - Text input with validation (text, email, password, url, tel)
- **NumberField** - Number input with min/max constraints
- **TextareaField** - Multi-line text input
- **SelectField** - Dropdown selection
- **CheckboxField** - Checkbox input

### Form Components
- **SubmitButton** - Smart submit button with auto-disable
- **ResetButton** - Reset form to default values
- **FormSection** - Group related fields with title/description

### Validation System
- **Built-in validators** - required, email, url, min/max, pattern, etc.
- **Async validation** - With debouncing and cancellation
- **Field-level validation** - Validate on change, blur, or submit
- **Form-level validation** - Cross-field validation
- **Custom validators** - Easy to create custom validation logic

### Configuration Presets
- **Pre-configured forms** for common scenarios
- **Optimized validation** out of the box
- **Easy customization** via preset extension

## Installation

The package is already installed as part of the boilerplate:

```bash
pnpm install @tanstack/react-form
```

## Quick Start

### Simple Form (Using useForm directly)

```tsx
import { useForm } from '@tanstack/react-form'
import { FieldInfo } from '@/features/boilerplate/supporting/forms'

function MyForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      age: 0,
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}>
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Email required' : undefined,
        }}
        children={(field) => (
          <>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <FieldInfo field={field} />
          </>
        )}
      />

      <button type="submit">Submit</button>
    </form>
  )
}
```

### Component-Based Form (Using Pre-built Components)

```tsx
import { useForm } from '@tanstack/react-form'
import {
  TextField,
  NumberField,
  SubmitButton,
  DefaultFormContext,
  DefaultFieldContext,
  validators,
} from '@/features/boilerplate/supporting/forms'

function MyForm() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      age: 18,
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <DefaultFormContext.Provider value={form}>
      <form onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}>
        <form.Field
          name="firstName"
          validators={{
            onChange: validators.required('Name is required'),
          }}
          children={(field) => (
            <DefaultFieldContext.Provider value={field}>
              <TextField label="First Name" required />
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
              <NumberField label="Age" min={13} />
            </DefaultFieldContext.Provider>
          )}
        />

        <form.Subscribe>
          {() => <SubmitButton>Submit</SubmitButton>}
        </form.Subscribe>
      </form>
    </DefaultFormContext.Provider>
  )
}
```

### Using Presets

```tsx
import { useForm } from '@tanstack/react-form'
import { getPreset, extendPreset } from '@/features/boilerplate/supporting/forms'

// Use a preset directly
const preset = getPreset('userProfile')
const form = useForm(preset)

// Or extend a preset
const customPreset = extendPreset('userProfile', {
  defaultValues: {
    firstName: 'John',
    lastName: 'Doe',
  },
})
const form = useForm(customPreset)
```

## Components

### TextField

Text input field with validation support.

```tsx
<form.Field name="email">
  {(field) => (
    <DefaultFieldContext.Provider value={field}>
      <TextField
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        maxLength={100}
      />
    </DefaultFieldContext.Provider>
  )}
</form.Field>
```

**Props:**
- `label` - Field label
- `description` - Help text
- `placeholder` - Placeholder text
- `required` - Whether field is required
- `disabled` - Whether field is disabled
- `type` - Input type (text, email, password, url, tel)
- `maxLength` - Maximum length
- `className` - Custom CSS class

### NumberField

Number input with constraints.

```tsx
<form.Field name="age">
  {(field) => (
    <DefaultFieldContext.Provider value={field}>
      <NumberField
        label="Age"
        min={13}
        max={120}
        step={1}
        required
      />
    </DefaultFieldContext.Provider>
  )}
</form.Field>
```

**Props:**
- `label` - Field label
- `min` - Minimum value
- `max` - Maximum value
- `step` - Step increment
- `required` - Whether field is required
- `disabled` - Whether field is disabled

### TextareaField

Multi-line text input.

```tsx
<form.Field name="bio">
  {(field) => (
    <DefaultFieldContext.Provider value={field}>
      <TextareaField
        label="Biography"
        rows={5}
        maxLength={500}
        placeholder="Tell us about yourself..."
      />
    </DefaultFieldContext.Provider>
  )}
</form.Field>
```

**Props:**
- `label` - Field label
- `rows` - Number of rows
- `maxLength` - Maximum length
- `placeholder` - Placeholder text

### SelectField

Dropdown selection field.

```tsx
<form.Field name="country">
  {(field) => (
    <DefaultFieldContext.Provider value={field}>
      <SelectField
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ]}
        allowEmpty={true}
      />
    </DefaultFieldContext.Provider>
  )}
</form.Field>
```

**Props:**
- `label` - Field label
- `options` - Array of { value, label } objects
- `allowEmpty` - Allow empty selection
- `placeholder` - Placeholder text for empty option

### CheckboxField

Checkbox input.

```tsx
<form.Field name="acceptTerms">
  {(field) => (
    <DefaultFieldContext.Provider value={field}>
      <CheckboxField
        label="Terms and Conditions"
        checkboxLabel="I accept the terms"
        required
      />
    </DefaultFieldContext.Provider>
  )}
</form.Field>
```

**Props:**
- `label` - Field label (above checkbox)
- `checkboxLabel` - Label next to checkbox
- `required` - Whether field is required

### SubmitButton

Smart submit button with automatic disabled state.

```tsx
<form.Subscribe>
  {() => (
    <DefaultFormContext.Provider value={form}>
      <SubmitButton>Save Changes</SubmitButton>
    </DefaultFormContext.Provider>
  )}
</form.Subscribe>
```

**Props:**
- `children` - Button text (default: "Submit")
- `className` - Custom CSS class
- `isLoading` - Override loading state

### ResetButton

Reset form to default values.

```tsx
<form.Subscribe>
  {() => (
    <DefaultFormContext.Provider value={form}>
      <ResetButton>Clear Form</ResetButton>
    </DefaultFormContext.Provider>
  )}
</form.Subscribe>
```

**Props:**
- `children` - Button text (default: "Reset")
- `className` - Custom CSS class

### FormSection

Group related fields with title and description.

```tsx
<FormSection
  title="Personal Information"
  description="Basic details about yourself"
>
  <form.Field name="firstName">...</form.Field>
  <form.Field name="lastName">...</form.Field>
</FormSection>
```

**Props:**
- `title` - Section title
- `description` - Section description
- `children` - Field components
- `className` - Custom CSS class

## Validation

### Built-in Validators

```tsx
import { validators } from '@/features/boilerplate/supporting/forms'

// Required field
validators.required('This field is required')

// Email validation
validators.email('Invalid email address')

// URL validation
validators.url('Invalid URL')

// Min/max length
validators.minLength(3, 'Must be at least 3 characters')
validators.maxLength(100, 'Must be no more than 100 characters')

// Min/max value
validators.min(0, 'Must be at least 0')
validators.max(100, 'Must be no more than 100')

// Range
validators.range(0, 100, 'Must be between 0 and 100')

// Pattern
validators.pattern(/^\d{3}-\d{4}$/, 'Invalid format')

// Custom validator
validators.custom((value) => value.length > 0, 'Cannot be empty')
```

### Composing Validators

Combine multiple validators into one:

```tsx
import { composeValidators, validators } from '@/features/boilerplate/supporting/forms'

const validateEmail = composeValidators(
  validators.required('Email is required'),
  validators.email('Invalid email format')
)

<form.Field
  name="email"
  validators={{
    onChange: validateEmail,
  }}
>
  ...
</form.Field>
```

### Async Validation

```tsx
<form.Field
  name="username"
  validators={{
    onChange: validators.required(),
    onChangeAsyncDebounceMs: 500,
    onChangeAsync: async ({ value }) => {
      // Check if username is available
      const available = await checkUsername(value)
      return available ? undefined : 'Username already taken'
    },
  }}
>
  ...
</form.Field>
```

### Field-Level vs Form-Level Validation

**Field-level:**
```tsx
<form.Field
  name="email"
  validators={{
    onChange: validators.email(),
  }}
>
  ...
</form.Field>
```

**Form-level:**
```tsx
const form = useForm({
  defaultValues: { ... },
  validators: {
    onChange: (values) => {
      if (values.password !== values.confirmPassword) {
        return 'Passwords do not match'
      }
      return undefined
    },
  },
})
```

## Presets

Pre-configured form setups for common use cases.

### Available Presets

```tsx
import { formPresets, getPreset } from '@/features/boilerplate/supporting/forms'

// User profile form
const userProfile = getPreset('userProfile')
// Fields: firstName, lastName, email, bio, age

// Contact form
const contactForm = getPreset('contactForm')
// Fields: name, email, subject, message

// Login form
const loginForm = getPreset('loginForm')
// Fields: username, password, rememberMe

// Registration form
const registrationForm = getPreset('registrationForm')
// Fields: email, password, confirmPassword, acceptTerms

// Search form
const searchForm = getPreset('searchForm')
// Fields: query, category, sortBy

// Settings form
const settingsForm = getPreset('settingsForm')
// Fields: notifications, emailUpdates, language, timezone
```

### Extending Presets

```tsx
import { extendPreset } from '@/features/boilerplate/supporting/forms'

const customPreset = extendPreset('userProfile', {
  defaultValues: {
    firstName: 'John',
    email: 'john@example.com',
  },
  validators: {
    onChange: (values) => {
      // Add custom validation
      if (values.age < 18) return 'Must be 18 or older'
      return undefined
    },
  },
})

const form = useForm(customPreset)
```

### Preset Recommendations

Get automatic preset recommendations:

```tsx
import { presetRecommendations } from '@/features/boilerplate/supporting/forms'

const recommended = presetRecommendations.getRecommendation({
  hasAuthentication: true,
})
// Returns: 'loginForm'
```

## Hooks

### useFieldValidation

Hook for declarative field validation:

```tsx
import { useFieldValidation } from '@/features/boilerplate/supporting/forms'

function MyField() {
  const { validate } = useFieldValidation({
    required: true,
    minLength: 3,
    email: true,
    custom: [
      (value) => value.includes('@') ? undefined : 'Must include @',
    ],
  })

  return (
    <form.Field
      name="email"
      validators={{ onChange: validate }}
    >
      ...
    </form.Field>
  )
}
```

### createFormContexts

Create custom form contexts for your own component library:

```tsx
import { createFormContexts } from '@/features/boilerplate/supporting/forms'

const { FormContext, FieldContext, useFormContext, useFieldContext } =
  createFormContexts()

// Use in your components
function MyCustomField() {
  const field = useFieldContext()
  return <input {...field} />
}
```

## Examples

### Example 1: User Profile Form

```tsx
import { useForm } from '@tanstack/react-form'
import {
  TextField,
  NumberField,
  TextareaField,
  SubmitButton,
  FormSection,
  DefaultFormContext,
  DefaultFieldContext,
  validators,
} from '@/features/boilerplate/supporting/forms'

function UserProfileForm() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 18,
      bio: '',
    },
    onSubmit: async ({ value }) => {
      await updateProfile(value)
    },
  })

  return (
    <DefaultFormContext.Provider value={form}>
      <form onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}>
        <FormSection title="Personal Information">
          <form.Field
            name="firstName"
            validators={{ onChange: validators.required() }}
            children={(field) => (
              <DefaultFieldContext.Provider value={field}>
                <TextField label="First Name" required />
              </DefaultFieldContext.Provider>
            )}
          />

          <form.Field
            name="age"
            validators={{ onChange: validators.min(13) }}
            children={(field) => (
              <DefaultFieldContext.Provider value={field}>
                <NumberField label="Age" min={13} />
              </DefaultFieldContext.Provider>
            )}
          />
        </FormSection>

        <form.Subscribe>
          {() => <SubmitButton>Save Profile</SubmitButton>}
        </form.Subscribe>
      </form>
    </DefaultFormContext.Provider>
  )
}
```

### Example 2: Contact Form

```tsx
import { useForm } from '@tanstack/react-form'
import { getPreset } from '@/features/boilerplate/supporting/forms'

function ContactForm() {
  const preset = getPreset('contactForm')

  const form = useForm({
    ...preset,
    onSubmit: async ({ value }) => {
      await sendMessage(value)
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}>
      {/* Use preset fields */}
    </form>
  )
}
```

## Best Practices

1. **Use TypeScript** - Define your form data types for full type safety
2. **Validate on appropriate events** - Use `onChange` for real-time, `onBlur` for after editing, `onSubmit` for final check
3. **Use async validation wisely** - Add debouncing to prevent excessive API calls
4. **Compose validators** - Reuse common validation logic
5. **Leverage presets** - Start with a preset and customize as needed
6. **Group related fields** - Use FormSection to organize complex forms
7. **Handle errors gracefully** - Always display validation errors to users
8. **Reset forms after submission** - Call `form.reset()` after successful submit

## Migration Guide

### From React Hook Form

**Before (React Hook Form):**
```tsx
import { useForm } from 'react-hook-form'

const { register, handleSubmit, formState: { errors } } = useForm()

<input {...register('email', { required: true })} />
{errors.email && <span>Required</span>}
```

**After (TanStack Form):**
```tsx
import { useForm } from '@tanstack/react-form'
import { FieldInfo } from '@/features/boilerplate/supporting/forms'

const form = useForm({ defaultValues: { email: '' } })

<form.Field
  name="email"
  validators={{ onChange: ({ value }) => !value ? 'Required' : undefined }}
>
  {(field) => (
    <>
      <input value={field.state.value} onChange={e => field.handleChange(e.target.value)} />
      <FieldInfo field={field} />
    </>
  )}
</form.Field>
```

### From Formik

**Before (Formik):**
```tsx
import { Formik, Field } from 'formik'

<Formik initialValues={{ email: '' }} onSubmit={...}>
  <Field name="email" type="email" />
</Formik>
```

**After (TanStack Form):**
```tsx
import { useForm } from '@tanstack/react-form'

const form = useForm({
  defaultValues: { email: '' },
  onSubmit: ...
})

<form.Field name="email">
  {(field) => (
    <input
      type="email"
      value={field.state.value}
      onChange={e => field.handleChange(e.target.value)}
    />
  )}
</form.Field>
```

## Troubleshooting

### TypeScript errors with field names

**Solution:** Ensure your form data type is properly defined

```tsx
interface FormData {
  email: string
  age: number
}

const form = useForm<FormData>({
  defaultValues: {
    email: '',
    age: 0,
  },
})
```

### Validation not triggering

**Solution:** Check that you're using the correct validation event

```tsx
// Change this:
validators={{ onSubmit: validate }}

// To this:
validators={{ onChange: validate }}
```

### Form state not updating

**Solution:** Ensure you're using `field.handleChange()` instead of directly setting state

```tsx
// Wrong:
<input onChange={(e) => setValue(e.target.value)} />

// Correct:
<input onChange={(e) => field.handleChange(e.target.value)} />
```

## Related Documentation

- [TanStack Form Official Docs](https://tanstack.com/form/latest)
- [Form Validation Guide](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [TypeScript Guide](https://tanstack.com/form/latest/docs/framework/react/guides/typescript)

## Contributing

When adding new form components or patterns:
1. Follow the existing component patterns
2. Add TypeScript types
3. Include usage examples
4. Update this README
5. Add validation examples
6. Consider adding a preset configuration
