// src/features/ai-logging/pages/AILogsPage.tsx
import { useState, useCallback, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Activity, Download, Filter, Grid, List, RefreshCw, Settings, TrendingUp, Search } from 'lucide-react';
import { Badge, Button, Card, CardContent, Input, ViewSwitcher, type ViewMode } from '@/components/ui';
import { LogTable } from '../components/LogTable/LogTable';
import { LogList } from '../components/LogList';
import { LogGrid } from '../components/LogGrid';
import { LogFilters } from '../components/LogFilters/LogFilters';
import { LogPagination } from '../components/LogTable/LogPagination';
import { UsageAnalytics } from '../components/Analytics/UsageAnalytics';
import { CostAnalytics } from '../components/Analytics/CostAnalytics';
import { PerformanceCharts } from '../components/Analytics/PerformanceCharts';
import { ExportDialog } from '../components/Export/ExportDialog';
import { useAILogs, useRefreshLogs } from '../hooks/useAILogs';
import { useLogAnalytics } from '../hooks/useLogAnalytics';
import { useLogFiltering, useLogPagination } from '../hooks/useLogFiltering';
import { createEmptyLogFilter } from '../utils/log-filters';
import { calculateUsageByDay, calculatePerformanceMetrics } from '../utils/analytics-helpers';
import { getProviderColor } from '@/features/boilerplate/ai-core/utils';
import type { AIUsageFilter } from '@/features/boilerplate/ai-core/types';
import type { LogTableView } from '../types/log.types';

export function AILogsPage() {
  const [filters, setFilters] = useState<AIUsageFilter>(createEmptyLogFilter());
  const [currentPage, setCurrentPage] = useState(1);
  const [tableView, setTableView] = useState<LogTableView>('compact');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const pageSize = 50;
  const paginatedFilters = useMemo(() => ({
    ...filters,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize
  }), [filters, currentPage, pageSize]);

  const { data: logsData, isLoading, error } = useAILogs(paginatedFilters);
  const { data: analyticsData, isLoading: analyticsLoading } = useLogAnalytics(filters);
  const refreshLogs = useRefreshLogs();

  const logs = logsData?.logs || [];
  const hasMore = logsData?.hasMore || false;
  const total = logsData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const { filteredLogs, activeCount } = useLogFiltering(logs, filters);
  const { paginate } = useLogPagination(filteredLogs, pageSize);

  const stats = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      totalRequests: analyticsData.totalRequests,
      totalCost: analyticsData.totalCost,
      avgLatency: Math.round(analyticsData.avgLatency),
      successRate: analyticsData.successRate
    };
  }, [analyticsData]);

  const chartData = useMemo(() => {
    if (!logs.length) return [];
    return calculateUsageByDay(logs, 7);
  }, [logs]);

  const performanceMetrics = useMemo(() => {
    if (!logs.length) return [];
    return calculatePerformanceMetrics(logs);
  }, [logs]);

  const handleLogSelect = useCallback((logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  }, []);

  const handleLogView = useCallback((logId: string) => {
    window.location.href = `/ai-logs/${logId}`;
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLoadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(createEmptyLogFilter());
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshLogs();
    setCurrentPage(1);
  }, [refreshLogs]);

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Failed to load AI logs</div>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {/* Header with buttons on top right */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="mr-3 h-8 w-8 text-blue-600" />
              AI Usage Logs
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and analyze AI model usage, costs, and performance
            </p>
          </div>
          
          <div className="flex items-center space-x-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(true)}
              disabled={!logs.length}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            
            <Link to="/{-$locale}/ai-models">
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Models</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Requests</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {stats.successRate.toFixed(1)}% success rate
                  </div>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">${stats.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Total Cost</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${(stats.totalCost / Math.max(stats.totalRequests, 1)).toFixed(4)}/request avg
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{Math.round(stats.avgLatency)}ms</div>
                  <div className="text-sm text-gray-500">Avg Latency</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Response time
                  </div>
                </div>
                <Activity className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {stats.totalRequests - (stats.totalRequests * stats.successRate / 100)} errors
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          </div>
        )}

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="mb-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsageAnalytics 
              stats={analyticsData} 
              isLoading={analyticsLoading}
            />
            <CostAnalytics 
              stats={analyticsData} 
              isLoading={analyticsLoading}
            />
          </div>
          <PerformanceCharts
            chartData={chartData}
            metrics={performanceMetrics}
            isLoading={analyticsLoading}
          />
        </div>
      )}

        {/* Filter Toolbar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search logs by model, provider, or content..."
                    value={filters.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Advanced Filters {activeCount > 0 && `(${activeCount})`}</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {!isLoading && (
                  <span className="text-sm text-gray-500 mr-4">
                    {selectedLogs.length > 0 && `${selectedLogs.length} selected • `}
                    {logs.length} of {total.toLocaleString()} logs
                  </span>
                )}
                <ViewSwitcher view={viewMode} onViewChange={setViewMode} />
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <LogFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
              />
            )}
          </CardContent>
        </Card>

        {/* Logs Views with better spacing */}
        <div className="px-2">
          {viewMode === 'table' && (
            <Card>
              <LogTable
                logs={logs}
                isLoading={isLoading}
                view={tableView}
                selectedLogs={selectedLogs}
                onLogSelect={handleLogSelect}
                onLogView={handleLogView}
              />

              {logs.length > 0 && (
                <LogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasMore={hasMore}
                  isLoading={isLoading}
                  onPageChange={handlePageChange}
                  onLoadMore={handleLoadMore}
                />
              )}
            </Card>
          )}

          {viewMode === 'list' && (
            <>
              <LogList
                logs={logs}
                loading={isLoading}
                onRowClick={(log) => handleLogView(log.publicId)}
                virtualize={logs.length > 50}
                virtualHeight="calc(100vh - 400px)"
              />
              {logs.length > 0 && (
                <Card className="mt-4">
                  <LogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasMore={hasMore}
                    isLoading={isLoading}
                    onPageChange={handlePageChange}
                    onLoadMore={handleLoadMore}
                  />
                </Card>
              )}
            </>
          )}

          {viewMode === 'grid' && (
            <>
              <LogGrid
                logs={logs}
                loading={isLoading}
                onRowClick={(log) => handleLogView(log.publicId)}
                onViewDetails={(log) => handleLogView(log.publicId)}
                columns={3}
              />
              {logs.length > 0 && (
                <Card className="mt-4">
                  <LogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasMore={hasMore}
                    isLoading={isLoading}
                    onPageChange={handlePageChange}
                    onLoadMore={handleLoadMore}
                  />
                </Card>
              )}
            </>
          )}
        </div>

        {/* Summary Statistics */}
        {analyticsData && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Models</h3>
                <div className="space-y-3">
                  {analyticsData.topModels
                    .sort((a, b) => b.requests - a.requests)
                    .slice(0, 5)
                    .map((model) => (
                      <div key={model.modelId} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" size="sm">
                            {model.modelId.split('/')[1] || model.modelId}
                          </Badge>
                          <span className="text-sm text-gray-600">{model.modelId.split('/')[0]}</span>
                        </div>
                        <span className="text-sm font-medium">{model.requests} requests</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Provider Usage</h3>
                <div className="space-y-3">
                  {analyticsData.providerBreakdown
                    .sort((a, b) => b.requests - a.requests)
                    .map((providerData) => (
                      <div key={providerData.provider} className="flex justify-between items-center">
                        <Badge
                          className="text-white border-0"
                          style={{ backgroundColor: getProviderColor(providerData.provider) }}
                        >
                          {providerData.provider}
                        </Badge>
                        <span className="text-sm font-medium">{providerData.requests} requests</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Dialog */}
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          currentFilters={filters}
        />
      </div>
    </div>
  );
}