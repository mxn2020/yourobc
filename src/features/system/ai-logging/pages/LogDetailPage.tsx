// src/features/ai-logging/pages/LogDetailPage.tsx
import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Copy, Download, Trash2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Modal, ModalBody, ModalFooter } from '@/components/ui';
import { LogDetails } from '../components/LogDetails/LogDetails';
import { RequestDetails } from '../components/LogDetails/RequestDetails';
import { ResponseDetails } from '../components/LogDetails/ResponseDetails';
import { MetricsDetails } from '../components/LogDetails/MetricsDetails';
import { useAILog, useDeleteLog } from '../hooks/useAILogs';
import { useLogExport } from '../hooks/useLogExport';
import { formatLogForDisplay } from '../utils/log-formatters';
import { getProviderColor } from '@/features/system/ai-core/utils';
import { useToast } from '@/features/system/notifications';
import { parseConvexError } from '@/utils/errorHandling';

export function LogDetailPage() {
  const toast = useToast();
  const { logId } = useParams({ from: '/{-$locale}/_protected/_system/ai-logs/$logId' });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: log, isLoading, error } = useAILog(logId);
  const { exportLogs, isExporting } = useLogExport();
  const deleteLogMutation = useDeleteLog();

  const formatted = useMemo(() => {
    return log ? formatLogForDisplay(log) : null;
  }, [log]);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`Copied ${fieldName} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error: any) {
      console.error('[CopyToClipboard] error:', error);
      const { message, code } = parseConvexError(error);
      toast.error(message);

      if (code === 'VALIDATION_FAILED') {
        console.warn('[CopyToClipboard] validation failed');
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[CopyToClipboard] permission denied');
      }
    }
  };

  const handleExportSingle = async () => {
    if (!log) return;
    
    try {
      // For individual log export, create a simple JSON download
      const exportData = {
        publicId: log.publicId,
        _id: log._id,
        timestamp: log.createdAt,
        model: log.modelId,
        provider: log.provider,
        prompt: log.prompt,
        response: log.response,
        cost: log.cost,
        latencyMs: log.latencyMs,
        usage: log.usage,
        success: log.success,
        errorMessage: log.errorMessage,
        warnings: log.warnings,
        toolCalls: log.toolCalls,
        metadata: log.metadata
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `ai-log-${log.publicId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Log exported successfully');
    } catch (error: any) {
      console.error('[ExportLog] error:', error);
      const { message, code } = parseConvexError(error);
      toast.error(message);

      if (code === 'VALIDATION_FAILED') {
        console.warn('[ExportLog] validation failed');
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[ExportLog] permission denied');
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!log) return;

    try {
      await deleteLogMutation.mutateAsync({ logId: log.publicId });
      toast.success('Log deleted successfully');
      setShowDeleteModal(false);
      navigate({ to: '/{-$locale}/ai-logs' });
    } catch (error: any) {
      console.error('[DeleteLog] error:', error);
      const { message, code } = parseConvexError(error);
      toast.error(message);

      if (code === 'VALIDATION_FAILED') {
        console.warn('[DeleteLog] validation failed');
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[DeleteLog] permission denied');
      }
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'request', label: 'Request' },
    { id: 'response', label: 'Response' },
    { id: 'performance', label: 'Performance' },
    { id: 'metadata', label: 'Metadata' },
    { id: 'metrics', label: 'Metrics' }
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !log || !formatted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Log not found</h2>
          <p className="text-gray-600 mb-4">
            The log you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/{-$locale}/ai-logs">
            <Button>Back to Logs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/{-$locale}/ai-logs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Logs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Usage Log</h1>
            <div className="flex items-center space-x-3 mt-2">
              {log.success ? (
                <Badge variant="success" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Success</span>
                </Badge>
              ) : (
                <Badge variant="error" className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Failed</span>
                </Badge>
              )}
              <Badge 
                style={{ backgroundColor: getProviderColor(log.provider), color: 'white' }}
              >
                {log.provider}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {log.requestType.replace('_', ' ')}
              </Badge>
              {/* Cache Badge */}
              {(log.metadata.cache || log.metadata.cacheHit) && (
                <Badge variant="info" className="flex items-center space-x-1">
                  <Database className="h-3 w-3" />
                  <span>Cached</span>
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                {formatted.timestamp}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(log.publicId, 'Log ID')}
          >
            <Copy className="h-4 w-4 mr-2" />
            {copiedField === 'Log ID' ? 'Copied!' : 'Copy ID'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportSingle}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDeleteClick}
            disabled={deleteLogMutation.isPending}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatted.costFormatted}
            </div>
            <div className="text-sm text-gray-600">Cost</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatted.latencyFormatted}
            </div>
            <div className="text-sm text-gray-600">Latency</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatted.tokensFormatted}
            </div>
            <div className="text-sm text-gray-600">Total Tokens</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {formatted.modelName}
            </div>
            <div className="text-sm text-gray-600">Model</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <LogDetails log={log} />
        )}
        
        {activeTab === 'request' && (
          <RequestDetails log={log} />
        )}
        
        {activeTab === 'response' && (
          <ResponseDetails log={log} />
        )}
        
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Timing Analysis</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Latency:</span>
                    <span className={`font-medium ${
                      log.latencyMs < 1000 ? 'text-green-600' : 
                      log.latencyMs < 5000 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {log.latencyMs}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Performance Rating:</span>
                    <Badge variant={
                      log.latencyMs < 1000 ? 'success' : 
                      log.latencyMs < 5000 ? 'warning' : 'error'
                    }>
                      {log.latencyMs < 1000 ? 'Fast' : log.latencyMs < 5000 ? 'Normal' : 'Slow'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Request Time:</span>
                    <span className="font-medium text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.metadata.firstTokenLatency && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">First Token Latency:</span>
                      <span className="font-medium">{log.metadata.firstTokenLatency}ms</span>
                    </div>
                  )}
                  {log.metadata.tokensPerSecond && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Throughput:</span>
                      <span className="font-medium">{log.metadata.tokensPerSecond.toFixed(1)} tokens/sec</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium text-green-600">${log.cost.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost per Token:</span>
                    <span className="font-medium">
                      ${log.usage.totalTokens ? (log.cost / log.usage.totalTokens).toFixed(8) : '0.00000000'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost per Input Token:</span>
                    <span className="font-medium text-sm">
                      ${log.usage.inputTokens ? (log.cost / log.usage.inputTokens * 0.6).toFixed(8) : '0.00000000'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost per Output Token:</span>
                    <span className="font-medium text-sm">
                      ${log.usage.outputTokens ? (log.cost / log.usage.outputTokens * 0.4).toFixed(8) : '0.00000000'}
                    </span>
                  </div>
                  {(log.usage.reasoningTokens && log.usage.reasoningTokens > 0) ? (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reasoning Token Cost:</span>
                      <span className="font-medium text-orange-600">
                        ${log.usage.totalTokens ? ((log.usage.reasoningTokens / log.usage.totalTokens) * log.cost).toFixed(6) : '0.00000000'}
                      </span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Token Usage Breakdown */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Token Usage Breakdown</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {log.usage.inputTokens?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-blue-700">Input Tokens</div>
                    <div className="text-xs text-blue-600 mt-1">
                      { ( log.usage.inputTokens && log.usage.totalTokens ) ? ((log.usage.inputTokens / log.usage.totalTokens) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {log.usage.outputTokens?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-green-700">Output Tokens</div>
                    <div className="text-xs text-green-600 mt-1">
                      { ( log.usage.outputTokens && log.usage.totalTokens ) ? ((log.usage.outputTokens / log.usage.totalTokens) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {log.usage.totalTokens?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-purple-700">Total Tokens</div>
                  </div>
                </div>
                {(log.usage.reasoningTokens && log.usage.reasoningTokens > 0) ? (
                  <div className="mt-4 text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {log.usage.reasoningTokens.toLocaleString()}
                    </div>
                    <div className="text-sm text-orange-700">Reasoning Tokens</div>
                    <div className="text-xs text-orange-600 mt-1">
                      Additional reasoning computation
                    </div>
                  </div>
                ) : null}
                {(log.usage.cachedInputTokens && log.usage.cachedInputTokens > 0 ) ? (
                  <div className="mt-4 text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">
                      {log.usage.cachedInputTokens.toLocaleString()}
                    </div>
                    <div className="text-sm text-indigo-700">Cached Input Tokens</div>
                    <div className="text-xs text-indigo-600 mt-1">
                      Cost savings from caching
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Request Metadata</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Request ID:</span>
                      <div className="mt-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.metadata.requestId}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Session ID:</span>
                      <div className="mt-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.metadata.sessionId || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Trace ID:</span>
                      <div className="mt-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.metadata.traceId || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Feature:</span>
                      <div className="mt-1 text-sm text-gray-900">
                        {log.metadata.feature || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">SDK Version:</span>
                      <div className="mt-1 text-sm text-gray-900">
                        {log.metadata.sdkVersion || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Provider Request ID:</span>
                      <div className="mt-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.metadata.providerRequestId || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                {log.metadata.userAgent && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="font-medium text-gray-700">User Agent:</span>
                    <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {log.metadata.userAgent}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {log.providerMetadata && Object.keys(log.providerMetadata).length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Provider Metadata</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(JSON.stringify(log.providerMetadata, null, 2), 'Provider Metadata')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                    {JSON.stringify(log.providerMetadata, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {log.gatewayMetadata && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Gateway Metadata</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(JSON.stringify(log.gatewayMetadata, null, 2), 'Gateway Metadata')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                    {JSON.stringify(log.gatewayMetadata, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {log.responseMetadata && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Response Metadata</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(JSON.stringify(log.responseMetadata, null, 2), 'Response Metadata')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                    {JSON.stringify(log.responseMetadata, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {activeTab === 'metrics' && (
          <MetricsDetails log={log} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        title="Delete Log"
        size="sm"
        closeOnBackdrop={false}
      >
        <ModalBody>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete AI Log
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this AI log? This action cannot be undone.
              </p>
              {log && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Model: {log.modelId}</p>
                    <p className="text-gray-600">Created: {new Date(log.createdAt).toLocaleString()}</p>
                    {log.cost > 0 && (
                      <p className="text-gray-600">Cost: ${log.cost.toFixed(4)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleDeleteCancel}
            disabled={deleteLogMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteLogMutation.isPending}
          >
            {deleteLogMutation.isPending ? 'Deleting...' : 'Delete Log'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}