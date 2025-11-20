// src/features/yourobc/quotes/components/NFOPartnerInquiry.tsx

import { FC, useState, useEffect } from 'react'
import { Button, Card, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Alert, AlertDescription } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import { quoteTemplateService, type PartnerInquiryTemplateData, type TemplateFormat } from '../services/QuoteTemplateService'
import type { Quote } from '@/convex/lib/yourobc'

interface NFOPartnerInquiryProps {
  quote: Quote
  suggestedPartners?: Array<{
    _id: string
    companyName: string
    shortName?: string
    primaryContact: {
      name: string
      email?: string
    }
    quotingEmail?: string
    serviceCoverage: {
      countries: string[]
      cities: string[]
      airports: string[]
    }
  }>
  onInquirySent?: (partnerIds: string[]) => void
}

const SHIPMENT_TYPES = [
  { value: 'door-door', label: 'Door-to-Door' },
  { value: 'door-airport', label: 'Door-to-Airport' },
  { value: 'airport-door', label: 'Airport-to-Door' },
  { value: 'airport-airport', label: 'Airport-to-Airport' },
]

const INCOTERMS = [
  { value: 'EXW', label: 'EXW - Ex Works' },
  { value: 'FCA', label: 'FCA - Free Carrier' },
  { value: 'CPT', label: 'CPT - Carriage Paid To' },
  { value: 'CIP', label: 'CIP - Carriage and Insurance Paid To' },
  { value: 'DAP', label: 'DAP - Delivered At Place' },
  { value: 'DPU', label: 'DPU - Delivered at Place Unloaded' },
  { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
]

export const NFOPartnerInquiry: FC<NFOPartnerInquiryProps> = ({
  quote,
  suggestedPartners = [],
  onInquirySent,
}) => {
  const toast = useToast()
  const [shipmentType, setShipmentType] = useState('door-door')
  const [incoterms, setIncoterms] = useState('FCA')
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat>('email')
  const [selectedPartners, setSelectedPartners] = useState<Set<string>>(new Set())
  const [generatedTemplate, setGeneratedTemplate] = useState('')
  const [contactPersonName, setContactPersonName] = useState('')

  // Generate template whenever dependencies change
  useEffect(() => {
    generateInquiryTemplate()
  }, [quote, shipmentType, incoterms, selectedFormat, contactPersonName])

  const generateInquiryTemplate = () => {
    const templateData: PartnerInquiryTemplateData = {
      quote,
      departureCountry: quote.origin.country,
      shipmentType: SHIPMENT_TYPES.find(t => t.value === shipmentType)?.label || shipmentType,
      incoterms,
      contactPerson: contactPersonName || undefined,
    }

    const template = quoteTemplateService.generatePartnerInquiryTemplate(templateData, selectedFormat)
    setGeneratedTemplate(template)
  }

  const handleTogglePartner = (partnerId: string) => {
    const newSelected = new Set(selectedPartners)
    if (newSelected.has(partnerId)) {
      newSelected.delete(partnerId)
    } else {
      newSelected.add(partnerId)
    }
    setSelectedPartners(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPartners.size === suggestedPartners.length) {
      setSelectedPartners(new Set())
    } else {
      setSelectedPartners(new Set(suggestedPartners.map(p => p._id)))
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      const success = await quoteTemplateService.copyToClipboard(generatedTemplate)
      if (success) {
        toast.success('Partner inquiry template copied to clipboard!')
      } else {
        toast.error('Failed to copy to clipboard')
      }
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleSendToSelectedPartners = () => {
    if (selectedPartners.size === 0) {
      toast.error('Please select at least one partner')
      return
    }

    const selectedPartnersList = suggestedPartners.filter(p => selectedPartners.has(p._id))

    if (selectedFormat === 'email') {
      // Collect all partner emails
      const emails = selectedPartnersList
        .map(p => p.quotingEmail || p.primaryContact.email)
        .filter(Boolean)
        .join(',')

      if (!emails) {
        toast.error('No email addresses available for selected partners')
        return
      }

      const subject = `NFO Quote Request - ${quote.origin.city} to ${quote.destination.city} - Ref: ${quote.quoteNumber}`
      quoteTemplateService.openEmailClient(emails, subject, generatedTemplate)
      toast.success(`Email client opened with ${selectedPartners.size} recipient(s)`)

    } else {
      // For WhatsApp, open individual chats
      const partnersWithPhone = selectedPartnersList.filter(p => p.primaryContact.email) // Note: In real implementation, you'd have phone numbers

      if (partnersWithPhone.length === 0) {
        toast.error('No WhatsApp contacts available for selected partners')
        return
      }

      toast.info('Opening WhatsApp for each partner. Template copied to clipboard.')
      handleCopyToClipboard()
    }

    onInquirySent?.(Array.from(selectedPartners))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          NFO Partner Inquiry (Step 1)
        </h2>
        <p className="text-gray-600 mt-1">
          Generate and send inquiry requests to partners for quote #{quote.quoteNumber}
        </p>
      </div>

      {/* Inquiry Details */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Inquiry Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Shipment Type</Label>
              <Select value={shipmentType} onValueChange={setShipmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Incoterms</Label>
              <Select value={incoterms} onValueChange={setIncoterms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCOTERMS.map(term => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Contact Person Name (Optional)</Label>
              <Input
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                placeholder="e.g., Dear John"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Suggested Partners */}
      {suggestedPartners.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Suggested Partners ({suggestedPartners.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedPartners.size === suggestedPartners.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="space-y-2">
              {suggestedPartners.map((partner) => {
                const isSelected = selectedPartners.has(partner._id)
                const contactEmail = partner.quotingEmail || partner.primaryContact.email
                const hasContactInfo = !!contactEmail

                return (
                  <div
                    key={partner._id}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTogglePartner(partner._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4"
                          />
                          <h4 className="font-bold text-gray-900">
                            {partner.companyName}
                          </h4>
                          {partner.shortName && (
                            <span className="text-sm text-gray-600">
                              ({partner.shortName})
                            </span>
                          )}
                        </div>

                        <div className="ml-7 space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>👤</span>
                            <span>{partner.primaryContact.name}</span>
                          </div>

                          {contactEmail && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <span>✉️</span>
                              <span>{contactEmail}</span>
                            </div>
                          )}

                          {partner.serviceCoverage.countries.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span>🌍</span>
                              <span>Coverage: {partner.serviceCoverage.countries.slice(0, 3).join(', ')}
                                {partner.serviceCoverage.countries.length > 3 && ` +${partner.serviceCoverage.countries.length - 3} more`}
                              </span>
                            </div>
                          )}

                          {!hasContactInfo && (
                            <div className="text-yellow-600 text-xs">
                              ⚠️ No email address available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
              <strong>{selectedPartners.size}</strong> partner(s) selected
            </div>
          </div>
        </Card>
      )}

      {suggestedPartners.length === 0 && (
        <Alert variant="warning">
          <AlertDescription>
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>
                No partners found for {quote.origin.country}. You can still copy the template and manually send it to your partners.
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Template Format */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Template Format</h3>
            <div className="flex space-x-2">
              <Button
                variant={selectedFormat === 'email' ? 'primary' : 'outline'}
                onClick={() => setSelectedFormat('email')}
                size="sm"
              >
                📧 Email
              </Button>
              <Button
                variant={selectedFormat === 'whatsapp' ? 'primary' : 'outline'}
                onClick={() => setSelectedFormat('whatsapp')}
                size="sm"
              >
                💬 WhatsApp
              </Button>
            </div>
          </div>

          {/* Template Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {generatedTemplate}
            </pre>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={handleCopyToClipboard}
              className="w-full"
            >
              📋 Copy Template to Clipboard
            </Button>

            {suggestedPartners.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSendToSelectedPartners}
                disabled={selectedPartners.size === 0}
                className="w-full"
              >
                {selectedFormat === 'email' ? '📧' : '💬'} Send to Selected Partners ({selectedPartners.size})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Info */}
      <Alert variant="default">
        <AlertDescription>
          <div className="text-sm space-y-2">
            <div>
              <strong>💡 Next Steps:</strong>
            </div>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Review and customize the inquiry template if needed</li>
              <li>Select partners to send the inquiry to</li>
              <li>Send via email or copy to send via WhatsApp</li>
              <li>Wait for partner quotes and proceed to Step 2 (Partner Quote Comparison)</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
