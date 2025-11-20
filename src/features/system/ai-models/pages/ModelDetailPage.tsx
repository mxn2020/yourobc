// src/features/ai-models/pages/ModelDetailPage.tsx
import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, TestTube, Calculator, Settings, Star } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, Loading } from '@/components/ui';
import { CostCalculator } from '../components/CostCalculator/CostCalculator';
import { DefaultModelSettings } from '../components/ModelSettings/DefaultModelSettings';
import { ModelTesting } from '../components/ModelTesting/ModelTesting';
import { useModel, useModels } from '../hooks/useModels';
import { useModelPreferences } from '../hooks/useModelPreferences';
import { formatModelDisplay } from '../utils/model-formatters';

export function ModelDetailPage() {
  const { modelId } = useParams({ from: '/{-$locale}/_protected/_system/ai-models/$modelId' });
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  
  const { data: model, isLoading, error } = useModel(modelId);
  const { data: models = [] } = useModels();
  const { data: preferences } = useModelPreferences();
  
  if (isLoading) return <Loading className="h-64" />;
  
  if (error || !model) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Model not found</h2>
          <Link to="/{-$locale}/ai-models">
            <Button>Back to Models</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const formatted = formatModelDisplay(model);
  const isDefault = Object.values(preferences?.defaultModels || {}).includes(model.id);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/{-$locale}/ai-models">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{model.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge style={{ backgroundColor: formatted.providerColor, color: 'white' }}>
                {model.provider}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {model.type}
              </Badge>
              {isDefault && (
                <Badge variant="primary">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowCostCalculator(true)}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Cost Calculator
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowTesting(true)}>
            <TestTube className="h-4 w-4 mr-2" />
            Test Model
          </Button>
        </div>
      </div>
      
      {/* Model Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Overview</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {model.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Context Window:</span>
                  <span className="ml-2">{formatted.contextWindowFormatted}</span>
                </div>
                <div>
                  <span className="font-medium">Input Price:</span>
                  <span className="ml-2 text-green-600">{formatted.priceFormatted}</span>
                </div>
                <div>
                  <span className="font-medium">Availability:</span>
                  <span className={`ml-2 ${formatted.availabilityColor}`}>
                    {model.availability}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Max Output:</span>
                  <span className="ml-2">
                    {model.maxOutputTokens ? `${model.maxOutputTokens} tokens` : 'Not specified'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Capabilities</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(model.capabilities).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {model.useCases.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Use Cases</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {model.useCases.map((useCase, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">{useCase}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Pricing</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Input:</span>
                  <span className="font-semibold">{formatted.priceFormatted}</span>
                </div>
                {model.pricing.output > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Output:</span>
                    <span className="font-semibold">
                      {formatModelDisplay({ ...model, pricing: { ...model.pricing, input: model.pricing.output } }).priceFormatted}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {model.benchmarks && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Benchmarks</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(model.benchmarks).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 uppercase">{key}:</span>
                      <span className="font-semibold">{value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {model.tags.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Tags</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map(tag => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <CostCalculator
        isOpen={showCostCalculator}
        onClose={() => setShowCostCalculator(false)}
        models={models}
        preselectedModelId={model.id}
      />
      
      <DefaultModelSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        models={models}
      />
      
      <ModelTesting
        isOpen={showTesting}
        onClose={() => setShowTesting(false)}
        models={models}
        preselectedModelId={model.id}
      />
    </div>
  );
}