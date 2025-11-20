// src/features/system/supporting/documents/components/DocumentsSection.tsx

import { useState } from 'react';
import { useAuth } from '@/features/system/auth';
import {
  useEntityDocuments,
  useCreateDocument,
  useDeleteDocument,
  useArchiveDocument,
} from '../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Upload } from 'lucide-react';
import { DocumentUploadForm } from './DocumentUploadForm';
import { DocumentList } from './DocumentList';
import type { CreateDocumentData, Document, DocumentWithUser } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface DocumentsSectionProps {
  entityType: string;
  entityId: string;
  title?: string;
  includeConfidential?: boolean;
  className?: string;
}

export function DocumentsSection({
  entityType,
  entityId,
  title = 'Documents',
  includeConfidential = false,
  className,
}: DocumentsSectionProps) {
  const { user, profile } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);

  const documents = useEntityDocuments(entityType, entityId);
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const archiveDocument = useArchiveDocument();

  const handleUpload = async (data: CreateDocumentData, file: File) => {
    if (!user) return;

    // In a real implementation, you would:
    // 1. Upload the file to storage (e.g., Convex file storage, S3, etc.)
    // 2. Get the fileUrl from the upload
    // 3. Then create the document record

    // For now, we'll simulate this:
    // TODO: Implement actual file upload logic
    const fileUrl = URL.createObjectURL(file); // Temporary - replace with actual upload

    await createDocument({
      data: {
        ...data,
        fileUrl,
      },
    });

    setShowUploadForm(false);
  };

  const handleView = (documentId: Id<'documents'>) => {
    // TODO: Implement document viewer/preview
    console.log('View document:', documentId);
  };

  const handleDownload = (document: Document | DocumentWithUser) => {
    window.open(document.fileUrl, '_blank');
  };

  const handleDelete = async (documentId: Id<'documents'>) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this document?')) return;

    await deleteDocument({
      documentId,
    });
  };

  const handleArchive = async (documentId: Id<'documents'>) => {
    if (!user) return;

    await archiveDocument({
      documentId,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
            {documents && <Badge variant="secondary">{documents.length}</Badge>}
          </div>
          <Button
            size="sm"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Form */}
        {showUploadForm && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <DocumentUploadForm
              entityType={entityType}
              entityId={entityId}
              onSubmit={handleUpload}
              onCancel={() => setShowUploadForm(false)}
            />
          </div>
        )}

        {/* Documents List */}
        <DocumentList
          documents={documents || []}
          currentUserId={profile?._id}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onArchive={handleArchive}
          emptyMessage="No documents uploaded yet."
        />
      </CardContent>
    </Card>
  );
}
