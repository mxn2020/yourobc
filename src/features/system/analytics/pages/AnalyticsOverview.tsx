// src/features/boilerplate/analytics/pages/AnalyticsOverview.tsx

import { MetricCard } from "../components/MetricCard";
import { useAnalyticsSummary, useActiveSessions } from "../hooks/useMetrics";
import { formatDate } from "../utils/date-utils";

/**
 * Analytics Overview Page
 * Displays key metrics and analytics summary
 */
export function AnalyticsOverview() {
  const { data: summary, isLoading } = useAnalyticsSummary("last_30_days");
  const { count: activeSessions } = useActiveSessions();

  if (isLoading) {
    return <div className="analytics-overview loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-overview">
      <div className="analytics-header">
        <h1>Analytics Overview</h1>
        {summary && (
          <p className="date-range">
            {formatDate(summary.dateRange.start)} - {formatDate(summary.dateRange.end)}
          </p>
        )}
      </div>

      <div className="metrics-grid">
        {/* Key Metrics */}
        <MetricCard
          metricType="daily_active_users"
          label="Daily Active Users"
          period="day"
          preset="last_30_days"
          showTrend={true}
        />

        <MetricCard
          metricType="page_views"
          label="Page Views"
          period="day"
          preset="last_30_days"
          showTrend={true}
        />

        <MetricCard
          metricType="sessions"
          label="Total Sessions"
          period="day"
          preset="last_30_days"
          showTrend={true}
        />

        <div className="metric-card">
          <div className="metric-label">Active Sessions (Now)</div>
          <div className="metric-value">{activeSessions}</div>
        </div>
      </div>

      {summary && (
        <div className="analytics-summary">
          <h2>Summary</h2>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Events</span>
              <span className="stat-value">{summary.totalEvents.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Unique Users</span>
              <span className="stat-value">{summary.uniqueUsers.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Page Views</span>
              <span className="stat-value">{summary.pageViews.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Sessions</span>
              <span className="stat-value">{summary.activeSessions.toLocaleString()}</span>
            </div>
          </div>

          <div className="events-breakdown">
            <h3>Events by Type</h3>
            <div className="breakdown-list">
              {Object.entries(summary.eventsByType).map(([type, count]) => (
                <div key={type} className="breakdown-item">
                  <span className="breakdown-label">{type}</span>
                  <span className="breakdown-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
