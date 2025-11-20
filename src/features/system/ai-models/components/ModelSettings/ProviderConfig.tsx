import React, { useState } from 'react';
import { Settings, Plus, Trash2, ArrowUp, ArrowDown, Activity, X, Save, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { SimpleSelect as Select } from '@/components/ui';
import { Badge } from '@/components/ui';
import { useToast } from '@/features/system/notifications';

interface ProviderConfigProps {
  onClose: () => void;
}

interface ProviderConfig {
  id: string;
  provider: string;
  name: string;
  enabled: boolean;
  priority: number;
  api_key?: string;
  base_url?: string;
  rate_limits: {
    requests_per_minute: number;
    tokens_per_minute: number;
  };
  health_status: 'healthy' | 'degraded' | 'down';
  last_health_check: string;
}

interface LocalPreferences {
  provider_configs: ProviderConfig[];
  routing_strategy: 'priority' | 'cost' | 'latency' | 'quality';
  cost_limits: {
    daily_limit: number;
    monthly_limit: number;
    alert_threshold: number;
  };
}

export function ProviderConfig({ onClose }: ProviderConfigProps) {
  const toast = useToast();
  const [localPrefs, setLocalPrefs] = useState<LocalPreferences>({
    provider_configs: [],
    routing_strategy: 'priority',
    cost_limits: {
      daily_limit: 100,
      monthly_limit: 1000,
      alert_threshold: 80
    }
  });

  const handleAddProvider = () => {
    const newProvider: ProviderConfig = {
      id: `provider-${Date.now()}`,
      provider: 'openai',
      name: 'OpenAI',
      enabled: true,
      priority: localPrefs.provider_configs.length + 1,
      rate_limits: {
        requests_per_minute: 1000,
        tokens_per_minute: 150000
      },
      health_status: 'healthy',
      last_health_check: new Date().toISOString()
    };

    setLocalPrefs(prev => ({
      ...prev,
      provider_configs: [...prev.provider_configs, newProvider]
    }));
  };

  const handleRemoveProvider = (providerId: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      provider_configs: prev.provider_configs.filter(p => p.id !== providerId)
    }));
  };

  const handleUpdateProvider = (providerId: string, updates: Partial<ProviderConfig>) => {
    setLocalPrefs(prev => ({
      ...prev,
      provider_configs: prev.provider_configs.map(p =>
        p.id === providerId ? { ...p, ...updates } : p
      )
    }));
  };

  const handleMovePriority = (providerId: string, direction: 'up' | 'down') => {
    const providers = [...localPrefs.provider_configs];
    const currentIndex = providers.findIndex(p => p.id === providerId);
    
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= providers.length) return;

    // Swap providers
    const temp = providers[currentIndex];
    providers[currentIndex] = providers[newIndex];
    providers[newIndex] = temp;

    // Update priorities
    providers.forEach((provider, index) => {
      provider.priority = index + 1;
    });

    setLocalPrefs(prev => ({
      ...prev,
      provider_configs: providers
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implement actual save logic
      toast.success('Provider configuration saved successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save provider configuration');
      console.error(error);
    }
  };

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google' },
    { value: 'meta', label: 'Meta' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'cohere', label: 'Cohere' },
    { value: 'xai', label: 'xAI' }
  ];

  const routingStrategyOptions = [
    { value: 'priority', label: 'Priority Based' },
    { value: 'cost', label: 'Cost Optimized' },
    { value: 'latency', label: 'Latency Optimized' },
    { value: 'quality', label: 'Quality Optimized' }
  ];

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-blue-600" />
                Provider Configuration
              </h1>
              <p className="text-gray-600 mt-1">Configure AI providers and routing strategies</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>

          <div className="space-y-6">
            {/* Routing Strategy */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Routing Strategy</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Strategy"
                    value={localPrefs.routing_strategy}
                    onChange={(e) => setLocalPrefs(prev => ({
                      ...prev,
                      routing_strategy: e.target.value as 'priority' | 'cost' | 'latency' | 'quality'
                    }))}
                    options={routingStrategyOptions}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Cost Limit ($)
                    </label>
                    <Input
                      type="number"
                      value={localPrefs.cost_limits.daily_limit}
                      onChange={(e) => setLocalPrefs(prev => ({
                        ...prev,
                        cost_limits: {
                          ...prev.cost_limits,
                          daily_limit: Number(e.target.value)
                        }
                      }))}
                      min={0}
                      step={1}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Cost Limit ($)
                    </label>
                    <Input
                      type="number"
                      value={localPrefs.cost_limits.monthly_limit}
                      onChange={(e) => setLocalPrefs(prev => ({
                        ...prev,
                        cost_limits: {
                          ...prev.cost_limits,
                          monthly_limit: Number(e.target.value)
                        }
                      }))}
                      min={0}
                      step={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alert Threshold (%)
                    </label>
                    <Input
                      type="number"
                      value={localPrefs.cost_limits.alert_threshold}
                      onChange={(e) => setLocalPrefs(prev => ({
                        ...prev,
                        cost_limits: {
                          ...prev.cost_limits,
                          alert_threshold: Number(e.target.value)
                        }
                      }))}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Providers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Provider Configuration</h3>
                  <Button size="sm" onClick={handleAddProvider}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Provider
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {localPrefs.provider_configs.length === 0 && (
                    <div className="text-center py-8">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No providers configured</p>
                        <p className="text-sm text-gray-500 mt-1">Add providers to start using AI models</p>
                      </div>
                    </div>
                  )}

                  {localPrefs.provider_configs.map((provider, index) => (
                    <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col space-y-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMovePriority(provider.id, 'up')}
                              disabled={index === 0}
                              className="p-1 h-6"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMovePriority(provider.id, 'down')}
                              disabled={index === localPrefs.provider_configs.length - 1}
                              className="p-1 h-6"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary" size="sm">
                              Priority {provider.priority}
                            </Badge>
                            <Select
                              value={provider.provider}
                              onChange={(e) => handleUpdateProvider(provider.id, { 
                                provider: e.target.value,
                                name: providerOptions.find(p => p.value === e.target.value)?.label || e.target.value
                              })}
                              options={providerOptions}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={provider.enabled}
                              onChange={(e) => handleUpdateProvider(provider.id, { 
                                enabled: e.target.checked 
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Enabled</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Activity className="h-4 w-4 text-green-500" />
                            <Badge className={getHealthStatusColor(provider.health_status)}>
                              {provider.health_status}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveProvider(provider.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Provider Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                          </label>
                          <Input
                            type="password"
                            placeholder="Enter API key..."
                            value={provider.api_key || ''}
                            onChange={(e) => handleUpdateProvider(provider.id, { 
                              api_key: e.target.value 
                            })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base URL (Optional)
                          </label>
                          <Input
                            type="url"
                            placeholder="https://api.example.com"
                            value={provider.base_url || ''}
                            onChange={(e) => handleUpdateProvider(provider.id, { 
                              base_url: e.target.value 
                            })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Requests per Minute
                          </label>
                          <Input
                            type="number"
                            value={provider.rate_limits.requests_per_minute}
                            onChange={(e) => handleUpdateProvider(provider.id, {
                              rate_limits: {
                                ...provider.rate_limits,
                                requests_per_minute: parseInt(e.target.value) || 0
                              }
                            })}
                            min={0}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tokens per Minute
                          </label>
                          <Input
                            type="number"
                            value={provider.rate_limits.tokens_per_minute}
                            onChange={(e) => handleUpdateProvider(provider.id, {
                              rate_limits: {
                                ...provider.rate_limits,
                                tokens_per_minute: parseInt(e.target.value) || 0
                              }
                            })}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Configuration</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

