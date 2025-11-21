// convex/lib/system/blog/media/constants.ts
export const BLOG_MEDIA_CONSTANTS = {
  PERMISSIONS: { VIEW: 'blog_media:view', CREATE: 'blog_media:create', EDIT: 'blog_media:edit', DELETE: 'blog_media:delete', UPLOAD: 'blog_media:upload' },
  STATUS: { ACTIVE: 'active', INACTIVE: 'inactive', ARCHIVED: 'archived' },
  LIMITS: { MAX_TITLE_LENGTH: 200, MAX_ALT_LENGTH: 200, MAX_CAPTION_LENGTH: 500, MAX_FILE_SIZE: 10485760, MAX_TAGS: 10 },
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf'],
  DEFAULTS: { STATUS: 'active' as const },
} as const;
