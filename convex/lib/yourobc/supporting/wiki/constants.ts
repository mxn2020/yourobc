// convex/lib/yourobc/supporting/wiki/constants.ts
// convex/yourobc/supporting/wiki/constants.ts
export const WIKI_CONSTANTS = {
  TYPE: {
    SOP: 'sop',
    AIRLINE_RULES: 'airline_rules',
    PARTNER_INFO: 'partner_info',
    PROCEDURE: 'procedure',
  },
  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_CONTENT_LENGTH: 50000,
    MAX_TAGS: 20,
  },
} as const;

