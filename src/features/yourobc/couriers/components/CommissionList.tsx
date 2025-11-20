// src/features/yourobc/couriers/components/CommissionList.tsx

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
} from '@/components/ui'
import { COMMISSION_STATUS_LABELS, COMMISSION_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '../types'
import type { CommissionListItem, CommissionId } from '../types'

interface CommissionListProps {
  commissions: CommissionListItem[]
  isLoading?: boolean
  onMarkPaid?: (commissionId: CommissionId) => void
  showCourier?: boolean
  showShipment?: boolean
  compact?: boolean
}

export const CommissionList: FC<CommissionListProps> = ({
  commissions,
  isLoading = false,
  onMarkPaid,
  showCourier = true,
  showShipment = true,
  compact = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'paid':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const filteredCommissions = statusFilter
    ? commissions.filter((c) => c.status === statusFilter)
    : commissions

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  if (commissions.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 p-6">
          <div className="text-gray-500 text-lg mb-2">No commissions found</div>
          <p className="text-gray-400">Commissions will appear here once created.</p>
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
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        {statusFilter && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('')}>
            Clear Filter
          </Button>
        )}

        <div className="ml-auto text-sm text-gray-600">
          {filteredCommissions.length} commission{filteredCommissions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Commissions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {showCourier && <TableHead>Courier</TableHead>}
              {showShipment && <TableHead>Shipment</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Base Amount</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              {!compact && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCommissions.map((commission) => (
              <TableRow key={commission._id}>
                {showCourier && (
                  <TableCell>
                    {commission.courier ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {commission.courier.firstName} {commission.courier.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{commission.courier.courierNumber}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unknown</span>
                    )}
                  </TableCell>
                )}

                {showShipment && (
                  <TableCell>
                    {commission.shipment ? (
                      <div className="text-sm text-gray-900">{commission.shipment.shipmentNumber}</div>
                    ) : (
                      <span className="text-sm text-gray-500">Unknown</span>
                    )}
                  </TableCell>
                )}

                <TableCell>
                  <Badge variant="secondary" size="sm">
                    {COMMISSION_TYPE_LABELS[commission.type]}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm text-gray-900">
                  {commission.type === 'percentage' ? `${commission.rate}%` : formatCurrency(commission.rate)}
                </TableCell>

                <TableCell className="text-sm text-gray-900">
                  {formatCurrency(commission.baseAmount)}
                </TableCell>

                <TableCell className="text-sm font-medium text-green-600">
                  {formatCurrency(commission.commissionAmount)}
                </TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(commission.status)} size="sm">
                    {COMMISSION_STATUS_LABELS[commission.status]}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm text-gray-600">
                  <div>{formatDate(commission.createdAt)}</div>
                  {commission.paidDate && (
                    <div className="text-xs text-green-600">Paid: {formatDate(commission.paidDate)}</div>
                  )}
                </TableCell>

                {!compact && (
                  <TableCell>
                    {commission.status === 'pending' && onMarkPaid && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onMarkPaid(commission._id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                    {commission.status === 'paid' && (
                      <span className="text-sm text-green-600">✓ Paid</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Summary */}
      <Card className="bg-gray-50">
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Total Commissions</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(
                  filteredCommissions
                    .filter((c) => c.status === 'pending')
                    .reduce((sum, c) => sum + c.commissionAmount, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  filteredCommissions
                    .filter((c) => c.status === 'paid')
                    .reduce((sum, c) => sum + c.commissionAmount, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Paid</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}