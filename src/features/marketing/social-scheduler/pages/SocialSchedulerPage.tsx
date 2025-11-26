// src/features/marketing/social-scheduler/pages/SocialSchedulerPage.tsx

import { FC, useState } from 'react'
import { Button, Input, EmptyState, Card, Badge } from '@/components/ui'
import { Plus, Search, Calendar } from 'lucide-react'
import { usePosts, usePostStats } from '../hooks/usePosts'
import type { SocialPost } from '../types'

export const SocialSchedulerPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: postsData } = usePosts({ limit: 100 })
  const { data: stats } = usePostStats()

  const filteredPosts = postsData?.posts?.filter((post: SocialPost) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="h-8 w-8 text-indigo-600" />
              Social Media Scheduler
            </h1>
            <p className="text-gray-600 mt-2">
              Schedule and manage social media posts across platforms
            </p>
          </div>
          <Button onClick={() => console.log('Create post')} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600">Total Posts</p>
            <p className="text-2xl font-bold">{stats.totalPosts || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Scheduled</p>
            <p className="text-2xl font-bold">{stats.scheduledPosts || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold">{stats.publishedPosts || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Platforms</p>
            <p className="text-2xl font-bold">{Object.keys(stats.byPlatform || {}).length}</p>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPosts && filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post: SocialPost) => (
            <Card key={post._id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <Badge>{post.status}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{post.content.substring(0, 150)}...</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="capitalize">{post.platform}</span>
                {post.scheduledAt && (
                  <span>• {new Date(post.scheduledAt).toLocaleDateString()}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No posts found"
          description={searchTerm ? 'Try adjusting your search' : 'Schedule your first social media post'}
          action={
            !searchTerm
              ? {
                  label: 'Create Post',
                  onClick: () => console.log('Create'),
                  icon: Plus,
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
