// src/routes/_protected/audit-logs/$logId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AuditLogDetailPage } from '@/features/boilerplate/audit-logs/pages/AuditLogDetailPage';
import { Loading } from '@/components/ui';
import { defaultLocale } from '@/features/boilerplate/i18n';
import { createI18nSeo } from '@/utils/seo';

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/advanced-audit-logs/$logId')({
  loader: async ({ context, params }) => {
    const { adminUser } = context;
    const { logId } = params;

    console.log(`🔄 Audit Log Detail Loader STARTED - Log: ${logId}`);

    if (!adminUser || !adminUser.id) {
      throw new Error('Admin user not found in context');
    }

    // Note: AuditLogDetailPage handles its own data fetching
    // This loader ensures admin access and validates route params
    if (!logId) {
      throw new Error('Log ID is required');
    }

    return {};
  },
  component: AuditLogDetailComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading audit log details..." showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'admin.audit-log-detail', {
        title: `Audit Log Details - ${params.logId} - Geenius`,
        description: `View details for audit log ${params.logId}`,
        keywords: 'admin, audit log, details, tracking',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Audit Log</h2>
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

function AuditLogDetailComponent() {
  const { logId } = Route.useParams();
  return <AuditLogDetailPage logId={logId} />;
}
