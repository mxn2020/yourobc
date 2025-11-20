// src/features/yourobc/supporting/wiki/pages/WikiPage.tsx

import { FC, useState, useMemo } from 'react'
import { Card, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Input, Loading } from '@/components/ui'
import { useWikiEntries, useWikiCategories } from '../hooks/useWiki'
import { WikiEntryCard } from '../components/WikiEntryCard'
import { WikiEntryForm } from '../components/WikiEntryForm'
import type { WikiEntryListItem, WikiEntryFormData } from '../types'
import { WIKI_TYPE_LABELS, WIKI_TYPE_ICONS } from '../types'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'

export const WikiPage: FC = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WikiEntryListItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['published'])
  const toast = useToast()

  const {
    entries,
    isLoading,
    error,
    createWikiEntry,
    updateWikiEntry,
    publishWikiEntry,
    canCreateWiki,
    refetch,
  } = useWikiEntries(undefined, {
    status: selectedStatus,
  })

  const { categories, isLoading: isCategoriesLoading } = useWikiCategories()

  const handleCreateEntry = async (data: WikiEntryFormData) => {
    try {
      await createWikiEntry(data)
      toast.success('Wiki entry created successfully')
      setShowCreateForm(false)
      refetch()
    } catch (error: any) {
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleUpdateEntry = async (data: WikiEntryFormData) => {
    if (!selectedEntry) return

    try {
      await updateWikiEntry(selectedEntry._id, data)
      toast.success('Wiki entry updated successfully')
      setSelectedEntry(null)
      setShowCreateForm(false)
      refetch()
    } catch (error: any) {
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handlePublish = async (entry: WikiEntryListItem) => {
    try {
      await publishWikiEntry(entry._id)
      toast.success('Wiki entry published successfully')
      refetch()
    } catch (error: any) {
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleEdit = (entry: WikiEntryListItem) => {
    setSelectedEntry(entry)
    setShowCreateForm(true)
  }

  const filteredEntries = useMemo(() => {
    let filtered = entries

    if (activeTab !== 'all') {
      filtered = filtered.filter((entry) => entry.category === activeTab)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((entry) => entry.type === selectedType)
    }

    if (searchTerm.length >= 2) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(term) ||
          entry.content.toLowerCase().includes(term) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(term))
      )
    }

    return filtered
  }, [entries, activeTab, selectedType, searchTerm])

  const stats = useMemo(() => {
    const total = entries.length
    const published = entries.filter((e) => e.status === 'published').length
    const draft = entries.filter((e) => e.status === 'draft').length
    const byType = entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, published, draft, byType }
  }, [entries])

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              📚 Wiki Knowledge Base
            </h1>
            <p className="text-gray-600 mt-1">
              Central repository for procedures, SOPs, and partner information
            </p>
          </div>

          {canCreateWiki && (
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              ➕ New Wiki Entry
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
          </Card>

          <Card className="p-4 bg-green-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.published}</div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
          </Card>

          <Card className="p-4 bg-orange-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </Card>
        </div>

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedEntry ? 'Edit Wiki Entry' : 'Create New Wiki Entry'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false)
                  setSelectedEntry(null)
                }}
              >
                ✕
              </Button>
            </div>
            <WikiEntryForm
              entry={selectedEntry || undefined}
              onSubmit={selectedEntry ? handleUpdateEntry : handleCreateEntry}
              onCancel={() => {
                setShowCreateForm(false)
                setSelectedEntry(null)
              }}
            />
          </Card>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <Input
                placeholder="Search wiki entries by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Types
                </button>
                {Object.entries(WIKI_TYPE_LABELS).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {WIKI_TYPE_ICONS[type as keyof typeof WIKI_TYPE_ICONS]} {label}{' '}
                    ({stats.byType[type] || 0})
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center gap-2 flex-wrap">
                {['published', 'draft', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedStatus.includes(status)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(selectedType !== 'all' || searchTerm.length >= 2) && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                <span className="text-xs text-gray-600">Active filters:</span>
                {selectedType !== 'all' && (
                  <Badge variant="secondary" size="sm">
                    Type: {WIKI_TYPE_LABELS[selectedType as keyof typeof WIKI_TYPE_LABELS]}
                    <button
                      onClick={() => setSelectedType('all')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {searchTerm.length >= 2 && (
                  <Badge variant="secondary" size="sm">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Category Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b overflow-x-auto">
              <TabsTrigger value="all">All Entries ({entries.length})</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6">
              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loading size="lg" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-12">
                    Error loading wiki entries
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <p className="text-3xl mb-4">📚</p>
                    <p className="text-lg font-medium mb-2">No wiki entries found</p>
                    <p className="text-sm">
                      {searchTerm.length >= 2
                        ? 'Try adjusting your search or filters'
                        : canCreateWiki
                        ? 'Create your first wiki entry to get started'
                        : 'Check back later for new entries'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Showing {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                    </div>
                    {filteredEntries.map((entry) => (
                      <WikiEntryCard
                        key={entry._id}
                        entry={entry}
                        onEdit={handleEdit}
                        onPublish={handlePublish}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
