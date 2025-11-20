// src/features/ai-logging/components/Export/ExportService.tsx
import { useCallback } from 'react';
import type { AIUsageLog } from '@/features/boilerplate/ai-core/types';
import type { ExportOptions, FormattedExportLog } from '../../types/log.types';
import { formatLogForExport } from '../../utils/log-formatters';

// Helper function for type-safe property access on FormattedExportLog
function getExportLogProperty(log: FormattedExportLog, field: string): string | number | boolean {
  return (log as unknown as Record<string, string | number | boolean>)[field];
}

export function useExportService() {
  const generateCsv = useCallback((logs: AIUsageLog[], options: ExportOptions): string => {
    const fields = options.includeFields || [];
    const formattedLogs = logs.map(formatLogForExport);
    
    // Create header row
    const headers = fields.map(field => {
      const fieldLabels: Record<string, string> = {
        id: 'Log ID',
        timestamp: 'Timestamp',
        model: 'Model',
        provider: 'Provider',
        requestType: 'Request Type',
        success: 'Success',
        prompt: 'Prompt',
        response: 'Response',
        inputTokens: 'Input Tokens',
        outputTokens: 'Output Tokens',
        totalTokens: 'Total Tokens',
        reasoningTokens: 'Reasoning Tokens',
        cachedTokens: 'Cached Tokens',
        cost: 'Cost',
        latencyMs: 'Latency (ms)',
        finishReason: 'Finish Reason',
        errorMessage: 'Error Message',
        warningCount: 'Warning Count',
        toolCallCount: 'Tool Call Count',
        sessionId: 'Session ID',
        feature: 'Feature'
      };
      return fieldLabels[field] || field;
    });
    
    // Create data rows
    const rows = formattedLogs.map(log => {
      return fields.map(field => {
        const value = getExportLogProperty(log, field);

        // Handle null/undefined values
        if (value === null || value === undefined) {
          return '';
        }

        // Handle string values that might contain commas or quotes
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }

        return String(value);
      });
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    return csvContent;
  }, []);

  const generateJson = useCallback((logs: AIUsageLog[], options: ExportOptions): string => {
    const fields = options.includeFields || [];
    const formattedLogs = logs.map(formatLogForExport);
    
    // Filter logs to only include selected fields
    const filteredLogs = formattedLogs.map(log => {
      const filtered: Record<string, string | number | boolean> = {};
      fields.forEach(field => {
        if (field in log) {
          filtered[field] = getExportLogProperty(log, field);
        }
      });
      return filtered;
    });
    
    return JSON.stringify(filteredLogs, null, 2);
  }, []);

  const generateXlsx = useCallback((logs: AIUsageLog[], options: ExportOptions): string => {
    // For now, we'll return CSV format as XLSX generation requires additional libraries
    // In a real implementation, you'd use a library like xlsx or exceljs
    return generateCsv(logs, options);
  }, [generateCsv]);

  const exportData = useCallback((
    logs: AIUsageLog[], 
    options: ExportOptions
  ): { content: string; filename: string; mimeType: string } => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (options.format) {
      case 'json':
        return {
          content: generateJson(logs, options),
          filename: `ai-logs-${timestamp}.json`,
          mimeType: 'application/json'
        };
        
      case 'xlsx':
        return {
          content: generateXlsx(logs, options),
          filename: `ai-logs-${timestamp}.xlsx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        
      case 'csv':
      default:
        return {
          content: generateCsv(logs, options),
          filename: `ai-logs-${timestamp}.csv`,
          mimeType: 'text/csv'
        };
    }
  }, [generateCsv, generateJson, generateXlsx]);

  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, []);

  const exportLogs = useCallback((logs: AIUsageLog[], options: ExportOptions) => {
    const { content, filename, mimeType } = exportData(logs, options);
    downloadFile(content, filename, mimeType);
  }, [exportData, downloadFile]);

  return {
    exportLogs,
    generateCsv,
    generateJson,
    generateXlsx
  };
}