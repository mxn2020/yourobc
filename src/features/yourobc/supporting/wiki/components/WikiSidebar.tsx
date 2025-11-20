// src/features/yourobc/supporting/wiki/components/WikiSidebar.tsx

import { FC, useState, useEffect } from 'react'
import { Button, Badge, Input, Loading } from '@/components/ui'
import { useWikiEntries, useSearchWiki } from '../hooks/useWiki'
import { WikiEntryCard } from './WikiEntryCard'
import { WikiEntryForm } from './WikiEntryForm'
import { isWikiEnabled } from '../../config'
import type { WikiEntryListItem, WikiEntryFormData } from '../types'
import { WIKI_TYPE_LABELS, WIKI_TYPE_ICONS } from '../types'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'

interface WikiSidebarProps {
  category: string
  title?: string
  defaultOpen?: boolean
}

export const WikiSidebar: FC<WikiSidebarProps> = ({
  category,
  title,
  defaultOpen = false,
}) => {
  // Check if wiki feature is enabled
  if (!isWikiEnabled()) {
    return null
  }

  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WikiEntryListItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const toast = useToast()

  const {
    entries,
    isLoading,
    error,
    createWikiEntry,
    updateWikiEntry,
    publishWikiEntry,
    incrementViews,
    canCreateWiki,
    refetch,
  } = useWikiEntries(category, {
    status: ['published', 'draft'],
  })

  const { results: searchResults, isLoading: isSearching } = useSearchWiki(searchTerm)

  // Increment views when entry is viewed
  useEffect(() => {
    if (selectedEntry && selectedEntry.status === 'published') {
      incrementViews(selectedEntry._id)
    }
  }, [selectedEntry, incrementViews])

  const handleCreateEntry = async (data: WikiEntryFormData) => {
    try {
      await createWikiEntry({ ...data, category })
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

  const handleView = (entry: WikiEntryListItem) => {
    setSelectedEntry(entry)
    setShowCreateForm(false)
  }

  const handleEdit = (entry: WikiEntryListItem) => {
    setSelectedEntry(entry)
    setShowCreateForm(true)
  }

  const filteredEntries = searchTerm.length >= 2
    ? searchResults.filter((entry) => entry.category === category)
    : selectedType === 'all'
    ? entries
    : entries.filter((entry) => entry.type === selectedType)

  const typeGroups = entries.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-6 rounded-l-lg shadow-lg hover:bg-blue-700 transition-colors z-40 flex items-center gap-2"
        title="Open Wiki"
      >
        <span className="text-lg">📚</span>
        <span className="writing-mode-vertical text-sm font-medium">Wiki Helper</span>
      </button>
    )
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl z-50 flex flex-col border-l">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <div>
            <h3 className="font-semibold">{title || 'Wiki Helper'}</h3>
            <p className="text-xs text-blue-100">{category}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-blue-700"
        >
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showCreateForm ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                {selectedEntry ? 'Edit Entry' : 'Create Wiki Entry'}
              </h4>
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
          </div>
        ) : selectedEntry && !showCreateForm ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntry(null)}
              >
                ← Back
              </Button>
              {selectedEntry.canEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(selectedEntry)}
                >
                  ✏️ Edit
                </Button>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{WIKI_TYPE_ICONS[selectedEntry.type]}</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedEntry.title}</h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant="secondary" size="sm">
                  {WIKI_TYPE_LABELS[selectedEntry.type]}
                </Badge>
                <Badge variant="secondary" size="sm">
                  {selectedEntry.status}
                </Badge>
                <span className="text-xs text-gray-500">{selectedEntry.timeAgo}</span>
                {selectedEntry.viewCount !== undefined && selectedEntry.viewCount > 0 && (
                  <span className="text-xs text-gray-500">👁 {selectedEntry.viewCount} views</span>
                )}
              </div>

              {selectedEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedEntry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="prose max-w-none text-sm">
              <div
                className="whitespace-pre-wrap text-gray-700"
                dangerouslySetInnerHTML={{ __html: selectedEntry.content.replace(/\n/g, '<br />') }}
              />
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Search wiki entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    selectedType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({entries.length})
                </button>
                {Object.entries(typeGroups).map(([type, count]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {WIKI_TYPE_ICONS[type as keyof typeof WIKI_TYPE_ICONS]} {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            {canCreateWiki && (
              <Button
                variant="primary"
                className="w-full mb-4"
                onClick={() => setShowCreateForm(true)}
              >
                ➕ Create Wiki Entry
              </Button>
            )}

            {/* Entries List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loading size="md" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error loading wiki entries
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="mb-2">📚</p>
                <p className="text-sm">
                  {searchTerm.length >= 2
                    ? 'No entries found matching your search'
                    : 'No wiki entries yet'}
                </p>
                {canCreateWiki && searchTerm.length === 0 && (
                  <p className="text-xs mt-2">Create the first entry to get started</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <WikiEntryCard
                    key={entry._id}
                    entry={entry}
                    onView={handleView}
                    onEdit={handleEdit}
                    onPublish={handlePublish}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
