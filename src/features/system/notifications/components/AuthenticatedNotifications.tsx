// src/features/notifications/components/AuthenticatedNotifications.tsx
import { useAuth } from '@/features/boilerplate/auth/hooks/useAuth'

interface AuthenticatedNotificationsProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Wrapper component that only renders notification components when user is properly authenticated
 * This prevents race conditions during logout where notifications try to fetch with null authUserId
 */
export function AuthenticatedNotifications({ 
  children, 
  fallback = null 
}: AuthenticatedNotificationsProps) {
  const { isAuthenticated, isAuthLoading, auth } = useAuth()

  // Only render if user is authenticated, not loading, and has a valid auth id
  if (!isAuthenticated || isAuthLoading || !auth?.id) {
    return <>{fallback}</>
  }

  return <>{children}</>
}