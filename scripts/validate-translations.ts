#!/usr/bin/env tsx

/**
 * Translation Validation Script
 *
 * Run this script to validate all translation files:
 *   npm run validate:translations
 *   or
 *   tsx scripts/validate-translations.ts
 */

import { runValidation } from '../src/features/boilerplate/i18n/utils/validateTranslations'

runValidation().catch(error => {
  console.error('Validation failed with error:', error)
  process.exit(1)
})
