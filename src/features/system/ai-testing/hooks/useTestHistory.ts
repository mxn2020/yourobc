// src/features/ai-testing/hooks/useTestHistory.ts (Updated to use aiTests)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { TestHistoryItem, TestAnalytics } from '../types/test-results.types';
import type { TestViewMode, TestSortField, TestFilterStatus } from '../types/test.types';
import { sortBy } from '@/utils/common/array-utils';

interface UseTestHistoryOptions {
  limit?: number;
  offset?: number;
  sortField?: TestSortField;
  sortDirection?: 'asc' | 'desc';
  filterStatus?: TestFilterStatus;
  searchQuery?: string;
}

interface AITestResult {
  id: string;
  name: string;
  type: string;
  modelId: string;
  provider: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    runningTests: number;
    avgLatency: number;
    totalCost: number;
    successRate: number;
  };
  duration?: number;
  createdAt: Date;
  completedAt?: Date;
  cost: number;
}

export function useTestHistory(options: UseTestHistoryOptions = {}) {
  const queryClient = useQueryClient();
  
  const {
    limit = 50,
    offset = 0,
    sortField = 'createdAt',
    sortDirection = 'desc',
    filterStatus = 'all',
    searchQuery = ''
  } = options;

  const historyQuery = useQuery({
    queryKey: ['test-history', { limit, offset, sortField, sortDirection, filterStatus, searchQuery }],
    queryFn: async (): Promise<{
      tests: AITestResult[];
      total: number;
      hasMore: boolean;
    }> => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/ai/test/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch test history');
      
      const data = await response.json();
      return data.success && data.data ? {
        tests: data.data,
        total: data.metadata?.total || data.data.length,
        hasMore: data.metadata?.hasMore || false
      } : { tests: [], total: 0, hasMore: false };
    },
    staleTime: 30000
  });

  const analyticsQuery = useQuery({
    queryKey: ['test-analytics'],
    queryFn: async (): Promise<TestAnalytics> => {
      const response = await fetch('/api/ai/test/analytics');
      if (!response.ok) throw new Error('Failed to fetch test analytics');
      
      const data = await response.json();
      return data.success && data.data ? data.data : {
        testsOverTime: [],
        modelPerformance: [],
        costTrends: []
      };
    },
    staleTime: 60000
  });

  const deleteTest = useMutation({
    mutationFn: async (testId: string): Promise<void> => {
      const response = await fetch(`/api/ai/test/${testId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete test');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-history'] });
      queryClient.invalidateQueries({ queryKey: ['test-analytics'] });
    }
  });

  const getTestDetails = useCallback(async (testId: string): Promise<any> => {
    const response = await fetch(`/api/ai/test/${testId}`);
    if (!response.ok) throw new Error('Failed to fetch test details');
    
    const data = await response.json();
    return data.success ? data.data : null;
  }, []);

  const getTestResults = useCallback(async (testId: string): Promise<any[]> => {
    const response = await fetch(`/api/ai/test/${testId}/results`);
    if (!response.ok) throw new Error('Failed to fetch test results');
    
    const data = await response.json();
    return data.success ? data.data : [];
  }, []);

  const exportResults = useCallback(async (testIds: string[], format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    const response = await fetch('/api/ai/test/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testIds, format })
    });
    
    if (!response.ok) throw new Error('Failed to export test results');
    return response.blob();
  }, []);

  // Transform the data to match the expected TestHistoryItem format
  const transformedHistory = useMemo((): TestHistoryItem[] => {
    if (!historyQuery.data?.tests || !Array.isArray(historyQuery.data.tests)) return [];
    
    let filtered = historyQuery.data.tests.map((test: AITestResult) => ({
      id: test.id,
      name: test.name,
      type: test.type,
      modelId: test.modelId,
      status: test.status,
      summary: {
        totalTests: test.summary.totalTests,
        passedTests: test.summary.passedTests,
        failedTests: test.summary.failedTests,
        runningTests: test.summary.runningTests,
        avgLatency: test.summary.avgLatency,
        totalCost: test.summary.totalCost,
        successRate: test.summary.successRate
      },
      duration: test.duration,
      createdAt: test.createdAt,
      completedAt: test.completedAt
    }));
    
    // Apply client-side search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply client-side sorting
    return sortBy(filtered, [{ 
      field: sortField === 'duration' ? ((item: TestHistoryItem) => item.duration || 0) : sortField as keyof TestHistoryItem,
      direction: sortDirection 
    }]);
  }, [historyQuery.data, searchQuery, sortField, sortDirection]);

  const summary = useMemo(() => {
    if (!historyQuery.data?.tests || !Array.isArray(historyQuery.data.tests)) return null;
    
    const tests = historyQuery.data.tests;
    const total = tests.length;
    const completed = tests.filter(test => test.status === 'completed').length;
    const failed = tests.filter(test => test.status === 'failed').length;
    const running = tests.filter(test => test.status === 'running').length;
    
    return {
      total,
      completed,
      failed,
      running,
      successRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [historyQuery.data]);

  return {
    history: transformedHistory,
    analytics: analyticsQuery.data,
    summary,
    isLoading: historyQuery.isLoading || analyticsQuery.isLoading,
    isError: historyQuery.isError || analyticsQuery.isError,
    error: historyQuery.error || analyticsQuery.error,
    deleteTest: deleteTest.mutateAsync,
    getTestDetails,
    getTestResults, // New method for getting detailed test results
    exportResults,
    refetch: () => {
      historyQuery.refetch();
      analyticsQuery.refetch();
    }
  };
}