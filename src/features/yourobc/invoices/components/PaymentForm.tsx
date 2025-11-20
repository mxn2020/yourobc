// src/features/yourobc/invoices/components/PaymentForm.tsx

import { FC, useState } from 'react'
import { Input, Textarea, Button, Card, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { PAYMENT_METHOD_LABELS, CURRENCY_SYMBOLS } from '../types'
import type { PaymentFormData } from '../types'
import type { CurrencyAmount } from '@/convex/lib/yourobc'


interface PaymentFormProps {
  initialData?: Partial<PaymentFormData>
  invoiceAmount: CurrencyAmount
  onSubmit: (data: PaymentFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
}

export const PaymentForm: FC<PaymentFormProps> = ({
  initialData,
  invoiceAmount,
  onSubmit,
  onCancel,
  submitLabel = 'Process Payment',
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentDate: Date.now(),
    paymentMethod: 'bank_transfer',
    paidAmount: invoiceAmount,
    paymentReference: '',
    notes: '',
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (formData.paymentDate > Date.now()) {
      newErrors.paymentDate = 'Payment date cannot be in the future'
    }

    if (formData.paidAmount.amount <= 0) {
      newErrors.paidAmount = 'Payment amount must be greater than 0'
    }

    if (formData.paidAmount.amount > invoiceAmount.amount * 1.1) {
      newErrors.paidAmount = 'Payment amount seems unusually high'
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const updateField = (field: keyof PaymentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const isPartialPayment = formData.paidAmount.amount < invoiceAmount.amount
  const isOverpayment = formData.paidAmount.amount > invoiceAmount.amount

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>

          <div className="space-y-6">
            {/* Payment Amount */}
            <div>
              <Label required>Payment Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-600">
                  {CURRENCY_SYMBOLS[formData.paidAmount.currency]}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.paidAmount.amount}
                  onChange={(e) => updateField('paidAmount', {
                    ...formData.paidAmount,
                    amount: parseFloat(e.target.value) || 0
                  })}
                  error={errors.paidAmount}
                  className="text-lg font-medium"
                  required
                />
              </div>
              
              <div className="mt-2 text-sm text-gray-500">
                Invoice amount: {formatCurrency(invoiceAmount.amount, invoiceAmount.currency)}
              </div>

              {isPartialPayment && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                  ⚠️ This is a partial payment. Remaining: {formatCurrency(
                    invoiceAmount.amount - formData.paidAmount.amount,
                    invoiceAmount.currency
                  )}
                </div>
              )}

              {isOverpayment && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  ℹ️ Overpayment of: {formatCurrency(
                    formData.paidAmount.amount - invoiceAmount.amount,
                    invoiceAmount.currency
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Date */}
              <Input
                label="Payment Date"
                type="date"
                value={new Date(formData.paymentDate).toISOString().split('T')[0]}
                onChange={(e) => updateField('paymentDate', new Date(e.target.value).getTime())}
                error={errors.paymentDate}
                required
              />

              {/* Payment Method */}
              <div>
                <Label required>Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => updateField('paymentMethod', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-red-600 text-sm mt-1">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Payment Reference */}
            <Input
              label="Payment Reference"
              value={formData.paymentReference || ''}
              onChange={(e) => updateField('paymentReference', e.target.value)}
              placeholder="Transaction ID, check number, etc."
              helpText="Optional reference for tracking the payment"
            />

            {/* Notes */}
            <Textarea
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional notes about this payment (optional)"
              rows={3}
            />

            {/* Payment Summary */}
            <Card className="bg-gray-50">
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Amount:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(invoiceAmount.amount, invoiceAmount.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Amount:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(formData.paidAmount.amount, formData.paidAmount.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-semibold">Remaining Balance:</span>
                    <span className={`font-bold ${
                      invoiceAmount.amount - formData.paidAmount.amount === 0 ? 'text-green-600' :
                      invoiceAmount.amount - formData.paidAmount.amount > 0 ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {formatCurrency(
                        invoiceAmount.amount - formData.paidAmount.amount,
                        invoiceAmount.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Processing...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}