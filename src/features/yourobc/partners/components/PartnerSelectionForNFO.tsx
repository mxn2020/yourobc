/**
 * Partner Selection Component for NFO Process
 *
 * This component handles Step 1 of the NFO quote process as defined in YOUROBC.md:
 * - System suggests partners based on departure country
 * - Shows partner list with contact details, ranking, and payment terms
 * - Generates email template for partner quote requests
 * - Allows selection of multiple partners to send requests to
 *
 * @module src/features/yourobc/partners/components/PartnerSelectionForNFO
 */

import { FC, useState } from 'react'
import type { Id } from '@/convex/_generated/dataModel'
import { useAuthenticatedUser } from '@/features/system/auth'
import { partnersService } from '../services/PartnersService'
import { PARTNERS_MODULE_CONFIG } from '../index'

// ============================================================================
// Types
// ============================================================================

interface PartnerSelectionForNFOProps {
  /**
   * Departure country name (e.g., "Germany")
   */
  departureCountry: string

  /**
   * Departure country code (e.g., "DE")
   */
  departureCountryCode: string

  /**
   * Quote data for generating the partner request template
   */
  quoteData: {
    pickupLocation: string
    deliveryLocation: string
    dimensions: string
    weight: number
    deadline: number
    shipmentType: string // Door-Door, Door-Airport, Airport-Door
    shippingTerms: string // FCA, EXW, etc
    customerName?: string
    notes?: string
  }

  /**
   * Callback when partners are selected
   */
  onPartnersSelected: (partnerIds: Id<'yourobcPartners'>[]) => void

  /**
   * Optional callback when selection is cancelled
   */
  onCancel?: () => void
}

// ============================================================================
// Component
// ============================================================================

export const PartnerSelectionForNFO: FC<PartnerSelectionForNFOProps> = ({
  departureCountry,
  departureCountryCode,
  quoteData,
  onPartnersSelected,
  onCancel,
}) => {
  const authUser = useAuthenticatedUser()
  const [selectedPartners, setSelectedPartners] = useState<Set<Id<'yourobcPartners'>>>(new Set())
  const [showTemplate, setShowTemplate] = useState(false)

  // Fetch suitable partners
  const { data: partners, isLoading: isLoadingPartners } = partnersService.usePartnersForNFOQuote(
    authUser!.id,
    departureCountry,
    departureCountryCode
  )

  // Fetch email template
  const { data: emailTemplate } = partnersService.usePartnerQuoteRequestTemplate(
    authUser!.id,
    quoteData
  )

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const togglePartnerSelection = (partnerId: Id<'yourobcPartners'>) => {
    const newSelection = new Set(selectedPartners)
    if (newSelection.has(partnerId)) {
      newSelection.delete(partnerId)
    } else {
      newSelection.add(partnerId)
    }
    setSelectedPartners(newSelection)
  }

  const handleConfirmSelection = () => {
    onPartnersSelected(Array.from(selectedPartners))
  }

  const handleCopyTemplate = () => {
    if (emailTemplate) {
      navigator.clipboard.writeText(emailTemplate)
      alert('Template copied to clipboard!')
    }
  }

  // ============================================================================
  // Feature Checks
  // ============================================================================

  if (!PARTNERS_MODULE_CONFIG.enablePartnerListForNFO) {
    return null
  }

  // ============================================================================
  // Render: Loading State
  // ============================================================================

  if (isLoadingPartners) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading partners...</div>
      </div>
    )
  }

  // ============================================================================
  // Render: Main Component
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">NFO Step 1: Partner Selection</h3>
            <div className="mt-2 text-sm text-blue-700">
              Select partners to request quotes from based on departure country:{' '}
              <strong>{departureCountry}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Partners for {departureCountry}
          </h3>
          <div className="text-sm text-gray-500">{partners?.length || 0} partners found</div>
        </div>

        {partners && partners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((partner) => (
              <div
                key={partner._id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedPartners.has(partner._id)
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => togglePartnerSelection(partner._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Selection Checkbox */}
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedPartners.has(partner._id)}
                        onChange={() => togglePartnerSelection(partner._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <h4 className="font-semibold text-gray-900">{partner.companyName}</h4>
                    </div>

                    {/* Partner Code */}
                    {PARTNERS_MODULE_CONFIG.displayOptions.showPartnerCode &&
                      partner.partnerCode && (
                        <div className="text-sm text-gray-600 mb-2">
                          Code: {partner.partnerCode}
                        </div>
                      )}

                    {/* Contact Info */}
                    {PARTNERS_MODULE_CONFIG.displayOptions.showContactInfo && (
                      <div className="space-y-1 mt-2">
                        <div className="text-sm text-gray-700 flex items-center gap-1">
                          <span>📧</span>
                          <span className="break-all">
                            {partner.quotingEmail ||
                              partner.primaryContact.email ||
                              'No email'}
                          </span>
                        </div>
                        {partner.primaryContact.phone && (
                          <div className="text-sm text-gray-700 flex items-center gap-1">
                            <span>📞</span>
                            <span>{partner.primaryContact.phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Terms & Currency */}
                    {PARTNERS_MODULE_CONFIG.displayOptions.showPaymentTerms && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Payment: {partner.paymentTerms || 0} days
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {partner.preferredCurrency}
                        </span>
                      </div>
                    )}

                    {/* Ranking */}
                    {PARTNERS_MODULE_CONFIG.displayOptions.showRanking && partner.ranking && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <span className="text-yellow-500">
                          {'⭐'.repeat(partner.ranking)}
                        </span>
                        {partner.rankingNotes && (
                          <span className="text-xs text-gray-500">
                            ({partner.rankingNotes})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Service Capabilities */}
                    {PARTNERS_MODULE_CONFIG.displayOptions.showServiceCapabilities &&
                      partner.serviceCapabilities && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {partner.serviceCapabilities.handlesNFO && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              NFO
                            </span>
                          )}
                          {partner.serviceCapabilities.handlesCustoms && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Customs
                            </span>
                          )}
                          {partner.serviceCapabilities.handlesPickup && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Pickup
                            </span>
                          )}
                          {partner.serviceCapabilities.handlesDelivery && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              Delivery
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Partners Found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  No partners found for {departureCountry}. Please add partners for this country or
                  select a different departure location.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {partners && partners.length > 0 && (
        <div className="flex items-center gap-4 border-t pt-4">
          <button
            onClick={handleConfirmSelection}
            disabled={selectedPartners.size === 0}
            className={`px-4 py-2 rounded-md font-medium ${
              selectedPartners.size === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Confirm Selection ({selectedPartners.size} partners)
          </button>

          {PARTNERS_MODULE_CONFIG.enablePartnerQuoteRequestTemplate && (
            <button
              onClick={() => setShowTemplate(!showTemplate)}
              className="px-4 py-2 rounded-md font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {showTemplate ? 'Hide' : 'Show'} Email Template
            </button>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Email Template */}
      {showTemplate && emailTemplate && PARTNERS_MODULE_CONFIG.enablePartnerQuoteRequestTemplate && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Partner Quote Request Template</h3>
          <div className="bg-white border rounded p-4 mb-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {emailTemplate}
            </pre>
          </div>
          <button
            onClick={handleCopyTemplate}
            className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            📋 Copy Template to Clipboard
          </button>
        </div>
      )}
    </div>
  )
}
