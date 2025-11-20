// src/features/yourobc/invoices/components/InvoiceForm.tsx

import { FC, useState, useEffect } from 'react'
import { useInvoiceForm } from '../hooks/useInvoices'
import { useCustomer } from '@/features/yourobc/customers/hooks/useCustomers'
import { usePartner } from '@/features/yourobc/partners/hooks/usePartners'
import { useShipment } from '@/features/yourobc/shipments/hooks/useShipments'
import { CustomerSearch } from '@/features/yourobc/customers/components/CustomerSearch'
import { PartnerSearch } from '@/features/yourobc/partners/components/PartnerSearch'
import { ShipmentSearch } from '@/features/yourobc/shipments/components/ShipmentSearch'
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import {
  INVOICE_CONSTANTS,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  CURRENCY_SYMBOLS,
  TAX_RATES,
} from '../types'
import type { InvoiceFormData, Invoice, LineItem } from '../types'
import type { Id } from '@/convex/_generated/dataModel'

interface InvoiceFormProps {
  initialData?: Partial<Invoice> | null
  onSubmit: (data: InvoiceFormData) => void
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

export const InvoiceForm: FC<InvoiceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Invoice',
  isLoading = false,
  showAllFields = true,
}) => {
  const [entityType, setEntityType] = useState<'customer' | 'partner' | 'shipment' | ''>('')

  const {
    formData,
    errors,
    isDirty,
    updateField,
    addLineItem,
    updateLineItem,
    removeLineItem,
    validateForm,
    setFormData,
  } = useInvoiceForm(
    initialData
      ? {
          type: initialData.type || 'outgoing',
          shipmentId: initialData.shipmentId,
          customerId: initialData.customerId,
          partnerId: initialData.partnerId,
          invoiceNumber: initialData.invoiceNumber,
          externalInvoiceNumber: initialData.externalInvoiceNumber,
          issueDate: initialData.issueDate || Date.now(),
          dueDate: initialData.dueDate,
          description: initialData.description || '',
          lineItems: initialData.lineItems || [],
          subtotal: initialData.subtotal || { amount: 0, currency: 'EUR' },
          taxAmount: initialData.taxAmount,
          taxRate: initialData.taxRate,
          totalAmount: initialData.totalAmount || { amount: 0, currency: 'EUR' },
          paymentTerms: initialData.paymentTerms,
          billingAddress: initialData.billingAddress,
          purchaseOrderNumber: initialData.purchaseOrderNumber,
          notes: initialData.notes,
        }
      : undefined
  )

  // Fetch selected entities for display
  const { customer: selectedCustomer } = useCustomer(formData.customerId)
  const { partner: selectedPartner } = usePartner(formData.partnerId)
  const { shipment: selectedShipment } = useShipment(formData.shipmentId)

  // Initialize entity type based on initial data
  useEffect(() => {
    if (initialData) {
      if (initialData.customerId) {
        setEntityType('customer')
      } else if (initialData.partnerId) {
        setEntityType('partner')
      } else if (initialData.shipmentId) {
        setEntityType('shipment')
      }
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate entity selection
    if (!formData.customerId && !formData.partnerId && !formData.shipmentId) {
      alert('Please select a customer, partner, or shipment for this invoice.')
      return
    }

    if (!validateForm()) {
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

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const calculateDueDate = () => {
    if (formData.paymentTerms) {
      const dueDate = formData.issueDate + (formData.paymentTerms * 24 * 60 * 60 * 1000)
      updateField('dueDate', dueDate)
    }
  }

  const handleEntityTypeChange = (newEntityType: 'customer' | 'partner' | 'shipment' | '') => {
    setEntityType(newEntityType)
    // Clear all entity selections when changing type
    updateField('customerId', undefined)
    updateField('partnerId', undefined)
    updateField('shipmentId', undefined)
  }

  const handleCustomerSelect = (customer: any) => {
    if (customer) {
      updateField('customerId', customer._id as Id<'yourobcCustomers'>)
    } else {
      updateField('customerId', undefined)
    }
  }

  const handlePartnerSelect = (partner: any) => {
    if (partner) {
      updateField('partnerId', partner._id as Id<'yourobcPartners'>)
    } else {
      updateField('partnerId', undefined)
    }
  }

  const handleShipmentSelect = (shipment: any) => {
    if (shipment) {
      updateField('shipmentId', shipment._id as Id<'yourobcShipments'>)
    } else {
      updateField('shipmentId', undefined)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label required>Invoice Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateField('type', value as 'incoming' | 'outgoing')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outgoing">
                    {INVOICE_TYPE_LABELS.outgoing} (We send)
                  </SelectItem>
                  <SelectItem value="incoming">
                    {INVOICE_TYPE_LABELS.incoming} (We receive)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Invoice Number</Label>
              <Input
                value={formData.invoiceNumber || ''}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
                placeholder="Auto-generated if empty"
                maxLength={INVOICE_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              error={errors.description}
              placeholder="Invoice description"
              maxLength={INVOICE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH}
              required
            />

            <Input
              label="External Invoice Number"
              value={formData.externalInvoiceNumber || ''}
              onChange={(e) => updateField('externalInvoiceNumber', e.target.value)}
              placeholder="Reference number (optional)"
              maxLength={INVOICE_CONSTANTS.LIMITS.MAX_REFERENCE_LENGTH}
            />
          </div>
        </div>
      </Card>

      {/* Entity Association */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Invoice For / From
            <span className="text-red-500 ml-1">*</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select who this invoice is for (outgoing) or from (incoming).
          </p>

          <div className="space-y-6">
            {/* Entity Type Selector */}
            <div>
              <Label required>Entity Type</Label>
              <Select
                value={entityType}
                onValueChange={(value) => handleEntityTypeChange(value as 'customer' | 'partner' | 'shipment' | '')}
              >
                <SelectTrigger className={!entityType ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="shipment">Shipment</SelectItem>
                </SelectContent>
              </Select>
              {!entityType && (
                <p className="text-red-600 text-sm mt-1">Please select an entity type</p>
              )}
            </div>

            {/* Entity Search Component */}
            {entityType && (
              <div>
                <Label required>
                  Search and Select {entityType === 'customer' ? 'Customer' : entityType === 'partner' ? 'Partner' : 'Shipment'}
                </Label>

                {entityType === 'customer' && (
                  <CustomerSearch
                    onSelect={handleCustomerSelect}
                    selectedCustomer={selectedCustomer}
                    placeholder="Search customers..."
                  />
                )}

                {entityType === 'partner' && (
                  <PartnerSearch
                    onSelect={handlePartnerSelect}
                    selectedPartner={selectedPartner}
                    placeholder="Search partners..."
                  />
                )}

                {entityType === 'shipment' && (
                  <ShipmentSearch
                    onSelect={handleShipmentSelect}
                    selectedShipment={selectedShipment as any}
                    placeholder="Search shipments..."
                  />
                )}

                {!formData.customerId && !formData.partnerId && !formData.shipmentId && (
                  <p className="text-red-600 text-sm mt-1">Please select a {entityType}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Date & Payment Terms */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates & Payment Terms</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Issue Date"
              type="date"
              value={new Date(formData.issueDate).toISOString().split('T')[0]}
              onChange={(e) => updateField('issueDate', new Date(e.target.value).getTime())}
              error={errors.issueDate}
              required
            />

            <div>
              <Label>Payment Terms (days)</Label>
              <Select
                value={formData.paymentTerms?.toString() || '30'}
                onValueChange={(value) => {
                  updateField('paymentTerms', parseInt(value))
                  setTimeout(calculateDueDate, 0)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Immediate</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => updateField('dueDate', new Date(e.target.value).getTime())}
              error={errors.dueDate}
            />
          </div>

          <div className="mt-6">
            <Input
              label="Purchase Order Number"
              value={formData.purchaseOrderNumber || ''}
              onChange={(e) => updateField('purchaseOrderNumber', e.target.value)}
              placeholder="PO number (optional)"
              maxLength={INVOICE_CONSTANTS.LIMITS.MAX_REFERENCE_LENGTH}
            />
          </div>
        </div>
      </Card>

      {/* Line Items */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
            <Button
              type="button"
              variant="secondary"
              onClick={addLineItem}
              disabled={formData.lineItems.length >= INVOICE_CONSTANTS.LIMITS.MAX_LINE_ITEMS}
            >
              + Add Item
            </Button>
          </div>

          {formData.lineItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No line items yet</p>
              <Button
                type="button"
                variant="primary"
                onClick={addLineItem}
                className="mt-2"
              >
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-20">Qty</TableHead>
                    <TableHead className="w-32">Unit Price</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">
                            {CURRENCY_SYMBOLS[item.unitPrice.currency]}
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice.amount}
                            onChange={(e) => updateLineItem(index, 'unitPrice', {
                              ...item.unitPrice,
                              amount: parseFloat(e.target.value) || 0
                            })}
                            className="w-28"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(item.totalPrice.amount, item.totalPrice.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {errors.lineItems && (
            <p className="text-red-600 text-sm mt-2">{errors.lineItems}</p>
          )}
        </div>
      </Card>

      {/* Totals & Tax */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Totals & Tax</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Currency</Label>
              <Select
                value={formData.subtotal.currency}
                onValueChange={(value) => {
                  const currency = value as 'EUR' | 'USD'
                  setFormData((prev) => ({
                    ...prev,
                    subtotal: { ...prev.subtotal, currency },
                    totalAmount: { ...prev.totalAmount, currency },
                    taxAmount: prev.taxAmount ? { ...prev.taxAmount, currency } : undefined,
                    lineItems: prev.lineItems.map(item => ({
                      ...item,
                      unitPrice: { ...item.unitPrice, currency },
                      totalPrice: { ...item.totalPrice, currency },
                    })),
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tax Rate (%)</Label>
              <Select
                value={formData.taxRate?.toString() || ''}
                onValueChange={(value) => {
                  const taxRate = value ? parseFloat(value) : undefined
                  updateField('taxRate', taxRate)
                  // Auto-calculate tax amount and total
                  if (taxRate) {
                    const taxAmount = {
                      amount: Math.round((formData.subtotal.amount * taxRate / 100) * 100) / 100,
                      currency: formData.subtotal.currency,
                    }
                    updateField('taxAmount', taxAmount)
                    updateField('totalAmount', {
                      amount: formData.subtotal.amount + taxAmount.amount,
                      currency: formData.subtotal.currency,
                    })
                  } else {
                    updateField('taxAmount', undefined)
                    updateField('totalAmount', formData.subtotal)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No tax" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Tax (0%)</SelectItem>
                  <SelectItem value="7">Reduced Rate (7%)</SelectItem>
                  <SelectItem value="19">Standard Rate (19%)</SelectItem>
                  <SelectItem value="0">Tax Exempt (0%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(formData.subtotal.amount, formData.subtotal.currency)}</span>
              </div>
              
              {formData.taxAmount && (
                <div className="flex justify-between text-sm">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>{formatCurrency(formData.taxAmount.amount, formData.taxAmount.currency)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(formData.totalAmount.amount, formData.totalAmount.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Billing Address */}
      {showAllFields && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Street Address"
                value={formData.billingAddress?.street || ''}
                onChange={(e) => handleNestedUpdate('billingAddress.street', e.target.value)}
                placeholder="Street address (optional)"
              />

              <Input
                label="City"
                value={formData.billingAddress?.city || ''}
                onChange={(e) => handleNestedUpdate('billingAddress.city', e.target.value)}
                placeholder="City"
              />

              <Input
                label="Postal Code"
                value={formData.billingAddress?.postalCode || ''}
                onChange={(e) => handleNestedUpdate('billingAddress.postalCode', e.target.value)}
                placeholder="Postal code (optional)"
              />

              <div>
                <Label>Country</Label>
                <Select
                  value={formData.billingAddress?.countryCode || ''}
                  onValueChange={(value) => {
                    const country = COUNTRIES.find((c) => c.code === value)
                    handleNestedUpdate('billingAddress.countryCode', value)
                    handleNestedUpdate('billingAddress.country', country?.name || value)
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
            </div>
          </div>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>

          <Textarea
            label="Notes"
            value={formData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Additional notes or comments (optional)"
            rows={3}
            maxLength={INVOICE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH}
          />
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