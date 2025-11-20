import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Lock } from 'lucide-react'

interface PermissionWarningBannerProps {
  /**
   * Title of the warning
   */
  title?: string

  /**
   * Description of what's restricted
   */
  message: string

  /**
   * Optional action button to request access
   */
  onRequestAccess?: () => void

  /**
   * Whether to show the request access button
   */
  showRequestAccess?: boolean

  /**
   * Variant of the alert
   */
  variant?: 'default' | 'destructive'

  /**
   * Optional additional class names
   */
  className?: string
}

export function PermissionWarningBanner({
  title = 'Limited Access',
  message,
  onRequestAccess,
  showRequestAccess = true,
  variant = 'default',
  className,
}: PermissionWarningBannerProps) {
  return (
    <Alert variant={variant} className={className}>
      <Lock className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{message}</p>
        {showRequestAccess && onRequestAccess && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestAccess}
            className="mt-3"
          >
            Request Access
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Inline variant for smaller spaces
 */
export function PermissionWarningInline({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-sm text-yellow-800 dark:text-yellow-200 ${className || ''}`}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
