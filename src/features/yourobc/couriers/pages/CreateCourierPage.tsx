// src/features/yourobc/couriers/pages/CreateCourierPage.tsx

import { FC } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { CourierForm } from '../components/CourierForm'
import { useCouriers, useCourier } from '../hooks/useCouriers'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Card, Alert, AlertDescription, Loading } from '@/components/ui'
import type { CourierFormData, CourierId } from '../types'

interface CreateCourierPageProps {
  courierId?: CourierId
  mode?: 'create' | 'edit'
}

export const CreateCourierPage: FC<CreateCourierPageProps> = ({
  courierId,
  mode = 'create',
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const { courier, isLoading: isLoadingCourier } = useCourier(courierId)
  const { createCourier, updateCourier, isCreating, isUpdating } = useCouriers()

  const handleSubmit = async (formData: CourierFormData) => {
    try {
      if (mode === 'edit' && courierId) {
        await updateCourier(courierId, formData)
        toast.success(`${formData.firstName} ${formData.lastName} updated successfully!`)
        navigate({ to: '/yourobc/couriers/$courierId', params: { courierId } })
      } else {
        const newCourierId = await createCourier(formData)
        toast.success(`${formData.firstName} ${formData.lastName} created successfully!`)
        navigate({ to: '/yourobc/couriers/$courierId', params: { courierId: newCourierId } })
      }
    } catch (error: any) {
      console.error('Courier operation error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to create/update couriers')
      } else if (code === 'DUPLICATE_COURIER') {
        toast.error('A courier with this information already exists')
      }
    }
  }

  const handleCancel = () => {
    if (mode === 'edit' && courierId) {
      navigate({ to: '/yourobc/couriers/$courierId', params: { courierId } })
    } else {
      navigate({ to: '/yourobc/couriers' })
    }
  }

  if (mode === 'edit' && (isLoadingCourier || !courier)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoadingCourier ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <Card>
              <div className="text-center py-12 p-6">
                <div className="text-red-500 text-lg mb-4">Courier Not Found</div>
                <p className="text-gray-500 mb-4">
                  The courier you are trying to edit does not exist or has been deleted.
                </p>
                <Link
                  to="/yourobc/couriers"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Couriers
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const pageTitle = mode === 'edit'
    ? `Edit ${courier?.firstName} ${courier?.lastName}`
    : 'Add New Courier'
  const breadcrumbText = mode === 'edit'
    ? `${courier?.firstName} ${courier?.lastName} Details`
    : 'Couriers'
  const breadcrumbPath = mode === 'edit'
    ? `/yourobc/couriers/${courierId}`
    : '/yourobc/couriers'

  // Prepare initial data for the form
  const initialData = mode === 'edit' && courier ? courier : undefined

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
              ? 'Update courier information and capabilities'
              : 'Add a new courier to your network'}
          </p>
        </div>

        <Card>
          <div className="p-6">
            <CourierForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel={mode === 'edit' ? 'Update Courier' : 'Create Courier'}
              isLoading={isCreating || isUpdating}
              showAllFields={true}
            />
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Courier Setup Best Practices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Required Information:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Full Name:</strong> First, middle (optional), and last name
                  </li>
                  <li>
                    <strong>Phone Number:</strong> Primary contact number (required)
                  </li>
                  <li>
                    <strong>Languages:</strong> All languages the courier can speak
                  </li>
                  <li>
                    <strong>Service Types:</strong> OBC and/or NFO capabilities
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Skills & Capabilities:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Max Carry Weight:</strong> Maximum weight courier can handle
                  </li>
                  <li>
                    <strong>Certifications:</strong> Dangerous goods, pharmaceutical, etc.
                  </li>
                  <li>
                    <strong>Location:</strong> Home country and city
                  </li>
                  <li>
                    <strong>Timezone:</strong> For scheduling and availability
                  </li>
                </ul>
              </div>
            </div>

            <Alert variant="warning" className="mt-4">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> Accurate courier information is essential for
                    efficient shipment assignments. Verify all contact details, language skills,
                    and service capabilities before saving.
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