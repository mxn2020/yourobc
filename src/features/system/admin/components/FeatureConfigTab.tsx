// src/features/boilerplate/admin/components/FeatureConfigTab.tsx
/**
 * FeatureConfigTab Component
 *
 * Main tab content for feature configuration management.
 * Displays features organized by category with simple/advanced toggle.
 */

import React, { useState } from 'react';
import {
  Button,
  Switch,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Loading,
} from '@/components/ui';
import {
  Settings2,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { FeatureConfigSection } from './FeatureConfigSection';
import { ConfigChangeDialog } from './ConfigChangeDialog';
import { useFeatureConfigManagement } from '../hooks/useFeatureConfigManagement';
import type { Id } from '@/convex/_generated/dataModel';
import type { FeatureCategory } from '../types/config.types';

export interface FeatureConfigTabProps {
  // No props needed - auth handled by JWT
}

export function FeatureConfigTab() {
  // ============================================
  // STATE
  // ============================================

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>('core');

  // ============================================
  // DATA & HANDLERS
  // ============================================

  const {
    features,
    validationResults,
    unsavedChanges,
    validationErrors,
    pendingChange,
    isLoading,
    isSaving,
    isResetting,
    canSave,
    hasValidationErrors,
    handleConfigChange,
    handleSaveChanges,
    handleResetField,
    handleResetFeature,
    handleDiscardChanges,
    handleValidateAll,
    confirmPendingChange,
    cancelPendingChange,
  } = useFeatureConfigManagement();

  // ============================================
  // DERIVED DATA
  // ============================================

  // Group features by category
  const featuresByCategory = features.reduce((acc, feature) => {
    const category = feature.category as FeatureCategory;
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<FeatureCategory, typeof features>);

  // Get features for active category
  const categoryFeatures = featuresByCategory[activeCategory] ?? [];

  const categories: Array<{ id: FeatureCategory; label: string }> = [
    { id: 'core', label: 'Core' },
    { id: 'business', label: 'Business' },
    { id: 'integration', label: 'Integration' },
    { id: 'utility', label: 'Utility' },
  ];

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            Feature Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage runtime configuration for all features. Changes are saved to database and override environment variables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Advanced mode toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
            <Label htmlFor="advanced-mode" className="text-sm cursor-pointer">
              {showAdvanced ? (
                <>
                  <Eye className="h-4 w-4 inline mr-1" />
                  Advanced Mode
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 inline mr-1" />
                  Simple Mode
                </>
              )}
            </Label>
            <Switch
              id="advanced-mode"
              checked={showAdvanced}
              onChange={setShowAdvanced}
            />
          </div>

          {/* Validate button */}
          <Button variant="outline" onClick={handleValidateAll} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Validate All
          </Button>
        </div>
      </div>

      {/* Validation summary */}
      {validationResults && !validationResults.valid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configuration Validation Failed</AlertTitle>
          <AlertDescription>
            Found {validationResults.summary.totalErrors} error(s) and{' '}
            {validationResults.summary.totalWarnings} warning(s) across{' '}
            {validationResults.summary.invalidFeatures} feature(s). Please review and fix the issues before saving.
          </AlertDescription>
        </Alert>
      )}

      {/* Unsaved changes banner */}
      {unsavedChanges.hasChanges && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have {unsavedChanges.changes.size} unsaved change{unsavedChanges.changes.size > 1 ? 's' : ''}.
              {unsavedChanges.criticalChanges.length > 0 && (
                <> {unsavedChanges.criticalChanges.length} require restart or affect dependencies.</>
              )}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Discard
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveChanges}
                disabled={!canSave || isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as FeatureCategory)}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => {
            const count = featuresByCategory[category.id]?.length ?? 0;
            const changesInCategory = Array.from(unsavedChanges.changes.values()).filter((change) => {
              const feature = features.find((f) => f.id === change.feature);
              return feature?.category === category.id;
            }).length;

            return (
              <TabsTrigger key={category.id} value={category.id} className="gap-2">
                {category.label}
                <Badge variant="outline" className="text-xs">
                  {count}
                </Badge>
                {changesInCategory > 0 && (
                  <Badge variant="warning" className="text-xs">
                    {changesInCategory}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4 mt-6">
            {categoryFeatures.length > 0 ? (
              categoryFeatures.map((feature) => (
                <FeatureConfigSection
                  key={feature.id}
                  feature={feature}
                  config={{}} // This would come from actual feature config query
                  showAdvanced={showAdvanced}
                  unsavedChanges={unsavedChanges.changes}
                  validationErrors={validationErrors.filter((e) => e.feature === feature.id)}
                  onChange={(key, value) => {
                    handleConfigChange(feature.id, key, value, undefined);
                  }}
                  onReset={handleResetFeature}
                  onResetField={handleResetField}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No features in this category</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Confirmation dialog for critical changes */}
      <ConfigChangeDialog
        open={pendingChange !== null}
        change={pendingChange}
        onConfirm={confirmPendingChange}
        onCancel={cancelPendingChange}
      />

      {/* Sticky save bar at bottom */}
      {unsavedChanges.hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="font-medium">
                {unsavedChanges.changes.size} unsaved change{unsavedChanges.changes.size > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDiscardChanges}
                disabled={isSaving || isResetting}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Discard All
              </Button>

              <Button
                variant="secondary"
                onClick={handleSaveChanges}
                disabled={!canSave || isSaving || hasValidationErrors}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : `Save ${unsavedChanges.changes.size} Change${unsavedChanges.changes.size > 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
