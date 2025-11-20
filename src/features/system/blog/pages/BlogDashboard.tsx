// src/features/boilerplate/blog/pages/BlogDashboard.tsx
/**
 * Blog Dashboard Page
 *
 * Admin dashboard for managing blog posts, categories, and analytics
 */

import { Link } from '@tanstack/react-router';
import { Plus, FileText, Folder, Tag, Users, TrendingUp, Eye, MessageCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { usePosts } from '../hooks/usePosts';
import { useBlog } from '../hooks/useBlog';
import { PostList } from '../shared/components/PostList';
import { useTranslation } from '@/features/boilerplate/i18n';

export function BlogDashboard() {
  const { t } = useTranslation('blog');
  const { isReady, error, config } = useBlog();
  const { posts, loading } = usePosts({
    filters: { status: 'draft' },
    limit: 5,
  });

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('dashboard.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{t('dashboard.error')} {error.message}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('dashboard.provider')} <span className="font-medium">{config?.type}</span>
            </p>
          </div>
          <Link to="/{-$locale}/admin/blog/posts/new">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              {t('dashboard.newPost')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.stats.totalPosts')}</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.stats.totalViews')}</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.stats.comments')}</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.stats.engagement')}</p>
              <p className="text-2xl font-semibold text-gray-900">0%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/{-$locale}/admin/blog/posts">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t('dashboard.quickActions.managePosts')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('dashboard.quickActions.managePostsDesc')}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/{-$locale}/admin/blog/categories">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <Folder className="w-6 h-6 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t('dashboard.quickActions.categories')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('dashboard.quickActions.categoriesDesc')}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/{-$locale}/admin/blog/tags">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <Tag className="w-6 h-6 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t('dashboard.quickActions.tags')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('dashboard.quickActions.tagsDesc')}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent drafts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.recentDrafts')}</h2>
          <Link to="/{-$locale}/admin/blog/posts">
            <Button variant="ghost" size="sm">
              {t('dashboard.viewAll')}
            </Button>
          </Link>
        </div>

        <PostList
          posts={posts}
          loading={loading}
          hasMore={false}
          emptyMessage={t('emptyStates.noDrafts')}
          variant="list"
        />
      </Card>
    </div>
  );
}

export default BlogDashboard;
