// convex/schema/base.ts

import { v } from 'convex/values'
import { entityTypes } from '@/lib/system/audit_logs/entityTypes'

// Common union types
export const statusTypes = {
  project: v.union(v.literal('active'), v.literal('archived'), v.literal('completed'), v.literal('on_hold'), v.literal('cancelled')),
  task: v.union(v.literal('todo'), v.literal('in_progress'), v.literal('in_review'), v.literal('completed'), v.literal('blocked'), v.literal('cancelled')),
  milestone: v.union(v.literal('upcoming'), v.literal('in_progress'), v.literal('completed'), v.literal('delayed'), v.literal('cancelled')),
  memberStatus: v.union(v.literal('active'), v.literal('inactive'), v.literal('invited'), v.literal('removed')),
  priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'), v.literal('critical')),
  theme: v.union(v.literal('light'), v.literal('dark'), v.literal('auto')),
  role: v.union(v.literal('superadmin'), v.literal('admin'), v.literal('user'), v.literal('moderator'), v.literal('editor'), v.literal('analyst'), v.literal('guest')),
  memberRole: v.union(v.literal('owner'), v.literal('admin'), v.literal('member'), v.literal('viewer')),
  testStatus: v.union(v.literal('pending'), v.literal('running'), v.literal('completed'), v.literal('failed'), v.literal('cancelled')),
  notificationType: v.union(v.literal('assignment'), v.literal('completion'), v.literal('invite'), v.literal('achievement'), v.literal('reminder'), v.literal('mention'), v.literal('request'), v.literal('info'), v.literal('success'), v.literal('error')),
  emailStatus: v.union(v.literal('pending'), v.literal('sent'), v.literal('delivered'), v.literal('failed'), v.literal('bounced')),
  entityType: entityTypes.all,
  // Website-specific status types
  website: v.union(v.literal('draft'), v.literal('published'), v.literal('archived'), v.literal('maintenance')),
  websitePage: v.union(v.literal('draft'), v.literal('published'), v.literal('scheduled'), v.literal('archived')),
  // Fleet Management status types
  fleetVehicle: v.union(v.literal('available'), v.literal('in_use'), v.literal('maintenance'), v.literal('out_of_service'), v.literal('retired')),
  fleetDriver: v.union(v.literal('active'), v.literal('inactive'), v.literal('suspended')),
  fleetTrip: v.union(v.literal('in_progress'), v.literal('completed'), v.literal('cancelled')),
  fleetMaintenance: v.union(v.literal('scheduled'), v.literal('in_progress'), v.literal('completed'), v.literal('cancelled')),
  // Vendor Management status types
  vendor: v.union(v.literal('active'), v.literal('inactive'), v.literal('blacklisted')),
  purchaseOrder: v.union(v.literal('draft'), v.literal('submitted'), v.literal('approved'), v.literal('rejected'), v.literal('received'), v.literal('cancelled')),
  contract: v.union(v.literal('draft'), v.literal('active'), v.literal('expired'), v.literal('terminated'), v.literal('renewed')),
  invoice: v.union(v.literal('received'), v.literal('approved'), v.literal('paid'), v.literal('disputed'), v.literal('cancelled')),
  // Quote & Estimate Builder status types
  quote: v.union(v.literal('draft'), v.literal('sent'), v.literal('viewed'), v.literal('accepted'), v.literal('rejected'), v.literal('expired')),
  client: v.union(v.literal('active'), v.literal('inactive')),
  // Legal Case Management status types
  legalCase: v.union(v.literal('open'), v.literal('in_progress'), v.literal('on_hold'), v.literal('settled'), v.literal('won'), v.literal('lost'), v.literal('closed')),
  legalDocument: v.union(v.literal('draft'), v.literal('final'), v.literal('filed'), v.literal('archived')),
  legalHearing: v.union(v.literal('scheduled'), v.literal('completed'), v.literal('cancelled'), v.literal('postponed')),
  legalConflict: v.union(v.literal('pending'), v.literal('approved'), v.literal('denied'), v.literal('waived')),
  legalTrustAccount: v.union(v.literal('active'), v.literal('inactive'), v.literal('closed')),
  legalTrustTransaction: v.union(v.literal('pending'), v.literal('completed'), v.literal('cancelled'), v.literal('reconciled')),
  // Medical Practice status types
  medicalAppointment: v.union(v.literal('scheduled'), v.literal('confirmed'), v.literal('checked_in'), v.literal('in_progress'), v.literal('completed'), v.literal('cancelled'), v.literal('no_show')),
  medicalPatient: v.union(v.literal('active'), v.literal('inactive')),
  medicalPrescription: v.union(v.literal('active'), v.literal('completed'), v.literal('cancelled'), v.literal('expired')),
  medicalBill: v.union(v.literal('draft'), v.literal('sent'), v.literal('partially_paid'), v.literal('paid'), v.literal('overdue'), v.literal('cancelled'), v.literal('written_off')),
  medicalClaim: v.union(v.literal('draft'), v.literal('submitted'), v.literal('pending'), v.literal('processing'), v.literal('approved'), v.literal('partially_approved'), v.literal('denied'), v.literal('appealed'), v.literal('paid')),
  insuranceVerification: v.union(v.literal('pending'), v.literal('verified'), v.literal('failed'), v.literal('expired')),
  // Freelancer Dashboard status types
  freelanceInvoice: v.union(v.literal('draft'), v.literal('sent'), v.literal('viewed'), v.literal('paid'), v.literal('overdue'), v.literal('cancelled')),
  freelanceContract: v.union(v.literal('draft'), v.literal('sent'), v.literal('signed'), v.literal('active'), v.literal('completed'), v.literal('cancelled'), v.literal('expired')),
  freelancePayment: v.union(v.literal('pending'), v.literal('processing'), v.literal('completed'), v.literal('failed'), v.literal('refunded'), v.literal('cancelled')),
  taxDocument: v.union(v.literal('draft'), v.literal('generated'), v.literal('sent'), v.literal('filed'), v.literal('archived')),
}

export const categoryTypes = {
  settingCategory: v.union(
    v.literal('ai'),
    v.literal('general'),
    v.literal('security'),
    v.literal('notifications'),
    v.literal('billing'),
    v.literal('integrations')
  ),
}

// Fleet Management type validators
export const fleetVehicleTypeValidator = v.union(
  v.literal('sedan'),
  v.literal('suv'),
  v.literal('truck'),
  v.literal('van'),
  v.literal('other')
)
export type FleetVehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'other'

export const fleetOwnershipTypeValidator = v.union(
  v.literal('owned'),
  v.literal('leased'),
  v.literal('rented')
)
export type FleetOwnershipType = 'owned' | 'leased' | 'rented'

export const fleetMaintenanceTypeValidator = v.union(
  v.literal('oil_change'),
  v.literal('tire_rotation'),
  v.literal('brake_service'),
  v.literal('inspection'),
  v.literal('repair'),
  v.literal('other')
)
export type FleetMaintenanceType = 'oil_change' | 'tire_rotation' | 'brake_service' | 'inspection' | 'repair' | 'other'

// GPS Location schema for fleet tracking
export const gpsLocationSchema = v.object({
  name: v.optional(v.string()), // Location name/address
  lat: v.number(),              // Latitude
  lng: v.number(),              // Longitude
  timestamp: v.number(),        // When the location was recorded
  accuracy: v.optional(v.number()), // GPS accuracy in meters
})

// E-Signature schema for quote/document acceptance
export const eSignatureSchema = v.object({
  signedAt: v.number(),                    // When signature was created
  signerName: v.string(),                  // Name of the signer
  signerEmail: v.string(),                 // Email of the signer
  signatureData: v.optional(v.string()),   // Base64 encoded signature image or SVG path data
  signatureType: v.union(                  // Type of signature
    v.literal('drawn'),                    // Hand-drawn signature
    v.literal('typed'),                    // Typed name as signature
    v.literal('uploaded')                  // Uploaded signature image
  ),
  ipAddress: v.optional(v.string()),       // IP address of signer
  userAgent: v.optional(v.string()),       // Browser/device info
  consentText: v.optional(v.string()),     // Terms they agreed to
})

// Email provider types
export const emailProviderTypes = v.union(
  v.literal('resend'),
  v.literal('sendgrid'),
  v.literal('ses'),
  v.literal('postmark'),
  v.literal('mailgun')
)

// Email status types
export const emailStatusTypes = v.union(
  v.literal('pending'),
  v.literal('sent'),
  v.literal('delivered'),
  v.literal('failed'),
  v.literal('bounced')
)

// AI Request types
export const aiRequestTypes = v.union(
  v.literal('text_generation'),
  v.literal('streaming'),
  v.literal('embedding'),
  v.literal('image_generation'),
  v.literal('speech'),
  v.literal('transcription'),
  v.literal('test'),
  v.literal('object_generation')
)

export const aiTestTypes = v.union(
  v.literal('text_generation'),
  v.literal('object_generation'),
  v.literal('embedding'),
  v.literal('image_generation'),
  v.literal('speech'),
  v.literal('transcription'),
  v.literal('streaming'),
  v.literal('tool_calling'),
  v.literal('caching'),
  v.literal('multimodal'),
  v.literal('error_handling')
)

export const collaboratorRoles = v.union(
  v.literal('viewer'),
  v.literal('editor'),
  v.literal('admin')
)

// Common object schemas
export const usageSchema = v.object({
  inputTokens: v.optional(v.number()),
  outputTokens: v.optional(v.number()),
  totalTokens: v.optional(v.number()),
  reasoningTokens: v.optional(v.number()),
  cachedInputTokens: v.optional(v.number()),
})

export const userStatsSchema = v.object({
  karmaLevel: v.number(),
  tasksCompleted: v.number(),
  tasksAssigned: v.number(),
  projectsCreated: v.number(),
  loginCount: v.number(),
  totalAIRequests: v.number(),
  totalAICost: v.number(),
})

// Cache schemas
export const cacheSchema = v.optional(v.object({
  applicationCache: v.optional(v.object({
    hit: v.boolean(),
    key: v.optional(v.string()),
    ttl: v.optional(v.number()),
  })),
  providerCache: v.optional(v.object({
    hit: v.boolean(),
    provider: v.union(v.literal('anthropic'), v.literal('openai'), v.literal('other')),
    cachedTokens: v.optional(v.number()),
    cacheType: v.optional(v.union(v.literal('ephemeral'), v.literal('persistent'), v.literal('automatic'))),
  })),
  cacheHit: v.optional(v.boolean()),
}))

// Common metadata schema
// Note: Uses flexible types for extensibility, but with validation
export const metadataValueSchema = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.object({}) // For nested objects - can be extended
)

export const metadataSchema = v.optional(v.union(
  v.object({
    source: v.optional(v.string()),
    operation: v.optional(v.string()),
    oldValues: v.optional(v.record(v.string(), metadataValueSchema)),
    newValues: v.optional(v.record(v.string(), metadataValueSchema)),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }),
  v.record(v.string(), metadataValueSchema)
))

// ============================================================================
// Supporting Module Validators
// ============================================================================

/**
 * Wiki entry type validator
 */
export const wikiEntryTypeValidator = v.union(
  v.literal('guide'),
  v.literal('tutorial'),
  v.literal('reference'),
  v.literal('faq'),
  v.literal('procedure')
)
export type WikiEntryType = 'guide' | 'tutorial' | 'reference' | 'faq' | 'procedure'

/**
 * Wiki status validator
 */
export const wikiStatusValidator = v.union(
  v.literal('draft'),
  v.literal('published'),
  v.literal('archived')
)
export type WikiStatus = 'draft' | 'published' | 'archived'

/**
 * Wiki visibility validator
 */
export const wikiVisibilityValidator = v.union(
  v.literal('public'),
  v.literal('internal'),
  v.literal('private')
)
export type WikiVisibility = 'public' | 'internal' | 'private'

/**
 * Comment type validator
 */
export const commentTypeValidator = v.union(
  v.literal('note'),
  v.literal('status_update'),
  v.literal('question'),
  v.literal('answer'),
  v.literal('internal')
)
export type CommentType = 'note' | 'status_update' | 'question' | 'answer' | 'internal'

/**
 * Reminder type validator
 */
export const reminderTypeValidator = v.union(
  v.literal('follow_up'),
  v.literal('deadline'),
  v.literal('review'),
  v.literal('meeting'),
  v.literal('task')
)
export type ReminderType = 'follow_up' | 'deadline' | 'review' | 'meeting' | 'task'

/**
 * Reminder status validator
 */
export const reminderStatusValidator = v.union(
  v.literal('pending'),
  v.literal('completed'),
  v.literal('cancelled'),
  v.literal('snoozed')
)
export type ReminderStatus = 'pending' | 'completed' | 'cancelled' | 'snoozed'

/**
 * Recurrence frequency validator
 */
export const recurrenceFrequencyValidator = v.union(
  v.literal('daily'),
  v.literal('weekly'),
  v.literal('monthly'),
  v.literal('yearly')
)
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * Document type validator
 */
export const documentTypeValidator = v.union(
  v.literal('contract'),
  v.literal('invoice'),
  v.literal('report'),
  v.literal('specification'),
  v.literal('presentation'),
  v.literal('image'),
  v.literal('spreadsheet'),
  v.literal('other')
)
export type DocumentType = 'contract' | 'invoice' | 'report' | 'specification' | 'presentation' | 'image' | 'spreadsheet' | 'other'

/**
 * Document status validator
 */
export const documentStatusValidator = v.union(
  v.literal('ready'),
  v.literal('processing'),
  v.literal('archived'),
  v.literal('error')
)
export type DocumentStatus = 'ready' | 'processing' | 'archived' | 'error'

/**
 * Supporting notification type validator
 */
export const supportingNotificationTypeValidator = v.union(
  v.literal('system'),
  v.literal('comment_added'),
  v.literal('comment_mentioned'),
  v.literal('document_uploaded'),
  v.literal('reminder_due'),
  v.literal('reminder_overdue'),
  v.literal('wiki_updated')
)
export type SupportingNotificationType = 'system' | 'comment_added' | 'comment_mentioned' | 'document_uploaded' | 'reminder_due' | 'reminder_overdue' | 'wiki_updated'

/**
 * Notification priority validator
 */
export const notificationPriorityValidator = v.union(
  v.literal('normal'),
  v.literal('high'),
  v.literal('urgent')
)
export type NotificationPriority = 'normal' | 'high' | 'urgent'

/**
 * Scheduled event type validator
 */
export const scheduledEventTypeValidator = v.union(
  v.literal('meeting'),
  v.literal('appointment'),
  v.literal('event'),
  v.literal('task'),
  v.literal('reminder'),
  v.literal('block'),
  v.literal('other')
)
export type ScheduledEventType = 'meeting' | 'appointment' | 'event' | 'task' | 'reminder' | 'block' | 'other'

/**
 * Scheduled event status validator
 */
export const scheduledEventStatusValidator = v.union(
  v.literal('scheduled'),
  v.literal('confirmed'),
  v.literal('cancelled'),
  v.literal('completed'),
  v.literal('no_show')
)
export type ScheduledEventStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

/**
 * Processing status validator
 */
export const processingStatusValidator = v.union(
  v.literal('pending'),
  v.literal('processing'),
  v.literal('completed'),
  v.literal('failed'),
  v.literal('cancelled')
)
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

/**
 * Event visibility validator
 */
export const eventVisibilityValidator = v.union(
  v.literal('public'),
  v.literal('private'),
  v.literal('internal')
)
export type EventVisibility = 'public' | 'private' | 'internal'

/**
 * Event priority validator
 */
export const eventPriorityValidator = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
  v.literal('urgent')
)
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent'

// ============================================================================
// Website Module Validators
// ============================================================================

/**
 * Page template type validator
 */
export const pageTemplateTypeValidator = v.union(
  v.literal('landing'),
  v.literal('features'),
  v.literal('about'),
  v.literal('contact'),
  v.literal('blog'),
  v.literal('services'),
  v.literal('pricing'),
  v.literal('testimonials'),
  v.literal('privacy'),
  v.literal('terms'),
  v.literal('cookies'),
  v.literal('gdpr'),
  v.literal('custom')
)
export type PageTemplateType = 'landing' | 'features' | 'about' | 'contact' | 'blog' | 'services' | 'pricing' | 'testimonials' | 'privacy' | 'terms' | 'cookies' | 'gdpr' | 'custom'

/**
 * Section type validator
 */
export const sectionTypeValidator = v.union(
  v.literal('hero'),
  v.literal('features'),
  v.literal('testimonials'),
  v.literal('pricing'),
  v.literal('cta'),
  v.literal('faq'),
  v.literal('team'),
  v.literal('gallery'),
  v.literal('stats'),
  v.literal('contact_form'),
  v.literal('newsletter'),
  v.literal('blog_list'),
  v.literal('custom')
)
export type SectionType = 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'faq' | 'team' | 'gallery' | 'stats' | 'contact_form' | 'newsletter' | 'blog_list' | 'custom'

/**
 * Theme type validator
 */
export const themeTypeValidator = v.union(
  v.literal('modern'),
  v.literal('classic'),
  v.literal('minimal'),
  v.literal('bold'),
  v.literal('elegant'),
  v.literal('creative'),
  v.literal('custom')
)
export type ThemeType = 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant' | 'creative' | 'custom'

/**
 * Layout type validator
 */
export const layoutTypeValidator = v.union(
  v.literal('full_width'),
  v.literal('boxed'),
  v.literal('split'),
  v.literal('sidebar_left'),
  v.literal('sidebar_right'),
  v.literal('custom')
)
export type LayoutType = 'full_width' | 'boxed' | 'split' | 'sidebar_left' | 'sidebar_right' | 'custom'

/**
 * Content block type validator
 */
export const blockTypeValidator = v.union(
  v.literal('text'),
  v.literal('image'),
  v.literal('video'),
  v.literal('button'),
  v.literal('form'),
  v.literal('code'),
  v.literal('divider'),
  v.literal('spacer'),
  v.literal('html'),
  v.literal('custom')
)
export type BlockType = 'text' | 'image' | 'video' | 'button' | 'form' | 'code' | 'divider' | 'spacer' | 'html' | 'custom'

/**
 * Website collaborator role validator
 */
export const websiteCollaboratorRoleValidator = v.union(
  v.literal('owner'),
  v.literal('admin'),
  v.literal('editor'),
  v.literal('viewer')
)
export type WebsiteCollaboratorRole = 'owner' | 'admin' | 'editor' | 'viewer'

// ============================================================================
// Audit & Soft Delete Fields
// ============================================================================

/**
 * Audit fields for tracking creation and updates
 *
 * IMPORTANT: These fields store Convex userProfileId (Id<'userProfiles'>), NOT authUserId.
 * This allows for proper relationships and direct lookups with ctx.db.get().
 * The authUserId is stored in the userProfiles table and can be looked up when needed.
 *
 * @example
 * ```typescript
 * export const projectsTable = defineTable({
 *   ownerId: v.id('userProfiles'),      // ✅ Relationship - use Id<'userProfiles'>
 *   ...auditFields,                      // ✅ Audit trail - uses Id<'userProfiles'>
 * })
 * ```
 */
export const auditFields = {
  createdBy: v.optional(v.id('userProfiles')),
  createdAt: v.number(),
  updatedBy: v.optional(v.id('userProfiles')),
  updatedAt: v.optional(v.number()),
}

/**
 * Soft delete fields for logical deletion
 *
 * IMPORTANT: deletedBy stores Convex userProfileId (Id<'userProfiles'>), NOT authUserId.
 */
export const softDeleteFields = {
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.id('userProfiles')),
}