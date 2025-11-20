// src/router.tsx

import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary'
import { NotFound } from './components/NotFound'
import { QueryClient, notifyManager } from '@tanstack/react-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import type { Locale } from '@/features/boilerplate/i18n'

if (typeof document !== 'undefined') {
  notifyManager.setScheduler(window.requestAnimationFrame)
}

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL!
if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL')
}

// Configure Convex client with Better Auth JWT authentication
const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})

convexQueryClient.connect(queryClient)

// ✅ Create router instance directly (not in a function)
export const router = createTanStackRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: DefaultCatchBoundary,
  defaultNotFoundComponent: () => <NotFound />,
  context: { 
    queryClient, 
    convexQueryClient,
    translations: {} as Record<string, string>,
    locale: 'en' as Locale,
    pathWithoutLocale: '/',
  },
  scrollRestoration: true,
})

// ✅ Register using typeof router directly (official pattern)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// ✅ Optional: Export getter if you need it elsewhere
export function getRouter() {
  return router
}