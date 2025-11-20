// src/features/yourobc/partners/pages/CreatePartnerPage.tsx

import { FC } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { PartnerForm } from '../components/PartnerForm'
import { usePartners, usePartner } from '../hooks/usePartners'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Card, Alert, AlertDescription, Loading } from '@/components/ui'
import type { PartnerFormData, PartnerId } from '../types'

interface CreatePartnerPageProps {
  partnerId?: PartnerId
  mode?: 'create' | 'edit'
}

export const CreatePartnerPage: FC<CreatePartnerPageProps> = ({
  partnerId,
  mode = 'create',
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const { partner, isLoading: isLoadingPartner } = usePartner(partnerId)
  const { createPartner, updatePartner, isCreating, isUpdating } = usePartners()

  const handleSubmit = async (formData: PartnerFormData) => {
    try {
      if (mode === 'edit' && partnerId) {
        await updatePartner(partnerId, formData)
        toast.success(`${formData.companyName} updated successfully!`)
        navigate({ to: '/yourobc/partners/$partnerId', params: { partnerId } })
      } else {
        const newPartnerId = await createPartner(formData)
        toast.success(`${formData.companyName} created successfully!`)
        navigate({ to: '/yourobc/partners/$partnerId', params: { partnerId: newPartnerId } })
      }
    } catch (error: any) {
      console.error('Partner operation error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to create/update partners')
      } else if (code === 'DUPLICATE_PARTNER') {
        toast.error('A partner with this information already exists')
      }
    }
  }

  const handleCancel = () => {
    if (mode === 'edit' && partnerId) {
      navigate({ to: '/yourobc/partners/$partnerId', params: { partnerId } })
    } else {
      navigate({ to: '/yourobc/partners' })
    }
  }

  if (mode === 'edit' && (isLoadingPartner || !partner)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoadingPartner ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <Card>
              <div className="text-center py-12 p-6">
                <div className="text-red-500 text-lg mb-4">Partner Not Found</div>
                <p className="text-gray-500 mb-4">
                  The partner you are trying to edit does not exist or has been deleted.
                </p>
                <Link
                  to="/yourobc/partners"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Partners
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const pageTitle = mode === 'edit'
    ? `Edit ${partner?.companyName}`
    : 'Add New Partner'
  const breadcrumbText = mode === 'edit'
    ? `${partner?.companyName} Details`
    : 'Partners'
  const breadcrumbPath = mode === 'edit'
    ? `/yourobc/partners/${partnerId}`
    : '/yourobc/partners'

  // Prepare initial data for the form
  const initialData = mode === 'edit' && partner ? partner : undefined

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
              ? 'Update partner information and service coverage'
              : 'Add a new partner to your network'}
          </p>
        </div>

        <Card>
          <div className="p-6">
            <PartnerForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel={mode === 'edit' ? 'Update Partner' : 'Create Partner'}
              isLoading={isCreating || isUpdating}
              showAllFields={true}
            />
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Partner Setup Best Practices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Required Information:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Company Name:</strong> Full legal name of the partner company
                  </li>
                  <li>
                    <strong>Service Type:</strong> OBC, NFO, or both services
                  </li>
                  <li>
                    <strong>Primary Contact:</strong> Main point of contact with valid details
                  </li>
                  <li>
                    <strong>Address:</strong> Complete business address including country
                  </li>
                  <li>
                    <strong>Service Coverage:</strong> Countries/regions where they operate
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Service Coverage Tips:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Countries:</strong> Select all countries where partner can provide services
                  </li>
                  <li>
                    <strong>Cities:</strong> Add specific cities for targeted routing
                  </li>
                  <li>
                    <strong>Airports:</strong> Include airport codes for air freight services
                  </li>
                  <li>
                    <strong>Service Types:</strong> Be specific about OBC vs NFO capabilities
                  </li>
                  <li>
                    <strong>Updates:</strong> Keep coverage information current and accurate
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Business Terms:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Payment Terms:</strong> Net days for payment (typically 30-60 days)
                  </li>
                  <li>
                    <strong>Currency:</strong> Preferred currency for quotes and invoices
                  </li>
                  <li>
                    <strong>Quoting Email:</strong> Dedicated email for quote requests
                  </li>
                  <li>
                    <strong>Partner Code:</strong> Unique identifier (auto-generated if empty)
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Quality Checklist:</h4>
                <ul className="space-y-1">
                  <li>✓ Verify company registration and legitimacy</li>
                  <li>✓ Confirm service capabilities and certifications</li>
                  <li>✓ Test communication channels and response times</li>
                  <li>✓ Review insurance and liability coverage</li>
                  <li>✓ Establish clear pricing and terms agreements</li>
                </ul>
              </div>
            </div>

            <Alert variant="warning" className="mt-4">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> Accurate partner information is crucial for
                    efficient quote routing and service delivery. Verify all contact details,
                    service capabilities, and coverage areas before saving. Partners with
                    incomplete or inaccurate information may not receive quote requests.
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