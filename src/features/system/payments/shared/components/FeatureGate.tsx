// src/features/system/payments/shared/components/FeatureGate.tsx
/**
 * Generic Feature Gate Component
 * 
 * Works with any payment provider
 */

import { UpgradePrompt } from './UpgradePrompt';
import type { FeatureAccess } from '../../types';

interface FeatureGateProps {
  featureAccess: FeatureAccess;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
  isLoading?: boolean;
}

export function FeatureGate({
  featureAccess,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeMessage,
  isLoading = false,
}: FeatureGateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (featureAccess.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        message={upgradeMessage || 'Upgrade to access this feature'}
        reason={featureAccess.reason}
      />
    );
  }

  return null;
}