// src/features/ai-models/types/model.types.ts - Updated with missing props
import type { ModelInfo, ModelFilter, ModelSort } from '@/features/boilerplate/ai-core/types';

export interface ModelGridProps {
  models: ModelInfo[];
  isLoading: boolean;
  selectedModels: string[];
  onModelSelect: (modelId: string) => void;
  onModelTest: (modelId: string) => void;
  view: 'grid' | 'list';
  showComparison?: boolean; // Add this prop
}

export interface ModelCardProps {
  model: ModelInfo;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
  onTest: (modelId: string) => void;
  showComparison?: boolean; // Add this prop
}

export interface ModelListProps {
  models: ModelInfo[];
  onModelSelect: (modelId: string) => void;
  onModelTest: (modelId: string) => void;
  showComparison?: boolean; // Add this prop
  selectedModels: string[]; // Add this prop
}

export interface ModelFiltersState {
  filters: ModelFilter;
  activeFilterCount: number;
}