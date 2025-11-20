// src/features/system/blog/pages/PostDetailPage.tsx
/**
 * Post Detail Page
 *
 * Public-facing individual post page with content, author info, and comments
 */

import { useParams, Link } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Calendar,
  Clock,
  User,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Twitter,
  Facebook,
  Linkedin,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Avatar, AvatarFallback } from '../../../../components/ui/Avatar';
import { Separator } from '../../../../components/ui/Separator';
import { usePost } from '../hooks/usePost';
import { formatDate, formatReadTime, calculateReadTime } from '../utils/content';
import { generateShareUrls } from '../utils/seo';
import { BLOG_CONFIG } from '../config';
import { CommentsSection } from '../../supporting/comments/components/CommentsSection';
import { useTranslation } from '@/features/system/i18n';

export function PostDetailPage() {
  const { t } = useTranslation('blog');
  const { slug } = useParams({ from: '/{-$locale}/blog/$slug' });
  const { post, loading, error } = usePost({ slug, incrementViews: true });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t('post.loadingPost')}</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('post.notFound')}</h1>
          <p className="text-gray-600 mb-4">{t('post.notFoundDesc')}</p>
          <Link to="/{-$locale}/blog">
            <Button variant="primary">{t('post.backToBlog')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content);
  const shareUrls = generateShareUrls(post, BLOG_CONFIG.routes.blog);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/{-$locale}/blog">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              {t('post.backToBlog')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Post content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero section */}
        <header className="mb-8">
          {/* Category badge */}
          {post.categoryName && (
            <div className="mb-4">
              <Badge variant="primary">{post.categoryName}</Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.authorName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatReadTime(readTime)}</span>
            </div>
          </div>

          {/* Engagement stats */}
          {(post.viewCount || post.likeCount || post.commentCount) && (
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              {post.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount} {t('post.engagement.views')}</span>
                </div>
              )}
              {post.likeCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likeCount} {t('post.engagement.likes')}</span>
                </div>
              )}
              {post.commentCount !== undefined && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentCount} {t('post.engagement.comments')}</span>
                </div>
              )}
            </div>
          )}

          <Separator className="mt-6" />
        </header>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featuredImage.url}
              alt={post.featuredImage.alt || post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('post.tags')}</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to="/{-$locale}/blog/tag/$slug"
                  params={{ slug: tag }}
                >
                  <Badge variant="secondary">#{tag}</Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Separator className="mb-8" />

        {/* Share buttons */}
        <div className="mb-12">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('post.shareThisPost')}</h3>
          <div className="flex items-center gap-3">
            <a
              href={shareUrls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href={shareUrls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href={shareUrls.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Author info */}
        <div className="bg-gray-100 rounded-lg p-6 mb-12">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback>{post.authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {post.authorName}
              </h3>
              <p className="text-sm text-gray-600">
                {t('post.authorBio')}
              </p>
            </div>
          </div>
        </div>

        {/* Comments section */}
        {BLOG_CONFIG.allowComments && post.allowComments !== false && (
          <div>
            <CommentsSection
              entityType="blog_posts"
              entityId={post._id}
              title={t('post.engagement.comments')}
            />
          </div>
        )}
      </article>
    </div>
  );
}

export default PostDetailPage;
