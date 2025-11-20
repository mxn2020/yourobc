// src/features/ai-logging/components/LogTable/LogRow.tsx
import { useMemo } from 'react';
import { Badge, Button, Checkbox } from '@/components/ui';
import { Eye, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatLogForDisplay } from '../../utils/log-formatters';
import { getProviderColor } from '@/features/boilerplate/ai-core/utils';
import type { LogRowProps } from '../../types/log.types';

export function LogRow({ log, isSelected, view, onSelect, onView }: LogRowProps) {
  const formatted = useMemo(() => formatLogForDisplay(log), [log]);

  const formatTokens = (tokens?: number) => {
    if (!tokens) return '0'
    if (tokens < 1000) return tokens.toString()
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`
    return `${(tokens / 1000000).toFixed(1)}M`
  };

  const handleRowClick = () => {
    onView(log.publicId);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(log.publicId);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(log.publicId);
  };

  return (
    <tr 
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={handleRowClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isSelected}
            onChange={(checked) => onSelect(log.publicId)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="font-medium">{new Date(log.createdAt).toLocaleDateString()}</div>
        <div className="text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {log.success ? (
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
          {formatted.hasWarnings && (
            <Badge variant="warning" size="sm">
              {formatted.warningCount} warning{formatted.warningCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="min-w-0">
          <div className="font-medium text-sm truncate" title={log.modelId}>
            {log.modelId.split('/')[1] || log.modelId}
          </div>
          <Badge 
            size="sm" 
            className="mt-1 text-white border-0"
            style={{ backgroundColor: getProviderColor(log.provider) }}
          >
            {log.provider}
          </Badge>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="secondary" className="capitalize" size="sm">
          {log.requestType.replace('_', ' ')}
        </Badge>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="font-medium">{formatTokens(log.usage.totalTokens)}</div>
        <div className="text-gray-500 text-xs">
          In: {formatTokens(log.usage.inputTokens)} | Out: {formatTokens(log.usage.outputTokens)}
        </div>
        {log.usage.reasoningTokens && (
          <div className="text-orange-600 text-xs">
            Reasoning: {formatTokens(log.usage.reasoningTokens)}
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-medium text-green-600">
          ${log.cost.toFixed(4)}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="font-medium">{log.latencyMs}ms</div>
        <div className={`text-xs ${
          log.latencyMs < 1000 ? 'text-green-600' : 
          log.latencyMs < 5000 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {log.latencyMs < 1000 ? 'Fast' : log.latencyMs < 5000 ? 'Normal' : 'Slow'}
        </div>
      </td>

      {view === 'detailed' && (
        <>
          <td className="px-6 py-4 max-w-xs">
            <div className="text-sm text-gray-900 truncate" title={log.prompt}>
              {formatted.promptPreview}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center">
            {formatted.hasWarnings && (
              <Badge variant="warning" size="sm">
                {formatted.warningCount}
              </Badge>
            )}
          </td>
        </>
      )}

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center space-x-1"
            onClick={(e) => {
              e.stopPropagation();
              onView(log.publicId);
            }}
          >
            <Eye className="h-3 w-3" />
            <span>View</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}