// src/features/system/supporting/forms/utils/presets.ts

import type { FormPreset, FormPresetName } from '../types'
import { validators } from '../hooks/useFieldValidation'

/**
 * User profile form preset
 */
const userProfilePreset: FormPreset = {
  name: 'userProfile',
  description: 'User profile form with name, email, and bio',
  defaultValues: {
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    age: 18,
  },
  validators: {
    onChange: (values: any) => {
      if (!values.firstName) return 'First name is required'
      if (!values.email) return 'Email is required'
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        return 'Invalid email address'
      }
      if (values.age && values.age < 13) return 'Must be 13 or older'
      return undefined
    },
  },
  useCase: 'User profile editing, account settings',
}

/**
 * Contact form preset
 */
const contactFormPreset: FormPreset = {
  name: 'contactForm',
  description: 'Contact form with name, email, subject, and message',
  defaultValues: {
    name: '',
    email: '',
    subject: '',
    message: '',
  },
  validators: {
    onChange: (values: any) => {
      if (!values.name) return 'Name is required'
      if (!values.email) return 'Email is required'
      if (!values.message) return 'Message is required'
      return undefined
    },
  },
  useCase: 'Contact forms, support tickets, feedback forms',
}

/**
 * Login form preset
 */
const loginFormPreset: FormPreset = {
  name: 'loginForm',
  description: 'Login form with email/username and password',
  defaultValues: {
    username: '',
    password: '',
    rememberMe: false,
  },
  validators: {
    onChange: (values: any) => {
      if (!values.username) return 'Username is required'
      if (!values.password) return 'Password is required'
      return undefined
    },
  },
  useCase: 'User authentication, login pages',
}

/**
 * Registration form preset
 */
const registrationFormPreset: FormPreset = {
  name: 'registrationForm',
  description: 'Registration form with email, password, and confirmation',
  defaultValues: {
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  },
  validators: {
    onChange: (values: any) => {
      if (!values.email) return 'Email is required'
      if (!values.password) return 'Password is required'
      if (values.password && values.password.length < 8) {
        return 'Password must be at least 8 characters'
      }
      if (values.password !== values.confirmPassword) {
        return 'Passwords do not match'
      }
      if (!values.acceptTerms) return 'You must accept the terms and conditions'
      return undefined
    },
  },
  useCase: 'User registration, account creation',
}

/**
 * Search form preset
 */
const searchFormPreset: FormPreset = {
  name: 'searchForm',
  description: 'Search form with query and filters',
  defaultValues: {
    query: '',
    category: '',
    sortBy: 'relevance',
  },
  useCase: 'Search interfaces, filtering',
}

/**
 * Settings form preset
 */
const settingsFormPreset: FormPreset = {
  name: 'settingsForm',
  description: 'Settings form with various preferences',
  defaultValues: {
    notifications: true,
    emailUpdates: false,
    language: 'en',
    timezone: 'UTC',
  },
  useCase: 'Application settings, user preferences',
}

/**
 * All available form presets
 */
export const formPresets: Record<FormPresetName, FormPreset> = {
  userProfile: userProfilePreset,
  contactForm: contactFormPreset,
  loginForm: loginFormPreset,
  registrationForm: registrationFormPreset,
  searchForm: searchFormPreset,
  settingsForm: settingsFormPreset,
}

/**
 * Get a form preset by name
 *
 * @example
 * ```tsx
 * const preset = getPreset('userProfile')
 * const form = useForm(preset)
 * ```
 */
export function getPreset(name: FormPresetName): FormPreset {
  return formPresets[name]
}

/**
 * Extend a preset with custom values
 *
 * @example
 * ```tsx
 * const customPreset = extendPreset('userProfile', {
 *   defaultValues: { firstName: 'John' }
 * })
 * ```
 */
export function extendPreset<TFormData = any>(
  name: FormPresetName,
  overrides: Partial<FormPreset<TFormData>>
): FormPreset<TFormData> {
  const preset = formPresets[name]
  return {
    ...preset,
    ...overrides,
    defaultValues: {
      ...preset.defaultValues,
      ...overrides.defaultValues,
    },
  } as FormPreset<TFormData>
}

/**
 * Preset recommendations based on use case
 */
export const presetRecommendations = {
  getRecommendation: (config: {
    hasAuthentication?: boolean
    hasUserProfile?: boolean
    hasContactInfo?: boolean
    hasSearch?: boolean
    hasSettings?: boolean
  }): FormPresetName => {
    if (config.hasAuthentication) return 'loginForm'
    if (config.hasUserProfile) return 'userProfile'
    if (config.hasContactInfo) return 'contactForm'
    if (config.hasSearch) return 'searchForm'
    if (config.hasSettings) return 'settingsForm'
    return 'userProfile'
  },
}

/**
 * Example usage for each preset
 */
export const presetExamples = {
  userProfile: `
import { useForm } from '@tanstack/react-form'
import { getPreset } from '@/features/system/supporting/forms'

const preset = getPreset('userProfile')
const form = useForm(preset)
`,
  contactForm: `
import { useForm } from '@tanstack/react-form'
import { getPreset } from '@/features/system/supporting/forms'

const preset = getPreset('contactForm')
const form = useForm(preset)
`,
  loginForm: `
import { useForm } from '@tanstack/react-form'
import { getPreset } from '@/features/system/supporting/forms'

const preset = getPreset('loginForm')
const form = useForm(preset)
`,
  registrationForm: `
import { useForm } from '@tanstack/react-form'
import { getPreset } from '@/features/system/supporting/forms'

const preset = getPreset('registrationForm')
const form = useForm(preset)
`,
  searchForm: `
import { useForm } from '@tanstack/react-form'
import { getPreset } from '@/features/system/supporting/forms'

const preset = getPreset('searchForm')
const form = useForm(preset)
`,
  settingsForm: `
import { useForm } from '@tanstack/react-form'
import { getPreset } from '@/features/system/supporting/forms'

const preset = getPreset('settingsForm')
const form = useForm(preset)
`,
}
