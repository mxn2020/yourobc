// features/system/projects/components/milestones/MilestoneFormModal.tsx

import { FC, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { SimpleSelect } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Checkbox } from '@/components/ui/Checkbox'
import { AlertCircle, Loader2, Plus, X } from 'lucide-react'
import { useToast } from '@/features/system/notifications'
import type { Id } from '@/convex/_generated/dataModel'

export interface Deliverable {
  title: string
  completed: boolean
  completedAt?: number
}

export interface MilestoneFormData {
  title: string
  description?: string
  status: 'upcoming' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  projectId?: Id<'projects'>
  startDate: number
  dueDate: number
  completedDate?: number
  progress: number
  assignedTo?: Id<'userProfiles'>
  deliverables?: Deliverable[]
  dependencies?: Id<'projectMilestones'>[]
  color?: string
}

export interface Milestone extends MilestoneFormData {
  _id: Id<'projectMilestones'>
  _creationTime?: number
  publicId: string
  tasksTotal?: number
  tasksCompleted?: number
  order: number
  createdAt: number
  createdBy?: Id<'userProfiles'>
  // Enriched fields from Convex queries
  assigneeName?: string
  assigneeEmail?: string
  assigneeAvatar?: string
  updatedAt?: number
  isOverdue?: boolean
  isDelayed?: boolean
  projectTitle?: string
  metadata?: Record<string, string | number | boolean | (string | number | boolean)[] | {} | null> | {
    notes?: string
    budget?: number
    actualCost?: number
    riskLevel?: 'low' | 'medium' | 'high' | 'critical'
    attachments?: string[]
  }
}

interface ProjectMember {
  userId: Id<'userProfiles'>
  name?: string
  email?: string
}

interface MilestoneFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<MilestoneFormData>) => Promise<void> | void
  mode: 'create' | 'edit'
  initialData?: Partial<Milestone>
  projectId: Id<'projects'>
  projectMembers?: ProjectMember[]
  existingMilestones?: Array<{ _id: Id<'projectMilestones'>; title: string }>
}

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'critical', label: 'Critical' },
]

export const MilestoneFormModal: FC<MilestoneFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  mode,
  initialData,
  projectId,
  projectMembers = [],
  existingMilestones = [],
}) => {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newDeliverable, setNewDeliverable] = useState('')

  const [formData, setFormData] = useState<Partial<MilestoneFormData>>({
    title: '',
    description: '',
    status: 'upcoming',
    priority: 'medium',
    projectId,
    startDate: Date.now(),
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
    progress: 0,
    assignedTo: undefined,
    deliverables: [],
    dependencies: [],
    color: '#3b82f6',
  })

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'upcoming',
        priority: initialData?.priority || 'medium',
        projectId: initialData?.projectId || projectId,
        startDate: initialData?.startDate || Date.now(),
        dueDate: initialData?.dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000,
        progress: initialData?.progress || 0,
        assignedTo: initialData?.assignedTo,
        deliverables: initialData?.deliverables || [],
        dependencies: initialData?.dependencies || [],
        color: initialData?.color || '#3b82f6',
      })
      setError(null)
      setNewDeliverable('')
    }
  }, [open, initialData, projectId])

  const validateForm = (): boolean => {
    if (!formData.title?.trim()) {
      setError('Milestone title is required')
      return false
    }

    if (formData.title.length > 200) {
      setError('Milestone title must be less than 200 characters')
      return false
    }

    if (!formData.startDate) {
      setError('Start date is required')
      return false
    }

    if (!formData.dueDate) {
      setError('Due date is required')
      return false
    }

    if (formData.dueDate < formData.startDate) {
      setError('Due date must be after start date')
      return false
    }

    if (formData.progress !== undefined && (formData.progress < 0 || formData.progress > 100)) {
      setError('Progress must be between 0 and 100')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      toast.success(
        mode === 'create' ? 'Milestone created successfully' : 'Milestone updated successfully'
      )
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save milestone')
      toast.error(err.message || 'Failed to save milestone')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData((prev) => ({
        ...prev,
        deliverables: [
          ...(prev.deliverables || []),
          { title: newDeliverable.trim(), completed: false },
        ],
      }))
      setNewDeliverable('')
    }
  }

  const removeDeliverable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables?.filter((_, i) => i !== index),
    }))
  }

  const toggleDeliverable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables?.map((d, i) =>
        i === index ? { ...d, completed: !d.completed } : d
      ),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Milestone' : 'Edit Milestone'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new milestone to track project progress'
              : 'Update milestone details and deliverables'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="required">
              Milestone Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter milestone title..."
              required
              maxLength={200}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Add milestone description..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <SimpleSelect
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <SimpleSelect
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value as any }))
                }
                options={PRIORITY_OPTIONS}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Dates and Progress Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="required">
                Start Date
              </Label>
              <DatePicker
                mode="single"
                id="startDate"
                value={formData.startDate ? new Date(formData.startDate) : undefined}
                onChange={(date: Date | undefined) =>
                  setFormData((prev) => ({ ...prev, startDate: date?.getTime() || Date.now() }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="required">
                Due Date
              </Label>
              <DatePicker
                mode="single"
                id="dueDate"
                value={formData.dueDate ? new Date(formData.dueDate) : undefined}
                onChange={(date: Date | undefined) =>
                  setFormData((prev) => ({ ...prev, dueDate: date?.getTime() || Date.now() }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    progress: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Assigned To and Color */}
          <div className="grid grid-cols-2 gap-4">
            {projectMembers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <SimpleSelect
                  id="assignedTo"
                  value={formData.assignedTo || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assignedTo: e.target.value ? (e.target.value as Id<'userProfiles'>) : undefined,
                    }))
                  }
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...projectMembers.map((member) => ({
                      value: member.userId,
                      label: member.name || member.email || 'Unknown',
                    })),
                  ]}
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="color">Timeline Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                disabled={isSubmitting}
                className="h-10"
              />
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <Label>Deliverables</Label>
            <div className="space-y-2">
              {formData.deliverables && formData.deliverables.length > 0 && (
                <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                  {formData.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-center gap-2 p-2">
                      <Checkbox
                        checked={deliverable.completed}
                        onChange={() => toggleDeliverable(index)}
                        disabled={isSubmitting}
                        aria-label={`Mark ${deliverable.title} as ${deliverable.completed ? 'incomplete' : 'complete'}`}
                      />
                      <span
                        className={`flex-1 text-sm ${
                          deliverable.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {deliverable.title}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        disabled={isSubmitting}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  placeholder="Add a deliverable..."
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addDeliverable()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDeliverable}
                  disabled={isSubmitting || !newDeliverable.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Milestone' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
