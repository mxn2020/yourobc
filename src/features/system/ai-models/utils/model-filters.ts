// src/features/ai-models/utils/model-filters.ts
import type { ModelFilter, ModelInfo } from '@/features/boilerplate/ai-core/types';

export function createEmptyFilter(): ModelFilter {
  return {};
}

export function isFilterActive(filter: ModelFilter): boolean {
  return Object.values(filter).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );
}

export function getFilterSummary(filter: ModelFilter): string[] {
  const summary: string[] = [];
  
  if (filter.search) summary.push(`Search: "${filter.search}"`);
  if (filter.type?.length) summary.push(`Type: ${filter.type.join(', ')}`);
  if (filter.provider?.length) summary.push(`Provider: ${filter.provider.join(', ')}`);
  if (filter.availability?.length) summary.push(`Status: ${filter.availability.join(', ')}`);
  if (filter.capabilities?.length) summary.push(`Capabilities: ${filter.capabilities.length}`);
  
  return summary;
}

