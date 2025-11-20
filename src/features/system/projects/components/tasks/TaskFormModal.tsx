// features/boilerplate/projects/components/tasks/TaskFormModal.tsx

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
import { AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/features/boilerplate/notifications'
import type { Id } from '@/convex/_generated/dataModel'

export interface TaskFormData {
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  projectId?: Id<'projects'>
  assignedTo?: Id<'userProfiles'>
  startDate?: number
  dueDate?: number
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  blockedBy?: Id<'projectTasks'>[]
  dependsOn?: Id<'projectTasks'>[]
}

export interface Task extends TaskFormData {
  _id: Id<'projectTasks'>
  _creationTime?: number
  publicId: string
  completedAt?: number
  order: number
  createdAt: number
  createdBy?: Id<'userProfiles'>
  updatedAt?: number
  deletedAt?: number
  isOverdue?: boolean
  projectTitle?: string
  metadata?: Record<string, string | number | boolean | (string | number | boolean)[] | {} | null> | {
    customFields?: Record<string, any>
    attachments?: string[]
    externalLinks?: string[]
  }
}

interface ProjectMember {
  userId: Id<'userProfiles'>
  name?: string
  email?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
}

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<TaskFormData>) => Promise<void> | void
  mode: 'create' | 'edit'
  initialData?: Partial<Task>
  projectId: Id<'projects'>
  projectMembers?: ProjectMember[]
  existingTasks?: Array<{ _id: Id<'projectTasks'>; title: string }>
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'critical', label: 'Critical' },
]

export const TaskFormModal: FC<TaskFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  mode,
  initialData,
  projectId,
  projectMembers = [],
  existingTasks = [],
}) => {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<TaskFormData>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    projectId,
    assignedTo: undefined,
    startDate: undefined,
    dueDate: undefined,
    estimatedHours: undefined,
    actualHours: undefined,
    tags: [],
    blockedBy: [],
    dependsOn: [],
  })

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'todo',
        priority: initialData?.priority || 'medium',
        projectId: initialData?.projectId || projectId,
        assignedTo: initialData?.assignedTo,
        startDate: initialData?.startDate,
        dueDate: initialData?.dueDate,
        estimatedHours: initialData?.estimatedHours,
        actualHours: initialData?.actualHours,
        tags: initialData?.tags || [],
        blockedBy: initialData?.blockedBy || [],
        dependsOn: initialData?.dependsOn || [],
      })
      setError(null)
    }
  }, [open, initialData, projectId])

  const validateForm = (): boolean => {
    if (!formData.title?.trim()) {
      setError('Task title is required')
      return false
    }

    if (formData.title.length > 200) {
      setError('Task title must be less than 200 characters')
      return false
    }

    if (formData.description && formData.description.length > 5000) {
      setError('Description must be less than 5000 characters')
      return false
    }

    if (formData.startDate && formData.dueDate && formData.dueDate < formData.startDate) {
      setError('Due date must be after start date')
      return false
    }

    if (formData.estimatedHours !== undefined && formData.estimatedHours < 0) {
      setError('Estimated hours cannot be negative')
      return false
    }

    if (formData.actualHours !== undefined && formData.actualHours < 0) {
      setError('Actual hours cannot be negative')
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
      toast.success(mode === 'create' ? 'Task created successfully' : 'Task updated successfully')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save task')
      toast.error(err.message || 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new task to your project'
              : 'Update task details and assignments'}
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
              Task Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add task description..."
              rows={4}
              maxLength={5000}
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
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <SimpleSelect
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                options={PRIORITY_OPTIONS}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Assigned To */}
          {projectMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <SimpleSelect
                id="assignedTo"
                value={formData.assignedTo || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, assignedTo: e.target.value ? e.target.value as Id<'userProfiles'> : undefined }))
                }
                options={[
                  { value: '', label: 'Unassigned' },
                  ...projectMembers.map(member => ({
                    value: member.userId,
                    label: member.name || member.email || 'Unknown',
                  })),
                ]}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                mode="single"
                id="startDate"
                value={formData.startDate ? new Date(formData.startDate) : undefined}
                onChange={(date: Date | undefined) =>
                  setFormData(prev => ({ ...prev, startDate: date?.getTime() }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <DatePicker
                mode="single"
                id="dueDate"
                value={formData.dueDate ? new Date(formData.dueDate) : undefined}
                onChange={(date: Date | undefined) =>
                  setFormData(prev => ({ ...prev, dueDate: date?.getTime() }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Time Tracking Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours ?? ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualHours">Actual Hours</Label>
              <Input
                id="actualHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.actualHours ?? ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    actualHours: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Enter tags separated by commas..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas (e.g., "frontend, urgent, bug-fix")
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
