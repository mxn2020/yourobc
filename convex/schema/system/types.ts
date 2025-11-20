// convex/schema/boilerplate/types.ts

import { type Infer } from 'convex/values'
import type { Id } from '@/generated/dataModel'
import * as validators from './validators'

// User & Profile types
export type UserProfile = Infer<typeof validators.userProfile>
export type UserSettings = Infer<typeof validators.userSettings>
export type UserModelPreference = Infer<typeof validators.userModelPreference>

// Project types
export type Project = Infer<typeof validators.project>
export type ProjectCollaborator = Infer<typeof validators.projectCollaborator>
export type ProjectTask = Infer<typeof validators.projectTask>
export type ProjectMember = Infer<typeof validators.projectMember>
export type Milestone = Infer<typeof validators.projectMilestone>

// System types
export type AuditLog = Infer<typeof validators.auditLog>
export type Notification = Infer<typeof validators.notification>
export type AILog = Infer<typeof validators.aiLog>
export type AITest = Infer<typeof validators.aiTest>
export type AppSetting = Infer<typeof validators.appSetting>
export type SystemMetric = Infer<typeof validators.systemMetric>
export type AppThemeSetting = Infer<typeof validators.appThemeSetting>
export type AppConfig = Infer<typeof validators.appConfig>
export type Dashboard = Infer<typeof validators.dashboard>

// Supporting types
export type WikiEntry = Infer<typeof validators.wikiEntry>
export type Comment = Infer<typeof validators.comment>
export type Reminder = Infer<typeof validators.reminder>
export type Document = Infer<typeof validators.document>
export type ScheduledEvent = Infer<typeof validators.scheduledEvent>
export type AvailabilityPreference = Infer<typeof validators.availabilityPreference>

// Blog types (with Convex document fields)
export type BlogPost = Infer<typeof validators.blogPost> & { _id: Id<'blogPosts'>; _creationTime: number }
export type BlogCategory = Infer<typeof validators.blogCategory> & { _id: Id<'blogCategories'>; _creationTime: number }
export type BlogTag = Infer<typeof validators.blogTag> & { _id: Id<'blogTags'>; _creationTime: number }
export type BlogAuthor = Infer<typeof validators.blogAuthor> & { _id: Id<'blogAuthors'>; _creationTime: number }
export type BlogProviderSync = Infer<typeof validators.blogProviderSync> & { _id: Id<'blogProviderSync'>; _creationTime: number }
export type BlogMedia = Infer<typeof validators.blogMedia> & { _id: Id<'blogMedia'>; _creationTime: number }

// Website types (with Convex document fields)
export type Website = Infer<typeof validators.website> & { _id: Id<'websites'>; _creationTime: number }
export type WebsitePage = Infer<typeof validators.websitePage> & { _id: Id<'websitePages'>; _creationTime: number }
export type WebsiteSection = Infer<typeof validators.websiteSection> & { _id: Id<'websiteSections'>; _creationTime: number }
export type WebsiteTheme = Infer<typeof validators.websiteTheme> & { _id: Id<'websiteThemes'>; _creationTime: number }
export type WebsiteTemplate = Infer<typeof validators.websiteTemplate> & { _id: Id<'websiteTemplates'>; _creationTime: number }
export type WebsiteCollaborator = Infer<typeof validators.websiteCollaborator> & { _id: Id<'websiteCollaborators'>; _creationTime: number }

// Analytics types
export type AnalyticsEvent = Infer<typeof validators.analyticsEvent>
export type AnalyticsMetric = Infer<typeof validators.analyticsMetric>
export type AnalyticsDashboard = Infer<typeof validators.analyticsDashboard>
export type AnalyticsReport = Infer<typeof validators.analyticsReport>
export type AnalyticsProviderSync = Infer<typeof validators.analyticsProviderSync>

// Integrations types
export type ApiKey = Infer<typeof validators.apiKey>
export type ApiRequestLog = Infer<typeof validators.apiRequestLog>
export type Webhook = Infer<typeof validators.webhook>
export type WebhookDelivery = Infer<typeof validators.webhookDelivery>
export type OAuthApp = Infer<typeof validators.oauthApp>
export type OAuthToken = Infer<typeof validators.oauthToken>
export type ExternalIntegration = Infer<typeof validators.externalIntegration>
export type IntegrationEvent = Infer<typeof validators.integrationEvent>

// Email types
export type EmailConfig = Infer<typeof validators.emailConfig>
export type EmailLog = Infer<typeof validators.emailLog>
export type EmailTemplate = Infer<typeof validators.emailTemplate>

// Payment & Subscription types
export type Subscription = Infer<typeof validators.subscription>
export type UsageLog = Infer<typeof validators.usageLog>
export type PaymentEvent = Infer<typeof validators.paymentEvent>

// Stripe Connect types
export type ConnectedAccount = Infer<typeof validators.connectedAccount>
export type ClientProduct = Infer<typeof validators.clientProduct>
export type ClientPayment = Infer<typeof validators.clientPayment>
export type ConnectEvent = Infer<typeof validators.connectEvent>