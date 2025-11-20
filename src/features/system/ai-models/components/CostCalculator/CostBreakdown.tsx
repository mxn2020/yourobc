// src/features/ai-models/components/CostCalculator/CostBreakdown.tsx
import { Card, CardContent, CardHeader } from '@/components/ui';
import { formatCost } from '@/features/boilerplate/ai-core/utils';
import type { ModelInfo } from '@/features/boilerplate/ai-core/types';

interface CostBreakdownProps {
  model: ModelInfo;
  calculation: {
    inputTokens: number;
    outputTokens: number;
    costPerRequest: number;
    dailyCost: number;
    monthlyCost: number;
    yearlyCost: number;
  };
}

export function CostBreakdown({ model, calculation }: CostBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Cost Breakdown</h3>
        <p className="text-sm text-gray-600">{model.name}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {calculation.inputTokens}
            </div>
            <div className="text-sm text-blue-700">Input Tokens</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {calculation.outputTokens}
            </div>
            <div className="text-sm text-green-700">Output Tokens</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Per Request:</span>
            <span className="font-semibold">{formatCost(calculation.costPerRequest)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Daily:</span>
            <span className="font-semibold">{formatCost(calculation.dailyCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly:</span>
            <span className="font-semibold text-lg">{formatCost(calculation.monthlyCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Yearly:</span>
            <span className="font-semibold">{formatCost(calculation.yearlyCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

