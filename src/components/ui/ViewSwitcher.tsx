// src/components/ui/ViewSwitcher.tsx
import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

export type ViewMode = 'grid' | 'table' | 'list';

interface ViewSwitcherProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableViews?: ViewMode[];
  className?: string;
}

export const ViewSwitcher = memo(({
  view,
  onViewChange,
  availableViews = ['grid', 'table', 'list'],
  className
}: ViewSwitcherProps) => {
  return (
    <div className={twMerge('flex items-center gap-1 border rounded-lg p-1', className)}>
      {availableViews.includes('grid') && (
        <button
          onClick={() => onViewChange('grid')}
          className={twMerge(
            'p-2 rounded transition-colors',
            view === 'grid'
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title="Grid view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      )}

      {availableViews.includes('table') && (
        <button
          onClick={() => onViewChange('table')}
          className={twMerge(
            'p-2 rounded transition-colors',
            view === 'table'
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title="Table view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      {availableViews.includes('list') && (
        <button
          onClick={() => onViewChange('list')}
          className={twMerge(
            'p-2 rounded transition-colors',
            view === 'list'
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title="List view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
});

ViewSwitcher.displayName = 'ViewSwitcher';
