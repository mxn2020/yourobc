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
    'wikiEntries',
    'documents',
    'userProfiles',
    'oauthApps',
    'scheduledEvents',
  ];

  return tablesWithPublicIds.includes(table);
}

/**
 * Extract public ID from a document if it exists
 */
export function getPublicId<T extends PublicIdTable>(
  doc: { publicId?: string }
): string | undefined {
  return doc.publicId;
}
