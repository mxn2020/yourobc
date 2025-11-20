// src/features/yourobc/shipments/components/AssignedToDisplay.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { AssignedTo } from '@/convex/lib/yourobc/shipments/types'

interface AssignedToDisplayProps {
  assignedTo?: AssignedTo
  compact?: boolean
  showRole?: boolean
}

const getTypeColor = (type: 'OBC-Kurier' | 'NFO-Partner'): 'secondary' | 'primary' => {
  return type === 'OBC-Kurier' ? 'secondary' : 'primary'
}

const getTypeIcon = (type: 'OBC-Kurier' | 'NFO-Partner'): string => {
  return type === 'OBC-Kurier' ? '🚗' : '✈️'
}

const getRoleIcon = (role?: string): string => {
  switch (role) {
    case 'pickup':
      return '📤'
    case 'delivery':
      return '📥'
    case 'customs':
      return '📋'
    case 'general':
    default:
      return '👤'
  }
}

const getRoleLabel = (role?: string): string => {
  switch (role) {
    case 'pickup':
      return 'Pickup'
    case 'delivery':
      return 'Delivery'
    case 'customs':
      return 'Customs'
    case 'general':
    default:
      return 'General'
  }
}

export const AssignedToDisplay: FC<AssignedToDisplayProps> = ({
  assignedTo,
  compact = false,
  showRole = false,
}) => {
  if (!assignedTo) {
    return compact ? (
      <span className="text-xs text-muted-foreground">Unassigned</span>
    ) : (
      <div className="text-sm text-muted-foreground">Not assigned</div>
    )
  }

  const { name, type, role } = assignedTo
  const typeColor = getTypeColor(type)
  const typeIcon = getTypeIcon(type)
  const roleIcon = getRoleIcon(role)
  const roleLabel = getRoleLabel(role)

  // Compact mode for table cells
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant={typeColor} className="text-xs font-medium">
          {typeIcon} {type}
        </Badge>
        <span className="text-xs font-medium truncate max-w-[120px]" title={name}>
          {name}
        </span>
        {showRole && role && (
          <span className="text-xs text-muted-foreground" title={roleLabel}>
            {roleIcon}
          </span>
        )}
      </div>
    )
  }

  // Full display mode
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={typeColor} className="text-xs">
          {typeIcon} {type}
        </Badge>
        {showRole && role && (
          <Badge variant="outline" className="text-xs">
            {roleIcon} {roleLabel}
          </Badge>
        )}
      </div>
      <div className="text-sm font-medium">{name}</div>
    </div>
  )
}

/**
 * Compact version for table cells
 */
export const AssignedToDisplayCompact: FC<AssignedToDisplayProps> = (props) => {
  return <AssignedToDisplay {...props} compact={true} />
}

/**
 * Display multiple assigned entities (e.g., pickup courier + delivery partner)
 */
interface MultiAssignedDisplayProps {
  assignments: AssignedTo[]
  compact?: boolean
}

export const MultiAssignedDisplay: FC<MultiAssignedDisplayProps> = ({
  assignments,
  compact = false,
}) => {
  if (assignments.length === 0) {
    return compact ? (
      <span className="text-xs text-muted-foreground">None assigned</span>
    ) : (
      <div className="text-sm text-muted-foreground">No assignments</div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {assignments.map((assignment, idx) => (
          <AssignedToDisplayCompact key={idx} assignedTo={assignment} showRole={true} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment, idx) => (
        <div key={idx} className="pb-3 border-b last:border-b-0 last:pb-0">
          <AssignedToDisplay assignedTo={assignment} showRole={true} />
        </div>
      ))}
    </div>
  )
}

/**
 * Helper to create AssignedTo object from courier/partner data
 */
export function createAssignedTo(
  name: string,
  serviceType: 'OBC' | 'NFO',
  role?: AssignedTo['role']
): AssignedTo {
  return {
    name,
    type: serviceType === 'OBC' ? 'OBC-Kurier' : 'NFO-Partner',
    role,
  }
}

/**
 * Get a summary string for assigned entity
 */
export function getAssignedToSummary(assignedTo?: AssignedTo): string {
  if (!assignedTo) return 'Unassigned'

  const { name, type, role } = assignedTo
  const roleText = role ? ` (${getRoleLabel(role)})` : ''

  return `${name} - ${type}${roleText}`
}

/**
 * Filter assignments by role
 */
export function filterAssignmentsByRole(
  assignments: AssignedTo[],
  role: AssignedTo['role']
): AssignedTo[] {
  return assignments.filter((a) => a.role === role)
}

/**
 * Check if OBC courier is assigned
 */
export function hasOBCCourier(assignedTo?: AssignedTo): boolean {
  return assignedTo?.type === 'OBC-Kurier'
}

/**
 * Check if NFO partner is assigned
 */
export function hasNFOPartner(assignedTo?: AssignedTo): boolean {
  return assignedTo?.type === 'NFO-Partner'
}
