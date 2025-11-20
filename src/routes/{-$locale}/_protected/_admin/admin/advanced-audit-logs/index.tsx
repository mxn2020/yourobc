// src/routes/_protected/audit-logs/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AuditLogsPage } from '@/features/boilerplate/audit-logs';
import { auditLogsAdminService } from '@/features/boilerplate/audit-logs/services/AuditLogsAdminService';
import { api } from '@/convex/_generated/api';
import { Loading } from '@/components/ui';
import { defaultLocale } from '@/features/boilerplate/i18n';
import { createI18nSeo } from '@/utils/seo';

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/advanced-audit-logs/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined';
    const { adminUser } = context;

    console.log(`🔄 Advanced Audit Logs Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`);
    console.time('Route Loader: Advanced Audit Logs');

    if (!adminUser || !adminUser.id) {
      throw new Error('Admin user not found in context');
    }

    // ✅ Use service-provided query options for consistency
    const auditLogsOptions = { limit: 50, offset: 0 };
    const auditLogsQueryOptions = auditLogsAdminService.getAdminAuditLogsQueryOptions(auditLogsOptions);
    const statsQueryOptions = auditLogsAdminService.getAdminAuditLogStatsQueryOptions('week');

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          // Fetch audit logs and stats in parallel
          const convexOptions = {
            limit: auditLogsOptions.limit,
            offset: auditLogsOptions.offset,
          };

          const [auditLogs, stats] = await Promise.all([
            convexClient.query(api.lib.boilerplate.audit_logs.admin_queries.adminGetAuditLogs, {
              options: convexOptions,
            }),
            convexClient.query(api.lib.boilerplate.audit_logs.admin_queries.adminGetAuditLogStats, {
              timeWindow: 'week',
            }),
          ]);

          // Cache data using service query options
          context.queryClient.setQueryData(auditLogsQueryOptions.queryKey, auditLogs);
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats);

          console.log('✅ SSR: Advanced audit logs data cached:', {
            auditLogs: auditLogsQueryOptions.queryKey,
            stats: statsQueryOptions.queryKey,
            logsCount: auditLogs?.logs?.length || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Advanced Audit Logs');
      } catch (error) {
        console.warn('SSR prefetch failed for advanced audit logs:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Advanced Audit Logs');
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedAuditLogs = context.queryClient.getQueryData(auditLogsQueryOptions.queryKey);
      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        auditLogsCached: !!cachedAuditLogs,
        statsCached: !!cachedStats,
      });

      await Promise.all([
        context.queryClient.ensureQueryData(auditLogsQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions),
      ]);

      console.timeEnd('Route Loader: Client ensureQueryData');
      console.timeEnd('Route Loader: Advanced Audit Logs');
    }

    return {};
  },
  component: AuditLogsComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading audit logs..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'admin.advanced-audit-logs', {
        title: 'Audit Logs - Geenius',
        description: 'View and manage system audit logs and activity tracking',
        keywords: 'admin, audit logs, activity, tracking, security, advanced',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Audit Logs</h2>
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

function AuditLogsComponent() {
  return <AuditLogsPage />;
}
