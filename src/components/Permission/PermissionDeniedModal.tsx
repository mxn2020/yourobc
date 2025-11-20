// src/components/ui/PermissionDeniedModal.tsx

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Alert, AlertDescription } from '../ui/Alert'
import { Shield, Mail, Info } from 'lucide-react'
import { ParsedError } from '../../utils/errorHandling'
import { useTranslation } from '@/features/system/i18n'

interface PermissionDeniedModalProps {
  /**
   * Parsed error with permission details
   */
  error: ParsedError | null

  /**
   * Whether the modal is open
   */
  open: boolean

  /**
   * Callback when modal is closed
   */
  onClose: () => void

  /**
   * Optional custom action button
   */
  onRequestAccess?: () => void
}

/**
 * Permission Denied Modal
 *
 * A reusable modal for displaying permission errors with:
 * - Clear explanation of what permission is needed
 * - Information about the module/feature
 * - Guidance on how to request access
 * - Optional action button for requesting access
 *
 * @example
 * ```tsx
 * const { permissionError, closePermissionModal } = useErrorContext()
 *
 * <PermissionDeniedModal
 *   error={permissionError}
 *   open={!!permissionError}
 *   onClose={closePermissionModal}
 *   onRequestAccess={() => {
 *     // Optional: Implement access request flow
 *     toast.success('Access request sent to administrator')
 *   }}
 * />
 * ```
 */
export function PermissionDeniedModal({
  error,
  open,
  onClose,
  onRequestAccess,
}: PermissionDeniedModalProps) {
  const { t } = useTranslation('ui');

  if (!error) return null

  const isAdminRequired = error.code === 'ADMIN_REQUIRED'
  const hasPermissionInfo = error.permission || error.module

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isAdminRequired ? t('permissionDeniedModal.adminRequired') : t('permissionDeniedModal.title')}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {error.code || t('permissionDeniedModal.accessDenied')}
              </p>
            </div>
          </div>
          <DialogDescription className="text-base text-foreground mt-4">
            {error.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Module/Permission Information */}
          {hasPermissionInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {error.module && (
                    <p>
                      <strong>{t('permissionDeniedModal.module')}</strong> {error.module}
                    </p>
                  )}
                  {error.permission && (
                    <p>
                      <strong>{t('permissionDeniedModal.requiredPermission')}</strong>{' '}
                      <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                        {error.permission}
                      </code>
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Guidance */}
          {error.action && (
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium mb-2">{t('permissionDeniedModal.whatCanIDo')}</h4>
              <p className="text-sm text-muted-foreground">{error.action}</p>
            </div>
          )}

          {/* Additional Details */}
          {error.details && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium mb-2 text-sm">{t('permissionDeniedModal.technicalDetails')}</h4>
              <p className="text-sm text-muted-foreground">{error.details}</p>
            </div>
          )}

          {/* How to Request Access */}
          <div className="rounded-lg border-2 border-dashed border-muted bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t('permissionDeniedModal.needAccess')}</h4>
                <p className="text-sm text-muted-foreground">
                  {isAdminRequired
                    ? t('permissionDeniedModal.adminMessage')
                    : t('permissionDeniedModal.requestMessage')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {onRequestAccess && (
            <Button
              onClick={() => {
                onRequestAccess()
                onClose()
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t('permissionDeniedModal.requestAccess')}
            </Button>
          )}
          <Button onClick={onClose} className="w-full sm:w-auto">
            {t('permissionDeniedModal.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Simplified variant for inline display (not in modal)
 */
export function PermissionDeniedInline({
  error,
  onRequestAccess,
}: {
  error: ParsedError
  onRequestAccess?: () => void
}) {
  const { t } = useTranslation('ui');

  return (
    <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 flex-shrink-0">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              {error.code === 'ADMIN_REQUIRED' ? t('permissionDeniedModal.adminRequired') : t('permissionDeniedModal.title')}
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">{error.message}</p>
          </div>

          {error.action && (
            <p className="text-sm text-red-700 dark:text-red-300">{error.action}</p>
          )}

          {error.permission && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {t('permissionDeniedModal.requiredPermission')}{' '}
              <code className="bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                {error.permission}
              </code>
            </p>
          )}

          {onRequestAccess && (
            <Button
              onClick={onRequestAccess}
              variant="outline"
              size="sm"
              className="mt-2 border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t('permissionDeniedModal.requestAccess')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
