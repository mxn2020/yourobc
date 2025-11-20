// convex/lib/boilerplate/projects/team/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { TEAM_CONSTANTS } from './constants';
import { validateMemberData, canAssignRole } from './utils';
import {
  requireAddMemberAccess,
  requireUpdateMemberAccess,
  requireRemoveMemberAccess,
} from './permissions';
import { statusTypes } from '@/schema/base';
import {
  addMemberInternal,
  removeMemberInternal,
  updateMemberRoleInternal,
} from './helpers';

/**
 * Add a member to a project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have team management permission
 */
export const addMember = mutation({
  args: {
    data: v.object({
      projectId: v.id('projects'),
      userId: v.id('userProfiles'),
      role: v.optional(statusTypes.memberRole),
      department: v.optional(v.string()),
      jobTitle: v.optional(v.string()),
      permissions: v.optional(v.array(v.string())),
      settings: v.optional(
        v.object({
          emailNotifications: v.optional(v.boolean()),
          canManageTasks: v.optional(v.boolean()),
          canInviteMembers: v.optional(v.boolean()),
          canEditProject: v.optional(v.boolean()),
        })
      ),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Check permission
    await requireAddMemberAccess(ctx, data.projectId, user);

    // Get current user's membership to check role assignment permission
    const currentUserMember = await ctx.db
      .query('projectMembers')
      .withIndex('by_project', (q) => q.eq('projectId', data.projectId))
      .filter((q) =>
        q.and(
          q.eq(q.field('userId'), user._id),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .first();

    const assignedRole = data.role || TEAM_CONSTANTS.ROLE.MEMBER;

    // Check if user can assign this role
    if (
      currentUserMember &&
      !canAssignRole(currentUserMember.role, assignedRole) &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error(
        `You don't have permission to assign the ${assignedRole} role`
      );
    }

    // Delegate to helper function
    const memberId = await addMemberInternal(ctx, data, user);

    return { _id: memberId };
  },
});

/**
 * Update a project member
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have permission to update member
 */
export const updateMember = mutation({
  args: {
    memberId: v.id('projectMembers'),
    updates: v.object({
      role: v.optional(statusTypes.memberRole),
      department: v.optional(v.string()),
      jobTitle: v.optional(v.string()),
      status: v.optional(statusTypes.memberStatus),
      permissions: v.optional(v.array(v.string())),
      settings: v.optional(
        v.object({
          emailNotifications: v.optional(v.boolean()),
          canManageTasks: v.optional(v.boolean()),
          canInviteMembers: v.optional(v.boolean()),
          canEditProject: v.optional(v.boolean()),
        })
      ),
      extendedMetadata: v.optional(
        v.object({
          avatar: v.optional(v.string()),
          bio: v.optional(v.string()),
          skills: v.optional(v.array(v.string())),
        })
      ),
    }),
  },
  handler: async (ctx, { memberId, updates }) => {
    const user = await requireCurrentUser(ctx);
    
    // ✅ Direct O(1) lookup
    const member = await ctx.db.get(memberId);

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.deletedAt) {
      throw new Error('Cannot update removed member');
    }

    // Check permission
    await requireUpdateMemberAccess(ctx, member, user, updates.role);

    // Get project
    const project = await ctx.db.get(member.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Validate input data
    const errors = validateMemberData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Cannot change owner role
    if (member.role === TEAM_CONSTANTS.ROLE.OWNER && updates.role) {
      throw new Error('Cannot change project owner role');
    }

    const now = Date.now();
    const updateData: Partial<typeof member> = {
      ...updates,
      updatedAt: now,
    };

    // Merge settings if provided
    if (updates.settings) {
      updateData.settings = {
        ...member.settings,
        ...updates.settings,
      };
    }

    // Merge extended metadata if provided
    if (updates.extendedMetadata) {
      updateData.extendedMetadata = {
        ...member.extendedMetadata,
        ...updates.extendedMetadata,
      };
    }

    await ctx.db.patch(memberId, updateData);

    // Update project last activity
    await ctx.db.patch(member.projectId, {
      updatedAt: now,
      lastActivityAt: now,
    });

    // Create audit log
    const changes = [];
    if (updates.role) changes.push(`role to ${updates.role}`);
    if (updates.status) changes.push(`status to ${updates.status}`);
    if (updates.department) changes.push(`department to ${updates.department}`);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'member.updated',
      entityType: 'boilerplate_project_member',
      entityId: memberId,
      entityTitle: `Member updated in ${project.title}`,
      description: `Updated member in project '${project.title}'${changes.length > 0 ? ': ' + changes.join(', ') : ''}`,
      metadata: {
        projectId: member.projectId,
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: memberId };
  },
});

/**
 * Remove a member from a project (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have permission to remove member
 */
export const removeMember = mutation({
  args: {
    memberId: v.id('projectMembers'),
  },
  handler: async (ctx, { memberId }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const member = await ctx.db.get(memberId);

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.deletedAt) {
      throw new Error('Member already removed');
    }

    // Check permission
    await requireRemoveMemberAccess(ctx, member, user);

    // Delegate to helper function
    await removeMemberInternal(ctx, memberId, user);

    return { _id: memberId };
  },
});

/**
 * Update a member's role
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have permission to change roles
 */
export const updateMemberRole = mutation({
  args: {
    memberId: v.id('projectMembers'),
    role: statusTypes.memberRole,
  },
  handler: async (ctx, { memberId, role }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const member = await ctx.db.get(memberId);

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.deletedAt) {
      throw new Error('Cannot update removed member');
    }

    // Check permission
    await requireUpdateMemberAccess(ctx, member, user, role);

    // Delegate to helper function
    await updateMemberRoleInternal(ctx, memberId, role, user);

    return { _id: memberId };
  },
});

/**
 * Update member's last activity timestamp
 * 🔒 Authentication: Required
 */
export const updateMemberActivity = mutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);

    // Find user's membership
    const membership = await ctx.db
      .query('projectMembers')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) =>
        q.and(
          q.eq(q.field('userId'), user._id),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .first();

    if (!membership) {
      return { success: false, message: 'Not a member of this project' };
    }

    const now = Date.now();

    await ctx.db.patch(membership._id, {
      lastActiveAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});