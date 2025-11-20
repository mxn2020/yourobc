// src/features/ai-models/components/ModelGrid/ModelGrid.tsx - Updated to support showComparison prop
import { useMemo } from 'react';
import { ModelCard } from './ModelCard';
import { ModelList } from './ModelList';
import { Loading } from '@/components/ui';
import type { ModelGridProps } from '../../types/model.types';

export function ModelGrid({ 
  models, 
  isLoading, 
  selectedModels, 
  onModelSelect, 
  onModelTest,
  view,
  showComparison = false // Add this prop
}: ModelGridProps) {
  const gridContent = useMemo(() => {
    if (isLoading) {
      return <Loading className="h-64" />;
    }
    
    if (models.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No models found matching your criteria.</p>
        </div>
      );
    }
    
    if (view === 'list') {
      return (
        <ModelList 
          models={models} 
          onModelSelect={onModelSelect} 
          onModelTest={onModelTest}
          showComparison={showComparison}
          selectedModels={selectedModels}
        />
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isSelected={selectedModels.includes(model.id)}
            onSelect={onModelSelect}
            onTest={onModelTest}
            showComparison={showComparison}
          />
        ))}
      </div>
    );
  }, [models, isLoading, view, selectedModels, onModelSelect, onModelTest, showComparison]);
  
  return <div className="w-full">{gridContent}</div>;
}