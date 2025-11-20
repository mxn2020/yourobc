// src/features/ai-testing/components/TestRunner/TestResults.tsx
import React, { useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Zap, DollarSign, Copy, Check } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import type { TestResult } from '@/features/system/ai-core/types';
import { formatTestResult, formatValidationScore } from '../../utils/test-formatters';
import { useToast } from '@/features/system/notifications';

interface TestResultsProps {
  result: TestResult;
}

export function TestResults({ result }: TestResultsProps) {
  const toast = useToast();
  const [copied, setCopied] = React.useState(false);
  
  const formatted = useMemo(() => formatTestResult(result), [result]);
  const validationFormatted = useMemo(() => 
    formatValidationScore(result.validationResults?.score), 
    [result.validationResults?.score]
  );

  const handleCopyResponse = async () => {
    if (!result.response) return;
    
    try {
      await navigator.clipboard.writeText(
        typeof result.response === 'string' 
          ? result.response 
          : JSON.stringify(result.response, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Response copied to clipboard');
    } catch {
      toast.error('Failed to copy response');
    }
  };

  const StatusIcon = result.status === 'completed' ? CheckCircle : 
                    result.status === 'failed' ? XCircle : Clock;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <StatusIcon className={`h-6 w-6 ${
                result.status === 'completed' ? 'text-green-600' : 
                result.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
                <p className="text-sm text-gray-600">
                  {result.modelId} • {formatted.statusDisplay.label}
                </p>
              </div>
            </div>
            
            <Badge className={formatted.statusDisplay.color}>
              {formatted.statusDisplay.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{formatted.latencyText}</div>
              <div className="text-sm text-gray-600">Latency</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatted.tokensText}</div>
              <div className="text-sm text-gray-600">Tokens</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatted.costText}</div>
              <div className="text-sm text-gray-600">Cost</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${validationFormatted.color}`}>
                {validationFormatted.text}
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Input Tokens</div>
              <div className="font-medium">{result.usage.inputTokens.toLocaleString()}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Output Tokens</div>
              <div className="font-medium">{result.usage.outputTokens.toLocaleString()}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Tokens</div>
              <div className="font-medium">{result.usage.totalTokens.toLocaleString()}</div>
            </div>
            
            {result.usage.cachedInputTokens && result.usage.cachedInputTokens > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Cached Tokens</div>
                <div className="font-medium text-green-600">
                  {result.usage.cachedInputTokens.toLocaleString()}
                </div>
              </div>
            )}
            
            {result.firstTokenLatencyMs && (
              <div>
                <div className="text-sm text-gray-600 mb-1">First Token</div>
                <div className="font-medium">{result.firstTokenLatencyMs}ms</div>
              </div>
            )}
            
            {result.tokensPerSecond && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Tokens/Second</div>
                <div className="font-medium">{result.tokensPerSecond.toFixed(1)}</div>
              </div>
            )}
          </div>

          {result.finishReason && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Finish Reason</div>
              <Badge variant="secondary">{result.finishReason}</Badge>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Warnings</div>
              <div className="space-y-1">
                {result.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    {typeof warning === 'object' && 'details' in warning ? warning.details || warning.type : String(warning)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result.response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Response</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyResponse}
                className="flex items-center space-x-1"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                {typeof result.response === 'string' 
                  ? result.response 
                  : JSON.stringify(result.response, null, 2)
                }
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {result.validationResults && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold text-gray-900">Validation Results</h4>
          </CardHeader>
          
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Score</span>
                <span className={`font-bold ${validationFormatted.color}`}>
                  {validationFormatted.text}
                </span>
              </div>
              
              <div className={`w-full bg-gray-200 rounded-full h-2`}>
                <div 
                  className={`h-2 rounded-full ${
                    (result.validationResults.score || 0) >= 90 ? 'bg-green-500' :
                    (result.validationResults.score || 0) >= 75 ? 'bg-blue-500' :
                    (result.validationResults.score || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.validationResults.score || 0}%` }}
                />
              </div>
            </div>

            {result.validationResults.checks && result.validationResults.checks.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Validation Checks</div>
                <div className="space-y-2">
                  {result.validationResults.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {check.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">{check.name}</span>
                      </div>
                      
                      {(check.expected !== undefined || check.actual !== undefined) && (
                        <div className="text-xs text-gray-600">
                          Expected: {String(check.expected)} | Actual: {String(check.actual)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result.error && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold text-red-900">Error Details</h4>
          </CardHeader>
          
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800 mb-2">
                {result.error.message}
              </div>
              
              {result.error.details?.technicalDetails && result.error.details.technicalDetails !== result.error.message && (
                <div className="text-xs text-red-600 mb-2">
                  <span className="font-medium">Technical Details:</span> {result.error.details.technicalDetails}
                </div>
              )}
              
              <div className="flex gap-4 text-xs text-red-500">
                {result.error.type && <span>Type: {result.error.type}</span>}
                {result.error.code && <span>Code: {result.error.code}</span>}
                {result.error.details?.provider && <span>Provider: {result.error.details.provider}</span>}
              </div>
              
              {result.error.details?.originalMessage && result.error.details.originalMessage !== result.error.message && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-700">
                    Show Raw Error
                  </summary>
                  <div className="mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded font-mono">
                    {result.error.details.originalMessage}
                  </div>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}