// src/features/yourobc/customers/pages/CreateCustomerPage.tsx

import { FC } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { CustomerForm } from '../components/CustomerForm'
import { useCustomers, useCustomer } from '../hooks/useCustomers'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Card, Alert, AlertDescription, Loading } from '@/components/ui'
import type { CustomerFormData, CustomerId } from '../types'

interface CreateCustomerPageProps {
  customerId?: CustomerId
  mode?: 'create' | 'edit'
}

export const CreateCustomerPage: FC<CreateCustomerPageProps> = ({
  customerId,
  mode = 'create',
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const { customer, isLoading: isLoadingCustomer } = useCustomer(customerId)
  const { createCustomer, updateCustomer, isCreating, isUpdating } = useCustomers()

  const handleSubmit = async (formData: CustomerFormData) => {
    try {
      if (mode === 'edit' && customerId) {
        await updateCustomer(customerId, formData)
        toast.success(`${formData.companyName} updated successfully!`)
        navigate({ to: '/yourobc/customers/$customerId', params: { customerId } })
      } else {
        const newCustomerId = await createCustomer(formData)
        toast.success(`${formData.companyName} created successfully!`)
        navigate({ to: '/yourobc/customers/$customerId', params: { customerId: newCustomerId } })
      }
    } catch (error: any) {
      console.error('Customer operation error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to create/update customers')
      } else if (code === 'DUPLICATE_CUSTOMER') {
        toast.error('A customer with this company name already exists')
      }
    }
  }

  const handleCancel = () => {
    if (mode === 'edit' && customerId) {
      navigate({ to: '/yourobc/customers/$customerId', params: { customerId } })
    } else {
      navigate({ to: '/yourobc/customers' })
    }
  }

  if (mode === 'edit' && (isLoadingCustomer || !customer)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoadingCustomer ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <Card>
              <div className="text-center py-12 p-6">
                <div className="text-red-500 text-lg mb-4">Customer Not Found</div>
                <p className="text-gray-500 mb-4">
                  The customer you are trying to edit does not exist or has been deleted.
                </p>
                <Link
                  to="/yourobc/customers"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Customers
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const pageTitle = mode === 'edit'
    ? `Edit ${customer?.companyName}`
    : 'Add New Customer'
  const breadcrumbText = mode === 'edit'
    ? `${customer?.companyName} Details`
    : 'Customers'
  const breadcrumbPath = mode === 'edit'
    ? `/yourobc/customers/${customerId}`
    : '/yourobc/customers'

  // Prepare initial data for the form
  const initialData = mode === 'edit' && customer ? customer : undefined

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
              ? 'Update customer information and business details'
              : 'Add a new customer to your business network'}
          </p>
        </div>

        <Card>
          <div className="p-6">
            <CustomerForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel={mode === 'edit' ? 'Update Customer' : 'Create Customer'}
              isLoading={isCreating || isUpdating}
              showAllFields={true}
            />
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Customer Setup Best Practices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Required Information:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Company Name:</strong> Full legal business name
                  </li>
                  <li>
                    <strong>Primary Contact:</strong> Main point of contact
                  </li>
                  <li>
                    <strong>Billing Address:</strong> Complete address for invoicing
                  </li>
                  <li>
                    <strong>Payment Terms:</strong> Default payment period
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Business Settings:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Currency:</strong> Default currency for transactions
                  </li>
                  <li>
                    <strong>Payment Method:</strong> Preferred payment method
                  </li>
                  <li>
                    <strong>Margin:</strong> Profit margin percentage
                  </li>
                  <li>
                    <strong>Tags:</strong> Categories for organization
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Contact Management:</h4>
                <ul className="space-y-1">
                  <li>• Add multiple contacts for different departments</li>
                  <li>• Include direct phone numbers and email addresses</li>
                  <li>• Keep emergency contact information updated</li>
                  <li>• Note preferred communication methods</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Address Information:</h4>
                <ul className="space-y-1">
                  <li>• Billing address for invoice delivery</li>
                  <li>• Shipping address if different from billing</li>
                  <li>• Include postal codes for accurate delivery</li>
                  <li>• Verify country codes for international customers</li>
                </ul>
              </div>
            </div>

            <Alert variant="default" className="mt-4 bg-blue-100 border-blue-300">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 text-lg">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> Complete customer profiles lead to better service
                    and more accurate quoting. Take time to gather all relevant information
                    during the initial setup to streamline future interactions.
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Alert variant="warning" className="mt-4">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> Verify customer information accuracy before
                    saving. Incorrect contact details or addresses can lead to failed
                    deliveries and payment delays.
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