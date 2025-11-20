// src/features/projects/components/ProjectsFilters.tsx

import { FC } from 'react'
import { Card, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/ui'
import { useTranslation } from '@/features/boilerplate/i18n'

interface ProjectsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  priorityFilter: string
  onPriorityChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  onClearFilters: () => void
  showClearButton: boolean
  categories: string[]
}

export const ProjectsFilters: FC<ProjectsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  onClearFilters,
  showClearButton,
  categories,
}) => {
  const { t } = useTranslation('projects')
  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('filters.searchPlaceholder')}
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('filters.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('filters.allStatuses')}</SelectItem>
              <SelectItem value="active">{t('status.active')}</SelectItem>
              <SelectItem value="completed">{t('status.completed')}</SelectItem>
              <SelectItem value="on_hold">{t('status.onHold')}</SelectItem>
              <SelectItem value="archived">{t('status.archived')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('filters.allPriorities')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('filters.allPriorities')}</SelectItem>
              <SelectItem value="low">{t('priority.low')}</SelectItem>
              <SelectItem value="medium">{t('priority.medium')}</SelectItem>
              <SelectItem value="high">{t('priority.high')}</SelectItem>
              <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
            </SelectContent>
          </Select>

          {categories.length > 0 ? (
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('filters.allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center justify-center text-sm text-gray-400">
              {t('stats.noCategoriesYet')}
            </div>
          )}
        </div>

        {showClearButton && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={onClearFilters}>
              {t('filters.clearFilters')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
