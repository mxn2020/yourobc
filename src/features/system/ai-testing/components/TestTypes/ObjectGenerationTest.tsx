// src/features/ai-testing/components/TestTypes/ObjectGenerationTest.tsx
import React, { useState, useCallback } from 'react';
import { Database, Play, Settings, Copy, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { ModelSelector } from '@/features/system/ai-models/components/ModelSelector';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import type { ModelInfo } from '@/features/system/ai-core/types';
import type { ObjectGenerationConfig } from '../../services/TestExecutor';
import { supportsOperationType } from '@/features/system/ai-core/utils';
import { useToast } from '@/features/system/notifications';

interface ObjectGenerationResult {
  object: any;
  isComplete: boolean;
  startedAt: Date;
  completedAt?: Date;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  duration?: number;
  error?: string;
  rawResponse?: string;
  schemaValidation?: {
    valid: boolean;
    errors?: string[];
  };
}

// Predefined schemas for common use cases
const PREDEFINED_SCHEMAS = {
  recipe: {
    name: 'Recipe',
    description: 'A cooking recipe with ingredients and steps',
    schema: `{
  "name": "string",
  "description": "string", 
  "servings": "number",
  "prepTime": "string",
  "cookTime": "string",
  "ingredients": [
    {
      "name": "string",
      "amount": "string",
      "unit": "string"
    }
  ],
  "steps": ["string"],
  "difficulty": "easy | medium | hard",
  "tags": ["string"]
}`,
    prompt: 'Generate a delicious lasagna recipe with detailed ingredients and step-by-step instructions.'
  },
  person: {
    name: 'Person Profile',
    description: 'A person profile with contact and occupation details',
    schema: `{
  "name": "string",
  "age": "number | null",
  "contact": {
    "type": "email | phone",
    "value": "string"
  },
  "address": {
    "street": "string",
    "city": "string",
    "country": "string",
    "zipCode": "string"
  },
  "occupation": {
    "type": "employed | self-employed | unemployed | student",
    "company": "string",
    "position": "string",
    "salary": "number | null"
  },
  "hobbies": ["string"],
  "personality": {
    "traits": ["string"],
    "description": "string"
  }
}`,
    prompt: 'Generate a realistic person profile for testing purposes with complete details.'
  },
  product: {
    name: 'Product Catalog',
    description: 'An e-commerce product with specifications',
    schema: `{
  "id": "string",
  "name": "string", 
  "description": "string",
  "category": "string",
  "price": {
    "amount": "number",
    "currency": "string"
  },
  "specifications": {
    "dimensions": {
      "width": "number",
      "height": "number", 
      "depth": "number",
      "unit": "string"
    },
    "weight": {
      "value": "number",
      "unit": "string"
    },
    "material": "string",
    "color": ["string"]
  },
  "availability": {
    "inStock": "boolean",
    "quantity": "number",
    "restockDate": "string | null"
  },
  "rating": {
    "average": "number",
    "count": "number"
  },
  "tags": ["string"]
}`,
    prompt: 'Generate a detailed product listing for a high-end office chair including specifications and availability.'
  },
  event: {
    name: 'Event Details',
    description: 'An event with schedule and attendee information',
    schema: `{
  "title": "string",
  "description": "string",
  "type": "conference | workshop | seminar | meeting | social",
  "datetime": {
    "start": "string",
    "end": "string",
    "timezone": "string"
  },
  "location": {
    "type": "in-person | virtual | hybrid",
    "venue": "string",
    "address": "string",
    "virtualLink": "string | null"
  },
  "organizer": {
    "name": "string",
    "email": "string",
    "organization": "string"
  },
  "attendees": {
    "capacity": "number",
    "registered": "number",
    "waitlist": "number"
  },
  "agenda": [
    {
      "time": "string",
      "title": "string",
      "speaker": "string",
      "duration": "number"
    }
  ],
  "requirements": ["string"],
  "tags": ["string"]
}`,
    prompt: 'Generate a detailed AI conference event with multiple sessions, speakers, and logistics information.'
  },
  custom: {
    name: 'Custom Schema',
    description: 'Define your own JSON schema',
    schema: `{
  "name": "string",
  "value": "any"
}`,
    prompt: 'Generate data based on the custom schema provided.'
  }
};

export function ObjectGenerationTest() {
  const toast = useToast();
  const [modelId, setModelId] = useState('');
  const [selectedSchema, setSelectedSchema] = useState('recipe');
  const [customSchema, setCustomSchema] = useState(PREDEFINED_SCHEMAS.custom.schema);
  const [customPrompt, setCustomPrompt] = useState(PREDEFINED_SCHEMAS.custom.prompt);
  const [schemaName, setSchemaName] = useState('');
  const [schemaDescription, setSchemaDescription] = useState('');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(1500);
  const [topP, setTopP] = useState(1.0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [outputStrategy, setOutputStrategy] = useState<'object' | 'array'>('object');
  
  const [result, setResult] = useState<ObjectGenerationResult | null>(null);

  const { data: models = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await fetch('/api/ai/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });

  const { executeObjectGeneration, loadingStates, errors } = useModelTesting();

  const languageModels = models.filter(m => supportsOperationType(m, 'object_generation'));

  const getCurrentSchema = useCallback(() => {
    if (selectedSchema === 'custom') {
      return customSchema;
    }
    return PREDEFINED_SCHEMAS[selectedSchema as keyof typeof PREDEFINED_SCHEMAS].schema;
  }, [selectedSchema, customSchema]);

  const getCurrentPrompt = useCallback(() => {
    if (selectedSchema === 'custom') {
      return customPrompt;
    }
    return PREDEFINED_SCHEMAS[selectedSchema as keyof typeof PREDEFINED_SCHEMAS].prompt;
  }, [selectedSchema, customPrompt]);

  const validateSchema = useCallback((schema: string) => {
    try {
      JSON.parse(schema);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON schema' 
      };
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!modelId) {
      toast.error('Please select a model');
      return;
    }

    const schemaValidation = validateSchema(getCurrentSchema());
    if (!schemaValidation.valid) {
      toast.error(`Invalid schema: ${schemaValidation.error}`);
      return;
    }

    setResult(null);
    const startTime = new Date();

    try {
      const config: ObjectGenerationConfig = {
        name: `Object Generation Test - ${new Date().toLocaleTimeString()}`,
        modelId,
        prompt: getCurrentPrompt(),
        systemPrompt: undefined,
        schema: JSON.parse(getCurrentSchema()),
        outputMode: outputStrategy,
        parameters: {
          temperature,
          maxTokens,
          topP
        }
      };

      const testResult = await executeObjectGeneration(config);
      const completedAt = new Date();
      const duration = completedAt.getTime() - startTime.getTime();

      const generationResult: ObjectGenerationResult = {
        object: testResult.response,
        isComplete: true,
        startedAt: startTime,
        completedAt,
        duration,
        usage: {
          promptTokens: testResult.usage.inputTokens,
          completionTokens: testResult.usage.outputTokens,
          totalTokens: testResult.usage.totalTokens
        },
        rawResponse: JSON.stringify(testResult.response, null, 2),
        schemaValidation: { valid: true }
      };

      setResult(generationResult);
      toast.success('Object generated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Object generation failed';
      toast.error(errorMessage);
      
      const failedResult: ObjectGenerationResult = {
        object: null,
        isComplete: true,
        startedAt: startTime,
        completedAt: new Date(),
        error: errorMessage
      };
      
      setResult(failedResult);
    }
  }, [modelId, getCurrentSchema, getCurrentPrompt, outputStrategy, temperature, maxTokens, topP, validateSchema, executeObjectGeneration]);

  const handleCopyObject = useCallback(() => {
    if (result?.rawResponse) {
      navigator.clipboard.writeText(result.rawResponse);
      toast.success('Object copied to clipboard');
    }
  }, [result?.rawResponse]);

  const handleCopySchema = useCallback(() => {
    navigator.clipboard.writeText(getCurrentSchema());
    toast.success('Schema copied to clipboard');
  }, [getCurrentSchema]);

  const handleReset = useCallback(() => {
    setResult(null);
  }, []);

  const handleSchemaChange = useCallback((newSchema: string) => {
    setSelectedSchema(newSchema);
    if (newSchema !== 'custom') {
      const schema = PREDEFINED_SCHEMAS[newSchema as keyof typeof PREDEFINED_SCHEMAS];
      setSchemaName(schema.name);
      setSchemaDescription(schema.description);
    }
  }, []);

  const isGenerating = loadingStates.objectGeneration;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Object Generation Test</h3>
          </div>
          <p className="text-sm text-gray-600">
            Generate structured data objects using AI SDK v5 generateObject with schema validation
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {errors.objectGeneration && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.objectGeneration.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schema Template
              </label>
              <select
                value={selectedSchema}
                onChange={(e) => handleSchemaChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isGenerating}
              >
                {Object.entries(PREDEFINED_SCHEMAS).map(([key, schema]) => (
                  <option key={key} value={key}>
                    {schema.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt
            </label>
            <textarea
              value={selectedSchema === 'custom' ? customPrompt : PREDEFINED_SCHEMAS[selectedSchema as keyof typeof PREDEFINED_SCHEMAS].prompt}
              onChange={(e) => {
                if (selectedSchema === 'custom') {
                  setCustomPrompt(e.target.value);
                }
              }}
              placeholder="Describe what structured data you want to generate..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating || selectedSchema !== 'custom'}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                JSON Schema {selectedSchema !== 'custom' && '(Read-only)'}
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySchema}
                disabled={isGenerating}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Schema
              </Button>
            </div>
            <textarea
              value={selectedSchema === 'custom' ? customSchema : PREDEFINED_SCHEMAS[selectedSchema as keyof typeof PREDEFINED_SCHEMAS].schema}
              onChange={(e) => {
                if (selectedSchema === 'custom') {
                  setCustomSchema(e.target.value);
                }
              }}
              placeholder="Define your JSON schema..."
              rows={8}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm ${
                selectedSchema !== 'custom' ? 'bg-gray-50 text-gray-600' : ''
              }`}
              disabled={isGenerating || selectedSchema !== 'custom'}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={isGenerating}
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
                    Schema Name (Optional)
                  </label>
                  <Input
                    value={schemaName}
                    onChange={(e) => setSchemaName(e.target.value)}
                    placeholder="e.g., Recipe, Person, Product"
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Strategy
                  </label>
                  <select
                    value={outputStrategy}
                    onChange={(e) => setOutputStrategy(e.target.value as 'object' | 'array')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    <option value="object">Single Object</option>
                    <option value="array">Array of Objects</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schema Description (Optional)
                </label>
                <textarea
                  value={schemaDescription}
                  onChange={(e) => setSchemaDescription(e.target.value)}
                  placeholder="Describe the purpose of this schema..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Deterministic</span>
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
                    min="100"
                    max="4000"
                    disabled={isGenerating}
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
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Diverse</span>
                  </div>
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
                    onClick={handleCopyObject}
                    disabled={!result.rawResponse}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Object
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
              disabled={!modelId || isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Object'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating structured object...</p>
          </CardContent>
        </Card>
      )}
      
      {result && !isGenerating && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-gray-900">
                {result.error ? 'Generation Failed' : 'Generated Object'}
              </h4>
              {result.usage && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{result.usage.totalTokens} tokens</span>
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
                <div className="bg-gray-50 border rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                    {result.rawResponse}
                  </pre>
                </div>
                
                {result.usage && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Prompt Tokens:</span>
                        <div className="font-medium">{result.usage.promptTokens}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Completion Tokens:</span>
                        <div className="font-medium">{result.usage.completionTokens}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Tokens:</span>
                        <div className="font-medium">{result.usage.totalTokens}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="font-medium">
                          {result.duration ? `${(result.duration / 1000).toFixed(2)}s` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Schema Valid</span>
                    </div>
                    <div className="text-gray-400">•</div>
                    <span className="text-sm text-gray-500">
                      Generated at {result.startedAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}