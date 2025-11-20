// src/features/boilerplate/admin/hooks/useFeatureConfigManagement.ts
/**
 * useFeatureConfigManagement Hook
 *
 * Manages state and operations for feature configuration UI.
 * Handles data fetching, mutations, validation, and unsaved changes tracking.
 */

import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/features/boilerplate/notifications';
import { parseConvexError } from '@/utils/errorHandling';
import FeatureConfigService from '../services/FeatureConfigService';
import type {
  ConfigChange,
  FeatureConfigState,
  ValidationError,
  UnsavedChanges,
  ValueType,
} from '../types/config.types';
import type { Id } from '@/convex/_generated/dataModel';

// Helper to infer ValueType from a value
function inferValueType(value: any): ValueType {
  if (Array.isArray(value)) return 'array';
  const jsType = typeof value;
  if (jsType === 'string' || jsType === 'number' || jsType === 'boolean') {
    return jsType as ValueType;
  }
  return 'object';
}

export interface UseFeatureConfigManagementOptions {
  autoSave?: boolean;
}

export function useFeatureConfigManagement({
  autoSave = false,
}: UseFeatureConfigManagementOptions = {}) {
  const toast = useToast();

  // ============================================
  // STATE
  // ============================================

  const [configState, setConfigState] = useState<FeatureConfigState>({});
  const [unsavedChanges, setUnsavedChanges] = useState<Map<string, ConfigChange>>(new Map());
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [pendingChange, setPendingChange] = useState<ConfigChange | null>(null);

  // ============================================
  // DATA FETCHING
  // ============================================

  // Fetch all features overview
  const {
    data: featuresOverview,
    isPending: isFeaturesLoading,
    error: featuresError,
  } = FeatureConfigService.useGetFeaturesOverview();

  // Fetch validation results
  const {
    data: validationResults,
    isPending: isValidationLoading,
    refetch: refetchValidation,
  } = FeatureConfigService.useValidateAllConfigs();

  // ============================================
  // MUTATIONS
  // ============================================

  const setConfigMutation = FeatureConfigService.useSetConfigValue();
  const resetConfigMutation = FeatureConfigService.useResetConfigValue();
  const resetFeatureMutation = FeatureConfigService.useResetFeatureConfig();
  const batchUpdateMutation = FeatureConfigService.useBatchUpdateConfigs();

  // ============================================
  // DERIVED STATE
  // ============================================

  const unsavedChangesData: UnsavedChanges = useMemo(() => {
    const changesArray = Array.from(unsavedChanges.values());
    const criticalChanges = changesArray.filter(
      (change) =>
        change.requiresRestart || (change.affectedDependencies && change.affectedDependencies.length > 0)
    );

    return {
      changes: unsavedChanges,
      hasChanges: unsavedChanges.size > 0,
      criticalChanges,
    };
  }, [unsavedChanges]);

  const hasValidationErrors = validationErrors.length > 0;

  const canSave = unsavedChangesData.hasChanges && !hasValidationErrors;

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Handle configuration value change
   */
  const handleConfigChange = useCallback(
    (feature: string, key: string, newValue: any, oldValue: any, options?: {
      valueType?: ValueType;
      requiresRestart?: boolean;
      dependencies?: string[];
    }) => {
      const changeKey = `${feature}.${key}`;

      // Remove change if reverting to original value
      if (newValue === oldValue) {
        const newChanges = new Map(unsavedChanges);
        newChanges.delete(changeKey);
        setUnsavedChanges(newChanges);
        return;
      }

      // Add/update change
      const change: ConfigChange = {
        feature,
        key,
        oldValue,
        newValue,
        valueType: options?.valueType || inferValueType(newValue),
        requiresRestart: options?.requiresRestart || false,
        affectedDependencies: options?.dependencies,
      };

      const newChanges = new Map(unsavedChanges);
      newChanges.set(changeKey, change);
      setUnsavedChanges(newChanges);

      // Update local state
      setConfigState((prev) => ({
        ...prev,
        [feature]: {
          ...prev[feature],
          [key]: newValue,
        },
      }));

      // Auto-save if enabled and not critical
      if (autoSave && !change.requiresRestart && !change.affectedDependencies) {
        handleSaveChanges();
      }
    },
    [unsavedChanges, autoSave]
  );

  /**
   * Save all pending changes
   */
  const handleSaveChanges = useCallback(async () => {
    if (!canSave) return;

    try {
      const updates = Array.from(unsavedChanges.values()).map((change) => ({
        feature: change.feature,
        key: change.key,
        value: change.newValue,
        valueType: change.valueType as any,
      }));

      const result = await batchUpdateMutation.mutateAsync({
        updates,
        reason: 'Admin configuration update',
      });

      if (result.failed > 0) {
        const errors = result.results
          .filter((r: any) => !r.success)
          .map((r: any) => r.error || 'Unknown error')
          .join(', ');

        toast.error(`Failed to save ${result.failed} configurations: ${errors}`);
      }

      if (result.successful > 0) {
        toast.success(`Successfully saved ${result.successful} configuration${result.successful > 1 ? 's' : ''}`);

        // Clear unsaved changes for successful updates
        const newChanges = new Map(unsavedChanges);
        result.results.forEach((r) => {
          if (r.success) {
            newChanges.delete(`${r.feature}.${r.key}`);
          }
        });
        setUnsavedChanges(newChanges);

        // Show restart warning if needed
        const needsRestart = Array.from(unsavedChanges.values()).some((c) => c.requiresRestart);
        if (needsRestart) {
          toast.warning('Some changes require an application restart to take effect.');
        }
      }

      // Refresh validation
      await refetchValidation();
    } catch (error) {
      const { message } = parseConvexError(error);
      toast.error(`Failed to save configurations: ${message}`);
    }
  }, [canSave, unsavedChanges, batchUpdateMutation, toast, refetchValidation]);

  /**
   * Reset a single configuration field
   */
  const handleResetField = useCallback(
    async (feature: string, key: string) => {
      try {
        await resetConfigMutation.mutateAsync({
          feature,
          key,
        });

        toast.success(`Reset ${key} to default value`);

        // Remove from unsaved changes
        const changeKey = `${feature}.${key}`;
        const newChanges = new Map(unsavedChanges);
        newChanges.delete(changeKey);
        setUnsavedChanges(newChanges);

        // Refresh validation
        await refetchValidation();
      } catch (error) {
        const { message } = parseConvexError(error);
        toast.error(`Failed to reset ${key}: ${message}`);
      }
    },
    [resetConfigMutation, toast, unsavedChanges, refetchValidation]
  );

  /**
   * Reset entire feature configuration
   */
  const handleResetFeature = useCallback(
    async (feature: string) => {
      try {
        const result = await resetFeatureMutation.mutateAsync({
          feature,
        });

        if (result.success) {
          toast.success(`Reset all configurations for ${feature} (${result.resetCount} settings)`);

          // Remove all changes for this feature
          const newChanges = new Map(unsavedChanges);
          Array.from(newChanges.keys()).forEach((key) => {
            if (key.startsWith(`${feature}.`)) {
              newChanges.delete(key);
            }
          });
          setUnsavedChanges(newChanges);

          // Clear local state for this feature
          setConfigState((prev) => {
            const newState = { ...prev };
            delete newState[feature];
            return newState;
          });

          // Refresh validation
          await refetchValidation();
        }
      } catch (error) {
        const { message } = parseConvexError(error);
        toast.error(`Failed to reset ${feature}: ${message}`);
      }
    },
    [resetFeatureMutation, toast, unsavedChanges, refetchValidation]
  );

  /**
   * Discard all unsaved changes
   */
  const handleDiscardChanges = useCallback(() => {
    setUnsavedChanges(new Map());
    setConfigState({});
    toast.info('Discarded all unsaved changes');
  }, [toast]);

  /**
   * Validate all configurations
   */
  const handleValidateAll = useCallback(async () => {
    await refetchValidation();

    if (validationResults) {
      if (validationResults.valid) {
        toast.success('All configurations are valid');
      } else {
        toast.error(
          `Found ${validationResults.summary.totalErrors} error(s) and ${validationResults.summary.totalWarnings} warning(s)`
        );
      }
    }
  }, [refetchValidation, validationResults, toast]);

  /**
   * Request confirmation for critical change
   */
  const requestChangeConfirmation = useCallback((change: ConfigChange) => {
    setPendingChange(change);
  }, []);

  /**
   * Confirm pending change
   */
  const confirmPendingChange = useCallback(async () => {
    if (!pendingChange) return;

    try {
      await setConfigMutation.mutateAsync({
        feature: pendingChange.feature,
        key: pendingChange.key,
        value: pendingChange.newValue,
        valueType: pendingChange.valueType as any,
      });

      toast.success(`Updated ${pendingChange.key}`);

      // Remove from unsaved changes
      const changeKey = `${pendingChange.feature}.${pendingChange.key}`;
      const newChanges = new Map(unsavedChanges);
      newChanges.delete(changeKey);
      setUnsavedChanges(newChanges);

      setPendingChange(null);

      // Refresh validation
      await refetchValidation();
    } catch (error) {
      const { message } = parseConvexError(error);
      toast.error(`Failed to save change: ${message}`);
    }
  }, [pendingChange, setConfigMutation, toast, unsavedChanges, refetchValidation]);

  /**
   * Cancel pending change
   */
  const cancelPendingChange = useCallback(() => {
    setPendingChange(null);
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    features: featuresOverview ?? [],
    validationResults,
    unsavedChanges: unsavedChangesData,
    validationErrors,
    pendingChange,

    // Loading states
    isLoading: isFeaturesLoading || isValidationLoading,
    isSaving: batchUpdateMutation.isPending || setConfigMutation.isPending,
    isResetting: resetConfigMutation.isPending || resetFeatureMutation.isPending,

    // Computed
    canSave,
    hasValidationErrors,

    // Handlers
    handleConfigChange,
    handleSaveChanges,
    handleResetField,
    handleResetFeature,
    handleDiscardChanges,
    handleValidateAll,
    requestChangeConfirmation,
    confirmPendingChange,
    cancelPendingChange,

    // Errors
    error: featuresError,
  };
}
