// src/features/boilerplate/admin/components/ConfigChangeDialog.tsx
/**
 * ConfigChangeDialog Component
 *
 * Confirmation dialog for critical configuration changes.
 * Shows impact analysis and warnings before applying changes.
 */

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Badge,
} from '@/components/ui';
import { AlertTriangle, RefreshCw, Link } from 'lucide-react';
import type { ConfigChangeDialogProps } from '../types/config.types';
import { useTranslation } from '@/features/boilerplate/i18n';

export function ConfigChangeDialog({
  open,
  change,
  onConfirm,
  onCancel,
}: ConfigChangeDialogProps) {
  const { t } = useTranslation('admin');

  if (!change) return null;

  const isCritical = change.requiresRestart || (change.affectedDependencies?.length ?? 0) > 0;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {t('configDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4 pt-2">
              {/* Change summary */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('configDialog.summary.changingTitle')}</p>
                <div className="bg-muted p-3 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('configDialog.summary.feature')}</span>
                    <Badge variant="outline">{change.feature}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('configDialog.summary.setting')}</span>
                    <code className="text-sm font-mono">{change.key}</code>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('configDialog.summary.from')}</span>
                      <code className="text-sm font-mono text-destructive">
                        {formatValue(change.oldValue, t)}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('configDialog.summary.to')}</span>
                      <code className="text-sm font-mono text-success">
                        {formatValue(change.newValue, t)}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restart warning */}
              {change.requiresRestart && (
                <div className="bg-warning/10 border border-warning/20 rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-2 text-warning">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('configDialog.restartRequired.title')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('configDialog.restartRequired.description')}
                  </p>
                </div>
              )}

              {/* Affected dependencies */}
              {change.affectedDependencies && change.affectedDependencies.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <Link className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('configDialog.dependentFeatures.title')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('configDialog.dependentFeatures.description', { feature: change.feature })}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {change.affectedDependencies.map((dep) => (
                      <Badge key={dep} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* General warning for critical changes */}
              {isCritical && (
                <p className="text-xs text-muted-foreground">
                  {t('configDialog.warning')}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{t('configDialog.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-warning hover:bg-warning/90"
          >
            {change.requiresRestart ? t('configDialog.actions.confirmWithRestart') : t('configDialog.actions.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format value for display in dialog
 */
function formatValue(value: any, t: any): string {
  if (value === undefined || value === null) {
    return t('configDialog.values.notSet');
  }

  if (typeof value === 'boolean') {
    return value ? t('configDialog.values.enabled') : t('configDialog.values.disabled');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
