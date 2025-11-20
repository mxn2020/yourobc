// src/features/yourobc/supporting/inquiry-sources/pages/InquirySourcesPage.tsx

import { useState, useMemo } from 'react'
import { useAuth } from '@/features/system/auth'
import { useInquirySources } from '../hooks/useInquirySources'
import { InquirySourceForm } from '../components/InquirySourceForm'
import { InquirySourceList } from '../components/InquirySourceList'
import { Card, Badge, Button } from '@/components/ui'
import { Filter, Plus, TrendingUp } from 'lucide-react'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import type { InquirySourceFormData, InquirySourceId } from '../types'
import { INQUIRY_SOURCE_TYPE_LABELS, INQUIRY_SOURCE_TYPES, INQUIRY_SOURCE_TYPE_ICONS } from '../types'

export function InquirySourcesPage() {
  const { auth, user } = useAuth()
  const toast = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [showInactive, setShowInactive] = useState(false)

  // Determine if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Fetch inquiry sources with filters
  const filters = useMemo(() => {
    return {
      type: selectedTypes.length > 0 ? selectedTypes as any[] : undefined,
      isActive: showInactive ? undefined : true,
    }
  }, [selectedTypes, showInactive])

  const {
    sources,
    activeSources,
    inactiveSources,
    sourcesByType,
    isLoading,
    error,
    createInquirySource,
    updateInquirySource,
    canManageInquirySources,
    isCreating,
    isUpdating,
  } = useInquirySources(filters)

  // Mutation handlers with toast notifications
  const handleCreateInquirySource = async (data: InquirySourceFormData) => {
    try {
      await createInquirySource(data)
      toast.success('Inquiry source created successfully')
      setShowCreateForm(false)
    } catch (error: any) {
      console.error('Create inquiry source error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
      throw error
    }
  }

  const handleUpdateInquirySource = async (
    sourceId: InquirySourceId,
    data: Partial<InquirySourceFormData> & { isActive?: boolean }
  ) => {
    try {
      await updateInquirySource(sourceId, data)
      toast.success('Inquiry source updated successfully')
    } catch (error: any) {
      console.error('Update inquiry source error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
      throw error
    }
  }

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = sources.length
    const active = activeSources.length
    const inactive = inactiveSources.length
    const byType = Object.entries(sourcesByType).reduce((acc, [type, items]) => {
      acc[type] = items.length
      return acc
    }, {} as Record<string, number>)

    return { total, active, inactive, byType }
  }, [sources, activeSources, inactiveSources, sourcesByType])

  if (!auth?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Please log in to view inquiry sources</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              Inquiry Sources
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage customer inquiry sources
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {canManageInquirySources && (
              <Button
                variant="primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showCreateForm ? 'Cancel' : 'New Source'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Sources</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-400">{stats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(sourcesByType).length}
            </div>
            <div className="text-sm text-gray-600">Source Types</div>
          </Card>
        </div>

        {/* Create Form */}
        {showCreateForm && canManageInquirySources && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Inquiry Source</h3>
            <InquirySourceForm
              onSubmit={handleCreateInquirySource}
              onCancel={() => setShowCreateForm(false)}
              submitLabel="Create Source"
            />
          </Card>
        )}

        {/* Filters */}
        {showFilters && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Sources</h3>

            <div className="space-y-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_SOURCE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleTypeFilter(type)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedTypes.includes(type)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {INQUIRY_SOURCE_TYPE_ICONS[type]} {INQUIRY_SOURCE_TYPE_LABELS[type]}
                      {stats.byType[type] && (
                        <Badge variant="secondary" className="ml-2">
                          {stats.byType[type]}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show inactive sources</span>
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* Active Filters Display */}
        {(selectedTypes.length > 0 || showInactive) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedTypes.map((type) => (
              <Badge key={type} variant="primary">
                {INQUIRY_SOURCE_TYPE_LABELS[type as keyof typeof INQUIRY_SOURCE_TYPE_LABELS]}
                <button
                  onClick={() => toggleTypeFilter(type)}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </Badge>
            ))}
            {showInactive && (
              <Badge variant="secondary">
                Including inactive
                <button
                  onClick={() => setShowInactive(false)}
                  className="ml-2 hover:text-gray-900"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Sources List */}
        <div>
          <InquirySourceList
            sources={sources}
            isLoading={isLoading}
            error={error}
            onUpdate={handleUpdateInquirySource}
            canEdit={canManageInquirySources}
            emptyMessage={
              selectedTypes.length > 0 || showInactive
                ? 'No sources match the selected filters'
                : 'No inquiry sources yet. Create one to get started!'
            }
          />
        </div>
      </div>
    </div>
  )
}
