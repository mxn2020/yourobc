// src/features/yourobc/tasks/components/TaskCompletionModal.tsx

import { FC, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { TASKS_CONFIG } from '../config/tasks.config'

interface Task {
  _id: string
  title: string
  description?: string
  type: 'manual' | 'automatic'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

interface Shipment {
  _id: string
  shipmentNumber: string
  serviceType: 'OBC' | 'NFO'
}

interface TaskCompletionModalProps {
  task: Task
  shipment: Shipment
  isOpen: boolean
  onClose: () => void
  onComplete: (data: CompletionData) => Promise<void>
}

interface CompletionData {
  customerReference?: string
  hawb?: string
  mawb?: string
  customsCostsConfirmed: boolean
  excessBaggageConfirmed: boolean
  notes?: string
}

export const TaskCompletionModal: FC<TaskCompletionModalProps> = ({
  task,
  shipment,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [formData, setFormData] = useState<CompletionData>({
    customerReference: '',
    hawb: '',
    mawb: '',
    customsCostsConfirmed: false,
    excessBaggageConfirmed: false,
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determine required fields based on config and shipment type
  const requiresCustomerReference = TASKS_CONFIG.automation.requireCustomerReference
  const requiresHAWBMAWB =
    shipment.serviceType === 'NFO' && TASKS_CONFIG.automation.requireNfoHawbMawb
  const requiresCostChecks = TASKS_CONFIG.automation.requireCostChecks

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (requiresCustomerReference && !formData.customerReference?.trim()) {
      newErrors.customerReference = 'Customer reference is required'
    }

    if (requiresHAWBMAWB) {
      if (!formData.hawb?.trim()) {
        newErrors.hawb = 'HAWB is required for NFO shipments'
      }
      if (!formData.mawb?.trim()) {
        newErrors.mawb = 'MAWB is required for NFO shipments'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    if (requiresCostChecks && !formData.customsCostsConfirmed) {
      const confirmCosts = window.confirm(
        'Have all extra costs been entered (Customs, Excess Baggage, etc.)?'
      )
      if (!confirmCosts) return
    }

    try {
      setIsSubmitting(true)
      await onComplete(formData)
      onClose()
    } catch (error) {
      console.error('Failed to complete task:', error)
      setErrors({ general: 'Failed to complete task. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Complete Task</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Please confirm all required information before completing
          </p>
        </DialogHeader>

        {/* Task Info */}
        <div className="px-6 py-4 bg-muted/50 border rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={task.type === 'automatic' ? 'primary' : 'secondary'}>
              {task.type === 'automatic' ? 'Auto' : 'Manual'}
            </Badge>
            <Badge
              variant={
                task.priority === 'critical'
                  ? 'destructive'
                  : task.priority === 'high'
                  ? 'warning'
                  : 'secondary'
              }
            >
              {task.priority.toUpperCase()}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="text-sm text-muted-foreground">
            Shipment: <span className="font-medium">{shipment.shipmentNumber}</span> (
            {shipment.serviceType})
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Customer Reference */}
          {requiresCustomerReference && (
            <div className="space-y-2">
              <Label htmlFor="customerReference">
                Customer Reference <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customerReference"
                type="text"
                value={formData.customerReference}
                onChange={(e) =>
                  setFormData({ ...formData, customerReference: e.target.value })
                }
                className={errors.customerReference ? 'border-destructive' : ''}
                placeholder="Enter customer reference number"
              />
              {errors.customerReference && (
                <p className="text-destructive text-xs">{errors.customerReference}</p>
              )}
            </div>
          )}

          {/* HAWB & MAWB (NFO only) */}
          {requiresHAWBMAWB && (
            <>
              <div className="space-y-2">
                <Label htmlFor="hawb">
                  HAWB (House Airway Bill) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hawb"
                  type="text"
                  value={formData.hawb}
                  onChange={(e) => setFormData({ ...formData, hawb: e.target.value })}
                  className={errors.hawb ? 'border-destructive' : ''}
                  placeholder="Enter HAWB number"
                />
                {errors.hawb && <p className="text-destructive text-xs">{errors.hawb}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mawb">
                  MAWB (Master Airway Bill) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mawb"
                  type="text"
                  value={formData.mawb}
                  onChange={(e) => setFormData({ ...formData, mawb: e.target.value })}
                  className={errors.mawb ? 'border-destructive' : ''}
                  placeholder="Enter MAWB number"
                />
                {errors.mawb && <p className="text-destructive text-xs">{errors.mawb}</p>}
              </div>
            </>
          )}

          {/* Cost Confirmation Checks */}
          {requiresCostChecks && shipment.serviceType === 'OBC' && (
            <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <div className="font-medium text-sm">Cost Confirmation Required</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="customsCosts"
                    checked={formData.customsCostsConfirmed}
                    onChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        customsCostsConfirmed: checked,
                      })
                    }
                  />
                  <Label htmlFor="customsCosts" className="text-sm cursor-pointer">
                    All customs costs have been entered
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="excessBaggage"
                    checked={formData.excessBaggageConfirmed}
                    onChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        excessBaggageConfirmed: checked,
                      })
                    }
                  />
                  <Label htmlFor="excessBaggage" className="text-sm cursor-pointer">
                    All excess baggage costs have been entered
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Completion Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Completion Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add any notes about task completion..."
            />
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {errors.general}
            </div>
          )}
        </form>

        {/* Actions */}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Completing...' : 'Complete Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
