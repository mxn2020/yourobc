// src/features/yourobc/invoices/components/CollectionAttemptForm.tsx

import { FC, useState } from 'react'
import { Input, Textarea, Button, Card, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { COLLECTION_METHOD_LABELS } from '../types'
import type { CollectionAttemptFormData } from '../types'

interface CollectionAttemptFormProps {
  initialData?: Partial<CollectionAttemptFormData>
  onSubmit: (data: CollectionAttemptFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  suggestedMethod?: string
}

export const CollectionAttemptForm: FC<CollectionAttemptFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Add Collection Attempt',
  isLoading = false,
  suggestedMethod,
}) => {
  const [formData, setFormData] = useState<CollectionAttemptFormData>({
    method: (suggestedMethod as any) || 'email',
    result: '',
    notes: '',
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.method) {
      newErrors.method = 'Collection method is required'
    }

    if (!formData.result.trim()) {
      newErrors.result = 'Result description is required'
    }

    if (formData.result.length < 10) {
      newErrors.result = 'Please provide a more detailed result'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const updateField = (field: keyof CollectionAttemptFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Attempt Details</h3>

          <div className="space-y-6">
            {/* Collection Method */}
            <div>
              <Label required>Collection Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => updateField('method', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLLECTION_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.method && (
                <p className="text-red-600 text-sm mt-1">{errors.method}</p>
              )}
              {suggestedMethod && formData.method === suggestedMethod && (
                <p className="text-blue-600 text-sm mt-1">
                  ✓ This is the suggested next action
                </p>
              )}
            </div>

            {/* Result */}
            <Textarea
              label="Result"
              value={formData.result}
              onChange={(e) => updateField('result', e.target.value)}
              error={errors.result}
              placeholder="Describe what happened during this collection attempt..."
              rows={4}
              helpText="Be specific about the outcome, response received, or next steps discussed"
              required
            />

            {/* Additional Notes */}
            <Textarea
              label="Additional Notes"
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any additional context or follow-up actions (optional)"
              rows={3}
            />

            {/* Method-specific guidance */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {COLLECTION_METHOD_LABELS[formData.method]} Guidelines
                </h4>
                <div className="text-sm text-blue-800">
                  {getMethodGuidelines(formData.method)}
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
          {isLoading ? 'Adding...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function getMethodGuidelines(method: string): string {
  switch (method) {
    case 'email':
      return 'Send a professional payment reminder via email. Include invoice details, payment options, and contact information. Keep tone polite but firm.'
    case 'phone':
      return 'Make a direct phone call to discuss the overdue payment. Document the conversation details, any promises made, and agreed next steps.'
    case 'letter':
      return 'Send a formal written notice by mail. This creates an official paper trail and shows increased seriousness about collection.'
    case 'legal_notice':
      return 'Send a formal legal notice indicating potential legal action. This is typically the final warning before involving debt collection or legal proceedings.'
    case 'debt_collection':
      return 'Transfer the account to a debt collection agency or legal firm. Document all previous attempts and provide complete file to the collection agency.'
    default:
      return 'Document the collection attempt details and outcome for future reference.'
  }
}