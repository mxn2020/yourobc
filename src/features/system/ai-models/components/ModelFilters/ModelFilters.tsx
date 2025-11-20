import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button, Card, CardContent, Chip, Input, SimpleSelect as Select } from '@/components/ui';
import type { ModelFilter, ModelAvailability, ModelType, ModelProvider } from '@/features/boilerplate/ai-core/types';

interface ModelFiltersProps {
  filters: ModelFilter;
  onChange: (filters: ModelFilter) => void;
  onClear: () => void;
  className?: string;
}

export function ModelFilters({ filters, onChange, onClear, className }: ModelFiltersProps) {
  const typeOptions = [
    { value: 'language', label: 'Language Models' },
    { value: 'embedding', label: 'Embedding Models' },
    { value: 'image', label: 'Image Models' },
    { value: 'multimodal', label: 'Multimodal Models' }
  ];

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google' },
    { value: 'meta', label: 'Meta' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'cohere', label: 'Cohere' },
    { value: 'xai', label: 'xAI' }
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'limited', label: 'Limited' },
    { value: 'deprecated', label: 'Deprecated' }
  ];

  const capabilityOptions = [
    { value: 'function_calling', label: 'Function Calling' },
    { value: 'json_mode', label: 'JSON Mode' },
    { value: 'vision', label: 'Vision' },
    { value: 'code_generation', label: 'Code Generation' },
    { value: 'reasoning', label: 'Reasoning' },
    { value: 'multilingual', label: 'Multilingual' },
    { value: 'streaming', label: 'Streaming' },
    { value: 'multimodal', label: 'Multimodal' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  );

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search models, providers, or capabilities..."
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Model Type"
              options={[{ value: '', label: 'All Types' }, ...typeOptions]}
              value={filters.type?.[0] || ''}
              onChange={(e) => onChange({
                ...filters,
                type: e.target.value ? [e.target.value as ModelType] : undefined
              })}
            />

            <Select
              label="Provider"
              options={[{ value: '', label: 'All Providers' }, ...providerOptions]}
              value={filters.provider?.[0] || ''}
              onChange={(e) => onChange({
                ...filters,
                provider: e.target.value ? [e.target.value as ModelProvider] : undefined
              })}
            />

            <Select
              label="Availability"
              options={[{ value: '', label: 'All Status' }, ...availabilityOptions]}
              value={filters.availability?.[0] || ''}
              onChange={(e) => onChange({
                ...filters,
                availability: e.target.value ? [e.target.value as ModelAvailability] : undefined
              })}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Context Window</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.contextWindowMin || ''}
                  onChange={(e) => onChange({ 
                    ...filters, 
                    contextWindowMin: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.contextWindowMax || ''}
                  onChange={(e) => onChange({ 
                    ...filters, 
                    contextWindowMax: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range ($/1M tokens)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.001"
                placeholder="Min price"
                value={filters.priceRange?.min || ''}
                onChange={(e) => onChange({ 
                  ...filters, 
                  priceRange: {
                    ...filters.priceRange,
                    min: e.target.value ? Number(e.target.value) : 0,
                    max: filters.priceRange?.max || 1
                  }
                })}
              />
              <Input
                type="number"
                step="0.001"
                placeholder="Max price"
                value={filters.priceRange?.max || ''}
                onChange={(e) => onChange({ 
                  ...filters, 
                  priceRange: {
                    min: filters.priceRange?.min || 0,
                    max: e.target.value ? Number(e.target.value) : 1
                  }
                })}
              />
            </div>
          </div>

          {/* Selected Capabilities */}
          {filters.capabilities && filters.capabilities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Capabilities
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.capabilities.map((capability) => (
                  <Chip
                    key={capability}
                    variant="primary"
                    onRemove={() => onChange({
                      ...filters,
                      capabilities: filters.capabilities?.filter(c => c !== capability)
                    })}
                  >
                    {capability.replace('_', ' ')}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Capability Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capabilities
            </label>
            <div className="flex flex-wrap gap-2">
              {capabilityOptions.map((capability) => (
                <Button
                  key={capability.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const current = filters.capabilities || [];
                    const updated = current.includes(capability.value)
                      ? current.filter(c => c !== capability.value)
                      : [...current, capability.value];
                    onChange({ ...filters, capabilities: updated });
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filters.capabilities?.includes(capability.value)
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {capability.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

