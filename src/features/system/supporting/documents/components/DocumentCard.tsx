// src/features/boilerplate/supporting/documents/components/DocumentCard.tsx

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Eye, Trash2, Archive, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatFileSize } from '../../shared/constants';
import { DocumentsService } from '../services';
import type { Document } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface DocumentCardProps {
  document: Document;
  currentUserId?: Id<"userProfiles">;
  onView?: (documentId: Id<'documents'>) => void;
  onDownload?: (document: Document) => void;
  onDelete?: (documentId: Id<'documents'>) => void;
  onArchive?: (documentId: Id<'documents'>) => void;
  compact?: boolean;
}

export function DocumentCard({
  document,
  currentUserId,
  onView,
  onDownload,
  onDelete,
  onArchive,
  compact = false,
}: DocumentCardProps) {
  const isOwner = currentUserId === document.uploadedBy;
  const canPreview = DocumentsService.canPreview(document.mimeType);
  const icon = DocumentsService.getDocumentTypeIcon(document.documentType);
  const typeLabel = DocumentsService.getDocumentTypeLabel(document.documentType);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    } else {
      // Default download behavior
      window.open(document.fileUrl, '_blank');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {document.title || document.originalFilename}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(document.fileSize)} • {typeLabel}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canPreview && onView && (
            <Button variant="ghost" size="sm" onClick={() => onView(document._id)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">
                {document.title || document.originalFilename}
              </h3>
              {document.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {document.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {typeLabel}
            </Badge>

            {document.isConfidential && (
              <Badge variant="destructive" className="text-xs">
                Confidential
              </Badge>
            )}

            {document.isPublic && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}

            {document.status === 'archived' && (
              <Badge variant="outline" className="text-xs">
                Archived
              </Badge>
            )}

          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>•</span>
            <span>Uploaded by {document.uploadedBy}</span>
            <span>•</span>
            <span>{formatDistanceToNow(document.createdAt, { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {canPreview && onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(document._id)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>

            {isOwner && document.status !== 'archived' && onArchive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onArchive(document._id)}
              >
                <Archive className="h-3 w-3 mr-1" />
                Archive
              </Button>
            )}

            {isOwner && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(document._id)}
                className="text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
