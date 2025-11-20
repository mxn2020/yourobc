// convex/lib/boilerplate/app_settings/queries.ts

import { v } from 'convex/values'
import { MutationCtx, QueryCtx, query } from '@/generated/server'
import { requireAdmin } from '@/shared/auth.helper'
import { transformSettingsArrayToObject, mergeSettingsWithDefaults, sanitizeSettingValue } from './utils'

async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  const authUserId = identity.subject;
  const user = await ctx.db
    .query('userProfiles')
    .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
    .first()

  return user?.role === 'admin' || user?.role === 'superadmin';
}

export const getAppSettings = query({
  args: {
    category: v.optional(v.string()),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
      search: v.optional(v.string()),
    }))
  },
  handler: async (ctx, args) => {
    const userIsAdmin = await isAdmin(ctx)

    let settings;
    if (args.category) {
      const category = args.category;

      settings = await ctx.db
        .query('appSettings')
        .withIndex('by_category', (q) => q.eq('category', category))
        .collect();
    } else {
      settings = await ctx.db
        .query('appSettings')
        .take(1000);
    }

    let filteredSettings = settings.filter(setting =>
      userIsAdmin || setting.isPublic
    )
    
    if (args.options?.search) {
      const searchTerm = args.options.search.toLowerCase()
      filteredSettings = filteredSettings.filter(setting =>
        setting.key.toLowerCase().includes(searchTerm) ||
        setting.description?.toLowerCase().includes(searchTerm) ||
        setting.category.toLowerCase().includes(searchTerm)
      )
    }
    
    const { limit = 50, offset = 0 } = args.options || {}
    const paginatedSettings = filteredSettings.slice(offset, offset + limit)
    
    const sanitizedSettings = paginatedSettings.map(setting => ({
      ...setting,
      value: userIsAdmin ? setting.value : sanitizeSettingValue(setting.value)
    }))
    
    return {
      settings: sanitizedSettings,
      total: filteredSettings.length,
      hasMore: filteredSettings.length > offset + limit,
    }
  },
})

export const getAppSetting = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()
    
    if (!setting) {
      return null
    }
    
    const userIsAdmin = await isAdmin(ctx)
    
    if (!setting.isPublic && !userIsAdmin) {
      throw new Error('Unauthorized to access this setting')
    }
    
    return {
      ...setting,
      value: userIsAdmin ? setting.value : sanitizeSettingValue(setting.value)
    }
  },
})

export const getAISettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'ai'))
      .collect();

    const userIsAdmin = await isAdmin(ctx)

    const filteredSettings = settings.filter(setting =>
      userIsAdmin || setting.isPublic
    )

    const settingsObject = transformSettingsArrayToObject(filteredSettings)
    return mergeSettingsWithDefaults(settingsObject, 'ai')
  },
})

export const getAISetting = query({
  args: { 
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .filter(q => q.eq(q.field('category'), 'ai'))
      .first()
    
    if (!setting) {
      return null
    }
    
    const userIsAdmin = await isAdmin(ctx)
    
    if (!setting.isPublic && !userIsAdmin) {
      throw new Error('Unauthorized to access this setting')
    }
    
    return {
      ...setting,
      value: userIsAdmin ? setting.value : sanitizeSettingValue(setting.value)
    }
  },
})

export const getGeneralSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'general'))
      .collect();

    const settingsObject = transformSettingsArrayToObject(settings)
    return mergeSettingsWithDefaults(settingsObject, 'general')
  },
})

export const getGeneralSetting = query({
  args: { 
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    
    const setting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .filter(q => q.eq(q.field('category'), 'general'))
      .first()
    
    return setting
  },
})

export const getSecuritySettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'security'))
      .collect();

    const settingsObject = transformSettingsArrayToObject(settings)
    return mergeSettingsWithDefaults(settingsObject, 'security')
  },
})

export const getSecuritySetting = query({
  args: { 
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    
    const setting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .filter(q => q.eq(q.field('category'), 'security'))
      .first()
    
    return setting
  },
})

export const getNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'notifications'))
      .collect()
    
    const settingsObject = transformSettingsArrayToObject(settings)
    return mergeSettingsWithDefaults(settingsObject, 'notifications')
  },
})

export const getNotificationSetting = query({
  args: { 
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    
    const setting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .filter(q => q.eq(q.field('category'), 'notifications'))
      .first()
    
    return setting
  },
})

export const getBillingSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    
    const settings = await ctx.db.query('appSettings')
      .filter(q => q.eq(q.field('category'), 'billing'))
      .collect()
    
    const settingsObject = transformSettingsArrayToObject(settings)
    return mergeSettingsWithDefaults(settingsObject, 'billing')
  },
})

export const getBillingSetting = query({
  args: { 
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    
    const setting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .filter(q => q.eq(q.field('category'), 'billing'))
      .first()
    
    return setting
  },
})

export const getIntegrationSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    
    const settings = await ctx.db.query('appSettings')
      .filter(q => q.eq(q.field('category'), 'integrations'))
      .collect()
    
    const settingsObject = transformSettingsArrayToObject(settings)
    return mergeSettingsWithDefaults(settingsObject, 'integrations')
  },
})

export const getIntegrationSetting = query({
  args: { 
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    
    const setting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .filter(q => q.eq(q.field('category'), 'integrations'))
      .first()
    
    return setting
  },
})

export const getPublicSettings = query({
  args: {
    category: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('appSettings')
      .filter(q => q.eq(q.field('isPublic'), true))
    
    if (args.category) {
      query = query.filter(q => q.eq(q.field('category'), args.category))
    }
    
    const settings = await query.collect()
    
    const sanitizedSettings = settings.map(setting => ({
      ...setting,
      value: sanitizeSettingValue(setting.value)
    }))
    
    return transformSettingsArrayToObject(sanitizedSettings)
  },
})

export const getSettingsStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const allSettings = await ctx.db
      .query('appSettings')
      .take(1000);

    const stats = {
      totalSettings: allSettings.length,
      publicSettings: allSettings.filter(s => s.isPublic).length,
      privateSettings: allSettings.filter(s => !s.isPublic).length,
      categoryCounts: {} as Record<string, number>,
      recentlyUpdated: allSettings
        .filter(s => s.updatedAt && Date.now() - s.updatedAt < 24 * 60 * 60 * 1000)
        .length,
      oldestSetting: allSettings.length > 0 ? Math.min(...allSettings.map(s => s.createdAt)) : 0,
      newestSetting: allSettings.length > 0 ? Math.max(...allSettings.map(s => s.createdAt)) : 0,
      dataLimited: allSettings.length >= 1000,
    }

    allSettings.forEach(setting => {
      stats.categoryCounts[setting.category] = (stats.categoryCounts[setting.category] || 0) + 1
    })

    return stats
  },
})

export const searchSettings = query({
  args: {
    searchTerm: v.string(),
    categories: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userIsAdmin = await isAdmin(ctx)

    let settings;

    if (args.categories?.length === 1) {
      settings = await ctx.db
        .query('appSettings')
        .withIndex('by_category', (q) => q.eq('category', args.categories![0]))
        .collect();
    } else {
      settings = await ctx.db
        .query('appSettings')
        .take(500);

      if (args.categories?.length) {
        settings = settings.filter(s => args.categories!.includes(s.category));
      }
    }

    const searchTerm = args.searchTerm.toLowerCase()
    const filteredSettings = settings
      .filter(setting => userIsAdmin || setting.isPublic)
      .filter(setting =>
        setting.key.toLowerCase().includes(searchTerm) ||
        setting.description?.toLowerCase().includes(searchTerm) ||
        setting.category.toLowerCase().includes(searchTerm) ||
        (typeof setting.value === 'string' && setting.value.toLowerCase().includes(searchTerm))
      )
      .slice(0, args.limit || 20)

    return filteredSettings.map(setting => ({
      ...setting,
      value: userIsAdmin ? setting.value : sanitizeSettingValue(setting.value)
    }))
  },
})

export const getSettingsHistory = query({
  args: {
    key: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    
    let query = ctx.db.query('auditLogs')
      .filter(q => q.eq(q.field('entityType'), 'settings'))
    
    if (args.key) {
      query = query.filter(q => q.eq(q.field('entityId'), args.key))
    }
    
    const logs = await query
      .order('desc')
      .take(args.limit || 50)
    
    return logs
  },
})