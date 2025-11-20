// src/features/ai-logging/hooks/useLogExport.ts
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { LogService } from '../services/LogService';
import type { AIUsageFilter } from '@/features/boilerplate/ai-core/types';
import type { ExportOptions } from '../types/log.types';

export function useLogExport() {
  const exportMutation = useMutation({
    mutationFn: LogService.exportLogs
  });

  const downloadCsv = useCallback((csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const exportLogs = useCallback(async (options: ExportOptions) => {
    const filters: AIUsageFilter = {
      ...options.filters,
      dateRange: options.dateRange
    };

    try {
      const exportData = await exportMutation.mutateAsync({ filters, format: options.format as 'json' | 'csv' });
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ai-logs-${timestamp}.${options.format}`;
      
      downloadCsv(exportData, filename);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [exportMutation, downloadCsv]);

  return {
    exportLogs,
    isExporting: exportMutation.isPending,
    error: exportMutation.error
  };
}