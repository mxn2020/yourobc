// src/features/ai-testing/components/TestTypes/ParameterTuningTest.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Sliders, Play, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { ModelSelector } from '@/features/boilerplate/ai-models/components/ModelSelector';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import { useTestComparison } from '../../hooks/useTestComparison';
import type { TestResult } from '@/features/boilerplate/ai-core/types';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import type { ParameterTuningConfig } from '../../types/test.types';
import { useToast } from '@/features/boilerplate/notifications';

interface ParameterConfig {
  name: keyof TestResult['parameters'];
  values: unknown[];
}

export function ParameterTuningTest() {
  const toast = useToast();
  const [modelId, setModelId] = useState('');
  const [prompt, setPrompt] = useState('Explain quantum computing in simple terms that a beginner could understand.');
  const [parameters, setParameters] = useState<ParameterConfig[]>([
    { name: 'temperature', values: [0.1, 0.5, 0.7, 1.0] }
  ]);
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

  const { executeParameterTuning, loadingStates, errors } = useModelTesting();
  const { analyzeParameterTuning, findOptimalParameters } = useTestComparison();

  const languageModels = useMemo(() => 
    models.filter(m => m.type === 'language' || m.type === 'multimodal'),
    [models]
  );

  const parameterOptions = useMemo(() => [
    { value: 'temperature', label: 'Temperature' },
    { value: 'maxTokens', label: 'Max Tokens' },
    { value: 'topP', label: 'Top P' },
    { value: 'topK', label: 'Top K' },
    { value: 'frequencyPenalty', label: 'Frequency Penalty' },
    { value: 'presencePenalty', label: 'Presence Penalty' }
  ], []);

  const tuningResults = useMemo(() => {
    if (results.length === 0) return [];
    return parameters.map(param => 
      analyzeParameterTuning(results, param.name)
    );
  }, [results, parameters, analyzeParameterTuning]);

  const optimalParameters = useMemo(() => {
    if (tuningResults.length === 0) return {};
    return findOptimalParameters(tuningResults.flat());
  }, [tuningResults, findOptimalParameters]);

  const addParameter = useCallback(() => {
    const usedParams = parameters.map(p => p.name);
    const availableParam = parameterOptions.find(opt => !usedParams.includes(opt.value as keyof TestResult['parameters']));
    
    if (availableParam) {
      const paramName = availableParam.value as keyof TestResult['parameters'];
      const defaultValues = getDefaultValues(paramName);
      setParameters(prev => [...prev, { name: paramName, values: defaultValues }]);
    }
  }, [parameters, parameterOptions]);

  const removeParameter = useCallback((index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateParameterValues = useCallback((index: number, valuesStr: string) => {
    const values = valuesStr.split(',').map(v => {
      const trimmed = v.trim();
      const num = parseFloat(trimmed);
      return isNaN(num) ? trimmed : num;
    }).filter(v => v !== '');
    
    setParameters(prev => prev.map((param, i) => 
      i === index ? { ...param, values } : param
    ));
  }, []);

  const handleRunTuning = useCallback(async () => {
    if (!modelId || !prompt.trim() || parameters.length === 0) {
      toast.error('Please select a model, enter a prompt, and add parameters to tune');
      return;
    }

    if (parameters.some(p => p.values.length === 0)) {
      toast.error('All parameters must have at least one value');
      return;
    }

    try {
      const config: ParameterTuningConfig = {
        modelId,
        testPrompt: prompt.trim(),
        baseParameters: {
          maxTokens: 300,
          temperature: 0.7
        },
        tuningParameters: parameters
      };

      const testResults = await executeParameterTuning(config);
      setResults(testResults);
      toast.success('Parameter tuning completed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Parameter tuning failed');
    }
  }, [modelId, prompt, parameters, executeParameterTuning]);

  const isRunning = loadingStates.parameterTuning;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Parameter Tuning</h3>
          </div>
          <p className="text-sm text-gray-600">
            Find optimal parameter values by testing different combinations
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errors.parameterTuning && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.parameterTuning.message}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <ModelSelector
              models={languageModels}
              value={modelId}
              onChange={setModelId}
              modelType="language"
              placeholder="Select model to tune..."
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter prompt for parameter tuning..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isRunning}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Parameters to Tune</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={addParameter}
                disabled={parameters.length >= parameterOptions.length || isRunning}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Parameter
              </Button>
            </div>

            <div className="space-y-4">
              {parameters.map((param, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-medium text-gray-900">
                      {parameterOptions.find(opt => opt.value === param.name)?.label || param.name}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameter(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isRunning}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Values (comma-separated)
                    </label>
                    <Input
                      value={param.values.join(', ')}
                      onChange={(e) => updateParameterValues(index, e.target.value)}
                      placeholder="0.1, 0.5, 0.7, 1.0"
                      disabled={isRunning}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {param.values.length} values will generate {param.values.length} tests
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {parameters.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Sliders className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No parameters configured for tuning</p>
                <p className="text-sm text-gray-400">Click "Add Parameter" to get started</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleRunTuning}
              disabled={!modelId || !prompt.trim() || parameters.length === 0 || isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Tuning...' : 'Start Tuning'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running parameter tuning...</p>
          </CardContent>
        </Card>
      )}

      {tuningResults.length > 0 && !isRunning && (
        <div className="space-y-6">
          {Object.keys(optimalParameters).length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Optimal Parameters</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(optimalParameters).map(([param, value]) => (
                    <div key={param} className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm text-green-600 mb-1">
                        {parameterOptions.find(opt => opt.value === param)?.label || param}
                      </div>
                      <div className="text-lg font-semibold text-green-900">
                        {String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tuningResults.map((paramResults, paramIndex) => {
            const param = parameters[paramIndex];
            if (!paramResults.length) return null;

            return (
              <Card key={paramIndex}>
                <CardHeader>
                  <h4 className="text-md font-semibold text-gray-900">
                    {parameterOptions.find(opt => opt.value === param.name)?.label} Results
                  </h4>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-900">Value</th>
                          <th className="text-right py-2 px-3 text-sm font-medium text-gray-900">Latency</th>
                          <th className="text-right py-2 px-3 text-sm font-medium text-gray-900">Cost</th>
                          <th className="text-right py-2 px-3 text-sm font-medium text-gray-900">Success Rate</th>
                          <th className="text-right py-2 px-3 text-sm font-medium text-gray-900">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paramResults.map((result, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 text-sm font-medium text-gray-900">
                              {String(result.parameterValue)}
                            </td>
                            <td className="py-2 px-3 text-sm text-right">
                              {Math.round(result.avgLatency)}ms
                            </td>
                            <td className="py-2 px-3 text-sm text-right">
                              ${result.avgCost.toFixed(4)}
                            </td>
                            <td className="py-2 px-3 text-sm text-right">
                              {result.successRate.toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 text-sm text-right">
                              <span className={`font-medium ${
                                index === 0 ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {result.score.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
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

function getDefaultValues(paramName: keyof TestResult['parameters']): unknown[] {
  switch (paramName) {
    case 'temperature':
      return [0.1, 0.5, 0.7, 1.0];
    case 'maxTokens':
      return [100, 300, 500, 1000];
    case 'topP':
      return [0.1, 0.5, 0.9, 1.0];
    case 'topK':
      return [10, 20, 40, 80];
    case 'frequencyPenalty':
    case 'presencePenalty':
      return [0, 0.5, 1.0, 1.5];
    default:
      return [0.1, 0.5, 1.0];
  }
}