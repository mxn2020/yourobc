// convex/lib/boilerplate/app_settings/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import { requireAdmin } from '@/shared/auth.helper'
import { validateAppSettingData, getSettingDescription, isPublicSetting } from './utils'
import { vSettingCategory } from '@/shared/validators'

export const createOrUpdateAppSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    category: vSettingCategory(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization
    const user = await requireAdmin(ctx)

    // 2. Trim string fields
    const key = args.key.trim();
    const description = args.description?.trim();

    // 3. Validate data
    const errors = validateAppSettingData(key, args.value, args.category)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    // 4. Check if setting exists
    const existingSetting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .first()

    const now = Date.now()
    let settingId: any;

    if (existingSetting) {
      // 5. Update existing setting
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        category: args.category,
        description: description || getSettingDescription(key),
        isPublic: args.isPublic,
        updatedAt: now,
        updatedBy: user._id,
      })
      settingId = existingSetting._id;
    } else {
      // 5. Create new setting
      settingId = await ctx.db.insert('appSettings', {
        key,
        value: args.value,
        category: args.category,
        description: description || getSettingDescription(key),
        isPublic: args.isPublic,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      })
    }

    // 6. Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: existingSetting ? 'app_settings.updated' : 'app_settings.created',
      entityType: 'app_setting',
      entityId: settingId,
      entityTitle: key,
      description: `${existingSetting ? 'Updated' : 'Created'} app setting: ${key}`,
      metadata: {
        category: args.category,
        isPublic: args.isPublic,
        operation: existingSetting ? 'update' : 'create',
      },
      createdAt: now,
    });

    // 7. Return setting ID
    return settingId;
  },
})

export const deleteAppSetting = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization
    const user = await requireAdmin(ctx)

    // 2. Trim string fields
    const key = args.key.trim();

    // 3. Get setting
    const setting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .first()

    if (!setting) {
      throw new Error('Setting not found')
    }

    const now = Date.now();

    // 4. Soft delete the setting
    await ctx.db.patch(setting._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    // 5. Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'app_settings.deleted',
      entityType: 'app_setting',
      entityId: setting._id,
      entityTitle: key,
      description: `Deleted app setting: ${key}`,
      metadata: {
        category: setting.category,
      },
      createdAt: now,
    });

    // 6. Return key
    return key;
  },
})

export const updateAISettings = mutation({
  args: {
    settings: v.object({
      defaultModel: v.optional(v.string()),
      defaultProvider: v.optional(v.string()),
      maxTokensDefault: v.optional(v.number()),
      temperatureDefault: v.optional(v.number()),
      enableAILogging: v.optional(v.boolean()),
      aiRateLimit: v.optional(v.number()),
      aiCostLimit: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)

    const now = Date.now()
    const results = []

    for (const [key, value] of Object.entries(args.settings)) {
      if (value !== undefined) {
        const errors = validateAppSettingData(key, value, 'ai')
        if (errors.length > 0) {
          throw new Error(`Validation failed for ${key}: ${errors.join(', ')}`)
        }

        const existingSetting = await ctx.db.query('appSettings')
          .withIndex('by_key', (q) => q.eq('key', key))
          .first()

        const isPublic = isPublicSetting(key, 'ai')

        if (existingSetting) {
          await ctx.db.patch(existingSetting._id, {
            value,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(existingSetting._id)
        } else {
          const newId = await ctx.db.insert('appSettings', {
            key,
            value,
            category: 'ai',
            description: getSettingDescription(key),
            isPublic,
            createdAt: now,
            createdBy: user._id,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(newId)
        }
      }
    }

    // Create audit log for batch update
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'app_settings.ai_updated',
      entityType: 'app_setting',
      description: `Updated AI settings`,
      metadata: {
        category: 'ai',
        updatedKeys: Object.keys(args.settings),
        operation: 'batch_update',
      },
      createdAt: now,
    });

    return results
  },
})

export const updateAISetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)

    const errors = validateAppSettingData(args.key, args.value, 'ai')
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const existingSetting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    const now = Date.now()
    const isPublic = isPublicSetting(args.key, 'ai')
    let settingId: any;

    if (existingSetting) {
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: user._id,
      })
      settingId = existingSetting._id;
    } else {
      settingId = await ctx.db.insert('appSettings', {
        key: args.key,
        value: args.value,
        category: 'ai',
        description: getSettingDescription(args.key),
        isPublic,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      })
    }

    // Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: existingSetting ? 'app_settings.updated' : 'app_settings.created',
      entityType: 'app_setting',
      entityId: settingId,
      entityTitle: args.key,
      description: `${existingSetting ? 'Updated' : 'Created'} AI setting: ${args.key}`,
      metadata: {
        category: 'ai',
        operation: existingSetting ? 'update' : 'create',
      },
      createdAt: now,
    });

    return settingId;
  },
})

export const updateGeneralSettings = mutation({
  args: {
    settings: v.object({
      siteName: v.optional(v.string()),
      siteDescription: v.optional(v.string()),
      maintenanceMode: v.optional(v.boolean()),
      registrationEnabled: v.optional(v.boolean()),
      emailVerificationRequired: v.optional(v.boolean()),
      defaultUserRole: v.optional(v.string()),
      timezone: v.optional(v.string()),
      dateFormat: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const now = Date.now()
    const results = []
    
    for (const [key, value] of Object.entries(args.settings)) {
      if (value !== undefined) {
        const errors = validateAppSettingData(key, value, 'general')
        if (errors.length > 0) {
          throw new Error(`Validation failed for ${key}: ${errors.join(', ')}`)
        }

        const existingSetting = await ctx.db.query('appSettings')
          .withIndex('by_key', (q) => q.eq('key', key))
          .first()
        
        const isPublic = isPublicSetting(key, 'general')
        
        if (existingSetting) {
          await ctx.db.patch(existingSetting._id, {
            value,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(existingSetting._id)
        } else {
          const newId = await ctx.db.insert('appSettings', {
            key,
            value,
            category: 'general',
            description: getSettingDescription(key),
            isPublic,
            createdAt: now,
            createdBy: user._id,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(newId)
        }
      }
    }
    
    return results
  },
})

export const updateGeneralSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const errors = validateAppSettingData(args.key, args.value, 'general')
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const existingSetting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()
    
    const now = Date.now()
    const isPublic = isPublicSetting(args.key, 'general')
    
    if (existingSetting) {
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: user._id,
      })
      return existingSetting._id
    } else {
      return await ctx.db.insert('appSettings', {
        key: args.key,
        value: args.value,
        category: 'general',
        description: getSettingDescription(args.key),
        isPublic,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      })
    }
  },
})

export const updateSecuritySettings = mutation({
  args: {
    settings: v.object({
      sessionTimeout: v.optional(v.number()),
      maxLoginAttempts: v.optional(v.number()),
      passwordMinLength: v.optional(v.number()),
      requireTwoFactor: v.optional(v.boolean()),
      forceHttps: v.optional(v.boolean()),
      ipWhitelist: v.optional(v.array(v.string())),
      corsOrigins: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const now = Date.now()
    const results = []
    
    for (const [key, value] of Object.entries(args.settings)) {
      if (value !== undefined) {
        const errors = validateAppSettingData(key, value, 'security')
        if (errors.length > 0) {
          throw new Error(`Validation failed for ${key}: ${errors.join(', ')}`)
        }

        const existingSetting = await ctx.db.query('appSettings')
          .withIndex('by_key', (q) => q.eq('key', key))
          .first()
        
        const isPublic = isPublicSetting(key, 'security')
        
        if (existingSetting) {
          await ctx.db.patch(existingSetting._id, {
            value,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(existingSetting._id)
        } else {
          const newId = await ctx.db.insert('appSettings', {
            key,
            value,
            category: 'security',
            description: getSettingDescription(key),
            isPublic,
            createdAt: now,
            createdBy: user._id,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(newId)
        }
      }
    }
    
    return results
  },
})

export const updateSecuritySetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const errors = validateAppSettingData(args.key, args.value, 'security')
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const existingSetting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()
    
    const now = Date.now()
    const isPublic = isPublicSetting(args.key, 'security')
    
    if (existingSetting) {
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: user._id,
      })
      return existingSetting._id
    } else {
      return await ctx.db.insert('appSettings', {
        key: args.key,
        value: args.value,
        category: 'security',
        description: getSettingDescription(args.key),
        isPublic,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      })
    }
  },
})

export const updateNotificationSettings = mutation({
  args: {
    settings: v.object({
      adminAlerts: v.optional(v.boolean()),
      userWelcomeEmail: v.optional(v.boolean()),
      passwordResetEmail: v.optional(v.boolean()),
      securityNotifications: v.optional(v.boolean()),
      emailFromAddress: v.optional(v.string()),
      emailProvider: v.optional(v.string()),
      smtpSettings: v.optional(v.object({
        host: v.string(),
        port: v.number(),
        username: v.string(),
        password: v.string(),
        secure: v.boolean(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const now = Date.now()
    const results = []
    
    for (const [key, value] of Object.entries(args.settings)) {
      if (value !== undefined) {
        const errors = validateAppSettingData(key, value, 'notifications')
        if (errors.length > 0) {
          throw new Error(`Validation failed for ${key}: ${errors.join(', ')}`)
        }

        const existingSetting = await ctx.db.query('appSettings')
          .withIndex('by_key', (q) => q.eq('key', key))
          .first()
        
        const isPublic = isPublicSetting(key, 'notifications')
        
        if (existingSetting) {
          await ctx.db.patch(existingSetting._id, {
            value,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(existingSetting._id)
        } else {
          const newId = await ctx.db.insert('appSettings', {
            key,
            value,
            category: 'notifications',
            description: getSettingDescription(key),
            isPublic,
            createdAt: now,
            createdBy: user._id,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(newId)
        }
      }
    }
    
    return results
  },
})

export const updateNotificationSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const errors = validateAppSettingData(args.key, args.value, 'notifications')
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const existingSetting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()
    
    const now = Date.now()
    const isPublic = isPublicSetting(args.key, 'notifications')
    
    if (existingSetting) {
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: user._id,
      })
      return existingSetting._id
    } else {
      return await ctx.db.insert('appSettings', {
        key: args.key,
        value: args.value,
        category: 'notifications',
        description: getSettingDescription(args.key),
        isPublic,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      })
    }
  },
})

export const updateBillingSettings = mutation({
  args: {
    settings: v.object({
      billingEnabled: v.optional(v.boolean()),
      defaultCurrency: v.optional(v.string()),
      stripeEnabled: v.optional(v.boolean()),
      invoicePrefix: v.optional(v.string()),
      taxRate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const now = Date.now()
    const results = []
    
    for (const [key, value] of Object.entries(args.settings)) {
      if (value !== undefined) {
        const errors = validateAppSettingData(key, value, 'billing')
        if (errors.length > 0) {
          throw new Error(`Validation failed for ${key}: ${errors.join(', ')}`)
        }

        const existingSetting = await ctx.db.query('appSettings')
          .withIndex('by_key', (q) => q.eq('key', key))
          .first()
        
        const isPublic = isPublicSetting(key, 'billing')
        
        if (existingSetting) {
          await ctx.db.patch(existingSetting._id, {
            value,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(existingSetting._id)
        } else {
          const newId = await ctx.db.insert('appSettings', {
            key,
            value,
            category: 'billing',
            description: getSettingDescription(key),
            isPublic,
            createdAt: now,
            createdBy: user._id,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(newId)
        }
      }
    }
    
    return results
  },
})

export const updateBillingSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const errors = validateAppSettingData(args.key, args.value, 'billing')
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const existingSetting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()
    
    const now = Date.now()
    const isPublic = isPublicSetting(args.key, 'billing')
    
    if (existingSetting) {
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: user._id,
      })
      return existingSetting._id
    } else {
      return await ctx.db.insert('appSettings', {
        key: args.key,
        value: args.value,
        category: 'billing',
        description: getSettingDescription(args.key),
        isPublic,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      })
    }
  },
})

export const updateIntegrationSettings = mutation({
  args: {
    settings: v.object({
      slackEnabled: v.optional(v.boolean()),
      discordEnabled: v.optional(v.boolean()),
      githubEnabled: v.optional(v.boolean()),
      googleDriveEnabled: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const now = Date.now()
    const results = []
    
    for (const [key, value] of Object.entries(args.settings)) {
      if (value !== undefined) {
        const errors = validateAppSettingData(key, value, 'integrations')
        if (errors.length > 0) {
          throw new Error(`Validation failed for ${key}: ${errors.join(', ')}`)
        }

        const existingSetting = await ctx.db.query('appSettings')
          .withIndex('by_key', (q) => q.eq('key', key))
          .first()
        
        const isPublic = isPublicSetting(key, 'integrations')
        
        if (existingSetting) {
          await ctx.db.patch(existingSetting._id, {
            value,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(existingSetting._id)
        } else {
          const newId = await ctx.db.insert('appSettings', {
            key,
            value,
            category: 'integrations',
            description: getSettingDescription(key),
            isPublic,
            createdAt: now,
            createdBy: user._id,
            updatedAt: now,
            updatedBy: user._id,
          })
          results.push(newId)
        }
      }
    }
    
    return results
  },
})

export const updateIntegrationSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)
    
    const errors = validateAppSettingData(args.key, args.value, 'integrations')
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const existingSetting = await ctx.db.query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()
    
    const now = Date.now()
    const isPublic = isPublicSetting(args.key, 'integrations')
    
    if (existingSetting) {
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: user._id,
      })
      return existingSetting._id
    } else {
      return await ctx.db.insert('appSettings', {
        key: args.key,
        value: args.value,
        category: 'integrations',
        description: getSettingDescription(args.key),
        isPublic,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      })
    }
  },
})

export const testAIConnection = mutation({
  args: {
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    
    return {
      success: true,
      message: 'Test initiated - check client for results'
    }
  },
})

export const batchUpdateSettings = mutation({
  args: {
    settings: v.array(v.object({
      key: v.string(),
      value: v.any(),
      category: vSettingCategory(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx)

    const results = []
    const now = Date.now()

    for (const setting of args.settings) {
      const errors = validateAppSettingData(setting.key, setting.value, setting.category)
      if (errors.length > 0) {
        throw new Error(`Validation failed for ${setting.key}: ${errors.join(', ')}`)
      }

      const existingSetting = await ctx.db.query('appSettings')
        .withIndex('by_key', (q) => q.eq('key', setting.key))
        .first()

      const isPublic = isPublicSetting(setting.key, setting.category)

      if (existingSetting) {
        await ctx.db.patch(existingSetting._id, {
          value: setting.value,
          category: setting.category,
          updatedAt: now,
          updatedBy: user._id,
        })
        results.push({ key: setting.key, id: existingSetting._id, action: 'updated' })
      } else {
        const newId = await ctx.db.insert('appSettings', {
          key: setting.key,
          value: setting.value,
          category: setting.category,
          description: getSettingDescription(setting.key),
          isPublic,
          createdAt: now,
          createdBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        })
        results.push({ key: setting.key, id: newId, action: 'created' })
      }
    }

    // Create audit log for batch update
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'app_settings.batch_updated',
      entityType: 'app_setting',
      description: `Batch updated ${args.settings.length} settings`,
      metadata: {
        settingKeys: args.settings.map(s => s.key),
        categories: [...new Set(args.settings.map(s => s.category))],
        operation: 'batch_update',
      },
      createdAt: now,
    });

    return results
  },
})

export const resetCategoryToDefaults = mutation({
  args: {
    category: vSettingCategory(),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization
    const user = await requireAdmin(ctx)

    // 2. Get all settings in category
    const existingSettings = await ctx.db.query('appSettings')
      .filter(q => q.eq(q.field('category'), args.category))
      .collect()

    const now = Date.now();

    // 3. Soft delete all settings in category
    for (const setting of existingSettings) {
      await ctx.db.patch(setting._id, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      })
    }

    // 4. Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'app_settings.category_reset',
      entityType: 'app_setting',
      description: `Reset ${args.category} settings to defaults (soft deleted ${existingSettings.length} settings)`,
      metadata: {
        category: args.category,
        deletedCount: existingSettings.length,
        settingKeys: existingSettings.map(s => s.key),
      },
      createdAt: now,
    });

    // 5. Return result
    return {
      success: true,
      message: `Reset ${args.category} settings to defaults`,
      deletedCount: existingSettings.length,
    }
  },
})
