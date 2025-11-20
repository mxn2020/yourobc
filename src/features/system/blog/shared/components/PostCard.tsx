// src/features/boilerplate/blog/shared/components/PostCard.tsx
/**
 * PostCard Component
 *
 * Displays a blog post in card format with various variants
 */

import { Link } from '@tanstack/react-router';
import { twMerge } from 'tailwind-merge';
import { Calendar, Clock, User, MessageCircle, Heart, Eye } from 'lucide-react';
import { Badge } from '../../../../../components/ui/Badge';
import type { PostCardProps } from '../../types';
import { formatDate, getRelativeTime, formatReadTime, calculateReadTime } from '../../utils/content';
import { useTranslation } from '@/features/boilerplate/i18n';

export function PostCard({
  post,
  variant = 'default',
  showAuthor = true,
  showCategory = true,
  showExcerpt = true,
  showReadTime = true,
  showDate = true,
  onClick,
}: PostCardProps) {
  const { t } = useTranslation('blog');

  const handleClick = () => {
    if (onClick) {
      onClick(post);
    }
  };

  const cardClasses = twMerge(
    'group cursor-pointer transition-all duration-200',
    variant === 'default' && 'bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200',
    variant === 'featured' && 'bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg hover:shadow-xl border border-blue-100',
    variant === 'compact' && 'bg-white rounded border border-gray-200 hover:border-gray-300',
    variant === 'list' && 'bg-white border-b border-gray-200 hover:bg-gray-50'
  );

  const readTime = calculateReadTime(post.content);

  return (
    <article className={cardClasses} onClick={handleClick}>
      <Link to="/{-$locale}/blog/$slug" params={{ slug: post.slug }} className="block">
        {/* Featured image */}
        {post.featuredImage && variant !== 'compact' && variant !== 'list' && (
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.featuredImage.url}
              alt={post.featuredImage.alt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {post.featured && (
              <div className="absolute top-3 right-3">
                <Badge variant="primary" size="sm">
                  {t('postCard.featured')}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={twMerge(
          'p-4',
          variant === 'featured' && 'p-6',
          variant === 'list' && 'py-4'
        )}>
          {/* Category badge */}
          {showCategory && post.categoryId && (
            <div className="mb-2">
              <Badge variant="secondary" size="sm">
                {post.categoryId}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h3 className={twMerge(
            'font-semibold text-gray-900 group-hover:text-blue-600 transition-colors',
            variant === 'default' && 'text-xl mb-2',
            variant === 'featured' && 'text-2xl mb-3',
            variant === 'compact' && 'text-base mb-1',
            variant === 'list' && 'text-lg mb-2'
          )}>
            {post.title}
          </h3>

          {/* Excerpt */}
          {showExcerpt && post.excerpt && variant !== 'compact' && (
            <p className={twMerge(
              'text-gray-600 mb-3',
              variant === 'featured' ? 'text-base' : 'text-sm'
            )}>
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && variant === 'featured' && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta info */}
          <div className={twMerge(
            'flex items-center gap-4 text-sm text-gray-500',
            variant === 'compact' && 'text-xs'
          )}>
            {/* Author */}
            {showAuthor && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.authorId}</span>
              </div>
            )}

            {/* Date */}
            {showDate && post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{getRelativeTime(post.publishedAt)}</span>
              </div>
            )}

            {/* Read time */}
            {showReadTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatReadTime(readTime)}</span>
              </div>
            )}
          </div>

          {/* Engagement stats */}
          {variant === 'default' && (post.viewCount || post.likeCount || post.commentCount) && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
              {post.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount}</span>
                </div>
              )}
              {post.likeCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likeCount}</span>
                </div>
              )}
              {post.commentCount !== undefined && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

export default PostCard;
