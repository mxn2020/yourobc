// convex/schema/boilerplate/validators.ts

import { boilerplateSchemas } from './schemas'

// User & Profile validators
export const userProfile = boilerplateSchemas.userProfiles.validator
export const userSettings = boilerplateSchemas.userSettings.validator
export const userModelPreference = boilerplateSchemas.userModelPreferences.validator

// Project validators
export const project = boilerplateSchemas.projects.validator
export const projectCollaborator = boilerplateSchemas.projectCollaborators.validator
export const projectTask = boilerplateSchemas.projectTasks.validator
export const projectMember = boilerplateSchemas.projectMembers.validator
export const projectMilestone = boilerplateSchemas.projectMilestones.validator

// System validators
export const auditLog = boilerplateSchemas.auditLogs.validator
export const notification = boilerplateSchemas.notifications.validator
export const appSetting = boilerplateSchemas.appSettings.validator
export const systemMetric = boilerplateSchemas.systemMetrics.validator
export const appThemeSetting = boilerplateSchemas.appThemeSettings.validator
export const appConfig = boilerplateSchemas.appConfigs.validator

// AI validators
export const aiLog = boilerplateSchemas.aiLogs.validator
export const aiTest = boilerplateSchemas.aiTests.validator

// Dashboard validators
export const dashboard = boilerplateSchemas.dashboards.validator

// Supporting validators
export const wikiEntry = boilerplateSchemas.wikiEntries.validator
export const comment = boilerplateSchemas.comments.validator
export const reminder = boilerplateSchemas.reminders.validator
export const document = boilerplateSchemas.documents.validator
export const scheduledEvent = boilerplateSchemas.scheduledEvents.validator
export const availabilityPreference = boilerplateSchemas.availabilityPreferences.validator

// Blog validators
export const blogPost = boilerplateSchemas.blogPosts.validator
export const blogCategory = boilerplateSchemas.blogCategories.validator
export const blogTag = boilerplateSchemas.blogTags.validator
export const blogAuthor = boilerplateSchemas.blogAuthors.validator
export const blogProviderSync = boilerplateSchemas.blogProviderSync.validator
export const blogMedia = boilerplateSchemas.blogMedia.validator

// Website validators
export const website = boilerplateSchemas.websites.validator
export const websitePage = boilerplateSchemas.websitePages.validator
export const websiteSection = boilerplateSchemas.websiteSections.validator
export const websiteTheme = boilerplateSchemas.websiteThemes.validator
export const websiteTemplate = boilerplateSchemas.websiteTemplates.validator
export const websiteCollaborator = boilerplateSchemas.websiteCollaborators.validator

// Analytics validators
export const analyticsEvent = boilerplateSchemas.analyticsEvents.validator
export const analyticsMetric = boilerplateSchemas.analyticsMetrics.validator
export const analyticsDashboard = boilerplateSchemas.analyticsDashboards.validator
export const analyticsReport = boilerplateSchemas.analyticsReports.validator
export const analyticsProviderSync = boilerplateSchemas.analyticsProviderSync.validator

// Integrations validators
export const apiKey = boilerplateSchemas.apiKeys.validator
export const apiRequestLog = boilerplateSchemas.apiRequestLogs.validator
export const webhook = boilerplateSchemas.webhooks.validator
export const webhookDelivery = boilerplateSchemas.webhookDeliveries.validator
export const oauthApp = boilerplateSchemas.oauthApps.validator
export const oauthToken = boilerplateSchemas.oauthTokens.validator
export const externalIntegration = boilerplateSchemas.externalIntegrations.validator
export const integrationEvent = boilerplateSchemas.integrationEvents.validator

// Email validators
export const emailConfig = boilerplateSchemas.emailConfigs.validator
export const emailLog = boilerplateSchemas.emailLogs.validator
export const emailTemplate = boilerplateSchemas.emailTemplates.validator

// Payment validators
export const subscription = boilerplateSchemas.subscriptions.validator
export const usageLog = boilerplateSchemas.usageLogs.validator
export const paymentEvent = boilerplateSchemas.paymentEvents.validator

// Stripe Connect validators
export const connectedAccount = boilerplateSchemas.connectedAccounts.validator
export const clientProduct = boilerplateSchemas.clientProducts.validator
export const clientPayment = boilerplateSchemas.clientPayments.validator
export const connectEvent = boilerplateSchemas.connectEvents.validator