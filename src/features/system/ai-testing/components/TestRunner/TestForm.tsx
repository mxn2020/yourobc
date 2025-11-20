// src/features/ai-testing/components/TestRunner/TestForm.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { Alert, AlertDescription, AlertIcon, Button, Input, Label, Loading, SimpleSelect as Select, Textarea } from '@/components/ui';
import { ModelSelector } from '@/features/boilerplate/ai-models/components/ModelSelector';
import type { TestFormData } from '../../types/test.types';
import type { TestType } from '@/features/boilerplate/ai-core/types';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import type { AIOperationType } from '@/features/boilerplate/ai-core/types';

interface TestFormProps {
  initialData?: TestFormData | null;
  onSubmit: (data: TestFormData) => void;
  isLoading?: boolean;
}

export function TestForm({ initialData, onSubmit, isLoading = false }: TestFormProps) {
  const [formData, setFormData] = useState<TestFormData>(() => ({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'text_generation',
    modelId: initialData?.modelId || '',
    parameters: {
      prompt: initialData?.parameters.prompt || '',
      systemPrompt: initialData?.parameters.systemPrompt || '',
      temperature: initialData?.parameters.temperature || 0.7,
      maxTokens: initialData?.parameters.maxTokens || 500,
      topP: initialData?.parameters.topP || 1,
      topK: initialData?.parameters.topK || 40
    },
    iterations: initialData?.iterations || 1,
    timeout: initialData?.timeout || 30000
  }));

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await fetch('/api/ai/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });

  const testTypeOptions = useMemo(() => [
    { value: 'text_generation', label: 'Text Generation' },
    { value: 'object_generation', label: 'Object Generation' },
    { value: 'embedding', label: 'Embedding' },
    { value: 'image_generation', label: 'Image Generation' },
    { value: 'streaming', label: 'Streaming' },
    { value: 'tool_calling', label: 'Tool Calling' }
  ], []);

  const filteredModels = useMemo(() => {
    if (!models.length) return [];
    
    switch (formData.type) {
      case 'embedding':
        return models.filter(m => m.type === 'embedding');
      case 'image_generation':
        return models.filter(m => m.type === 'image');
      default:
        return models.filter(m => m.type === 'language' || m.type === 'multimodal');
    }
  }, [models, formData.type]);

  const updateField = useCallback(<K extends keyof TestFormData>(
    field: K,
    value: TestFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateParameter = useCallback(<K extends keyof TestFormData['parameters']>(
    param: K,
    value: TestFormData['parameters'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      parameters: { ...prev.parameters, [param]: value }
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const isFormValid = useMemo(() => {
    return formData.name.trim() && 
           formData.modelId && 
           formData.parameters.prompt?.trim() &&
           formData.iterations > 0;
  }, [formData]);

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading className="h-6 w-6 mr-2" />
        <span>Loading models...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label required className="block mb-2">
            Test Name
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Enter test name"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label required className="block mb-2">
            Test Type
          </Label>
          <Select
            value={formData.type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('type', e.target.value as TestType)}
            options={testTypeOptions}
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Optional test description"
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="model-selector" required className="block mb-2">
          Model
        </Label>
        <ModelSelector
          models={filteredModels}
          value={formData.modelId}
          onChange={(modelId) => updateField('modelId', modelId)}
          placeholder="Select a model..."
          disabled={isLoading}
          modelType={
            formData.type === 'embedding' ? 'embedding' :
            formData.type === 'image_generation' ? 'image' :
            'language'
          }
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Test Parameters</h4>

        <div>
          <Textarea
            label="Prompt"
            value={formData.parameters.prompt || ''}
            onChange={(e) => updateParameter('prompt', e.target.value)}
            placeholder="Enter your test prompt..."
            disabled={isLoading}
            rows={4}
            required
          />
        </div>

        {formData.type !== 'embedding' && formData.type !== 'image_generation' && (
          <div>
            <Textarea
              label="System Prompt"
              value={formData.parameters.systemPrompt || ''}
              onChange={(e) => updateParameter('systemPrompt', e.target.value)}
              placeholder="Optional system prompt..."
              disabled={isLoading}
              rows={2}
            />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="block mb-1">
              Temperature
            </Label>
            <Input
              type="number"
              value={formData.parameters.temperature || 0.7}
              onChange={(e) => updateParameter('temperature', parseFloat(e.target.value))}
              min="0"
              max="2"
              step="0.1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label className="block mb-1">
              Max Tokens
            </Label>
            <Input
              type="number"
              value={formData.parameters.maxTokens || 500}
              onChange={(e) => updateParameter('maxTokens', parseInt(e.target.value))}
              min="1"
              max="4000"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label className="block mb-1">
              Top P
            </Label>
            <Input
              type="number"
              value={formData.parameters.topP || 1}
              onChange={(e) => updateParameter('topP', parseFloat(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label className="block mb-1">
              Top K
            </Label>
            <Input
              type="number"
              value={formData.parameters.topK || 40}
              onChange={(e) => updateParameter('topK', parseInt(e.target.value))}
              min="1"
              max="100"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block mb-2">
            Iterations
          </Label>
          <Input
            type="number"
            value={formData.iterations}
            onChange={(e) => updateField('iterations', parseInt(e.target.value))}
            min="1"
            max="10"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Number of times to run this test
          </p>
        </div>

        <div>
          <Label className="block mb-2">
            Timeout (ms)
          </Label>
          <Input
            type="number"
            value={formData.timeout}
            onChange={(e) => updateField('timeout', parseInt(e.target.value))}
            min="5000"
            max="300000"
            step="1000"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum time to wait for results
          </p>
        </div>
      </div>

      {!isFormValid && (
        <Alert variant="warning">
          <div className="flex items-start space-x-2">
            <AlertIcon variant="warning" />
            <AlertDescription>
              Please fill in all required fields: test name, model selection, and prompt.
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="min-w-32"
        >
          {isLoading ? (
            <>
              <Loading className="h-4 w-4 mr-2" />
              Running Test...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Test
            </>
          )}
        </Button>
      </div>
    </form>
  );
}