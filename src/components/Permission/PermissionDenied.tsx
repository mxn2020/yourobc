// src/components/ui/PermissionDenied.tsx

import { FC } from 'react'
import { ShieldAlert, Mail } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { Alert, AlertDescription } from '../ui/Alert'
import { useTranslation } from '@/features/system/i18n'

export interface PermissionDeniedProps {
  /**
   * The permission that was denied (e.g., "projects.view", "customers.create")
   */
  permission?: string

  /**
   * The module name for user-friendly display (e.g., "Customers", "Quotes")
   */
  module?: string

  /**
   * Custom message to display instead of the default
   */
  message?: string

  /**
   * Contact information for requesting access
   */
  contactEmail?: string

  /**
   * Callback for "Request Access" button
   */
  onRequestAccess?: () => void

  /**
   * Show detailed technical information (permission string)
   */
  showDetails?: boolean
}

/**
 * Permission Denied Component
 *
 * Displays a user-friendly message when access is denied due to insufficient permissions.
 * Provides actionable guidance and optional request access functionality.
 */
export const PermissionDenied: FC<PermissionDeniedProps> = ({
  permission,
  module = 'this resource',
  message,
  contactEmail = 'your administrator',
  onRequestAccess,
  showDetails = false,
}) => {
  const { t } = useTranslation('ui');
  const defaultModule = module === 'this resource' ? t('permissionDenied.thisResource') : module;
  const defaultMessage = t('permissionDenied.defaultMessage', { module: defaultModule.toLowerCase() });

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <ShieldAlert className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {t('permissionDenied.title')}
              </h2>
              <p className="text-gray-600">
                {message || defaultMessage}
              </p>
            </div>

            {/* Action Guidance */}
            <Alert variant="default" className="text-left">
              <AlertDescription>
                <p className="text-sm text-gray-700">
                  <strong>{t('permissionDenied.whatToDo')}</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li>{t('permissionDenied.instructions.contact', { contactEmail })}</li>
                  <li>{t('permissionDenied.instructions.provideDetails')}</li>
                  <li>{t('permissionDenied.instructions.waitForApproval')}</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Technical Details (Optional) */}
            {showDetails && permission && (
              <details className="text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  {t('permissionDenied.technicalDetails')}
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {t('permissionDenied.requiredPermission')} <span className="text-red-600">{permission}</span>
                  </p>
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {onRequestAccess && (
                <Button
                  onClick={onRequestAccess}
                  className="flex-1"
                  variant="primary"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t('permissionDenied.requestAccess')}
                </Button>
              )}

              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1"
              >
                {t('permissionDenied.goBack')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
