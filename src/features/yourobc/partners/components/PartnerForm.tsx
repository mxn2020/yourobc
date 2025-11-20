// src/features/yourobc/partners/components/PartnerForm.tsx

import { FC } from 'react'
import { useToast } from '@/features/system/notifications'
import { usePartnerForm } from '../hooks/usePartners'
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
  Chip,
} from '@/components/ui'
import { 
  PARTNER_CONSTANTS, 
  COMMON_COUNTRIES, 
  COMMON_AIRPORTS, 
  PAYMENT_TERMS_OPTIONS,
  SERVICE_TYPE_LABELS 
} from '../types'
import type { PartnerFormData, Partner } from '../types'

interface PartnerFormProps {
  initialData?: Partial<Partner>
  onSubmit: (data: PartnerFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  showAllFields?: boolean
}

export const PartnerForm: FC<PartnerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Partner',
  isLoading = false,
  showAllFields = true,
}) => {
  const toast = useToast()

  const { formData, errors, isDirty, updateField, validateForm, setFormData } = usePartnerForm(
    initialData
      ? {
          companyName: initialData.companyName || '',
          shortName: initialData.shortName,
          partnerCode: initialData.partnerCode,
          serviceType: initialData.serviceType || 'both',
          primaryContact: initialData.primaryContact || { name: '', isPrimary: true },
          address: initialData.address || { city: '', country: '', countryCode: '' },
          serviceCoverage: initialData.serviceCoverage || { countries: [], cities: [], airports: [] },
          preferredCurrency: initialData.preferredCurrency,
          paymentTerms: initialData.paymentTerms,
          quotingEmail: initialData.quotingEmail,
          notes: initialData.notes,
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

  const toggleCountry = (countryCode: string, countryName: string) => {
    const currentCountries = formData.serviceCoverage.countries || []
    const newCountries = currentCountries.includes(countryName)
      ? currentCountries.filter((c) => c !== countryName)
      : [...currentCountries, countryName]

    handleNestedUpdate('serviceCoverage.countries', newCountries)
  }

  const toggleAirport = (airportCode: string) => {
    const currentAirports = formData.serviceCoverage.airports || []
    const newAirports = currentAirports.includes(airportCode)
      ? currentAirports.filter((a) => a !== airportCode)
      : [...currentAirports, airportCode]

    handleNestedUpdate('serviceCoverage.airports', newAirports)
  }

  const addCity = (city: string) => {
    if (!city.trim()) return
    const currentCities = formData.serviceCoverage.cities || []
    if (!currentCities.includes(city.trim())) {
      handleNestedUpdate('serviceCoverage.cities', [...currentCities, city.trim()])
    }
  }

  const removeCity = (city: string) => {
    const currentCities = formData.serviceCoverage.cities || []
    handleNestedUpdate('serviceCoverage.cities', currentCities.filter((c) => c !== city))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              error={errors.companyName}
              placeholder="Enter company name"
              maxLength={PARTNER_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH}
              required
            />

            <Input
              label="Short Name"
              value={formData.shortName || ''}
              onChange={(e) => updateField('shortName', e.target.value)}
              placeholder="Short name or abbreviation"
              maxLength={PARTNER_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH}
            />

            <Input
              label="Partner Code"
              value={formData.partnerCode || ''}
              onChange={(e) => updateField('partnerCode', e.target.value)}
              placeholder="Unique partner code"
              maxLength={PARTNER_CONSTANTS.LIMITS.MAX_PARTNER_CODE_LENGTH}
              helpText="Leave empty to auto-generate"
            />

            <div>
              <Label required>Service Type</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => updateField('serviceType', value as 'OBC' | 'NFO' | 'both')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OBC">{SERVICE_TYPE_LABELS.OBC}</SelectItem>
                  <SelectItem value="NFO">{SERVICE_TYPE_LABELS.NFO}</SelectItem>
                  <SelectItem value="both">{SERVICE_TYPE_LABELS.both}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Contact */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Contact Name"
              value={formData.primaryContact.name}
              onChange={(e) => handleNestedUpdate('primaryContact.name', e.target.value)}
              error={errors['primaryContact.name']}
              placeholder="Full name"
              maxLength={PARTNER_CONSTANTS.LIMITS.MAX_CONTACT_NAME_LENGTH}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.primaryContact.email || ''}
              onChange={(e) => handleNestedUpdate('primaryContact.email', e.target.value)}
              error={errors['primaryContact.email']}
              placeholder="contact@partner.com"
              maxLength={PARTNER_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH}
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.primaryContact.phone || ''}
              onChange={(e) => handleNestedUpdate('primaryContact.phone', e.target.value)}
              error={errors['primaryContact.phone']}
              placeholder="+49 123 456789"
              maxLength={PARTNER_CONSTANTS.LIMITS.MAX_PHONE_LENGTH}
            />
          </div>
        </div>
      </Card>

      {/* Address */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Street Address"
              value={formData.address.street || ''}
              onChange={(e) => handleNestedUpdate('address.street', e.target.value)}
              placeholder="Street address"
            />

            <Input
              label="City"
              value={formData.address.city}
              onChange={(e) => handleNestedUpdate('address.city', e.target.value)}
              error={errors['address.city']}
              placeholder="City name"
              required
            />

            <Input
              label="Postal Code"
              value={formData.address.postalCode || ''}
              onChange={(e) => handleNestedUpdate('address.postalCode', e.target.value)}
              placeholder="Postal code"
            />

            <div>
              <Label required>Country</Label>
              <Select
                value={formData.address.countryCode}
                onValueChange={(value) => {
                  const country = COMMON_COUNTRIES.find((c) => c.code === value)
                  handleNestedUpdate('address.countryCode', value)
                  handleNestedUpdate('address.country', country?.name || value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Service Coverage */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Coverage</h3>

          {/* Countries */}
          <div className="mb-6">
            <Label required>Countries</Label>
            <p className="text-sm text-gray-500 mb-3">
              Select countries where this partner can provide services
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {COMMON_COUNTRIES.map((country) => (
                <div key={country.code} className="flex items-center">
                  <Checkbox
                    id={`country-${country.code}`}
                    checked={formData.serviceCoverage.countries?.includes(country.name)}
                    onChange={() => toggleCountry(country.code, country.name)}
                  />
                  <label
                    htmlFor={`country-${country.code}`}
                    className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {country.name}
                  </label>
                </div>
              ))}
            </div>
            {errors['serviceCoverage.countries'] && (
              <p className="text-red-600 text-sm mt-1">{errors['serviceCoverage.countries']}</p>
            )}
          </div>

          {/* Cities */}
          <div className="mb-6">
            <Label>Cities (Optional)</Label>
            <p className="text-sm text-gray-500 mb-3">
              Add specific cities for more targeted coverage
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.serviceCoverage.cities?.map((city) => (
                <Chip
                  key={city}
                  variant="secondary"
                  onRemove={() => removeCity(city)}
                >
                  {city}
                </Chip>
              ))}
            </div>
            <Input
              placeholder="Type city name and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const input = e.target as HTMLInputElement
                  addCity(input.value)
                  input.value = ''
                }
              }}
            />
          </div>

          {/* Airports */}
          <div className="mb-6">
            <Label>Airport Codes (Optional)</Label>
            <p className="text-sm text-gray-500 mb-3">
              Select specific airports for air freight services
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {COMMON_AIRPORTS.map((airport) => (
                <div key={airport} className="flex items-center">
                  <Checkbox
                    id={`airport-${airport}`}
                    checked={formData.serviceCoverage.airports?.includes(airport)}
                    onChange={() => toggleAirport(airport)}
                  />
                  <label
                    htmlFor={`airport-${airport}`}
                    className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {airport}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Business Terms */}
      {showAllFields && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Terms</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label>Preferred Currency</Label>
                <Select
                  value={formData.preferredCurrency || PARTNER_CONSTANTS.DEFAULT_VALUES.PREFERRED_CURRENCY}
                  onValueChange={(value) => updateField('preferredCurrency', value as 'EUR' | 'USD')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Terms</Label>
                <Select
                  value={formData.paymentTerms?.toString() || PARTNER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS.toString()}
                  onValueChange={(value) => updateField('paymentTerms', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Input
              label="Quoting Email"
              type="email"
              value={formData.quotingEmail || ''}
              onChange={(e) => updateField('quotingEmail', e.target.value)}
              placeholder="quotes@partner.com"
              helpText="Email address for sending quote requests"
              maxLength={PARTNER_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH}
            />
          </div>
        </Card>
      )}

      {/* Additional Information */}
      {showAllFields && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>

            <Textarea
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Internal notes about this partner..."
              rows={4}
              maxLength={PARTNER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH}
            />
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