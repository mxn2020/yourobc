import type { Meta, StoryObj } from '@storybook/react'
import { ProjectStats } from './ProjectStats'
import type { ProjectStats as ProjectStatsType } from '@/convex/lib/projects'

const meta = {
  title: 'Projects/Components/ProjectStats',
  component: ProjectStats,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Loading state',
    },
  },
} satisfies Meta<typeof ProjectStats>

export default meta
type Story = StoryObj<typeof meta>

const mockStats: ProjectStatsType = {
  totalProjects: 42,
  activeProjects: 15,
  completedProjects: 20,
  onHoldProjects: 5,
  archivedProjects: 2,
  averageProgress: 68,
  overdueProjects: 3,
  atRiskProjects: 4,
  projectsByStatus: {
    active: 15,
    completed: 20,
    on_hold: 5,
    archived: 2,
    cancelled: 0,
  },
  projectsByPriority: {
    urgent: 2,
    high: 8,
    medium: 18,
    low: 14,
  },
  projectsByCategory: {
    Development: 12,
    Design: 8,
    Marketing: 7,
    Research: 5,
    Operations: 4,
    Sales: 3,
    Support: 2,
    Other: 1,
  },
}

const healthyStats: ProjectStatsType = {
  totalProjects: 25,
  activeProjects: 18,
  completedProjects: 7,
  onHoldProjects: 0,
  archivedProjects: 0,
  averageProgress: 85,
  overdueProjects: 0,
  atRiskProjects: 1,
  projectsByStatus: {
    active: 18,
    completed: 7,
    on_hold: 0,
    archived: 0,
    cancelled: 0,
  },
  projectsByPriority: {
    urgent: 0,
    high: 3,
    medium: 12,
    low: 10,
  },
  projectsByCategory: {
    Development: 15,
    Design: 7,
    Research: 3,
  },
}

const criticalStats: ProjectStatsType = {
  totalProjects: 30,
  activeProjects: 25,
  completedProjects: 2,
  onHoldProjects: 2,
  archivedProjects: 1,
  averageProgress: 35,
  overdueProjects: 12,
  atRiskProjects: 8,
  projectsByStatus: {
    active: 25,
    completed: 2,
    on_hold: 2,
    archived: 1,
    cancelled: 0,
  },
  projectsByPriority: {
    urgent: 8,
    high: 12,
    medium: 7,
    low: 3,
  },
  projectsByCategory: {
    Development: 18,
    Support: 8,
    Operations: 4,
  },
}

const emptyStats: ProjectStatsType = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  onHoldProjects: 0,
  archivedProjects: 0,
  averageProgress: 0,
  overdueProjects: 0,
  atRiskProjects: 0,
  projectsByStatus: {
    active: 0,
    completed: 0,
    on_hold: 0,
    archived: 0,
    cancelled: 0,
  },
  projectsByPriority: {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  },
  projectsByCategory: {},
}

/**
 * Default project statistics showing a typical project portfolio.
 */
export const Default: Story = {
  args: {
    stats: mockStats,
    isLoading: false,
  },
}

/**
 * Loading state while fetching statistics.
 */
export const Loading: Story = {
  args: {
    stats: undefined,
    isLoading: true,
  },
}

/**
 * Healthy portfolio with good completion rates and minimal issues.
 */
export const HealthyPortfolio: Story = {
  args: {
    stats: healthyStats,
    isLoading: false,
  },
}

/**
 * Critical portfolio with many overdue and at-risk projects.
 */
export const CriticalPortfolio: Story = {
  args: {
    stats: criticalStats,
    isLoading: false,
  },
}

/**
 * Empty state when no projects exist.
 */
export const EmptyState: Story = {
  args: {
    stats: emptyStats,
    isLoading: false,
  },
}

/**
 * Portfolio with many completed projects.
 */
export const HighCompletionRate: Story = {
  args: {
    stats: {
      ...mockStats,
      totalProjects: 50,
      completedProjects: 45,
      activeProjects: 5,
      averageProgress: 95,
      overdueProjects: 0,
    },
    isLoading: false,
  },
}
