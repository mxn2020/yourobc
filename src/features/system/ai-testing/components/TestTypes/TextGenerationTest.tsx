// src/features/ai-testing/components/TestTypes/TextGenerationTest.tsx
import React, { useState, useCallback } from 'react';
import { MessageSquare, Play, Settings } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Input } from '@/components/ui';
import { ModelSelector } from '@/features/system/ai-models/components/ModelSelector';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import { TestResults } from '../TestRunner/TestResults';
import type { TestResult } from '@/features/system/ai-core/types';
import type { ModelInfo } from '@/features/system/ai-core/types';
import type { TextGenerationConfig } from '../../services/TestExecutor';
import { useToast } from '@/features/system/notifications';

export function TextGenerationTest() {
  const toast = useToast();
  const [modelId, setModelId] = useState('');
  const [prompt, setPrompt] = useState('Explain the concept of artificial intelligence in simple terms.');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [topP, setTopP] = useState(1.0);
  const [topK, setTopK] = useState(0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: models = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await fetch('/api/ai/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });

  const { executeTextGeneration, loadingStates, errors } = useModelTesting();

  const languageModels = models.filter(m => m.type === 'language' || m.type === 'multimodal');

  const handleRun = useCallback(async () => {
    if (!modelId || !prompt.trim()) {
      toast.error('Please select a model and enter a prompt');
      return;
    }

    // Clear previous result immediately when starting a new test
    setResult(null);

    try {
      console.log('Starting new text generation test');
      const config: TextGenerationConfig = {
        name: `Text Generation Test - ${new Date().toLocaleTimeString()}`,
        modelId,
        prompt: prompt.trim(),
        systemPrompt: systemPrompt.trim() || undefined,
        parameters: {
          temperature,
          maxTokens,
          topP,
          ...(topK > 0 && { topK }),
          ...(frequencyPenalty !== 0 && { frequencyPenalty }),
          ...(presencePenalty !== 0 && { presencePenalty }),
          ...(seed !== undefined && { seed })
        }
      };

      const testResult = await executeTextGeneration(config);
      console.log('Received new test result:', { 
        id: testResult.id, 
        prompt: config.prompt.substring(0, 50) + '...', 
        timestamp: testResult.startedAt,
        cost: testResult.cost 
      });
      setResult(testResult);
      toast.success('Test completed successfully');
    } catch (error) {
      console.error('Test execution failed:', error);
      toast.error(error instanceof Error ? error.message : 'Test failed');
    }
  }, [modelId, prompt, systemPrompt, temperature, maxTokens, topP, topK, frequencyPenalty, presencePenalty, seed, executeTextGeneration]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Text Generation Test</h3>
          </div>
          <p className="text-sm text-gray-600">
            Test text generation capabilities of language models
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {errors.textGeneration && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.textGeneration.message}</p>
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
              placeholder="Select a language model..."
              disabled={loadingStates.textGeneration}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingStates.textGeneration}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={loadingStates.textGeneration}
            >
              <Settings className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Prompt (Optional)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingStates.textGeneration}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    disabled={loadingStates.textGeneration}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
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
                    max="4000"
                    disabled={loadingStates.textGeneration}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top P: {topP}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={loadingStates.textGeneration}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Narrow</span>
                    <span>Diverse</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top K
                  </label>
                  <Input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    min="0"
                    max="100"
                    placeholder="0 (disabled)"
                    disabled={loadingStates.textGeneration}
                  />
                  <p className="text-xs text-gray-500 mt-1">0 to disable</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency Penalty: {frequencyPenalty}
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={frequencyPenalty}
                    onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={loadingStates.textGeneration}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Repeat</span>
                    <span>Avoid</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Presence Penalty: {presencePenalty}
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={presencePenalty}
                    onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={loadingStates.textGeneration}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Repeat topics</span>
                    <span>New topics</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seed (Optional)
                  </label>
                  <Input
                    type="number"
                    value={seed || ''}
                    onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Random seed for reproducible results"
                    disabled={loadingStates.textGeneration}
                  />
                  <p className="text-xs text-gray-500 mt-1">Set for reproducible outputs</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleRun}
              disabled={!modelId || !prompt.trim() || loadingStates.textGeneration}
            >
              <Play className="h-4 w-4 mr-2" />
              {loadingStates.textGeneration ? 'Running...' : 'Run Test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingStates.textGeneration && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running test...</p>
          </CardContent>
        </Card>
      )}
      
      {result && !loadingStates.textGeneration && <TestResults result={result} />}
    </div>
  );
}