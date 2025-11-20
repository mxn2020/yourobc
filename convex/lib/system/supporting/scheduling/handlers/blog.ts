// convex/lib/boilerplate/supporting/scheduling/handlers/blog.ts

import type { SchedulingHandler } from './types';
import type { MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';

/**
 * Blog Post Handler
 * Handles auto-publishing of scheduled blog posts
 *
 * This handler auto-processes - when a post's scheduled time arrives,
 * the cron job will automatically publish it.
 */
export const blogPostHandler: SchedulingHandler = {
  type: 'blog_post',
  name: 'Blog Post',
  description: 'Auto-publish blog posts at scheduled time',
  autoProcess: true, // Blog posts ARE auto-processed by cron
  icon: 'FileText',
  color: '#10B981', // Green

  /**
   * Process a scheduled blog post by publishing it
   */
  async processScheduled(
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ): Promise<boolean> {
    try {
      // Get the scheduled event
      const event = await ctx.db.get(scheduledEventId);
      if (!event) {
        console.error('Scheduled event not found:', scheduledEventId);
        return false;
      }

      // Validate that this is for a blog post
      if (event.handlerType !== 'blog_post') {
        console.error('Event is not a blog post:', scheduledEventId);
        return false;
      }

      // Get the blog post from entityId
      const postId = event.entityId as Id<'blogPosts'>;
      const post = await ctx.db.get(postId);

      if (!post) {
        console.error('Blog post not found:', postId);
        return false;
      }

      // Check if already published
      if (post.status === 'published') {
        console.log('Post already published:', postId);
        return true;
      }

      // Publish the blog post
      await ctx.db.patch(postId, {
        status: 'published',
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update scheduled event
      await ctx.db.patch(scheduledEventId, {
        status: 'completed',
        processingStatus: 'completed',
        processedAt: Date.now(),
      });

      console.log('Successfully published blog post:', postId);
      return true;
    } catch (error) {
      console.error('Error processing blog post:', error);
      return false;
    }
  },

  /**
   * Validate blog post handler data
   */
  validateHandlerData(data: Record<string, unknown>): boolean {
    // Blog handler expects the entityId to be a valid blog post ID
    // Additional validation can be added here if needed
    return true;
  },

  /**
   * Called before processing
   * Verify the blog post is still in scheduled status
   */
  async beforeProcess(
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ): Promise<void> {
    const event = await ctx.db.get(scheduledEventId);
    if (!event) return;

    const postId = event.entityId as Id<'blogPosts'>;
    const post = await ctx.db.get(postId);

    if (!post) {
      throw new Error(`Blog post not found: ${postId}`);
    }

    if (post.status !== 'scheduled') {
      throw new Error(
        `Blog post is not in scheduled status. Current status: ${post.status}`
      );
    }

    // Verify scheduled time has arrived
    if (post.scheduledFor && post.scheduledFor > Date.now()) {
      throw new Error('Blog post scheduled time has not arrived yet');
    }
  },

  /**
   * Called after successful processing
   * Can be used to send notifications, update analytics, etc.
   */
  async afterProcess(
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ): Promise<void> {
    const event = await ctx.db.get(scheduledEventId);
    if (!event) return;

    const postId = event.entityId as Id<'blogPosts'>;

    // TODO: Send notification to post author that post was published
    // TODO: Update analytics/statistics
    // TODO: Trigger any webhooks or integrations

    console.log('Blog post published successfully:', postId);
  },

  /**
   * Called when processing fails
   */
  async onProcessError(
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>,
    error: Error
  ): Promise<void> {
    const event = await ctx.db.get(scheduledEventId);
    if (!event) return;

    const postId = event.entityId as Id<'blogPosts'>;

    // TODO: Send notification to post author that auto-publish failed
    // TODO: Log error to monitoring system

    console.error('Failed to publish blog post:', postId, error.message);
  },

  /**
   * Get additional data for the scheduled event
   * Returns blog post info for UI display
   */
  async getEventData(ctx, scheduledEventId) {
    const event = await ctx.db.get(scheduledEventId);
    if (!event) return {};

    const postId = event.entityId as Id<'blogPosts'>;
    const post = await ctx.db.get(postId);

    if (!post) return {};

    return {
      postTitle: post.title,
      postSlug: post.slug,
      postStatus: post.status,
      postAuthor: post.authorId,
    };
  },
};
