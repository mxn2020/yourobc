// Main features package exports
// All feature packages are organized under this central export

// Core Features
export * as Projects from './projects'
export * as Notifications from './system/notifications'
export * as Dashboard from './system/dashboard'
// export * as Settings from './settings'

// Data & Analytics
export * as Audit from './system/audit-logs'
// export * as Exports from './exports'

// Communication
// export * as Comments from './comments'
// export * as ActivityFeed from './activity-feed'

// Advanced
//export * as Workflows from './workflows'
//export * as Tags from './features/tags'

// Existing Features (already implemented)
export * as Auth from './system/auth'
export * as Admin from './system/admin'
// export * as AILogging from './system/ai-logging'
// export * as AIModels from './system/ai-models'
// export * as AITesting from './system/ai-testing'

// Re-export common utilities
export * from '../lib/query-keys'
export * from '../lib/feature-base'

// Feature package registry for dynamic loading
export const FEATURE_PACKAGES = {
  // Core
  projects: () => import('./projects'),
  notifications: () => import('./system/notifications'),
  dashboard: () => import('./system/dashboard'),
  // settings: () => import('./settings'),
  
  // Data & Analytics
  audit: () => import('./system/audit-logs'),
  // exports: () => import('./exports'),
  
  // Communication
  // comments: () => import('./comments'),
  // 'activity-feed': () => import('./activity-feed'),
  
  // Advanced
  // workflows: () => import('./workflows'),
  // tags: () => import('./tags'),
  
  // Existing
  auth: () => import('./system/auth'),
  admin: () => import('./system/admin'),
  // 'ai-logging': () => import('./system/ai-logging'),
  // 'ai-models': () => import('./system/ai-models'),
  // 'ai-testing': () => import('./system/ai-testing'),
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