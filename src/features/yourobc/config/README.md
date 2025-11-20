# YourOBC Configuration System

Central configuration management for all YourOBC modules.

## Overview

The YourOBC configuration system provides a centralized, type-safe way to manage feature flags and settings across all modules. Each module has its own configuration file with a consistent structure, and this central registry provides unified access and validation.

## Architecture

```
src/features/yourobc/config/
├── index.ts          # Central registry and helper functions
├── types.ts          # TypeScript type definitions
├── schemas.ts        # Zod validation schemas
└── README.md         # This file

src/features/yourobc/{module}/config/
├── index.ts          # Barrel export
└── {module}.config.ts  # Module-specific configuration
```

## Module Structure

Each module configuration follows this pattern:

```typescript
export interface ModuleConfig {
  core: {
    // Core features (usually required)
    featureName: boolean
  }

  categoryName: {
    enabled: boolean  // Master switch for category
    specificFeature: boolean
    // ... more features
  }

  // ... more categories
}

export const DEFAULT_MODULE_CONFIG: ModuleConfig = { ... }
export const MINIMAL_MODULE_CONFIG: ModuleConfig = { ... }

export function getModuleConfig(): ModuleConfig { ... }
export function isFeatureEnabled(...): boolean { ... }

export const MODULE_CONFIG = getModuleConfig()
```

## Usage

### Basic Usage

```typescript
import { YOUROBC_CONFIG } from '@/features/yourobc/config'

// Access a module config
const quotesConfig = YOUROBC_CONFIG.quotes

// Check a feature
if (quotesConfig.pricing.enabled && quotesConfig.pricing.multiCurrency) {
  // Show currency selector
}
```

### Using Helper Functions

```typescript
import {
  getModuleConfig,
  isModuleFeatureEnabled,
  isCategoryEnabled
} from '@/features/yourobc/config'

// Get specific module config
const quotesConfig = getModuleConfig('quotes')

// Check if a specific feature is enabled
if (isModuleFeatureEnabled('quotes', 'pricing', 'multiCurrency')) {
  // Feature is enabled
}

// Check if entire category is enabled
if (isCategoryEnabled('quotes', 'pricing')) {
  // Pricing features are available
}
```

### Using Dot Notation

```typescript
import { getConfigValue } from '@/features/yourobc/config'

// Get nested config value
const validityDays = getConfigValue('quotes', 'expiration.defaultValidityDays')
const multiCurrency = getConfigValue('quotes', 'pricing.multiCurrency')
```

### Module-Specific Imports

```typescript
// Import from module config directly
import { QUOTES_CONFIG, isFeatureEnabled } from '@/features/yourobc/quotes/config'

// Or use the central registry
import { getModuleConfig } from '@/features/yourobc/config'
const quotesConfig = getModuleConfig('quotes')
```

## Environment Variable Overrides

Each module config can be overridden via environment variables:

```bash
# Override entire module config
NEXT_PUBLIC_QUOTES_CONFIG='{"core":{"quoteGeneration":true},...}'

# Override at build time
NEXT_PUBLIC_SHIPMENTS_CONFIG='{"core":{"shipmentTracking":false},...}'
```

This is useful for:
- Different configurations per environment (dev, staging, prod)
- A/B testing features
- Temporary feature disabling

## Configuration Profiles

Each module provides two default profiles:

### DEFAULT Config
Full-featured configuration with all features enabled. Use for:
- Production environments
- Full deployments
- Feature demonstrations

### MINIMAL Config
Basic configuration with only core features. Use for:
- Development
- Testing
- Minimal viable product
- Performance optimization

## Validation

All configurations are validated using Zod schemas on load:

```typescript
import { validateConfig, safeValidateConfig } from '@/features/yourobc/config'

// Validate with error throwing
try {
  const validConfig = validateConfig(myConfig)
} catch (error) {
  console.error('Invalid config:', error)
}

// Safe validation without throwing
const result = safeValidateConfig(myConfig)
if (result.success) {
  console.log('Valid:', result.data)
} else {
  console.error('Invalid:', result.error.issues)
}
```

## Adding a New Module

To add a new module to the configuration system:

1. **Create module config file** at `src/features/yourobc/{module}/config/{module}.config.ts`:

```typescript
export interface MyModuleConfig {
  core: {
    basicFeature: boolean
  }
  advanced: {
    enabled: boolean
    feature1: boolean
    feature2: boolean
  }
}

export const DEFAULT_MY_MODULE_CONFIG: MyModuleConfig = { ... }
export const MINIMAL_MY_MODULE_CONFIG: MyModuleConfig = { ... }

export function getMyModuleConfig(): MyModuleConfig {
  // Environment variable override support
  if (typeof window !== 'undefined') {
    const envConfig = process.env.NEXT_PUBLIC_MY_MODULE_CONFIG
    if (envConfig) {
      try {
        return JSON.parse(envConfig)
      } catch (e) {
        console.error('Failed to parse MY_MODULE config from env')
      }
    }
  }
  return DEFAULT_MY_MODULE_CONFIG
}

export function isFeatureEnabled(
  category: keyof Omit<MyModuleConfig, 'core'>,
  feature: string
): boolean {
  const config = getMyModuleConfig()
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

export const MY_MODULE_CONFIG = getMyModuleConfig()
```

2. **Create barrel export** at `src/features/yourobc/{module}/config/index.ts`:

```typescript
export * from './{module}.config'
```

3. **Add to central registry** in `src/features/yourobc/config/`:

- Add type to `types.ts`:
```typescript
import type { MyModuleConfig } from '../{module}/config'

export interface YourOBCConfig {
  // ... existing modules
  myModule: MyModuleConfig
}
```

- Add schema to `schemas.ts`:
```typescript
export const myModuleConfigSchema = z.object({
  core: baseCoreSchema,
  advanced: baseFeatureCategorySchema,
}).passthrough()

export const yourOBCConfigSchema = z.object({
  // ... existing modules
  myModule: myModuleConfigSchema,
})
```

- Add to registry in `index.ts`:
```typescript
import { MY_MODULE_CONFIG } from '../{module}/config'

export const YOUROBC_CONFIG: YourOBCConfig = {
  // ... existing modules
  myModule: MY_MODULE_CONFIG,
}
```

## Best Practices

### 1. Check Category Before Features

Always check if a category is enabled before checking individual features:

```typescript
// ✅ Good
if (config.pricing.enabled && config.pricing.multiCurrency) {
  // Use feature
}

// ❌ Bad - doesn't respect category enabled flag
if (config.pricing.multiCurrency) {
  // May show UI for disabled category
}
```

### 2. Use Helper Functions

Prefer helper functions over direct property access:

```typescript
// ✅ Good
if (isModuleFeatureEnabled('quotes', 'pricing', 'multiCurrency')) {
  // Feature is enabled
}

// ❌ Less ideal - more verbose, doesn't check category.enabled
if (YOUROBC_CONFIG.quotes.pricing.enabled &&
    YOUROBC_CONFIG.quotes.pricing.multiCurrency) {
  // Feature is enabled
}
```

### 3. Feature Flags in Components

Create reusable feature flag hooks:

```typescript
// hooks/useFeatureFlag.ts
export function useFeatureFlag(
  module: YourOBCModuleName,
  category: string,
  feature: string
) {
  return isModuleFeatureEnabled(module, category, feature)
}

// In component
function QuoteForm() {
  const showCurrency = useFeatureFlag('quotes', 'pricing', 'multiCurrency')

  return (
    <div>
      {showCurrency && <CurrencySelector />}
    </div>
  )
}
```

### 4. Type Safety

Always use the provided types:

```typescript
import type { YourOBCModuleName } from '@/features/yourobc/config'

// ✅ Good - type safe
function getConfig(module: YourOBCModuleName) {
  return YOUROBC_CONFIG[module]
}

// ❌ Bad - no type safety
function getConfig(module: string) {
  return YOUROBC_CONFIG[module]
}
```

## Debugging

### Log Configuration Summary

```typescript
import { logConfigSummary } from '@/features/yourobc/config'

if (process.env.NODE_ENV === 'development') {
  logConfigSummary()
}
```

### Check All Enabled Modules

```typescript
import { getEnabledModules } from '@/features/yourobc/config'

const enabled = getEnabledModules()
console.log('Enabled modules:', enabled)
```

### Inspect Specific Config

```typescript
import { YOUROBC_CONFIG } from '@/features/yourobc/config'

console.log('Quotes config:', JSON.stringify(YOUROBC_CONFIG.quotes, null, 2))
```

## Migration from Legacy Config

See [MIGRATION_GUIDE.md](../../../../docs/yourobc/MIGRATION_GUIDE.md) for detailed migration instructions from the old flat configuration structure to the new nested structure.

## Related Documentation

- [CONFIG.md](../../../../docs/yourobc/CONFIG.md) - Complete configuration documentation
- [MIGRATION_GUIDE.md](../../../../docs/yourobc/MIGRATION_GUIDE.md) - Migration guide
- [YOUROBC.md](../../../../docs/yourobc/YOUROBC.md) - Requirements documentation
