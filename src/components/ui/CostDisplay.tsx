// src/components/ui/CostDisplay.tsx
import React, { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslation } from '@/features/system/i18n';

interface CostDisplayProps {
  cost: number;
  className?: string;
  showToggle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CostDisplay({ cost, className = '', showToggle = true, size = 'md' }: CostDisplayProps) {
  const { t } = useTranslation('ui');
  const [showPer100, setShowPer100] = useState(false);

  const formatCost = (amount: number, per100: boolean = false) => {
    if (amount === 0) return '$0.00';

    const displayAmount = per100 ? amount * 100 : amount;

    if (displayAmount < 0.01) {
      return `$${displayAmount.toFixed(6)}`;
    } else if (displayAmount < 1) {
      return `$${displayAmount.toFixed(4)}`;
    } else {
      return `$${displayAmount.toFixed(2)}`;
    }
  };

  const displayCost = formatCost(cost, showPer100);
  const suffix = showPer100 ? t('costDisplay.per100Calls') : '';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={sizeClasses[size]}>
        {displayCost}{suffix}
      </span>

      {showToggle && (
        <button
          onClick={() => setShowPer100(!showPer100)}
          className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          title={showPer100 ? t('costDisplay.showActualCost') : t('costDisplay.showPer100')}
        >
          {showPer100 ? (
            <ToggleRight className="h-3 w-3" />
          ) : (
            <ToggleLeft className="h-3 w-3" />
          )}
          <span>{showPer100 ? t('costDisplay.multiplier100x') : t('costDisplay.multiplier1x')}</span>
        </button>
      )}
    </div>
  );
}

// Simple version without toggle for places where space is limited
export function SimpleCostDisplay({ cost, per100 = false }: { cost: number; per100?: boolean }) {
  const { t } = useTranslation('ui');

  const formatCost = (amount: number) => {
    if (amount === 0) return '$0.00';

    const displayAmount = per100 ? amount * 100 : amount;

    if (displayAmount < 0.01) {
      return `$${displayAmount.toFixed(6)}`;
    } else if (displayAmount < 1) {
      return `$${displayAmount.toFixed(4)}`;
    } else {
      return `$${displayAmount.toFixed(2)}`;
    }
  };

  return (
    <span>
      {formatCost(cost)}{per100 ? t('costDisplay.per100Calls') : ''}
    </span>
  );
}