// src/features/boilerplate/admin/components/ConfigField.tsx
/**
 * ConfigField Component
 *
 * Renders appropriate input control for configuration values based on type.
 * Supports validation, default value hints, and restart warnings.
 */

import React, { useState, useEffect } from 'react';
import { Input, Textarea, Switch, SimpleSelect, Badge, Tooltip, Label } from '@/components/ui';
import { RotateCcw, AlertTriangle, Info } from 'lucide-react';
import type { ConfigFieldProps } from '../types/config.types';

export function ConfigField({
  feature,
  fieldKey,
  label,
  value,
  defaultValue,
  valueType,
  description,
  advanced = false,
  requiresRestart = false,
  validationRules,
  disabled = false,
  onChange,
  onReset,
}: ConfigFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Sync local value with prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Validate on value change
  useEffect(() => {
    if (touched && validationRules) {
      const error = validateValue(localValue, valueType, validationRules);
      setValidationError(error);
    }
  }, [localValue, touched, valueType, validationRules]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    setTouched(true);

    // Debounce onChange callback
    const timeoutId = setTimeout(() => {
      onChange(fieldKey, newValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleReset = () => {
    setLocalValue(defaultValue);
    setTouched(false);
    setValidationError(null);
    onReset(fieldKey);
  };

  const isModified = localValue !== defaultValue;

  return (
    <div className="space-y-2">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={`${feature}-${fieldKey}`} className="text-sm font-medium">
            {label}
            {advanced && (
              <Badge variant="outline" className="ml-2 text-xs">
                Advanced
              </Badge>
            )}
          </Label>

          {/* Info tooltip */}
          {description && (
            <Tooltip content={description}>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          )}

          {/* Restart warning */}
          {requiresRestart && isModified && (
            <Tooltip content="Changes require app restart to take effect">
              <Badge variant="warning" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Restart Required
              </Badge>
            </Tooltip>
          )}
        </div>

        {/* Reset button */}
        {isModified && !disabled && (
          <Tooltip content={`Reset to default: ${formatValue(defaultValue, valueType)}`}>
            <button
              type="button"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Reset to default"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Input Control */}
      <div className="space-y-1">
        {renderInput()}

        {/* Default value hint */}
        {!isModified && defaultValue !== undefined && (
          <p className="text-xs text-muted-foreground">
            Default: {formatValue(defaultValue, valueType)}
          </p>
        )}

        {/* Validation error */}
        {validationError && touched && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {validationError}
          </p>
        )}
      </div>
    </div>
  );

  // Render appropriate input based on value type
  function renderInput() {
    const inputId = `${feature}-${fieldKey}`;

    switch (valueType) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              id={inputId}
              checked={localValue === true}
              onChange={(checked: boolean) => handleChange(checked)}
              disabled={disabled}
            />
            <span className="text-sm text-muted-foreground">
              {localValue ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );

      case 'number':
        return (
          <Input
            id={inputId}
            type="number"
            value={localValue ?? ''}
            onChange={(e) => {
              const num = e.target.value === '' ? undefined : Number(e.target.value);
              handleChange(num);
            }}
            min={validationRules?.min}
            max={validationRules?.max}
            disabled={disabled}
            placeholder={defaultValue?.toString()}
          />
        );

      case 'string':
        // Use enum dropdown if enum validation exists
        if (validationRules?.enum && Array.isArray(validationRules.enum)) {
          return (
            <SimpleSelect
              id={inputId}
              value={localValue ?? ''}
              onChange={(value) => handleChange(value)}
              options={validationRules.enum.map((opt) => ({
                value: opt,
                label: opt,
              }))}
              disabled={disabled}
              placeholder={`Select... (default: ${defaultValue})`}
            />
          );
        }

        // Use textarea for long strings
        if (typeof localValue === 'string' && localValue.length > 100) {
          return (
            <Textarea
              id={inputId}
              value={localValue ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              placeholder={defaultValue}
              rows={3}
            />
          );
        }

        // Standard text input
        return (
          <Input
            id={inputId}
            type="text"
            value={localValue ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder={defaultValue}
            pattern={validationRules?.pattern}
          />
        );

      case 'object':
      case 'array':
        // JSON editor for complex types (advanced only)
        return (
          <Textarea
            id={inputId}
            value={
              localValue !== undefined && localValue !== null
                ? JSON.stringify(localValue, null, 2)
                : ''
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(parsed);
              } catch {
                // Invalid JSON - don't update
                setValidationError('Invalid JSON format');
              }
            }}
            disabled={disabled}
            placeholder={JSON.stringify(defaultValue, null, 2)}
            rows={6}
            className="font-mono text-sm"
          />
        );

      default:
        return (
          <Input
            id={inputId}
            type="text"
            value={localValue?.toString() ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder={defaultValue?.toString()}
          />
        );
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate a value against validation rules
 */
function validateValue(
  value: any,
  valueType: string,
  rules: ConfigFieldProps['validationRules']
): string | null {
  if (!rules) return null;

  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    return 'This field is required';
  }

  // Type-specific validation
  if (valueType === 'number' && typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `Value must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && value > rules.max) {
      return `Value must be at most ${rules.max}`;
    }
  }

  if (valueType === 'string' && typeof value === 'string') {
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        return 'Value does not match required pattern';
      }
    }
    if (rules.enum && !rules.enum.includes(value)) {
      return `Value must be one of: ${rules.enum.join(', ')}`;
    }
  }

  return null;
}

/**
 * Format value for display
 */
function formatValue(value: any, valueType: string): string {
  if (value === undefined || value === null) {
    return 'Not set';
  }

  switch (valueType) {
    case 'boolean':
      return value ? 'Enabled' : 'Disabled';
    case 'object':
    case 'array':
      return JSON.stringify(value);
    default:
      return String(value);
  }
}
