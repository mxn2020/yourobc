// src/features/marketing/newsletters/pages/NewslettersPage.tsx

import { FC, useState } from 'react'
import { Button, Input, EmptyState, Card, Badge } from '@/components/ui'
import { Plus, Search, Mail } from 'lucide-react'
import { useNewsletters, useNewsletterStats } from '../hooks/useNewsletters'
import type { Newsletter } from '../types'

export const NewslettersPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: newslettersData } = useNewsletters({ limit: 100 })
  const { data: stats } = useNewsletterStats()

  const filteredNewsletters = newslettersData?.items?.filter((newsletter: Newsletter) =>
    newsletter.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Mail className="h-8 w-8 text-pink-600" />
              Newsletter Platform
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage email newsletters with detailed analytics
            </p>
          </div>
          <Button onClick={() => console.log('Create newsletter')} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Newsletter
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600">Total Newsletters</p>
            <p className="text-2xl font-bold">{stats.totalNewsletters || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold">{stats.activeNewsletters || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Total Subscribers</p>
            <p className="text-2xl font-bold">{stats.totalSubscribers || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Avg. Open Rate</p>
            <p className="text-2xl font-bold">{stats.avgOpenRate?.toFixed(1) || 0}%</p>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search newsletters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredNewsletters && filteredNewsletters.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNewsletters.map((newsletter: Newsletter) => (
            <Card key={newsletter._id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{newsletter.title}</h3>
                <Badge variant={newsletter.isActive ? 'success' : 'secondary'}>
                  {newsletter.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {newsletter.description && (
                <p className="text-sm text-gray-600 mb-3">{newsletter.description}</p>
              )}
              <div className="text-sm text-gray-500">
                <p>From: {newsletter.fromName} ({newsletter.fromEmail})</p>
                {newsletter.totalSubscribers !== undefined && (
                  <p className="mt-1">Subscribers: {newsletter.totalSubscribers}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Mail}
          title="No newsletters found"
          description={searchTerm ? 'Try adjusting your search' : 'Create your first newsletter to get started'}
          action={!searchTerm ? <Button onClick={() => console.log('Create')}><Plus className="h-5 w-5 mr-2" />Create Newsletter</Button> : undefined}
        />
      )}
    </div>
  )
}
