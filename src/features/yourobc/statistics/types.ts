// src/features/yourobc/statistics/types.ts
import type { Id, Doc } from "../../../../convex/_generated/dataModel";

// ============================================================================
// Revenue Analysis Types
// ============================================================================

export interface RevenueSummary {
  totalRevenue: number;
  totalCost: number;
  totalCommission: number;
  totalMargin: number;
  averageMargin: number;
  marginPercentage: number;
  invoiceCount: number;
  currency: 'EUR';
}

export interface RevenueInvoice {
  invoiceId: Id<'yourobcInvoices'>;
  invoiceNumber: string;
  issueDate: number;
  customerId?: Id<'yourobcCustomers'>;
  shipmentId?: Id<'yourobcShipments'>;
  salesPrice: number;
  purchaseCost: number;
  commission: number;
  margin: number;
  marginPercentage: number;
}

export interface RevenueAnalysis {
  summary: RevenueSummary;
  invoices: RevenueInvoice[];
  period: {
    startDate: number;
    endDate: number;
  };
}

// ============================================================================
// Monthly Revenue Types
// ============================================================================

export interface MonthlyRevenueData {
  month: number;
  revenue: number;
  cost: number;
  commission: number;
  margin: number;
  invoiceCount: number;
}

export interface YearTotal {
  revenue: number;
  cost: number;
  commission: number;
  margin: number;
  invoiceCount: number;
  averageMargin: number;
  marginPercentage: number;
}

export interface MonthlyRevenue {
  year: number;
  monthlyData: MonthlyRevenueData[];
  yearTotal: YearTotal;
  currency: 'EUR';
}

// ============================================================================
// Top Customers Types
// ============================================================================

export interface TopCustomer {
  customerId: string;
  customerName: string;
  revenue: number;
  cost: number;
  margin: number;
  invoiceCount: number;
  averageOrderValue: number;
  averageMargin: number;
  marginPercentage: number;
}

export type SortBy = 'revenue' | 'margin' | 'count';

export interface TopCustomers {
  topCustomers: TopCustomer[];
  currency: 'EUR';
  sortBy: SortBy;
}

// ============================================================================
// Real Profit Types
// ============================================================================

export interface DirectCosts {
  purchaseCosts: number;
  commissions: number;
  total: number;
}

export interface OperatingCostsBreakdown {
  employeeCosts: number;
  officeCosts: number;
  miscExpenses: number;
  total: number;
}

export interface RealProfit {
  revenue: number;
  directCosts: DirectCosts;
  grossProfit: number;
  grossProfitPercentage: number;
  operatingCosts: OperatingCostsBreakdown;
  realProfit: number;
  realProfitPercentage: number;
  currency: 'EUR';
  period: {
    startDate: number;
    endDate: number;
  };
}

// ============================================================================
// Year Over Year Comparison Types
// ============================================================================

export interface YearMetrics {
  year: number;
  revenue: number;
  cost: number;
  commission: number;
  margin: number;
  invoiceCount: number;
  averageMargin: number;
  marginPercentage: number;
}

export interface YearOverYearChange {
  revenue: number;
  revenuePercentage: number;
  margin: number;
  marginPercentage: number;
  invoiceCount: number;
  invoiceCountPercentage: number;
}

export interface YearOverYearComparison {
  currentYear: YearMetrics;
  previousYear: YearMetrics;
  growth: {
    revenue: number;
    margin: number;
    invoiceCount: number;
  };
  monthlyComparison: Array<{
    month: number;
    current: {
      revenue: number;
      margin: number;
      invoiceCount: number;
    };
    previous: {
      revenue: number;
      margin: number;
      invoiceCount: number;
    };
    growth: {
      revenue: number;
      margin: number;
    };
  }>;
  currency: 'EUR';
}

// ============================================================================
// Employee KPI Types
// ============================================================================

export interface TargetComparison {
  revenue: {
    actual: number;
    target: number;
    achievement: number;
  };
  margin: {
    actual: number;
    target: number;
    achievement: number;
  };
  quoteCount: {
    actual: number;
    target: number;
    achievement: number;
  };
  orderCount: {
    actual: number;
    target: number;
    achievement: number;
  };
  conversionRate: {
    actual: number;
    target: number;
    achievement: number;
  };
}

export interface EmployeeKPIData {
  employeeId: Id<'yourobcEmployees'>;
  period: {
    startDate: number;
    endDate: number;
  };
  kpis: {
    quoteCount: number;
    averageQuoteValue: number;
    totalQuoteValue: number;
    orderCount: number;
    averageOrderValue: number;
    totalOrderValue: number;
    totalMargin: number;
    averageMarginPerOrder: number;
    marginPercentage: number;
    conversionRate: number;
  };
  targets: {
    monthly: {
      revenueTarget?: {
        amount: number;
        currency: 'EUR' | 'USD';
        exchangeRate?: number;
      };
      marginTarget?: {
        amount: number;
        currency: 'EUR' | 'USD';
        exchangeRate?: number;
      };
      quoteCountTarget?: number;
      orderCountTarget?: number;
      conversionRateTarget?: number;
    } | null;
    yearly: {
      revenueTarget?: {
        amount: number;
        currency: 'EUR' | 'USD';
        exchangeRate?: number;
      };
      marginTarget?: {
        amount: number;
        currency: 'EUR' | 'USD';
        exchangeRate?: number;
      };
      quoteCountTarget?: number;
      orderCountTarget?: number;
      conversionRateTarget?: number;
    } | null;
  };
  targetComparison: TargetComparison | null;
  currency: 'EUR';
}

export interface EmployeeKPISummary {
  totalEmployees: number;
  totalRevenue: number;
  totalMargin: number;
  totalOrders: number;
  totalQuotes: number;
  averageConversionRate: number;
}

export interface AllEmployeeKPIs {
  employees: Array<{
    employeeId: Id<'yourobcEmployees'>;
    employeeName: string;
    quoteCount: number;
    averageQuoteValue: number;
    totalQuoteValue: number;
    orderCount: number;
    averageOrderValue: number;
    totalOrderValue: number;
    totalMargin: number;
    averageMarginPerOrder: number;
    marginPercentage: number;
    conversionRate: number;
    targetComparison: TargetComparison | null;
  }>;
  summary: EmployeeKPISummary;
  currency: 'EUR';
}

// ============================================================================
// Employee Ranking Types
// ============================================================================

export interface EmployeeRankingData {
  employeeId: Id<'yourobcEmployees'>;
  employeeName: string;
  quoteCount: number;
  averageQuoteValue: number;
  totalQuoteValue: number;
  orderCount: number;
  averageOrderValue: number;
  totalOrderValue: number;
  totalMargin: number;
  averageMarginPerOrder: number;
  marginPercentage: number;
  conversionRate: number;
  targetComparison: TargetComparison | null;
  rank: number;
}

export type RankBy = 'revenue' | 'margin' | 'orders' | 'conversionRate';

export interface EmployeeRanking {
  ranking: EmployeeRankingData[];
  rankBy: RankBy;
  period: {
    startDate: number;
    endDate: number;
  };
}

// ============================================================================
// Quote Performance Types
// ============================================================================

export interface QuotesByStatus {
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
}

export interface ConversionMetrics {
  sentQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  conversionRate: number;
  rejectionRate: number;
}

export interface AverageQuoteValues {
  accepted: number;
  rejected: number;
  overall: number;
}

export interface QuotePerformanceAnalysis {
  totalQuotes: number;
  byStatus: QuotesByStatus;
  conversionMetrics: ConversionMetrics;
  averageValues: AverageQuoteValues;
  period: {
    startDate: number;
    endDate: number;
  };
  currency: 'EUR';
}

// ============================================================================
// Operating Costs Types
// ============================================================================

export type EmployeeCost = Doc<'yourobcEmployeeCosts'>;
export type OfficeCost = Doc<'yourobcOfficeCosts'>;
export type MiscExpense = Doc<'yourobcMiscExpenses'>;
export type KpiTarget = Doc<'yourobcKpiTargets'>;

export interface PendingExpenseApproval extends MiscExpense {
  employeeName: string | null;
}

export interface OperatingCostsSummary {
  employeeCosts: {
    total: number;
    employeeCount: number;
  };
  officeCosts: {
    total: number;
    itemCount: number;
  };
  miscExpenses: {
    total: number;
    expenseCount: number;
  };
  totalOperatingCosts: number;
  currency: 'EUR';
  period: {
    startDate: number;
    endDate: number;
  };
}

// ============================================================================
// Hook Return Types (for consistency)
// ============================================================================

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

export interface MutationResult<T> {
  mutate: T;
  isLoading: boolean;
  error: Error | null;
}
