// src/features/boilerplate/blog/hooks/usePost.ts
/**
 * Hook for fetching a single blog post
 */

import { useState, useEffect, useCallback } from 'react';
import { useBlog } from './useBlog';
import type { BlogPost } from '../types';
import type { Id } from '../../../../../convex/_generated/dataModel';

interface UsePostOptions {
  postId?: Id<'blogPosts'> | string;
  slug?: string;
  incrementViews?: boolean;
}

export interface UsePostReturn {
  post: BlogPost | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePost(options: UsePostOptions): UsePostReturn {
  const { postId, slug, incrementViews = false } = options;
  const { service, isReady } = useBlog();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPost = useCallback(async () => {
    if (!service || !isReady) return;
    if (!postId && !slug) return;

    try {
      setLoading(true);
      setError(null);

      let loadedPost: BlogPost | null = null;

      if (slug) {
        loadedPost = await service.getPostBySlug(slug);
      } else if (postId) {
        loadedPost = await service.getPost(postId);
      }

      setPost(loadedPost);

      // TODO: Increment views if specified (needs API endpoint)
      // if (loadedPost && incrementViews) {
      //   await service.incrementPostViews(loadedPost._id);
      // }
    } catch (err) {
      console.error('Failed to load post:', err);
      setError(err instanceof Error ? err : new Error('Failed to load post'));
    } finally {
      setLoading(false);
    }
  }, [service, isReady, postId, slug, incrementViews]);

  useEffect(() => {
    if (isReady && (postId || slug)) {
      loadPost();
    }
  }, [isReady, postId, slug, loadPost]);

  const refresh = useCallback(async () => {
    await loadPost();
  }, [loadPost]);

  return {
    post,
    loading,
    error,
    refresh,
  };
}

export default usePost;
