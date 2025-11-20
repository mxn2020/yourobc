// convex/config/yourobc.ts
/**
 * YourOBC Configuration
 *
 * Central configuration file for all YourOBC features.
 * Controls which features are enabled/disabled throughout the system.
 *
 * @module convex/config/yourobc
 */

export const YOUROBC_CONFIG = {
  // ============================================================================
  // CUSTOMER MODULE CONFIGURATION
  // ============================================================================
  customers: {
    // Core Features (always enabled - required by YOUROBC.md specification)
    coreFeatures: {
      basicInfo: true, // Company name, contacts, addresses
      businessTerms: true, // Currency, payment terms, margins
      tags: true, // Customer categorization and tagging
      notes: true, // Customer and internal notes
      inquirySource: true, // Track where customer came from
      status: true, // Active/Inactive/Blacklisted status management
      multipleContacts: true, // Support for multiple contact persons
      billingShippingAddresses: true, // Separate billing and shipping addresses
    },

    // Enhanced Features (can be disabled via configuration)
    enhancedFeatures: {
      // Contact Protocol & Follow-up Management
      contactProtocol: false, // Contact logging with date/time/channel
      followUpReminders: false, // Manual and automatic follow-up reminders
      inactivityAlerts: false, // Alert after X days without contact (default: 35 days)

      // Payment & Dunning Management
      dunningSystem: false, // Payment reminder system with escalation levels
      customPaymentTerms: false, // Customer-specific payment rules
      serviceSuspension: false, // Auto-suspend service after X dunning levels

      // Margin Management
      advancedMargins: false, // Service/route/volume-based margin rules
      marginCalculator: false, // Preview margin calculations before quote
      minimumMargin: false, // Support for % + minimum EUR logic

      // Analytics & Insights
      customerAnalytics: false, // Lifetime value, payment behavior analysis
      performanceMetrics: false, // Customer scoring and risk levels
      standardRoutes: false, // Identify frequently used routes per customer
      conversionTracking: false, // Track quote-to-order conversion rates
    },

    // Field Limits (from YOUROBC.md spec)
    limits: {
      maxCompanyNameLength: 200,
      maxShortNameLength: 50,
      maxContactNameLength: 100,
      maxEmailLength: 100,
      maxPhoneLength: 20,
      maxWebsiteLength: 200,
      maxNotesLength: 5000,
      maxInternalNotesLength: 5000,
      maxTags: 20,
      maxContacts: 10,
      minPaymentTerms: 0,
      maxPaymentTerms: 365, // Maximum 1 year payment terms
      minMargin: -100, // Allow negative margins (loss leaders)
      maxMargin: 1000, // Up to 1000% markup
    },

    // Default Values (from YOUROBC.md spec)
    defaults: {
      status: 'active' as const,
      currency: 'EUR' as const,
      paymentTerms: 30, // Net 30 days
      paymentMethod: 'bank_transfer' as const,
      margin: 0, // 0% default margin
      inactivityThresholdDays: 35, // Alert after 35 days of inactivity
      riskLevel: 'medium' as const,
      score: 0,
    },

    // Business Rules
    businessRules: {
      requireCustomerReferenceOnInvoice: true,
      preventDeleteWithActiveQuotes: true,
      preventDeleteWithShipments: true,
      preventDeleteWithInvoices: true,
      softDeleteOnly: true, // Never hard delete customers
      autoCalculateScore: true, // Auto-calculate customer score
      autoCalculateRiskLevel: true, // Auto-calculate risk level
    },
  },

  // ============================================================================
  // QUOTES MODULE CONFIGURATION
  // ============================================================================
  quotes: {
    // Core Features
    coreFeatures: {
      obcQuotes: true, // OBC (On Board Courier) quotes
      nfoQuotes: true, // NFO (Network Freight) quotes
      multiCurrency: true, // EUR/USD support
      marginCalculation: true, // Auto-calculate margins
      flightStats: false, // FlightStats API integration (optional)
    },

    // Enhanced Features
    enhancedFeatures: {
      partnerComparison: false, // Compare multiple partner offers (NFO)
      courierSuggestions: false, // Suggest couriers based on route/airport
      templateGeneration: true, // Generate quote text from templates
      expirationTracking: true, // Track quote expiration dates
      conversionAnalytics: false, // Track win/loss reasons
    },

    // Quote Numbering
    numbering: {
      obcPrefix: 'YOBC',
      nfoPrefix: 'YNFO',
      yearFormat: 'YY', // 2-digit year
      paddingLength: 6, // Number of digits for counter
    },

    // Default Values
    defaults: {
      validityDays: 7, // Quotes valid for 7 days
      currency: 'EUR' as const,
      requireClosureReason: true, // Require reason when closing lost quotes
      autoCloseAfterHours: 72, // Auto-prompt to close after 72 hours
    },
  },

  // ============================================================================
  // SHIPMENTS MODULE CONFIGURATION
  // ============================================================================
  shipments: {
    // Core Features
    coreFeatures: {
      statusTracking: true, // Track shipment status changes
      slaMonitoring: true, // Monitor SLA compliance
      documentManagement: true, // AWB, HAWB, MAWB, POD management
      taskManagement: true, // Automatic next-task generation
    },

    // Enhanced Features
    enhancedFeatures: {
      customsTracking: false, // Track customs clearance
      realTimeNotifications: false, // Real-time status notifications
      courierIntegration: false, // Direct courier API integration
      routeOptimization: false, // Suggest optimal routing
    },

    // SLA Configuration
    sla: {
      warningMinutesBefore: 15, // Warn 15 minutes before SLA breach
      enableEscalation: false, // Auto-escalate overdue shipments
      enableColorCoding: true, // Green/Yellow/Red status indicators
    },

    // Validation Rules
    validationRules: {
      requireCustomerReferenceOnClose: true, // Must have customer reference
      requireHAWBForNFO: true, // NFO shipments must have HAWB
      requireMAWBForNFO: true, // NFO shipments must have MAWB
      requireCostCheckboxes: true, // Confirm customs/excess baggage costs
      requirePODBeforeInvoice: true, // Must attach POD before invoicing
    },
  },

  // ============================================================================
  // INVOICING MODULE CONFIGURATION
  // ============================================================================
  invoicing: {
    // Core Features
    coreFeatures: {
      outgoingInvoices: true, // Customer invoices
      incomingInvoices: true, // Supplier invoices
      multiCurrency: true, // EUR/USD support
      paymentTracking: true, // Track payment status
      dunningManagement: true, // Dunning/reminder system
    },

    // Invoice Numbering
    numbering: {
      format: 'YYMM0013', // Year + Month + Counter
      startNumber: 13,
      increment: 13, // Increment by 13 for each invoice
      resetMonthly: true, // Reset counter each month
    },

    // Dunning Configuration
    dunning: {
      firstReminderDays: 7, // First reminder 7 days after due date
      secondReminderDays: 14, // Second reminder 14 days after due date
      thirdReminderDays: 21, // Third reminder 21 days after due date
      serviceSuspensionLevel: 3, // Suspend service after 3rd reminder
      autoGenerate: false, // Manual dunning only (no auto-send)
      allowCustomFees: true, // Customer-specific dunning fees
    },

    // Statement of Accounts
    statementOfAccounts: {
      enabled: true,
      includeHistory: true, // Include paid invoices in statement
      exportFormats: ['PDF', 'Excel'],
      defaultSortBy: 'dueDate' as const,
    },
  },

  // ============================================================================
  // EMPLOYEE MODULE CONFIGURATION
  // ============================================================================
  employees: {
    // Core Features
    coreFeatures: {
      timeTracking: true, // Login/logout tracking
      vacationManagement: true, // Vacation days tracking
      commissionTracking: true, // Sales commission calculation
      kpiTracking: true, // Employee KPI monitoring
    },

    // Enhanced Features
    enhancedFeatures: {
      sessionTracking: true, // Track work sessions
      breakTimeTracking: false, // Track break times
      targetManagement: true, // Set and track targets
      performanceRanking: true, // Rank employees (admin only)
    },

    // Time Tracking
    timeTracking: {
      autoLoginOnAccess: true,
      inactivityTimeoutMinutes: 15, // Mark as 'away' after 15 min
      requireManualLogout: false,
    },

    // Vacation Management
    vacation: {
      requireApproval: true, // Vacation requires approval
      allowCarryover: true, // Allow carryover to next year (with approval)
      approverRoles: ['admin', 'manager'],
    },

    // Commission Rules
    commission: {
      basedOnMetric: 'margin' as const, // Commission based on margin
      payOnInvoicePaid: true, // Pay commission when invoice is paid
      allowCustomRulesPerEmployee: true,
    },
  },

  // ============================================================================
  // STATISTICS & REPORTING CONFIGURATION
  // ============================================================================
  statistics: {
    // Core Features
    coreFeatures: {
      dashboardKPIs: true, // Main dashboard KPIs
      customerReports: true, // Customer-specific reports
      employeeReports: true, // Employee performance reports
      financialReports: true, // Revenue/margin reports
    },

    // Enhanced Features
    enhancedFeatures: {
      forecastingReports: false, // Revenue forecasting
      trendAnalysis: false, // Trend analysis and predictions
      customReports: false, // User-defined custom reports
      automatedReports: false, // Scheduled report generation
    },

    // Operating Costs Tracking
    operatingCosts: {
      enabled: true,
      categories: [
        'employee_costs',
        'office_costs',
        'trade_shows',
        'tools',
        'marketing',
        'miscellaneous',
      ],
      requireReceipts: true, // Require receipt attachments
      allowRecurring: true, // Support recurring costs
    },

    // Comparison Periods
    comparisons: {
      enableYearOverYear: true, // Compare to previous year
      enableMonthOverMonth: true, // Compare to previous month
      enableTargetComparison: true, // Compare to target values
    },

    // Export Formats
    exports: {
      formats: ['PDF', 'Excel', 'CSV'],
      includeCharts: true, // Include charts in PDF exports
      allowScheduledExports: false,
    },
  },

  // ============================================================================
  // PARTNERS & COURIERS CONFIGURATION
  // ============================================================================
  partnersAndCouriers: {
    // Core Features
    coreFeatures: {
      partnerManagement: true, // NFO partner management
      courierManagement: true, // OBC courier management
      ratingSystem: true, // Partner/courier rating (1-5)
      costTracking: true, // Track partner/courier costs
    },

    // Enhanced Features
    enhancedFeatures: {
      performanceTracking: false, // Track reliability and response time
      ratecardManagement: false, // Manage partner ratecards
      autoSuggestions: false, // Auto-suggest partners/couriers
      contractManagement: false, // Manage contracts and terms
    },

    // Rating System
    rating: {
      minRating: 1,
      maxRating: 5,
      requireComments: false, // Require comments for low ratings
    },
  },

  // ============================================================================
  // WIKI & KNOWLEDGE BASE CONFIGURATION
  // ============================================================================
  wiki: {
    // Core Features
    coreFeatures: {
      articleManagement: true,
      searchFunctionality: true,
      categorization: true,
      versionHistory: true,
    },

    // Enhanced Features
    enhancedFeatures: {
      commentSystem: true, // Allow comments on articles
      popularArticles: true, // Track and show popular articles
      recentlyViewed: true, // Show recently viewed articles
      inlineHelp: false, // Show help inline in workflows
    },

    // Categories
    defaultCategories: [
      'SOPs',
      'Airline Rules',
      'Partner Info',
      'Tools & Processes',
      'System Guides',
    ],

    // Permissions
    permissions: {
      editRoles: ['admin', 'manager'],
      approvalRequired: false, // No approval workflow
      publicView: false, // Internal only
    },
  },

  // ============================================================================
  // SYSTEM CONFIGURATION
  // ============================================================================
  system: {
    // Timezone Handling
    timezone: {
      defaultTimezone: 'Europe/Berlin',
      storeInUTC: true, // Always store timestamps in UTC
      displayLocalTime: true, // Show local time + HQ time
    },

    // Currency Handling
    currency: {
      baseCurrency: 'EUR',
      supportedCurrencies: ['EUR', 'USD'],
      autoUpdateRates: true, // Auto-update exchange rates
      rateUpdateFrequency: 'daily' as const,
    },

    // Audit Logging
    auditLog: {
      enabled: true,
      logAllActions: true, // Log all create/update/delete actions
      retentionDays: 365, // Keep logs for 1 year
    },

    // Backup Configuration
    backups: {
      enabled: true,
      frequency: 'twice_daily' as const,
      retentionDays: -1, // Unlimited retention (critical data)
      autoTest: true, // Test random backups
    },

    // Notifications
    notifications: {
      inApp: true,
      email: true,
      channels: ['app', 'email'], // Future: add Slack, Teams
      mentionNotifications: true, // @mention notifications
    },
  },

  // ============================================================================
  // MOBILE CONFIGURATION
  // ============================================================================
  mobile: {
    enabled: true,
    features: {
      createQuotes: true,
      manageShipments: true,
      updateStatus: true,
      viewDashboard: true,
      uploadDocuments: true, // Via gallery, not camera
    },
  },

  // ============================================================================
  // TOOLS CONFIGURATION
  // ============================================================================
  tools: {
    chargeableWeightCalculator: {
      enabled: true,
      supportedUnits: ['cm', 'inch', 'kg', 'lbs'],
      autoConversion: true,
    },

    courierCapacityCalculator: {
      enabled: true,
      airlineRules: true, // Use airline-specific baggage rules
      departureCountryRules: true, // Rules vary by departure country
      costComparison: true, // Compare 1 courier + excess vs 2 couriers
    },

    flightStatsIntegration: {
      enabled: false, // Optional FlightStats API
      apiKey: '', // Configured separately
    },
  },
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a specific feature is enabled
 * @param featurePath - Dot-notation path to feature (e.g., 'customers.enhancedFeatures.contactProtocol')
 * @returns boolean indicating if feature is enabled
 */
export function isFeatureEnabled(featurePath: string): boolean {
  const parts = featurePath.split('.')
  let current: any = YOUROBC_CONFIG

  for (const part of parts) {
    current = current?.[part]
    if (current === undefined) return false
  }

  return current === true
}

/**
 * Get a configuration value
 * @param configPath - Dot-notation path to config value
 * @returns The configuration value or undefined
 */
export function getConfigValue<T = any>(configPath: string): T | undefined {
  const parts = configPath.split('.')
  let current: any = YOUROBC_CONFIG

  for (const part of parts) {
    current = current?.[part]
    if (current === undefined) return undefined
  }

  return current as T
}

// ============================================================================
// TYPED EXPORTS
// ============================================================================

export const CUSTOMER_CONFIG = YOUROBC_CONFIG.customers
export const QUOTE_CONFIG = YOUROBC_CONFIG.quotes
export const SHIPMENT_CONFIG = YOUROBC_CONFIG.shipments
export const INVOICE_CONFIG = YOUROBC_CONFIG.invoicing
export const EMPLOYEE_CONFIG = YOUROBC_CONFIG.employees
export const STATS_CONFIG = YOUROBC_CONFIG.statistics
export const PARTNER_CONFIG = YOUROBC_CONFIG.partnersAndCouriers
export const WIKI_CONFIG = YOUROBC_CONFIG.wiki
export const SYSTEM_CONFIG = YOUROBC_CONFIG.system
export const MOBILE_CONFIG = YOUROBC_CONFIG.mobile
export const TOOLS_CONFIG = YOUROBC_CONFIG.tools

// Convenience exports for common configurations
export const CORE_FEATURES = CUSTOMER_CONFIG.coreFeatures
export const ENHANCED_FEATURES = CUSTOMER_CONFIG.enhancedFeatures
export const CUSTOMER_LIMITS = CUSTOMER_CONFIG.limits
export const CUSTOMER_DEFAULTS = CUSTOMER_CONFIG.defaults
export const BUSINESS_RULES = CUSTOMER_CONFIG.businessRules
