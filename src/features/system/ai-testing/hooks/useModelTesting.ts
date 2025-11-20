// src/features/ai-testing/hooks/useModelTesting.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { TestConfiguration, TestResult } from '@/features/boilerplate/ai-core/types';
import type { 
  TestFormData, 
  TestExecutionRequest, 
  TestComparisonConfig, 
  ParameterTuningConfig, 
  BatchTestConfig 
} from '../types/test.types';
import { 
  TestExecutor,
  type TextGenerationConfig,
  type StreamingConfig,
  type ObjectGenerationConfig,
  type EmbeddingConfig,
  type ImageGenerationConfig
} from '../services/TestExecutor';
import { TestValidator } from '../services/TestValidator';

const testExecutor = new TestExecutor();
const testValidator = new TestValidator();

export function useModelTesting() {
  const queryClient = useQueryClient();

  // Original methods
  const executeSingleTest = useMutation({
    mutationFn: async (config: TestConfiguration): Promise<TestResult> => {
      const validation = testValidator.validateConfiguration(config);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      return testExecutor.executeSingleTest(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-history'] });
    }
  });

  const executeBatchTests = useMutation({
    mutationFn: async (request: TestExecutionRequest) => {
      const validation = testValidator.validateBatch(request.configurations);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      return testExecutor.executeTests(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-history'] });
    }
  });

  const executeComparison = useMutation({
    mutationFn: (config: TestComparisonConfig) => testExecutor.executeComparison(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-history'] });
    }
  });

  const executeParameterTuning = useMutation({
    mutationFn: (config: ParameterTuningConfig) => testExecutor.executeParameterTuning(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-history'] });
    }
  });

  const executeBatchTest = useMutation({
    mutationFn: (config: BatchTestConfig) => testExecutor.executeBatchTest(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-history'] });
    }
  });

  // Individual test type mutations
  const executeTextGeneration = useMutation({
    mutationFn: async (config: TextGenerationConfig): Promise<TestResult> => {
      return testExecutor.executeTextGeneration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-history'] });
    }
  });

  const executeTextStreaming = useMutation({
    mutationFn: async (config: StreamingConfig): Promise<ReadableStream> => {
      return testExecutor.executeTextStreaming(config);
    }
  });

  const executeObjectGeneration = useMutation({
    mutationFn: async (config: ObjectGenerationConfig): Promise<TestResult> => {
      return testExecutor.executeObjectGeneration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-history'] });
    }
  });

  const executeObjectStreaming = useMutation({
    mutationFn: async (config: ObjectGenerationConfig): Promise<ReadableStream> => {
      return testExecutor.executeObjectStreaming(config);
    }
  });

  const executeEmbedding = useMutation({
    mutationFn: async (config: EmbeddingConfig) => {
      return testExecutor.executeEmbedding(config);
    }
  });

  const executeImageGeneration = useMutation({
    mutationFn: async (config: ImageGenerationConfig) => {
      return testExecutor.executeImageGeneration(config);
    }
  });

  // Utility methods
  const validateForm = useCallback((data: TestFormData) => {
    return testValidator.validateForm(data);
  }, []);

  const createConfiguration = useCallback((data: TestFormData): TestConfiguration => {
    return {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      type: data.type,
      modelId: data.modelId,
      parameters: data.parameters,
      expectedResults: data.expectedResults,
      iterations: data.iterations,
      timeout: data.timeout,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }, []);

  // Check if any operation is executing
  const isExecuting = useMemo(() => {
    return executeSingleTest.isPending || 
           executeBatchTests.isPending || 
           executeComparison.isPending || 
           executeParameterTuning.isPending || 
           executeBatchTest.isPending ||
           executeTextGeneration.isPending ||
           executeTextStreaming.isPending ||
           executeObjectGeneration.isPending ||
           executeObjectStreaming.isPending ||
           executeEmbedding.isPending ||
           executeImageGeneration.isPending;
  }, [
    executeSingleTest.isPending,
    executeBatchTests.isPending,
    executeComparison.isPending,
    executeParameterTuning.isPending,
    executeBatchTest.isPending,
    executeTextGeneration.isPending,
    executeTextStreaming.isPending,
    executeObjectGeneration.isPending,
    executeObjectStreaming.isPending,
    executeEmbedding.isPending,
    executeImageGeneration.isPending
  ]);

  // Individual loading states
  const loadingStates = useMemo(() => ({
    singleTest: executeSingleTest.isPending,
    batchTests: executeBatchTests.isPending,
    comparison: executeComparison.isPending,
    parameterTuning: executeParameterTuning.isPending,
    batchTest: executeBatchTest.isPending,
    textGeneration: executeTextGeneration.isPending,
    textStreaming: executeTextStreaming.isPending,
    objectGeneration: executeObjectGeneration.isPending,
    objectStreaming: executeObjectStreaming.isPending,
    embedding: executeEmbedding.isPending,
    imageGeneration: executeImageGeneration.isPending
  }), [
    executeSingleTest.isPending,
    executeBatchTests.isPending,
    executeComparison.isPending,
    executeParameterTuning.isPending,
    executeBatchTest.isPending,
    executeTextGeneration.isPending,
    executeTextStreaming.isPending,
    executeObjectGeneration.isPending,
    executeObjectStreaming.isPending,
    executeEmbedding.isPending,
    executeImageGeneration.isPending
  ]);

  return {
    // Original methods
    executeSingleTest: executeSingleTest.mutateAsync,
    executeBatchTests: executeBatchTests.mutateAsync,
    executeComparison: executeComparison.mutateAsync,
    executeParameterTuning: executeParameterTuning.mutateAsync,
    executeBatchTest: executeBatchTest.mutateAsync,
    
    // Individual test type methods
    executeTextGeneration: executeTextGeneration.mutateAsync,
    executeTextStreaming: executeTextStreaming.mutateAsync,
    executeObjectGeneration: executeObjectGeneration.mutateAsync,
    executeObjectStreaming: executeObjectStreaming.mutateAsync,
    executeEmbedding: executeEmbedding.mutateAsync,
    executeImageGeneration: executeImageGeneration.mutateAsync,
    
    // Utility methods
    validateForm,
    createConfiguration,
    
    // Loading states
    isExecuting,
    loadingStates,
    
    // Error states
    errors: {
      singleTest: executeSingleTest.error,
      batchTests: executeBatchTests.error,
      comparison: executeComparison.error,
      parameterTuning: executeParameterTuning.error,
      batchTest: executeBatchTest.error,
      textGeneration: executeTextGeneration.error,
      textStreaming: executeTextStreaming.error,
      objectGeneration: executeObjectGeneration.error,
      objectStreaming: executeObjectStreaming.error,
      embedding: executeEmbedding.error,
      imageGeneration: executeImageGeneration.error
    }
  };
}