import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'

// Role types based on project team members
export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'

interface ProjectRoleBadgeProps {
  role: ProjectRole | null
  isOwner: boolean
  className?: string
}

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    variant: 'primary' as const,
    description: 'Full control over the project, including deletion and team management',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  admin: {
    label: 'Admin',
    variant: 'secondary' as const,
    description: 'Can edit project, manage team, and update settings',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  member: {
    label: 'Member',
    variant: 'info' as const,
    description: 'Can edit project content, tasks, and milestones',
    color: 'bg-green-500 hover:bg-green-600',
  },
  viewer: {
    label: 'Viewer',
    variant: 'outline' as const,
    description: 'Read-only access to project',
    color: 'bg-gray-500 hover:bg-gray-600',
  },
} as const

export function ProjectRoleBadge({
  role,
  isOwner,
  className,
}: ProjectRoleBadgeProps) {
  // Determine the effective role
  const effectiveRole = isOwner ? 'owner' : role

  if (!effectiveRole) return null

  const config = ROLE_CONFIG[effectiveRole]

  return (
    <Tooltip content={config.description}>
      <Badge variant={config.variant} className={className}>
        {config.label}
      </Badge>
    </Tooltip>
  )
}
