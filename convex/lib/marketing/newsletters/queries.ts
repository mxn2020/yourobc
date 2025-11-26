// convex/lib/marketing/newsletters/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { requireViewAccessNewsletter, requireViewAccessCampaign } from './permissions';

export const getNewsletters = query({
  args: {
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = options;

    const newsletters = await ctx.db
      .query('marketingNewsletters')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const total = newsletters.length;
    const paginated = newsletters.slice(offset, offset + limit);

    return { newsletters: paginated, total, hasMore: total > offset + limit };
  },
});

export const getNewsletter = query({
  args: { newsletterId: v.id('marketingNewsletters') },
  handler: async (ctx, { newsletterId }) => {
    const user = await requireCurrentUser(ctx);
    const newsletter = await ctx.db.get(newsletterId);
    if (!newsletter || newsletter.deletedAt) throw new Error('Newsletter not found');
    await requireViewAccessNewsletter(ctx, newsletter, user);
    return newsletter;
  },
});

export const getCampaigns = query({
  args: {
    newsletterId: v.optional(v.id('marketingNewsletters')),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { newsletterId, options = {} }) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = options;

    let campaigns = await ctx.db
      .query('marketingNewsletterCampaigns')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    if (newsletterId) {
      campaigns = campaigns.filter((c) => c.newsletterId === newsletterId);
    }

    const total = campaigns.length;
    const paginated = campaigns.slice(offset, offset + limit);

    return { campaigns: paginated, total, hasMore: total > offset + limit };
  },
});

export const getCampaign = query({
  args: { campaignId: v.id('marketingNewsletterCampaigns') },
  handler: async (ctx, { campaignId }) => {
    const user = await requireCurrentUser(ctx);
    const campaign = await ctx.db.get(campaignId);
    if (!campaign || campaign.deletedAt) throw new Error('Campaign not found');
    await requireViewAccessCampaign(ctx, campaign, user);
    return campaign;
  },
});

export const getNewsletterStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const newsletters = await ctx.db
      .query('marketingNewsletters')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const campaigns = await ctx.db
      .query('marketingNewsletterCampaigns')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const totalSubscribers = newsletters.reduce((sum, n) => sum + (n.totalSubscribers || 0), 0);
    const activeSubscribers = newsletters.reduce((sum, n) => sum + (n.activeSubscribers || 0), 0);

    return {
      totalNewsletters: newsletters.length,
      totalSubscribers,
      activeSubscribers,
      totalCampaigns: campaigns.length,
      sentCampaigns: campaigns.filter((c) => c.status === 'sent').length,
    };
  },
});
