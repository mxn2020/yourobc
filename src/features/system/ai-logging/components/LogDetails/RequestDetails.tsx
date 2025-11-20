// src/features/ai-logging/components/LogDetails/RequestDetails.tsx
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { Copy, Check } from 'lucide-react';
import type { AIUsageLog } from '@/features/system/ai-core/types';

interface RequestDetailsProps {
  log: AIUsageLog;
}

export function RequestDetails({ log }: RequestDetailsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Prompt */}
        {log.systemPrompt && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">System Prompt</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(log.systemPrompt!, 'system')}
              >
                {copied === 'system' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-h-32 overflow-y-auto">
              <pre className="text-sm text-blue-800 whitespace-pre-wrap font-mono">
                {log.systemPrompt}
              </pre>
            </div>
          </div>
        )}

        {/* User Prompt */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">User Prompt</label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(log.prompt, 'prompt')}
            >
              {copied === 'prompt' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {log.prompt}
            </pre>
          </div>
        </div>

        {/* Parameters */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Parameters</label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {log.parameters.temperature !== undefined && (
                <div>
                  <span className="font-medium text-gray-600">Temperature:</span>
                  <span className="ml-2 text-gray-900">{log.parameters.temperature}</span>
                </div>
              )}
              {log.parameters.maxTokens !== undefined && (
                <div>
                  <span className="font-medium text-gray-600">Max Tokens:</span>
                  <span className="ml-2 text-gray-900">{log.parameters.maxTokens}</span>
                </div>
              )}
              {log.parameters.topP !== undefined && (
                <div>
                  <span className="font-medium text-gray-600">Top P:</span>
                  <span className="ml-2 text-gray-900">{log.parameters.topP}</span>
                </div>
              )}
              {log.parameters.topK !== undefined && (
                <div>
                  <span className="font-medium text-gray-600">Top K:</span>
                  <span className="ml-2 text-gray-900">{log.parameters.topK}</span>
                </div>
              )}
              {log.parameters.frequencyPenalty !== undefined && (
                <div>
                  <span className="font-medium text-gray-600">Freq Penalty:</span>
                  <span className="ml-2 text-gray-900">{log.parameters.frequencyPenalty}</span>
                </div>
              )}
              {log.parameters.presencePenalty !== undefined && (
                <div>
                  <span className="font-medium text-gray-600">Pres Penalty:</span>
                  <span className="ml-2 text-gray-900">{log.parameters.presencePenalty}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Parameters */}
        {(log.parameters.stopSequences?.length || log.parameters.responseFormat || log.parameters.enableCaching) && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Additional Settings</label>
            <div className="space-y-2">
              {log.parameters.stopSequences?.length && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Stop Sequences:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {log.parameters.stopSequences.map((seq, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                        "{seq}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {log.parameters.responseFormat && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Response Format:</span>
                  <span className="ml-2 text-gray-900">{log.parameters.responseFormat.type}</span>
                </div>
              )}
              {log.parameters.enableCaching && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Caching:</span>
                  <span className="ml-2 text-green-600">Enabled</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}