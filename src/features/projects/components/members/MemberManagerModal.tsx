// features/projects/components/members/MemberManagerModal.tsx

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
import { SimpleSelect } from '@/components/ui/Select'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Checkbox } from '@/components/ui/Checkbox'
import { AlertCircle, Loader2, Search } from 'lucide-react'
import { useToast } from '@/features/system/notifications'
import type { Id } from '@/convex/_generated/dataModel'

export interface AddMemberData {
  projectId: Id<'projects'>
  userId: Id<'userProfiles'>
  role?: 'owner' | 'admin' | 'member' | 'viewer'
  department?: string
  jobTitle?: string
  settings?: {
    emailNotifications?: boolean
    canManageTasks?: boolean
    canInviteMembers?: boolean
    canEditProject?: boolean
  }
}

interface UserProfile {
  _id: Id<'userProfiles'>
  name?: string
  email?: string
  avatar?: string
}

interface MemberManagerModalProps {
  open: boolean
  onClose: () => void
  onAddMember: (data: AddMemberData) => Promise<void> | void
  projectId: Id<'projects'>
  existingMemberIds?: Id<'userProfiles'>[]
  availableUsers?: UserProfile[]
  mode: 'add'
}

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer', description: 'Can view project' },
  { value: 'member', label: 'Member', description: 'Can edit and contribute' },
  { value: 'admin', label: 'Admin', description: 'Can manage team and settings' },
]

export const MemberManagerModal: FC<MemberManagerModalProps> = ({
  open,
  onClose,
  onAddMember,
  projectId,
  existingMemberIds = [],
  availableUsers = [],
  mode,
}) => {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState<Partial<AddMemberData>>({
    projectId,
    userId: undefined,
    role: 'member',
    department: '',
    jobTitle: '',
    settings: {
      emailNotifications: true,
      canManageTasks: false,
      canInviteMembers: false,
      canEditProject: false,
    },
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        projectId,
        userId: undefined,
        role: 'member',
        department: '',
        jobTitle: '',
        settings: {
          emailNotifications: true,
          canManageTasks: false,
          canInviteMembers: false,
          canEditProject: false,
        },
      })
      setSearchQuery('')
      setError(null)
    }
  }, [open, projectId])

  // Update settings based on role
  useEffect(() => {
    if (formData.role === 'admin') {
      setFormData((prev) => ({
        ...prev,
        settings: {
          emailNotifications: true,
          canManageTasks: true,
          canInviteMembers: true,
          canEditProject: true,
        },
      }))
    } else if (formData.role === 'viewer') {
      setFormData((prev) => ({
        ...prev,
        settings: {
          emailNotifications: true,
          canManageTasks: false,
          canInviteMembers: false,
          canEditProject: false,
        },
      }))
    }
  }, [formData.role])

  const validateForm = (): boolean => {
    if (!formData.userId) {
      setError('Please select a user to add')
      return false
    }

    if (existingMemberIds.includes(formData.userId)) {
      setError('This user is already a member of the project')
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
      await onAddMember(formData as AddMemberData)
      toast.success('Member added successfully')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add member')
      toast.error(err.message || 'Failed to add member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  // Filter available users
  const filteredUsers = availableUsers.filter((user) => {
    if (existingMemberIds.includes(user._id)) return false

    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  })

  const selectedUser = availableUsers.find((u) => u._id === formData.userId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your project team with specific role and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* User Search & Selection */}
          <div className="space-y-2">
            <Label htmlFor="userSearch" className="required">
              Select User
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="userSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>

            {/* User Selection Dropdown */}
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? 'No users found matching your search'
                    : 'No available users to add'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, userId: user._id }))}
                      className={`w-full p-3 text-left hover:bg-accent transition-colors ${
                        formData.userId === user._id ? 'bg-accent' : ''
                      }`}
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || 'User'}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {(user.name || user.email || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.name || 'Unnamed User'}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                        {formData.userId === user._id && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <svg
                              className="h-3 w-3 text-primary-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="required">
              Role
            </Label>
            <SimpleSelect
              id="role"
              value={formData.role || 'member'}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value as any }))
              }
              options={ROLE_OPTIONS}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {ROLE_OPTIONS.find((r) => r.value === formData.role)?.description}
            </p>
          </div>

          {/* Department & Job Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, department: e.target.value }))
                }
                placeholder="e.g., Engineering"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
                }
                placeholder="e.g., Developer"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Permissions (only for member role) */}
          {formData.role === 'member' && (
            <div className="space-y-3 border rounded-md p-4">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageTasks"
                    checked={formData.settings?.canManageTasks}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, canManageTasks: checked as boolean },
                      }))
                    }
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="canManageTasks"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Can manage tasks
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canInviteMembers"
                    checked={formData.settings?.canInviteMembers}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, canInviteMembers: checked as boolean },
                      }))
                    }
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="canInviteMembers"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Can invite members
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canEditProject"
                    checked={formData.settings?.canEditProject}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, canEditProject: checked as boolean },
                      }))
                    }
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="canEditProject"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Can edit project
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailNotifications"
                    checked={formData.settings?.emailNotifications}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          emailNotifications: checked as boolean,
                        },
                      }))
                    }
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="emailNotifications"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email notifications
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.userId}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
