// src/features/projects/utils/projectHelpers.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateProjectHealth,
  validateProjectData,
  isProjectOverdue,
  getDaysUntilDue,
  getProjectStatusColor,
  getProjectPriorityColor,
} from './projectHelpers'

describe('projectHelpers', () => {
  describe('calculateProjectHealth', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T00:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return excellent health for a project with high progress and no issues', () => {
      const project = {
        status: 'active',
        progress: { percentage: 95 },
        dueDate: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
      }

      const result = calculateProjectHealth(project)

      expect(result.health).toBe('excellent')
      expect(result.score).toBeGreaterThanOrEqual(80)
    })

    it('should return critical health for a cancelled project', () => {
      const project = {
        status: 'cancelled',
        progress: { percentage: 30 },
      }

      const result = calculateProjectHealth(project)

      expect(result.health).toBe('critical')
      expect(result.score).toBeLessThan(40)
    })

    it('should return warning health for overdue project', () => {
      const project = {
        status: 'active',
        progress: { percentage: 50 },
        dueDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      }

      const result = calculateProjectHealth(project)

      expect(result.health).toBe('warning')
      expect(result.score).toBeLessThan(60)
    })

    it('should return good health for project on track', () => {
      const project = {
        status: 'active',
        progress: { percentage: 65 },
        dueDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
      }

      const result = calculateProjectHealth(project)

      expect(result.health).toBe('good')
      expect(result.score).toBeGreaterThanOrEqual(60)
      expect(result.score).toBeLessThan(80)
    })

    it('should penalize projects on hold', () => {
      const project = {
        status: 'on_hold',
        progress: { percentage: 50 },
      }

      const result = calculateProjectHealth(project)

      expect(result.score).toBeLessThan(70)
    })

    it('should boost score for high progress projects', () => {
      const project = {
        status: 'active',
        progress: { percentage: 95 },
      }

      const result = calculateProjectHealth(project)

      expect(result.rawScore).toBeGreaterThan(100) // Before clamping
      expect(result.score).toBeLessThanOrEqual(100) // After clamping
    })

    it('should penalize low progress projects', () => {
      const project = {
        status: 'active',
        progress: { percentage: 15 },
      }

      const result = calculateProjectHealth(project)

      expect(result.score).toBeLessThan(100)
    })

    it('should not penalize completed projects for being overdue', () => {
      const project = {
        status: 'completed',
        progress: { percentage: 100 },
        dueDate: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      }

      const result = calculateProjectHealth(project)

      // Completed projects should not be penalized for due date
      expect(result.score).toBeGreaterThan(80)
    })

    it('should handle projects with no due date', () => {
      const project = {
        status: 'active',
        progress: { percentage: 50 },
      }

      const result = calculateProjectHealth(project)

      expect(result.health).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should penalize projects due very soon', () => {
      const project = {
        status: 'active',
        progress: { percentage: 50 },
        dueDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
      }

      const result = calculateProjectHealth(project)

      expect(result.score).toBeLessThan(70)
    })
  })

  describe('validateProjectData', () => {
    it('should return no errors for valid project data', () => {
      const data = {
        title: 'Valid Project',
        description: 'A valid description',
        startDate: Date.now(),
        dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        tags: ['tag1', 'tag2'],
        extendedMetadata: {
          estimatedHours: 100,
          budget: 5000,
        },
      }

      const errors = validateProjectData(data)

      expect(errors).toHaveLength(0)
    })

    it('should return error for empty title', () => {
      const data = { title: '' }

      const errors = validateProjectData(data)

      expect(errors).toContain('Project title is required')
    })

    it('should return error for whitespace-only title', () => {
      const data = { title: '   ' }

      const errors = validateProjectData(data)

      expect(errors).toContain('Project title is required')
    })

    it('should return error for title exceeding 100 characters', () => {
      const data = { title: 'a'.repeat(101) }

      const errors = validateProjectData(data)

      expect(errors).toContain('Project title must be less than 100 characters')
    })

    it('should return error for description exceeding 2000 characters', () => {
      const data = {
        title: 'Valid Title',
        description: 'a'.repeat(2001),
      }

      const errors = validateProjectData(data)

      expect(errors).toContain('Project description must be less than 2000 characters')
    })

    it('should return error when start date is after due date', () => {
      const now = Date.now()
      const data = {
        title: 'Valid Title',
        startDate: now + 10 * 24 * 60 * 60 * 1000,
        dueDate: now,
      }

      const errors = validateProjectData(data)

      expect(errors).toContain('Start date cannot be after due date')
    })

    it('should return error for too many tags', () => {
      const data = {
        title: 'Valid Title',
        tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
      }

      const errors = validateProjectData(data)

      expect(errors).toContain('Maximum 10 tags allowed')
    })

    it('should return error for negative estimated hours', () => {
      const data = {
        title: 'Valid Title',
        extendedMetadata: {
          estimatedHours: -10,
        },
      }

      const errors = validateProjectData(data)

      expect(errors).toContain('Estimated hours cannot be negative')
    })

    it('should return error for negative budget', () => {
      const data = {
        title: 'Valid Title',
        extendedMetadata: {
          budget: -1000,
        },
      }

      const errors = validateProjectData(data)

      expect(errors).toContain('Budget cannot be negative')
    })

    it('should return multiple errors for multiple issues', () => {
      const data = {
        title: '',
        description: 'a'.repeat(2001),
        tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
      }

      const errors = validateProjectData(data)

      expect(errors.length).toBeGreaterThan(1)
      expect(errors).toContain('Project title is required')
      expect(errors).toContain('Project description must be less than 2000 characters')
      expect(errors).toContain('Maximum 10 tags allowed')
    })

    it('should allow exactly 10 tags', () => {
      const data = {
        title: 'Valid Title',
        tags: Array.from({ length: 10 }, (_, i) => `tag${i}`),
      }

      const errors = validateProjectData(data)

      expect(errors).not.toContain('Maximum 10 tags allowed')
    })

    it('should allow zero hours and budget', () => {
      const data = {
        title: 'Valid Title',
        extendedMetadata: {
          estimatedHours: 0,
          budget: 0,
        },
      }

      const errors = validateProjectData(data)

      expect(errors).toHaveLength(0)
    })
  })

  describe('isProjectOverdue', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T00:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for overdue active project', () => {
      const project = {
        dueDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        status: 'active',
      }

      expect(isProjectOverdue(project)).toBe(true)
    })

    it('should return false for project not yet due', () => {
      const project = {
        dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
        status: 'active',
      }

      expect(isProjectOverdue(project)).toBe(false)
    })

    it('should return false for completed project even if past due date', () => {
      const project = {
        dueDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        status: 'completed',
      }

      expect(isProjectOverdue(project)).toBe(false)
    })

    it('should return false for project without due date', () => {
      const project = {
        status: 'active',
      }

      expect(isProjectOverdue(project)).toBe(false)
    })

    it('should handle projects on hold that are overdue', () => {
      const project = {
        dueDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: 'on_hold',
      }

      expect(isProjectOverdue(project)).toBe(true)
    })
  })

  describe('getDaysUntilDue', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T00:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return positive days for future due date', () => {
      const dueDate = Date.now() + 10 * 24 * 60 * 60 * 1000 // 10 days from now

      const days = getDaysUntilDue(dueDate)

      expect(days).toBe(10)
    })

    it('should return negative days for past due date', () => {
      const dueDate = Date.now() - 5 * 24 * 60 * 60 * 1000 // 5 days ago

      const days = getDaysUntilDue(dueDate)

      expect(days).toBe(-5)
    })

    it('should return 0 for due date today', () => {
      const dueDate = Date.now() + 12 * 60 * 60 * 1000 // 12 hours from now (still today)

      const days = getDaysUntilDue(dueDate)

      expect(days).toBe(1) // Rounds up to next day
    })

    it('should round up partial days', () => {
      const dueDate = Date.now() + 1.5 * 24 * 60 * 60 * 1000 // 1.5 days from now

      const days = getDaysUntilDue(dueDate)

      expect(days).toBe(2) // Should round up
    })
  })

  describe('getProjectStatusColor', () => {
    it('should return green for active status', () => {
      expect(getProjectStatusColor('active')).toBe('green')
    })

    it('should return blue for completed status', () => {
      expect(getProjectStatusColor('completed')).toBe('blue')
    })

    it('should return yellow for on_hold status', () => {
      expect(getProjectStatusColor('on_hold')).toBe('yellow')
    })

    it('should return red for cancelled status', () => {
      expect(getProjectStatusColor('cancelled')).toBe('red')
    })

    it('should return gray for unknown status', () => {
      expect(getProjectStatusColor('unknown')).toBe('gray')
      expect(getProjectStatusColor('')).toBe('gray')
      expect(getProjectStatusColor('random')).toBe('gray')
    })
  })

  describe('getProjectPriorityColor', () => {
    it('should return gray for low priority', () => {
      expect(getProjectPriorityColor('low')).toBe('gray')
    })

    it('should return blue for medium priority', () => {
      expect(getProjectPriorityColor('medium')).toBe('blue')
    })

    it('should return orange for high priority', () => {
      expect(getProjectPriorityColor('high')).toBe('orange')
    })

    it('should return red for urgent priority', () => {
      expect(getProjectPriorityColor('urgent')).toBe('red')
    })

    it('should return red for critical priority', () => {
      expect(getProjectPriorityColor('critical')).toBe('red')
    })

    it('should return gray for unknown priority', () => {
      expect(getProjectPriorityColor('unknown')).toBe('gray')
      expect(getProjectPriorityColor('')).toBe('gray')
      expect(getProjectPriorityColor('random')).toBe('gray')
    })
  })
})
