// src/features/yourobc/quotes/components/QuoteTemplateDisplay.tsx

import { FC, useState, useEffect } from 'react'
import { Button, Card, Alert, AlertDescription } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import { quoteTemplateService, type QuoteTemplateData, type TemplateFormat } from '../services/QuoteTemplateService'
import type { Quote, Customer } from '@/convex/lib/yourobc'
import type { FlightInfo } from '../services/FlightStatsService'

interface QuoteTemplateDisplayProps {
  quote: Quote
  customer: Customer
  flightInfo?: FlightInfo
  courierName?: string
  partnerName?: string
  onClose?: () => void
}

export const QuoteTemplateDisplay: FC<QuoteTemplateDisplayProps> = ({
  quote,
  customer,
  flightInfo,
  courierName,
  partnerName,
  onClose,
}) => {
  const toast = useToast()
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat>('email')
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('')
  const [isCopying, setIsCopying] = useState(false)

  // Generate template whenever format or data changes
  useEffect(() => {
    generateTemplate()
  }, [selectedFormat, quote, customer, flightInfo, courierName, partnerName])

  const generateTemplate = () => {
    const templateData: QuoteTemplateData = {
      quote,
      customer,
      flightInfo,
      courierName,
      partnerName,
    }

    let template: string
    if (quote.serviceType === 'OBC') {
      template = quoteTemplateService.generateOBCQuoteTemplate(templateData, selectedFormat)
    } else {
      template = quoteTemplateService.generateNFOQuoteTemplate(templateData, selectedFormat)
    }

    setGeneratedTemplate(template)
  }

  const handleCopyToClipboard = async () => {
    setIsCopying(true)
    try {
      const success = await quoteTemplateService.copyToClipboard(generatedTemplate)
      if (success) {
        toast.success('Quote template copied to clipboard!')
      } else {
        toast.error('Failed to copy to clipboard')
      }
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy to clipboard')
    } finally {
      setIsCopying(false)
    }
  }

  const handleSendViaEmail = () => {
    if (!customer.primaryContact.email) {
      toast.error('Customer email not available')
      return
    }

    const subject = `${quote.serviceType} Quote ${quote.quoteNumber} - ${quote.origin.city} to ${quote.destination.city}`
    quoteTemplateService.openEmailClient(customer.primaryContact.email, subject, generatedTemplate)
    toast.success('Email client opened')
  }

  const handleSendViaWhatsApp = () => {
    if (!customer.primaryContact.phone) {
      toast.error('Customer phone number not available')
      return
    }

    quoteTemplateService.openWhatsApp(customer.primaryContact.phone, generatedTemplate)
    toast.success('WhatsApp opened')
  }

  const handleDownloadAsText = () => {
    const blob = new Blob([generatedTemplate], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Quote-${quote.quoteNumber}-${quote.serviceType}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {quote.serviceType} Quote Template
          </h2>
          <p className="text-gray-600 mt-1">
            Quote #{quote.quoteNumber} for {customer.companyName}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Format Selection */}
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

          <Alert variant="default">
            <AlertDescription>
              {selectedFormat === 'email'
                ? 'Email format includes subject line and formal formatting suitable for business email.'
                : 'WhatsApp format is optimized for messaging apps with emoji and concise formatting.'
              }
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      {/* Template Preview */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
            <div className="text-sm text-gray-600">
              {generatedTemplate.length} characters
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-y-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Copy to Clipboard */}
            <Button
              variant="primary"
              onClick={handleCopyToClipboard}
              disabled={isCopying}
              className="w-full"
            >
              {isCopying ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Copying...
                </>
              ) : (
                <>
                  📋 Copy to Clipboard
                </>
              )}
            </Button>

            {/* Send via Email */}
            <Button
              variant="outline"
              onClick={handleSendViaEmail}
              disabled={!customer.primaryContact.email}
              className="w-full"
            >
              📧 Open Email
            </Button>

            {/* Send via WhatsApp */}
            <Button
              variant="outline"
              onClick={handleSendViaWhatsApp}
              disabled={!customer.primaryContact.phone}
              className="w-full"
            >
              💬 Open WhatsApp
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              onClick={handleDownloadAsText}
              className="w-full"
            >
              💾 Download
            </Button>
          </div>

          {/* Info Messages */}
          <div className="mt-4 space-y-2">
            {!customer.primaryContact.email && (
              <Alert variant="warning">
                <AlertDescription>
                  <div className="text-sm">
                    ⚠️ Customer email not available. Add email to customer profile to send via email.
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {!customer.primaryContact.phone && (
              <Alert variant="warning">
                <AlertDescription>
                  <div className="text-sm">
                    ⚠️ Customer phone not available. Add phone to customer profile to send via WhatsApp.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Copy to Clipboard:</strong> Quick way to paste the quote into any application
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Email:</strong> Opens your default email client with pre-filled content
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>WhatsApp:</strong> Opens WhatsApp Web or app with the message ready to send
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Download:</strong> Save as text file for your records or further editing
              </span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
