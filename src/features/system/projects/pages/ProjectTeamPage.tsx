// features/boilerplate/projects/pages/ProjectTeamPage.tsx
import { FC, useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { Card, Loading, Badge, Button } from '@/components/ui'
import { Users, Briefcase, Calendar, ArrowRight } from 'lucide-react'
import { useUserMemberships } from '../hooks/useTeam'
import { useCurrentUser } from '@/features/boilerplate/auth'
import { getCurrentLocale } from "@/features/boilerplate/i18n/utils/path";

export const ProjectTeamPage: FC = () => {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const locale = getCurrentLocale();
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')

  // Get current user
  const { profile: currentUser } = useCurrentUser()

  // Fetch user's project memberships using the real hook
  const { data, isLoading } = useUserMemberships(currentUser?._id)

  // Extract memberships from the data
  const memberships = data?.memberships || []

  // Filter memberships based on search and role
  const filteredMemberships = useMemo(() => {
    return memberships.filter((item) => {
      const { project, membership } = item

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          project?.title?.toLowerCase().includes(searchLower) ||
          membership.department?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      // Role filter
      if (roleFilter && membership.role !== roleFilter) return false

      return true
    })
  }, [memberships, searchTerm, roleFilter])

  const handleClearFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
  }

  const hasActiveFilters = Boolean(searchTerm || roleFilter)

  // Calculate stats
  const stats = {
    total: memberships.length,
    owner: memberships.filter((m) => m.membership.role === 'owner').length,
    admin: memberships.filter((m) => m.membership.role === 'admin').length,
    member: memberships.filter((m) => m.membership.role === 'member').length,
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'purple'
      case 'admin':
        return 'blue'
      case 'member':
        return 'green'
      case 'viewer':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const getStatusBadge = (project: any) => {
    if (!project) return null

    switch (project.status) {
      case 'active':
        return <Badge color="green" size="sm">Active</Badge>
      case 'completed':
        return <Badge color="blue" size="sm">Completed</Badge>
      case 'on_hold':
        return <Badge color="orange" size="sm">On Hold</Badge>
      case 'archived':
        return <Badge color="gray" size="sm">Archived</Badge>
      default:
        return null
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Project Teams</h1>
                <p className="text-gray-600">Projects you're a member of and your roles</p>
              </div>
            </div>
          </div>
          <Link
            to="/{-$locale}/projects"
            params={{ locale }}
          >
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Projects</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-purple-600 mb-1">As Owner</div>
            <div className="text-2xl font-bold text-purple-600">{stats.owner}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-blue-600 mb-1">As Admin</div>
            <div className="text-2xl font-bold text-blue-600">{stats.admin}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-green-600 mb-1">As Member</div>
            <div className="text-2xl font-bold text-green-600">{stats.member}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredMemberships.length} {hasActiveFilters ? `of ${stats.total}` : ''} projects
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">for "{searchTerm}"</span>
            )}
          </div>
        </div>

        {/* Project Memberships List */}
        {filteredMemberships.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {hasActiveFilters ? 'No projects found matching your criteria' : 'No project memberships yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'Join a project to get started!'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMemberships.map((item) => {
              const { project, membership } = item
              if (!project) return null

              return (
                <Card
                  key={membership._id}
                  className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate({ to: `/${locale}/projects/${project._id}` })}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {project.title}
                            </h3>
                            {getStatusBadge(project)}
                          </div>
                          {project.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                      </div>
                      <div className="flex items-center gap-3 flex-wrap mt-3">
                        <Badge color={getRoleColor(membership.role)}>
                          {membership.role}
                        </Badge>
                        {membership.department && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {membership.department}
                          </span>
                        )}
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {formatDate(membership.joinedAt)}
                        </span>
                        {project.progress && (
                          <span className="text-sm text-gray-500">
                            Progress: {project.progress.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}