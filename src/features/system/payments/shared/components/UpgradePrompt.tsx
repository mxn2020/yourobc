// src/features/system/payments/shared/components/UpgradePrompt.tsx
/**
 * Generic Upgrade Prompt Component
 */

import { ArrowUpCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui';

interface UpgradePromptProps {
  message?: string;
  reason?: string;
  variant?: 'inline' | 'card' | 'modal';
}

export function UpgradePrompt({
  message = 'Upgrade to unlock this feature',
  reason,
  variant = 'card',
}: UpgradePromptProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm">
        <Lock className="h-4 w-4 text-blue-600" />
        <span className="text-blue-900">{message}</span>
                <a
          href="/pricing"
          className="ml-auto font-medium text-blue-600 hover:underline"
        >
          Upgrade
        </a>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Feature Locked
            </h3>
          </div>
          <p className="mb-4 text-sm text-gray-600">{message}</p>
          {reason && (
            <p className="mb-4 text-xs text-gray-500">Reason: {reason}</p>
          )}
          <div className="flex gap-3">
            <Button
              onClick={() => (window.location.href = '/pricing')}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View Plans
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <Lock className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        Upgrade Required
      </h3>
      <p className="mb-4 text-sm text-gray-600">{message}</p>
      {reason && (
        <p className="mb-4 text-xs text-gray-500">
          <strong>Reason:</strong> {reason}
        </p>
      )}
              <a
        href="/pricing"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <ArrowUpCircle className="h-4 w-4" />
        View Pricing Plans
      </a>
    </div>
  );
}