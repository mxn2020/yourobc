// convex/lib/shared/config/publicId.ts

/**
 * Public ID Configuration
 *
 * Configures the strategy for generating public-facing IDs.
 * These IDs are used for external APIs, shareable URLs, and integrations.
 */

declare const process: { env: Record<string, string | undefined> }

export type PublicIdStrategy = 'uuid' | 'nanoid' | 'stripe' | 'ulid' | 'short' | 'readable';

export interface PublicIdConfig {
  strategy: PublicIdStrategy;
  length?: number; // For strategies that support custom length
  includePrefix: boolean;
}

// Load from environment or use defaults
const getStrategyFromEnv = (): PublicIdStrategy => {
  const envStrategy = process.env.PUBLIC_ID_STRATEGY;
  const validStrategies: PublicIdStrategy[] = ['uuid', 'nanoid', 'stripe', 'ulid', 'short', 'readable'];

  if (envStrategy && validStrategies.includes(envStrategy as PublicIdStrategy)) {
    return envStrategy as PublicIdStrategy;
  }

  return 'uuid'; // Default strategy
};

export const PUBLIC_ID_CONFIG: PublicIdConfig = {
  strategy: getStrategyFromEnv(),
  length: 16, // Default length for strategies that support it
  includePrefix: true,
};

/**
 * Table prefixes for public IDs
 * Maps table names to their public ID prefixes
 */
export const PUBLIC_ID_PREFIXES = {
  // High Priority - User-facing entities
  wikiEntries: 'wiki',
  documents: 'doc',
  userProfiles: 'user',
  appThemeSettings: 'theme',
  dashboards: 'dash',

  emailConfigs: 'emcfg',
  emailTemplates: 'emtpl',

  // Medium Priority - Events & Scheduling
  scheduledEvents: 'evt',

  // Data Analytics - Forms
  formsForms: 'form',
  formsFields: 'field',
  formsResponses: 'fresp',

  // Data Analytics - Surveys
  surveysSurveys: 'surv',
  surveysQuestions: 'ques',
  surveysResponses: 'sresp',
  surveysBranchingRules: 'rule',

  // YourOBC Specific
  yourobcCouriers: 'cour',
  yourobcEmployees: 'empl',
  yourobcEmployeeCommissions: 'ecom',
  yourobcEmployeeSessions: 'esess',
  yourobcEmployeeKPIs: 'ekpi',
  yourobcVacationDays: 'vac',
  yourobcAccounting: 'acct',
  yourobcTrackingMessages: 'tmsg',
  yourobcTasks: 'task',
  yourobcInvoices: 'inv',
  yourobcPartners: 'part',
  yourobcShipments: 'ship',
  yourobcQuotes: 'quot',
  yourobcCustomers: 'cust',

} as const;

export type PublicIdTable = keyof typeof PUBLIC_ID_PREFIXES;

/**
 * Get prefix for a table
 */
export function getPrefix(table: PublicIdTable): string {
  return PUBLIC_ID_PREFIXES[table];
}

/**
 * Validate that a public ID matches expected format
 */
export function validatePublicIdFormat(publicId: string, table: PublicIdTable): boolean {
  if (!PUBLIC_ID_CONFIG.includePrefix) {
    return publicId.length > 0;
  }

  const prefix = getPrefix(table);
  return publicId.startsWith(`${prefix}_`) && publicId.length > prefix.length + 1;
}
