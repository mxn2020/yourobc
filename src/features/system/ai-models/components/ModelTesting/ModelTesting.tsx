import React, { useState, useEffect } from 'react';
import { TestTube, Play, X, DollarSign, Clock, Zap, Copy, Check } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, Input, Loading } from '@/components/ui';
import { ModelSelector } from '@/features/boilerplate/ai-models/components/ModelSelector';
import { useToast } from '@/features/boilerplate/notifications';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';

interface ModelTestingProps {
  models: ModelInfo[];
  onClose: () => void;
  preselectedModelId?: string;
  isOpen: boolean;
}

interface TestResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
    cachedInputTokens?: number;
  };
  cost: number;
  latency_ms: number;
}

export function ModelTesting({ models, onClose, preselectedModelId, isOpen }: ModelTestingProps) {
  const toast = useToast();
  const [selectedModelId, setSelectedModelId] = useState<string>(
    preselectedModelId || models[0]?.id || ''
  );
  const [prompt, setPrompt] = useState('What is the capital of France and what makes it special?');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedModel = models.find(m => m.id === selectedModelId);

  // Update selected model when preselectedModelId changes
  useEffect(() => {
    if (preselectedModelId && preselectedModelId !== selectedModelId) {
      setSelectedModelId(preselectedModelId);
    }
  }, [preselectedModelId]);

  const handleTest = async () => {
    if (!selectedModel || !prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Use the new AI generate text API
      const requestPayload = {
        modelId: selectedModelId,
        prompt: prompt.trim(),
        systemPrompt: systemPrompt.trim() || undefined,
        parameters: {
          temperature,
          maxTokens,
        },
        user_id: 'test-user', // You may need to get this from auth context
        session_id: crypto.randomUUID(),
        feature: 'model_testing'
      };

      const response = await fetch('/api/ai/generate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Model test failed');
      }
      
      const responseData = {
        text: data.data.text || '',
        usage: {
          inputTokens: data.data.usage?.inputTokens || 0,
          outputTokens: data.data.usage?.outputTokens || 0,
          totalTokens: data.data.usage?.totalTokens || 0,
          reasoningTokens: (data.data.usage?.reasoningTokens && data.data.usage.reasoningTokens > 0) ? data.data.usage.reasoningTokens : undefined,
          cachedInputTokens: (data.data.usage?.cachedInputTokens && data.data.usage.cachedInputTokens > 0) ? data.data.usage.cachedInputTokens : undefined
        },
        cost: data.data.cost || 0,
        latency_ms: data.data.latency || 0
      };

      setResponse(responseData);
      toast.success('Model test completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Model test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    if (!response?.text) return;

    try {
      await navigator.clipboard.writeText(response.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Response copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy response');
    }
  };

  const estimatedCost = selectedModel ? 
    calculateEstimatedCost(selectedModel, Math.floor(prompt.length / 4), maxTokens) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TestTube className="h-6 w-6 mr-2 text-blue-600" />
                  Model Testing
                </h1>
                <p className="text-gray-600 mt-1">Test AI models with custom prompts</p>
              </div>
            </div>
            
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Test Configuration</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Model
                    </label>
                    <ModelSelector
                      models={models}
                      value={selectedModelId}
                      onChange={setSelectedModelId}
                      placeholder="Choose a model to test..."
                      showFavorites={true}
                      modelType="language"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Prompt (Optional)
                    </label>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="You are a helpful assistant..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter your test prompt here..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ~{Math.floor(prompt.length / 4)} tokens
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Focused</span>
                        <span>Creative</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Tokens
                      </label>
                      <Input
                        type="number"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1000)}
                        min={1}
                        max={selectedModel?.maxOutputTokens || 4096}
                      />
                    </div>
                  </div>

                  {selectedModel && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Estimated Cost: ~${estimatedCost.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleTest}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loading className="h-4 w-4 mr-2" />
                        Testing Model...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Test Model
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {response && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{response.latency_ms}ms</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>{response.usage.totalTokens} tokens</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>${response.cost.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                          {response.text}
                        </pre>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyResponse}
                        className="absolute top-2 right-2"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="bg-gray-50 rounded-lg p-3 flex-1 min-w-32">
                        <div className="text-xs text-gray-600">Input Tokens</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {response.usage.inputTokens.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 flex-1 min-w-32">
                        <div className="text-xs text-gray-600">Output Tokens</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {response.usage.outputTokens.toLocaleString()}
                        </div>
                      </div>
                        {response.usage.reasoningTokens && response.usage.reasoningTokens > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 flex-1 min-w-32">
                          <div className="text-xs text-blue-600">Reasoning Tokens</div>
                          <div className="text-lg font-semibold text-blue-900">
                          {response.usage.reasoningTokens.toLocaleString()}
                          </div>
                        </div>
                        )}
                        {response.usage.cachedInputTokens && response.usage.cachedInputTokens > 0 && (
                        <div className="bg-green-50 rounded-lg p-3 flex-1 min-w-32">
                          <div className="text-xs text-green-600">Cached Tokens</div>
                          <div className="text-lg font-semibold text-green-900">
                          {response.usage.cachedInputTokens.toLocaleString()}
                          </div>
                        </div>
                        )}
                      <div className="bg-red-50 rounded-lg p-3 flex-1 min-w-32">
                        <div className="text-xs text-red-600">Total Cost</div>
                        <div className="text-lg font-semibold text-red-900">
                          ${response.cost.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Card>
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Test Error</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {selectedModel && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Model Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Name</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedModel.name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Provider</div>
                      <Badge style={{ 
                        backgroundColor: getProviderColor(selectedModel.provider), 
                        color: 'white' 
                      }}>
                        {selectedModel.provider}
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Type</div>
                      <div className="text-gray-900 capitalize">{selectedModel.type}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Context Window</div>
                      <div className="text-gray-900">{formatContextWindow(selectedModel.contextWindow)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Pricing</div>
                      <div className="text-sm text-gray-900">
                        <div>Input: {formatPrice(selectedModel.pricing.input)}</div>
                        {selectedModel.pricing.output > 0 && (
                          <div>Output: {formatPrice(selectedModel.pricing.output)}</div>
                        )}
                      </div>
                    </div>

                    {selectedModel.capabilities && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Capabilities</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(selectedModel.capabilities)
                            .filter(([_, value]) => value)
                            .map(([key]) => (
                              <Badge key={key} variant="secondary" size="sm">
                                {key.replace('_', ' ')}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateEstimatedCost(model: ModelInfo, inputTokens: number, outputTokens: number): number {
  // Pricing is stored as per-1K-tokens (legacy), so we divide by 1000 to get cost per actual tokens
  // Then multiply by actual token count
  const inputCostPer1K = model.pricing.input;
  const outputCostPer1K = model.pricing.output;
  
  return ((inputTokens / 1000) * inputCostPer1K) + ((outputTokens / 1000) * outputCostPer1K);
}

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    openai: '#10A37F',
    anthropic: '#D97706',
    google: '#4285F4',
    meta: '#1877F2',
    mistral: '#FF6B35',
    cohere: '#39C5BB',
    xai: '#000000',
  };
  return colors[provider] || '#6B7280';
}

function formatContextWindow(contextWindow: number): string {
  if (contextWindow >= 1000000) {
    return `${(contextWindow / 1000000).toFixed(1)}M tokens`;
  }
  if (contextWindow >= 1000) {
    return `${(contextWindow / 1000).toFixed(0)}K tokens`;
  }
  return `${contextWindow} tokens`;
}

function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  // Always show price per 1M tokens for consistency
  return `$${(price * 1000000).toFixed(2)}/1M tokens`;
}