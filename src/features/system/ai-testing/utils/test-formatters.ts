// src/features/ai-testing/utils/test-formatters.ts
import type { TestResult, TestStatus } from '@/features/system/ai-core/types';
import type { TestResultSummary, TestHistoryItem } from '../types/test-results.types';
import { formatDuration, formatDate } from '@/features/system/ai-core/utils';
import { formatCost } from '@/features/system/ai-core/utils';
import { formatTokenCount } from '@/features/system/ai-core/utils';

export function formatTestStatus(status: TestStatus): {
  label: string;
  color: string;
  icon: string;
} {
  const statusMap = {
    pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50', icon: 'Clock' },
    running: { label: 'Running', color: 'text-blue-600 bg-blue-50', icon: 'Play' },
    completed: { label: 'Completed', color: 'text-green-600 bg-green-50', icon: 'CheckCircle' },
    failed: { label: 'Failed', color: 'text-red-600 bg-red-50', icon: 'XCircle' },
    cancelled: { label: 'Cancelled', color: 'text-gray-600 bg-gray-50', icon: 'X' }
  };
  return statusMap[status];
}

export function formatTestSummary(summary: TestResultSummary): string {
  const { totalTests, passedTests, failedTests } = summary;
  if (totalTests === 0) return 'No tests';
  
  const passRate = Math.round((passedTests / totalTests) * 100);
  return `${passedTests}/${totalTests} passed (${passRate}%)`;
}

export function formatTestDuration(startTime: Date | string, endTime?: Date | string): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = endTime ? (typeof endTime === 'string' ? new Date(endTime) : endTime) : new Date();
  
  if (!start || isNaN(start.getTime())) {
    return '-';
  }
  
  if (isNaN(end.getTime())) {
    return '-';
  }
  
  const durationMs = end.getTime() - start.getTime();
  return formatDuration(durationMs);
}

export function formatTestResult(result: TestResult): {
  statusDisplay: ReturnType<typeof formatTestStatus>;
  durationText: string;
  costText: string;
  tokensText: string;
  latencyText: string;
} {
  return {
    statusDisplay: formatTestStatus(result.status),
    durationText: formatTestDuration(result.startedAt, result.completedAt),
    costText: formatCost(result.cost),
    tokensText: formatTokenCount(result.usage.totalTokens),
    latencyText: `${result.latencyMs}ms`
  };
}

export function formatTestHistoryItem(item: TestHistoryItem): {
  statusDisplay: ReturnType<typeof formatTestStatus>;
  summaryText: string;
  dateText: string;
  durationText: string;
} {
  return {
    statusDisplay: formatTestStatus(item.status),
    summaryText: formatTestSummary(item.summary),
    dateText: formatDate(item.createdAt, { relative: true }),
    durationText: item.duration ? formatDuration(item.duration) : '-'
  };
}

export function formatValidationScore(score?: number): {
  text: string;
  color: string;
} {
  if (score === undefined) return { text: '-', color: 'text-gray-500' };
  
  const colors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    average: 'text-yellow-600',
    poor: 'text-red-600'
  };
  
  let category: keyof typeof colors;
  if (score >= 90) category = 'excellent';
  else if (score >= 75) category = 'good';
  else if (score >= 50) category = 'average';
  else category = 'poor';
  
  return {
    text: `${score}%`,
    color: colors[category]
  };
}