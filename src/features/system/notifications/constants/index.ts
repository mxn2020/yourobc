// features/notifications/constants/index.ts
export const NOTIFICATION_CONSTANTS = {
  TYPES: {
    ASSIGNMENT: 'assignment',
    COMPLETION: 'completion',
    INVITE: 'invite',
    ACHIEVEMENT: 'achievement',
    REMINDER: 'reminder',
    MENTION: 'mention',
    REQUEST: 'request',
    INFO: 'info',
    SUCCESS: 'success',
    ERROR: 'error',
  },
  ENTITY_TYPES: {
    USER: 'user',
    REMINDER: 'reminder',
  },
  DEFAULT_EMOJIS: {
    assignment: '📋',
    completion: '✅',
    invite: '📧',
    achievement: '🏆',
    reminder: '⏰',
    mention: '💬',
    request: '🔔',
    info: 'ℹ️',
    success: '✅',
    error: '❌',
  },
} as const

export const NOTIFICATION_TYPE_COLORS = {
  assignment: 'bg-blue-50 border-blue-200',
  completion: 'bg-green-50 border-green-200',
  invite: 'bg-purple-50 border-purple-200',
  achievement: 'bg-yellow-50 border-yellow-200',
  reminder: 'bg-orange-50 border-orange-200',
  mention: 'bg-teal-50 border-teal-200',
  request: 'bg-indigo-50 border-indigo-200',
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
} as const

