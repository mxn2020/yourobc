// src/features/boilerplate/payments/providers/autumn-convex/components/UsageDisplay.tsx
/**
 * Usage Display Component
 */

import { useAutumnConvexUsage } from '../hooks';
import { AlertCircle } from 'lucide-react';

interface UsageDisplayProps {
  featureKey: string;
  featureName: string;
  unit?: string;
}

export function UsageDisplay({ featureKey, featureName, unit = 'units' }: UsageDisplayProps) {
  const { getUsageStats } = useAutumnConvexUsage();
  const stats = getUsageStats(featureKey);

  if (!stats || typeof stats !== 'object' || !('featureKey' in stats)) {
    return null;
  }

  const { currentUsage, limit, remaining } = stats;
  const percentage = limit ? (Number(currentUsage) / Number(limit)) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{featureName}</span>
        {limit && (
          <span className="text-sm text-gray-600">
            {String(currentUsage)} / {String(limit)} {unit}
          </span>
        )}
      </div>

      {limit && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}

      {isAtLimit && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>Limit reached. Upgrade to continue.</span>
        </div>
      )}

      {isNearLimit && !isAtLimit && remaining !== undefined && (
        <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
          <AlertCircle className="h-4 w-4" />
          <span>
            {String(remaining)} {unit} remaining.
          </span>
        </div>
      )}
    </div>
  );
}