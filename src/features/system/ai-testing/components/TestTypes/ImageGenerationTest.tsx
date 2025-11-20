// src/features/ai-testing/components/TestTypes/ImageGenerationTest.tsx
import React, { useState, useCallback } from 'react';
import { Image, Play, Settings, Copy, RotateCcw, Download } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { ModelSelector } from '@/features/boilerplate/ai-models/components/ModelSelector';
import { useQuery } from '@tanstack/react-query';
import { useModelTesting } from '../../hooks/useModelTesting';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import type { ImageGenerationConfig } from '../../services/TestExecutor';
import { supportsOperationType } from '@/features/boilerplate/ai-core/utils';
import { useToast } from '@/features/boilerplate/notifications';

interface ImageGenerationResult {
  images: Array<{
    base64: string;
    uint8Array?: Uint8Array;
    url?: string;
  }>;
  isComplete: boolean;
  startedAt: Date;
  completedAt?: Date;
  usage?: {
    tokens?: number;
  };
  duration?: number;
  error?: string;
  warnings?: string[];
  providerMetadata?: any;
  prompt: string;
  revisedPrompt?: string;
}

// Predefined prompt templates for image generation
const PROMPT_TEMPLATES = {
  artistic: [
    'A majestic mountain landscape at sunset with vibrant colors',
    'Abstract geometric patterns in bright neon colors',
    'A serene Japanese garden with cherry blossoms',
    'Futuristic cityscape with flying cars and neon lights'
  ],
  realistic: [
    'A professional headshot of a business person in an office',
    'A modern kitchen with marble countertops and stainless steel appliances',
    'A golden retriever playing in a sunny park',
    'A cozy coffee shop interior with warm lighting'
  ],
  creative: [
    'A dragon made of colorful flowers flying through clouds',
    'An underwater city with bioluminescent coral buildings',
    'A steampunk robot playing piano in a Victorian parlor',
    'A magical forest with glowing mushrooms and fairy lights'
  ],
  custom: 'Enter your custom prompt here...'
};

// Common image sizes supported by most models
const IMAGE_SIZES = [
  { label: 'Square (1024x1024)', value: '1024x1024' },
  { label: 'Portrait (1024x1536)', value: '1024x1536' },
  { label: 'Landscape (1536x1024)', value: '1536x1024' },
  { label: 'Small Square (512x512)', value: '512x512' },
  { label: 'Large Square (1792x1792)', value: '1792x1792' }
];

// Common aspect ratios
const ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: '1:1' },
  { label: 'Portrait (3:4)', value: '3:4' },
  { label: 'Landscape (4:3)', value: '4:3' },
  { label: 'Wide (16:9)', value: '16:9' },
  { label: 'Tall (9:16)', value: '9:16' },
  { label: 'Ultra Wide (21:9)', value: '21:9' }
];

export function ImageGenerationTest() {
  const toast = useToast();
  const [modelId, setModelId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('artistic');
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState(PROMPT_TEMPLATES.custom);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [size, setSize] = useState('1024x1024');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [useSize, setUseSize] = useState(true); // true for size, false for aspect ratio
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [maxRetries, setMaxRetries] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [result, setResult] = useState<ImageGenerationResult | null>(null);

  const { data: models = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<ModelInfo[]> => {
      const response = await fetch('/api/ai/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });

  const { executeImageGeneration, loadingStates, errors } = useModelTesting();

  const imageModels = models.filter(m => supportsOperationType(m, 'image_generation'));

  const getCurrentPrompt = useCallback(() => {
    if (selectedTemplate === 'custom') {
      return customPrompt;
    }
    const templatePrompts = PROMPT_TEMPLATES[selectedTemplate as keyof typeof PROMPT_TEMPLATES] as string[];
    return templatePrompts[selectedPromptIndex] || templatePrompts[0];
  }, [selectedTemplate, selectedPromptIndex, customPrompt]);

  const handleTemplateChange = useCallback((template: string) => {
    setSelectedTemplate(template);
    setSelectedPromptIndex(0);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!modelId) {
      toast.error('Please select a model');
      return;
    }

    const prompt = getCurrentPrompt();
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setResult(null);
    const startTime = new Date();

    try {
      const config: ImageGenerationConfig = {
        name: `Image Generation Test - ${new Date().toLocaleTimeString()}`,
        modelId,
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        numberOfImages,
        ...(useSize ? { size } : { aspectRatio }),
        ...(seed !== undefined && { seed }),
        parameters: {
          maxRetries
        }
      };

      const data = await executeImageGeneration(config);
      const completedAt = new Date();
      const duration = completedAt.getTime() - startTime.getTime();

      const imageResult: ImageGenerationResult = {
        images: data.images || (data.image ? [data.image] : []),
        isComplete: true,
        startedAt: startTime,
        completedAt,
        duration,
        usage: data.usage,
        warnings: data.warnings,
        providerMetadata: data.providerMetadata,
        prompt: prompt.trim(),
        revisedPrompt: data.providerMetadata?.openai?.images?.[0]?.revisedPrompt
      };

      setResult(imageResult);
      toast.success(`${imageResult.images.length} image(s) generated successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Image generation failed';
      toast.error(errorMessage);
      
      const failedResult: ImageGenerationResult = {
        images: [],
        isComplete: true,
        startedAt: startTime,
        completedAt: new Date(),
        error: errorMessage,
        prompt: prompt.trim()
      };
      
      setResult(failedResult);
    }
  }, [modelId, getCurrentPrompt, negativePrompt, numberOfImages, size, aspectRatio, useSize, seed, maxRetries, executeImageGeneration]);

  const handleDownloadImage = useCallback((base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `generated-image-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded');
  }, []);

  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(getCurrentPrompt());
    toast.success('Prompt copied to clipboard');
  }, [getCurrentPrompt]);

  const handleReset = useCallback(() => {
    setResult(null);
  }, []);

  const isGenerating = loadingStates.imageGeneration;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Image className="h-5 w-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Image Generation Test</h3>
          </div>
          <p className="text-sm text-gray-600">
            Generate images from text prompts using AI SDK v5 generateImage function
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {errors.imageGeneration && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.imageGeneration.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <ModelSelector
                models={imageModels}
                value={modelId}
                onChange={setModelId}
                modelType="image"
                placeholder={imageModels.length === 0 ? "No models available" : "Select an image model..."}
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={isGenerating}
              >
                <option value="artistic">Artistic</option>
                <option value="realistic">Realistic</option>
                <option value="creative">Creative</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {selectedTemplate !== 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Prompt
              </label>
              <select
                value={selectedPromptIndex}
                onChange={(e) => setSelectedPromptIndex(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={isGenerating}
              >
                {(PROMPT_TEMPLATES[selectedTemplate as keyof typeof PROMPT_TEMPLATES] as string[]).map((prompt, index) => (
                  <option key={index} value={index}>
                    {prompt.substring(0, 60)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Prompt
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPrompt}
                disabled={isGenerating}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <textarea
              value={selectedTemplate === 'custom' ? customPrompt : getCurrentPrompt()}
              onChange={(e) => {
                if (selectedTemplate === 'custom') {
                  setCustomPrompt(e.target.value);
                }
              }}
              placeholder="Describe the image you want to generate..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              disabled={isGenerating || selectedTemplate !== 'custom'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Negative Prompt (Optional)
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Describe what you don't want in the image..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Images
                  </label>
                  <Input
                    type="number"
                    value={numberOfImages}
                    onChange={(e) => setNumberOfImages(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size/Ratio Mode
                  </label>
                  <select
                    value={useSize ? 'size' : 'ratio'}
                    onChange={(e) => setUseSize(e.target.value === 'size')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    <option value="size">Fixed Size</option>
                    <option value="ratio">Aspect Ratio</option>
                  </select>
                </div>
              </div>

              {useSize ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    {IMAGE_SIZES.map(sizeOption => (
                      <option key={sizeOption.value} value={sizeOption.value}>
                        {sizeOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    {ASPECT_RATIOS.map(ratioOption => (
                      <option key={ratioOption.value} value={ratioOption.value}>
                        {ratioOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seed (Optional)
                  </label>
                  <Input
                    type="number"
                    value={seed || ''}
                    onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Random seed for reproducible results"
                    disabled={isGenerating}
                  />
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
                    disabled={isGenerating}
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
                    onClick={handleCopyPrompt}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Prompt
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
              disabled={!modelId || !getCurrentPrompt().trim() || isGenerating}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : `Generate ${numberOfImages > 1 ? `${numberOfImages} Images` : 'Image'}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating images...</p>
          </CardContent>
        </Card>
      )}
      
      {result && !isGenerating && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-gray-900">
                {result.error ? 'Generation Failed' : `Generated ${result.images.length} Image(s)`}
              </h4>
              {result.duration && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{(result.duration / 1000).toFixed(2)}s</span>
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
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Original Prompt:</div>
                  <div className="text-sm bg-gray-50 p-2 rounded">{result.prompt}</div>
                  {result.revisedPrompt && result.revisedPrompt !== result.prompt && (
                    <>
                      <div className="text-sm text-gray-600 mb-2 mt-3">Revised Prompt (by AI):</div>
                      <div className="text-sm bg-blue-50 p-2 rounded">{result.revisedPrompt}</div>
                    </>
                  )}
                </div>

                {result.warnings && result.warnings.length > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-medium">Warnings:</p>
                    <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
                      {result.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.images.map((image, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-2">Image {index + 1}</div>
                      <div className="relative bg-gray-100 rounded mb-3 overflow-hidden">
                        <img
                          src={`data:image/png;base64,${image.base64}`}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-auto max-h-64 object-contain"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadImage(image.base64, index)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
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