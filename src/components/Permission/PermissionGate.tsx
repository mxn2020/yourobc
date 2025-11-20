import { ReactNode } from 'react'

interface PermissionGateProps {
  /**
   * Whether the user has permission to view the children
   */
  hasPermission: boolean

  /**
   * Content to render when permission is granted
   */
  children: ReactNode

  /**
   * Optional fallback content to show when permission is denied
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode

  /**
   * If true, renders nothing when permission is denied (even if fallback is provided)
   * Useful for completely hiding features
   */
  hideWhenDenied?: boolean
}

/**
 * Conditionally renders children based on permission check
 *
 * Usage:
 * ```tsx
 * <PermissionGate hasPermission={canEdit}>
 *   <EditForm />
 * </PermissionGate>
 *
 * <PermissionGate
 *   hasPermission={canManageTeam}
 *   fallback={<Alert>You need admin access to manage team</Alert>}
 * >
 *   <TeamManagement />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  hasPermission,
  children,
  fallback,
  hideWhenDenied = false,
}: PermissionGateProps) {
  if (hasPermission) {
    return <>{children}</>
  }

  if (hideWhenDenied) {
    return null
  }

  return <>{fallback || null}</>
}
