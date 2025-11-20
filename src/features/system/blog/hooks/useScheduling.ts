// src/features/system/blog/hooks/useScheduling.ts
/**
 * Hook for scheduling blog posts
 *
 * Provides functionality to schedule posts for automatic publishing
 */

import { useState, useCallback } from 'react';
import { useBlog } from './useBlog';
import { useAuth } from '../../auth/hooks/useAuth';
import type { Id } from '../../../../../convex/_generated/dataModel';

export interface UseSchedulingReturn {
  schedulePost: (postId: Id<'blogPosts'>, scheduledFor: Date) => Promise<void>;
  cancelSchedule: (postId: Id<'blogPosts'>) => Promise<void>;
  reschedule: (postId: Id<'blogPosts'>, newScheduledFor: Date) => Promise<void>;
  isScheduling: boolean;
  error: Error | null;
}

export function useScheduling(): UseSchedulingReturn {
  const { service, isReady } = useBlog();
  const { profile } = useAuth();
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const schedulePost = useCallback(
    async (postId: Id<'blogPosts'>, scheduledFor: Date) => {
      if (!isReady || !service) {
        throw new Error('Blog service is not ready');
      }

      try {
        setIsScheduling(true);
        setError(null);

        // Validate that scheduled time is in the future
        const now = new Date();
        if (scheduledFor <= now) {
          throw new Error('Scheduled time must be in the future');
        }

        // Get user ID from auth
        if (!profile?._id) {
          throw new Error('User must be authenticated to schedule posts');
        }

        // Use the schedulePost method from the service
        await service.schedulePost(postId, scheduledFor.getTime(), profile._id);

        console.log(
          `Post ${postId} scheduled for ${scheduledFor.toLocaleString()}`
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to schedule post');
        setError(error);
        throw error;
      } finally {
        setIsScheduling(false);
      }
    },
    [service, isReady, profile]
  );

  const cancelSchedule = useCallback(
    async (postId: Id<'blogPosts'>) => {
      if (!isReady || !service) {
        throw new Error('Blog service is not ready');
      }

      try {
        setIsScheduling(true);
        setError(null);

        // Get user ID from auth
        if (!profile?._id) {
          throw new Error('User must be authenticated to cancel schedule');
        }

        // Change post back to draft status
        await service.unpublishPost(postId, profile._id);

        console.log(`Cancelled schedule for post ${postId}`);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to cancel schedule');
        setError(error);
        throw error;
      } finally {
        setIsScheduling(false);
      }
    },
    [service, isReady, profile]
  );

  const reschedule = useCallback(
    async (postId: Id<'blogPosts'>, newScheduledFor: Date) => {
      if (!isReady || !service) {
        throw new Error('Blog service is not ready');
      }

      try {
        setIsScheduling(true);
        setError(null);

        // Validate that new scheduled time is in the future
        const now = new Date();
        if (newScheduledFor <= now) {
          throw new Error('New scheduled time must be in the future');
        }

        // Get user ID from auth
        if (!profile?._id) {
          throw new Error('User must be authenticated to reschedule posts');
        }

        // Reschedule by updating the scheduledFor field
        await service.schedulePost(postId, newScheduledFor.getTime(), profile._id);

        console.log(
          `Post ${postId} rescheduled for ${newScheduledFor.toLocaleString()}`
        );
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to reschedule post');
        setError(error);
        throw error;
      } finally {
        setIsScheduling(false);
      }
    },
    [service, isReady, profile]
  );

  return {
    schedulePost,
    cancelSchedule,
    reschedule,
    isScheduling,
    error,
  };
}

export default useScheduling;
