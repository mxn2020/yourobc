// src/features/ai-models/components/ModelComparison/ModelComparison.tsx
import { useMemo } from 'react';
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';
import { X } from 'lucide-react';
import { ComparisonTable } from './ComparisonTable';
import { formatModelDisplay } from '../../utils/model-formatters';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';

interface ModelComparisonProps {
  selectedModelIds: string[];
  models: ModelInfo[];
  onClearSelection: () => void;
}

export function ModelComparison({ selectedModelIds, models, onClearSelection }: ModelComparisonProps) {
  const selectedModels = useMemo(() => 
    models.filter(model => selectedModelIds.includes(model.id)),
    [models, selectedModelIds]
  );
  
  if (selectedModels.length < 2) return null;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Model Comparison</h3>
            <p className="text-sm text-gray-600">
              Comparing {selectedModels.length} models
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selectedModels.map(model => {
              const formatted = formatModelDisplay(model);
              return (
                <Badge
                  key={model.id}
                  style={{ backgroundColor: formatted.providerColor, color: 'white' }}
                >
                  {model.name}
                </Badge>
              );
            })}
          </div>
          <ComparisonTable models={selectedModels} />
        </div>
      </CardContent>
    </Card>
  );
}

