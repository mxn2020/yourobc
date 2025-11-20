// convex/schema/system/validators.ts

import { systemSchemas } from './schemas'

// User & Profile validators
export const userProfile = systemSchemas.userProfiles.validator
export const userSettings = systemSchemas.userSettings.validator
export const userModelPreference = systemSchemas.userModelPreferences.validator

// Project validators
export const project = systemSchemas.projects.validator
export const projectCollaborator = systemSchemas.projectCollaborators.validator
export const projectTask = systemSchemas.projectTasks.validator
export const projectMember = systemSchemas.projectMembers.validator
export const projectMilestone = systemSchemas.projectMilestones.validator

// System validators
export const auditLog = systemSchemas.auditLogs.validator
export const notification = systemSchemas.notifications.validator
export const appSetting = systemSchemas.appSettings.validator
export const systemMetric = systemSchemas.systemMetrics.validator
export const appThemeSetting = systemSchemas.appThemeSettings.validator
export const appConfig = systemSchemas.appConfigs.validator

// AI validators
export const aiLog = systemSchemas.aiLogs.validator
export const aiTest = systemSchemas.aiTests.validator

// Dashboard validators
export const dashboard = systemSchemas.dashboards.validator

// Supporting validators
export const wikiEntry = systemSchemas.wikiEntries.validator
export const comment = systemSchemas.comments.validator
export const reminder = systemSchemas.reminders.validator
export const document = systemSchemas.documents.validator
export const scheduledEvent = systemSchemas.scheduledEvents.validator
export const availabilityPreference = systemSchemas.availabilityPreferences.validator

// Blog validators
export const blogPost = systemSchemas.blogPosts.validator
export const blogCategory = systemSchemas.blogCategories.validator
export const blogTag = systemSchemas.blogTags.validator
export const blogAuthor = systemSchemas.blogAuthors.validator
export const blogProviderSync = systemSchemas.blogProviderSync.validator
export const blogMedia = systemSchemas.blogMedia.validator

// Website validators
export const website = systemSchemas.websites.validator
export const websitePage = systemSchemas.websitePages.validator
export const websiteSection = systemSchemas.websiteSections.validator
export const websiteTheme = systemSchemas.websiteThemes.validator
export const websiteTemplate = systemSchemas.websiteTemplates.validator
export const websiteCollaborator = systemSchemas.websiteCollaborators.validator

// Analytics validators
export const analyticsEvent = systemSchemas.analyticsEvents.validator
export const analyticsMetric = systemSchemas.analyticsMetrics.validator
export const analyticsDashboard = systemSchemas.analyticsDashboards.validator
export const analyticsReport = systemSchemas.analyticsReports.validator
export const analyticsProviderSync = systemSchemas.analyticsProviderSync.validator

// Integrations validators
export const apiKey = systemSchemas.apiKeys.validator
export const apiRequestLog = systemSchemas.apiRequestLogs.validator
export const webhook = systemSchemas.webhooks.validator
export const webhookDelivery = systemSchemas.webhookDeliveries.validator
export const oauthApp = systemSchemas.oauthApps.validator
export const oauthToken = systemSchemas.oauthTokens.validator
export const externalIntegration = systemSchemas.externalIntegrations.validator
export const integrationEvent = systemSchemas.integrationEvents.validator

// Email validators
export const emailConfig = systemSchemas.emailConfigs.validator
export const emailLog = systemSchemas.emailLogs.validator
export const emailTemplate = systemSchemas.emailTemplates.validator

// Payment validators
export const subscription = systemSchemas.subscriptions.validator
export const usageLog = systemSchemas.usageLogs.validator
export const paymentEvent = systemSchemas.paymentEvents.validator

// Stripe Connect validators
export const connectedAccount = systemSchemas.connectedAccounts.validator
export const clientProduct = systemSchemas.clientProducts.validator
export const clientPayment = systemSchemas.clientPayments.validator
export const connectEvent = systemSchemas.connectEvents.validator