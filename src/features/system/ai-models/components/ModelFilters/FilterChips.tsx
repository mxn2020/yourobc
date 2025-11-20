// src/features/ai-models/components/ModelFilters/FilterChips.tsx
import React from 'react';
import { Chip } from '@/components/ui';
import type { ModelFilter } from '@/features/boilerplate/ai-core/types';

interface FilterChipsProps {
  filters: ModelFilter;
  onFilterRemove: <K extends keyof ModelFilter>(key: K, value: ModelFilter[K]) => void;
}

export function FilterChips({ filters, onFilterRemove }: FilterChipsProps) {
  const chips: React.ReactNode[] = [];
  
  if (filters.type?.length) {
    filters.type.forEach(type => {
      chips.push(
        <Chip key={`type-${type}`} onRemove={() => {
          const newTypes = filters.type?.filter(t => t !== type);
          onFilterRemove('type', newTypes?.length ? newTypes : undefined);
        }}>
          Type: {type}
        </Chip>
      );
    });
  }
  
  if (filters.provider?.length) {
    filters.provider.forEach(provider => {
      chips.push(
        <Chip key={`provider-${provider}`} onRemove={() => {
          const newProviders = filters.provider?.filter(p => p !== provider);
          onFilterRemove('provider', newProviders?.length ? newProviders : undefined);
        }}>
          Provider: {provider}
        </Chip>
      );
    });
  }
  
  if (chips.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {chips}
    </div>
  );
}

