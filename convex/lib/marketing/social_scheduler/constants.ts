// convex/lib/marketing/social_scheduler/constants.ts

export const SOCIAL_SCHEDULER_CONSTANTS = {
  STATUS: {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    PUBLISHED: 'published',
    FAILED: 'failed',
    ARCHIVED: 'archived',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
  },
  PLATFORMS: {
    TWITTER: 'twitter',
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    LINKEDIN: 'linkedin',
    TIKTOK: 'tiktok',
  },
  PERMISSIONS: {
    VIEW: 'social_scheduler.view',
    CREATE: 'social_scheduler.create',
    EDIT: 'social_scheduler.edit',
    DELETE: 'social_scheduler.delete',
    PUBLISH: 'social_scheduler.publish',
  },
  LIMITS: {
    MAX_CONTENT_LENGTH: 5000,
    MAX_MEDIA_URLS: 10,
    MAX_HASHTAGS: 30,
    MAX_MENTIONS: 20,
    MAX_TAGS: 20,
  },
} as const;

export type PostStatus = typeof SOCIAL_SCHEDULER_CONSTANTS.STATUS[keyof typeof SOCIAL_SCHEDULER_CONSTANTS.STATUS];
export type SocialPlatform = typeof SOCIAL_SCHEDULER_CONSTANTS.PLATFORMS[keyof typeof SOCIAL_SCHEDULER_CONSTANTS.PLATFORMS];
