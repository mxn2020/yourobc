// src/features/ai-logging/components/Export/ExportDialog.tsx
import { useState, useCallback } from 'react';
import { Button, Card, CardContent, CardHeader, Checkbox, Modal, Select } from '@/components/ui';
import { DateRangePicker } from '../LogFilters/DateRangePicker';
import { Download, FileText, FileSpreadsheet, Code } from 'lucide-react';
import { useLogExport } from '../../hooks/useLogExport';
import type { ExportOptions, LogDateRange } from '../../types/log.types';
import type { AIUsageFilter } from '@/features/system/ai-core/types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: AIUsageFilter;
}

export function ExportDialog({ isOpen, onClose, currentFilters }: ExportDialogProps) {
  const { exportLogs, isExporting, error } = useLogExport();
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    filters: currentFilters,
    includeFields: [
      'id', 'timestamp', 'model', 'provider', 'requestType', 'success',
      'prompt', 'response', 'cost', 'latencyMs', 'totalTokens'
    ]
  });

  const availableFields = [
    { id: 'id', label: 'Log ID', checked: true },
    { id: 'timestamp', label: 'Timestamp', checked: true },
    { id: 'model', label: 'Model', checked: true },
    { id: 'provider', label: 'Provider', checked: true },
    { id: 'requestType', label: 'Request Type', checked: true },
    { id: 'success', label: 'Success Status', checked: true },
    { id: 'prompt', label: 'Prompt', checked: true },
    { id: 'response', label: 'Response', checked: true },
    { id: 'inputTokens', label: 'Input Tokens', checked: false },
    { id: 'outputTokens', label: 'Output Tokens', checked: false },
    { id: 'totalTokens', label: 'Total Tokens', checked: true },
    { id: 'reasoningTokens', label: 'Reasoning Tokens', checked: false },
    { id: 'cachedTokens', label: 'Cached Tokens', checked: false },
    { id: 'cost', label: 'Cost', checked: true },
    { id: 'latencyMs', label: 'Latency (ms)', checked: true },
    { id: 'finishReason', label: 'Finish Reason', checked: false },
    { id: 'errorMessage', label: 'Error Message', checked: false },
    { id: 'warningCount', label: 'Warning Count', checked: false },
    { id: 'toolCallCount', label: 'Tool Call Count', checked: false },
    { id: 'sessionId', label: 'Session ID', checked: false },
    { id: 'feature', label: 'Feature', checked: false }
  ];

  const formatOptions = [
    { 
      value: 'csv', 
      label: 'CSV', 
      description: 'Comma-separated values for spreadsheets',
      icon: FileSpreadsheet 
    },
    { 
      value: 'json', 
      label: 'JSON', 
      description: 'JavaScript Object Notation for APIs',
      icon: Code 
    },
    { 
      value: 'xlsx', 
      label: 'Excel', 
      description: 'Microsoft Excel format',
      icon: FileText 
    }
  ];

  const handleFieldToggle = useCallback((fieldId: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: checked
        ? [...(prev.includeFields || []), fieldId]
        : (prev.includeFields || []).filter(id => id !== fieldId)
    }));
  }, []);

  const handleDateRangeChange = useCallback((range: LogDateRange, customRange?: { start: Date; end: Date }) => {
    setExportOptions(prev => ({
      ...prev,
      dateRange: customRange
    }));
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await exportLogs(exportOptions);
      onClose();
    } catch (err) {
      // Error is handled by the hook
    }
  }, [exportLogs, exportOptions, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Download className="h-6 w-6 mr-3 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Export AI Logs</h2>
        </div>

        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Export Format</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {formatOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        exportOptions.format === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={option.value}
                        checked={exportOptions.format === option.value}
                        onChange={(e) => setExportOptions(prev => ({ 
                          ...prev, 
                          format: e.target.value as ExportOptions['format']
                        }))}
                        className="sr-only"
                      />
                      <Icon className="h-5 w-5 mr-3 text-gray-600" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Date Range</h3>
            </CardHeader>
            <CardContent>
              <DateRangePicker
                value={exportOptions.dateRange}
                onChange={handleDateRangeChange}
              />
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Fields to Include</h3>
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const allFields = availableFields.map(f => f.id);
                    setExportOptions(prev => ({ ...prev, includeFields: allFields }));
                  }}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const essentialFields = ['id', 'timestamp', 'model', 'provider', 'success', 'cost'];
                    setExportOptions(prev => ({ ...prev, includeFields: essentialFields }));
                  }}
                >
                  Essential Only
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {availableFields.map(field => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={exportOptions.includeFields?.includes(field.id)}
                      onChange={(checked) => handleFieldToggle(field.id, checked)}
                    />
                    <label 
                      htmlFor={field.id}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                Export failed: {error.message}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              loading={isExporting}
              disabled={!exportOptions.includeFields?.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({exportOptions.includeFields?.length || 0} fields)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}