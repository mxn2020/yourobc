// src/features/ai-logging/components/LogDetails/ResponseDetails.tsx
import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';
import { Copy, Check, Settings } from 'lucide-react';
import { formatLogMetrics } from '../../utils/log-formatters';
import type { AIUsageLog } from '@/features/boilerplate/ai-core/types';

interface ResponseDetailsProps {
  log: AIUsageLog;
}

export function ResponseDetails({ log }: ResponseDetailsProps) {
  const [copied, setCopied] = useState(false);
  const metrics = formatLogMetrics(log);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Response Details</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Response Text */}
        {log.response && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Generated Response</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(log.response!)}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-48 overflow-y-auto">
              <pre className="text-sm text-green-800 whitespace-pre-wrap">
                {log.response}
              </pre>
            </div>
          </div>
        )}

        {/* Token Usage */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Token Usage</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{metrics.inputTokens}</div>
              <div className="text-xs text-blue-700">Input</div>
            </div>
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{metrics.outputTokens}</div>
              <div className="text-xs text-green-700">Output</div>
            </div>
            <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">{metrics.totalTokens}</div>
              <div className="text-xs text-purple-700">Total</div>
            </div>
          </div>

          {/* Additional Token Info */}
          {(metrics.reasoningTokens || metrics.cachedTokens || metrics.efficiency) && (
            <div className="mt-3 space-y-2">
              {metrics.reasoningTokens && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Reasoning Tokens:</span>
                  <span className="ml-2 text-orange-600">{metrics.reasoningTokens}</span>
                </div>
              )}
              {metrics.cachedTokens && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Cached Tokens:</span>
                  <span className="ml-2 text-green-600">{metrics.cachedTokens}</span>
                </div>
              )}
              {metrics.efficiency && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Efficiency:</span>
                  <span className="ml-2 text-green-600">{metrics.efficiency}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Finish Reason */}
        {log.finishReason && (
          <div>
            <label className="text-sm font-medium text-gray-700">Finish Reason</label>
            <div className="mt-1">
              <Badge variant="secondary" className="capitalize">
                {log.finishReason.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        )}

        {/* Tool Calls */}
        {log.toolCalls?.length && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tool Calls ({log.toolCalls.length})
            </label>
            <div className="space-y-2">
              {log.toolCalls.map((call, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{call.name}</div>
                    <Badge variant={call.providerExecuted ? 'success' : 'secondary'} size="sm">
                      {call.providerExecuted ? 'Provider' : 'Client'}
                    </Badge>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-gray-600 mb-1">Input:</div>
                    <pre className="bg-gray-100 p-2 rounded text-gray-800 overflow-x-auto">
                      {JSON.stringify(call.input, null, 2)}
                    </pre>
                    {call.output && (
                      <>
                        <div className="font-medium text-gray-600 mb-1 mt-2">Output:</div>
                        <pre className="bg-gray-100 p-2 rounded text-gray-800 overflow-x-auto">
                          {JSON.stringify(call.output, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {metrics.tokensPerSecond && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Performance</label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens per Second:</span>
                <span className="font-medium">{metrics.tokensPerSecond}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}