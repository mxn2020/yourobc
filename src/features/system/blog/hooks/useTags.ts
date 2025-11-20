// src/features/system/blog/hooks/useTags.ts
/**
 * Hook for fetching and managing blog tags
 */

import { useState, useEffect, useCallback } from 'react';
import { useBlog } from './useBlog';
import type { BlogTag } from '../types';
import type { Id } from '../../../../../convex/_generated/dataModel';

export interface UseTagsReturn {
  tags: BlogTag[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getTagById: (id: string) => BlogTag | undefined;
  getTagBySlug: (slug: string) => BlogTag | undefined;
}

export function useTags(): UseTagsReturn {
  const { service, isReady } = useBlog();

  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTags = useCallback(async () => {
    if (!service || !isReady) return;

    try {
      setLoading(true);
      setError(null);

      const result = await service.getTags();
      setTags(result);
    } catch (err) {
      console.error('Failed to load tags:', err);
      setError(err instanceof Error ? err : new Error('Failed to load tags'));
    } finally {
      setLoading(false);
    }
  }, [service, isReady]);

  useEffect(() => {
    if (isReady) {
      loadTags();
    }
  }, [isReady, loadTags]);

  const refresh = useCallback(async () => {
    await loadTags();
  }, [loadTags]);

  const getTagById = useCallback(
    (id: string) => {
      return tags.find((tag) => tag._id === id as Id<'blogTags'>);
    },
    [tags]
  );

  const getTagBySlug = useCallback(
    (slug: string) => {
      return tags.find((tag) => tag.slug === slug);
    },
    [tags]
  );

  return {
    tags,
    loading,
    error,
    refresh,
    getTagById,
    getTagBySlug,
  };
}

export default useTags;
