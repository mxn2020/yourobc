// src/features/boilerplate/blog/hooks/useBlog.tsx
/**
 * Blog Context and Hook
 *
 * Provides blog service access throughout the application
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useConvex } from 'convex/react';
import { BlogService } from '../services/BlogService';
import type { BlogProvider, BlogProviderConfig, BlogProviderType } from '../types';

interface BlogContextValue {
  service: BlogService | null;
  provider: BlogProvider | null;
  config: BlogProviderConfig | null;
  isReady: boolean;
  error: Error | null;
  switchProvider: (providerType: BlogProviderType) => void;
  availableProviders: BlogProviderType[];
}

const BlogContext = createContext<BlogContextValue | undefined>(undefined);

interface BlogProviderProps {
  children: ReactNode;
}

export function BlogProvider({ children }: BlogProviderProps) {
  const convex = useConvex();
  const [service, setService] = useState<BlogService | null>(null);
  const [provider, setProvider] = useState<BlogProvider | null>(null);
  const [config, setConfig] = useState<BlogProviderConfig | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [availableProviders, setAvailableProviders] = useState<BlogProviderType[]>([]);

  useEffect(() => {
    const initializeBlog = async () => {
      try {
        const blogService = BlogService.getInstance(convex as any); // ConvexReactClient is compatible with ConvexClient
        await blogService.initialize();

        const activeProvider = blogService.getActiveProvider();
        const providerConfig = activeProvider.config;
        const providers = blogService.getAvailableProviders();

        setService(blogService);
        setProvider(activeProvider);
        setConfig(providerConfig);
        setAvailableProviders(providers);
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize blog service:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsReady(false);
      }
    };

    initializeBlog();
  }, [convex]);

  const switchProvider = (providerType: BlogProviderType) => {
    if (!service) {
      console.error('Blog service is not initialized');
      return;
    }

    try {
      service.switchProvider(providerType);
      const activeProvider = service.getActiveProvider();
      const providerConfig = activeProvider.config;

      setProvider(activeProvider);
      setConfig(providerConfig);
    } catch (err) {
      console.error('Failed to switch provider:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  const value: BlogContextValue = {
    service,
    provider,
    config,
    isReady,
    error,
    switchProvider,
    availableProviders,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

/**
 * Hook to access blog service
 */
export function useBlog(): BlogContextValue {
  const context = useContext(BlogContext);

  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }

  return context;
}

/**
 * Hook to ensure blog is ready before rendering
 */
export function useBlogReady(): {
  isReady: boolean;
  error: Error | null;
  service: BlogService;
  provider: BlogProvider;
} {
  const { service, provider, isReady, error } = useBlog();

  if (!isReady || !service || !provider) {
    return {
      isReady: false,
      error: error || new Error('Blog service not ready'),
      service: service!,
      provider: provider!,
    };
  }

  return {
    isReady: true,
    error: null,
    service,
    provider,
  };
}

export default useBlog;
