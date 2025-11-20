// src/features/ai-logging/components/LogTable/LogTable.tsx
import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Eye, Database, CloudSnow, Minus } from 'lucide-react';
import { Badge, Button, DataTable } from '@/components/ui';
import { getProviderColor } from '@/features/system/ai-core/utils';
import type { LogTableProps } from '../../types/log.types';
import type { TableColumn } from '@/types';
import type { AIUsageLog } from '@/features/system/ai-core/types';

export function LogTable({ 
  logs, 
  isLoading, 
  view, 
  selectedLogs, 
  onLogSelect,
  onLogView
}: LogTableProps) {
  const columns: TableColumn<AIUsageLog>[] = useMemo(() => {
    const formatTokens = (tokens?: number) => {
      if (!tokens) return '0'
      if (tokens < 1000) return tokens.toString()
      if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`
      return `${(tokens / 1000000).toFixed(1)}M`
    };

    const baseColumns: TableColumn<AIUsageLog>[] = [
      {
        key: 'createdAt',
        title: 'Timestamp',
        sortable: true,
        width: '180px',
        render: (value: string | Date) => (
          <div className="text-sm">
            <div className="font-medium">{new Date(value).toLocaleDateString()}</div>
            <div className="text-gray-500">{new Date(value).toLocaleTimeString()}</div>
          </div>
        )
      },
      {
        key: 'success',
        title: 'Status',
        width: '140px',
        render: (value: boolean, record: AIUsageLog) => (
          <div className="flex items-center space-x-2">
            {value ? (
              <Badge variant="success" className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Success</span>
              </Badge>
            ) : (
              <Badge variant="error" className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Failed</span>
              </Badge>
            )}
            {record.warnings && record.warnings.length > 0 && (
              <Badge variant="warning" size="sm">
                {record.warnings.length} warning{record.warnings.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )
      },
      {
        key: 'modelId',
        title: 'Model',
        width: '180px',
        render: (value: string, record: AIUsageLog) => (
          <div className="min-w-0">
            <div className="font-medium text-sm truncate" title={value}>
              {value.split('/')[1] || value}
            </div>
            <Badge 
              size="sm" 
              className="mt-1 text-white border-0"
              style={{ backgroundColor: getProviderColor(record.provider) }}
            >
              {record.provider}
            </Badge>
          </div>
        )
      },
      {
        key: 'requestType',
        title: 'Type',
        width: '120px',
        render: (value: string) => (
          <Badge variant="secondary" className="capitalize" size="sm">
            {value.replace('_', ' ')}
          </Badge>
        )
      },
      {
        key: 'cache',
        title: 'Cache',
        width: '100px',
        render: (_, record: AIUsageLog) => {
          const metadata = record.metadata;
          
          // Check for application cache
          if (metadata?.cache?.applicationCache?.hit) {
            return (
              <Badge variant="success" size="sm" className="flex items-center space-x-1">
                <Database className="h-3 w-3" />
                <span>App</span>
              </Badge>
            );
          }
          
          // Check for provider cache
          if (metadata?.cache?.providerCache?.hit) {
            return (
              <Badge variant="info" size="sm" className="flex items-center space-x-1">
                <CloudSnow className="h-3 w-3" />
                <span>{metadata.cache.providerCache.provider === 'anthropic' ? 'ANT' : 
                       metadata.cache.providerCache.provider === 'openai' ? 'OAI' : 'PVD'}</span>
              </Badge>
            );
          }
          
          // Check for legacy cache hit
          if (metadata?.cacheHit || metadata?.cache?.cacheHit) {
            return (
              <Badge variant="secondary" size="sm" className="flex items-center space-x-1">
                <Database className="h-3 w-3" />
                <span>Hit</span>
              </Badge>
            );
          }
          
          // No cache
          return (
            <Badge variant="outline" size="sm" className="flex items-center space-x-1 text-gray-400">
              <Minus className="h-3 w-3" />
              <span>None</span>
            </Badge>
          );
        }
      },
      {
        key: 'usage',
        title: 'Tokens',
        width: '140px',
        render: (value: any) => (
          <div className="text-sm">
            <div className="font-medium">{formatTokens(value.totalTokens)}</div>
            <div className="text-gray-500 text-xs">
              In: {formatTokens(value.inputTokens)} | Out: {formatTokens(value.outputTokens)}
            </div>
            {value.reasoningTokens && (
              <div className="text-orange-600 text-xs">
                Reasoning: {formatTokens(value.reasoningTokens)}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'cost',
        title: 'Cost',
        width: '100px',
        render: (value: number) => (
          <span className="font-medium text-green-600">
            ${value.toFixed(4)}
          </span>
        )
      },
      {
        key: 'latencyMs',
        title: 'Latency',
        width: '100px',
        render: (value: number) => (
          <div className="text-sm">
            <div className="font-medium">{value}ms</div>
            <div className={`text-xs ${
              value < 1000 ? 'text-green-600' : 
              value < 5000 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {value < 1000 ? 'Fast' : value < 5000 ? 'Normal' : 'Slow'}
            </div>
          </div>
        )
      }
    ];

    if (view === 'detailed') {
      baseColumns.push(
        {
          key: 'prompt',
          title: 'Prompt',
          width: '200px',
          render: (value: string) => (
            <div className="text-sm text-gray-900 truncate max-w-xs" title={value}>
              {value.length > 100 ? `${value.substring(0, 100)}...` : value}
            </div>
          )
        },
        {
          key: 'warnings',
          title: 'Warnings',
          width: '80px',
          render: (_, record: AIUsageLog) => (
            <div className="text-center">
              {record.warnings && record.warnings.length > 0 && (
                <Badge variant="warning" size="sm">
                  {record.warnings.length}
                </Badge>
              )}
            </div>
          )
        }
      );
    }

    baseColumns.push({
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_, record: AIUsageLog) => (
        <div className="flex items-center space-x-2">
          <Link to="/{-$locale}/ai-logs/$logId" params={{ logId: record.publicId }}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Eye className="h-3 w-3" />
              <span>View</span>
            </Button>
          </Link>
        </div>
      )
    });

    return baseColumns;
  }, [view]);

  const tableData = useMemo(() => {
    return logs.map(log => ({
      ...log,
      id: log.publicId
    }));
  }, [logs]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <DataTable<AIUsageLog>
      data={tableData}
      columns={columns}
      emptyMessage="No AI usage logs found"
      className="min-w-full"
      selectedRows={selectedLogs}
      onSelectionChange={onLogSelect ? (ids) => {
        // Handle selection - for now just select/deselect first ID
        if (ids.length > selectedLogs.length) {
          // Adding selection
          const newId = ids.find(id => !selectedLogs.includes(id));
          if (newId && onLogSelect) onLogSelect(newId);
        } else {
          // Removing selection
          const removedId = selectedLogs.find(id => !ids.includes(id));
          if (removedId && onLogSelect) onLogSelect(removedId);
        }
      } : undefined}
      onRowClick={onLogView ? (record) => onLogView(record.publicId) : undefined}
    />
  );
}