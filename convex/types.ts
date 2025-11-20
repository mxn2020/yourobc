// convex/types.ts - TypeScript types that match Convex schema definitions

/**
 * User roles available in the system
 * Must match the statusTypes.role union in convex/schema/base.ts
 */
export type UserRole = 'superadmin' | 'admin' | 'user' | 'moderator' | 'editor' | 'analyst' | 'guest' 

/**
 * Project status types
 * Must match the statusTypes.project union in convex/schema/base.ts
 */
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled'

/**
 * Priority levels
 * Must match the statusTypes.priority union in convex/schema/base.ts
 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Theme modes
 * Must match the statusTypes.theme union in convex/schema/base.ts
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * Test status types
 * Must match the statusTypes.testStatus union in convex/schema/base.ts
 */
export type TestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * Notification types
 * Must match the statusTypes.notificationType union in convex/schema/base.ts
 */
export type NotificationType = 'assignment' | 'completion' | 'invite' | 'achievement' | 'reminder' | 'mention' | 'request' | 'info' | 'success' | 'error'

/**
 * Entity types - Now managed via configuration system
 *
 * TO CUSTOMIZE ENTITY TYPES:
 * - DO NOT modify this file
 * - Instead, edit: convex/config/app/entities.config.ts
 * - Add your app/addon entities there to avoid merge conflicts
 *
 * The configuration system merges:
 * - Boilerplate entities (from convex/config/boilerplate/entities.config.ts)
 * - Your app entities (from convex/config/app/entities.config.ts)
 */
export {
  ALL_ENTITY_TYPES,
  COMMENTABLE_ENTITY_TYPES,
  DOCUMENTABLE_ENTITY_TYPES,
  type EntityType,
  type CommentableEntityType,
  type DocumentableEntityType,
} from './config';

/**
 * Prompt-specific status types
 */
export type PromptStatus = 'draft' | 'testing' | 'production' | 'deprecated' | 'archived'
export type PromptLibraryStatus = 'active' | 'archived' | 'template'
export type PromptProjectStatus = 'active' | 'archived' | 'template'
export type PromptWorkflowStatus = 'draft' | 'active' | 'paused' | 'archived'

/**
 * Platform types for AI models
 */
export type Platform = 'claude' | 'gpt-3.5' | 'gpt-4' | 'gemini' | 'llama' | 'mistral' | 'custom'

/**
 * Template types
 */
export type TemplateType = 
  | 'instructional'
  | 'role_based'
  | 'format'
  | 'analysis'
  | 'creative'
  | 'conversational'
  | 'task_specific'

/**
 * Component types
 */
export type ComponentType = 
  | 'instruction'
  | 'example'
  | 'constraint'
  | 'system_message'
  | 'output_format'
  | 'variable'

/**
 * Variable types
 */
export type VariableType = 'static' | 'dynamic' | 'conditional'

/**
 * Change types for versioning
 */
export type ChangeType = 'major' | 'minor' | 'patch'

/**
 * Inheritance models
 */
export type InheritanceModel = 'reference' | 'instance' | 'clone' | 'live_link'

/**
 * AI Agent types for prompt engineering
 */
export type AIAgentType = 
  | 'template_generator'
  | 'best_practice_advisor'
  | 'component_curator'
  | 'prompt_generator'
  | 'prompt_optimizer'
  | 'prompt_analyzer'
  | 'example_generator'
  | 'test_designer'
  | 'platform_adapter'
  | 'performance_analyzer'
  | 'cost_analyzer'
  | 'quality_evaluator'
  | 'failure_analyzer'
  | 'variable_suggester'
  | 'example_improver'
  | 'format_optimizer'
  | 'constraint_enhancer'

/**
 * Entity type labels - Now managed via configuration system
 * Auto-generated from entity types in config
 */
export { ENTITY_TYPE_LABELS } from './config';