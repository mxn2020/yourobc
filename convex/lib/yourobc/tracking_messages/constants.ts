// convex/lib/yourobc/tracking_messages/constants.ts
export const TRACKING_MESSAGE_CONSTANTS = {
  SERVICE_TYPE: {
    OBC: 'OBC',
    NFO: 'NFO',
  },
  LANGUAGE: {
    EN: 'en',
    DE: 'de',
  },
  LIMITS: {
    MAX_TEMPLATE_LENGTH: 5000,
    MAX_SUBJECT_LENGTH: 200,
  },
  PERMISSIONS: {
    VIEW: 'tracking_messages.view',
    CREATE: 'tracking_messages.create',
    EDIT: 'tracking_messages.edit',
    DELETE: 'tracking_messages.delete',
  },
} as const;
