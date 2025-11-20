// src/features/yourobc/employees/components/VacationList.tsx

import { FC, useState } from 'react'
import {
  Card,
  Badge,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Loading,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Modal,
  Textarea,
} from '@/components/ui'
import { VACATION_TYPE_LABELS, VACATION_STATUS_LABELS } from '../types'
import type { VacationEntry, VacationDayId } from '../types'

interface VacationListProps {
  vacations: (VacationEntry & {
    approver?: {
      _id: string
      employeeNumber: string
      name?: string
    } | null
  })[]
  isLoading?: boolean
  onApprove?: (vacationDayId: VacationDayId, entryIndex: number, approved: boolean, reason?: string) => void
  showEmployee?: boolean
  showActions?: boolean
  compact?: boolean
  canApprove?: boolean
}

interface VacationWithIndex extends VacationEntry {
  entryIndex: number
  vacationDayId?: VacationDayId
  employee?: {
    _id: string
    employeeNumber: string
    name: string
  }
  approver?: {
    _id: string
    employeeNumber: string
    name?: string
  } | null
}

export const VacationList: FC<VacationListProps> = ({
  vacations,
  isLoading = false,
  onApprove,
  showEmployee = false,
  showActions = true,
  compact = false,
  canApprove = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [selectedVacation, setSelectedVacation] = useState<VacationWithIndex | null>(null)
  const [approvalReason, setApprovalReason] = useState('')
  const [isApproving, setIsApproving] = useState(false)
  const [approvalAction, setApprovalAction] = useState<boolean>(true) // true = approve, false = reject

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatDateRange = (start: number, end: number) => {
    const startDate = new Date(start).toLocaleDateString()
    const endDate = new Date(end).toLocaleDateString()
    return `${startDate} - ${endDate}`
  }

  const getStatusVariant = (status: 'pending' | 'approved' | 'rejected' | 'cancelled') => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'danger'
      case 'cancelled': return 'secondary'
      case 'pending': return 'warning'
      default: return 'warning'
    }
  }

  const getStatusLabel = (status: 'pending' | 'approved' | 'rejected' | 'cancelled') => {
    switch (status) {
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      case 'cancelled': return 'Cancelled'
      case 'pending': return 'Pending'
      default: return 'Pending'
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'annual': return 'primary'
      case 'sick': return 'warning'
      case 'personal': return 'secondary'
      case 'maternity': 
      case 'paternity': return 'success'
      default: return 'secondary'
    }
  }

  const isUpcoming = (startDate: number) => {
    return startDate > Date.now()
  }

  const isCurrent = (startDate: number, endDate: number) => {
    const now = Date.now()
    return startDate <= now && endDate >= now
  }

  const filteredVacations = statusFilter
    ? vacations.filter((vacation) => {
        const status = getStatusLabel(vacation.status)
        return status.toLowerCase() === statusFilter
      })
    : vacations

  const handleApprovalClick = (vacation: VacationWithIndex, approved: boolean) => {
    setSelectedVacation(vacation)
    setApprovalAction(approved)
    setApprovalReason('')
    setApprovalModalOpen(true)
  }

  const handleApprovalSubmit = async () => {
    if (!selectedVacation || !onApprove) return

    setIsApproving(true)
    try {
      await onApprove(
        selectedVacation.vacationDayId!,
        selectedVacation.entryIndex,
        approvalAction,
        approvalReason || undefined
      )
      setApprovalModalOpen(false)
      setSelectedVacation(null)
      setApprovalReason('')
    } catch (error) {
      console.error('Approval error:', error)
    } finally {
      setIsApproving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  if (vacations.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 p-6">
          <div className="text-gray-500 text-lg mb-2">No vacation requests found</div>
          <p className="text-gray-400">Vacation requests will appear here once submitted.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>

        {statusFilter && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('')}>
            Clear Filter
          </Button>
        )}

        <div className="ml-auto text-sm text-gray-600">
          {filteredVacations.length} request{filteredVacations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Vacation Requests Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {showEmployee && <TableHead>Employee</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              {!compact && <TableHead>Approved By</TableHead>}
              {!compact && <TableHead>Submitted</TableHead>}
              {showActions && canApprove && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVacations.map((vacation, index) => {
              const status = getStatusLabel(vacation.status)
              const isPending = status === 'Pending'
              const upcoming = isUpcoming(vacation.startDate)
              const current = isCurrent(vacation.startDate, vacation.endDate)

              return (
                <TableRow key={index}>
                  {showEmployee && (
                    <TableCell>
                      {(vacation as any).employee ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {(vacation as any).employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(vacation as any).employee.employeeNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unknown</span>
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    <Badge variant={getTypeVariant(vacation.type)} size="sm">
                      {VACATION_TYPE_LABELS[vacation.type]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      {formatDateRange(vacation.startDate, vacation.endDate)}
                    </div>
                    {current && (
                      <Badge variant="success" size="sm" className="mt-1">
                        🏖️ Current
                      </Badge>
                    )}
                    {upcoming && !current && (
                      <Badge variant="secondary" size="sm" className="mt-1">
                        📅 Upcoming
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-sm font-medium">
                    {vacation.days} day{vacation.days !== 1 ? 's' : ''}
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(vacation.status)} size="sm">
                      {status}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-xs">
                    {vacation.reason ? (
                      <div className="text-sm text-gray-900 truncate" title={vacation.reason}>
                        {vacation.reason}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No reason provided</span>
                    )}
                  </TableCell>

                  {!compact && (
                    <TableCell>
                      {vacation.approver ? (
                        <div className="text-sm">
                          <div className="text-gray-900">{vacation.approver.name}</div>
                          <div className="text-gray-500">
                            {vacation.approvedDate && formatDate(vacation.approvedDate)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </TableCell>
                  )}

                  {!compact && (
                    <TableCell className="text-sm text-gray-600">
                      {/* Note: Would need submittedDate from vacation entry */}
                      —
                    </TableCell>
                  )}

                  {showActions && canApprove && (
                    <TableCell>
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprovalClick({
                              ...vacation,
                              entryIndex: index,
                              vacationDayId: (vacation as any).vacationDayId,
                            }, true)}
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleApprovalClick({
                              ...vacation,
                              entryIndex: index,
                              vacationDayId: (vacation as any).vacationDayId,
                            }, false)}
                          >
                            ✗ Deny
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {status === 'Approved' ? '✓ Approved' : '✗ Denied'}
                        </span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-gray-50">
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredVacations.reduce((sum, v) => sum + v.days, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Days</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredVacations.filter(v => !v.approvedDate).length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredVacations.filter(v => v.status === 'approved' && v.approvedDate).length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Approval Modal */}
      <Modal isOpen={approvalModalOpen} onClose={() => setApprovalModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {approvalAction ? 'Approve' : 'Deny'} Vacation Request
          </h3>

          {selectedVacation && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm space-y-1">
                <div><strong>Type:</strong> {VACATION_TYPE_LABELS[selectedVacation.type]}</div>
                <div><strong>Dates:</strong> {formatDateRange(selectedVacation.startDate, selectedVacation.endDate)}</div>
                <div><strong>Days:</strong> {selectedVacation.days}</div>
                {selectedVacation.reason && (
                  <div><strong>Reason:</strong> {selectedVacation.reason}</div>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {approvalAction ? 'Approval' : 'Denial'} Reason (Optional)
            </label>
            <Textarea
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              placeholder={`Provide a reason for ${approvalAction ? 'approval' : 'denial'}...`}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setApprovalModalOpen(false)}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button
              variant={approvalAction ? 'success' : 'danger'}
              onClick={handleApprovalSubmit}
              disabled={isApproving}
            >
              {isApproving
                ? 'Processing...'
                : approvalAction
                  ? 'Approve Request'
                  : 'Deny Request'
              }
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}