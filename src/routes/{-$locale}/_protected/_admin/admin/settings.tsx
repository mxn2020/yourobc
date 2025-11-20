// src/routes/_protected/_admin/admin/settings.tsx

import { createFileRoute } from '@tanstack/react-router'
import { AdminSettingsPage } from '@/features/system/admin'
import { appSettingsService } from '@/features/system/admin/services/AppSettingsService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/settings')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined';
    const { adminUser } = context;

    console.log(`🔄 Admin Settings Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`);
    console.time('Route Loader: Admin Settings');

    if (!adminUser || !adminUser.id) {
      throw new Error('Admin user not found in context');
    }

    // ✅ Use service-provided query options for consistency
    const appSettingsQueryOptions = appSettingsService.getAppSettingsQueryOptions();
    const aiSettingsQueryOptions = appSettingsService.getAISettingsQueryOptions();

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          // Fetch settings in parallel
          const [appSettings, aiSettings] = await Promise.all([
            convexClient.query(api.lib.system.app_settings.queries.getAppSettings, {}),
            convexClient.query(api.lib.system.app_settings.queries.getAISettings, {}),
          ]);

          // Cache data using service query options
          context.queryClient.setQueryData(appSettingsQueryOptions.queryKey, appSettings);
          context.queryClient.setQueryData(aiSettingsQueryOptions.queryKey, aiSettings);

          console.log('✅ SSR: Settings data cached:', {
            appSettings: appSettingsQueryOptions.queryKey,
            aiSettings: aiSettingsQueryOptions.queryKey,
            settingsCount: appSettings?.settings.length || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Admin Settings');
      } catch (error) {
        console.warn('SSR prefetch failed for admin settings:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Admin Settings');
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedAppSettings = context.queryClient.getQueryData(appSettingsQueryOptions.queryKey);
      const cachedAISettings = context.queryClient.getQueryData(aiSettingsQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        appSettingsCached: !!cachedAppSettings,
        aiSettingsCached: !!cachedAISettings,
      });

      await Promise.all([
        context.queryClient.ensureQueryData(appSettingsQueryOptions),
        context.queryClient.ensureQueryData(aiSettingsQueryOptions),
      ]);

      console.timeEnd('Route Loader: Client ensureQueryData');
      console.timeEnd('Route Loader: Admin Settings');
    }

    return {};
  },
  component: AdminSettingsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="Loading settings..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'admin.settings', {
        title: 'Admin Settings - Geenius',
        description: 'Configure application settings and preferences',
        keywords: 'admin, settings, configuration, preferences',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Settings</h2>
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

function AdminSettingsIndexPage() {
  return <AdminSettingsPage />;
}