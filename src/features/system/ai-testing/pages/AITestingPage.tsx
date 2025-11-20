// src/features/ai-testing/pages/AITestingPage.tsx
import React, { useState, useMemo } from 'react';
import { TestTube, Play, History, BarChart3 } from 'lucide-react';
import { Button, Card, Tabs } from '@/components/ui';
import { TestRunner } from '../components/TestRunner/TestRunner';
import { TestHistory } from '../components/TestHistory/TestHistory';
import { TextGenerationTest } from '../components/TestTypes/TextGenerationTest';
import { TextStreamingTest } from '../components/TestTypes/TextStreamingTest';
import { ObjectGenerationTest } from '../components/TestTypes/ObjectGenerationTest';
import { ObjectStreamingTest } from '../components/TestTypes/ObjectStreamingTest';
import { EmbeddingTest } from '../components/TestTypes/EmbeddingTest';
import { ImageGenerationTest } from '../components/TestTypes/ImageGenerationTest';
import { ModelComparisonTest } from '../components/TestTypes/ModelComparisonTest';
import { ParameterTuningTest } from '../components/TestTypes/ParameterTuningTest';
import { BatchTest } from '../components/TestTypes/BatchTest';
import { useTestHistory } from '../hooks/useTestHistory';

type TabId = 'runner' | 'types' | 'history';
type TestTypeId = 'text' | 'streaming' | 'object' | 'object-streaming' | 'embedding' | 'image' | 'comparison' | 'tuning' | 'batch';

export function AITestingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('runner');
  const [activeTestType, setActiveTestType] = useState<TestTypeId>('text');
  
  const { summary, isLoading: historyLoading } = useTestHistory({ limit: 10 });

  const tabs = useMemo(() => [
    {
      id: 'runner' as const,
      name: 'Test Runner',
      icon: Play,
      description: 'Execute AI model tests'
    },
    {
      id: 'types' as const,
      name: 'Test Types',
      icon: TestTube,
      description: 'Specialized testing tools'
    },
    {
      id: 'history' as const,
      name: 'Test History',
      icon: History,
      description: 'View past test results'
    }
  ], []);

  const testTypes = useMemo(() => [
    {
      id: 'text' as const,
      name: 'Text Generation',
      description: 'Test text generation capabilities',
      component: TextGenerationTest
    },
    {
      id: 'streaming' as const,
      name: 'Text Streaming',
      description: 'Real-time streaming text generation',
      component: TextStreamingTest
    },
    {
      id: 'object' as const,
      name: 'Object Generation',
      description: 'Generate structured data objects',
      component: ObjectGenerationTest
    },
    {
      id: 'object-streaming' as const,
      name: 'Object Streaming',
      description: 'Real-time streaming structured objects',
      component: ObjectStreamingTest
    },
    {
      id: 'embedding' as const,
      name: 'Embedding Generation',
      description: 'Generate vector embeddings from text',
      component: EmbeddingTest
    },
    {
      id: 'image' as const,
      name: 'Image Generation',
      description: 'Generate images from text prompts',
      component: ImageGenerationTest
    },
    {
      id: 'comparison' as const,
      name: 'Model Comparison',
      description: 'Compare multiple models',
      component: ModelComparisonTest
    },
    {
      id: 'tuning' as const,
      name: 'Parameter Tuning',
      description: 'Optimize model parameters',
      component: ParameterTuningTest
    },
    {
      id: 'batch' as const,
      name: 'Batch Testing',
      description: 'Run multiple tests in batch',
      component: BatchTest
    }
  ], []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'runner':
        return <TestRunner />;
      
      case 'types':
        const ActiveTestComponent = testTypes.find(t => t.id === activeTestType)?.component || TextGenerationTest;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {testTypes.map(testType => (
                <Card 
                  key={testType.id}
                  className={`cursor-pointer transition-colors ${
                    activeTestType === testType.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTestType(testType.id)}
                >
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{testType.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{testType.description}</p>
                  </div>
                </Card>
              ))}
            </div>
            <ActiveTestComponent />
          </div>
        );
      
      case 'history':
        return <TestHistory />;
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <TestTube className="h-8 w-8 mr-3 text-blue-600" />
              AI Model Testing
            </h1>
            <p className="text-lg text-gray-600">
              Test, compare, and optimize AI model performance
            </p>
          </div>
          
          {summary && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.running}</div>
                <div className="text-gray-600">Running</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}