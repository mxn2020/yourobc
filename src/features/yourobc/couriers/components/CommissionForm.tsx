// src/features/yourobc/couriers/components/CommissionForm.tsx

import { FC, useState } from 'react'
import { Input, Button, Card, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { COMMISSION_TYPE_LABELS } from '../types'
import type { CommissionFormData, CourierId } from '../types'

interface CommissionFormProps {
    initialData?: Partial<CommissionFormData>
    onSubmit: (data: CommissionFormData) => void
    onCancel: () => void
    submitLabel?: string
    isLoading?: boolean
}

export const CommissionForm: FC<CommissionFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    submitLabel = 'Create Commission',
    isLoading = false,
}) => {
    const [formData, setFormData] = useState<CommissionFormData>({
        courierId: '' as CourierId,
        shipmentId: '',
        type: 'percentage',
        rate: 15,
        baseAmount: 0,
        ...initialData,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: Record<string, string> = {}

        if (!formData.courierId) newErrors.courierId = 'Courier is required'
        if (!formData.shipmentId) newErrors.shipmentId = 'Shipment ID is required'
        if (formData.rate <= 0) newErrors.rate = 'Rate must be greater than 0'
        if (formData.baseAmount <= 0) newErrors.baseAmount = 'Base amount must be greater than 0'

        // Validate shipment ID format (should be a valid Convex ID)
        if (formData.shipmentId && !formData.shipmentId.match(/^[a-z0-9]+$/)) {
            newErrors.shipmentId = 'Invalid shipment ID format'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onSubmit(formData)
    }

    const updateField = (field: keyof CommissionFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }))
        }
    }

    const calculatedCommission =
        formData.type === 'percentage'
            ? Math.round((formData.baseAmount * formData.rate / 100) * 100) / 100
            : formData.rate

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Details</h3>

                    <div className="space-y-6">
                        {/* Shipment ID */}
                        <Input
                            label="Shipment ID"
                            type="text"
                            value={formData.shipmentId}
                            onChange={(e) => updateField('shipmentId', e.target.value)}
                            error={errors.shipmentId}
                            placeholder="Enter shipment ID (e.g., j57abc123...)"
                            helpText="The unique ID of the shipment this commission is for"
                            required
                        />

                        {/* Commission Type */}
                        <div>
                            <Label required>Commission Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => updateField('type', value as 'percentage' | 'fixed')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">
                                        {COMMISSION_TYPE_LABELS.percentage}
                                    </SelectItem>
                                    <SelectItem value="fixed">{COMMISSION_TYPE_LABELS.fixed}</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.type === 'percentage'
                                    ? 'Commission will be calculated as a percentage of the base amount'
                                    : 'Commission will be a fixed amount regardless of base amount'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label={formData.type === 'percentage' ? 'Rate (%)' : 'Fixed Amount (€)'}
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.rate}
                                onChange={(e) => updateField('rate', parseFloat(e.target.value))}
                                error={errors.rate}
                                helpText={
                                    formData.type === 'percentage'
                                        ? 'Percentage commission rate (e.g., 15 for 15%)'
                                        : 'Fixed commission amount in EUR'
                                }
                                required
                            />

                            <Input
                                label="Base Amount (€)"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.baseAmount}
                                onChange={(e) => updateField('baseAmount', parseFloat(e.target.value))}
                                error={errors.baseAmount}
                                helpText="Shipment revenue or agreed amount"
                                required
                            />
                        </div>

                        {/* Calculated Commission Preview */}
                        <Card className="bg-blue-50 border-blue-200">
                            <div className="p-4">
                                <div className="text-sm text-blue-900 mb-1">Calculated Commission</div>
                                <div className="text-2xl font-bold text-blue-900">
                                    €{calculatedCommission.toFixed(2)}
                                </div>
                                {formData.type === 'percentage' && (
                                    <div className="text-xs text-blue-700 mt-1">
                                        {formData.rate}% of €{formData.baseAmount.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Summary Info */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base Amount:</span>
                                <span className="font-medium text-gray-900">
                                    €{formData.baseAmount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Commission Rate:</span>
                                <span className="font-medium text-gray-900">
                                    {formData.type === 'percentage'
                                        ? `${formData.rate}%`
                                        : `€${formData.rate.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="text-gray-900 font-semibold">Commission Amount:</span>
                                <span className="font-bold text-green-600">
                                    €{calculatedCommission.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? 'Creating...' : submitLabel}
                </Button>
            </div>
        </form>
    )
}