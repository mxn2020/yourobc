// src/features/system/admin/components/FeatureConfigSection.tsx
/**
 * FeatureConfigSection Component
 *
 * Displays configuration section for a single feature.
 * Groups settings by section and handles simple/advanced view toggle.
 */

import React from 'react';
import { Card, CardHeader, CardContent, Badge, Button, Tooltip } from '@/components/ui';
import { RotateCcw, CheckCircle2, XCircle, AlertCircle, Link } from 'lucide-react';
import { ConfigField } from './ConfigField';
import type { FeatureConfigSectionProps, ValueType } from '../types/config.types';

export function FeatureConfigSection({
  feature,
  config,
  showAdvanced,
  unsavedChanges,
  validationErrors,
  onChange,
  onReset,
  onResetField,
}: FeatureConfigSectionProps) {
  // Filter config keys based on show advanced toggle
  const configKeys = Object.keys(config).filter((key) => {
    // Always show simple fields
    if (isSimpleField(key)) return true;

    // Show advanced fields only when toggle is on
    if (isAdvancedField(key)) return showAdvanced;

    // By default, show in simple mode
    return !showAdvanced ? !isAdvancedField(key) : true;
  });

  // Get changes for this feature
  const featureChanges = Array.from(unsavedChanges.values()).filter(
    (change) => change.feature === feature.id
  );

  // Get validation errors for this feature
  const featureErrors = validationErrors.filter((error) => error.feature === feature.id);

  // Check if feature has dependencies
  const hasDependencies = feature.dependencies && feature.dependencies.length > 0;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{feature.name}</h3>
              <Badge variant={feature.enabled ? 'success' : 'secondary'}>
                {feature.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                v{feature.version}
              </Badge>
            </div>

            {/* Dependencies */}
            {hasDependencies && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link className="h-3 w-3" />
                <span>
                  Depends on:{' '}
                  {feature.dependencies!.map((dep, i) => (
                    <React.Fragment key={dep}>
                      {i > 0 && ', '}
                      <span className="font-mono text-xs">{dep}</span>
                    </React.Fragment>
                  ))}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicators */}
            {featureChanges.length > 0 && (
              <Tooltip content={`${featureChanges.length} unsaved change${featureChanges.length > 1 ? 's' : ''}`}>
                <Badge variant="warning" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {featureChanges.length}
                </Badge>
              </Tooltip>
            )}

            {featureErrors.length > 0 && (
              <Tooltip content={`${featureErrors.length} validation error${featureErrors.length > 1 ? 's' : ''}`}>
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  {featureErrors.length}
                </Badge>
              </Tooltip>
            )}

            {feature.overrideCount > 0 && (
              <Tooltip content={`${feature.overrideCount} custom override${feature.overrideCount > 1 ? 's' : ''}`}>
                <Badge variant="outline" className="gap-1">
                  {feature.overrideCount} override{feature.overrideCount > 1 ? 's' : ''}
                </Badge>
              </Tooltip>
            )}

            {/* Reset button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReset(feature.id)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Configuration fields grouped by section */}
          {groupConfigsBySection(configKeys, config).map((section) => (
            <div key={section.name} className="space-y-4">
              {section.name !== 'General' && (
                <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
                  {section.name}
                </h4>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((key) => (
                  <ConfigField
                    key={key}
                    feature={feature.id}
                    fieldKey={key}
                    label={formatFieldLabel(key)}
                    value={config[key]}
                    defaultValue={getDefaultValue(key, config)}
                    valueType={getValueType(config[key])}
                    description={getFieldDescription(key)}
                    advanced={isAdvancedField(key)}
                    requiresRestart={isRestartRequired(key)}
                    validationRules={getValidationRules(key)}
                    onChange={(fieldKey, value) => onChange(fieldKey, value)}
                    onReset={(fieldKey) => onResetField(feature.id, fieldKey)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Show message if no fields in current view mode */}
          {configKeys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No {showAdvanced ? 'advanced ' : ''}settings available for this feature.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if field is a simple (high-level) field
 */
function isSimpleField(key: string): boolean {
  const simpleFields = [
    'enabled',
    'provider',
    'primaryProvider',
    'defaultModel',
    'defaultVisibility',
    'defaultStatus',
  ];

  return simpleFields.some((field) => key.toLowerCase().includes(field));
}

/**
 * Check if field is an advanced field
 */
function isAdvancedField(key: string): boolean {
  const advancedKeywords = [
    'rate',
    'limit',
    'timeout',
    'retention',
    'interval',
    'batch',
    'max',
    'min',
    'concurrent',
    'validation',
    'debug',
    'verbose',
  ];

  return advancedKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

/**
 * Check if field requires restart
 */
function isRestartRequired(key: string): boolean {
  const restartFields = ['provider', 'primaryProvider', 'enabled', 'apiKey', 'secret'];

  return restartFields.some((field) => key.toLowerCase().includes(field));
}

/**
 * Get value type for field
 */
function getValueType(value: any): ValueType {
  if (value === null || value === undefined) return 'string';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'string';
}

/**
 * Get default value for field
 */
function getDefaultValue(key: string, config: Record<string, any>): any {
  // In a real implementation, this would come from the config metadata
  // For now, return current value as placeholder
  return config[key];
}

/**
 * Get field description
 */
function getFieldDescription(key: string): string | undefined {
  // Map of common field descriptions
  const descriptions: Record<string, string> = {
    enabled: 'Enable or disable this feature',
    provider: 'Select the provider for this feature',
    defaultModel: 'Default AI model to use',
    rateLimitRPM: 'Maximum requests per minute',
    rateLimitRPH: 'Maximum requests per hour',
    retentionDays: 'Number of days to retain data',
    maxTokens: 'Maximum tokens per request',
    temperature: 'Model creativity (0.0 - 2.0)',
  };

  return descriptions[key];
}

/**
 * Get validation rules for field
 */
function getValidationRules(key: string): any {
  // Common validation rules
  if (key.includes('rate') || key.includes('limit') || key.includes('max')) {
    return { min: 0 };
  }

  if (key === 'temperature') {
    return { min: 0, max: 2 };
  }

  if (key.includes('retention')) {
    return { min: 1, max: 365 };
  }

  return undefined;
}

/**
 * Format field key as label
 */
function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .replace(/_/g, ' ') // Replace underscores with spaces
    .trim();
}

/**
 * Group config keys by section
 */
function groupConfigsBySection(keys: string[], config: Record<string, any>): Array<{ name: string; fields: string[] }> {
  const sections: Record<string, string[]> = {
    General: [],
    Limits: [],
    Features: [],
    Providers: [],
    Security: [],
    Advanced: [],
  };

  keys.forEach((key) => {
    if (key.includes('limit') || key.includes('max') || key.includes('min')) {
      sections.Limits.push(key);
    } else if (key.includes('provider') || key.includes('Provider')) {
      sections.Providers.push(key);
    } else if (key.includes('enabled') || key.includes('enable')) {
      sections.Features.push(key);
    } else if (key.includes('secret') || key.includes('key') || key.includes('password')) {
      sections.Security.push(key);
    } else if (isAdvancedField(key)) {
      sections.Advanced.push(key);
    } else {
      sections.General.push(key);
    }
  });

  // Return only non-empty sections
  return Object.entries(sections)
    .filter(([_, fields]) => fields.length > 0)
    .map(([name, fields]) => ({ name, fields }));
}
