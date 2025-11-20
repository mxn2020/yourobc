// src/features/audit-logs/pages/AuditLogDetailPage.tsx
import { JSX, useState } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import {
  ArrowLeft,
  Copy,
  Download,
  User,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Database
} from 'lucide-react';
import { Badge, Button, Card, CardContent, CardContent, CardHeader, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useMyAuditLogs } from '../hooks/useAuditLogs';
import type { AuditLogEntry, AuditSeverity } from '../types/audit-logs.types';
import { useToast } from '@/features/boilerplate/notifications';
import { parseConvexError } from '@/utils/errorHandling';

interface AuditLogDetailPageProps {
  logId: string;
}

// Type guard for AuditSeverity
function isAuditSeverity(value: unknown): value is AuditSeverity {
  return typeof value === 'string' && ['info', 'warning', 'error', 'critical'].includes(value);
}

// Extract severity from metadata safely
function getSeverityFromMetadata(metadata: AuditLogEntry['metadata']): AuditSeverity | null {
  if (!metadata) return null;
  if (typeof metadata === 'object' && 'severity' in metadata) {
    return isAuditSeverity(metadata.severity) ? metadata.severity : null;
  }
  return null;
}

export function AuditLogDetailPage({ logId }: AuditLogDetailPageProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const locale = (params as { locale?: string }).locale || 'en';
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch audit logs and find the specific log
  // Note: This is a simplified version. In production, you'd want a dedicated hook for fetching a single log
  const { logs, isLoading, error } = useMyAuditLogs();
  const log = logs?.find((l: AuditLogEntry) => l._id === logId);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`Copied ${fieldName} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error: any) {
      console.error('[CopyToClipboard] error:', error);
      const { message, code } = parseConvexError(error);
      toast.error(message);

      if (code === 'VALIDATION_FAILED') {
        console.warn('[CopyToClipboard] validation failed');
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[CopyToClipboard] permission denied');
      }
    }
  };

  const handleExportSingle = async () => {
    if (!log) return;

    try {
      const getMetadataValue = (key: string): unknown => {
        if (!log.metadata || typeof log.metadata !== 'object') return undefined;
        return (log.metadata as Record<string, unknown>)[key];
      };

      const exportData = {
        id: log._id,
        createdAt: log.createdAt,
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        entityTitle: log.entityTitle,
        description: log.description,
        metadata: log.metadata,
        ipAddress: getMetadataValue('ipAddress'),
        userAgent: getMetadataValue('userAgent'),
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `audit-log-${log._id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Audit log exported successfully');
    } catch (error: any) {
      console.error('[ExportLog] error:', error);
      const { message, code } = parseConvexError(error);
      toast.error(message);

      if (code === 'VALIDATION_FAILED') {
        console.warn('[ExportLog] validation failed');
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[ExportLog] permission denied');
      }
    }
  };

  const getSeverityColor = (severity: AuditSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: AuditSeverity): JSX.Element => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <Info className="h-4 w-4" />;
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading audit log details...</p>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error ? 'Error Loading Audit Log' : 'Audit Log Not Found'}
              </h2>
              <p className="text-gray-600 mb-6">
                {error ? 'Failed to load the audit log details.' : `Could not find audit log with ID: ${logId}`}
              </p>
              <Button
                onClick={() => navigate({ to: `/${locale}/admin/advanced-audit-logs` as any })}
                variant="primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract severity for display
  const severity = getSeverityFromMetadata(log.metadata);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              to={`/${locale}/admin/advanced-audit-logs` as any}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Audit Logs
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleExportSingle}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Log Details</h1>
              <p className="text-gray-600 mt-1">ID: {log._id}</p>
            </div>
            <div className="flex items-center space-x-2">
              {severity && (
                <Badge className={`${getSeverityColor(severity)} flex items-center space-x-1`}>
                  {getSeverityIcon(severity)}
                  <span>{severity}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent h-auto p-0 flex space-x-8">
              <TabsTrigger
                value="overview"
                className="pb-4 px-1 border-b-2 font-medium text-sm transition-colors rounded-none data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="pb-4 px-1 border-b-2 font-medium text-sm transition-colors rounded-none data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-transparent"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="metadata"
                className="pb-4 px-1 border-b-2 font-medium text-sm transition-colors rounded-none data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-transparent"
              >
                Metadata
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Action</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-semibold">{log.action}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{log.entityType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
                      <dd className="mt-1 flex items-center justify-between">
                        <span className="text-sm text-gray-900 font-mono">{log.entityId}</span>
                        <Button
                          onClick={() => copyToClipboard(log.entityId || '', 'Entity ID')}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* User Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="mt-1 flex items-center justify-between">
                        <span className="text-sm text-gray-900 font-mono">{log.userId || 'N/A'}</span>
                        {log.userId && (
                          <Button
                            onClick={() => copyToClipboard(log.userId || '', 'User ID')}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">
                        {(() => {
                          if (log.metadata && typeof log.metadata === 'object' && 'ipAddress' in log.metadata) {
                            const ipAddress = log.metadata.ipAddress;
                            return typeof ipAddress === 'string' ? ipAddress : String(ipAddress);
                          }
                          return 'N/A';
                        })()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                      <dd className="mt-1 text-sm text-gray-900 break-all">
                        {(() => {
                          if (log.metadata && typeof log.metadata === 'object' && 'userAgent' in log.metadata) {
                            const userAgent = log.metadata.userAgent;
                            return typeof userAgent === 'string' ? userAgent : String(userAgent);
                          }
                          return 'N/A';
                        })()}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Details Tab Content */}
          <TabsContent value="details" className="space-y-6 mt-0">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Action Details</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {log.description && (
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900">{log.description}</p>
                      </div>
                    </div>
                  )}
                  {log.entityTitle && (
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Entity Title</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900">{log.entityTitle}</p>
                      </div>
                    </div>
                  )}
                  {log.userName && (
                    <div className="pb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">User Name</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900">{log.userName}</p>
                      </div>
                    </div>
                  )}
                  {!log.description && !log.entityTitle && !log.userName && (
                    <p className="text-gray-500 text-center py-8">No additional details available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metadata Tab Content */}
          <TabsContent value="metadata" className="space-y-6 mt-0">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Additional Metadata
                </h3>
              </CardHeader>
              <CardContent>
                {log.metadata && Object.keys(log.metadata).length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-900 overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No metadata available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
