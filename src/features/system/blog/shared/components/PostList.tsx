// src/features/boilerplate/blog/shared/components/PostList.tsx
/**
 * PostList Component
 *
 * Displays a list of blog posts with loading states and pagination
 */

import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { PostCard } from './PostCard';
import type { PostListProps } from '../../types';
import { useTranslation } from '@/features/boilerplate/i18n';

export function PostList({
  posts,
  loading = false,
  hasMore = false,
  onLoadMore,
  emptyMessage = 'No posts found',
  variant = 'grid',
}: PostListProps) {
  const { t } = useTranslation('blog');

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Posts grid/list */}
      <div
        className={twMerge(
          variant === 'grid' &&
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
          variant === 'list' && 'space-y-0 divide-y divide-gray-200'
        )}
      >
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            variant={variant === 'list' ? 'list' : 'default'}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && onLoadMore && (
        <div className="mt-8 text-center">
          <Button
            onClick={onLoadMore}
            variant="outline"
            loading={loading}
            disabled={loading}
          >
            {loading ? t('postList.loading') : t('postList.loadMore')}
          </Button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && posts.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}

export default PostList;
