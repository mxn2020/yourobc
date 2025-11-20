// src/features/system/supporting/documents/components/DocumentList.tsx

import { DocumentCard } from './DocumentCard';
import type { DocumentWithUser } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface DocumentListProps {
  documents: DocumentWithUser[];
  currentUserId?: Id<"userProfiles">;
  onView?: (documentId: Id<'documents'>) => void;
  onDownload?: (document: DocumentWithUser) => void;
  onDelete?: (documentId: Id<'documents'>) => void;
  onArchive?: (documentId: Id<'documents'>) => void;
  compact?: boolean;
  emptyMessage?: string;
}

export function DocumentList({
  documents,
  currentUserId,
  onView,
  onDownload,
  onDelete,
  onArchive,
  compact = false,
  emptyMessage = 'No documents found.',
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      {documents.map((document) => (
        <DocumentCard
          key={document._id}
          document={document}
          currentUserId={currentUserId}
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
          onArchive={onArchive}
          compact={compact}
        />
      ))}
    </div>
  );
}
