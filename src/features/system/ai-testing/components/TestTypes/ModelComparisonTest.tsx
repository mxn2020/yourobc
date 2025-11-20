// src/features/ai-testing/components/TestTypes/ModelComparisonTest.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { BarChart3, Play, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { ModelSelector } from '@/features/boilerplate/ai-models/components/ModelSelector';
import { Badge } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import { useTestComparison } from '../../hooks/useTestComparison';
import type { TestResult } from '@/features/boilerplate/ai-core/types';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import type { TestComparisonConfig } from '../../types/test.types';
import { formatCost } from '@/features/boilerplate/ai-core/utils';
import { useToast } from '@/features/boilerplate/notifications';

export function ModelComparisonTest() {
  const toast = useToast();
  const [baselineModelId, setBaselineModelId] = useState('');
  const [comparisonModels, setComparisonModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('Write a creative short story about a robot learning to paint.');
  const [temperature, setTemperature] = useState(0.7);
  const [results, setResults] = useState<TestResult[]>([]);

  const { data: models = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await fetch('/api/ai/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });

  const { executeComparison, loadingStates, errors } = useModelTesting();
  const { compareModelResults } = useTestComparison();

  const languageModels = useMemo(() => 
    models.filter(m => m.type === 'language' || m.type === 'multimodal'),
    [models]
  );

  const availableModels = useMemo(() => 
    languageModels.filter(m => 
      m.id !== baselineModelId && !comparisonModels.includes(m.id)
    ),
    [languageModels, baselineModelId, comparisonModels]
  );

  const comparisonResults = useMemo(() => {
    if (results.length === 0) return [];
    return compareModelResults(results);
  }, [results, compareModelResults]);

  const addComparisonModel = useCallback((modelId: string) => {
    if (modelId && !comparisonModels.includes(modelId)) {
      setComparisonModels(prev => [...prev, modelId]);
    }
  }, [comparisonModels]);

  const removeComparisonModel = useCallback((modelId: string) => {
    setComparisonModels(prev => prev.filter(id => id !== modelId));
  }, []);

  const handleRunComparison = useCallback(async () => {
    if (!baselineModelId || comparisonModels.length === 0 || !prompt.trim()) {
      toast.error('Please select baseline model, comparison models, and enter a prompt');
      return;
    }

    try {
      const config: TestComparisonConfig = {
        baselineModelId,
        comparisonModels,
        testParameters: {
          prompt: prompt.trim(),
          temperature,
          maxTokens: 500
        },
        iterations: 1
      };

      const testResults = await executeComparison(config);
      setResults(testResults);
      toast.success('Model comparison completed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Comparison failed');
    }
  }, [baselineModelId, comparisonModels, prompt, temperature, executeComparison]);

  const isRunning = loadingStates.comparison;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Model Comparison</h3>
          </div>
          <p className="text-sm text-gray-600">
            Compare performance across multiple models with the same prompt
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errors.comparison && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.comparison.message}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Baseline Model
            </label>
            <ModelSelector
              models={languageModels}
              value={baselineModelId}
              onChange={setBaselineModelId}
              placeholder="Select baseline model..."
              modelType="language"
              disabled={isRunning}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Comparison Models ({comparisonModels.length})
              </label>
              {availableModels.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addComparisonModel(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                  disabled={isRunning}
                >
                  <option value="">Add model...</option>
                  {availableModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {comparisonModels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {comparisonModels.map(modelId => {
                  const model = models.find(m => m.id === modelId);
                  return (
                    <Badge
                      key={modelId}
                      className="flex items-center space-x-1 bg-purple-100 text-purple-800"
                    >
                      <span>{model?.name || modelId}</span>
                      <button
                        onClick={() => removeComparisonModel(modelId)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                        disabled={isRunning}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-4 border border-dashed border-gray-300 rounded-lg text-center">
                No comparison models selected
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the same prompt that will be sent to all models..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
              disabled={isRunning}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Consistent</span>
              <span>Creative</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleRunComparison}
              disabled={!baselineModelId || comparisonModels.length === 0 || !prompt.trim() || isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Comparing...' : 'Run Comparison'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running model comparison...</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !isRunning && (
        <>
          {/* Performance Comparison Table */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Performance Comparison</h3>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Rank</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Model</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Provider</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Latency</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Cost</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Success Rate</th>
                      {comparisonResults.length > 0 && (
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Score</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonResults.length > 0 ? comparisonResults.map((result) => (
                      <tr key={result.modelId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={`
                              inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                              ${result.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
                                result.rank === 2 ? 'bg-gray-100 text-gray-800' : 
                                result.rank === 3 ? 'bg-orange-100 text-orange-800' : 
                                'bg-gray-50 text-gray-600'}
                            `}>
                              {result.rank}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {models.find(m => m.id === result.modelId)?.name || result.modelId}
                            {result.modelId === baselineModelId && (
                              <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">Baseline</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge size="sm" className="bg-gray-100 text-gray-800">
                            {result.provider}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {Math.round(result.metrics.avgLatency)}ms
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCost(result.metrics.avgCost)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {result.metrics.successRate.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium">{result.score.toFixed(1)}</span>
                        </td>
                      </tr>
                    )) : results.map((result, index) => (
                      <tr key={result.modelId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {models.find(m => m.id === result.modelId)?.name || result.modelId}
                            {result.modelId === baselineModelId && (
                              <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">Baseline</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge size="sm" className="bg-gray-100 text-gray-800">
                            {result.provider}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {Math.round(result.latencyMs)}ms
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCost(result.cost)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {result.status === 'completed' ? '100.0' : '0.0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Individual Model Responses */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Model Responses</h3>
              <p className="text-sm text-gray-600">Compare the actual responses from each model</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {results
                .sort((a, b) => {
                  // Sort by baseline model first, then by latency
                  if (a.modelId === baselineModelId) return -1;
                  if (b.modelId === baselineModelId) return 1;
                  return a.latencyMs - b.latencyMs;
                })
                .map((result) => {
                  const model = models.find(m => m.id === result.modelId);
                  const isBaseline = result.modelId === baselineModelId;
                  
                  return (
                    <div 
                      key={result.modelId} 
                      className={`
                        border rounded-lg p-4 
                        ${isBaseline ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}
                        ${result.status === 'failed' ? 'border-red-200 bg-red-50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">
                            {model?.name || result.modelId}
                            {isBaseline && (
                              <Badge className="ml-2 bg-purple-100 text-purple-800">Baseline</Badge>
                            )}
                          </h4>
                          <Badge size="sm" className="bg-gray-100 text-gray-800">
                            {result.provider}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{Math.round(result.latencyMs)}ms</span>
                          <span>{formatCost(result.cost)}</span>
                          <span className="flex items-center space-x-1">
                            {result.usage.inputTokens + result.usage.outputTokens} tokens
                          </span>
                        </div>
                      </div>
                      
                      {result.status === 'completed' && result.response ? (
                        <div className="bg-white border border-gray-200 rounded-md p-3">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                            {typeof result.response === 'string' ? result.response : JSON.stringify(result.response, null, 2)}
                          </pre>
                        </div>
                      ) : result.status === 'failed' ? (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-800">
                            <strong>Error:</strong> {result.error?.message || 'Test failed'}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <p className="text-sm text-gray-600">No response available</p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}