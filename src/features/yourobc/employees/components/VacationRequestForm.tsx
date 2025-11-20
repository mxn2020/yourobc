// src/features/yourobc/employees/components/VacationRequestForm.tsx

import { FC, useState, useEffect } from 'react'
import { useToast } from '@/features/system/notifications'
import {
  Input,
  Button,
  Card,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DatePicker,
  Textarea,
} from '@/components/ui'
import { EMPLOYEE_CONSTANTS, VACATION_TYPE_LABELS } from '../types'
import type { VacationRequestFormData, EmergencyContact } from '../types'

interface VacationRequestFormProps {
  initialData?: Partial<VacationRequestFormData>
  onSubmit: (data: VacationRequestFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  remainingDays?: number
  currentYear?: number
}

export const VacationRequestForm: FC<VacationRequestFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Submit Request',
  isLoading = false,
  remainingDays = 0,
  currentYear = new Date().getFullYear(),
}) => {
  const toast = useToast()

  const [formData, setFormData] = useState<VacationRequestFormData>({
    year: currentYear,
    startDate: 0,
    endDate: 0,
    days: 0,
    type: 'annual',
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calculatedDays, setCalculatedDays] = useState(0)

  // Calculate vacation days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      
      if (end >= start) {
        let days = 0
        const currentDate = new Date(start)
        
        while (currentDate <= end) {
          const dayOfWeek = currentDate.getDay()
          // Count only weekdays for annual leave
          if (formData.type === 'annual') {
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
              days++
            }
          } else {
            // For sick/personal leave, count all days
            days++
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        setCalculatedDays(days)
        setFormData(prev => ({ ...prev, days }))
      }
    }
  }, [formData.startDate, formData.endDate, formData.type])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    // Validation
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date'
    }
    if (formData.days <= 0) newErrors.days = 'Number of days must be greater than 0'
    if (formData.days > 50) newErrors.days = 'Cannot request more than 50 days at once'

    // Check if enough vacation days remaining (for annual leave only)
    if (formData.type === 'annual' && formData.days > remainingDays) {
      newErrors.days = `Only ${remainingDays} vacation days remaining`
    }

    // Emergency contact validation for long vacations
    if (formData.days >= 5 && formData.type === 'annual') {
      if (!formData.emergencyContact?.name) {
        newErrors['emergencyContact.name'] = 'Emergency contact required for long vacations'
      }
      if (!formData.emergencyContact?.phone) {
        newErrors['emergencyContact.phone'] = 'Emergency contact phone required'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const updateField = (field: keyof VacationRequestFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const updateEmergencyContact = (field: keyof EmergencyContact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      } as EmergencyContact,
    }))
    
    const errorKey = `emergencyContact.${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
  }

  const getVacationTypeDescription = (type: string) => {
    const descriptions = {
      annual: 'Regular vacation time that counts against your annual allowance',
      sick: 'Medical leave for illness or injury',
      personal: 'Personal time off for family or personal matters',
      maternity: 'Maternity leave for new mothers',
      paternity: 'Paternity leave for new fathers',
    }
    return descriptions[type as keyof typeof descriptions] || ''
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vacation Request Details</h3>

          <div className="space-y-6">
            {/* Vacation Type */}
            <div>
              <Label required>Vacation Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateField('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VACATION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {getVacationTypeDescription(formData.type)}
              </p>
              {errors.type && (
                <p className="text-red-600 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DatePicker
                mode="single"
                label="Start Date"
                value={formData.startDate ? new Date(formData.startDate) : undefined}
                onChange={(date) => updateField('startDate', date?.getTime())}
                placeholder="Select start date"
                fromDate={new Date()}
                error={errors.startDate}
                required
              />

              <DatePicker
                mode="single"
                label="End Date"
                value={formData.endDate ? new Date(formData.endDate) : undefined}
                onChange={(date) => updateField('endDate', date?.getTime())}
                placeholder="Select end date"
                fromDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                error={errors.endDate}
                required
              />
            </div>

            {/* Calculated Days Summary */}
            {calculatedDays > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-900">
                      {formData.type === 'annual' ? 'Working Days' : 'Total Days'} Requested
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {calculatedDays}
                    </div>
                  </div>
                  
                  {formData.type === 'annual' && (
                    <div className="space-y-1 text-xs text-blue-800">
                      <div>Remaining vacation days: {remainingDays}</div>
                      <div>After this request: {remainingDays - calculatedDays}</div>
                      {calculatedDays > remainingDays && (
                        <div className="text-red-600 font-medium">
                          ⚠️ Insufficient vacation days remaining
                        </div>
                      )}
                    </div>
                  )}

                  {formData.type === 'annual' && formData.startDate && formData.endDate && (
                    <div className="mt-2 text-xs text-blue-700">
                      <div>💡 Weekends are not counted for annual leave</div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Reason */}
            <div>
              <Label>Reason {formData.type !== 'annual' && '(Required)'}</Label>
              <Textarea
                value={formData.reason || ''}
                onChange={(e) => updateField('reason', e.target.value)}
                placeholder="Provide details about your vacation request..."
                rows={3}
                required={formData.type !== 'annual'}
              />
              {errors.reason && (
                <p className="text-red-600 text-sm mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Emergency Contact (for long vacations) */}
            {(calculatedDays >= 5 && formData.type === 'annual') && (
              <Card className="bg-yellow-50 border-yellow-200">
                <div className="p-4">
                  <h4 className="font-medium text-yellow-900 mb-3">
                    Emergency Contact (Required for 5+ day vacations)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Contact Name"
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) => updateEmergencyContact('name', e.target.value)}
                      error={errors['emergencyContact.name']}
                      placeholder="Full name"
                      required
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      value={formData.emergencyContact?.phone || ''}
                      onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                      error={errors['emergencyContact.phone']}
                      placeholder="+49 123 456789"
                      required
                    />

                    <Input
                      label="Relationship"
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={(e) => updateEmergencyContact('relationship', e.target.value)}
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Important Notes */}
            <Card className="bg-gray-50">
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">📋 Important Notes</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Vacation requests must be submitted at least 2 weeks in advance</li>
                  <li>• Annual leave requests are subject to manager approval</li>
                  <li>• Sick leave may require medical documentation for extended periods</li>
                  <li>• You will receive an email confirmation once your request is processed</li>
                  {formData.type === 'annual' && (
                    <li>• Weekend days are automatically excluded from annual leave calculations</li>
                  )}
                </ul>
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
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isLoading || calculatedDays === 0}
        >
          {isLoading ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}