// features/boilerplate/projects/components/ProjectDetailsSkeleton.tsx

import { FC } from 'react'
import { Card } from '@/components/ui/Card'

export const ProjectDetailsSkeleton: FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export const TaskCardSkeleton: FC = () => {
  return (
    <div className="animate-pulse border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 rounded" />
        <div className="h-6 w-16 bg-gray-200 rounded" />
        <div className="h-6 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export const MilestoneCardSkeleton: FC = () => {
  return (
    <div className="animate-pulse border-l-4 border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3 flex-1">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
        <div className="h-6 w-24 bg-gray-200 rounded" />
      </div>
      <div className="mb-3">
        <div className="h-2 bg-gray-200 rounded w-full" />
      </div>
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    </div>
  )
}

export const MemberCardSkeleton: FC = () => {
  return (
    <div className="animate-pulse border rounded-lg p-4">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
