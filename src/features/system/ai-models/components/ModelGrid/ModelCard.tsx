import React from 'react';
import { useToast } from '@/features/system/notifications';
import { Link } from '@tanstack/react-router';
import { 
  ExternalLink, 
  Zap, 
  Clock, 
  DollarSign, 
  TestTube, 
  Star,
  Layers,
  Image,
  MessageSquare
} from 'lucide-react';
import { Badge, Button, Card, Chip, Tooltip } from '@/components/ui';
import { useAuth } from '@/features/system/auth';
import { useModelPreferences, useSetDefaultModel, useClearDefaultModel } from '../../hooks/useModelPreferences';
import type { ModelCardProps } from '../../types/model.types';
import type { ModelInfo } from '@/features/system/ai-core/types';
import type { UserPreferences } from '../../types/preferences.types';
import { Id } from "@/convex/_generated/dataModel";

interface ModelCardPropsExtended extends ModelCardProps {
  compact?: boolean;
}

export function ModelCard({
  model,
  isSelected,
  onSelect,
  onTest,
  showComparison = false,
  compact = false
}: ModelCardPropsExtended) {
  const toast = useToast();
  const { auth, isAuthenticated } = useAuth();
  const { data: preferences } = useModelPreferences();
  const setDefaultModel = useSetDefaultModel();
  const clearDefaultModel = useClearDefaultModel();
  
  const costTier = getCostTier(model.pricing.input);
  const providerColor = getProviderColor(model.provider);
  const isDefault = isDefaultModel(model as ModelInfo, preferences);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'language': return <MessageSquare className="h-4 w-4" />;
      case 'embedding': return <Layers className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'multimodal': return <Zap className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleSetDefault = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isUpdating) return;
    
    if (!isAuthenticated || !auth?.id) {
      toast.error('Please sign in to set default models');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      if (isDefault) {
        // Clear the default if already set
        await clearDefaultModel({
          modelType: model.type as 'language' | 'embedding' | 'image' | 'multimodal'
        });
        toast.success(`Cleared ${model.name} as default ${model.type} model`);
      } else {
        // Set as default
        await setDefaultModel({
          modelId: model.id,
          modelType: model.type as 'language' | 'embedding' | 'image' | 'multimodal'
        });
        toast.success(`Set ${model.name} as default ${model.type} model`);
      }
    } catch (error) {
      console.error('Failed to update default model:', error);
      toast.error('Failed to update default model');
    } finally {
      setIsUpdating(false);
    }
  };

  if (compact) {
    return (
      <Card 
        className={`p-4 hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
        }`}
        onClick={() => onSelect?.(model.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getTypeIcon(model.type)}
            <h3 className="font-semibold text-gray-900">{model.name}</h3>
            {isDefault && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          <Badge style={{ backgroundColor: providerColor, color: 'white' }} size="sm">
            {model.provider}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatContextWindow(model.contextWindow)}</span>
          <span className="font-medium text-green-600">{formatPrice(model.pricing.input)}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-8 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={() => onSelect?.(model.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getTypeIcon(model.type)}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {model.name}
            </h3>
            {isDefault && (
              <Tooltip content="Default model for this type">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </Tooltip>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <Badge 
              style={{ backgroundColor: providerColor, color: 'white' }}
              size="sm"
            >
              {model.provider}
            </Badge>
            <Badge variant="secondary" size="sm" className="capitalize">
              {model.type.replace('_', ' ')}
            </Badge>
            <Badge className={`${costTier.color} ${costTier.bg} border-0`} size="sm">
              {costTier.tier}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {model.description}
          </p>
        </div>
        
        {/* Availability indicator - Top Right */}
        <div className={`inline-flex items-center space-x-1 text-xs ${
          model.availability === 'available' ? 'text-green-600' : 
          model.availability === 'limited' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            model.availability === 'available' ? 'bg-green-500' : 
            model.availability === 'limited' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="capitalize">{model.availability}</span>
        </div>
      </div>

      {/* Specs */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Tooltip content="Maximum input tokens">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Context:</span>
              <span className="font-medium text-gray-900">
                {formatContextWindow(model.contextWindow)}
              </span>
            </div>
          </Tooltip>
          
          {model.latencyP95 && (
            <Tooltip content="95th percentile response time">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Latency:</span>
                <span className="font-medium text-gray-900">
                  {model.latencyP95}ms
                </span>
              </div>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Input:</span>
          <span className="font-medium text-gray-900">
            {formatPrice(model.pricing.input)}
          </span>
          {model.pricing.output > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Output:</span>
              <span className="font-medium text-gray-900">
                {formatPrice(model.pricing.output)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1 mb-4">
        {Object.entries(model.capabilities)
          .filter(([_, value]) => value)
          .slice(0, 3)
          .map(([key]) => (
            <Chip key={key} variant="primary" size="sm">
              {key.replace('_', ' ')}
            </Chip>
          ))}
        {Object.keys(model.capabilities).filter(k => model.capabilities[k as keyof typeof model.capabilities]).length > 3 && (
          <Chip variant="secondary" size="sm">
            +{Object.keys(model.capabilities).filter(k => model.capabilities[k as keyof typeof model.capabilities]).length - 3} more
          </Chip>
        )}
      </div>

      {/* Benchmarks */}
      {model.benchmarks && Object.keys(model.benchmarks).length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Performance</div>
          <div className="flex space-x-2">
            {model.benchmarks.mmlu && (
              <div className="text-xs">
                <span className="text-gray-500">MMLU:</span>
                <span className="ml-1 font-medium">{model.benchmarks.mmlu}%</span>
              </div>
            )}
            {model.benchmarks.humaneval && (
              <div className="text-xs">
                <span className="text-gray-500">Code:</span>
                <span className="ml-1 font-medium">{model.benchmarks.humaneval}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {/* Left side - Test & Details buttons */}
        <div className="flex items-center space-x-2">
          {!showComparison && onTest && (
            <Button 
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onTest(model.id);
              }}
              className="flex items-center space-x-1"
            >
              <TestTube className="h-3 w-3" />
              <span>Test</span>
            </Button>
          )}
          <Link
            to="/{-$locale}/ai-models/$modelId"
            params={{ modelId: model.id }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              size="sm"
              variant="ghost"
              className="flex items-center space-x-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Details</span>
            </Button>
          </Link>
        </div>
        
        {/* Right side - Set as default / Default button OR Compare button */}
        <div>
          {showComparison ? (
            <Button 
              size="sm"
              variant={isSelected ? "primary" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(model.id);
              }}
            >
              {isSelected ? 'Remove' : 'Compare'}
            </Button>
          ) : (
            <Button 
              size="sm"
              variant={isDefault ? "primary" : "outline"}
              className="flex items-center space-x-1"
              onClick={handleSetDefault}
              disabled={isUpdating}
            >
              <Star className="h-3 w-3" />
              <span>{isDefault ? 'Default' : 'Set Default'}</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
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

function getCostTier(inputPrice: number) {
  if (inputPrice <= 0.5) return { tier: 'Free', color: 'text-green-700', bg: 'bg-green-50' };
  if (inputPrice <= 5) return { tier: 'Low', color: 'text-blue-700', bg: 'bg-blue-50' };
  if (inputPrice <= 20) return { tier: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-50' };
  return { tier: 'High', color: 'text-red-700', bg: 'bg-red-50' };
}

function formatContextWindow(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`;
  }
  return tokens.toString();
}

function formatPrice(price: number): string {
  const pricePerMillion = price * 1000000;
  return `$${pricePerMillion.toFixed(2)}/1M`;
}

function isDefaultModel(model: ModelInfo, preferences: UserPreferences | null): boolean {
  if (!preferences) return false;
  
  const { defaultModels } = preferences;
  const modelType = model.type as 'language' | 'embedding' | 'image';
  
  return defaultModels[modelType] === model.id;
}