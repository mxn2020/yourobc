// src/routes/{-$locale}/_protected/_admin/admin/blog/posts/$postId.edit.tsx
/**
 * Edit Blog Post Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/convex/_generated/api';
import { PostEditorPage } from '@/features/system/blog/pages/PostEditorPage';
import { usePost } from '@/features/system/blog/hooks/usePost';
import { getPostQueryOptions, getCategoriesQueryOptions } from '@/features/system/blog/services/blogQueryOptions';
import { Loading } from '@/components/ui';
import { defaultLocale } from '@/features/system/i18n';
import { createI18nSeo } from '@/utils/seo';
import type { Id } from '@/convex/_generated/dataModel';

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/blog/posts/$postId/edit')({
  loader: async ({ context, params }) => {
    const isServer = typeof window === 'undefined';
    const postId = params.postId as Id<'blogPosts'>;

    console.log(`🔄 Edit Blog Post Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Post: ${postId}`);
    console.time('Route Loader: Edit Blog Post');

    // ✅ Use query options for consistent cache keys
    const postQueryOptions = getPostQueryOptions(postId);
    const categoriesQueryOptions = getCategoriesQueryOptions();

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          // Fetch post and categories in parallel
          const [post, categories] = await Promise.all([
            convexClient.query(api.lib.system.blog.queries.getPost, { postId }),
            convexClient.query(api.lib.system.blog.queries.getCategories, {}),
          ]);

          // Cache data using query options
          context.queryClient.setQueryData(postQueryOptions.queryKey, post);
          context.queryClient.setQueryData(categoriesQueryOptions.queryKey, categories);

          console.log('✅ SSR: Post data cached for editor:', {
            post: postQueryOptions.queryKey,
            categories: categoriesQueryOptions.queryKey,
            postTitle: post?.title,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Edit Blog Post');
      } catch (error) {
        console.warn('SSR prefetch failed for edit post:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Edit Blog Post');
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedPost = context.queryClient.getQueryData(postQueryOptions.queryKey);
      const cachedCategories = context.queryClient.getQueryData(categoriesQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        postCached: !!cachedPost,
        categoriesCached: !!cachedCategories,
        postTitle: cachedPost ? (cachedPost as any).title : 'Not cached',
      });

      await Promise.all([
        context.queryClient.ensureQueryData(postQueryOptions),
        context.queryClient.ensureQueryData(categoriesQueryOptions),
      ]);

      console.timeEnd('Route Loader: Client ensureQueryData');
      console.timeEnd('Route Loader: Edit Blog Post');
    }

    return {};
  },
  component: EditPostComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading editor..." showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'blog.posts.edit', {
        title: 'Edit Post - Blog Admin',
        description: `Edit blog post ${params.postId}`,
        keywords: 'blog, edit post, admin',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Post</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
});

function EditPostComponent() {
  const { postId } = Route.useParams();
  const { post, loading } = usePost({ postId: postId as Id<'blogPosts'> });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Post not found</div>
      </div>
    );
  }

  return (
    <PostEditorPage
      postId={postId as Id<'blogPosts'>}
      initialData={{
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        slug: post.slug,
        categoryId: post.categoryId,
        tags: post.tags,
        featuredImage: post.featuredImage,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        seoKeywords: post.seoKeywords,
        focusKeyword: post.focusKeyword,
        allowComments: post.allowComments,
        visibility: post.visibility,
      }}
    />
  );
}