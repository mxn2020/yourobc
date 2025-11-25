// convex/lib/boilerplate/milestones/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { MILESTONE_CONSTANTS } from './constants';
import { validateMilestoneData, calculateMilestoneProgress } from './utils';
import { requireEditMilestoneAccess, requireDeleteMilestoneAccess } from './permissions';
import { statusTypes } from '@/schema/base';
import { canEditProject } from '../permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';

const deliverableValidator = v.object({
  title: v.string(),
  completed: v.boolean(),
  completedAt: v.optional(v.number()),
});

/**
 * Create a new milestone
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have project edit permission
 */
export const createMilestone = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      priority: v.optional(statusTypes.priority),
      projectId: v.id('projects'),
      startDate: v.number(),
      dueDate: v.number(),
      assignedTo: v.optional(v.id('userProfiles')),
      order: v.optional(v.number()),
      color: v.optional(v.string()),
      dependencies: v.optional(v.array(v.id('projectMilestones'))),
      deliverables: v.optional(v.array(deliverableValidator)),
      metadata: v.optional(
        v.object({
          budget: v.optional(v.number()),
          actualCost: v.optional(v.number()),
          riskLevel: v.optional(
            v.union(
              v.literal('low'),
              v.literal('medium'),
              v.literal('high'),
              v.literal('critical')
            )
          ),
          attachments: v.optional(v.array(v.string())),
          notes: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Validate input data
    const errors = validateMilestoneData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Verify project exists and user has permission
    const project = await ctx.db.get(data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user can edit the project (required to create milestones)
    const canEdit = await canEditProject(ctx, project, user);
    if (!canEdit) {
      throw new Error(
        `You don't have permission to create milestones in this project`
      );
    }

    const now = Date.now();

    // Calculate order if not provided
    let order = data.order;
    if (order === undefined) {
      const existingMilestones = await ctx.db
        .query('projectMilestones')
        .withIndex('by_project_id', (q) => q.eq('projectId', data.projectId))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
      order =
        existingMilestones.length > 0
          ? Math.max(...existingMilestones.map((m) => m.order ?? 0)) + 1
          : 0;
    }

    // Calculate initial progress from deliverables
    const progress = data.deliverables
      ? calculateMilestoneProgress(data.deliverables)
      : 0;

    // Determine initial status based on start date
    const status =
      data.startDate > now
        ? MILESTONE_CONSTANTS.STATUS.UPCOMING
        : MILESTONE_CONSTANTS.STATUS.IN_PROGRESS;

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'projectMilestones');

    const milestoneData = {
      publicId,
      title: data.title.trim(),
      description: data.description?.trim(),
      status,
      priority: data.priority || MILESTONE_CONSTANTS.PRIORITY.MEDIUM,
      projectId: data.projectId,
      startDate: data.startDate,
      dueDate: data.dueDate,
      completedDate: undefined,
      progress,
      tasksTotal: undefined,
      tasksCompleted: undefined,
      dependencies: data.dependencies,
      order,
      color: data.color,
      createdBy: user._id,
      assignedTo: data.assignedTo,
      deliverables: data.deliverables,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
      deletedBy: undefined,
    };

    const milestoneId = await ctx.db.insert('projectMilestones', milestoneData);

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'milestone.created',
      entityType: 'boilerplate_milestone',
      entityId: publicId, // ✅ Use publicId instead of _id
      entityTitle: data.title,
      description: `Created milestone '${data.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: milestoneId, publicId }; // ✅ Return both IDs
  },
});

/**
 * Update an existing milestone
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have edit permission
 */
export const updateMilestone = mutation({
  args: {
    milestoneId: v.id('projectMilestones'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(statusTypes.milestone),
      priority: v.optional(statusTypes.priority),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      progress: v.optional(v.number()),
      assignedTo: v.optional(v.id('userProfiles')),
      order: v.optional(v.number()),
      color: v.optional(v.string()),
      dependencies: v.optional(v.array(v.id('projectMilestones'))),
      deliverables: v.optional(v.array(deliverableValidator)),
      tasksTotal: v.optional(v.number()),
      tasksCompleted: v.optional(v.number()),
      metadata: v.optional(
        v.object({
          budget: v.optional(v.number()),
          actualCost: v.optional(v.number()),
          riskLevel: v.optional(
            v.union(
              v.literal('low'),
              v.literal('medium'),
              v.literal('high'),
              v.literal('critical')
            )
          ),
          attachments: v.optional(v.array(v.string())),
          notes: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, { milestoneId, updates }) => {
    const user = await requireCurrentUser(ctx);
    
    // ✅ Direct O(1) lookup
    const milestone = await ctx.db.get(milestoneId);

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.deletedAt) {
      throw new Error('Cannot update deleted milestone');
    }

    // Check permission
    await requireEditMilestoneAccess(ctx, milestone, user);

    // Validate input data
    const errors = validateMilestoneData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: Partial<typeof milestone> = {
      ...updates,
      updatedAt: now,
    };

    // Handle status change to completed
    if (
      updates.status === MILESTONE_CONSTANTS.STATUS.COMPLETED &&
      milestone.status !== MILESTONE_CONSTANTS.STATUS.COMPLETED
    ) {
      updateData.completedDate = now;
      updateData.progress = 100;
    }

    // Handle status change from completed
    if (
      milestone.status === MILESTONE_CONSTANTS.STATUS.COMPLETED &&
      updates.status &&
      updates.status !== MILESTONE_CONSTANTS.STATUS.COMPLETED
    ) {
      updateData.completedDate = undefined;
    }

    // Recalculate progress if deliverables changed
    if (updates.deliverables) {
      updateData.progress = calculateMilestoneProgress(updates.deliverables);
    }

    await ctx.db.patch(milestoneId, updateData);

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'milestone.updated',
      entityType: 'boilerplate_milestone',
      entityId: milestone.publicId, // ✅ Use publicId
      entityTitle: milestone.title,
      description: `Updated milestone '${milestone.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return milestoneId;
  },
});

/**
 * Delete a milestone (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have delete permission
 */
export const deleteMilestone = mutation({
  args: {
    milestoneId: v.id('projectMilestones'),
  },
  handler: async (ctx, { milestoneId }) => {
    const user = await requireCurrentUser(ctx);
    
    // ✅ Direct O(1) lookup
    const milestone = await ctx.db.get(milestoneId);

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.deletedAt) {
      throw new Error('Milestone already deleted');
    }

    // Check permission
    await requireDeleteMilestoneAccess(ctx, milestone, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(milestoneId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'milestone.deleted',
      entityType: 'boilerplate_milestone',
      entityId: milestone.publicId, // ✅ Use publicId
      entityTitle: milestone.title,
      description: `Deleted milestone '${milestone.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Update milestone progress
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have edit permission
 */
export const updateMilestoneProgress = mutation({
  args: {
    milestoneId: v.id('projectMilestones'),
    progress: v.number(),
  },
  handler: async (ctx, { milestoneId, progress }) => {
    const user = await requireCurrentUser(ctx);
    
    // ✅ Direct O(1) lookup
    const milestone = await ctx.db.get(milestoneId);

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.deletedAt) {
      throw new Error('Cannot update deleted milestone');
    }

    await requireEditMilestoneAccess(ctx, milestone, user);

    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    const now = Date.now();
    const updates: Partial<typeof milestone> = {
      progress,
      updatedAt: now,
    };

    // Auto-complete if progress reaches 100%
    if (
      progress === 100 &&
      milestone.status !== MILESTONE_CONSTANTS.STATUS.COMPLETED
    ) {
      updates.status = MILESTONE_CONSTANTS.STATUS.COMPLETED;
      updates.completedDate = now;
    }

    // Reopen if progress < 100 and was completed
    if (
      progress < 100 &&
      milestone.status === MILESTONE_CONSTANTS.STATUS.COMPLETED
    ) {
      updates.status = MILESTONE_CONSTANTS.STATUS.IN_PROGRESS;
      updates.completedDate = undefined;
    }

    await ctx.db.patch(milestoneId, updates);

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'milestone.progress_updated',
      entityType: 'boilerplate_milestone',
      entityId: milestone.publicId, // ✅ Use publicId
      entityTitle: milestone.title,
      description: `Updated progress of milestone '${milestone.title}' to ${progress}%`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Update milestone status
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have edit permission
 */
export const updateMilestoneStatus = mutation({
  args: {
    milestoneId: v.id('projectMilestones'),
    status: statusTypes.milestone,
  },
  handler: async (ctx, { milestoneId, status }) => {
    const user = await requireCurrentUser(ctx);
    
    // ✅ Direct O(1) lookup
    const milestone = await ctx.db.get(milestoneId);

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.deletedAt) {
      throw new Error('Cannot update deleted milestone');
    }

    await requireEditMilestoneAccess(ctx, milestone, user);

    const now = Date.now();
    const updates: Partial<typeof milestone> = {
      status,
      updatedAt: now,
    };

    // Handle completion
    if (
      status === MILESTONE_CONSTANTS.STATUS.COMPLETED &&
      milestone.status !== MILESTONE_CONSTANTS.STATUS.COMPLETED
    ) {
      updates.completedDate = now;
      updates.progress = 100;
    }

    // Handle uncompleting
    if (
      milestone.status === MILESTONE_CONSTANTS.STATUS.COMPLETED &&
      status !== MILESTONE_CONSTANTS.STATUS.COMPLETED
    ) {
      updates.completedDate = undefined;
    }

    await ctx.db.patch(milestoneId, updates);

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'milestone.status_changed',
      entityType: 'boilerplate_milestone',
      entityId: milestone.publicId, // ✅ Use publicId
      entityTitle: milestone.title,
      description: `Changed milestone '${milestone.title}' status to ${status}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});