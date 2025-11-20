// src/features/boilerplate/payments/providers/stripe-connect/components/PaymentHistory.tsx
/**
 * Payment History Component
 *
 * Displays payment history for a connected account
 */

import { Card, CardHeader, CardTitle, CardContent, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Loading } from '@/components/ui';
import { useStripeConnectPayments } from '../hooks/useStripeConnectPayments';
import { DollarSign, Calendar } from 'lucide-react';

interface PaymentHistoryProps {
  limit?: number;
  showOnlySuccessful?: boolean;
}

/**
 * Component to display payment history for a connected account
 *
 * @example
 * ```tsx
 * <PaymentHistory limit={10} showOnlySuccessful={false} />
 * ```
 */
export function PaymentHistory({ limit, showOnlySuccessful = false }: PaymentHistoryProps) {
  const { payments, isLoading, successfulPayments } = useStripeConnectPayments();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  const displayPayments = showOnlySuccessful
    ? successfulPayments
    : payments || [];

  const limitedPayments = limit
    ? displayPayments.slice(0, limit)
    : displayPayments;

  if (limitedPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Payments will appear here once customers make purchases.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'USD',
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="success">Succeeded</Badge>;
      case 'pending':
        return <Badge variant="info">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Payment History ({limitedPayments.length}
          {limit && displayPayments.length > limit && ` of ${displayPayments.length}`})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {limitedPayments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.customerEmail || 'Unknown'}
                    </p>
                    {payment.customerName && (
                      <p className="text-xs text-gray-500">{payment.customerName}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatPrice(payment.amount || 0, payment.currency || 'usd')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {formatPrice(payment.application_fee_amount || 0, payment.currency || 'usd')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-green-600">
                    {formatPrice(
                      (payment.amount || 0) - (payment.application_fee_amount || 0),
                      payment.currency || 'usd'
                    )}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
