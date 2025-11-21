// src/features/yourobc/couriers/components/CourierForm.tsx

import { FC } from 'react'
import { useToast } from '@/features/system/notifications'
import { useCourierForm } from '../hooks/useCouriers'
import {
  Input,
  Textarea,
  Button,
  Card,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
} from '@/components/ui'
import { COURIER_CONSTANTS } from '../types'
import type { CourierFormData, Courier } from '../types'
import { DEFAULT_TIMEZONES, COMMON_LANGUAGES } from '@/convex/lib/yourobc/shared'

interface CourierFormProps {
  initialData?: Partial<Courier> | null
  onSubmit: (data: CourierFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  showAllFields?: boolean
}

const COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'GB', name: 'United Kingdom' },
]

export const CourierForm: FC<CourierFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Courier',
  isLoading = false,
  showAllFields = true,
}) => {
  const toast = useToast()

  const { formData, errors, isDirty, updateField, validateForm, setFormData } = useCourierForm(
    initialData
      ? {
          firstName: initialData.firstName || '',
          middleName: initialData.middleName,
          lastName: initialData.lastName || '',
          email: initialData.email,
          phone: initialData.phone || '',
          skills: initialData.skills || { languages: [], availableServices: [] },
          currentLocation: initialData.currentLocation,
          timezone: initialData.timezone,
        }
      : undefined
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    onSubmit(formData)
  }

  const handleNestedUpdate = (path: string, value: any) => {
    const pathParts = path.split('.')
    setFormData((prev) => {
      const newData = { ...prev }
      let current = newData as any

      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {}
        }
        current = current[pathParts[i]]
      }

      current[pathParts[pathParts.length - 1]] = value
      return newData
    })
  }

  const toggleLanguage = (language: string) => {
    const currentLanguages = formData.skills.languages || []
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter((l) => l !== language)
      : [...currentLanguages, language]

    handleNestedUpdate('skills.languages', newLanguages)
  }

  const toggleService = (service: 'OBC' | 'NFO') => {
    const currentServices = formData.skills.availableServices || []
    const newServices = currentServices.includes(service)
      ? currentServices.filter((s) => s !== service)
      : [...currentServices, service]

    handleNestedUpdate('skills.availableServices', newServices)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              error={errors.firstName}
              placeholder="Enter first name"
              maxLength={COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH}
              required
            />

            <Input
              label="Middle Name"
              value={formData.middleName || ''}
              onChange={(e) => updateField('middleName', e.target.value)}
              placeholder="Enter middle name (optional)"
              maxLength={COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH}
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              error={errors.lastName}
              placeholder="Enter last name"
              maxLength={COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH}
              required
            />
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={errors.phone}
              placeholder="+49 123 456789"
              maxLength={COURIER_CONSTANTS.LIMITS.MAX_PHONE_LENGTH}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              placeholder="courier@example.com"
              maxLength={COURIER_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH}
            />
          </div>
        </div>
      </Card>

      {/* Skills & Capabilities */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Capabilities</h3>

          {/* Languages */}
          <div className="mb-6">
            <Label required>Languages</Label>
            <p className="text-sm text-gray-500 mb-3">
              Select all languages the courier can speak
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {COMMON_LANGUAGES.map((language) => (
                <div key={language} className="flex items-center">
                  <Checkbox
                    id={`lang-${language}`}
                    checked={formData.skills.languages?.includes(language)}
                    onChange={() => toggleLanguage(language)}
                  />
                  <label
                    htmlFor={`lang-${language}`}
                    className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {language}
                  </label>
                </div>
              ))}
            </div>
            {errors['skills.languages'] && (
              <p className="text-red-600 text-sm mt-1">{errors['skills.languages']}</p>
            )}
          </div>

          {/* Service Types */}
          <div className="mb-6">
            <Label required>Available Services</Label>
            <p className="text-sm text-gray-500 mb-3">
              Select service types the courier can handle
            </p>
            <div className="flex gap-6">
              <div className="flex items-center">
                <Checkbox
                  id="service-obc"
                  checked={formData.skills.availableServices?.includes('OBC')}
                  onChange={() => toggleService('OBC')}
                />
                <label
                  htmlFor="service-obc"
                  className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  OBC (On Board Courier)
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="service-nfo"
                  checked={formData.skills.availableServices?.includes('NFO')}
                  onChange={() => toggleService('NFO')}
                />
                <label
                  htmlFor="service-nfo"
                  className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  NFO (Next Flight Out)
                </label>
              </div>
            </div>
            {errors['skills.availableServices'] && (
              <p className="text-red-600 text-sm mt-1">{errors['skills.availableServices']}</p>
            )}
          </div>

          {/* Max Carry Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Maximum Carry Weight (kg)"
              type="number"
              min="0"
              max={COURIER_CONSTANTS.LIMITS.MAX_CARRY_WEIGHT}
              value={formData.skills.maxCarryWeight || ''}
              onChange={(e) =>
                handleNestedUpdate('skills.maxCarryWeight', parseFloat(e.target.value))
              }
              placeholder="25"
              helpText={`Maximum ${COURIER_CONSTANTS.LIMITS.MAX_CARRY_WEIGHT}kg`}
            />

            <div>
              <Label>Certifications</Label>
              <Input
                value={formData.skills.certifications?.join(', ') || ''}
                onChange={(e) =>
                  handleNestedUpdate(
                    'skills.certifications',
                    e.target.value
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Dangerous goods, pharmaceutical, etc."
                helpText="Separate certifications with commas"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Location & Settings */}
      {showAllFields && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label>Home Country</Label>
                <Select
                  value={formData.currentLocation?.countryCode || ''}
                  onValueChange={(value) => {
                    const country = COUNTRIES.find((c) => c.code === value)
                    handleNestedUpdate('currentLocation.countryCode', value)
                    handleNestedUpdate('currentLocation.country', country?.name || value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                label="City"
                value={formData.currentLocation?.city || ''}
                onChange={(e) => handleNestedUpdate('currentLocation.city', e.target.value)}
                placeholder="City name"
              />
            </div>

            <div>
              <Label>Timezone</Label>
              <Select
                value={formData.timezone || COURIER_CONSTANTS.DEFAULT_VALUES.TIMEZONE}
                onValueChange={(value) => updateField('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}