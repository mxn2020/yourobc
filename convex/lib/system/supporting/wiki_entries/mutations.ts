// convex/lib/system/supporting/wiki_entries/mutations.ts
// Write operations for system wiki entries

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { wikiEntriesValidators } from '@/schema/system/supporting/wikiEntries/validators';
import { SYSTEM_WIKI_ENTRIES_CONSTANTS } from './constants';
import { slugify, trimSystemWikiEntryData, validateSystemWikiEntryData } from './utils';
import type { CreateSystemWikiEntryData } from './types';

export const createWikiEntry = mutation({
  args: {
    data: v.object({
      title: v.string(),
      slug: v.optional(v.string()),
      content: v.string(),
      type: wikiEntriesValidators.entryType,
      status: v.optional(wikiEntriesValidators.entryStatus),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);
    const trimmed = trimSystemWikiEntryData({
      ...data,
      slug: data.slug ?? slugify(data.title),
    } as CreateSystemWikiEntryData);

    const errors = validateSystemWikiEntryData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'wikiEntries');

    return await ctx.db.insert('systemSupportingWikiEntries', {
      publicId,
      ownerId: user._id,
      name: trimmed.title,
      title: trimmed.title,
      slug: trimmed.slug || '',
      content: trimmed.content,
      type: trimmed.type,
      status: trimmed.status ?? SYSTEM_WIKI_ENTRIES_CONSTANTS.DEFAULTS.STATUS,
      tags: trimmed.tags,
      isPublic: false,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
  },
});
