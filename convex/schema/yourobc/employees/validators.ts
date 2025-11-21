// convex/schema/yourobc/employees/validators.ts
// Grouped validators for employees module

import { v } from 'convex/values';

export const employeesValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('terminated'),
    v.literal('on_leave'),
    v.literal('probation')
  ),

  workStatus: v.union(
    v.literal('available'),
    v.literal('busy'),
    v.literal('offline'),
    v.literal('on_break'),
    v.literal('in_meeting')
  ),

  vacationType: v.union(
    v.literal('annual'),
    v.literal('sick'),
    v.literal('personal'),
    v.literal('maternity'),
    v.literal('paternity'),
    v.literal('unpaid'),
    v.literal('bereavement'),
    v.literal('other')
  ),

  vacationStatus: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('cancelled'),
    v.literal('completed')
  ),

  employmentType: v.union(
    v.literal('full_time'),
    v.literal('part_time'),
    v.literal('contract'),
    v.literal('temporary'),
    v.literal('intern')
  ),
} as const;
