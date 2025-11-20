// src/features/boilerplate/admin/pages/PermissionRequestsPage.tsx

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/features/boilerplate/notifications'
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { Id } from '@/convex/_generated/dataModel'

type PermissionRequest = {
  _id: Id<"permissionRequests">
  userId: any
  userName: string
  userEmail?: string
  permission: string
  module: string
  message?: string
  status: 'pending' | 'approved' | 'denied'
  reviewedBy?: any
  reviewedByName?: string
  reviewedAt?: number
  reviewNotes?: string
  createdAt: number
  updatedAt?: number
}

export function PermissionRequestsPage() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'denied' | 'all'>('pending')
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'deny' | null>(null)

  // Queries
  const stats = useQuery(api.lib.boilerplate.permission_requests.queries.getPermissionRequestsStats)
  const allRequests = useQuery(api.lib.boilerplate.permission_requests.queries.getAllPermissionRequests, {
    status: activeTab === 'all' ? undefined : activeTab,
  })

  // Mutations
  const approveRequest = useMutation(api.lib.boilerplate.permission_requests.mutations.approvePermissionRequest)
  const denyRequest = useMutation(api.lib.boilerplate.permission_requests.mutations.denyPermissionRequest)

  const handleReview = async () => {
    if (!selectedRequest || !reviewAction) return

    try {
      if (reviewAction === 'approve') {
        await approveRequest({
          requestId: selectedRequest._id,
          reviewNotes: reviewNotes || undefined,
        })
        toast.success('Permission request approved')
      } else {
        await denyRequest({
          requestId: selectedRequest._id,
          reviewNotes: reviewNotes || undefined,
        })
        toast.success('Permission request denied')
      }

      setSelectedRequest(null)
      setReviewNotes('')
      setReviewAction(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process request')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
      case 'approved':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
      case 'denied':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Denied</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Permission Requests</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Review and manage user permission requests</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-yellow-700 dark:text-yellow-400">Pending</div>
            <div className="text-2xl font-bold mt-1 text-yellow-900 dark:text-yellow-200">{stats.pending}</div>
          </Card>
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400">Approved</div>
            <div className="text-2xl font-bold mt-1 text-green-900 dark:text-green-200">{stats.approved}</div>
          </Card>
          <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="text-sm text-red-700 dark:text-red-400">Denied</div>
            <div className="text-2xl font-bold mt-1 text-red-900 dark:text-red-200">{stats.denied}</div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {!allRequests || allRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No {activeTab === 'all' ? '' : activeTab} requests found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {allRequests.map((request) => (
                <Card key={request._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.module}</h3>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{request.userName}</span>
                          {request.userEmail && <span className="text-xs">({request.userEmail})</span>}
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}</span>
                        </div>

                        <div className="col-span-2">
                          <div className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Permission: </span>
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                              {request.permission}
                            </code>
                          </div>
                        </div>

                        {request.message && (
                          <div className="col-span-2">
                            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                              <MessageSquare className="w-4 h-4 mt-0.5" />
                              <div>
                                <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">User Message:</div>
                                <p className="text-sm italic">&ldquo;{request.message}&rdquo;</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {request.reviewedByName && (
                          <div className="col-span-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Reviewed by </span>
                              <span className="font-medium">{request.reviewedByName}</span>
                              {request.reviewedAt && (
                                <span className="text-gray-600 dark:text-gray-400">
                                  {' '}on {format(new Date(request.reviewedAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              )}
                            </div>
                            {request.reviewNotes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                                &ldquo;{request.reviewNotes}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedRequest(request)
                            setReviewAction('approve')
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request)
                            setReviewAction('deny')
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null)
        setReviewNotes('')
        setReviewAction(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Deny'} Permission Request
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? `Approve ${selectedRequest?.userName}'s request for ${selectedRequest?.permission}?`
                : `Deny ${selectedRequest?.userName}'s request for ${selectedRequest?.permission}?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="review-notes">Notes (Optional)</Label>
              <Textarea
                id="review-notes"
                placeholder="Add any notes about this decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null)
                setReviewNotes('')
                setReviewAction(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'primary' : 'destructive'}
              onClick={handleReview}
            >
              {reviewAction === 'approve' ? 'Approve Request' : 'Deny Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
