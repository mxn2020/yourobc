// src/features/ai-testing/components/TestTypes/TextStreamingTest.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Zap, Play, Settings, Square, Copy, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { ModelSelector } from '@/features/system/ai-models/components/ModelSelector';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import type { ModelInfo } from '@/features/system/ai-core/types';
import type { StreamingConfig } from '../../services/TestExecutor';
import { useToast } from '@/features/system/notifications';

interface StreamingResult {
  text: string;
  isComplete: boolean;
  startedAt: Date;
  completedAt?: Date;
  tokenCount: number;
  duration?: number;
  error?: string;
}

export function TextStreamingTest() {
  const toast = useToast();
  const [modelId, setModelId] = useState('');
  const [prompt, setPrompt] = useState('Write a short story about a robot discovering emotions.');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [topP, setTopP] = useState(1.0);
  const [topK, setTopK] = useState(0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [result, setResult] = useState<StreamingResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamStartTimeRef = useRef<Date | null>(null);

  const { data: models = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await fetch('/api/ai/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });

  const { executeTextStreaming, loadingStates, errors } = useModelTesting();

  const languageModels = models.filter(m => m.type === 'language' || m.type === 'multimodal');
  const isStreaming = loadingStates.textStreaming;

  const handleStream = useCallback(async () => {
    if (!modelId || !prompt.trim()) {
      toast.error('Please select a model and enter a prompt');
      return;
    }

    // Reset state
    setResult(null);
    streamStartTimeRef.current = new Date();
    abortControllerRef.current = new AbortController();

    try {
      const config: StreamingConfig = {
        name: `Text Streaming Test - ${new Date().toLocaleTimeString()}`,
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

      const stream = await executeTextStreaming(config);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let tokenCount = 0;

      // Initialize the streaming result
      const streamResult: StreamingResult = {
        text: '',
        isComplete: false,
        startedAt: streamStartTimeRef.current!,
        tokenCount: 0
      };
      setResult(streamResult);

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  accumulatedText += data.delta.text;
                  tokenCount++;
                } else if (data.chunk) {
                  // Handle simple text chunks
                  accumulatedText += data.chunk;
                  tokenCount++;
                } else if (typeof data === 'string') {
                  // Handle direct text chunks
                  accumulatedText += data;
                  tokenCount++;
                }

                // Update the result in real-time
                setResult(prev => prev ? {
                  ...prev,
                  text: accumulatedText,
                  tokenCount
                } : {
                  text: accumulatedText,
                  isComplete: false,
                  startedAt: streamStartTimeRef.current!,
                  tokenCount
                });
              } catch (parseError) {
                // Ignore JSON parse errors for malformed chunks
                console.debug('Chunk parse error:', parseError);
              }
            } else if (line.trim()) {
              // Handle plain text chunks
              accumulatedText += line;
              tokenCount++;
              setResult(prev => prev ? {
                ...prev,
                text: accumulatedText,
                tokenCount
              } : {
                text: accumulatedText,
                isComplete: false,
                startedAt: streamStartTimeRef.current!,
                tokenCount
              });
            }
          }
        }
      } finally {
        await reader.cancel();
      }

      // Mark as complete
      const completedAt = new Date();
      const duration = completedAt.getTime() - streamStartTimeRef.current!.getTime();
      
      setResult(prev => prev ? {
        ...prev,
        isComplete: true,
        completedAt,
        duration
      } : {
        text: accumulatedText,
        isComplete: true,
        startedAt: streamStartTimeRef.current!,
        completedAt,
        duration,
        tokenCount
      });

      toast.success('Streaming completed successfully');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.success('Streaming stopped');
        const stoppedAt = new Date();
        const duration = stoppedAt.getTime() - (streamStartTimeRef.current?.getTime() || Date.now());
        setResult(prev => prev ? {
          ...prev,
          isComplete: true,
          completedAt: stoppedAt,
          duration
        } : null);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Streaming failed';
        toast.error(errorMessage);
        setResult(prev => prev ? {
          ...prev,
          error: errorMessage,
          isComplete: true,
          completedAt: new Date()
        } : {
          text: '',
          isComplete: true,
          startedAt: streamStartTimeRef.current || new Date(),
          completedAt: new Date(),
          tokenCount: 0,
          error: errorMessage
        });
      }
    }
  }, [modelId, prompt, systemPrompt, temperature, maxTokens, topP, topK, frequencyPenalty, presencePenalty, seed, executeTextStreaming]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleCopy = useCallback(() => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      toast.success('Text copied to clipboard');
    }
  }, [result?.text]);

  const handleReset = useCallback(() => {
    setResult(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Text Streaming Test</h3>
          </div>
          <p className="text-sm text-gray-600">
            Stream text generation in real-time using AI SDK v5 streaming capabilities
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {errors.textStreaming && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.textStreaming.message}</p>
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
              disabled={isStreaming}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for streaming..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              disabled={isStreaming}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={isStreaming}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  disabled={isStreaming}
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
                    disabled={isStreaming}
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
                    max="4000"
                    disabled={isStreaming}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <div className="flex space-x-2">
              {result && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!result.text}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </>
              )}
            </div>
            <div className="flex space-x-2">
              {isStreaming ? (
                <Button
                  variant="danger"
                  onClick={handleStop}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={handleStream}
                  disabled={!modelId || !prompt.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Stream
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {(isStreaming || result) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-gray-900">
                {isStreaming ? 'Streaming Response...' : 'Stream Complete'}
              </h4>
              {result && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {result.tokenCount > 0 && (
                    <span>{result.tokenCount} tokens</span>
                  )}
                  {result.duration && (
                    <span>{(result.duration / 1000).toFixed(1)}s</span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isStreaming && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Streaming in progress...</span>
              </div>
            )}
            
            {result?.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Streaming Error</p>
                <p className="text-red-600 text-sm mt-1">{result.error}</p>
              </div>
            ) : (
              <div className="bg-gray-50 border rounded-lg p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {result?.text || ''}
                  {isStreaming && (
                    <span className="inline-block w-2 h-5 bg-yellow-500 animate-pulse ml-1"></span>
                  )}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}