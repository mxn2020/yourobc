// src/features/ai-testing/components/TestTypes/EmbeddingTest.tsx
import React, { useState, useCallback } from 'react';
import { Hash, Play, Settings, Copy, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Input } from '@/components/ui';
import { ModelSelector } from '@/features/boilerplate/ai-models/components/ModelSelector';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import type { EmbeddingConfig } from '../../services/TestExecutor';
import { supportsOperationType } from '@/features/boilerplate/ai-core/utils';
import { useToast } from '@/features/boilerplate/notifications';

interface EmbeddingResult {
  embedding?: number[];
  embeddings?: number[][];
  values: string[];
  isComplete: boolean;
  startedAt: Date;
  completedAt?: Date;
  usage?: {
    tokens: number;
  };
  duration?: number;
  error?: string;
  similarity?: {
    cosineSimilarity?: number;
    euclideanDistance?: number;
    dotProduct?: number;
  };
  dimensions?: number;
}

// Predefined example texts for embedding
const EXAMPLE_TEXTS = {
  sentences: [
    'The weather is sunny and warm today.',
    'It\'s a bright and beautiful day outside.',
    'The rain is falling heavily on the roof.',
    'Dark clouds are gathering in the sky.'
  ],
  documents: [
    'Artificial intelligence is transforming how we work and live.',
    'Machine learning algorithms can process vast amounts of data.',
    'Natural language processing enables computers to understand human text.',
    'Deep learning neural networks mimic the human brain structure.'
  ],
  questions: [
    'What is the capital of France?',
    'How does photosynthesis work in plants?',
    'What are the benefits of renewable energy?',
    'How do computers process information?'
  ],
  custom: [
    'Add your own text here',
    'Second custom text'
  ]
};

export function EmbeddingTest() {
  const toast = useToast();
  const [modelId, setModelId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('sentences');
  const [values, setValues] = useState<string[]>(EXAMPLE_TEXTS.sentences);
  const [maxRetries, setMaxRetries] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mode, setMode] = useState<'single' | 'batch'>('batch');
  
  const [result, setResult] = useState<EmbeddingResult | null>(null);

  const { data: models = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await fetch('/api/ai/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });

  const { executeEmbedding, loadingStates, errors } = useModelTesting();

  const embeddingModels = models.filter(m => supportsOperationType(m, 'embedding'));

  const handleTemplateChange = useCallback((template: string) => {
    setSelectedTemplate(template);
    if (template !== 'custom') {
      setValues(EXAMPLE_TEXTS[template as keyof typeof EXAMPLE_TEXTS]);
    }
  }, []);

  const handleValueChange = useCallback((index: number, value: string) => {
    setValues(prev => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });
  }, []);

  const handleAddValue = useCallback(() => {
    setValues(prev => [...prev, '']);
  }, []);

  const handleRemoveValue = useCallback((index: number) => {
    if (values.length > 1) {
      setValues(prev => prev.filter((_, i) => i !== index));
    }
  }, [values.length]);

  const calculateSimilarity = useCallback((embeddings: number[][]): { cosineSimilarity?: number; euclideanDistance?: number; dotProduct?: number } => {
    if (embeddings.length !== 2) return {};

    const [a, b] = embeddings;
    
    // Cosine similarity
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    const cosineSimilarity = dotProduct / (magnitudeA * magnitudeB);

    // Euclidean distance
    const euclideanDistance = Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));

    return {
      cosineSimilarity,
      euclideanDistance,
      dotProduct
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!modelId) {
      toast.error('Please select a model');
      return;
    }

    const filteredValues = values.filter(v => v.trim());
    if (filteredValues.length === 0) {
      toast.error('Please enter at least one text to embed');
      return;
    }

    setResult(null);
    const startTime = new Date();

    try {
      const config: EmbeddingConfig = {
        name: `Embedding Test - ${new Date().toLocaleTimeString()}`,
        modelId,
        values: filteredValues,
        mode,
        parameters: {
          maxRetries
        }
      };

      const data = await executeEmbedding(config);
      const completedAt = new Date();
      const duration = completedAt.getTime() - startTime.getTime();

      const embeddings = data.embeddings || (data.embedding ? [data.embedding] : []);
      const similarity = embeddings.length === 2 ? calculateSimilarity(embeddings) : undefined;

      const embeddingResult: EmbeddingResult = {
        embedding: data.embedding,
        embeddings: data.embeddings,
        values: filteredValues,
        isComplete: true,
        startedAt: startTime,
        completedAt,
        duration,
        usage: data.usage,
        similarity,
        dimensions: embeddings[0]?.length
      };

      setResult(embeddingResult);
      toast.success('Embeddings generated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Embedding generation failed';
      toast.error(errorMessage);
      
      const failedResult: EmbeddingResult = {
        values: filteredValues,
        isComplete: true,
        startedAt: startTime,
        completedAt: new Date(),
        error: errorMessage
      };
      
      setResult(failedResult);
    }
  }, [modelId, values, mode, maxRetries, executeEmbedding, calculateSimilarity]);

  const handleCopyEmbeddings = useCallback(() => {
    const embeddingsToCopy = result?.embeddings || (result?.embedding ? [result.embedding] : []);
    if (embeddingsToCopy.length > 0) {
      navigator.clipboard.writeText(JSON.stringify(embeddingsToCopy, null, 2));
      toast.success('Embeddings copied to clipboard');
    }
  }, [result]);

  const handleReset = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Embedding Test</h3>
          </div>
          <p className="text-sm text-gray-600">
            Generate vector embeddings from text using AI SDK v5 embed and embedMany functions
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {errors.embedding && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.embedding.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <ModelSelector
                models={embeddingModels}
                value={modelId}
                onChange={setModelId}
                modelType="embedding"
                placeholder="Select an embedding model..."
                disabled={loadingStates.embedding}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loadingStates.embedding}
              >
                <option value="sentences">Similar Sentences</option>
                <option value="documents">Technical Documents</option>
                <option value="questions">Questions</option>
                <option value="custom">Custom Texts</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Texts to Embed ({values.length})
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddValue}
                  disabled={loadingStates.embedding}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Text
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {values.map((value, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      value={value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      placeholder={`Text ${index + 1}...`}
                      disabled={loadingStates.embedding || (selectedTemplate !== 'custom')}
                    />
                  </div>
                  {values.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveValue(index)}
                      disabled={loadingStates.embedding}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={loadingStates.embedding}
            >
              <Settings className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'single' | 'batch')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loadingStates.embedding}
                  >
                    <option value="batch">Batch (embedMany)</option>
                    <option value="single">Single (embed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Retries
                  </label>
                  <Input
                    type="number"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                    min="0"
                    max="5"
                    disabled={loadingStates.embedding}
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
                    onClick={handleCopyEmbeddings}
                    disabled={!result.embeddings && !result.embedding}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Embeddings
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
            <Button
              onClick={handleGenerate}
              disabled={!modelId || values.filter(v => v.trim()).length === 0 || loadingStates.embedding}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {loadingStates.embedding ? 'Generating...' : 'Generate Embeddings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingStates.embedding && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating embeddings...</p>
          </CardContent>
        </Card>
      )}
      
      {result && !loadingStates.embedding && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-gray-900">
                {result.error ? 'Generation Failed' : 'Embedding Results'}
              </h4>
              {result.usage && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{result.usage.tokens} tokens</span>
                  {result.duration && (
                    <span>{(result.duration / 1000).toFixed(2)}s</span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Generation Error</p>
                <p className="text-red-600 text-sm mt-1">{result.error}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-gray-500 text-sm">Texts:</span>
                    <div className="font-medium">{result.values.length}</div>
                  </div>
                  {result.dimensions && (
                    <div>
                      <span className="text-gray-500 text-sm">Dimensions:</span>
                      <div className="font-medium">{result.dimensions}</div>
                    </div>
                  )}
                  {result.usage && (
                    <div>
                      <span className="text-gray-500 text-sm">Tokens:</span>
                      <div className="font-medium">{result.usage.tokens}</div>
                    </div>
                  )}
                  {result.duration && (
                    <div>
                      <span className="text-gray-500 text-sm">Duration:</span>
                      <div className="font-medium">{(result.duration / 1000).toFixed(2)}s</div>
                    </div>
                  )}
                </div>

                {result.similarity && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Similarity Analysis (2 texts)</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Cosine Similarity:</span>
                        <div className="font-medium">{result.similarity.cosineSimilarity?.toFixed(4)}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Euclidean Distance:</span>
                        <div className="font-medium">{result.similarity.euclideanDistance?.toFixed(4)}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Dot Product:</span>
                        <div className="font-medium">{result.similarity.dotProduct?.toFixed(4)}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {result.values.map((text, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-2">Text {index + 1}:</div>
                      <div className="text-sm bg-gray-50 p-2 rounded mb-2">{text}</div>
                      <details className="group">
                        <summary className="cursor-pointer text-xs text-gray-500 group-open:text-gray-700">
                          View embedding vector ({result.dimensions} dimensions)
                        </summary>
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                          [{(result.embeddings?.[index] || result.embedding || []).slice(0, 10).map(n => n.toFixed(6)).join(', ')}
                          {(result.embeddings?.[index]?.length || result.embedding?.length || 0) > 10 && '...'}]
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}