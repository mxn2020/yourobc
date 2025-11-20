// src/features/ai-logging/components/LogTable/LogPagination.tsx
import { Button } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LogPaginationProps } from '../../types/log.types';

export function LogPagination({
  currentPage,
  totalPages,
  hasMore,
  isLoading,
  onPageChange,
  onLoadMore
}: LogPaginationProps) {
  const startItem = (currentPage - 1) * 50 + 1;
  const endItem = Math.min(currentPage * 50, totalPages * 50);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white">
      <div className="flex items-center text-sm text-gray-500">
        Showing {startItem} to {endItem} of results
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, currentPage - 2) + i;
            if (pageNum > totalPages) return null;
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}