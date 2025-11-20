// src/features/yourobc/supporting/followup-reminders/pages/RemindersPage.tsx

import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/features/system/auth'
import { remindersService } from '../services/RemindersService'
import { ReminderList } from '../components/ReminderList'
import { Card, Badge, Button, Loading } from '@/components/ui'
import { Filter, Bell, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useToast } from '@/features/system/notifications'
import type { Reminder, ReminderId, ReminderFormData } from '../types'
import { getSafeEntityTypeLabel, REMINDER_TYPE_LABELS, REMINDER_STATUS_LABELS, REMINDER_PRIORITY_LABELS } from '../types'
import { useReminderMutations } from '../hooks/useReminders'
import type { Id } from '@/convex/_generated/dataModel'
import { parseConvexError } from '@/utils/errorHandling'

const ENTITY_TYPES = [
  { value: 'yourobc_customer', label: 'Customers', icon: '👥' },
  { value: 'yourobc_quote', label: 'Quotes', icon: '📄' },
  { value: 'yourobc_shipment', label: 'Shipments', icon: '📦' },
  { value: 'yourobc_invoice', label: 'Invoices', icon: '💰' },
  { value: 'yourobc_partner', label: 'Partners', icon: '🤝' },
  { value: 'yourobc_courier', label: 'Couriers', icon: '🚚' },
  { value: 'yourobc_employee', label: 'Employees', icon: '👤' },
] as const

interface RemindersPageProps {
  status?: 'pending' | 'completed' | 'cancelled' | 'snoozed'
  priority?: 'urgent' | 'critical' | 'standard'
  type?: 'follow_up' | 'deadline' | 'review' | 'payment' | 'vacation_approval' | 'commission_review' | 'performance_review'
  entityType?: Partial<Reminder['entityType']>
  entityId?: string
  overdue?: boolean
}

export function RemindersPage({
  status: initialStatus,
  priority: initialPriority,
  type: initialType,
  entityType: initialEntityType,
  entityId: initialEntityId,
  overdue: initialOverdue,
}: RemindersPageProps = {}) {
  const { auth, user } = useAuth()
  const toast = useToast()
  const [selectedEntityType, setSelectedEntityType] = useState<Reminder['entityType'] | null>(initialEntityType || null)
  const [selectedStatus, setSelectedStatus] = useState<Reminder['status'] | null>(initialStatus || null)
  const [selectedPriority, setSelectedPriority] = useState<Reminder['priority'] | null>(initialPriority || null)
  const [selectedType, setSelectedType] = useState<Reminder['type'] | null>(initialType || null)
  const [showFilters, setShowFilters] = useState(false)

  // Update filters when URL search params change
  useEffect(() => {
    if (initialEntityType !== undefined) setSelectedEntityType(initialEntityType || null)
    if (initialStatus !== undefined) setSelectedStatus(initialStatus || null)
    if (initialPriority !== undefined) setSelectedPriority(initialPriority || null)
    if (initialType !== undefined) setSelectedType(initialType || null)
  }, [initialEntityType, initialStatus, initialPriority, initialType])

  // Determine if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Fetch reminders with filters
  const {
    data: allReminders,
    isPending: isLoading,
    error,
  } = remindersService.useReminders(auth?.id!, {
    entityType: selectedEntityType || undefined,
    entityId: initialEntityId ? (initialEntityId as Id<any>) : undefined,
    status: selectedStatus || undefined,
    priority: selectedPriority || undefined,
    type: selectedType || undefined,
    limit: 100,
  })

  // Get standalone mutation hooks
  const {
    createReminder,
    updateReminder,
    completeReminder,
    snoozeReminder,
    deleteReminder,
    isCreating,
    isUpdating,
    isCompleting,
    isDeleting,
  } = useReminderMutations()

  // Filter locally for overdue if needed
  const displayReminders = useMemo(() => {
    if (!allReminders) return []

    let filtered = allReminders

    // Apply overdue filter if set
    if (initialOverdue !== undefined) {
      if (initialOverdue) {
        filtered = filtered.filter((r) => remindersService.isOverdue(r))
      } else {
        filtered = filtered.filter((r) => !remindersService.isOverdue(r))
      }
    }

    return filtered
  }, [allReminders, initialOverdue])

  // Enrich reminders for display
  const enrichedReminders = useMemo(() => {
    return displayReminders.map((reminder) => ({
      ...reminder,
      displayAssignedTo: 'User',
      displayAssignedBy: 'User',
      timeAgo: remindersService.getTimeAgo(reminder.createdAt),
      formattedDueDate: remindersService.formatDueDate(reminder.dueDate),
      canEdit: true,
      canDelete: isAdmin,
      canComplete: reminder.status === 'pending',
      isOverdue: remindersService.isOverdue(reminder),
      isDue: remindersService.isDue(reminder),
      timeUntilDue: remindersService.getTimeUntilDue(reminder.dueDate),
      priorityColor: '',
      statusColor: '',
      typeIcon: '',
    }))
  }, [displayReminders, isAdmin])

  // Mutation handlers with toast notifications
  const handleCreateReminder = async (data: ReminderFormData) => {
    toast.error('Cannot create top-level reminders from this page. Please go to the specific entity page.')
    throw new Error('No entity context')
  }

  const handleUpdateReminder = async (reminderId: ReminderId, updates: Partial<ReminderFormData>) => {
    try {
      await updateReminder(reminderId, updates)
      toast.success('Reminder updated successfully')
    } catch (error: any) {
      console.error('[UpdateReminder] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[UpdateReminder] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[UpdateReminder] permission denied')
      }
      throw error
    }
  }

  const handleCompleteReminder = async (reminderId: ReminderId, notes?: string) => {
    try {
      await completeReminder(reminderId, notes)
      toast.success('Reminder completed successfully')
    } catch (error: any) {
      console.error('[CompleteReminder] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[CompleteReminder] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[CompleteReminder] permission denied')
      }
      throw error
    }
  }

  const handleSnoozeReminder = async (reminderId: ReminderId, snoozeUntil: number) => {
    try {
      await snoozeReminder(reminderId, snoozeUntil)
      toast.success('Reminder snoozed successfully')
    } catch (error: any) {
      console.error('[SnoozeReminder] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[SnoozeReminder] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[SnoozeReminder] permission denied')
      }
      throw error
    }
  }

  const handleDeleteReminder = async (reminderId: ReminderId) => {
    try {
      await deleteReminder(reminderId)
      toast.success('Reminder deleted successfully')
    } catch (error: any) {
      console.error('[DeleteReminder] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[DeleteReminder] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[DeleteReminder] permission denied')
      }
      throw error
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = displayReminders.length
    const pending = displayReminders.filter((r) => r.status === 'pending').length
    const completed = displayReminders.filter((r) => r.status === 'completed').length
    const overdue = displayReminders.filter((r) =>
      remindersService.isOverdue(r)
    ).length
    const dueToday = displayReminders.filter((r) =>
      remindersService.isDue(r) && !remindersService.isOverdue(r)
    ).length

    const byPriority = displayReminders.reduce(
      (acc, r) => {
        acc[r.priority] = (acc[r.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return { total, pending, completed, overdue, dueToday, byPriority }
  }, [displayReminders])

  if (!auth?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Please log in to view reminders</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Follow-up Reminders
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track follow-up reminders across all YourOBC entities
            </p>
          </div>

          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reminders</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
            <div className="text-sm text-gray-600">Due Today</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Reminders</h3>

            <div className="space-y-4">
              {/* Entity Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedEntityType(null)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      !selectedEntityType
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Entities
                  </button>
                  {ENTITY_TYPES.map((entityType) => (
                    <button
                      key={entityType.value}
                      onClick={() =>
                        setSelectedEntityType(entityType.value as Reminder['entityType'])
                      }
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedEntityType === entityType.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {entityType.icon} {entityType.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      !selectedStatus
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Statuses
                  </button>
                  {Object.entries(REMINDER_STATUS_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setSelectedStatus(value as Reminder['status'])}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedStatus === value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedPriority(null)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      !selectedPriority
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Priorities
                  </button>
                  {Object.entries(REMINDER_PRIORITY_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setSelectedPriority(value as Reminder['priority'])}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedPriority === value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedType(null)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      !selectedType
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Types
                  </button>
                  {Object.entries(REMINDER_TYPE_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setSelectedType(value as Reminder['type'])}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedType === value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Active Filters Display */}
        {(selectedEntityType || selectedStatus || selectedPriority || selectedType || initialEntityId || initialOverdue) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedEntityType && (
              <Badge variant="primary">
                {getSafeEntityTypeLabel(selectedEntityType)}
                <button
                  onClick={() => setSelectedEntityType(null)}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedStatus && (
              <Badge variant="secondary">
                {REMINDER_STATUS_LABELS[selectedStatus]}
                <button onClick={() => setSelectedStatus(null)} className="ml-2 hover:text-gray-900">
                  ×
                </button>
              </Badge>
            )}
            {selectedPriority && (
              <Badge variant="secondary">
                {REMINDER_PRIORITY_LABELS[selectedPriority]}
                <button onClick={() => setSelectedPriority(null)} className="ml-2 hover:text-gray-900">
                  ×
                </button>
              </Badge>
            )}
            {selectedType && (
              <Badge variant="secondary">
                {REMINDER_TYPE_LABELS[selectedType]}
                <button onClick={() => setSelectedType(null)} className="ml-2 hover:text-gray-900">
                  ×
                </button>
              </Badge>
            )}
            {initialEntityId && (
              <Badge variant="secondary">
                Entity ID: {initialEntityId}
              </Badge>
            )}
            {initialOverdue && (
              <Badge variant="secondary">
                Overdue Only
              </Badge>
            )}
          </div>
        )}

        {/* Reminders Display */}
        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading reminders: {error.message}</p>
            </div>
          ) : (
            <ReminderList
              reminders={enrichedReminders}
              isLoading={false}
              error={null}
              onCreateReminder={handleCreateReminder}
              onEditReminder={handleUpdateReminder}
              onCompleteReminder={handleCompleteReminder}
              onSnoozeReminder={handleSnoozeReminder}
              onDeleteReminder={handleDeleteReminder}
              canCreateReminders={false}
              showForm={false}
              emptyMessage={
                selectedEntityType || selectedStatus || selectedPriority || selectedType || initialEntityId || initialOverdue
                  ? 'No reminders found matching your filters'
                  : 'No reminders yet. Create one from an entity detail page!'
              }
            />
          )}
        </Card>
      </div>
    </div>
  )
}
