// src/features/admin/services/AuditAnalyticsService.ts

import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import type {
  AuditLogEntry,
  AuditLogFilters,
  AdminStats,
  UserAnalytics,
  AdminAction
} from '../types/admin.types'
import { UserProfile, UserRole } from '../../auth/types/auth.types'

/**
 * Audit and analytics service - handles admin audit logs, analytics, and reporting
 */
class AuditAnalyticsService {

  // === Audit Log Queries ===
  useAuditLogs(filters?: AuditLogFilters) {
    return useQuery({
      queryKey: ['admin', 'audit', 'logs', filters],
      queryFn: async () => {
        // This would use a Convex query for audit logs
        // For now, return placeholder data
        return {
          logs: [] as AuditLogEntry[],
          total: 0,
          hasMore: false
        }
      },
      staleTime: 10000, // 10 seconds
    })
  }

  useAuditLogStats() {
    return useQuery({
      queryKey: ['admin', 'audit', 'stats'],
      queryFn: async () => {
        // This would use a Convex query for audit log statistics
        return {
          totalLogs: 0,
          logsToday: 0,
          logsThisWeek: 0,
          logsThisMonth: 0,
          actionCounts: {} as Record<AdminAction, number>,
          entityTypeCounts: {} as Record<string, number>,
          recentActivity: [] as AuditLogEntry[]
        }
      },
      staleTime: 60000, // 1 minute
    })
  }

  // === User Analytics Queries ===
  useUserProfileStats() {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.user_profiles.queries.getProfileStats, {}),
      staleTime: 60000, // 1 minute
    })
  }

  // === Analytics Operations ===
  generateUserAnalytics(users: UserProfile[]): UserAnalytics {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const weekMs = 7 * dayMs
    const monthMs = 30 * dayMs

    const totalUsers = users.length
    const activeUsers = users.filter(u => u.isActive).length
    const bannedUsers = users.filter(u => u.banned).length
    const newUsersToday = users.filter(u => u.createdAt >= now - dayMs).length
    const newUsersThisWeek = users.filter(u => u.createdAt >= now - weekMs).length
    const newUsersThisMonth = users.filter(u => u.createdAt >= now - monthMs).length

    // Count users by role
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<UserRole, number>)

    // Generate activity data for the last 30 days
    const userActivity = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now - (29 - i) * dayMs)
      const dayStart = date.getTime()
      const dayEnd = dayStart + dayMs

      return {
        date: date.toISOString().split('T')[0],
        logins: users.filter(u => 
          u.lastLoginAt >= dayStart && u.lastLoginAt < dayEnd
        ).length,
        registrations: users.filter(u => 
          u.createdAt >= dayStart && u.createdAt < dayEnd
        ).length,
        bans: users.filter(u => 
          u.banned && u.lastActiveAt >= dayStart && u.lastActiveAt < dayEnd
        ).length,
      }
    })

    // Calculate top active users based on various factors
    const topActiveUsers = users
      .map(user => ({
        user,
        activityScore: this.calculateActivityScore(user)
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 10)

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      usersByRole,
      userActivity,
      topActiveUsers,
      impersonationActivity: null, // Would be populated from audit logs
    }
  }

  calculateActivityScore(user: UserProfile): number {
    let score = 0
    
    // Recent activity (last 7 days)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    if (user.lastActiveAt >= weekAgo) score += 10
    
    // Login frequency
    score += Math.min(user.stats.loginCount / 10, 5)
    
    // Karma level
    score += Math.min(user.stats.karmaLevel / 100, 10)
    
    // AI usage
    score += Math.min(user.stats.totalAIRequests / 50, 5)
    
    // Profile completion
    score += user.isProfileComplete ? 5 : 0
    
    return score
  }

  // === Admin Statistics ===
  formatAdminStats(rawStats: any): AdminStats {
    return {
      totalUsers: rawStats?.totalUsers || 0,
      activeUsers: rawStats?.activeUsers || 0,
      adminUsers: rawStats?.adminUsers || 0,
      verifiedUsers: rawStats?.verifiedUsers || 0,
      bannedUsers: rawStats?.bannedUsers || 0,
      completeProfiles: rawStats?.completeProfiles || 0,
      totalAIRequests: rawStats?.totalAIRequests || 0,
      totalAICost: rawStats?.totalAICost || 0,
      totalKarma: rawStats?.totalKarma || 0,
      avgAIRequestsPerUser: rawStats?.avgAIRequestsPerUser || 0,
      avgKarmaPerUser: rawStats?.avgKarmaPerUser || 0,
    }
  }

  formatStatsForDisplay(stats: AdminStats) {
    return {
      totalUsers: this.formatNumber(stats.totalUsers),
      activeUsers: this.formatNumber(stats.activeUsers),
      adminUsers: this.formatNumber(stats.adminUsers),
      verifiedUsers: this.formatNumber(stats.verifiedUsers),
      bannedUsers: this.formatNumber(stats.bannedUsers),
      completeProfiles: this.formatNumber(stats.completeProfiles),
      totalAIRequests: this.formatNumber(stats.totalAIRequests),
      totalAICost: this.formatCurrency(stats.totalAICost),
      totalKarma: this.formatNumber(stats.totalKarma),
      avgAIRequestsPerUser: stats.avgAIRequestsPerUser.toFixed(1),
      avgKarmaPerUser: stats.avgKarmaPerUser.toFixed(1),

      // Calculated percentages
      activeUserPercentage: stats.totalUsers > 0
        ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
        : 0,
      verifiedUserPercentage: stats.totalUsers > 0
        ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
        : 0,
      completeProfilePercentage: stats.totalUsers > 0
        ? Math.round((stats.completeProfiles / stats.totalUsers) * 100)
        : 0,
      bannedUserPercentage: stats.totalUsers > 0
        ? Math.round((stats.bannedUsers / stats.totalUsers) * 100)
        : 0,
    }
  }

  // === Audit Log Utilities ===
  filterAuditLogs(logs: AuditLogEntry[], filters: AuditLogFilters): AuditLogEntry[] {
    return logs.filter(log => {
      if (filters.userId && log.userId !== filters.userId) return false
      if (filters.action && log.action !== filters.action) return false
      if (filters.entityType && log.entityType !== filters.entityType) return false
      if (filters.entityId && log.entityId !== filters.entityId) return false
      if (filters.dateFrom && log.createdAt < filters.dateFrom) return false
      if (filters.dateTo && log.createdAt > filters.dateTo) return false
      
      return true
    })
  }

  groupAuditLogsByDate(logs: AuditLogEntry[]): Record<string, AuditLogEntry[]> {
    return logs.reduce((acc, log) => {
      const date = new Date(log.createdAt).toISOString().split('T')[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(log)
      return acc
    }, {} as Record<string, AuditLogEntry[]>)
  }

  groupAuditLogsByUser(logs: AuditLogEntry[]): Record<string, AuditLogEntry[]> {
    return logs.reduce((acc, log) => {
      if (!acc[log.userId]) acc[log.userId] = []
      acc[log.userId].push(log)
      return acc
    }, {} as Record<string, AuditLogEntry[]>)
  }

  getAuditLogSummary(logs: AuditLogEntry[]): {
    totalLogs: number
    uniqueUsers: number
    uniqueActions: number
    dateRange: { from: number; to: number }
    mostCommonAction: AdminAction | null
  } {
    if (logs.length === 0) {
      return {
        totalLogs: 0,
        uniqueUsers: 0,
        uniqueActions: 0,
        dateRange: { from: 0, to: 0 },
        mostCommonAction: null
      }
    }

    const uniqueUsers = new Set(logs.map(log => log.userId)).size
    const uniqueActions = new Set(logs.map(log => log.action)).size
    const timestamps = logs.map(log => log.createdAt).sort((a, b) => a - b)
    
    // Count action occurrences
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<AdminAction, number>)

    const mostCommonAction = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as AdminAction | null

    return {
      totalLogs: logs.length,
      uniqueUsers,
      uniqueActions,
      dateRange: {
        from: timestamps[0],
        to: timestamps[timestamps.length - 1]
      },
      mostCommonAction
    }
  }

  // === Export Functions ===
  exportAuditLogs(logs: AuditLogEntry[], format: 'csv' | 'json' = 'csv'): string {
    if (format === 'json') {
      return JSON.stringify({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalRecords: logs.length,
        logs: logs.map(log => ({
          ...log,
          createdAt: new Date(log.createdAt).toISOString(),
        }))
      }, null, 2)
    }

    // CSV format
    const headers = [
      'ID', 'User ID', 'User Name', 'Action', 'Entity Type', 'Entity ID', 
      'Entity Title', 'Description', 'Created At'
    ]
    
    const rows = logs.map(log => [
      log.id,
      log.userId,
      log.userName,
      log.action,
      log.entityType,
      log.entityId || '',
      log.entityTitle || '',
      log.description,
      new Date(log.createdAt).toISOString(),
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  exportUserAnalytics(analytics: UserAnalytics, format: 'csv' | 'json' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        analytics
      }, null, 2)
    }

    // CSV format for basic stats
    const headers = [
      'Metric', 'Value'
    ]
    
    const rows = [
      ['Total Users', analytics.totalUsers],
      ['Active Users', analytics.activeUsers],
      ['Banned Users', analytics.bannedUsers],
      ['New Users Today', analytics.newUsersToday],
      ['New Users This Week', analytics.newUsersThisWeek],
      ['New Users This Month', analytics.newUsersThisMonth],
    ]

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  // === Utility Functions ===
  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num)
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount)
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
  }

  formatRelativeTime(timestamp: number): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    const diff = Date.now() - timestamp
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return rtf.format(-diffInDays, 'day')
    if (diffInDays < 30) return rtf.format(-Math.floor(diffInDays / 7), 'week')
    return rtf.format(-Math.floor(diffInDays / 30), 'month')
  }

  getActionIcon(action: AdminAction): string {
    const actionIcons = {
      'user.created': '👤',
      'user.role_changed': '🔄',
      'user.activated': '✅',
      'user.deactivated': '❌',
      'user.banned': '🚫',
      'user.unbanned': '✅',
      'user.password_reset': '🔑',
      'user.impersonated': '👥',
      'user.sessions_revoked': '🔓',
      'user.deleted': '🗑️',
      'bulk.action_performed': '📦',
      'settings.updated': '⚙️',
      'audit.viewed': '👀',
      'data.exported': '📤',
    }

    return actionIcons[action] || '📝'
  }

  getActionColor(action: AdminAction): string {
    const severityColors = {
      'user.created': 'text-green-600 bg-green-50',
      'user.role_changed': 'text-blue-600 bg-blue-50',
      'user.activated': 'text-green-600 bg-green-50',
      'user.deactivated': 'text-yellow-600 bg-yellow-50',
      'user.banned': 'text-red-600 bg-red-50',
      'user.unbanned': 'text-green-600 bg-green-50',
      'user.password_reset': 'text-blue-600 bg-blue-50',
      'user.impersonated': 'text-purple-600 bg-purple-50',
      'user.sessions_revoked': 'text-orange-600 bg-orange-50',
      'user.deleted': 'text-red-600 bg-red-50',
      'bulk.action_performed': 'text-indigo-600 bg-indigo-50',
      'settings.updated': 'text-gray-600 bg-gray-50',
      'audit.viewed': 'text-gray-600 bg-gray-50',
      'data.exported': 'text-blue-600 bg-blue-50',
    }

    return severityColors[action] || 'text-gray-600 bg-gray-50'
  }
}

export const auditAnalyticsService = new AuditAnalyticsService()