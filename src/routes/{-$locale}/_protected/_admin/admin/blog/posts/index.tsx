// routes/{-$locale}/_protected/_admin/admin/blog/posts/index.tsx

/**
 * Admin Blog Posts List Route
 */

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { api } from '@/convex/_generated/api'
import { usePosts } from '@/features/boilerplate/blog/hooks/usePosts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { Plus, Edit, Eye } from 'lucide-react'
import { formatDate } from '@/features/boilerplate/blog/utils/content'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

type PostsSearchParams = {
  status?: 'draft' | 'published' | 'scheduled'
}

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/blog/posts/')({
  validateSearch: (search: Record<string, unknown>): PostsSearchParams => {
    return {
      status: search.status === 'draft' || search.status === 'published' || search.status === 'scheduled'
        ? search.status
        : undefined,
    }
  },
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Blog Posts`)
    console.time('Route Loader: Blog Posts')

    const { adminUser } = context
    if (!adminUser || !adminUser.id) {
      console.warn('Admin user not found in context')
      return {}
    }

    // ✅ Define query options for consistency
    const postsQueryKey = ['blog', 'getPosts', { limit: 50 }]

    // SERVER: SSR prefetching
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const posts = await convexClient.query(api.lib.boilerplate.blog.queries.getPosts, { limit: 50 })
          context.queryClient.setQueryData(postsQueryKey, posts)
          console.log('✅ SSR: Posts data cached')
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Blog Posts')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Blog Posts')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')
      const cached = context.queryClient.getQueryData(postsQueryKey)
      console.log('📦 CLIENT: Cache check:', { cached: !!cached })
      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Blog Posts')
    }
  },
  component: PostsListComponent,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="admin" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Posts</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Try Again
      </button>
    </div>
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale
    return {
      meta: await createI18nSeo(locale, 'admin.blog.posts', {
        title: 'Posts - Blog Admin',
        description: 'Manage all blog posts',
        keywords: 'admin, blog, posts, management',
      }),
    }
  },
})

function PostsListComponent() {
  const navigate = useNavigate()
  const { locale } = Route.useParams()
  const currentLocale = locale || defaultLocale
  const { status } = Route.useSearch()
  const { posts, loading } = usePosts({
    limit: 100,
    ...(status && { status })
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate({
            to: '/{-$locale}/admin/blog/posts/new',
            params: { locale: currentLocale === defaultLocale ? undefined : currentLocale }
          })}
        >
          New Post
        </Button>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                    <Badge variant={post.status === 'published' ? 'success' : post.status === 'draft' ? 'secondary' : 'info'}>
                      {post.status}
                    </Badge>
                  </div>
                  {post.excerpt && <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {post.authorName}</span>
                    {post.publishedAt && <span>Published: {formatDate(post.publishedAt)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link to="/{-$locale}/blog/$slug" params={{ slug: post.slug, locale: currentLocale === defaultLocale ? undefined : currentLocale }}>
                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>View</Button>
                  </Link>
                  <Link to="/{-$locale}/admin/blog/posts/$postId/edit" params={{ postId: post._id, locale: currentLocale === defaultLocale ? undefined : currentLocale }}>
                    <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>Edit</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No posts yet</p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate({
              to: '/{-$locale}/admin/blog/posts/new',
              params: { locale: currentLocale === defaultLocale ? undefined : currentLocale }
            })}
          >
            Create Your First Post
          </Button>
        </Card>
      )}
    </div>
  )
}
