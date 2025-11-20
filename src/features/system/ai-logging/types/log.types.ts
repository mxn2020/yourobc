// src/features/ai-logging/types/log.types.ts
import type { AIUsageLog, AIUsageFilter, LogQueryResult } from '@/features/system/ai-core/types';

export type LogTableView = 'compact' | 'detailed';
export type LogDateRange = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom';

export interface LogFiltersState {
  filters: AIUsageFilter;
  activeFilterCount: number;
}

export interface LogTableProps {
  logs: AIUsageLog[];
  isLoading: boolean;
  view: LogTableView;
  selectedLogs: string[];
  onLogSelect: (logId: string) => void;
  onLogView: (logId: string) => void;
}

export interface LogRowProps {
  log: AIUsageLog;
  isSelected: boolean;
  view: LogTableView;
  onSelect: (logId: string) => void;
  onView: (logId: string) => void;
}

export interface LogPaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLoadMore: () => void;
}

export interface LogDetailState {
  log: AIUsageLog | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: AIUsageFilter;
  includeFields?: string[];
}

export interface FormattedExportLog {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  requestType: string;
  success: boolean;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reasoningTokens: number;
  cachedTokens: number;
  cost: number;
  latencyMs: number;
  finishReason: string;
  errorMessage: string;
  warningCount: number;
  toolCallCount: number;
  sessionId: string;
  feature: string;
}