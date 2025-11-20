// src/core/ai/CostTracker.ts
import type { ModelInfo } from '../types/ai-models.types';
import type { TokenUsage } from '../types/ai-core.types';
import { 
  calculateRequestCost, 
  calculateCachingSavings, 
  projectCosts,
  calculateBudgetUtilization,
  analyzeSpendingPatterns
} from '@/features/boilerplate/ai-core/utils';
import { 
  DEFAULT_COST_CONFIG, 
  PROVIDER_COST_MULTIPLIERS,
  COST_ALERT_TYPES 
} from '../constants/ai-costs';
import { Id } from "@/convex/_generated/dataModel";

export interface CostAlert {
  id: string;
  type: keyof typeof COST_ALERT_TYPES;
  severity: 'low' | 'medium' | 'high';
  message: string;
  threshold: number;
  actual: number;
  timestamp: Date;
  userId?: Id<"userProfiles">;
  modelId?: string;
}

export interface BudgetConfig {
  userId: Id<"userProfiles">;
  daily?: number;
  weekly?: number;
  monthly?: number;
  currency: string;
  alertThresholds: {
    warning: number; // percentage
    critical: number; // percentage
  };
}

export interface CostSummary {
  totalCost: number;
  totalTokens: number;
  avgCostPerToken: number;
  avgCostPerRequest: number;
  requestCount: number;
  cachingSavings: number;
  period: {
    start: Date;
    end: Date;
  };
}

interface CostEntry {
  id: string;
  userId?: Id<"userProfiles">;
  modelId: string;
  cost: number;
  tokens: TokenUsage;
  timestamp: Date;
  cached: boolean;
  requestId: string;
}

export class CostTracker {
  private readonly costEntries = new Map<string, CostEntry>();
  private readonly budgets = new Map<string, BudgetConfig>();
  private readonly alerts = new Map<string, CostAlert>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private config = DEFAULT_COST_CONFIG) {
    // Start periodic cleanup of old entries
    this.startCleanupTimer();
  }

  /**
   * Calculate cost for a request
   */
  public async calculateCost(
    model: ModelInfo,
    usage: TokenUsage,
    options: {
      cached?: boolean;
      userId?: Id<"userProfiles">;
      requestId?: string;
    } = {}
  ): Promise<number> {
    const { cached = false, userId, requestId } = options;
    
    // Calculate base cost
    let cost = calculateRequestCost(model, usage);
    
    // Apply provider multiplier
    const multiplier = PROVIDER_COST_MULTIPLIERS[model.provider] || 1.0;
    cost *= multiplier;
    
    // Cache hits have no cost
    if (cached) {
      cost = 0;
    }
    
    // Store cost entry for tracking
    if (requestId) {
      this.storeCostEntry({
        id: crypto.randomUUID(),
        userId: userId || undefined,
        modelId: model.id,
        cost,
        tokens: usage,
        timestamp: new Date(),
        cached,
        requestId
      });
    }
    
    // Check budget alerts if user is specified
    if (userId && cost > 0) {
      await this.checkBudgetAlerts(userId, cost);
    }
    
    return Number(cost.toFixed(this.config.precision));
  }

  /**
   * Get cost summary for a period
   */
  public getCostSummary(
    userId: Id<"userProfiles">,
    period: { start: Date; end: Date }
  ): CostSummary {
    const entries = this.getCostEntries(userId, period);
    
    if (entries.length === 0) {
      return {
        totalCost: 0,
        totalTokens: 0,
        avgCostPerToken: 0,
        avgCostPerRequest: 0,
        requestCount: 0,
        cachingSavings: 0,
        period
      };
    }
    
    const totalCost = entries.reduce((sum, entry) => sum + entry.cost, 0);
    const totalTokens = entries.reduce((sum, entry) => sum + entry.tokens.totalTokens, 0);
    const cachedRequests = entries.filter(entry => entry.cached).length;
    const requestCount = entries.length;
    
    // Estimate caching savings (rough calculation)
    const avgNonCachedCost = entries
      .filter(entry => !entry.cached && entry.cost > 0)
      .reduce((sum, entry) => sum + entry.cost, 0) / Math.max(1, requestCount - cachedRequests);
    
    const cachingSavings = cachedRequests * avgNonCachedCost;
    
    return {
      totalCost,
      totalTokens,
      avgCostPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
      avgCostPerRequest: totalCost / requestCount,
      requestCount,
      cachingSavings,
      period
    };
  }

  /**
   * Set budget for a user
   */
  public setBudget(budget: BudgetConfig): void {
    this.budgets.set(budget.userId, budget);
  }

  /**
   * Get budget for a user
   */
  public getBudget(userId: Id<"userProfiles">): BudgetConfig | null {
    return this.budgets.get(userId) || null;
  }

  /**
   * Check budget utilization
   */
  public checkBudgetUtilization(
    userId: Id<"userProfiles">,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): {
    budget: number;
    spent: number;
    percentage: number;
    remaining: number;
    status: 'safe' | 'warning' | 'critical' | 'exceeded';
    alerts: CostAlert[];
  } | null {
    const budget = this.getBudget(userId);
    if (!budget) return null;

    const budgetAmount = budget[period];
    if (!budgetAmount) return null;

    // Calculate period dates
    const now = new Date();
    let periodStart: Date;
    
    switch (period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - now.getDay());
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const summary = this.getCostSummary(userId, {
      start: periodStart,
      end: now
    });

    const utilization = calculateBudgetUtilization(summary.totalCost, budgetAmount);
    const relevantAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .filter(alert => alert.timestamp >= periodStart);

    return {
      budget: budgetAmount,
      spent: summary.totalCost,
      percentage: utilization.percentage,
      remaining: utilization.remaining,
      status: utilization.status,
      alerts: relevantAlerts
    };
  }

  /**
   * Get cost breakdown by model
   */
  public getCostBreakdownByModel(
    userId: Id<"userProfiles">,
    period: { start: Date; end: Date }
  ): Array<{
    modelId: string;
    cost: number;
    tokens: number;
    requests: number;
    avgCostPerRequest: number;
    percentage: number;
  }> {
    const entries = this.getCostEntries(userId, period);
    const totalCost = entries.reduce((sum, entry) => sum + entry.cost, 0);
    
    const modelCosts = new Map<string, {
      cost: number;
      tokens: number;
      requests: number;
    }>();
    
    entries.forEach(entry => {
      const existing = modelCosts.get(entry.modelId) || {
        cost: 0,
        tokens: 0,
        requests: 0
      };
      
      modelCosts.set(entry.modelId, {
        cost: existing.cost + entry.cost,
        tokens: existing.tokens + entry.tokens.totalTokens,
        requests: existing.requests + 1
      });
    });
    
    return Array.from(modelCosts.entries())
      .map(([modelId, data]) => ({
        modelId,
        cost: data.cost,
        tokens: data.tokens,
        requests: data.requests,
        avgCostPerRequest: data.cost / data.requests,
        percentage: totalCost > 0 ? (data.cost / totalCost) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost);
  }

  /**
   * Project future costs based on current usage
   */
  public projectCosts(
    userId: Id<"userProfiles">,
    projectionDays = 30
  ): {
    dailyAverage: number;
    projectedCost: number;
    confidence: 'low' | 'medium' | 'high';
    basedOnDays: number;
  } {
    // Use last 7 days for projection
    const now = new Date();
    const lookbackStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const summary = this.getCostSummary(userId, {
      start: lookbackStart,
      end: now
    });
    
    const dailyAverage = summary.totalCost / 7;
    const projectedCost = dailyAverage * projectionDays;
    
    // Determine confidence based on request volume
    let confidence: 'low' | 'medium' | 'high';
    if (summary.requestCount < 5) {
      confidence = 'low';
    } else if (summary.requestCount < 20) {
      confidence = 'medium';
    } else {
      confidence = 'high';
    }
    
    return {
      dailyAverage,
      projectedCost,
      confidence,
      basedOnDays: 7
    };
  }

  /**
   * Get active alerts for a user
   */
  public getActiveAlerts(userId?: Id<"userProfiles">): CostAlert[] {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return Array.from(this.alerts.values())
      .filter(alert => alert.timestamp >= dayAgo)
      .filter(alert => !userId || alert.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Dismiss an alert
   */
  public dismissAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  /**
   * Get service statistics
   */
  public getStats(): {
    totalCostEntries: number;
    totalBudgets: number;
    activeAlerts: number;
    memoryUsage: {
      costEntries: number;
      budgets: number;
      alerts: number;
    };
  } {
    return {
      totalCostEntries: this.costEntries.size,
      totalBudgets: this.budgets.size,
      activeAlerts: this.alerts.size,
      memoryUsage: {
        costEntries: this.costEntries.size,
        budgets: this.budgets.size,
        alerts: this.alerts.size
      }
    };
  }

  /**
   * Clear old data
   */
  public clearOldData(olderThanDays = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let deletedCount = 0;
    
    // Clear old cost entries
    for (const [id, entry] of this.costEntries) {
      if (entry.timestamp < cutoffDate) {
        this.costEntries.delete(id);
        deletedCount++;
      }
    }
    
    // Clear old alerts
    for (const [id, alert] of this.alerts) {
      if (alert.timestamp < cutoffDate) {
        this.alerts.delete(id);
      }
    }
    
    return deletedCount;
  }

  /**
   * Store cost entry
   */
  private storeCostEntry(entry: CostEntry): void {
    this.costEntries.set(entry.id, entry);
    
    // Prevent memory leaks by limiting entries
    if (this.costEntries.size > 10000) {
      const oldestEntries = Array.from(this.costEntries.entries())
        .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime())
        .slice(0, 1000);
      
      oldestEntries.forEach(([id]) => this.costEntries.delete(id));
    }
  }

  /**
   * Get cost entries for a user and period
   */
  private getCostEntries(
    userId: Id<"userProfiles">,
    period: { start: Date; end: Date }
  ): CostEntry[] {
    return Array.from(this.costEntries.values())
      .filter(entry => entry.userId === userId)
      .filter(entry => entry.timestamp >= period.start && entry.timestamp <= period.end);
  }

  /**
   * Check and create budget alerts
   */
  private async checkBudgetAlerts(userId: Id<"userProfiles">, newCost: number): Promise<void> {
    const budget = this.getBudget(userId);
    if (!budget) return;

    // Check daily budget
    if (budget.daily) {
      await this.checkPeriodBudget(userId, 'daily', budget.daily, budget.alertThresholds);
    }

    // Check monthly budget
    if (budget.monthly) {
      await this.checkPeriodBudget(userId, 'monthly', budget.monthly, budget.alertThresholds);
    }

    // Check for unusual spending patterns
    this.checkUnusualSpending(userId, newCost);
  }

  /**
   * Check budget for specific period
   */
  private async checkPeriodBudget(
    userId: Id<"userProfiles">,
    period: 'daily' | 'monthly',
    budgetAmount: number,
    thresholds: { warning: number; critical: number }
  ): Promise<void> {
    const utilization = this.checkBudgetUtilization(userId, period);
    if (!utilization) return;

    const percentage = utilization.percentage;
    
    // Create alerts based on thresholds
    if (percentage >= 100 && utilization.status === 'exceeded') {
      this.createAlert({
        type: 'BUDGET_EXCEEDED',
        severity: 'high',
        message: `${period} budget exceeded: ${utilization.spent.toFixed(2)} / ${budgetAmount.toFixed(2)}`,
        threshold: budgetAmount,
        actual: utilization.spent,
        userId
      });
    } else if (percentage >= thresholds.critical) {
      this.createAlert({
        type: 'BUDGET_CRITICAL',
        severity: 'high',
        message: `${period} budget ${percentage.toFixed(1)}% used: ${utilization.spent.toFixed(2)} / ${budgetAmount.toFixed(2)}`,
        threshold: budgetAmount * (thresholds.critical / 100),
        actual: utilization.spent,
        userId
      });
    } else if (percentage >= thresholds.warning) {
      this.createAlert({
        type: 'BUDGET_WARNING',
        severity: 'medium',
        message: `${period} budget ${percentage.toFixed(1)}% used: ${utilization.spent.toFixed(2)} / ${budgetAmount.toFixed(2)}`,
        threshold: budgetAmount * (thresholds.warning / 100),
        actual: utilization.spent,
        userId
      });
    }
  }

  /**
   * Check for unusual spending patterns
   */
  private checkUnusualSpending(userId: Id<"userProfiles">, newCost: number): void {
    // Get recent costs for pattern analysis
    const recentEntries = Array.from(this.costEntries.values())
      .filter(entry => entry.userId === userId)
      .filter(entry => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return entry.timestamp >= dayAgo;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    if (recentEntries.length < 5) return;

    const recentCosts = recentEntries.map(entry => entry.cost);
    const avgRecentCost = recentCosts.reduce((sum, cost) => sum + cost, 0) / recentCosts.length;

    // Alert if current cost is significantly higher than recent average
    if (newCost > avgRecentCost * 5 && newCost > 1) {
      this.createAlert({
        type: 'UNUSUAL_SPENDING',
        severity: 'medium',
        message: `Unusually high cost detected: ${newCost.toFixed(4)} (avg: ${avgRecentCost.toFixed(4)})`,
        threshold: avgRecentCost * 5,
        actual: newCost,
        userId
      });
    }
  }

  /**
   * Create a cost alert
   */
  private createAlert(alertData: {
    type: keyof typeof COST_ALERT_TYPES;
    severity: 'low' | 'medium' | 'high';
    message: string;
    threshold: number;
    actual: number;
    userId?: Id<"userProfiles">;
    modelId?: string;
  }): void {
    const alertId = crypto.randomUUID();
    
    // Check if similar alert already exists (prevent spam)
    const existingAlert = Array.from(this.alerts.values()).find(alert =>
      alert.type === alertData.type &&
      alert.userId === alertData.userId &&
      alert.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Within last hour
    );

    if (existingAlert) return;

    const alert: CostAlert = {
      id: alertId,
      timestamp: new Date(),
      ...alertData
    };

    this.alerts.set(alertId, alert);
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.clearOldData(7); // Keep only last 7 days
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Stop cleanup timer
   */
  public shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}