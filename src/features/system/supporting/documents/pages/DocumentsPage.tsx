// src/features/boilerplate/supporting/documents/pages/DocumentsPage.tsx

import { useState } from 'react';
import { useAuth } from '@/features/boilerplate/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FileText, Search, Filter, Upload } from 'lucide-react';
import {
  useEntityDocuments,
  useCreateDocument,
  useDeleteDocument,
  useArchiveDocument,
} from '../hooks';
import { DocumentUploadForm } from '../components/DocumentUploadForm';
import { DocumentList } from '../components/DocumentList';
import { DocumentsService } from '../services';
import type { Document, DocumentWithUser, CreateDocumentData } from '../types';
import type { Id } from '@/convex/_generated/dataModel';
import { formatFileSize } from '../../shared/constants';

interface DocumentsPageProps {
  entityType: string;
  entityId: string;
}

export function DocumentsPage({ entityType, entityId }: DocumentsPageProps) {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Document['documentType'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Document['status'] | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [includeConfidential, setIncludeConfidential] = useState(false);

  const documents = useEntityDocuments(entityType, entityId);
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const archiveDocument = useArchiveDocument();

  // Filter and search documents
  const filteredDocuments = documents?.filter((document) => {
    // Search filter
    if (searchQuery && !DocumentsService.searchDocuments([document], searchQuery).length) {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && document.documentType !== filterType) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'all' && document.status !== filterStatus) {
      return false;
    }

    return true;
  }) || [];

  const stats = documents ? DocumentsService.getDocumentStats(documents) : null;

  const handleUpload = async (data: CreateDocumentData, file: File) => {
    if (!user) return;

    // TODO: Implement actual file upload
    const fileUrl = URL.createObjectURL(file);

    await createDocument({
      data: {
        ...data,
        fileUrl,
      },
    });

    setShowUploadForm(false);
  };

  const handleView = (documentId: Id<'documents'>) => {
    console.log('View document:', documentId);
  };

  const handleDownload = (document: DocumentWithUser) => {
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Documents
          </h1>
          <p className="text-gray-600 mt-1">
            Manage documents for {entityType} #{entityId}
          </p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm
              entityType={entityType}
              entityId={entityId}
              onSubmit={handleUpload}
              onCancel={() => setShowUploadForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Documents</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
                <div className="text-xs text-gray-600">Total Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.confidential}</div>
                <div className="text-xs text-gray-600">Confidential</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.public}</div>
                <div className="text-xs text-gray-600">Public</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byStatus.ready || 0}</div>
                <div className="text-xs text-gray-600">Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filterType !== 'all' || filterStatus !== 'all') && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium block mb-2">Document Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="all">All Types</option>
                    <option value="contract">Contract</option>
                    <option value="invoice">Invoice</option>
                    <option value="specification">Specification</option>
                    <option value="report">Report</option>
                    <option value="image">Image</option>
                    <option value="presentation">Presentation</option>
                    <option value="spreadsheet">Spreadsheet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="ready">Ready</option>
                    <option value="processing">Processing</option>
                    <option value="archived">Archived</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Visibility</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeConfidential}
                      onChange={(e) => setIncludeConfidential(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Include Confidential</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Documents</span>
            <Badge variant="secondary">
              {filteredDocuments.length}
              {filteredDocuments.length !== documents?.length && ` of ${documents?.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentList
            documents={filteredDocuments}
            currentUserId={profile?._id}
            onView={handleView}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onArchive={handleArchive}
            emptyMessage={
              searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'No documents match your filters'
                : 'No documents uploaded yet.'
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
