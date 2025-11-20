import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, TrendingUp, BarChart3, Info, X } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, Input, SimpleSelect as Select } from '@/components/ui';
import { ModelSelector } from '@/features/system/ai-models/components/ModelSelector';
import type { ModelInfo } from '@/features/system/ai-core/types';

interface CostCalculatorProps {
  models: ModelInfo[];
  onClose: () => void;
  isOpen: boolean;
  preselectedModelId?: string;
}

interface CostScenario {
  id: string;
  name: string;
  inputTokens: number;
  outputTokens: number;
  requestsPerDay: number;
  daysPerMonth: number;
}

export function CostCalculator({ models, onClose, isOpen, preselectedModelId }: CostCalculatorProps) {
  const [selectedModelId, setSelectedModelId] = useState(preselectedModelId || '');
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requestsPerDay, setRequestsPerDay] = useState(10);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [showComparison, setShowComparison] = useState(false);

  const predefinedScenarios: CostScenario[] = [
    {
      id: 'light',
      name: 'Light Usage',
      inputTokens: 500,
      outputTokens: 250,
      requestsPerDay: 5,
      daysPerMonth: 30
    },
    {
      id: 'moderate',
      name: 'Moderate Usage',
      inputTokens: 1000,
      outputTokens: 500,
      requestsPerDay: 20,
      daysPerMonth: 30
    },
    {
      id: 'heavy',
      name: 'Heavy Usage',
      inputTokens: 2000,
      outputTokens: 1000,
      requestsPerDay: 100,
      daysPerMonth: 30
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      inputTokens: 5000,
      outputTokens: 2500,
      requestsPerDay: 1000,
      daysPerMonth: 30
    }
  ];

  const calculateSingleRequestCost = (model: ModelInfo, input: number, output: number): number => {
    if (!model.pricing) return 0;

    let cost = 0;
    if (model.pricing.input) {
      cost += (input / 1000) * model.pricing.input;
    }
    if (model.pricing.output) {
      cost += (output / 1000) * model.pricing.output;
    }

    return cost;
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  const calculations = useMemo(() => {
    if (!selectedModel?.pricing) return null;

    const costPerRequest = calculateSingleRequestCost(selectedModel, inputTokens, outputTokens);
    const dailyCost = costPerRequest * requestsPerDay;
    const monthlyCost = dailyCost * daysPerMonth;
    const yearlyCost = monthlyCost * 12;

    const totalTokensPerRequest = inputTokens + outputTokens;
    const totalTokensPerDay = totalTokensPerRequest * requestsPerDay;
    const totalTokensPerMonth = totalTokensPerDay * daysPerMonth;

    return {
      costPerRequest,
      dailyCost,
      monthlyCost,
      yearlyCost,
      totalTokensPerRequest,
      totalTokensPerDay,
      totalTokensPerMonth
    };
  }, [selectedModel, inputTokens, outputTokens, requestsPerDay, daysPerMonth]);

  const getComparison = (): Array<{
    model: ModelInfo;
    costPerRequest: number;
    monthlyCost: number;
    savings: number;
    savingsPercent: number;
  }> => {
    if (!calculations) return [];

    return models
      .filter(m => m.pricing && m.type === selectedModel?.type)
      .map(model => {
        const cost = calculateSingleRequestCost(model, inputTokens, outputTokens);
        const monthlyCost = cost * requestsPerDay * daysPerMonth;

        return {
          model,
          costPerRequest: cost,
          monthlyCost,
          savings: calculations.monthlyCost - monthlyCost,
          savingsPercent: calculations.monthlyCost > 0
            ? ((calculations.monthlyCost - monthlyCost) / calculations.monthlyCost) * 100
            : 0
        };
      })
      .sort((a, b) => a.monthlyCost - b.monthlyCost);
  };

  const handleScenarioChange = (scenarioId: string) => {
    const scenario = predefinedScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setInputTokens(scenario.inputTokens);
      setOutputTokens(scenario.outputTokens);
      setRequestsPerDay(scenario.requestsPerDay);
      setDaysPerMonth(scenario.daysPerMonth);
    }
  };

  // Filter models that have pricing information
  const modelsWithPricing = models.filter(m => m.pricing);

  const scenarioOptions = [
    { value: 'custom', label: 'Custom' },
    ...predefinedScenarios.map(s => ({ value: s.id, label: s.name }))
  ];

  const comparisonData = getComparison();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calculator className="h-6 w-6 mr-2 text-blue-600" />
                AI Model Cost Calculator
              </h1>
              <p className="text-gray-600 mt-1">Calculate usage costs and compare models</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Configuration */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Model Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Model
                      </label>
                      <ModelSelector
                        models={modelsWithPricing}
                        value={selectedModelId}
                        onChange={setSelectedModelId}
                        placeholder="Choose a model to calculate costs..."
                        showFavorites={true}
                        modelType="language"
                      />
                    </div>

                    {/* Usage Scenario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usage Scenario
                      </label>
                      <Select
                        value="custom"
                        onChange={(e) => handleScenarioChange(e.target.value)}
                        options={scenarioOptions}
                      />
                    </div>

                    {/* Usage Parameters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Input Tokens per Request
                        </label>
                        <Input
                          type="number"
                          value={inputTokens}
                          onChange={(e) => setInputTokens(parseInt(e.target.value) || 0)}
                          min={0}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ~{Math.floor(inputTokens * 0.75)} words
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Output Tokens per Request
                        </label>
                        <Input
                          type="number"
                          value={outputTokens}
                          onChange={(e) => setOutputTokens(parseInt(e.target.value) || 0)}
                          min={0}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ~{Math.floor(outputTokens * 0.75)} words
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Requests per Day
                        </label>
                        <Input
                          type="number"
                          value={requestsPerDay}
                          onChange={(e) => setRequestsPerDay(parseInt(e.target.value) || 0)}
                          min={0}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Days per Month
                        </label>
                        <Input
                          type="number"
                          value={daysPerMonth}
                          onChange={(e) => setDaysPerMonth(parseInt(e.target.value) || 0)}
                          min={1}
                          max={31}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              {selectedModel && calculations && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                        Cost Breakdown - {selectedModel.name}
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowComparison(!showComparison)}
                      >
                        {showComparison ? 'Hide' : 'Show'} Comparison
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Cost Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          ${calculations.costPerRequest.toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-600">Per Request</div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ${calculations.dailyCost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Daily</div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${calculations.monthlyCost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Monthly</div>
                      </div>

                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          ${calculations.yearlyCost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Yearly</div>
                      </div>
                    </div>

                    {/* Usage Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Usage Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tokens per Request:</span>
                          <span className="ml-2 font-medium">
                            {calculations.totalTokensPerRequest.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tokens per Day:</span>
                          <span className="ml-2 font-medium">
                            {calculations.totalTokensPerDay.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tokens per Month:</span>
                          <span className="ml-2 font-medium">
                            {calculations.totalTokensPerMonth.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Model Comparison */}
                    {showComparison && comparisonData.length > 1 && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4 text-blue-600" />
                          Cost Comparison
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {comparisonData.slice(0, 10).map(({ model, monthlyCost, savings, savingsPercent }) => (
                            <div
                              key={model.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                model.id === selectedModelId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Badge
                                  size="sm"
                                  style={{
                                    backgroundColor: getProviderColor(model.provider),
                                    color: 'white'
                                  }}
                                >
                                  {model.provider}
                                </Badge>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {model.name}
                                  </div>
                                  {model.id === selectedModelId && (
                                    <Badge variant="primary" size="sm">Selected</Badge>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  ${monthlyCost.toFixed(2)}/month
                                </div>
                                {Math.abs(savings) > 0.01 && (
                                  <div className={`text-sm ${savings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {savings > 0 ? '+' : ''}${Math.abs(savings).toFixed(2)}
                                    ({Math.abs(savingsPercent).toFixed(1)}%)
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!selectedModel && (
                <Card>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a Model
                      </h3>
                      <p className="text-gray-600">
                        Choose a model from the dropdown above to calculate costs
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Model Details Sidebar */}
            {selectedModel && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Model Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Name</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedModel.name}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700">Provider</div>
                      <div className="text-gray-900">{selectedModel.provider}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700">Type</div>
                      <div className="text-gray-900 capitalize">{selectedModel.type}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700">Context Window</div>
                      <div className="text-gray-900">{selectedModel.contextWindow.toLocaleString()} tokens</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700">Pricing</div>
                      <div className="text-sm text-gray-900">
                        <div>Input: {formatPrice(selectedModel.pricing.input)}</div>
                        {selectedModel.pricing.output > 0 && (
                          <div>Output: {formatPrice(selectedModel.pricing.output)}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Info */}
                <Card>
                  <CardContent className="bg-blue-50 p-4">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Pricing Information</p>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Costs are calculated based on current model pricing</li>
                          <li>• Prices may vary by provider and are subject to change</li>
                          <li>• This is an estimate - actual usage may differ</li>
                          <li>• Some providers offer volume discounts not reflected here</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getProviderColor(provider: string): string {
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
}

function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  // Always show price per 1M tokens for consistency
  return `$${(price * 1000000).toFixed(2)}/1M tokens`;
}

