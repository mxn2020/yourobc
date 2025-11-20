// src/components/ui/Table.tsx
import { forwardRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';

// Root Table component
interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table = memo(forwardRef<HTMLTableElement, TableProps>(
  ({ children, className }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={twMerge(
          'w-full caption-bottom text-sm',
          className
        )}
      >
        {children}
      </table>
    </div>
  )
));
Table.displayName = 'Table';

// TableHeader component
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export const TableHeader = memo(forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className }, ref) => (
    <thead ref={ref} className={twMerge('[&_tr]:border-b', className)}>
      {children}
    </thead>
  )
));
TableHeader.displayName = 'TableHeader';

// TableBody component
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export const TableBody = memo(forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className }, ref) => (
    <tbody
      ref={ref}
      className={twMerge('[&_tr:last-child]:border-0', className)}
    >
      {children}
    </tbody>
  )
));
TableBody.displayName = 'TableBody';

// TableFooter component
interface TableFooterProps {
  children: ReactNode;
  className?: string;
}

export const TableFooter = memo(forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, className }, ref) => (
    <tfoot
      ref={ref}
      className={twMerge(
        'border-t bg-gray-100/50 font-medium [&>tr]:last:border-b-0',
        className
      )}
    >
      {children}
    </tfoot>
  )
));
TableFooter.displayName = 'TableFooter';

// TableRow component
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
}

export const TableRow = memo(forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className, ...props }, ref) => (
    <tr
      ref={ref}
      className={twMerge(
        'border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
));
TableRow.displayName = 'TableRow';

// TableHead component
interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export const TableHead = memo(forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className }, ref) => (
    <th
      ref={ref}
      className={twMerge(
        'h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0',
        className
      )}
    >
      {children}
    </th>
  )
));
TableHead.displayName = 'TableHead';

// TableCell component
interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}

export const TableCell = memo(forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className, colSpan, rowSpan }, ref) => (
    <td
      ref={ref}
      className={twMerge(
        'p-4 align-middle [&:has([role=checkbox])]:pr-0',
        className
      )}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  )
));
TableCell.displayName = 'TableCell';

// TableCaption component
interface TableCaptionProps {
  children: ReactNode;
  className?: string;
}

export const TableCaption = memo(forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ children, className }, ref) => (
    <caption
      ref={ref}
      className={twMerge('mt-4 text-sm text-gray-500', className)}
    >
      {children}
    </caption>
  )
));
TableCaption.displayName = 'TableCaption';

// Generic Data Table Component
import type { TableProps as DataTablePropsType, TableColumn } from '@/types';

interface DataTableProps<T> extends DataTablePropsType<T> {
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  variant = 'default',
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  className
}: DataTableProps<T>) {
  const hasSelection = onSelectionChange !== undefined;

  const handleRowClick = (record: T) => {
    if (onRowClick) {
      onRowClick(record);
    }
  };

  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectedRows.length === data.length) {
        onSelectionChange([]);
      } else {
        onSelectionChange(data.map(item => item.id as string));
      }
    }
  };

  const handleSelectRow = (id: string) => {
    if (onSelectionChange) {
      if (selectedRows.includes(id)) {
        onSelectionChange(selectedRows.filter(rowId => rowId !== id));
      } else {
        onSelectionChange([...selectedRows, id]);
      }
    }
  };

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

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {hasSelection && (
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedRows.length === data.length && data.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            </TableHead>
          )}
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={twMerge(
                column.width ? `w-[${column.width}]` : '',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )}
            >
              {column.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record, rowIndex) => {
          const rowId = record.id as string;
          const isSelected = selectedRows.includes(rowId);

          return (
            <TableRow
              key={rowId || rowIndex}
              onClick={() => handleRowClick(record)}
              className={twMerge(
                variant === 'striped' && rowIndex % 2 === 0 && 'bg-gray-50',
                onRowClick && 'cursor-pointer',
                isSelected && 'bg-blue-50'
              )}
            >
              {hasSelection && (
                <TableCell>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectRow(rowId);
                    }}
                    className="rounded border-gray-300"
                  />
                </TableCell>
              )}
              {columns.map((column) => {
                const value = record[column.key];
                const content = column.render
                  ? column.render(value, record)
                  : value?.toString() || '';

                return (
                  <TableCell
                    key={`${rowId || rowIndex}-${column.key}`}
                    className={twMerge(
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {content}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}