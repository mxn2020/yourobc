// convex/lib/marketing/email_signatures/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { requireViewAccess } from './permissions';

export const getEmailSignatures = query({
  args: {
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = options;

    let signatures = await ctx.db
      .query('marketingEmailSignatures')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const total = signatures.length;
    const paginated = signatures.slice(offset, offset + limit);

    return { signatures: paginated, total, hasMore: total > offset + limit };
  },
});

export const getEmailSignature = query({
  args: { signatureId: v.id('marketingEmailSignatures') },
  handler: async (ctx, { signatureId }) => {
    const user = await requireCurrentUser(ctx);
    const signature = await ctx.db.get(signatureId);
    if (!signature || signature.deletedAt) throw new Error('Signature not found');
    await requireViewAccess(ctx, signature, user);
    return signature;
  },
});
