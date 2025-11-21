// src/features/yourobc/employees/components/EmployeeForm.tsx

import { FC, useState, useEffect } from 'react'
import { useToast } from '@/features/system/notifications'
import { useEmployeeForm, useEmployees } from '../hooks/useEmployees'
import {
  Input,
  Button,
  Card,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DatePicker,
} from '@/components/ui'
import { 
  EMPLOYEE_CONSTANTS, 
  OFFICE_COUNTRIES,
  COMMON_DEPARTMENTS,
  COMMON_POSITIONS,
} from '../types'
import type { EmployeeFormData, Employee, EmployeeId } from '../types'
import { DEFAULT_TIMEZONES } from '@/convex/lib/yourobc/shared'

interface EmployeeFormProps {
  initialData?: Partial<Employee>
  onSubmit: (data: EmployeeFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  showAllFields?: boolean
  userProfiles?: Array<{
    _id: string
    name: string
    email: string
    authUserId: string
  }>
}

export const EmployeeForm: FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Employee',
  isLoading = false,
  showAllFields = true,
  userProfiles = [],
}) => {
  const toast = useToast()
  const { employees } = useEmployees({ limit: 100 }) // For manager selection

  const { formData, errors, isDirty, updateField, validateForm, setFormData } = useEmployeeForm(
    initialData
      ? {
          userProfileId: initialData.userProfileId,
          authUserId: initialData.authUserId,
          employeeNumber: initialData.employeeNumber,
          department: initialData.department,
          position: initialData.position,
          managerId: initialData.managerId,
          office: initialData.office,
          hireDate: initialData.hireDate,
          workPhone: initialData.workPhone,
          workEmail: initialData.workEmail,
          emergencyContact: initialData.emergencyContact,
          timezone: initialData.timezone,
        }
      : undefined
  )

  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null)

  // Find user profile when form data changes
  useEffect(() => {
    if (formData.userProfileId && userProfiles.length > 0) {
      const profile = userProfiles.find(p => p._id === formData.userProfileId)
      setSelectedUserProfile(profile)
      if (profile && !formData.authUserId) {
        updateField('authUserId', profile.authUserId)
      }
      if (profile && !formData.workEmail) {
        updateField('workEmail', profile.email)
      }
    }
  }, [formData.userProfileId, userProfiles, updateField, formData.authUserId, formData.workEmail])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    if (!formData.userProfileId) {
      toast.error('Please select a user profile')
      return
    }

    onSubmit(formData)
  }

  const handleNestedUpdate = (path: string, value: any) => {
    const pathParts = path.split('.')
    setFormData((prev) => {
      const newData = { ...prev }
      let current = newData as any

      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {}
        }
        current = current[pathParts[i]]
      }

      current[pathParts[pathParts.length - 1]] = value
      return newData
    })
  }

  // Filter available managers (can't be self or direct reports)
  const availableManagers = employees.filter(emp => 
    emp._id !== initialData?._id && // Can't manage themselves
    emp.managerId !== initialData?._id // Can't create circular hierarchy
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* User Profile Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Account</h3>

          <div className="space-y-4">
            <div>
              <Label required>User Profile</Label>
              <Select
                value={formData.userProfileId || ''}
                onValueChange={(value) => updateField('userProfileId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user profile" />
                </SelectTrigger>
                <SelectContent>
                  {userProfiles.map((profile) => (
                    <SelectItem key={profile._id} value={profile._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile.name}</span>
                        <span className="text-sm text-gray-500">{profile.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userProfileId && (
                <p className="text-red-600 text-sm mt-1">{errors.userProfileId}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                This links the employee record to their user account
              </p>
            </div>

            {selectedUserProfile && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Selected User</h4>
                <div className="text-sm text-blue-800">
                  <div><strong>Name:</strong> {selectedUserProfile.name}</div>
                  <div><strong>Email:</strong> {selectedUserProfile.email}</div>
                  <div><strong>Auth ID:</strong> {selectedUserProfile.authUserId}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Employment Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Employee Number"
              value={formData.employeeNumber || ''}
              onChange={(e) => updateField('employeeNumber', e.target.value)}
              error={errors.employeeNumber}
              placeholder="Auto-generated if empty"
              maxLength={EMPLOYEE_CONSTANTS.LIMITS.MAX_EMPLOYEE_NUMBER_LENGTH}
              helpText="Leave empty to auto-generate"
            />

            <div>
              <Label>Department</Label>
              <Select
                value={formData.department || ''}
                onValueChange={(value) => updateField('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Department</SelectItem>
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-red-600 text-sm mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <Label>Position</Label>
              <Select
                value={formData.position || ''}
                onValueChange={(value) => updateField('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Position</SelectItem>
                  {COMMON_POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-red-600 text-sm mt-1">{errors.position}</p>
              )}
            </div>

            <div>
              <Label>Manager</Label>
              <Select
                value={formData.managerId || ''}
                onValueChange={(value) => updateField('managerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Manager</SelectItem>
                  {availableManagers.map((manager) => (
                    <SelectItem key={manager._id} value={manager._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{manager.displayName}</span>
                        <span className="text-sm text-gray-500">
                          {manager.department} - {manager.position}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.managerId && (
                <p className="text-red-600 text-sm mt-1">{errors.managerId}</p>
              )}
            </div>

            <DatePicker
              mode="single"
              label="Hire Date"
              value={formData.hireDate ? new Date(formData.hireDate) : undefined}
              onChange={(date) => updateField('hireDate', date?.getTime())}
              placeholder="Select hire date"
              error={errors.hireDate}
            />
          </div>
        </div>
      </Card>

      {/* Office Location */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Office Location"
              value={formData.office?.location || ''}
              onChange={(e) => handleNestedUpdate('office.location', e.target.value)}
              error={errors['office.location']}
              placeholder="e.g., Munich Office"
              maxLength={EMPLOYEE_CONSTANTS.LIMITS.MAX_OFFICE_LOCATION_LENGTH}
              required
            />

            <div>
              <Label required>Country</Label>
              <Select
                value={formData.office?.countryCode || ''}
                onValueChange={(value) => {
                  const country = OFFICE_COUNTRIES.find((c) => c.code === value)
                  handleNestedUpdate('office.countryCode', value)
                  handleNestedUpdate('office.country', country?.name || value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {OFFICE_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors['office.country'] && (
                <p className="text-red-600 text-sm mt-1">{errors['office.country']}</p>
              )}
            </div>

            <Input
              label="Office Address"
              value={formData.office?.address || ''}
              onChange={(e) => handleNestedUpdate('office.address', e.target.value)}
              placeholder="Street address (optional)"
            />
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Work Phone"
              type="tel"
              value={formData.workPhone || ''}
              onChange={(e) => updateField('workPhone', e.target.value)}
              error={errors.workPhone}
              placeholder="+49 123 456789"
              maxLength={EMPLOYEE_CONSTANTS.LIMITS.MAX_PHONE_LENGTH}
            />

            <Input
              label="Work Email"
              type="email"
              value={formData.workEmail || ''}
              onChange={(e) => updateField('workEmail', e.target.value)}
              error={errors.workEmail}
              placeholder="employee@company.com"
              maxLength={EMPLOYEE_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH}
              helpText="Defaults to user profile email"
            />
          </div>

          <div className="mt-6">
            <Label>Timezone</Label>
            <Select
              value={formData.timezone || EMPLOYEE_CONSTANTS.DEFAULT_VALUES.TIMEZONE}
              onValueChange={(value) => updateField('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Contact Name"
              value={formData.emergencyContact?.name || ''}
              onChange={(e) => handleNestedUpdate('emergencyContact.name', e.target.value)}
              error={errors['emergencyContact.name']}
              placeholder="Full name"
            />

            <Input
              label="Contact Phone"
              type="tel"
              value={formData.emergencyContact?.phone || ''}
              onChange={(e) => handleNestedUpdate('emergencyContact.phone', e.target.value)}
              error={errors['emergencyContact.phone']}
              placeholder="+49 123 456789"
            />

            <Input
              label="Relationship"
              value={formData.emergencyContact?.relationship || ''}
              onChange={(e) => handleNestedUpdate('emergencyContact.relationship', e.target.value)}
              error={errors['emergencyContact.relationship']}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}