// convex/lib/system/blog/authors/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterBlogAuthorsByAccess, requireViewBlogAuthorAccess } from './permissions';
import type { BlogAuthorListResponse } from './types';

export const getBlogAuthors = query({
  args: { limit: v.optional(v.number()), offset: v.optional(v.number()) },
  handler: async (ctx, args): Promise<BlogAuthorListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = args;
    let authors = await ctx.db.query('blogAuthors').withIndex('by_owner', (q) => q.eq('ownerId', user._id)).filter((q) => q.eq(q.field('deletedAt'), undefined)).collect();
    authors = await filterBlogAuthorsByAccess(ctx, authors, user);
    const total = authors.length;
    const items = authors.slice(offset, offset + limit);
    return { items, total, hasMore: total > offset + limit };
  },
});

export const getBlogAuthor = query({
  args: { authorId: v.id('blogAuthors') },
  handler: async (ctx, { authorId }) => {
    const user = await requireCurrentUser(ctx);
    const author = await ctx.db.get(authorId);
    if (!author || author.deletedAt) throw new Error('Blog author not found');
    await requireViewBlogAuthorAccess(ctx, author, user);
    return author;
  },
});

export const getBlogAuthorBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await requireCurrentUser(ctx);
    const author = await ctx.db.query('blogAuthors').withIndex('by_slug', (q) => q.eq('slug', slug)).filter((q) => q.eq(q.field('deletedAt'), undefined)).first();
    if (!author) throw new Error('Blog author not found');
    await requireViewBlogAuthorAccess(ctx, author, user);
    return author;
  },
});
