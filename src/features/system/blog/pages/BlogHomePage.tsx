// src/features/system/blog/pages/BlogHomePage.tsx
/**
 * Blog Home Page
 *
 * Public-facing blog homepage with featured posts, categories, and recent posts
 */

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, TrendingUp, Clock, Folder } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { usePosts } from '../hooks/usePosts';
import { useCategories } from '../hooks/useCategories';
import { PostList } from '../shared/components/PostList';
import { PostCard } from '../shared/components/PostCard';
import { useTranslation } from '@/features/system/i18n';

export function BlogHomePage() {
  const { t } = useTranslation('blog');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured posts
  const {
    posts: featuredPosts,
    loading: featuredLoading,
  } = usePosts({
    filters: { featured: true, status: 'published' },
    limit: 3,
  });

  // Fetch recent posts
  const {
    posts: recentPosts,
    loading: recentLoading,
    hasMore,
    loadMore,
  } = usePosts({
    filters: { status: 'published' },
    limit: 12,
  });

  // Fetch categories
  const { categories, loading: categoriesLoading } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('home.title')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-gray-900"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">{t('home.featuredPosts')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post._id} post={post} variant="featured" />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-gray-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">{t('home.recentPosts')}</h2>
            </div>

            <PostList
              posts={recentPosts}
              loading={recentLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              emptyMessage={t('emptyStates.noPosts')}
              variant="grid"
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center mb-4">
                <Folder className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{t('home.categories')}</h3>
              </div>

              {categoriesLoading ? (
                <div className="text-sm text-gray-500">{t('home.loadingCategories')}</div>
              ) : categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.slice(0, 10).map((category) => (
                    <Link
                      key={category._id}
                      to="/{-$locale}/blog/category/$slug"
                      params={{ slug: category.slug }}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <Badge variant="secondary" size="sm">
                        {category.postCount || 0}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">{t('home.noCategoriesYet')}</div>
              )}
            </div>

            {/* Newsletter signup (placeholder) */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('home.newsletter.title')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('home.newsletter.description')}
              </p>
              <form className="space-y-3">
                <Input
                  type="email"
                  placeholder={t('home.newsletter.emailPlaceholder')}
                  className="w-full"
                />
                <Button variant="primary" className="w-full" size="sm">
                  {t('home.newsletter.subscribe')}
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default BlogHomePage;
