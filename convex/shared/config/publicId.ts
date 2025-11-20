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
  projects: 'proj',
  blogPosts: 'post',
  blogAuthors: 'auth',
  blogCategories: 'cat',
  blogTags: 'tag',
  blogMedia: 'med',
  wikiEntries: 'wiki',
  documents: 'doc',
  userProfiles: 'user',

  // Medium Priority - Integrations
  webhooks: 'hook',
  oauthApps: 'app',
  externalIntegrations: 'int',
  apiKeys: 'key',

  // Medium Priority - Events & Scheduling
  scheduledEvents: 'evt',

  // Medium Priority - AI & Logging
  aiLogs: 'ailog',
  aiTests: 'test',

  // Medium Priority - Commerce
  subscriptions: 'sub',
  clientProducts: 'prod',
  clientPayments: 'pay',
  connectedAccounts: 'acct',

  // Lower Priority - Tasks & Milestones (if needed)
  projectTasks: 'task',
  projectMilestones: 'mile',

  // Games - Core
  gameScores: 'score',
  gameSessions: 'sess',

  // Games - Achievements
  achievements: 'achv',
  achievementMilestones: 'mile',

  // Games - Replays
  replays: 'rply',
  replayComments: 'rcmt',

  // Games - Multiplayer
  multiplayerRooms: 'room',
  matchResults: 'match',

  // Games - Tetris
  tetrisGames: 'tgame',
  tetrisHighScores: 'tscore',

  // Games - Dino
  dinoGames: 'dgame',
  dinoHighScores: 'dscore',

  // Product Launch Platform
  apps_products: 'prod',
  apps_product_comments: 'pcmt',
  apps_product_collections: 'pcol',

  // Office - Document Generation
  officeExcelDocuments: 'xldoc',
  officeWordDocuments: 'wdoc',
  officePowerpointPresentations: 'ppt',
  officePdfDocuments: 'pdf',
  officeDocumentTemplates: 'tmpl',
  officeAutomatedReports: 'rpt',
  officeSpreadsheetFormulas: 'fmla',
  officePresentationDesigns: 'pdes',
  officeCollaborativeSessions: 'collab',

  // Design Tools
  design_brandAssets: 'brand',
  design_mockups: 'mock',
  design_colorPalettes: 'pal',
  design_fontPairings: 'font',

  // Data Analytics - Forms
  formsForms: 'form',
  formsFields: 'field',
  formsResponses: 'fresp',

  // Data Analytics - Surveys
  surveysSurveys: 'surv',
  surveysQuestions: 'ques',
  surveysResponses: 'sresp',
  surveysBranchingRules: 'rule',
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
