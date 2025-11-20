// Main features package exports
// All feature packages are organized under this central export

// Core Features
export * as Projects from './boilerplate/projects'
export * as Notifications from './boilerplate/notifications'
export * as Dashboard from './boilerplate/dashboard'
// export * as Settings from './settings'

// Data & Analytics
export * as Audit from './boilerplate/audit-logs'
// export * as Exports from './exports'

// Communication
// export * as Comments from './comments'
// export * as ActivityFeed from './activity-feed'

// Advanced
//export * as Workflows from './workflows'
//export * as Tags from './features/tags'

// Existing Features (already implemented)
export * as Auth from './boilerplate/auth'
export * as Admin from './boilerplate/admin'
export * as AILogging from './boilerplate/ai-logging'
export * as AIModels from './boilerplate/ai-models'
export * as AITesting from './boilerplate/ai-testing'

// Re-export common utilities
export * from '../lib/query-keys'
export * from '../lib/feature-base'

// Feature package registry for dynamic loading
export const FEATURE_PACKAGES = {
  // Core
  projects: () => import('./boilerplate/projects'),
  notifications: () => import('./boilerplate/notifications'),
  dashboard: () => import('./boilerplate/dashboard'),
  // settings: () => import('./settings'),
  
  // Data & Analytics
  audit: () => import('./boilerplate/audit-logs'),
  // exports: () => import('./exports'),
  
  // Communication
  // comments: () => import('./comments'),
  // 'activity-feed': () => import('./activity-feed'),
  
  // Advanced
  // workflows: () => import('./workflows'),
  // tags: () => import('./tags'),
  
  // Existing
  auth: () => import('./boilerplate/auth'),
  admin: () => import('./boilerplate/admin'),
  'ai-logging': () => import('./boilerplate/ai-logging'),
  'ai-models': () => import('./boilerplate/ai-models'),
  'ai-testing': () => import('./boilerplate/ai-testing'),
} as const

export type FeaturePackageName = keyof typeof FEATURE_PACKAGES

// Helper to dynamically load feature packages
export async function loadFeaturePackage(name: FeaturePackageName) {
  const loader = FEATURE_PACKAGES[name]
  if (!loader) {
    throw new Error(`Feature package '${name}' not found`)
  }
  return await loader()
}