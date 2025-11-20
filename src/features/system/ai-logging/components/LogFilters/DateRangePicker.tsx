// src/features/ai-logging/components/LogFilters/DateRangePicker.tsx
import { useState, useCallback } from 'react';
import { Button, Input } from '@/components/ui';
import { Calendar, ChevronDown } from 'lucide-react';
import type { LogDateRange } from '../../types/log.types';
import { getDateRangeForPreset } from '@/utils/common/date-utils';

interface DateRangePickerProps {
  value?: { start: Date; end: Date };
  onChange: (range: LogDateRange, customRange?: { start: Date; end: Date }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<LogDateRange>('last_7_days');
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const presetOptions: Array<{ value: LogDateRange; label: string }> = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const handlePresetChange = useCallback((range: LogDateRange) => {
    setSelectedRange(range);
    
    if (range === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onChange(range);
    }
  }, [onChange]);

  const handleCustomApply = useCallback(() => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      
      if (start <= end) {
        onChange('custom', { start, end });
      }
    }
  }, [customStart, customEnd, onChange]);

  const currentLabel = value 
    ? `${value.start.toLocaleDateString()} - ${value.end.toLocaleDateString()}`
    : getDateRangeForPreset(selectedRange).label;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
        <span className="text-sm text-gray-900">{currentLabel}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {presetOptions.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={selectedRange === option.value ? 'primary' : 'outline'}
            onClick={() => handlePresetChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {showCustom && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Button
              size="sm"
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
            >
              Apply Custom Range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}