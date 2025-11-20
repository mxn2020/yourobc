// src/features/yourobc/customers/components/CustomerForm.tsx

import { FC, useState } from 'react'
import { useToast } from '@/features/system/notifications'
import { useCustomerForm } from '../hooks/useCustomers'
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
import {
  CUSTOMER_CONSTANTS,
  COMMON_COUNTRIES,
  COMMON_CURRENCIES,
  COMMON_PAYMENT_TERMS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  CURRENCY_LABELS,
} from '../types'
import type { CustomerFormData, Customer } from '../types'

interface CustomerFormProps {
  initialData?: Partial<Customer> | null
  onSubmit: (data: CustomerFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  showAllFields?: boolean
}

export const CustomerForm: FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Customer',
  isLoading = false,
  showAllFields = true,
}) => {
  const toast = useToast()
  const [sameAsbilling, setSameAsBilling] = useState(false)

  const { formData, errors, isDirty, updateField, validateForm, setFormData } = useCustomerForm(
    initialData
      ? ({
          companyName: initialData.companyName || '',
          shortName: initialData.shortName,
          primaryContact: initialData.primaryContact || { name: '', isPrimary: true },
          additionalContacts: initialData.additionalContacts || [],
          billingAddress: initialData.billingAddress || { city: '', country: '', countryCode: '' },
          shippingAddress: initialData.shippingAddress,
          defaultCurrency: initialData.defaultCurrency,
          paymentTerms: initialData.paymentTerms,
          paymentMethod: initialData.paymentMethod,
          margin: initialData.margin,
          inquirySourceId: initialData.inquirySourceId,
          tags: initialData.tags || [],
          notes: initialData.notes,
          internalNotes: initialData.internalNotes,
          website: initialData.website,
        } as any)
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

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked)
    if (checked) {
      updateField('shippingAddress', { ...formData.billingAddress })
    } else {
      updateField('shippingAddress', undefined)
    }
  }

  const addTag = (tag: string) => {
    if (!tag.trim()) return
    const newTags = [...(formData.tags || []), tag.trim()]
    updateField('tags', newTags)
  }

  const removeTag = (index: number) => {
    const newTags = [...(formData.tags || [])]
    newTags.splice(index, 1)
    updateField('tags', newTags)
  }

  const addContact = () => {
    const newContacts = [...(formData.additionalContacts || [])]
    newContacts.push({ name: '', isPrimary: false })
    updateField('additionalContacts', newContacts)
  }

  const removeContact = (index: number) => {
    const newContacts = [...(formData.additionalContacts || [])]
    newContacts.splice(index, 1)
    updateField('additionalContacts', newContacts)
  }

  const updateContact = (index: number, field: string, value: any) => {
    const newContacts = [...(formData.additionalContacts || [])]
    newContacts[index] = { ...newContacts[index], [field]: value }
    updateField('additionalContacts', newContacts)
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
              maxLength={CUSTOMER_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH}
              required
            />

            <Input
              label="Short Name"
              value={formData.shortName || ''}
              onChange={(e) => updateField('shortName', e.target.value)}
              error={errors.shortName}
              placeholder="Optional short name or abbreviation"
              maxLength={CUSTOMER_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH}
            />
          </div>

          <div className="mt-6">
            <Input
              label="Website"
              type="url"
              value={formData.website || ''}
              onChange={(e) => updateField('website', e.target.value)}
              error={errors.website}
              placeholder="https://www.company.com"
              maxLength={CUSTOMER_CONSTANTS.LIMITS.MAX_WEBSITE_LENGTH}
            />
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
              placeholder="Enter contact name"
              maxLength={CUSTOMER_CONSTANTS.LIMITS.MAX_CONTACT_NAME_LENGTH}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.primaryContact.email || ''}
              onChange={(e) => handleNestedUpdate('primaryContact.email', e.target.value)}
              error={errors['primaryContact.email']}
              placeholder="contact@company.com"
              maxLength={CUSTOMER_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH}
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.primaryContact.phone || ''}
              onChange={(e) => handleNestedUpdate('primaryContact.phone', e.target.value)}
              error={errors['primaryContact.phone']}
              placeholder="+49 123 456789"
              maxLength={CUSTOMER_CONSTANTS.LIMITS.MAX_PHONE_LENGTH}
            />
          </div>
        </div>
      </Card>

      {/* Additional Contacts */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Contacts</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addContact}
              disabled={
                (formData.additionalContacts?.length || 0) >= CUSTOMER_CONSTANTS.LIMITS.MAX_CONTACTS
              }
            >
              + Add Contact
            </Button>
          </div>

          {formData.additionalContacts && formData.additionalContacts.length > 0 ? (
            <div className="space-y-4">
              {formData.additionalContacts.map((contact, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      label="Name"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Contact name"
                      required
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="email@company.com"
                    />

                    <Input
                      label="Phone"
                      type="tel"
                      value={contact.phone || ''}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="+49 123 456789"
                    />

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeContact(index)}
                        className="w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No additional contacts added</p>
          )}
        </div>
      </Card>

      {/* Billing Address */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Street Address"
              value={formData.billingAddress.street || ''}
              onChange={(e) => handleNestedUpdate('billingAddress.street', e.target.value)}
              placeholder="Street address"
            />

            <Input
              label="City"
              value={formData.billingAddress.city}
              onChange={(e) => handleNestedUpdate('billingAddress.city', e.target.value)}
              error={errors['billingAddress.city']}
              placeholder="City"
              required
            />

            <Input
              label="Postal Code"
              value={formData.billingAddress.postalCode || ''}
              onChange={(e) => handleNestedUpdate('billingAddress.postalCode', e.target.value)}
              placeholder="Postal code"
            />

            <div>
              <Label required>Country</Label>
              <Select
                value={formData.billingAddress.countryCode}
                onValueChange={(value) => {
                  const country = COMMON_COUNTRIES.find((c) => c.code === value)
                  handleNestedUpdate('billingAddress.countryCode', value)
                  handleNestedUpdate('billingAddress.country', country?.name || value)
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
              {errors['billingAddress.country'] && (
                <p className="text-red-600 text-sm mt-1">{errors['billingAddress.country']}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Shipping Address */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
            <div className="flex items-center">
              <Checkbox
                id="same-as-billing"
                checked={sameAsbilling}
                onChange={handleSameAsBillingChange}
              />
              <label
                htmlFor="same-as-billing"
                className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
              >
                Same as billing address
              </label>
            </div>
          </div>

          {!sameAsbilling && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Street Address"
                value={formData.shippingAddress?.street || ''}
                onChange={(e) => handleNestedUpdate('shippingAddress.street', e.target.value)}
                placeholder="Street address"
              />

              <Input
                label="City"
                value={formData.shippingAddress?.city || ''}
                onChange={(e) => handleNestedUpdate('shippingAddress.city', e.target.value)}
                placeholder="City"
              />

              <Input
                label="Postal Code"
                value={formData.shippingAddress?.postalCode || ''}
                onChange={(e) => handleNestedUpdate('shippingAddress.postalCode', e.target.value)}
                placeholder="Postal code"
              />

              <div>
                <Label>Country</Label>
                <Select
                  value={formData.shippingAddress?.countryCode || ''}
                  onValueChange={(value) => {
                    const country = COMMON_COUNTRIES.find((c) => c.code === value)
                    handleNestedUpdate('shippingAddress.countryCode', value)
                    handleNestedUpdate('shippingAddress.country', country?.name || value)
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
          )}

          {sameAsbilling && (
            <p className="text-gray-500 text-sm">Shipping address is the same as billing address</p>
          )}
        </div>
      </Card>

      {/* Business Terms */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Terms</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Default Currency</Label>
              <Select
                value={formData.defaultCurrency || CUSTOMER_CONSTANTS.DEFAULT_VALUES.CURRENCY}
                onValueChange={(value: any) => updateField('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {CURRENCY_LABELS[currency]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Terms</Label>
              <Select
                value={String(formData.paymentTerms || CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS)}
                onValueChange={(value) => updateField('paymentTerms', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term.value} value={String(term.value)}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select
                value={formData.paymentMethod || CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_METHOD}
                onValueChange={(value: any) => updateField('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {PAYMENT_METHOD_LABELS[method]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              label="Margin (%)"
              type="number"
              min={CUSTOMER_CONSTANTS.LIMITS.MIN_MARGIN}
              max={CUSTOMER_CONSTANTS.LIMITS.MAX_MARGIN}
              step="0.1"
              value={formData.margin ?? CUSTOMER_CONSTANTS.DEFAULT_VALUES.MARGIN}
              onChange={(e) => updateField('margin', parseFloat(e.target.value))}
              error={errors.margin}
              placeholder="0"
              helpText="Profit margin percentage for this customer"
            />
          </div>
        </div>
      </Card>

      {/* Tags */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.tags && formData.tags.length > 0 ? (
                formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No tags added</p>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
                disabled={(formData.tags?.length || 0) >= CUSTOMER_CONSTANTS.LIMITS.MAX_TAGS}
              />
              <span className="text-xs text-gray-500 flex items-center">
                {formData.tags?.length || 0}/{CUSTOMER_CONSTANTS.LIMITS.MAX_TAGS}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Customer Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                error={errors.notes}
                placeholder="Public notes about the customer..."
                rows={4}
                maxLength={CUSTOMER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH}
              />
              <p className="text-xs text-gray-500 mt-1">
                Visible to customer-facing staff
              </p>
            </div>

            <div>
              <Label>Internal Notes</Label>
              <Textarea
                value={formData.internalNotes || ''}
                onChange={(e) => updateField('internalNotes', e.target.value)}
                error={errors.internalNotes}
                placeholder="Internal notes for staff only..."
                rows={4}
                maxLength={CUSTOMER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH}
              />
              <p className="text-xs text-gray-500 mt-1">
                Internal use only - not visible to customer
              </p>
            </div>
          </div>
        </div>
      </Card>

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