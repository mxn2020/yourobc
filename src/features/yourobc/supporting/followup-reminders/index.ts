// src/features/yourobc/supporting/followup-reminders/index.ts

// ==================== Types ====================
export type {
  Reminder,
  ReminderId,
  CreateReminderData,
  ReminderFormData,
  ReminderWithDetails,
  ReminderListItem,
} from './types'

export {
  REMINDER_CONSTANTS,
  REMINDER_TYPE_LABELS,
  REMINDER_TYPE_COLORS,
  REMINDER_TYPE_ICONS,
  REMINDER_STATUS_LABELS,
  REMINDER_STATUS_COLORS,
  REMINDER_PRIORITY_LABELS,
  REMINDER_PRIORITY_COLORS,
} from './types'

// ==================== Services ====================
export { RemindersService, remindersService } from './services/RemindersService'

// ==================== Hooks ====================
export {
  useRemindersByEntity,
  useReminder,
  useReminderForm,
  useReminderMutations,
  useDueReminders,
  useOverdueReminders,
} from './hooks/useReminders'

// ==================== Components ====================
export { ReminderCard } from './components/ReminderCard'
export type { ReminderCardProps } from './components/ReminderCard'

export { ReminderForm } from './components/ReminderForm'
export type { ReminderFormProps } from './components/ReminderForm'

export { ReminderList } from './components/ReminderList'
export type { ReminderListProps } from './components/ReminderList'

export { RemindersSection } from './components/RemindersSection'
export type { RemindersSectionProps } from './components/RemindersSection'

// ==================== Pages ====================
export { RemindersPage } from './pages/RemindersPage'
