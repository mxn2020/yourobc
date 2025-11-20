// src/components/ui/ModelSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check, Filter, Star, Zap, Brain, Image, Layers } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { useModelPreferences } from '../hooks/useModelPreferences';
import type { ModelInfo, ModelCapabilities, ModelType } from '@/features/system/ai-core/types';

// Helper function for type-safe capability access
function hasCapability(capabilities: ModelCapabilities | undefined, cap: string): boolean {
  if (!capabilities) return false;
  return !!(capabilities as Record<string, boolean | undefined>)[cap];
}

// Helper function to get all active capability keys
function getActiveCapabilities(capabilities: ModelCapabilities | undefined): string[] {
  if (!capabilities) return [];
  return Object.keys(capabilities).filter(key =>
    (capabilities as Record<string, boolean | undefined>)[key]
  );
}

interface ModelSelectorProps {
  models: ModelInfo[];
  value?: string;
  onChange: (modelId: string) => void;
  placeholder?: string;
  filterByType?: string[];
  filterByCapabilities?: string[];
  showFavorites?: boolean;
  className?: string;
  disabled?: boolean;
  modelType?: ModelType; // For determining default model type preference
}

type SortOption = 'name' | 'provider' | 'cost' | 'popularity' | 'recent';
type FilterCategory = 'provider' | 'type' | 'capability' | 'availability';

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    openai: '#10A37F',
    anthropic: '#D97706',
    google: '#4285F4',
    xai: '#000000',
    meta: '#1877F2',
    mistral: '#FF6B35',
    cohere: '#39C5BB',
    bedrock: '#FF9900',
    vertex: '#4285F4',
    azure: '#0078D4',
    groq: '#F55036',
    deepseek: '#1E40AF',
    perplexity: '#20B2AA',
    fireworks: '#FF6B35',
    cerebras: '#6366F1'
  };
  return colors[provider] || '#6B7280';
}

function formatPrice(price: number, currency = 'USD'): string {
  if (price === 0) return 'Free';
  
  // Always show price per 1M tokens for consistency
  return `$${(price * 1000000).toFixed(2)}/1M tokens`;
}

export function ModelSelector({
  models,
  value,
  onChange,
  placeholder = 'Select a model...',
  filterByType,
  filterByCapabilities,
  showFavorites = false,
  className = '',
  disabled = false,
  modelType
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [selectedFilters, setSelectedFilters] = useState<Record<FilterCategory, string[]>>({
    provider: [],
    type: [],
    capability: [],
    availability: []
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasSetDefault, setHasSetDefault] = useState(false);
  
  const { getDefaultModel, isLoading: preferencesLoading } = useModelPreferences();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Set default model from preferences if no value is explicitly provided
  useEffect(() => {
    if (!preferencesLoading && !hasSetDefault && !value && models.length > 0) {
      const defaultModelId = getDefaultModel(modelType);
      console.log('🎯 ModelSelector debug:', {
        modelType,
        defaultModelId,
        hasModelInList: defaultModelId ? models.some(model => model.id === defaultModelId) : false,
        availableModels: models.map(m => m.id).slice(0, 5) // First 5 for brevity
      });
      
      if (defaultModelId && models.some(model => model.id === defaultModelId)) {
        console.log('✅ Setting default model:', defaultModelId);
        onChange(defaultModelId);
        setHasSetDefault(true);
      }
    }
  }, [preferencesLoading, hasSetDefault, value, models, getDefaultModel, modelType, onChange]);
  
  // Reset hasSetDefault when models change or value is explicitly set from outside
  useEffect(() => {
    if (value) {
      setHasSetDefault(true);
    }
  }, [value]);
  
  useEffect(() => {
    setHasSetDefault(false);
  }, [models]);

  // Filter models based on type and capability requirements
  let availableModels = models;
  if (filterByType && filterByType.length > 0) {
    availableModels = availableModels.filter(model => filterByType.includes(model.type));
  }
  if (filterByCapabilities && filterByCapabilities.length > 0) {
    availableModels = availableModels.filter(model =>
      filterByCapabilities.some(cap => hasCapability(model.capabilities, cap))
    );
  }

  // Apply search and filters
  const filteredModels = availableModels.filter(model => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        model.name,
        model.provider,
        model.description,
        model.id,
        ...(model.tags || [])
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Provider filter
    if (selectedFilters.provider.length > 0 && !selectedFilters.provider.includes(model.provider)) {
      return false;
    }

    // Type filter
    if (selectedFilters.type.length > 0 && !selectedFilters.type.includes(model.type)) {
      return false;
    }

    // Availability filter
    if (selectedFilters.availability.length > 0 && !selectedFilters.availability.includes(model.availability)) {
      return false;
    }

    // Capability filter
    if (selectedFilters.capability.length > 0) {
      const modelCapabilities = getActiveCapabilities(model.capabilities);
      if (!selectedFilters.capability.some(cap => modelCapabilities.includes(cap))) {
        return false;
      }
    }

    return true;
  });

  // Sort models
  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'provider':
        return a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name);
      case 'cost':
        return (a.pricing?.input || 0) - (b.pricing?.input || 0);
      case 'popularity':
        return (b.tags?.includes('popular') ? 1 : 0) - (a.tags?.includes('popular') ? 1 : 0);
      case 'recent':
        return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });

  // Separate favorites if enabled
  const favoriteModels = showFavorites ? sortedModels.filter(model => favorites.includes(model.id)) : [];
  const regularModels = showFavorites ? sortedModels.filter(model => !favorites.includes(model.id)) : sortedModels;

  const selectedModel = models.find(model => model.id === value);

  // Get unique filter options
  const getUniqueValues = (key: keyof ModelInfo) => {
    return [...new Set(availableModels.map(model => model[key]))].filter(Boolean).sort() as string[];
  };

  const getUniqueCapabilities = () => {
    const allCapabilities = new Set<string>();
    availableModels.forEach(model => {
      const activeCapabilities = getActiveCapabilities(model.capabilities);
      activeCapabilities.forEach(cap => allCapabilities.add(cap));
    });
    return Array.from(allCapabilities).sort();
  };

  const toggleFilter = (category: FilterCategory, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      provider: [],
      type: [],
      capability: [],
      availability: []
    });
    setSearchQuery('');
  };

  const toggleFavorite = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleModelSelect = (model: ModelInfo) => {
    onChange(model.id);
    setIsOpen(false);
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'language': return Brain;
      case 'image': return Image;
      case 'embedding': return Layers;
      default: return Zap;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const hasActiveFilters = Object.values(selectedFilters).some(filters => filters.length > 0) || searchQuery;
  const totalActiveFilters = Object.values(selectedFilters).reduce((sum, filters) => sum + filters.length, 0);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          flex items-center justify-between
        `}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedModel ? (
            <>
              {React.createElement(getModelTypeIcon(selectedModel.type), { 
                className: "h-4 w-4 text-gray-500 flex-shrink-0" 
              })}
              <div className="flex items-center space-x-2 min-w-0">
                <span 
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: getProviderColor(selectedModel.provider) }}
                />
                <span className="font-medium truncate">{selectedModel.name}</span>
                <span className="text-gray-500 text-sm truncate">({selectedModel.provider})</span>
              </div>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 flex flex-col">
          {/* Search and Filters Header */}
          <div className="p-3 border-b border-gray-200">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Filters and Sort */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="name">Name</option>
                  <option value="provider">Provider</option>
                  <option value="cost">Cost</option>
                  <option value="popularity">Popularity</option>
                  <option value="recent">Recent</option>
                </select>
                
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Clear {totalActiveFilters > 0 && `(${totalActiveFilters})`}
                  </Button>
                )}
              </div>
              
              <span className="text-xs text-gray-500">
                {sortedModels.length} of {availableModels.length} models
              </span>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="px-3 py-2 border-b border-gray-100 flex flex-wrap gap-1">
            {/* Providers */}
            {getUniqueValues('provider').slice(0, 5).map(provider => (
              <button
                key={provider}
                onClick={() => toggleFilter('provider', provider)}
                className={`
                  text-xs px-2 py-1 rounded-full border transition-colors
                  ${selectedFilters.provider.includes(provider)
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: getProviderColor(provider) }}
                />
                {provider}
              </button>
            ))}
            
            {/* Types */}
            {getUniqueValues('type').map(type => {
              const Icon = getModelTypeIcon(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleFilter('type', type)}
                  className={`
                    text-xs px-2 py-1 rounded-full border transition-colors flex items-center space-x-1
                    ${selectedFilters.type.includes(type)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-3 w-3" />
                  <span>{type}</span>
                </button>
              );
            })}
          </div>

          {/* Model List */}
          <div className="flex-1 overflow-y-auto">
            {favoriteModels.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                  ⭐ Favorites ({favoriteModels.length})
                </div>
                {favoriteModels.map(model => (
                  <ModelOption
                    key={model.id}
                    model={model}
                    isSelected={value === model.id}
                    isFavorite={favorites.includes(model.id)}
                    onSelect={() => handleModelSelect(model)}
                    onToggleFavorite={(e) => toggleFavorite(model.id, e)}
                    showFavorites={showFavorites}
                  />
                ))}
              </div>
            )}

            {regularModels.length > 0 ? (
              regularModels.map(model => (
                <ModelOption
                  key={model.id}
                  model={model}
                  isSelected={value === model.id}
                  isFavorite={favorites.includes(model.id)}
                  onSelect={() => handleModelSelect(model)}
                  onToggleFavorite={(e) => toggleFavorite(model.id, e)}
                  showFavorites={showFavorites}
                />
              ))
            ) : (
              <div className="px-3 py-8 text-center text-gray-500 text-sm">
                {hasActiveFilters ? 'No models match your search or filters' : 'No models available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ModelOptionProps {
  model: ModelInfo;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  showFavorites: boolean;
}

function ModelOption({ model, isSelected, isFavorite, onSelect, onToggleFavorite, showFavorites }: ModelOptionProps) {
  const Icon = getModelTypeIcon(model.type);
  
  return (
    <div
      onClick={onSelect}
      className={`
        px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-b-0
        ${isSelected ? 'bg-blue-50 border-blue-100' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span 
                className="inline-block w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: getProviderColor(model.provider) }}
              />
              <span className="font-medium text-gray-900 truncate">{model.name}</span>
              <span className="text-gray-500 text-sm">({model.provider})</span>
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <Badge size="sm" variant="secondary">{model.type}</Badge>
              <Badge 
                size="sm" 
                className={
                  model.availability === 'available' ? 'bg-green-100 text-green-800' :
                  model.availability === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }
              >
                {model.availability}
              </Badge>
              
              {model.pricing && (
                <span className="text-xs text-gray-500">
                  {formatPrice(model.pricing.input)}
                </span>
              )}
            </div>
            
            {model.description && (
              <p className="text-xs text-gray-600 mt-1 truncate">{model.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showFavorites && (
            <button
              onClick={onToggleFavorite}
              className={`p-1 rounded hover:bg-gray-100 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
          {isSelected && <Check className="h-4 w-4 text-blue-600" />}
        </div>
      </div>
    </div>
  );
}

function getModelTypeIcon(type: string) {
  switch (type) {
    case 'language': return Brain;
    case 'image': return Image;
    case 'embedding': return Layers;
    default: return Zap;
  }
}