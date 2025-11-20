// src/features/system/blog/hooks/usePosts.ts
/**
 * Hook for fetching and managing blog posts
 */

import { useState, useEffect, useCallback } from 'react';
import { useBlog } from './useBlog';
import type { BlogPost, PostFilters } from '../types';

interface UsePostsOptions {
  filters?: PostFilters;
  limit?: number;
  initialLoad?: boolean;
}

export interface UsePostsReturn {
  posts: BlogPost[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function usePosts(options: UsePostsOptions = {}): UsePostsReturn {
  const { filters, limit = 12, initialLoad = true } = options;
  const { service, isReady } = useBlog();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(initialLoad);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadPosts = useCallback(
    async (reset = false) => {
      if (!service || !isReady) return;

      try {
        setLoading(true);
        setError(null);

        const currentOffset = reset ? 0 : offset;
        const result = await service.getPosts(filters);

        if (reset) {
          setPosts(result);
          setOffset(limit);
        } else {
          setPosts((prev) => [...prev, ...result]);
          setOffset((prev) => prev + limit);
        }

        setHasMore(result.length === limit);
      } catch (err) {
        console.error('Failed to load posts:', err);
        setError(err instanceof Error ? err : new Error('Failed to load posts'));
      } finally {
        setLoading(false);
      }
    },
    [service, isReady, filters, limit, offset]
  );

  // Initial load
  useEffect(() => {
    if (initialLoad && isReady) {
      loadPosts(true);
    }
  }, [isReady, initialLoad]);

  // Refresh when filters change
  useEffect(() => {
    if (isReady) {
      loadPosts(true);
    }
  }, [filters?.status, filters?.authorId, filters?.categoryId, filters?.tag, filters?.featured]);

  const refresh = useCallback(async () => {
    await loadPosts(true);
  }, [loadPosts]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await loadPosts(false);
    }
  }, [loading, hasMore, loadPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}

export default usePosts;
