// src/components/ui/List.tsx
import { forwardRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { VirtualList } from '@/features/system/supporting';
import type { TableColumn } from '@/types';

// List Item component
interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const ListItem = memo(forwardRef<HTMLDivElement, ListItemProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        'border-b transition-colors hover:bg-gray-100/50 p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
));
ListItem.displayName = 'ListItem';

// List Container component
interface ListContainerProps {
  children: ReactNode;
  className?: string;
}

export const ListContainer = memo(forwardRef<HTMLDivElement, ListContainerProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={twMerge('w-full border rounded-lg overflow-hidden', className)}
    >
      {children}
    </div>
  )
));
ListContainer.displayName = 'ListContainer';

// Generic Data List Component
interface DataListProps<T> {
  data: T[];
  renderItem: (record: T, index: number) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (record: T) => void;
  className?: string;
  itemClassName?: string;
  virtualize?: boolean;
  virtualHeight?: number | string;
  estimateSize?: number;
  overscan?: number;
}

export function DataList<T extends Record<string, any>>({
  data,
  renderItem,
  loading = false,
  emptyMessage = 'No data available',
  onItemClick,
  className,
  itemClassName,
  virtualize = false,
  virtualHeight = 600,
  estimateSize = 80,
  overscan = 5,
}: DataListProps<T>) {
  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const handleItemClick = (record: T) => {
    if (onItemClick) {
      onItemClick(record);
    }
  };

  // Virtualized list
  if (virtualize) {
    return (
      <VirtualList
        items={data}
        height={virtualHeight}
        estimateSize={estimateSize}
        overscan={overscan}
        className={className}
        renderItem={(record, index) => (
          <div
            onClick={() => handleItemClick(record)}
            className={twMerge(
              'border-b hover:bg-gray-100/50 dark:hover:bg-gray-800',
              onItemClick && 'cursor-pointer',
              itemClassName
            )}
          >
            {renderItem(record, index)}
          </div>
        )}
      />
    );
  }

  // Regular list
  return (
    <ListContainer className={className}>
      {data.map((record, index) => {
        const rowId = record.id as string;

        return (
          <ListItem
            key={rowId || index}
            onClick={() => handleItemClick(record)}
            className={twMerge(
              onItemClick && 'cursor-pointer',
              itemClassName
            )}
          >
            {renderItem(record, index)}
          </ListItem>
        );
      })}
    </ListContainer>
  );
}

// Compact List View Helper Component
interface CompactListViewProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (record: T) => void;
  className?: string;
  virtualize?: boolean;
  virtualHeight?: number | string;
}

export function CompactListView<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onItemClick,
  className,
  virtualize = false,
  virtualHeight = 600,
}: CompactListViewProps<T>) {
  return (
    <DataList
      data={data}
      loading={loading}
      emptyMessage={emptyMessage}
      onItemClick={onItemClick}
      className={className}
      virtualize={virtualize}
      virtualHeight={virtualHeight}
      renderItem={(record) => (
        <div className="p-4">
          <div className="space-y-2">
            {columns.map((column) => {
              const value = record[column.key];
              const content = column.render
                ? column.render(value, record)
                : value?.toString() || '';

              return (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[120px]">
                    {column.title}:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 flex-1 text-right">
                    {content}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    />
  );
}
