// convex/lib/software/yourobc/trackingMessages/mutations.ts
/**
 * Tracking Messages Mutation Helpers
 *
 * Reusable mutation functions for tracking messages.
 * These helpers can be used in Convex mutations to create, update, and delete tracking messages.
 *
 * @module convex/lib/software/yourobc/trackingMessages/mutations
 */

import { MutationCtx } from '../../../../_generated/server'
import type {
  TrackingMessage,
  TrackingMessageId,
  CreateTrackingMessageInput,
  UpdateTrackingMessageInput,
} from './types'
import {
  generateTrackingMessagePublicId,
  extractTemplateVariables,
  validateTrackingMessageData,
} from './utils'
import { TRACKING_MESSAGE_DEFAULTS } from './constants'

// ============================================================================
// Create Operations
// ============================================================================

/**
 * Creates a new tracking message
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {string} userId - The user's auth ID
 * @param {CreateTrackingMessageInput} input - Tracking message data
 * @returns {Promise<TrackingMessageId>} The created tracking message ID
 * @throws {Error} If validation fails
 *
 * @example
 * const messageId = await createTrackingMessage(ctx, userId, {
 *   name: 'Booking Confirmation',
 *   template: 'Hello {customerName}',
 *   serviceType: 'OBC',
 *   status: 'booked',
 *   language: 'en'
 * })
 */
export async function createTrackingMessage(
  ctx: MutationCtx,
  userId: string,
  input: CreateTrackingMessageInput
): Promise<TrackingMessageId> {
  // Validate input
  const validation = validateTrackingMessageData({
    name: input.name,
    description: input.description,
    subject: input.subject,
    template: input.template,
  })

  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
  }

  // Generate public ID
  const publicId = generateTrackingMessagePublicId()

  // Extract variables from template
  const extractedVariables = extractTemplateVariables(input.template)
  const variables = input.variables || extractedVariables

  // Get current timestamp
  const now = Date.now()

  // Create the tracking message
  const messageId = await ctx.db.insert('trackingMessages', {
    // Public identity
    publicId,

    // Core identity
    name: input.name,
    description: input.description,
    icon: input.icon,
    thumbnail: input.thumbnail,

    // Service classification
    serviceType: input.serviceType,
    status: input.status,

    // Message configuration
    language: input.language,

    // Template content
    subject: input.subject,
    template: input.template,
    variables,

    // Status
    isActive: input.isActive ?? TRACKING_MESSAGE_DEFAULTS.isActive,

    // Classification
    tags: input.tags,
    category: input.category,
    customFields: input.customFields,
    useCase: input.useCase,
    difficulty: input.difficulty ?? TRACKING_MESSAGE_DEFAULTS.difficulty,
    visibility: input.visibility ?? TRACKING_MESSAGE_DEFAULTS.visibility,

    // Ownership
    ownerId: userId,
    isOfficial: input.isOfficial ?? TRACKING_MESSAGE_DEFAULTS.isOfficial,

    // Usage statistics
    stats: {
      usageCount: 0,
      rating: 0,
      ratingCount: 0,
    },

    // Audit fields
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,

    // Soft delete (not deleted initially)
    deletedAt: undefined,
    deletedBy: undefined,
  })

  return messageId
}

// ============================================================================
// Update Operations
// ============================================================================

/**
 * Updates an existing tracking message
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessageId} messageId - The tracking message ID
 * @param {UpdateTrackingMessageInput} updates - Fields to update
 * @returns {Promise<void>}
 * @throws {Error} If message not found or validation fails
 *
 * @example
 * await updateTrackingMessage(ctx, userId, messageId, {
 *   name: 'Updated Name',
 *   isActive: false
 * })
 */
export async function updateTrackingMessage(
  ctx: MutationCtx,
  userId: string,
  messageId: TrackingMessageId,
  updates: UpdateTrackingMessageInput
): Promise<void> {
  // Get existing message
  const existingMessage = await ctx.db.get(messageId)
  if (!existingMessage) {
    throw new Error('Tracking message not found')
  }

  // Validate updates if provided
  if (updates.name || updates.template) {
    const validation = validateTrackingMessageData({
      name: updates.name ?? existingMessage.name,
      description: updates.description ?? existingMessage.description,
      subject: updates.subject ?? existingMessage.subject,
      template: updates.template ?? existingMessage.template,
    })

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
  }

  // If template is updated, extract new variables
  let variables = updates.variables
  if (updates.template && !updates.variables) {
    variables = extractTemplateVariables(updates.template)
  }

  // Build update object
  const updateData: Partial<TrackingMessage> = {
    ...updates,
    variables: variables ?? existingMessage.variables,
    updatedAt: Date.now(),
    updatedBy: userId,
  }

  // Remove undefined values
  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData]
    }
  })

  // Update the message
  await ctx.db.patch(messageId, updateData)
}

/**
 * Updates the template content and auto-extracts variables
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessageId} messageId - The tracking message ID
 * @param {string} template - New template content
 * @param {string} subject - Optional new subject
 * @returns {Promise<string[]>} Extracted variables
 *
 * @example
 * const variables = await updateTrackingMessageTemplate(ctx, userId, messageId, 'Hello {name}')
 */
export async function updateTrackingMessageTemplate(
  ctx: MutationCtx,
  userId: string,
  messageId: TrackingMessageId,
  template: string,
  subject?: string
): Promise<string[]> {
  // Extract variables
  const variables = extractTemplateVariables(template)

  // Update the message
  await updateTrackingMessage(ctx, userId, messageId, {
    template,
    subject,
    variables,
  })

  return variables
}

/**
 * Toggles the active status of a tracking message
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessageId} messageId - The tracking message ID
 * @returns {Promise<boolean>} New active status
 *
 * @example
 * const newStatus = await toggleTrackingMessageActive(ctx, userId, messageId)
 */
export async function toggleTrackingMessageActive(
  ctx: MutationCtx,
  userId: string,
  messageId: TrackingMessageId
): Promise<boolean> {
  const message = await ctx.db.get(messageId)
  if (!message) {
    throw new Error('Tracking message not found')
  }

  const newStatus = !message.isActive
  await updateTrackingMessage(ctx, userId, messageId, {
    isActive: newStatus,
  })

  return newStatus
}

// ============================================================================
// Delete Operations (Soft Delete)
// ============================================================================

/**
 * Soft deletes a tracking message
 * Sets deletedAt and deletedBy fields instead of removing the record
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessageId} messageId - The tracking message ID
 * @returns {Promise<void>}
 * @throws {Error} If message not found or already deleted
 *
 * @example
 * await softDeleteTrackingMessage(ctx, userId, messageId)
 */
export async function softDeleteTrackingMessage(
  ctx: MutationCtx,
  userId: string,
  messageId: TrackingMessageId
): Promise<void> {
  const message = await ctx.db.get(messageId)
  if (!message) {
    throw new Error('Tracking message not found')
  }

  if (message.deletedAt) {
    throw new Error('Tracking message is already deleted')
  }

  // Soft delete
  await ctx.db.patch(messageId, {
    deletedAt: Date.now(),
    deletedBy: userId,
    isActive: false, // Also deactivate when deleting
  })
}

/**
 * Restores a soft-deleted tracking message
 * Clears deletedAt and deletedBy fields
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessageId} messageId - The tracking message ID
 * @returns {Promise<void>}
 * @throws {Error} If message not found or not deleted
 *
 * @example
 * await restoreTrackingMessage(ctx, userId, messageId)
 */
export async function restoreTrackingMessage(
  ctx: MutationCtx,
  userId: string,
  messageId: TrackingMessageId
): Promise<void> {
  const message = await ctx.db.get(messageId)
  if (!message) {
    throw new Error('Tracking message not found')
  }

  if (!message.deletedAt) {
    throw new Error('Tracking message is not deleted')
  }

  // Restore
  await ctx.db.patch(messageId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedAt: Date.now(),
    updatedBy: userId,
  })
}

/**
 * Permanently deletes a tracking message
 * USE WITH CAUTION - This cannot be undone
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {TrackingMessageId} messageId - The tracking message ID
 * @returns {Promise<void>}
 *
 * @example
 * await hardDeleteTrackingMessage(ctx, messageId)
 */
export async function hardDeleteTrackingMessage(
  ctx: MutationCtx,
  messageId: TrackingMessageId
): Promise<void> {
  await ctx.db.delete(messageId)
}

// ============================================================================
// Statistics Operations
// ============================================================================

/**
 * Increments the usage count for a tracking message
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {TrackingMessageId} messageId - The tracking message ID
 * @returns {Promise<void>}
 *
 * @example
 * await incrementTrackingMessageUsage(ctx, messageId)
 */
export async function incrementTrackingMessageUsage(
  ctx: MutationCtx,
  messageId: TrackingMessageId
): Promise<void> {
  const message = await ctx.db.get(messageId)
  if (!message) {
    throw new Error('Tracking message not found')
  }

  const currentStats = message.stats || { usageCount: 0, rating: 0, ratingCount: 0 }

  await ctx.db.patch(messageId, {
    stats: {
      ...currentStats,
      usageCount: currentStats.usageCount + 1,
    },
  })
}

/**
 * Updates the rating for a tracking message
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {TrackingMessageId} messageId - The tracking message ID
 * @param {number} rating - Rating value (0-5)
 * @returns {Promise<void>}
 *
 * @example
 * await updateTrackingMessageRating(ctx, messageId, 4.5)
 */
export async function updateTrackingMessageRating(
  ctx: MutationCtx,
  messageId: TrackingMessageId,
  rating: number
): Promise<void> {
  if (rating < 0 || rating > 5) {
    throw new Error('Rating must be between 0 and 5')
  }

  const message = await ctx.db.get(messageId)
  if (!message) {
    throw new Error('Tracking message not found')
  }

  const currentStats = message.stats || { usageCount: 0, rating: 0, ratingCount: 0 }
  const newRatingCount = currentStats.ratingCount + 1
  const newAverageRating =
    (currentStats.rating * currentStats.ratingCount + rating) / newRatingCount

  await ctx.db.patch(messageId, {
    stats: {
      ...currentStats,
      rating: newAverageRating,
      ratingCount: newRatingCount,
    },
  })
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Creates multiple tracking messages in batch
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {string} userId - The user's auth ID
 * @param {CreateTrackingMessageInput[]} inputs - Array of tracking message data
 * @returns {Promise<TrackingMessageId[]>} Array of created message IDs
 *
 * @example
 * const ids = await batchCreateTrackingMessages(ctx, userId, [input1, input2])
 */
export async function batchCreateTrackingMessages(
  ctx: MutationCtx,
  userId: string,
  inputs: CreateTrackingMessageInput[]
): Promise<TrackingMessageId[]> {
  const messageIds: TrackingMessageId[] = []

  for (const input of inputs) {
    const id = await createTrackingMessage(ctx, userId, input)
    messageIds.push(id)
  }

  return messageIds
}

/**
 * Soft deletes multiple tracking messages
 *
 * @param {MutationCtx} ctx - Convex mutation context
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessageId[]} messageIds - Array of message IDs to delete
 * @returns {Promise<void>}
 *
 * @example
 * await batchSoftDeleteTrackingMessages(ctx, userId, [id1, id2, id3])
 */
export async function batchSoftDeleteTrackingMessages(
  ctx: MutationCtx,
  userId: string,
  messageIds: TrackingMessageId[]
): Promise<void> {
  for (const messageId of messageIds) {
    await softDeleteTrackingMessage(ctx, userId, messageId)
  }
}
