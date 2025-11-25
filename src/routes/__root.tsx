// src/routes/__root.tsx
/// <reference types="vite/client" />

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexProvider, ConvexReactClient, useMutation } from 'convex/react'
import { api } from '@/generated/api'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import { NotFound } from '@/components/NotFound'
import { AppLayout } from '@/components/App/AppLayout'
import { AutumnProvider } from 'autumn-js/react'
import { ErrorProvider, useErrorContext } from '@/contexts/ErrorContext'
import { PermissionDeniedModal } from '@/components/Permission/PermissionDeniedModal'
import { RequestAccessModal } from '@/components/Permission/RequestAccessModal'
import { useToast } from '@/features/system/notifications'
import { authService } from '@/features/system/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import appCss from '@/styles/app.css?url'
import { seo } from '@/utils/seo'
import {
  I18nProvider,
  I18N_CONFIG,
  getEnabledLocales,
  defaultLocale
} from '@/features/system/i18n'
import { getLocaleFromPath, stripLocaleFromPath } from '@/features/system/i18n/utils/path'
import type { Locale } from '@/features/system/i18n'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
  locale: Locale
  translations: Record<string, string>
  pathWithoutLocale: string
}>()({
  beforeLoad: async ({ location }) => {
    // Extract locale from path: /de/projects → 'de'
    let locale = getLocaleFromPath(location.pathname)
    
    // ✅ If no locale in path (e.g., /sitemap.xml), use default
    if (!locale) {
      locale = defaultLocale
    }

    // Get path without locale for hreflang links
    const pathWithoutLocale = stripLocaleFromPath(location.pathname)

    // Load ALL translations at root level (for React components, NOT metadata)
    // Metadata is loaded separately in each route's head function
    const translations = typeof window === 'undefined'
      ? await import('@/features/system/i18n/server.server').then(mod =>
          mod.loadTranslationsServer(locale, ['common', 'ui', 'auth', 'projects', 'blog', 'websites', 'admin'])
        )
      : (window as any).__TRANSLATIONS__ || {}

    return { locale, translations, pathWithoutLocale }
  },
  head: ({ matches }) => {
    const rootMatch = matches.find((match) => match.routeId === '__root__')
    const locale = rootMatch?.context?.locale || defaultLocale
    const pathWithoutLocale = rootMatch?.context?.pathWithoutLocale || '/'

    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        ...seo({
          title: 'Geenius | Smart Task Management & Kanban Boards',
          description: `Geenius is a smart task management application with kanban boards for organizing your work efficiently.`,
        }),
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
        { rel: 'icon', href: '/favicon.ico' },
        // ✅ Only add hreflang for localized routes (not API routes)
        ...(pathWithoutLocale !== '/sitemap.xml' && !pathWithoutLocale.startsWith('/api/')
          ? [
              // Alternate language links
              ...getEnabledLocales().map(loc => ({
                rel: 'alternate' as const,
                hrefLang: loc,
                href: `/${loc}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
              })),
              // Default language link
              {
                rel: 'alternate' as const,
                hrefLang: 'x-default',
                href: `/${I18N_CONFIG.defaultLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
              },
            ]
          : []),
      ],
    }
  },
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

/**
 * Context to track when Convex auth is ready
 * This prevents race conditions where queries fire before JWT is available
 */
interface ConvexAuthContextType {
  isConvexAuthReady: boolean
}

const ConvexAuthContext = React.createContext<ConvexAuthContextType>({
  isConvexAuthReady: false
})

export function useConvexAuth() {
  return React.useContext(ConvexAuthContext)
}

/**
 * Convex Provider with Better Auth JWT Integration
 *
 * IMPORTANT: This component ensures JWT is fetched and set in Convex context
 * BEFORE rendering children. This prevents AUTH_REQUIRED errors from queries
 * that fire before the JWT token is available.
 */
function ConvexWithAuth({
  children,
  convexClient
}: {
  children: React.ReactNode
  convexClient: ConvexReactClient
}) {
  const { data: session } = authService.useSession()
  const [isConvexAuthReady, setIsConvexAuthReady] = React.useState(false)
  const setupInProgressRef = React.useRef(false)
  const authSetupCompleteRef = React.useRef(false)

  // Set up auth token fetcher for Convex
  React.useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null

    const setupAuth = async () => {
      // If auth was already set up successfully, just mark as ready
      if (authSetupCompleteRef.current) {
        console.log('🔧 DEV: Auth already set up, marking as ready')
        if (isMounted) {
          setIsConvexAuthReady(true)
        }
        return
      }

      // Prevent duplicate setup calls during StrictMode double-mount
      if (setupInProgressRef.current) {
        console.log('🔧 DEV: Skipped duplicate setupAuth() call (already in progress)')
        // Wait for the in-progress setup to complete, then mark as ready
        intervalId = setInterval(() => {
          if (authSetupCompleteRef.current && isMounted) {
            console.log('🔧 DEV: Auth setup completed, marking as ready')
            setIsConvexAuthReady(true)
            if (intervalId) clearInterval(intervalId)
          }
        }, 50)

        // Cleanup interval after 5 seconds if setup never completes
        timeoutId = setTimeout(() => {
          if (intervalId) clearInterval(intervalId)
        }, 5000)
        return
      }

      setupInProgressRef.current = true

      // Only clear auth on first setup in production
      // In dev, skip clear to maintain connection through StrictMode remounts
      if (import.meta.env.PROD && !authSetupCompleteRef.current) {
        convexClient.clearAuth()
      }

      // Define the async token fetcher function
      const fetchToken = async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
        // Use Better Auth's jwtClient plugin to get the JWT token
        // This is the recommended approach - it calls /api/auth/token endpoint
        const tokenResponse = await authService.client.token()

        // Extract the JWT token from the response
        const jwtToken = tokenResponse?.data?.token

        if (!jwtToken) {
          return null
        }

        // Return the JWT token from Better Auth
        return jwtToken
      }

      // Set the auth token fetcher on Convex client
      const startTime = performance.now()
      convexClient.setAuth(fetchToken)

      // CRITICAL: Fetch the initial token to ensure it's in Convex context
      // before we mark auth as ready and render children
      try {
        await fetchToken({ forceRefreshToken: false })
        const duration = performance.now() - startTime
        console.log(`✅ Convex auth ready - JWT token fetched in ${duration.toFixed(2)}ms`)

        // Mark auth setup as complete (persists through StrictMode remounts)
        authSetupCompleteRef.current = true
      } catch (error) {
        const duration = performance.now() - startTime
        console.warn(`Failed to fetch initial JWT token after ${duration.toFixed(2)}ms:`, error)
        // Even if initial fetch fails, we still mark as complete to not block rendering
        // The token fetcher is set up and will retry on first query
        authSetupCompleteRef.current = true
      } finally {
        setupInProgressRef.current = false
      }

      // Only update state if component is still mounted
      if (isMounted) {
        setIsConvexAuthReady(true)
      }
    }

    setupAuth()

    // Cleanup function
    return () => {
      isMounted = false

      // Clean up any pending intervals/timeouts
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)

      // In production, clear auth on unmount
      // In development with StrictMode, skip clearing to avoid reconnection issues
      // StrictMode causes mount -> unmount -> remount, which triggers unnecessary auth clears
      if (import.meta.env.PROD) {
        convexClient.clearAuth()
        setIsConvexAuthReady(false)
      } else {
        // Development: Keep auth but reset ready state
        // This prevents WebSocket reconnection issues during StrictMode double-mount
        setIsConvexAuthReady(false)
        console.log('🔧 DEV: Skipped clearAuth() to prevent StrictMode reconnection issues')
      }
    }
  }, [convexClient, session]) // Re-run when session changes

  // CRITICAL: Always wait for auth to be ready before rendering children
  // This prevents queries from running before auth is set up, which causes 4-second delays
  // The env variable only controls whether to SHOW a spinner, not whether to WAIT
  const showRootLoadingSpinner = import.meta.env.VITE_ENABLE_ROOT_LOADING_SPINNER === 'true'

  if (!isConvexAuthReady) {
    if (showRootLoadingSpinner) {
      // Show full-screen spinner if enabled
      return <LoadingSpinner fullScreen message="Loading..." />
    } else {
      // Don't show spinner, but still wait for auth (render nothing)
      // Routes will handle their own loading states once auth is ready
      return null
    }
  }

  return (
    <ConvexAuthContext.Provider value={{ isConvexAuthReady }}>
      <ConvexProvider client={convexClient}>
        {children}
      </ConvexProvider>
    </ConvexAuthContext.Provider>
  )
}

function RootComponent() {
  const { queryClient, convexQueryClient, locale, translations } = Route.useRouteContext()

  // Core app content without blog wrapper
  const coreContent = (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <GlobalErrorHandlers />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <ReactQueryDevtools />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )

  // Conditionally wrap with BlogProvider
  const appContent = coreContent

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <ConvexWithAuth convexClient={convexQueryClient.convexClient}>
          <ErrorProvider>
            <I18nProvider locale={locale} translations={translations}>
              { appContent }
            </I18nProvider>
          </ErrorProvider>
        </ConvexWithAuth>
      </QueryClientProvider>
    </RootDocument>
  )
}

/**
 * Global Error Handlers Component
 * Manages permission modal and other global error UI
 * Connected to ErrorContext for centralized error handling
 */
function GlobalErrorHandlers() {
  const { permissionError, closePermissionModal } = useErrorContext()
  const [requestAccessOpen, setRequestAccessOpen] = React.useState(false)
  const [savedPermissionData, setSavedPermissionData] = React.useState<{ permission: string; module: string } | null>(null)
  const requestPermission = useMutation(api.lib.system.core.permission_requests.mutations.requestPermission)
  const toast = useToast()

  const handleRequestAccess = () => {
    // Save permission data before closing modal
    if (permissionError?.permission) {
      setSavedPermissionData({
        permission: permissionError.permission,
        module: permissionError.module || 'Unknown Module'
      })
    }
    // Close permission modal and open request access modal
    closePermissionModal()
    setRequestAccessOpen(true)
  }

  const handleSendAccessRequest = async (message?: string) => {
    try {
      if (!savedPermissionData?.permission) {
        console.error('No permission data saved:', savedPermissionData)
        toast.error('Invalid permission request')
        return
      }

      await requestPermission({
        permission: savedPermissionData.permission,
        module: savedPermissionData.module,
        message,
      })

      toast.success('Access request sent! An administrator will review your request.')
      setRequestAccessOpen(false)
      setSavedPermissionData(null) // Clear saved data
    } catch (error: any) {
      toast.error(error.message || 'Failed to send access request')
    }
  }

  return (
    <>
      <PermissionDeniedModal
        error={permissionError}
        open={!!permissionError}
        onClose={closePermissionModal}
        onRequestAccess={handleRequestAccess}
      />

      <RequestAccessModal
        open={requestAccessOpen}
        onClose={() => {
          setRequestAccessOpen(false)
          setSavedPermissionData(null)
        }}
        onRequestAccess={handleSendAccessRequest}
        title="Request Permission"
        description={
          savedPermissionData?.module
            ? `Request access to ${savedPermissionData.module}. An administrator will be notified of your request.`
            : 'Request access to this feature. An administrator will be notified of your request.'
        }
      />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  // ✅ Use optional chaining in case context isn't available
  const routeContext = Route.useRouteContext()
  const locale = routeContext?.locale || defaultLocale
  const translations = routeContext?.translations || {}

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
        {/* Serialize translations for client */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__TRANSLATIONS__=${JSON.stringify(translations)};window.__LOCALE__="${locale}"`
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}