// src/features/ai-testing/components/TestTypes/BatchTest.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Grid3x3, Play, Plus, Trash2, Upload } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import type { TestResult } from '@/features/boilerplate/ai-core/types';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import type { BatchTestConfig } from '../../types/test.types';
import { useToast } from '@/features/boilerplate/notifications';

interface TestCase {
  name: string;
  prompt: string;
  expectedOutput?: string;
}

export function BatchTest() {
  const toast = useToast();
  const [modelIds, setModelIds] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { name: 'Simple Question', prompt: 'What is 2+2?' },
    { name: 'Creative Task', prompt: 'Write a haiku about technology.' }
  ]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(300);
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

  const { executeBatchTest, loadingStates, errors } = useModelTesting();

  const languageModels = useMemo(() => 
    models.filter(m => m.type === 'language' || m.type === 'multimodal'),
    [models]
  );

  const availableModels = useMemo(() => 
    languageModels.filter(m => !modelIds.includes(m.id)),
    [languageModels, modelIds]
  );

  const totalTests = useMemo(() => 
    modelIds.length * testCases.length,
    [modelIds.length, testCases.length]
  );

  const addModel = useCallback((modelId: string) => {
    if (modelId && !modelIds.includes(modelId)) {
      setModelIds(prev => [...prev, modelId]);
    }
  }, [modelIds]);

  const removeModel = useCallback((modelId: string) => {
    setModelIds(prev => prev.filter(id => id !== modelId));
  }, []);

  const addTestCase = useCallback(() => {
    setTestCases(prev => [...prev, { name: `Test Case ${prev.length + 1}`, prompt: '' }]);
  }, []);

  const removeTestCase = useCallback((index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateTestCase = useCallback((index: number, field: keyof TestCase, value: string) => {
    setTestCases(prev => prev.map((tc, i) => 
      i === index ? { ...tc, [field]: value } : tc
    ));
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (file.name.endsWith('.csv')) {
          const csvCases = lines.slice(1).map((line, index) => {
            const [name, prompt, expected] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
            return {
              name: name || `Imported Case ${index + 1}`,
              prompt: prompt || '',
              expectedOutput: expected || undefined
            };
          }).filter(tc => tc.prompt);
          
          setTestCases(csvCases);
          toast.success(`Imported ${csvCases.length} test cases from CSV`);
        } else if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData)) {
            const jsonCases = jsonData.map((item, index) => ({
              name: item.name || `Imported Case ${index + 1}`,
              prompt: item.prompt || '',
              expectedOutput: item.expectedOutput || item.expected || undefined
            })).filter(tc => tc.prompt);
            
            setTestCases(jsonCases);
            toast.success(`Imported ${jsonCases.length} test cases from JSON`);
          }
        } else {
          const textCases = lines.map((line, index) => ({
            name: `Text Case ${index + 1}`,
            prompt: line.trim(),
            expectedOutput: undefined
          })).filter(tc => tc.prompt);
          
          setTestCases(textCases);
          toast.success(`Imported ${textCases.length} test cases from text file`);
        }
      } catch (error) {
        toast.error('Failed to parse file');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleRunBatch = useCallback(async () => {
    if (modelIds.length === 0 || testCases.length === 0) {
      toast.error('Please select models and add test cases');
      return;
    }

    const invalidCases = testCases.filter(tc => !tc.name.trim() || !tc.prompt.trim());
    if (invalidCases.length > 0) {
      toast.error('All test cases must have a name and prompt');
      return;
    }

    try {
      const config: BatchTestConfig = {
        modelIds,
        testCases,
        parameters: {
          temperature,
          maxTokens
        }
      };

      const testResults = await executeBatchTest(config);
      setResults(testResults);
      toast.success(`Batch test completed: ${testResults.length} tests run`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Batch test failed');
    }
  }, [modelIds, testCases, temperature, maxTokens, executeBatchTest]);

  const groupedResults = useMemo(() => {
    if (results.length === 0) return {};
    
    return results.reduce((groups, result) => {
      const key = `${result.modelId}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(result);
      return groups;
    }, {} as Record<string, TestResult[]>);
  }, [results]);

  const isRunning = loadingStates.batchTest;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Grid3x3 className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Batch Testing</h3>
          </div>
          <p className="text-sm text-gray-600">
            Run multiple test cases across multiple models efficiently
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errors.batchTest && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.batchTest.message}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Models ({modelIds.length})
              </label>
              {availableModels.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addModel(e.target.value);
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

            {modelIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {modelIds.map(modelId => {
                  const model = models.find(m => m.id === modelId);
                  return (
                    <Badge
                      key={modelId}
                      className="flex items-center space-x-1 bg-orange-100 text-orange-800"
                    >
                      <span>{model?.name || modelId}</span>
                      <button
                        onClick={() => removeModel(modelId)}
                        className="hover:bg-orange-200 rounded-full p-0.5"
                        disabled={isRunning}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-4 border border-dashed border-gray-300 rounded-lg text-center">
                No models selected
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Test Cases ({testCases.length})
              </label>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isRunning}
                  />
                  <Button variant="ghost" size="sm" className="flex items-center" disabled={isRunning}>
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                </label>
                <Button variant="ghost" size="sm" onClick={addTestCase} disabled={isRunning}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Case
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {testCases.map((testCase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Input
                      value={testCase.name}
                      onChange={(e) => updateTestCase(index, 'name', e.target.value)}
                      placeholder="Test case name"
                      className="font-medium"
                      disabled={isRunning}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isRunning}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prompt</label>
                      <textarea
                        value={testCase.prompt}
                        onChange={(e) => updateTestCase(index, 'prompt', e.target.value)}
                        placeholder="Enter test prompt..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        disabled={isRunning}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Expected Output (Optional)</label>
                      <Input
                        value={testCase.expectedOutput || ''}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        placeholder="Expected response for validation..."
                        disabled={isRunning}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {testCases.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Grid3x3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No test cases configured</p>
                <p className="text-sm text-gray-400">Add cases manually or import from a file</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens
              </label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                min="1"
                max="2000"
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Will run <span className="font-medium text-gray-900">{totalTests}</span> total tests
              ({modelIds.length} models × {testCases.length} test cases)
            </div>
            
            <Button
              onClick={handleRunBatch}
              disabled={modelIds.length === 0 || testCases.length === 0 || isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running Batch...' : 'Run Batch Test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running batch tests...</p>
          </CardContent>
        </Card>
      )}

      {Object.keys(groupedResults).length > 0 && !isRunning && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Batch Results Summary</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                  <div className="text-sm text-blue-700">Total Tests</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => r.status === 'failed').length}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {results.reduce((sum, r) => sum + r.cost, 0).toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-700">Total Cost ($)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(groupedResults).map(([modelId, modelResults]) => {
            const model = models.find(m => m.id === modelId);
            const completed = modelResults.filter(r => r.status === 'completed');
            const avgLatency = completed.length > 0 
              ? completed.reduce((sum, r) => sum + r.latencyMs, 0) / completed.length 
              : 0;
            const totalCost = modelResults.reduce((sum, r) => sum + r.cost, 0);

            return (
              <Card key={modelId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-900">
                      {model?.name || modelId}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Avg: {Math.round(avgLatency)}ms</span>
                      <span>Cost: ${totalCost.toFixed(4)}</span>
                      <span>Success: {completed.length}/{modelResults.length}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-900">Test Case</th>
                          <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Status</th>
                          <th className="text-right py-2 px-3 text-sm font-medium text-gray-900">Latency</th>
                          <th className="text-right py-2 px-3 text-sm font-medium text-gray-900">Cost</th>
                          <th className="text-right py-2 px-3 text-sm font-medium text-gray-900">Tokens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modelResults.map((result) => {
                          const testCase = testCases.find(tc => result.prompt.includes(tc.prompt.substring(0, 50)));
                          return (
                            <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-3 text-sm text-gray-900">
                                {testCase?.name || 'Unknown Test'}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <Badge className={`text-xs ${
                                  result.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  result.status === 'failed' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {result.status}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-sm text-right">
                                {Math.round(result.latencyMs)}ms
                              </td>
                              <td className="py-2 px-3 text-sm text-right">
                                ${result.cost.toFixed(4)}
                              </td>
                              <td className="py-2 px-3 text-sm text-right">
                                {result.usage.totalTokens}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}