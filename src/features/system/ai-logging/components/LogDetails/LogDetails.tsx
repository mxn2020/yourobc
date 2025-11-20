// src/features/ai-logging/components/LogDetails/LogDetails.tsx
import { useMemo } from 'react';
import { Badge, Card, CardContent, CardHeader } from '@/components/ui';
import { RequestDetails } from './RequestDetails';
import { ResponseDetails } from './ResponseDetails';
import { MetricsDetails } from './MetricsDetails';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { formatLogForDisplay } from '../../utils/log-formatters';
import { getProviderColor } from '@/features/system/ai-core/utils';
import type { AIUsageLog } from '@/features/system/ai-core/types';

interface LogDetailsProps {
  log: AIUsageLog;
}

export function LogDetails({ log }: LogDetailsProps) {
  const formatted = useMemo(() => formatLogForDisplay(log), [log]);

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {log.success ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {log.success ? 'Successful' : 'Failed'} AI Request
                </h2>
                <p className="text-sm text-gray-500">
                  ID: {formatted.displayId} • {formatted.timestamp}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                style={{ backgroundColor: getProviderColor(log.provider), color: 'white' }}
              >
                {log.provider}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {log.requestType.replace('_', ' ')}
              </Badge>
              {formatted.hasWarnings && (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {formatted.warningCount} warning{formatted.warningCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-700">Model</div>
              <div className="text-lg font-semibold text-gray-900">{formatted.modelName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Cost</div>
              <div className="text-lg font-semibold text-green-600">{formatted.costFormatted}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Tokens</div>
              <div className="text-lg font-semibold text-purple-600">{formatted.tokensFormatted}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Latency</div>
              <div className="text-lg font-semibold text-blue-600">{formatted.latencyFormatted}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {!log.success && log.errorMessage && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-red-600 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Details
            </h3>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-medium text-red-800 mb-2">
                {log.errorType || 'Error'}
              </div>
              <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">
                {log.errorMessage}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings Display */}
      {formatted.hasWarnings && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-yellow-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Warnings ({formatted.warningCount})
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {log.warnings.map((warning, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="font-medium text-yellow-800">
                    {typeof warning === 'string' ? warning : warning.type || 'Warning'}
                  </div>
                  {typeof warning === 'object' && 'details' in warning && warning.details && (
                    <div className="text-sm text-yellow-700 mt-1">{warning.details}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RequestDetails log={log} />
        <ResponseDetails log={log} />
      </div>

      <MetricsDetails log={log} />
    </div>
  );
}