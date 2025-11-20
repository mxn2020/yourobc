// src/features/yourobc/invoices/pages/CreateInvoicePage.tsx

import { FC } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { InvoiceForm } from '../components/InvoiceForm'
import { useInvoices, useInvoice } from '../hooks/useInvoices'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Card, Alert, AlertDescription, Loading } from '@/components/ui'
import type { InvoiceFormData } from '../types'
import { CustomerId, PartnerId, ShipmentId, InvoiceId } from '@/convex/lib/yourobc'

interface CreateInvoicePageProps {
  invoiceId?: InvoiceId
  mode?: 'create' | 'edit'
  preselectedCustomerId?: CustomerId
  preselectedPartnerId?: PartnerId
  preselectedShipmentId?: ShipmentId
}

export const CreateInvoicePage: FC<CreateInvoicePageProps> = ({
  invoiceId,
  mode = 'create',
  preselectedCustomerId,
  preselectedPartnerId,
  preselectedShipmentId,
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const { invoice, isLoading: isLoadingInvoice } = useInvoice(invoiceId!)
  const { createInvoice, updateInvoice, isCreating, isUpdating } = useInvoices()

  const handleSubmit = async (formData: InvoiceFormData) => {
    try {
      if (mode === 'edit' && invoiceId) {
        await updateInvoice(invoiceId, formData)
        toast.success(`Invoice ${formData.invoiceNumber || invoiceId} updated successfully!`)
        navigate({ to: '/yourobc/invoices/$invoiceId', params: { invoiceId } })
      } else {
        const newInvoiceId = await createInvoice(formData)
        toast.success(`Invoice created successfully!`)
        navigate({ to: '/yourobc/invoices/$invoiceId', params: { invoiceId: newInvoiceId } })
      }
    } catch (error: any) {
      console.error('Invoice operation error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to create/update invoices')
      } else if (code === 'DUPLICATE_INVOICE') {
        toast.error('An invoice with this number already exists')
      }
    }
  }

  const handleCancel = () => {
    if (mode === 'edit' && invoiceId) {
      navigate({ to: '/yourobc/invoices/$invoiceId', params: { invoiceId } })
    } else {
      navigate({ to: '/yourobc/invoices' })
    }
  }

  if (mode === 'edit' && (isLoadingInvoice || !invoice)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoadingInvoice ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <Card>
              <div className="text-center py-12 p-6">
                <div className="text-red-500 text-lg mb-4">Invoice Not Found</div>
                <p className="text-gray-500 mb-4">
                  The invoice you are trying to edit does not exist or has been deleted.
                </p>
                <Link
                  to="/yourobc/invoices"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Invoices
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Check if invoice can be edited
  if (invoiceId && mode === 'edit' && invoice && !['draft', 'sent'].includes(invoice.status)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">Cannot Edit Invoice</div>
              <p className="text-gray-500 mb-4">
                This invoice cannot be edited because it has been {invoice.status}. 
                Only draft and sent invoices can be modified.
              </p>
              <Link
                to="/yourobc/invoices/$invoiceId"
                params={{ invoiceId: invoiceId }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Invoice Details
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const pageTitle = mode === 'edit'
    ? `Edit Invoice ${invoice?.invoiceNumber}`
    : 'Create New Invoice'
  const breadcrumbText = mode === 'edit'
    ? `Invoice ${invoice?.invoiceNumber}`
    : 'Invoices'
  const breadcrumbPath = mode === 'edit'
    ? `/yourobc/invoices/${invoiceId}`
    : '/yourobc/invoices'

  // Prepare initial data for the form
  const initialData = mode === 'edit' && invoice ? invoice : {
    type: 'outgoing' as const,
    customerId: preselectedCustomerId,
    partnerId: preselectedPartnerId,
    shipmentId: preselectedShipmentId,
    issueDate: Date.now(),
    paymentTerms: 30,
    lineItems: [],
    subtotal: { amount: 0, currency: 'EUR' as const },
    totalAmount: { amount: 0, currency: 'EUR' as const },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to={breadcrumbPath}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to {breadcrumbText}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-2">
            {mode === 'edit'
              ? 'Update invoice information and line items'
              : 'Create a new invoice for your customer or partner'}
          </p>
        </div>

        {/* Information Alert */}
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="text-sm text-blue-800">
              <strong>Invoice Creation Tips:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>
                  <strong>Outgoing invoices</strong> are for billing customers (revenue)
                </li>
                <li>
                  <strong>Incoming invoices</strong> are for vendor bills (expenses)
                </li>
                <li>
                  <strong>Required:</strong> Every invoice must be associated with a customer, partner, or shipment
                </li>
                <li>Line items will automatically calculate subtotal and tax</li>
                <li>Due date will be calculated based on payment terms</li>
                <li>Save as draft to continue editing later</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Preselection Info */}
        {(preselectedCustomerId || preselectedPartnerId || preselectedShipmentId) && (
          <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
            <AlertDescription>
              <div className="text-sm text-green-800">
                <strong>Pre-selected Information:</strong>
                <ul className="mt-2 space-y-1">
                  {preselectedCustomerId && (
                    <li>✓ Customer has been pre-selected</li>
                  )}
                  {preselectedPartnerId && (
                    <li>✓ Partner has been pre-selected</li>
                  )}
                  {preselectedShipmentId && (
                    <li>✓ Shipment has been pre-selected</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <div className="p-6">
            <InvoiceForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel={mode === 'edit' ? 'Update Invoice' : 'Create Invoice'}
              isLoading={isCreating || isUpdating}
              showAllFields={true}
            />
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Invoice Creation Best Practices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Required Information:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Entity Association:</strong> Must select a customer, partner, or shipment
                  </li>
                  <li>
                    <strong>Description:</strong> Clear description of services/products
                  </li>
                  <li>
                    <strong>Line Items:</strong> Detailed breakdown with quantities and prices
                  </li>
                  <li>
                    <strong>Payment Terms:</strong> When payment is due
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Optional but Recommended:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Purchase Order:</strong> Customer's PO number for reference
                  </li>
                  <li>
                    <strong>External Number:</strong> Vendor's invoice number
                  </li>
                  <li>
                    <strong>Billing Address:</strong> For accurate delivery and records
                  </li>
                  <li>
                    <strong>Notes:</strong> Additional terms or special instructions
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tax Configuration:</h4>
                <ul className="space-y-1">
                  <li>• Standard Rate: 19% (Germany)</li>
                  <li>• Reduced Rate: 7% (books, food, etc.)</li>
                  <li>• Tax Exempt: 0% (exports, certain services)</li>
                  <li>• EU Reverse Charge: 0% (B2B within EU)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Invoice Workflow:</h4>
                <ul className="space-y-1">
                  <li>1. Create as Draft → Review and edit</li>
                  <li>2. Send to Customer → Starts payment clock</li>
                  <li>3. Track Status → Monitor payment</li>
                  <li>4. Record Payment → Complete the cycle</li>
                </ul>
              </div>
            </div>

            <Alert variant="warning" className="mt-4">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> Double-check all amounts and tax calculations 
                    before sending the invoice. Once sent, changes may require creating a 
                    new invoice or credit note.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    </div>
  )
}