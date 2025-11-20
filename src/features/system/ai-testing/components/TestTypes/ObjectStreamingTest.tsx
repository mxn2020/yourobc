// src/features/ai-testing/components/TestTypes/ObjectStreamingTest.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GitBranch, Play, Settings, Square, Copy, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { ModelSelector } from '@/features/boilerplate/ai-models/components/ModelSelector';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import type { ObjectGenerationConfig } from '../../services/TestExecutor';
import { supportsOperationType } from '@/features/boilerplate/ai-core/utils';
import { useToast } from '@/features/boilerplate/notifications';

interface StreamingObjectResult {
  partialObject: any;
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
  finalObject?: any;
  streamEvents: Array<{
    type: string;
    timestamp: Date;
    data?: any;
  }>;
}

// Same predefined schemas as Object Generation but with streaming focus
const STREAMING_SCHEMAS = {
  story: {
    name: 'Story Structure',
    description: 'A structured story with characters and plot',
    schema: `{
  "title": "string",
  "genre": "fantasy | sci-fi | mystery | romance | thriller",
  "setting": {
    "time": "string",
    "place": "string",
    "atmosphere": "string"
  },
  "characters": [
    {
      "name": "string",
      "role": "protagonist | antagonist | supporting",
      "description": "string",
      "motivation": "string"
    }
  ],
  "plot": {
    "setup": "string",
    "conflict": "string",
    "climax": "string",
    "resolution": "string"
  },
  "themes": ["string"],
  "wordCount": "number"
}`,
    prompt: 'Create a compelling fantasy adventure story with rich characters and an engaging plot structure.'
  },
  analysis: {
    name: 'Data Analysis',
    description: 'Structured analysis with insights and recommendations',
    schema: `{
  "topic": "string",
  "summary": "string",
  "keyFindings": [
    {
      "finding": "string",
      "importance": "high | medium | low",
      "evidence": "string",
      "impact": "string"
    }
  ],
  "trends": [
    {
      "trend": "string", 
      "direction": "increasing | decreasing | stable",
      "confidence": "number",
      "timeframe": "string"
    }
  ],
  "insights": [
    {
      "insight": "string",
      "category": "opportunity | risk | pattern | anomaly",
      "actionable": "boolean"
    }
  ],
  "recommendations": [
    {
      "recommendation": "string",
      "priority": "high | medium | low",
      "effort": "high | medium | low",
      "impact": "high | medium | low",
      "timeline": "string"
    }
  ],
  "methodology": "string",
  "limitations": ["string"],
  "confidence": "number"
}`,
    prompt: 'Analyze the current state and future trends of artificial intelligence in healthcare, providing actionable insights.'
  },
  curriculum: {
    name: 'Learning Curriculum',
    description: 'Educational curriculum with modules and assessments',
    schema: `{
  "title": "string",
  "subject": "string",
  "level": "beginner | intermediate | advanced",
  "duration": {
    "total": "number",
    "unit": "hours | days | weeks | months"
  },
  "objectives": ["string"],
  "prerequisites": ["string"],
  "modules": [
    {
      "title": "string",
      "description": "string",
      "duration": "number",
      "topics": ["string"],
      "learningObjectives": ["string"],
      "activities": [
        {
          "type": "lecture | exercise | project | quiz | discussion",
          "title": "string",
          "description": "string",
          "duration": "number"
        }
      ],
      "resources": ["string"],
      "assessment": {
        "type": "quiz | assignment | project | exam",
        "weight": "number",
        "criteria": ["string"]
      }
    }
  ],
  "finalAssessment": {
    "type": "string",
    "weight": "number",
    "requirements": ["string"]
  },
  "certification": {
    "available": "boolean",
    "requirements": ["string"],
    "validityPeriod": "string"
  }
}`,
    prompt: 'Design a comprehensive beginner-friendly curriculum for learning Python programming with hands-on projects.'
  },
  businessPlan: {
    name: 'Business Plan',
    description: 'Comprehensive business plan structure',
    schema: `{
  "companyName": "string",
  "industry": "string",
  "businessModel": "string",
  "executiveSummary": "string",
  "marketAnalysis": {
    "targetMarket": "string",
    "marketSize": "string",
    "competitors": [
      {
        "name": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "marketShare": "string"
      }
    ],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "products": [
    {
      "name": "string",
      "description": "string",
      "features": ["string"],
      "pricing": {
        "model": "string",
        "price": "number",
        "currency": "string"
      },
      "stage": "concept | development | launch | mature"
    }
  ],
  "marketing": {
    "strategy": "string",
    "channels": ["string"],
    "budget": "number",
    "timeline": "string"
  },
  "operations": {
    "location": "string",
    "equipment": ["string"],
    "processes": ["string"],
    "suppliers": ["string"]
  },
  "team": [
    {
      "role": "string",
      "responsibilities": ["string"],
      "qualifications": ["string"],
      "salary": "number"
    }
  ],
  "financials": {
    "startupCosts": "number",
    "monthlyExpenses": "number",
    "revenueProjections": [
      {
        "year": "number",
        "revenue": "number",
        "growth": "number"
      }
    ],
    "breakEvenPoint": "string",
    "fundingNeeded": "number"
  },
  "milestones": [
    {
      "milestone": "string",
      "targetDate": "string",
      "metrics": ["string"]
    }
  ],
  "risks": [
    {
      "risk": "string",
      "probability": "high | medium | low",
      "impact": "high | medium | low",
      "mitigation": "string"
    }
  ]
}`,
    prompt: 'Create a detailed business plan for an AI-powered personal fitness coaching mobile application.'
  },
  custom: {
    name: 'Custom Schema',
    description: 'Define your own streaming JSON schema',
    schema: `{
  "name": "string",
  "data": "any"
}`,
    prompt: 'Generate streaming data based on the custom schema provided.'
  }
};

export function ObjectStreamingTest() {
  const toast = useToast();
  const [modelId, setModelId] = useState('');
  const [selectedSchema, setSelectedSchema] = useState('story');
  const [customSchema, setCustomSchema] = useState(STREAMING_SCHEMAS.custom.schema);
  const [customPrompt, setCustomPrompt] = useState(STREAMING_SCHEMAS.custom.prompt);
  const [schemaName, setSchemaName] = useState('');
  const [schemaDescription, setSchemaDescription] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [topP, setTopP] = useState(1.0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [outputStrategy, setOutputStrategy] = useState<'object' | 'array'>('object');
  
  const [result, setResult] = useState<StreamingObjectResult | null>(null);
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

  const { executeObjectStreaming, loadingStates, errors } = useModelTesting();

  const languageModels = models.filter(m => supportsOperationType(m, 'object_generation'));

  const getCurrentSchema = useCallback(() => {
    if (selectedSchema === 'custom') {
      return customSchema;
    }
    return STREAMING_SCHEMAS[selectedSchema as keyof typeof STREAMING_SCHEMAS].schema;
  }, [selectedSchema, customSchema]);

  const getCurrentPrompt = useCallback(() => {
    if (selectedSchema === 'custom') {
      return customPrompt;
    }
    return STREAMING_SCHEMAS[selectedSchema as keyof typeof STREAMING_SCHEMAS].prompt;
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

  const handleStream = useCallback(async () => {
    if (!modelId) {
      toast.error('Please select a model');
      return;
    }

    const schemaValidation = validateSchema(getCurrentSchema());
    if (!schemaValidation.valid) {
      toast.error(`Invalid schema: ${schemaValidation.error}`);
      return;
    }

    // Reset state
    setResult(null);
    streamStartTimeRef.current = new Date();
    abortControllerRef.current = new AbortController();

    try {
      const config: ObjectGenerationConfig = {
        name: `Object Streaming Test - ${new Date().toLocaleTimeString()}`,
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

      const stream = await executeObjectStreaming(config);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      const streamEvents: Array<{ type: string; timestamp: Date; data?: any }> = [];

      // Initialize the streaming result
      const streamResult: StreamingObjectResult = {
        partialObject: {},
        isComplete: false,
        startedAt: streamStartTimeRef.current!,
        streamEvents: []
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
                const event = {
                  type: data.type || 'data',
                  timestamp: new Date(),
                  data
                };
                streamEvents.push(event);

                if (data.type === 'object-delta' || data.partialObject) {
                  // Update the partial object
                  setResult(prev => prev ? {
                    ...prev,
                    partialObject: data.partialObject || data.object || prev.partialObject,
                    streamEvents: [...streamEvents]
                  } : {
                    partialObject: data.partialObject || data.object || {},
                    isComplete: false,
                    startedAt: streamStartTimeRef.current!,
                    streamEvents: [...streamEvents]
                  });
                } else if (data.type === 'finish' || data.type === 'object-complete') {
                  // Stream completed
                  const completedAt = new Date();
                  const duration = completedAt.getTime() - streamStartTimeRef.current!.getTime();
                  
                  setResult(prev => prev ? {
                    ...prev,
                    isComplete: true,
                    completedAt,
                    duration,
                    finalObject: data.object || prev.partialObject,
                    usage: data.usage,
                    streamEvents: [...streamEvents]
                  } : null);
                  break;
                }
              } catch (parseError) {
                console.debug('Chunk parse error:', parseError);
                // Try to handle as partial object update
                const event = {
                  type: 'raw',
                  timestamp: new Date(),
                  data: line
                };
                streamEvents.push(event);
              }
            }
          }
        }
      } finally {
        await reader.cancel();
      }

      toast.success('Object streaming completed');
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
        const errorMessage = error instanceof Error ? error.message : 'Object streaming failed';
        toast.error(errorMessage);
        setResult(prev => prev ? {
          ...prev,
          error: errorMessage,
          isComplete: true,
          completedAt: new Date()
        } : {
          partialObject: {},
          isComplete: true,
          startedAt: streamStartTimeRef.current || new Date(),
          completedAt: new Date(),
          error: errorMessage,
          streamEvents: []
        });
      }
    }
  }, [modelId, getCurrentSchema, getCurrentPrompt, outputStrategy, temperature, maxTokens, topP, validateSchema, executeObjectStreaming]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleCopyObject = useCallback(() => {
    const objectToCopy = result?.finalObject || result?.partialObject;
    if (objectToCopy) {
      navigator.clipboard.writeText(JSON.stringify(objectToCopy, null, 2));
      toast.success('Object copied to clipboard');
    }
  }, [result?.finalObject, result?.partialObject]);

  const handleCopySchema = useCallback(() => {
    navigator.clipboard.writeText(getCurrentSchema());
    toast.success('Schema copied to clipboard');
  }, [getCurrentSchema]);

  const handleReset = useCallback(() => {
    setResult(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleSchemaChange = useCallback((newSchema: string) => {
    setSelectedSchema(newSchema);
    if (newSchema !== 'custom') {
      const schema = STREAMING_SCHEMAS[newSchema as keyof typeof STREAMING_SCHEMAS];
      setSchemaName(schema.name);
      setSchemaDescription(schema.description);
    }
  }, []);

  const isStreaming = loadingStates.objectStreaming;

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
            <GitBranch className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Object Streaming Test</h3>
          </div>
          <p className="text-sm text-gray-600">
            Stream structured data generation in real-time using AI SDK v5 streamObject capabilities
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {errors.objectStreaming && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.objectStreaming.message}</p>
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
                disabled={isStreaming}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schema Template
              </label>
              <select
                value={selectedSchema}
                onChange={(e) => handleSchemaChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isStreaming}
              >
                {Object.entries(STREAMING_SCHEMAS).map(([key, schema]) => (
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
              value={selectedSchema === 'custom' ? customPrompt : STREAMING_SCHEMAS[selectedSchema as keyof typeof STREAMING_SCHEMAS].prompt}
              onChange={(e) => {
                if (selectedSchema === 'custom') {
                  setCustomPrompt(e.target.value);
                }
              }}
              placeholder="Describe what structured data you want to stream..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isStreaming || selectedSchema !== 'custom'}
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
                disabled={isStreaming}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Schema
              </Button>
            </div>
            <textarea
              value={selectedSchema === 'custom' ? customSchema : STREAMING_SCHEMAS[selectedSchema as keyof typeof STREAMING_SCHEMAS].schema}
              onChange={(e) => {
                if (selectedSchema === 'custom') {
                  setCustomSchema(e.target.value);
                }
              }}
              placeholder="Define your streaming JSON schema..."
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm ${
                selectedSchema !== 'custom' ? 'bg-gray-50 text-gray-600' : ''
              }`}
              disabled={isStreaming || selectedSchema !== 'custom'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schema Name (Optional)
                  </label>
                  <Input
                    value={schemaName}
                    onChange={(e) => setSchemaName(e.target.value)}
                    placeholder="e.g., Story, Analysis, Plan"
                    disabled={isStreaming}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Strategy
                  </label>
                  <select
                    value={outputStrategy}
                    onChange={(e) => setOutputStrategy(e.target.value as 'object' | 'array')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isStreaming}
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
                  placeholder="Describe the purpose of this streaming schema..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isStreaming}
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
                    min="200"
                    max="4000"
                    disabled={isStreaming}
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
                    onClick={handleCopyObject}
                    disabled={!result.partialObject && !result.finalObject}
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
            <div className="flex space-x-2">
              {isStreaming ? (
                <Button
                  variant="danger"
                  onClick={handleStop}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Stream
                </Button>
              ) : (
                <Button
                  onClick={handleStream}
                  disabled={!modelId || isStreaming}
                  className="bg-green-600 hover:bg-green-700"
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
                {isStreaming ? 'Streaming Object...' : 'Stream Complete'}
              </h4>
              {result && result.usage && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{result.usage.totalTokens} tokens</span>
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
                <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Object streaming in progress...</span>
              </div>
            )}
            
            {result?.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Streaming Error</p>
                <p className="text-red-600 text-sm mt-1">{result.error}</p>
              </div>
            ) : (
              <div className="bg-gray-50 border rounded-lg p-4 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {JSON.stringify(
                    result?.finalObject || result?.partialObject || {},
                    null,
                    2
                  )}
                  {isStreaming && (
                    <span className="inline-block w-2 h-5 bg-green-500 animate-pulse ml-1"></span>
                  )}
                </pre>
              </div>
            )}
            
            {result && result.isComplete && !result.error && result.usage && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Prompt Tokens:</span>
                    <div className="font-medium">{result.usage.promptTokens}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Completion:</span>
                    <div className="font-medium">{result.usage.completionTokens}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <div className="font-medium">{result.usage.totalTokens}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <div className="font-medium">
                      {result.duration ? `${(result.duration / 1000).toFixed(2)}s` : '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Events:</span>
                    <div className="font-medium">{result.streamEvents.length}</div>
                  </div>
                </div>
              </div>
            )}

            {result && result.streamEvents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2 group-open:mb-4">
                    Stream Events ({result.streamEvents.length})
                  </summary>
                  <div className="bg-white border rounded-lg max-h-32 overflow-y-auto text-xs">
                    {result.streamEvents.map((event, index) => (
                      <div key={index} className="px-3 py-1 border-b border-gray-100 last:border-b-0">
                        <span className="font-mono text-gray-500">
                          {event.timestamp.toLocaleTimeString()}.{event.timestamp.getMilliseconds().toString().padStart(3, '0')}
                        </span>
                        <span className="ml-2 text-blue-600">{event.type}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}