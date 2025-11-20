// features/system/projects/components/members/MemberCard.tsx

import { FC } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CompoundAvatar } from '@/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/DropdownMenu'
import {
  MoreVertical,
  Shield,
  ShieldCheck,
  Eye,
  Crown,
  UserCog,
  UserX,
  Mail,
  Briefcase,
  Calendar,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { Id } from '@/convex/_generated/dataModel'

export interface ProjectMember {
  _id: Id<'projectMembers'>
  userId: Id<'userProfiles'>
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'active' | 'inactive' | 'invited' | 'removed'
  joinedAt: number
  department?: string
  jobTitle?: string
  name?: string
  email?: string
  avatar?: string
  lastActiveAt?: number
}

interface MemberCardProps {
  member: ProjectMember
  currentUserId?: Id<'userProfiles'>
  canManageMembers?: boolean
  onChangeRole?: (memberId: Id<'projectMembers'>, newRole: 'admin' | 'member' | 'viewer') => void
  onRemove?: (memberId: Id<'projectMembers'>) => void
}

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    icon: Crown,
    variant: 'warning' as const,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    variant: 'secondary' as const,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  member: {
    label: 'Member',
    icon: Shield,
    variant: 'outline' as const,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    variant: 'outline' as const,
    color: 'text-gray-500 dark:text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
  },
}

const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'success' as const },
  inactive: { label: 'Inactive', variant: 'secondary' as const },
  invited: { label: 'Invited', variant: 'warning' as const },
  removed: { label: 'Removed', variant: 'destructive' as const },
}

export const MemberCard: FC<MemberCardProps> = ({
  member,
  currentUserId,
  canManageMembers = false,
  onChangeRole,
  onRemove,
}) => {
  const roleConfig = ROLE_CONFIG[member.role]
  const statusConfig = STATUS_CONFIG[member.status]
  const RoleIcon = roleConfig.icon

  const isCurrentUser = currentUserId === member.userId
  const canChangeRole = canManageMembers && !isCurrentUser && member.role !== 'owner'
  const canRemoveMember = canManageMembers && !isCurrentUser && member.role !== 'owner'

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getTimeSince = (timestamp?: number) => {
    if (!timestamp) return null

    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) return formatDate(timestamp)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <Card className={twMerge('p-4 hover:shadow-sm transition-shadow', roleConfig.bgColor)}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <CompoundAvatar
            src={member.avatar}
            alt={member.name || 'Member'}
            name={member.name || member.email || 'User'}
            size="lg"
          />
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          {/* Name & Role Row */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">
              {member.name || 'Unnamed User'}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">(You)</span>
              )}
            </h3>
            <RoleIcon className={twMerge('h-4 w-4 flex-shrink-0', roleConfig.color)} />
          </div>

          {/* Email */}
          {member.email && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{member.email}</span>
            </div>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {/* Role Badge */}
            <Badge variant={roleConfig.variant} className={roleConfig.color}>
              {roleConfig.label}
            </Badge>

            {/* Status Badge */}
            {member.status !== 'active' && (
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            )}

            {/* Job Title & Department */}
            {(member.jobTitle || member.department) && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span>
                  {member.jobTitle}
                  {member.jobTitle && member.department && ' · '}
                  {member.department}
                </span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Joined {formatDate(member.joinedAt)}</span>
            </div>
            {member.lastActiveAt && member.status === 'active' && (
              <div className="flex items-center gap-1">
                <span>Last active {getTimeSince(member.lastActiveAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        {(canChangeRole || canRemoveMember) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
              {canChangeRole && onChangeRole && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onChangeRole(member._id, 'admin')}
                    disabled={member.role === 'admin'}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onChangeRole(member._id, 'member')}
                    disabled={member.role === 'member'}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Make Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onChangeRole(member._id, 'viewer')}
                    disabled={member.role === 'viewer'}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Make Viewer
                  </DropdownMenuItem>
                </>
              )}
              {canRemoveMember && onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRemove(member._id)}
                    className="text-red-600"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Remove from Project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  )
}
