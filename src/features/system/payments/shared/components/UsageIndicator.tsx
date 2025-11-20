// src/features/system/payments/shared/components/UsageIndicator.tsx
/**
 * Generic Usage Indicator Component
 */

import { AlertCircle } from 'lucide-react';
import type { UsageStats } from '../../types';

interface UsageIndicatorProps {
  stats: UsageStats;
  featureName: string;
  unit?: string;
  showDetails?: boolean;
}

export function UsageIndicator({
  stats,
  featureName,
  unit = 'units',
  showDetails = true,
}: UsageIndicatorProps) {
  const { currentUsage, limit, remaining } = stats;
  const percentage = limit ? (currentUsage / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (isAtLimit) return 'text-red-700';
    if (isNearLimit) return 'text-yellow-700';
    return 'text-gray-700';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{featureName}</span>
        {showDetails && limit && (
          <span className={`text-sm ${getTextColor()}`}>
            {currentUsage} / {limit} {unit}
          </span>
        )}
        {showDetails && !limit && (
          <span className="text-sm text-gray-500">
            {currentUsage} {unit}
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
          <span>Limit reached. Upgrade to continue using this feature.</span>
        </div>
      )}

      {isNearLimit && !isAtLimit && remaining !== undefined && (
        <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
          <AlertCircle className="h-4 w-4" />
          <span>
            You're approaching your limit. {remaining} {unit} remaining.
          </span>
        </div>
      )}
    </div>
  );
}