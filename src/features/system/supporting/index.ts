// src/features/system/supporting/index.ts

// Configuration
export * from './config';

// Shared utilities
export * from './shared';

// Comments
export * from './comments';

// Documents
export * from './documents';

// Reminders
export * from './reminders';

// Wiki
export * from './wiki';

// Scheduling
export * from './scheduling';

// Virtual Lists - Export with namespace to avoid conflicts
export {
  VirtualList,
  VirtualListDynamic,
  VirtualTable,
  VirtualGrid,
  VirtualMasonry,
  VirtualListSticky,
  VirtualWindowList,
  VirtualTableSortable,
  useVirtualScroll,
  useInfiniteScroll,
  useInfiniteScrollElement,
  useVirtualSticky,
  useVirtualMasonry,
  useVirtualGrid,
  useVirtualSmoothScroll,
  easingFunctions,
  calculateVirtualListMetrics,
  getEstimatedSize,
  getOptimalOverscan,
  formatPerformanceRatio,
  shouldUseVirtualization,
  calculateScrollPercentage,
  virtualPresets,
  useVirtualizer,
  useWindowVirtualizer,
} from './virtual-lists';

// Export preset utilities from virtual-lists with prefix to avoid conflicts
export {
  getPreset as getVirtualPreset,
  extendPreset as extendVirtualPreset,
  presetRecommendations as virtualPresetRecommendations,
  presetExamples as virtualPresetExamples,
} from './virtual-lists';

// Export types from virtual-lists
export type {
  VirtualListProps,
  VirtualTableProps,
  VirtualTableColumn,
  VirtualGridProps,
  VirtualMasonryProps,
  VirtualListStickyProps,
  VirtualWindowListProps,
  VirtualListPreset,
  VirtualListPresetName,
  VirtualListMetrics,
  UseVirtualListReturn,
  UseInfiniteScrollOptions,
  UseVirtualStickyOptions,
  UseVirtualMasonryOptions,
  UseVirtualGridOptions,
  SmoothScrollOptions,
  Virtualizer,
  VirtualItem,
} from './virtual-lists';

// Forms - Export with explicit names to avoid conflicts
export {
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  CheckboxField,
  SubmitButton,
  ResetButton,
  FieldInfo,
  FormSection,
  createFormContexts,
  DefaultFormContext,
  DefaultFieldContext,
  useDefaultFormContext,
  useDefaultFieldContext,
  validators,
  composeValidators,
  useFieldValidation,
  formPresets,
  SimpleForm,
  ComponentForm,
  useForm,
  useField,
} from './forms';

// Export pattern components from forms
export * from './forms/components/patterns';
export * from './forms/hooks/patterns';

// Export preset utilities from forms with prefix to avoid conflicts
export {
  getPreset as getFormPreset,
  extendPreset as extendFormPreset,
  presetRecommendations as formPresetRecommendations,
  presetExamples as formPresetExamples,
} from './forms';

// Export types from forms
export type {
  BaseFormOptions,
  FieldComponentOptions,
  TextFieldProps,
  NumberFieldProps,
  TextareaFieldProps,
  SelectFieldProps,
  CheckboxFieldProps,
  FormContextValue,
  FieldContextValue,
  FormHookConfig,
  FieldInfoProps,
  FormPreset,
  FormPresetName,
  FieldValidator,
  AsyncFieldValidator,
  SubmitButtonProps,
  ResetButtonProps,
  FieldErrorProps,
  FormSectionProps,
  FormApi,
  FieldApi,
  ValidationError,
} from './forms';

// Tables
export * from './tables';

// Note: Notifications is a main feature located at:
// src/features/system/notifications/
