// src/features/ai-testing/components/TestRunner/TestRunner.tsx
import React, { useState, useCallback } from 'react';
import { Play, Settings, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { TestForm } from './TestForm';
import { TestResults } from './TestResults';
import type { TestFormData } from '../../types/test.types';
import type { TestResult } from '@/features/boilerplate/ai-core/types';
import { useToast } from '@/features/boilerplate/notifications';
import { useModelTesting } from '../../hooks/useModelTesting';

export function TestRunner() {
  const toast = useToast();
  const [formData, setFormData] = useState<TestFormData | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(true);
  
  const { executeSingleTest, validateForm, createConfiguration, isExecuting, errors } = useModelTesting();

  const handleFormSubmit = useCallback(async (data: TestFormData) => {
    const validation = validateForm(data);
    
    if (!validation.valid) {
      toast.error(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => toast.warning(warning));
    }

    setFormData(data);
    
    try {
      const config = createConfiguration(data);
      const result = await executeSingleTest(config);
      setTestResult(result);
      setIsFormVisible(false);
      toast.success('Test completed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Test execution failed');
    }
  }, [validateForm, createConfiguration, executeSingleTest]);

  const handleNewTest = useCallback(() => {
    setTestResult(null);
    setIsFormVisible(true);
    setFormData(null);
  }, []);

  const handleEditTest = useCallback(() => {
    setIsFormVisible(true);
  }, []);

  if (!isFormVisible && testResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Test Completed</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={handleEditTest}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Test
                </Button>
                <Button onClick={handleNewTest}>
                  New Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {formData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Test Configuration</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span> {formData.name}
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span> {formData.type}
                  </div>
                  <div>
                    <span className="text-gray-600">Model:</span> {formData.modelId}
                  </div>
                  <div>
                    <span className="text-gray-600">Iterations:</span> {formData.iterations}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <TestResults result={testResult} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Configure Test</h3>
          </div>
          <p className="text-sm text-gray-600">
            Set up and execute a single AI model test
          </p>
        </CardHeader>
        <CardContent>
          {errors.singleTest && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                {errors.singleTest.message}
              </div>
            </div>
          )}
          
          <TestForm 
            initialData={formData} 
            onSubmit={handleFormSubmit}
            isLoading={isExecuting}
          />
        </CardContent>
      </Card>
    </div>
  );
}