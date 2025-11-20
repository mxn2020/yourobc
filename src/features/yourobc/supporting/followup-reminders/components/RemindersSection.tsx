// src/features/yourobc/supporting/followup-reminders/components/RemindersSection.tsx

import React from 'react'
import { Bell } from 'lucide-react'
import { ReminderList } from './ReminderList'
import { useRemindersByEntity } from '../hooks/useReminders'
import { isFollowupRemindersEnabled } from '../../config'
import type { Reminder, ReminderId, ReminderFormData } from '../types'

export interface RemindersSectionProps {
  entityType: Reminder['entityType']
  entityId: string
  title?: string
  status?: Reminder['status']
  limit?: number
  className?: string
}

/**
 * Reusable reminders section component that can be used in any YourOBC entity detail page
 *
 * @example
 * // In CustomerDetailsPage
 * <RemindersSection
 *   entityType="yourobc_customer"
 *   entityId={customerId}
 *   title="Customer Reminders"
 *   status="pending"
 * />
 *
 * @example
 * // In ShipmentDetailsPage
 * <RemindersSection
 *   entityType="yourobc_shipment"
 *   entityId={shipmentId}
 *   title="Shipment Reminders"
 * />
 */
export function RemindersSection({
  entityType,
  entityId,
  title = 'Reminders',
  status,
  limit,
  className = '',
}: RemindersSectionProps) {
  // Check if reminders feature is enabled
  if (!isFollowupRemindersEnabled()) {
    return null
  }
  const {
    reminders,
    isLoading,
    error,
    createReminder,
    updateReminder,
    completeReminder,
    snoozeReminder,
    deleteReminder,
    canCreateReminders,
  } = useRemindersByEntity(entityType, entityId, {
    status,
    limit,
  })

  // Wrapper functions to match the expected interface
  const handleCreateReminder = async (data: ReminderFormData): Promise<void> => {
    await createReminder(data)
  }

  const handleEditReminder = async (
    reminderId: ReminderId,
    data: Partial<ReminderFormData>
  ): Promise<void> => {
    await updateReminder(reminderId, data)
  }

  const handleCompleteReminder = async (
    reminderId: ReminderId,
    notes?: string
  ): Promise<void> => {
    await completeReminder(reminderId, notes)
  }

  const handleSnoozeReminder = async (
    reminderId: ReminderId,
    snoozeUntil: number
  ): Promise<void> => {
    await snoozeReminder(reminderId, snoozeUntil)
  }

  const handleDeleteReminder = async (reminderId: ReminderId): Promise<void> => {
    await deleteReminder(reminderId)
  }

  // Count pending vs completed
  const pendingCount = reminders.filter((r) => r.status === 'pending').length
  const completedCount = reminders.filter((r) => r.status === 'completed').length

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {!isLoading && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                  {pendingCount} pending
                </span>
                {completedCount > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {completedCount} completed
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="p-6">
        <ReminderList
          reminders={reminders}
          isLoading={isLoading}
          error={error}
          onCreateReminder={handleCreateReminder}
          onEditReminder={handleEditReminder}
          onCompleteReminder={handleCompleteReminder}
          onSnoozeReminder={handleSnoozeReminder}
          onDeleteReminder={handleDeleteReminder}
          canCreateReminders={canCreateReminders}
          showForm={canCreateReminders}
        />
      </div>
    </div>
  )
}
