// src/features/system/blog/hooks/useCategories.ts
/**
 * Hook for fetching and managing blog categories
 */

import { useState, useEffect, useCallback } from 'react';
import { useBlog } from './useBlog';
import type { BlogCategory } from '../types';
import type { Id } from '../../../../../convex/_generated/dataModel';

export interface UseCategoriesReturn {
  categories: BlogCategory[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getCategoryById: (id: string) => BlogCategory | undefined;
  getCategoryBySlug: (slug: string) => BlogCategory | undefined;
}

export function useCategories(): UseCategoriesReturn {
  const { service, isReady } = useBlog();

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = useCallback(async () => {
    if (!service || !isReady) return;

    try {
      setLoading(true);
      setError(null);

      const result = await service.getCategories();
      setCategories(result);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
    } finally {
      setLoading(false);
    }
  }, [service, isReady]);

  useEffect(() => {
    if (isReady) {
      loadCategories();
    }
  }, [isReady, loadCategories]);

  const refresh = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  const getCategoryById = useCallback(
    (id: string) => {
      return categories.find((cat) => cat._id === id as Id<'blogCategories'>);
    },
    [categories]
  );

  const getCategoryBySlug = useCallback(
    (slug: string) => {
      return categories.find((cat) => cat.slug === slug);
    },
    [categories]
  );

  return {
    categories,
    loading,
    error,
    refresh,
    getCategoryById,
    getCategoryBySlug,
  };
}

export default useCategories;
