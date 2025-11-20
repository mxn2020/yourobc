// Core query key factory for all feature packages
export const createQueryKeys = <T extends string>(feature: T) => ({
  all: [feature] as const,
  lists: () => [feature, 'list'] as const,
  list: (filters?: any) => [feature, 'list', filters] as const,
  details: () => [feature, 'detail'] as const,
  detail: (id: string) => [feature, 'detail', id] as const,
  infinite: (filters?: any) => [feature, 'infinite', filters] as const,
  search: (query: string) => [feature, 'search', query] as const,
  stats: (filters?: any) => [feature, 'stats', filters] as const,
})

// Feature-specific query keys
export const queryKeys = {
  projects: createQueryKeys('projects'),
  notifications: createQueryKeys('notifications'),
  dashboard: createQueryKeys('dashboard'),
  settings: createQueryKeys('settings'),
  audit: createQueryKeys('audit'),
  reporting: createQueryKeys('reporting'),
  exports: createQueryKeys('exports'),
  backup: createQueryKeys('backup'),
  comments: createQueryKeys('comments'),
  activityFeed: createQueryKeys('activityFeed'),
  messaging: createQueryKeys('messaging'),
  webhooks: createQueryKeys('webhooks'),
  workflows: {
    ...createQueryKeys('workflows'),
    executions: createQueryKeys('workflows-executions'),
    templates: createQueryKeys('workflows-templates'),
    statistics: createQueryKeys('workflows-statistics'),
  },
  templates: createQueryKeys('templates'),
  tags: createQueryKeys('tags'),
  favorites: createQueryKeys('favorites'),
}

export type QueryKeys = typeof queryKeys