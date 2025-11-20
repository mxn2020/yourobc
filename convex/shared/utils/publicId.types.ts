// convex/lib/shared/utils/publicId.types.ts

import type { Doc } from '@/generated/dataModel';
import type { PublicIdTable } from '../config/publicId';

/**
 * Type guard to check if a table supports public IDs
 */
export function hasPublicId<T extends string>(
  table: T
): table is Extract<T, PublicIdTable> {
  const tablesWithPublicIds: readonly string[] = [
    'projects',
    'blogPosts',
    'blogAuthors',
    'blogCategories',
    'blogTags',
    'wikiEntries',
    'documents',
    'userProfiles',
    'webhooks',
    'oauthApps',
    'externalIntegrations',
    'apiKeys',
    'scheduledEvents',
    'subscriptions',
    'clientProducts',
    'clientPayments',
    'connectedAccounts',
    'projectTasks',
    'projectMilestones',
    'tetris',
    'dino',
    'aiLogs',
    'aiTests',
  ];

  return tablesWithPublicIds.includes(table);
}

/**
 * Extract public ID from a document if it exists
 */
export function getPublicId<T extends PublicIdTable>(
  doc: Doc<T> & { publicId?: string }
): string | undefined {
  return doc.publicId;
}
