// src/routes/{-$locale}/_protected/_admin/admin/permission-requests.tsx

import { createFileRoute } from '@tanstack/react-router'
import { PermissionRequestsPage } from '@/features/system/admin/pages/PermissionRequestsPage'
import { permissionRequestsService } from '@/features/system/admin/services/PermissionRequestsService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute(
  '/{-$locale}/_protected/_admin/admin/permission-requests'
)({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined';
    const { adminUser } = context;

    console.log(`🔄 Permission Requests Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`);
    console.time('Route Loader: Permission Requests');

    if (!adminUser || !adminUser.id) {
      throw new Error('Admin user not found in context');
    }

    // ✅ Use service-provided query options for consistency
    const statsQueryOptions = permissionRequestsService.getPermissionRequestsStatsQueryOptions();
    const requestsQueryOptions = permissionRequestsService.getAllPermissionRequestsQueryOptions('pending');

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          // Fetch stats and pending requests in parallel
          const [stats, requests] = await Promise.all([
            convexClient.query(api.lib.system.permission_requests.queries.getPermissionRequestsStats, {}),
            convexClient.query(api.lib.system.permission_requests.queries.getAllPermissionRequests, {
              status: 'pending',
            }),
          ]);

          // Cache data using service query options
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats);
          context.queryClient.setQueryData(requestsQueryOptions.queryKey, requests);

          console.log('✅ SSR: Permission requests data cached:', {
            stats: statsQueryOptions.queryKey,
            requests: requestsQueryOptions.queryKey,
            pendingCount: stats?.pending || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Permission Requests');
      } catch (error) {
        console.warn('SSR prefetch failed for permission requests:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Permission Requests');
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey);
      const cachedRequests = context.queryClient.getQueryData(requestsQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        statsCached: !!cachedStats,
        requestsCached: !!cachedRequests,
      });

      await Promise.all([
        context.queryClient.ensureQueryData(statsQueryOptions),
        context.queryClient.ensureQueryData(requestsQueryOptions),
      ]);

      console.timeEnd('Route Loader: Client ensureQueryData');
      console.timeEnd('Route Loader: Permission Requests');
    }

    return {};
  },
  component: PermissionRequestsPage,
  pendingComponent: () => (
    <Loading size="lg" message="Loading permission requests..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'admin.permission-requests', {
        title: 'Permission Requests - Admin',
        description: 'Review and manage user permission requests',
        keywords: 'admin, permissions, requests, access control',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Permission Requests</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
})
