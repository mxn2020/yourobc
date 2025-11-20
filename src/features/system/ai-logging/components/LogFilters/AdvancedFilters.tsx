// src/features/ai-logging/components/LogFilters/AdvancedFilters.tsx
import { useCallback } from 'react';
import { Input, Label, SimpleSelect as Select } from '@/components/ui';
import type { AIUsageFilter } from '@/features/boilerplate/ai-core/types';
import type { AIOperationType } from '@/features/boilerplate/ai-core/types';
import type { LanguageModelV2FinishReason } from '@ai-sdk/provider';

interface AdvancedFiltersProps {
  filters: AIUsageFilter;
  onFiltersChange: (filters: AIUsageFilter) => void;
}

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const updateFilter = useCallback(<K extends keyof AIUsageFilter>(
    key: K,
    value: AIUsageFilter[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const updateRangeFilter = useCallback((
    rangeKey: 'costRange' | 'latencyRange' | 'tokenRange',
    type: 'min' | 'max',
    value: string
  ) => {
    const numValue = value ? parseFloat(value) : undefined;
    const currentRange = filters[rangeKey] || {};
    
    updateFilter(rangeKey, {
      ...currentRange,
      [type]: numValue
    });
  }, [filters, updateFilter]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900">Advanced Filters</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="request-type-filter" size="sm">
            Request Type
          </Label>
          <Select
            id="request-type-filter"
            placeholder="All Types"
            value={filters.requestType?.[0] || ''}
            onChange={(e) => updateFilter('requestType', e.target.value ? [e.target.value as AIOperationType] : undefined)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'text_generation', label: 'Text Generation' },
              { value: 'object_generation', label: 'Object Generation' },
              { value: 'embedding', label: 'Embedding' },
              { value: 'image_generation', label: 'Image Generation' },
              { value: 'test', label: 'Test' }
            ]}
          />
        </div>

        <div>
          <Label htmlFor="finish-reason-filter" size="sm">
            Finish Reason
          </Label>
          <Select
            id="finish-reason-filter"
            placeholder="All Reasons"
            value={filters.finishReason?.[0] || ''}
            onChange={(e) => updateFilter('finishReason', e.target.value ? [e.target.value as LanguageModelV2FinishReason] : undefined)}
            options={[
              { value: '', label: 'All Reasons' },
              { value: 'stop', label: 'Stop' },
              { value: 'length', label: 'Length' },
              { value: 'content-filter', label: 'Content Filter' },
              { value: 'tool-calls', label: 'Tool Calls' }
            ]}
          />
        </div>

        <div>
          <Label htmlFor="has-tool-calls-filter" size="sm">
            Has Tool Calls
          </Label>
          <Select
            id="has-tool-calls-filter"
            placeholder="Any"
            value={filters.hasToolCalls?.toString() || ''}
            onChange={(e) => updateFilter('hasToolCalls', e.target.value ? e.target.value === 'true' : undefined)}
            options={[
              { value: '', label: 'Any' },
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label size="sm">
            Cost Range ($)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              step="0.0001"
              value={filters.costRange?.min?.toString() || ''}
              onChange={(e) => updateRangeFilter('costRange', 'min', e.target.value)}
            />
            <Input
              placeholder="Max"
              type="number"
              step="0.0001"
              value={filters.costRange?.max?.toString() || ''}
              onChange={(e) => updateRangeFilter('costRange', 'max', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label size="sm">
            Latency Range (ms)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={filters.latencyRange?.min?.toString() || ''}
              onChange={(e) => updateRangeFilter('latencyRange', 'min', e.target.value)}
            />
            <Input
              placeholder="Max"
              type="number"
              value={filters.latencyRange?.max?.toString() || ''}
              onChange={(e) => updateRangeFilter('latencyRange', 'max', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label size="sm">
            Token Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={filters.tokenRange?.min?.toString() || ''}
              onChange={(e) => updateRangeFilter('tokenRange', 'min', e.target.value)}
            />
            <Input
              placeholder="Max"
              type="number"
              value={filters.tokenRange?.max?.toString() || ''}
              onChange={(e) => updateRangeFilter('tokenRange', 'max', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}