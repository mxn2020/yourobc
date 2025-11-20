// src/features/ai-models/pages/AIModelsPage.tsx
import React, { useState, useMemo } from 'react';
import { Grid, List, TestTube, Filter, Settings, TrendingUp, Zap, DollarSign, Star, Search } from 'lucide-react';
import { useModels } from '../hooks/useModels';
import { useModelPreferences } from '../hooks/useModelPreferences';
import { ModelGrid } from '../components/ModelGrid/ModelGrid';
import { ModelFilters } from '../components/ModelFilters/ModelFilters';
import { ModelComparison } from '../components/ModelComparison/ModelComparison';
import { ModelTesting } from '../components/ModelTesting/ModelTesting';
import { ProviderConfig } from '../components/ModelSettings/ProviderConfig';
import { CostCalculator } from '../components/CostCalculator/CostCalculator';
import { Badge, Button, Card, CardContent, Input } from '@/components/ui';
import { createEmptyFilter } from '../utils/model-filters';
import type { ModelFilter, ModelSort, ModelInfo } from '@/features/boilerplate/ai-core/types';

export function AIModelsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showProviderConfig, setShowProviderConfig] = useState(false);
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [testingModelId, setTestingModelId] = useState<string | undefined>();

  const [filters, setFilters] = useState<ModelFilter>(createEmptyFilter());
  const [sort, setSort] = useState<ModelSort>({
    field: 'name',
    direction: 'asc'
  });

  const { data: models = [], isLoading, error } = useModels(filters, sort);
  const { data: preferences } = useModelPreferences();

  // Get default model for display
  const defaultModel = useMemo(() => {
    if (!preferences?.defaultModels?.language) return null;
    return models.find(m => m.id === preferences.defaultModels.language);
  }, [models, preferences]);

  const handleModelSelect = (modelId: string) => {
    if (showComparison) {
      setSelectedModels(prev => {
        if (prev.includes(modelId)) {
          return prev.filter(id => id !== modelId);
        }
        if (prev.length >= 5) {
          return [prev[1], prev[2], prev[3], prev[4], modelId];
        }
        return [...prev, modelId];
      });
    }
  };

  const handleModelTest = (modelId: string) => {
    setTestingModelId(modelId);
    setShowTesting(true);
  };

  const clearFilters = () => {
    setFilters(createEmptyFilter());
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {/* Header with buttons on top right */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Zap className="mr-3 h-8 w-8 text-indigo-600" />
              AI Models
            </h1>
            <p className="text-gray-600 mt-2">
              Explore, compare, and test AI models from multiple providers
            </p>
          </div>
          
          <div className="flex items-center space-x-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowCostCalculator(true)}
              className="flex items-center space-x-2"
            >
              <DollarSign className="h-4 w-4" />
              <span>Cost Calculator</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowProviderConfig(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configure Providers</span>
            </Button>

            <Button
              variant={showComparison ? 'primary' : 'outline'}
              onClick={() => {
                setShowComparison(!showComparison);
                if (!showComparison) setSelectedModels([]);
              }}
            >
              Compare {selectedModels.length > 0 && `(${selectedModels.length})`}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowTesting(true)}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Models
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Models</p>
                  <p className="text-3xl font-bold text-gray-900">{models.length}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Providers</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {new Set(models.map(m => m.provider)).size}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Default Model</p>
                  <p className="text-lg font-semibold text-green-600">
                    {defaultModel ? defaultModel.name : 'Not set'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ${models.length > 0 ? 
                      (models.reduce((sum, m) => sum + m.pricing.input, 0) / models.length * 1000000).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search models, providers, or capabilities..."
                    value={filters.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Advanced Filters</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {!isLoading && (
                  <span className="text-sm text-gray-500 mr-4">
                    {models.length} models
                  </span>
                )}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-md ${view === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-md ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <ModelFilters
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
              />
            )}
          </CardContent>
        </Card>

        {/* Comparison */}
        {showComparison && selectedModels.length > 0 && (
          <ModelComparison
            selectedModelIds={selectedModels}
            models={models}
            onClearSelection={() => setSelectedModels([])}
          />
        )}

        {/* Model Grid with better spacing */}
        <div className="px-2">
          <ModelGrid
            models={models}
            isLoading={isLoading}
            selectedModels={selectedModels}
            onModelSelect={handleModelSelect}
            onModelTest={handleModelTest}
            showComparison={showComparison}
            view={view}
          />
        </div>

        {/* Modals */}
        <ModelTesting
          models={models}
          onClose={() => {
            setShowTesting(false);
            setTestingModelId(undefined);
          }}
          preselectedModelId={testingModelId}
          isOpen={showTesting}
        />

        {showProviderConfig && (
          <ProviderConfig
            onClose={() => setShowProviderConfig(false)}
          />
        )}

        <CostCalculator
          models={models}
          onClose={() => setShowCostCalculator(false)}
          isOpen={showCostCalculator}
        />
      </div>
    </div>
  );
}