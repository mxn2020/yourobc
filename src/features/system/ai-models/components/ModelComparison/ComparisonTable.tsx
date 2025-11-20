// src/features/ai-models/components/ModelComparison/ComparisonTable.tsx
import { useMemo } from 'react';
import { DataTable } from '@/components/ui';
import { formatModelDisplay } from '../../utils/model-formatters';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';
import type { TableColumn } from '@/types';

interface ComparisonTableProps {
  models: ModelInfo[];
}

export function ComparisonTable({ models }: ComparisonTableProps) {
  const comparisonData = useMemo(() => {
    return [
      {
        property: 'Provider',
        values: models.map(model => {
          const formatted = formatModelDisplay(model);
          return (
            <span 
              key={model.id}
              className="px-2 py-1 rounded text-white text-sm"
              style={{ backgroundColor: formatted.providerColor }}
            >
              {model.provider}
            </span>
          );
        })
      },
      {
        property: 'Type',
        values: models.map(model => (
          <span key={model.id} className="capitalize">{model.type}</span>
        ))
      },
      {
        property: 'Context Window',
        values: models.map(model => {
          const formatted = formatModelDisplay(model);
          return <span key={model.id}>{formatted.contextWindowFormatted}</span>;
        })
      },
      {
        property: 'Input Price',
        values: models.map(model => {
          const formatted = formatModelDisplay(model);
          return <span key={model.id} className="text-green-600">{formatted.priceFormatted}</span>;
        })
      },
      {
        property: 'Availability',
        values: models.map(model => {
          const formatted = formatModelDisplay(model);
          return (
            <span key={model.id} className={formatted.availabilityColor}>
              {model.availability}
            </span>
          );
        })
      }
    ];
  }, [models]);
  
  interface ComparisonRow {
    property: string;
    values: React.ReactNode[];
  }

  const columns: TableColumn<ComparisonRow>[] = [
    { key: 'property', title: 'Property' },
    ...models.map((model, index) => ({
      key: `model_${index}`,
      title: model.name,
      render: (_: unknown, record: ComparisonRow) => record.values[index]
    }))
  ];

  return <DataTable<ComparisonRow> data={comparisonData} columns={columns} />;
}

