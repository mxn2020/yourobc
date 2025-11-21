// src/features/yourobc/config/types.ts
/**
 * Shared types for YourOBC configuration system
 */

import type { AccountingConfig } from '../accounting/config'
import type { CouriersConfig } from '../couriers/config'
import type { CustomersConfig } from '../customers/config'
import type { DashboardConfig } from '../dashboard/config'
import type { EmployeesConfig } from '../employees/config'
import type { InvoicesConfig } from '../invoices/config'
import type { MobileConfig } from '../mobile/config'
import type { PartnersConfig } from '../partners/config'
import type { QuotesConfig } from '../quotes/config'
import type { ShipmentsConfig } from '../shipments/config'
import type { StatisticsConfig } from '../statistics/config'
import type { SupportingConfig } from '../supporting/config'
import type { TasksConfig } from '../tasks/config'
import type { TrackingMessagesConfig } from '../trackingMessages/config'

/**
 * Central YourOBC Configuration Registry
 *
 * This interface represents the complete configuration for all YourOBC modules.
 * Each module has its own configuration structure with core features and optional enhancements.
 *
 * @example
 * ```typescript
 * import { YOUROBC_CONFIG } from '@/features/yourobc/config'
 *
 * // Access a specific module config
 * const quotesConfig = YOUROBC_CONFIG.quotes
 *
 * // Check if a feature is enabled
 * if (quotesConfig.pricing.enabled) {
 *   // Use pricing features
 * }
 * ```
 */
export interface YourOBCConfig {
  accounting: AccountingConfig
  couriers: CouriersConfig
  customers: CustomersConfig
  dashboard: DashboardConfig
  employees: EmployeesConfig
  invoices: InvoicesConfig
  mobile: MobileConfig
  partners: PartnersConfig
  quotes: QuotesConfig
  shipments: ShipmentsConfig
  statistics: StatisticsConfig
  supporting: SupportingConfig
  tasks: TasksConfig
  trackingMessages: TrackingMessagesConfig
}

/**
 * Module names as a union type for type safety
 */
export type YourOBCModuleName = keyof YourOBCConfig

/**
 * Base interface that all module configs should extend
 */
export interface BaseModuleConfig {
  core: Record<string, boolean | number | string>
  [key: string]: any
}
