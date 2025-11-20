// src/features/ai-logging/components/LogFilters/LogFilters.tsx
import { useCallback } from 'react';
import { Button, Card, CardContent, Input, SimpleSelect as Select } from '@/components/ui';
import { Search, X, Filter } from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import { AdvancedFilters } from './AdvancedFilters';
import type { AIUsageFilter } from '@/features/system/ai-core/types';
import type { ModelProvider } from '@/features/system/ai-core/types';
import type { LogDateRange } from '../../types/log.types';
import { getActiveFilterCount } from '../../utils/log-filters';

interface LogFiltersProps {
  filters: AIUsageFilter;
  onFiltersChange: (filters: AIUsageFilter) => void;
  onClearFilters: () => void;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

export function LogFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  showAdvanced = false,
  onToggleAdvanced
}: LogFiltersProps) {
  const activeFilterCount = getActiveFilterCount(filters);

  const updateFilter = useCallback(<K extends keyof AIUsageFilter>(
    key: K,
    value: AIUsageFilter[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = useCallback((range: LogDateRange, customRange?: { start: Date; end: Date }) => {
    if (range === 'custom' && customRange) {
      updateFilter('dateRange', customRange);
    } else {
      // Handle preset ranges in DateRangePicker
      updateFilter('dateRange', undefined);
    }
  }, [updateFilter]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2">
            {onToggleAdvanced && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleAdvanced}
              >
                Advanced
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={activeFilterCount === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value || undefined)}
                className="pl-10"
              />
            </div>
            
            <Select
              placeholder="All Models"
              value={filters.modelId?.[0] || ''}
              onChange={(e) => updateFilter('modelId', e.target.value ? [e.target.value] : undefined)}
              options={[
                { value: '', label: 'All Models' },
                { value: 'openai/gpt-4o', label: 'GPT-4o' },
                { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
                { value: 'anthropic/claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
                { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
              ]}
            />

            <Select
              placeholder="All Providers"
              value={filters.provider?.[0] || ''}
              onChange={(e) => updateFilter('provider', e.target.value ? [e.target.value as ModelProvider] : undefined)}
              options={[
                { value: '', label: 'All Providers' },
                { value: 'openai', label: 'OpenAI' },
                { value: 'anthropic', label: 'Anthropic' },
                { value: 'google', label: 'Google' },
                { value: 'xai', label: 'xAI' }
              ]}
            />
            
            <Select
              placeholder="All Status"
              value={filters.success?.toString() || ''}
              onChange={(e) => updateFilter('success', e.target.value ? e.target.value === 'true' : undefined)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'true', label: 'Success' },
                { value: 'false', label: 'Failed' }
              ]}
            />
          </div>

          <DateRangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
          />

          {showAdvanced && (
            <AdvancedFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}