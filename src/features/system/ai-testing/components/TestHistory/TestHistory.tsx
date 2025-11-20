// src/features/ai-testing/components/TestHistory/TestHistory.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { History, Search, Filter, Download, Trash2, Grid, List } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Input, Loading, SimpleSelect as Select } from '@/components/ui';
import { TestCard } from './TestCard';
import { useTestHistory } from '../../hooks/useTestHistory';
import type { TestViewMode, TestSortField, TestFilterStatus } from '../../types/test.types';
import { useToast } from '@/features/system/notifications';

export function TestHistory() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<TestViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<TestSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<TestFilterStatus>('all');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const {
    history,
    analytics,
    summary,
    isLoading,
    isError,
    error,
    deleteTest,
    exportResults,
    refetch
  } = useTestHistory({
    limit: 50,
    sortField,
    sortDirection,
    filterStatus,
    searchQuery
  });

  const sortOptions = useMemo(() => [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'duration', label: 'Duration' }
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Tests' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'running', label: 'Running' }
  ], []);

  const handleDelete = useCallback(async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    try {
      await deleteTest(testId);
      toast.success('Test deleted successfully');
      setSelectedTests(prev => prev.filter(id => id !== testId));
    } catch (error) {
      toast.error('Failed to delete test');
    }
  }, [deleteTest]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedTests.length === 0) return;
    if (!confirm(`Delete ${selectedTests.length} selected tests?`)) return;

    try {
      await Promise.all(selectedTests.map(testId => deleteTest(testId)));
      toast.success(`${selectedTests.length} tests deleted successfully`);
      setSelectedTests([]);
    } catch (error) {
      toast.error('Failed to delete some tests');
    }
  }, [selectedTests, deleteTest]);

  const handleExport = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    try {
      const testIds = selectedTests.length > 0 ? selectedTests : history.map(h => h.id);
      const blob = await exportResults(testIds, format);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-results.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${testIds.length} tests to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export test results');
    }
  }, [selectedTests, history, exportResults]);

  const toggleTestSelection = useCallback((testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  }, []);

  const selectAllTests = useCallback(() => {
    setSelectedTests(history.map(h => h.id));
  }, [history]);

  const clearSelection = useCallback(() => {
    setSelectedTests([]);
  }, []);

  if (isError) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Failed to load test history</div>
            <p className="text-sm text-gray-600 mb-4">
              {error?.message || 'An error occurred while fetching test data'}
            </p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Test History</h3>
              {summary && (
                <span className="text-sm text-gray-600">
                  ({summary.total} tests, {summary.successRate.toFixed(1)}% success rate)
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              
              {selectedTests.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedTests.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tests by name, model, or type..."
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as TestFilterStatus)}
                options={statusOptions}
              />

              <Select
                value={sortField}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortField(e.target.value as TestSortField)}
                options={sortOptions}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {selectedTests.length === 0 && history.length > 0 && (
            <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
              <span>Select tests to export or delete them in bulk</span>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={selectAllTests}>
                  Select All
                </Button>
              </div>
            </div>
          )}

          {selectedTests.length > 0 && (
            <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedTests.length} tests selected
              </span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear Selection
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loading className="h-6 w-6 mr-2" />
              <span>Loading test history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by running your first AI model test'
                }
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }>
              {history.map(test => (
                <TestCard
                  key={test.id}
                  test={test}
                  viewMode={viewMode}
                  isSelected={selectedTests.includes(test.id)}
                  onSelect={() => toggleTestSelection(test.id)}
                  onDelete={() => handleDelete(test.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {analytics && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Top Performing Models</h4>
                <div className="space-y-2">
                  {analytics.modelPerformance.slice(0, 5).map((model, index) => (
                    <div key={model.modelId} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate">
                        {model.modelId}
                      </span>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-600">{model.successRate.toFixed(1)}%</span>
                        <span className="text-gray-400">({model.testCount})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cost Trends</h4>
                <div className="space-y-2">
                  {analytics.costTrends?.slice(-5).map((trend, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {new Date(trend.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-medium">
                        ${(trend.totalCost || 0).toFixed(4)}
                      </span>
                    </div>
                  )) || []}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {analytics.testsOverTime.slice(-5).map((activity, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-blue-600">{activity.count} tests</span>
                        <span className="text-green-600">{activity.successRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}