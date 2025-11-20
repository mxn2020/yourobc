// src/features/yourobc/quotes/pages/CreateQuotePage.tsx

import { FC } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { QuoteForm } from '../components/QuoteForm'
import { useQuotes, useQuote } from '../hooks/useQuotes'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Card, Alert, AlertDescription, Loading } from '@/components/ui'
import type { CustomerId, QuoteFormData, QuoteId } from '../types'

interface CreateQuotePageProps {
  quoteId?: QuoteId
  mode?: 'create' | 'edit'
  customerId?: CustomerId
}

export const CreateQuotePage: FC<CreateQuotePageProps> = ({
  quoteId,
  mode = 'create',
  customerId,
}) => {
  const navigate = useNavigate()
  const toast = useToast()

  const { quote, isLoading: isLoadingQuote } = useQuote(quoteId)
  const { createQuote, updateQuote, isCreating, isUpdating } = useQuotes()

  const handleSubmit = async (formData: QuoteFormData) => {
    try {
      if (mode === 'edit' && quoteId) {
        await updateQuote(quoteId, formData)
        toast.success(`Quote updated successfully!`)
        navigate({ to: '/yourobc/quotes/$quoteId', params: { quoteId } })
      } else {
        const newQuoteId = await createQuote(formData)
        toast.success(`Quote created successfully!`)
        navigate({ to: '/yourobc/quotes/$quoteId', params: { quoteId: newQuoteId } })
      }
    } catch (error: any) {
      console.error('Quote operation error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to create/update quotes')
      } else if (code === 'DUPLICATE_QUOTE') {
        toast.error('A quote with this information already exists')
      }
    }
  }

  const handleCancel = () => {
    if (mode === 'edit' && quoteId) {
      navigate({ to: '/yourobc/quotes/$quoteId', params: { quoteId } })
    } else {
      navigate({ to: '/yourobc/quotes' })
    }
  }

  if (mode === 'edit' && (isLoadingQuote || !quote)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoadingQuote ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <Card>
              <div className="text-center py-12 p-6">
                <div className="text-red-500 text-lg mb-4">Quote Not Found</div>
                <p className="text-gray-500 mb-4">
                  The quote you are trying to edit does not exist or has been deleted.
                </p>
                <Link
                  to="/yourobc/quotes"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Quotes
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const pageTitle = mode === 'edit'
    ? `Edit Quote ${quote?.quoteNumber}`
    : 'Create New Quote'
  const breadcrumbText = mode === 'edit'
    ? `Quote ${quote?.quoteNumber} Details`
    : 'Quotes'
  const breadcrumbPath = mode === 'edit'
    ? `/yourobc/quotes/${quoteId}`
    : '/yourobc/quotes'

  // Prepare initial data for the form
  const initialData = mode === 'edit' && quote
    ? quote
    : customerId
      ? { customerId }
      : undefined

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
              ? 'Update quote information and pricing'
              : 'Create a professional quote for your customer'}
          </p>
        </div>

        <Card>
          <div className="p-6">
            <QuoteForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel={mode === 'edit' ? 'Update Quote' : 'Create Quote'}
              isLoading={isCreating || isUpdating}
              showAllFields={true}
            />
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Quote Creation Best Practices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Essential Information:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Accurate Dimensions:</strong> Measure length, width, height and weight precisely
                  </li>
                  <li>
                    <strong>Clear Description:</strong> Describe items in detail for proper handling
                  </li>
                  <li>
                    <strong>Realistic Timeline:</strong> Set achievable delivery deadlines
                  </li>
                  <li>
                    <strong>Complete Addresses:</strong> Include full origin and destination details
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pricing Strategy:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Competitive Rates:</strong> Research market prices for similar services
                  </li>
                  <li>
                    <strong>Markup Guidelines:</strong> Standard 15-25% markup for most services
                  </li>
                  <li>
                    <strong>Priority Pricing:</strong> Higher rates for urgent/critical shipments
                  </li>
                  <li>
                    <strong>Clear Terms:</strong> Include all costs and conditions upfront
                  </li>
                </ul>
              </div>
            </div>

            <Alert variant="warning" className="mt-4">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> Always verify customer details, dimensions, and pricing before sending quotes. 
                    Accurate information prevents misunderstandings and ensures smooth service delivery.
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