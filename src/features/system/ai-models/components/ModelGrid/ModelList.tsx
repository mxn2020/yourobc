// src/features/ai-models/components/ModelGrid/ModelList.tsx - Updated with navigation and comparison support
import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Badge, Button, DataTable } from '@/components/ui';
import { TestTube, ExternalLink, Star, Eye } from 'lucide-react';
import { useModelPreferences } from '../../hooks/useModelPreferences';
import { formatModelDisplay } from '../../utils/model-formatters';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';

interface ModelListProps {
  models: ModelInfo[];
  onModelSelect: (modelId: string) => void;
  onModelTest: (modelId: string) => void;
  showComparison?: boolean;
  selectedModels: string[];
}

export function ModelList({ 
  models, 
  onModelSelect, 
  onModelTest, 
  showComparison = false,
  selectedModels 
}: ModelListProps) {
  const { data: preferences } = useModelPreferences();

  const getProviderColor = (provider: string) => {
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
  };

  const isDefaultModel = (model: ModelInfo) => {
    return preferences && Object.values(preferences.defaultModels).includes(model.id);
  };

  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'Model',
      render: (value: string, record: ModelInfo) => {
        const formatted = formatModelDisplay(record);
        const isDefault = isDefaultModel(record);
        
        const content = (
          <div className="flex items-center space-x-2">
            <div>
              <div className="font-medium text-gray-900 flex items-center space-x-1">
                <span>{value}</span>
                {isDefault && (
                  <span title="Default model">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">{record.id}</div>
            </div>
          </div>
        );

        if (showComparison) {
          return (
            <div 
              className="cursor-pointer hover:text-blue-600"
              onClick={() => onModelSelect(record.id)}
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            to="/{-$locale}/ai-models/$modelId"
            params={{ modelId: record.id }}
            className="hover:text-blue-600"
          >
            {content}
          </Link>
        );
      }
    },
    {
      key: 'provider',
      title: 'Provider',
      render: (value: string, record: ModelInfo) => (
        <Badge 
          className="text-white border-0"
          style={{ backgroundColor: getProviderColor(value) }}
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <Badge variant="secondary" className="capitalize">{value}</Badge>
      )
    },
    {
      key: 'contextWindow',
      title: 'Context',
      render: (value: number, record: ModelInfo) => {
        const formatted = formatModelDisplay(record);
        return formatted.contextWindowFormatted;
      }
    },
    {
      key: 'pricing',
      title: 'Pricing',
      render: (value: any, record: ModelInfo) => (
        <div className="text-sm">
          <div className="text-green-600">
            Input: ${(record.pricing.input * 1000000).toFixed(2)}/1M
          </div>
          {record.pricing.output > 0 && record.pricing.output !== record.pricing.input && (
            <div className="text-green-600">
              Output: ${(record.pricing.output * 1000000).toFixed(2)}/1M
            </div>
          )}
        </div>
      )
    },
    {
      key: 'availability',
      title: 'Status',
      render: (value: string, record: ModelInfo) => {
        const formatted = formatModelDisplay(record);
        return <span className={formatted.availabilityColor}>{value}</span>;
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, record: ModelInfo) => (
        <div className="flex items-center space-x-1">
          {/* Test Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onModelTest(record.id);
            }}
            className="flex items-center space-x-1"
          >
            <TestTube className="h-3 w-3" />
            <span>Test</span>
          </Button>

          {showComparison ? (
            /* Compare/Remove Button for Comparison Mode */
            <Button
              size="sm"
              variant={selectedModels.includes(record.id) ? "primary" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onModelSelect(record.id);
              }}
            >
              {selectedModels.includes(record.id) ? 'Remove' : 'Compare'}
            </Button>
          ) : (
            /* View Details Button for Normal Mode */
            <Link
              to="/{-$locale}/ai-models/$modelId"
              params={{ modelId: record.id }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" variant="ghost" className="px-2">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      )
    }
  ], [onModelTest, onModelSelect, showComparison, selectedModels, preferences]);

  const handleRowClick = (model: ModelInfo) => {
    if (showComparison) {
      onModelSelect(model.id);
    }
    // In non-comparison mode, navigation is handled by the Link components
  };

  return (
    <DataTable<ModelInfo>
      data={models}
      columns={columns}
      onRowClick={showComparison ? handleRowClick : undefined}
      className={showComparison ? "cursor-pointer" : ""}
      selectedRows={showComparison ? selectedModels : undefined}
    />
  );
}