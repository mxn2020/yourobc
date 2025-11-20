// src/features/yourobc/quotes/services/QuoteTemplateService.ts

import type { Quote, Customer } from '@/convex/lib/yourobc'
import type { FlightInfo } from './FlightStatsService'

/**
 * Quote Template Service
 *
 * Generates formatted quote templates for email and WhatsApp messaging
 * Supports both OBC and NFO quote types with different templates
 */

export interface QuoteTemplateData {
  quote: Quote
  customer: Customer
  flightInfo?: FlightInfo
  courierName?: string
  partnerName?: string
  additionalNotes?: string
}

export interface PartnerInquiryTemplateData {
  quote: Quote
  departureCountry: string
  shipmentType: string
  incoterms?: string
  contactPerson?: string
}

export type TemplateFormat = 'email' | 'whatsapp'

class QuoteTemplateService {
  /**
   * Generate OBC Quote Template
   */
  generateOBCQuoteTemplate(data: QuoteTemplateData, format: TemplateFormat = 'email'): string {
    const { quote, customer, flightInfo, courierName } = data

    const isWhatsApp = format === 'whatsapp'
    const newLine = isWhatsApp ? '\n' : '\n'
    const bold = (text: string) => isWhatsApp ? `*${text}*` : text
    const divider = isWhatsApp ? '─'.repeat(30) : '═'.repeat(50)

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const formatCurrency = (amount: number, currency: string) => {
      const symbol = currency === 'EUR' ? '€' : '$'
      return `${symbol}${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    let template = ''

    // Header
    if (!isWhatsApp) {
      template += `Subject: OBC Quote ${quote.quoteNumber} - ${quote.origin.city} to ${quote.destination.city}${newLine}${newLine}`
    }

    template += `${bold('On Board Courier (OBC) Quote')}${newLine}`
    template += `${divider}${newLine}${newLine}`

    // Quote Details
    template += `${bold('Quote Number:')} ${quote.quoteNumber}${newLine}`
    template += `${bold('Date:')} ${formatDate(quote.createdAt)}${newLine}`
    template += `${bold('Valid Until:')} ${formatDate(quote.validUntil)}${newLine}`
    if (quote.customerReference) {
      template += `${bold('Your Reference:')} ${quote.customerReference}${newLine}`
    }
    template += `${newLine}`

    // Customer Details
    template += `${bold('Customer:')} ${customer.companyName}${newLine}`
    if (customer.primaryContact.name) {
      template += `${bold('Contact:')} ${customer.primaryContact.name}${newLine}`
    }
    template += `${newLine}`

    // Routing Information
    template += `${bold('ROUTING INFORMATION')}${newLine}`
    template += `${divider}${newLine}`
    template += `${bold('Origin:')} ${quote.origin.city}, ${quote.origin.country}${newLine}`
    if (quote.origin.street) {
      template += `  ${quote.origin.street}${newLine}`
    }
    template += `${bold('Destination:')} ${quote.destination.city}, ${quote.destination.country}${newLine}`
    if (quote.destination.street) {
      template += `  ${quote.destination.street}${newLine}`
    }
    template += `${bold('Delivery Deadline:')} ${formatDate(quote.deadline)}${newLine}`
    template += `${newLine}`

    // Flight Information (if available)
    if (flightInfo) {
      template += `${bold('FLIGHT INFORMATION')}${newLine}`
      template += `${divider}${newLine}`
      template += `${bold('Flight:')} ${flightInfo.flightNumber} (${flightInfo.airline})${newLine}`
      template += `${bold('Departure:')} ${new Date(flightInfo.departure.scheduled).toLocaleString('de-DE')}${newLine}`
      if (flightInfo.departure.terminal) {
        template += `  Terminal ${flightInfo.departure.terminal}${flightInfo.departure.gate ? `, Gate ${flightInfo.departure.gate}` : ''}${newLine}`
      }
      template += `${bold('Arrival:')} ${new Date(flightInfo.arrival.scheduled).toLocaleString('de-DE')}${newLine}`
      if (flightInfo.arrival.terminal) {
        template += `  Terminal ${flightInfo.arrival.terminal}${flightInfo.arrival.gate ? `, Gate ${flightInfo.arrival.gate}` : ''}${newLine}`
      }
      if (flightInfo.aircraft) {
        template += `${bold('Aircraft:')} ${flightInfo.aircraft.type}${newLine}`
      }
      template += `${newLine}`
    }

    // Shipment Details
    template += `${bold('SHIPMENT DETAILS')}${newLine}`
    template += `${divider}${newLine}`
    template += `${bold('Description:')} ${quote.description}${newLine}`
    template += `${bold('Dimensions:')} ${quote.dimensions.length} x ${quote.dimensions.width} x ${quote.dimensions.height} ${quote.dimensions.unit}${newLine}`
    template += `${bold('Weight:')} ${quote.dimensions.weight} ${quote.dimensions.weightUnit}${newLine}`
    if (quote.specialInstructions) {
      template += `${bold('Special Instructions:')} ${quote.specialInstructions}${newLine}`
    }
    if (courierName) {
      template += `${bold('Assigned Courier:')} ${courierName}${newLine}`
    }
    template += `${newLine}`

    // Pricing
    template += `${bold('PRICING')}${newLine}`
    template += `${divider}${newLine}`
    if (quote.baseCost) {
      template += `Base Cost: ${formatCurrency(quote.baseCost.amount, quote.baseCost.currency)}${newLine}`
      if (quote.markup) {
        template += `Markup: ${quote.markup}%${newLine}`
      }
    }
    if (quote.totalPrice) {
      template += `${newLine}${bold('TOTAL PRICE: ' + formatCurrency(quote.totalPrice.amount, quote.totalPrice.currency))}${newLine}`
    }
    template += `${newLine}`

    // Terms & Conditions
    template += `${bold('TERMS & CONDITIONS')}${newLine}`
    template += `${divider}${newLine}`
    template += `• Payment Terms: ${customer.paymentTerms} days${newLine}`
    template += `• Quote valid until: ${formatDate(quote.validUntil)}${newLine}`
    template += `• Prices include door-to-door courier service${newLine}`
    template += `• All times are local time zones${newLine}`
    template += `• Final routing subject to confirmation${newLine}`
    template += `${newLine}`

    // Custom Quote Text (if provided)
    if (quote.quoteText) {
      template += `${bold('ADDITIONAL INFORMATION')}${newLine}`
      template += `${divider}${newLine}`
      template += `${quote.quoteText}${newLine}`
      template += `${newLine}`
    }

    // Footer
    if (!isWhatsApp) {
      template += `${newLine}${divider}${newLine}`
      template += `Thank you for your inquiry!${newLine}${newLine}`
      template += `For any questions or to accept this quote, please contact us.${newLine}${newLine}`
      template += `Best regards,${newLine}`
      template += `Your Logistics Team${newLine}`
    } else {
      template += `${newLine}Please let us know if you have any questions or would like to proceed with this quote. 👍${newLine}`
    }

    return template
  }

  /**
   * Generate NFO Quote Template
   */
  generateNFOQuoteTemplate(data: QuoteTemplateData, format: TemplateFormat = 'email'): string {
    const { quote, customer, partnerName } = data

    const isWhatsApp = format === 'whatsapp'
    const newLine = isWhatsApp ? '\n' : '\n'
    const bold = (text: string) => isWhatsApp ? `*${text}*` : text
    const divider = isWhatsApp ? '─'.repeat(30) : '═'.repeat(50)

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const formatCurrency = (amount: number, currency: string) => {
      const symbol = currency === 'EUR' ? '€' : '$'
      return `${symbol}${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    let template = ''

    // Header
    if (!isWhatsApp) {
      template += `Subject: NFO Quote ${quote.quoteNumber} - ${quote.origin.city} to ${quote.destination.city}${newLine}${newLine}`
    }

    template += `${bold('Next Flight Out (NFO) Quote')}${newLine}`
    template += `${divider}${newLine}${newLine}`

    // Quote Details
    template += `${bold('Quote Number:')} ${quote.quoteNumber}${newLine}`
    template += `${bold('Date:')} ${formatDate(quote.createdAt)}${newLine}`
    template += `${bold('Valid Until:')} ${formatDate(quote.validUntil)}${newLine}`
    if (quote.customerReference) {
      template += `${bold('Your Reference:')} ${quote.customerReference}${newLine}`
    }
    template += `${newLine}`

    // Customer Details
    template += `${bold('Customer:')} ${customer.companyName}${newLine}`
    if (customer.primaryContact.name) {
      template += `${bold('Contact:')} ${customer.primaryContact.name}${newLine}`
    }
    template += `${newLine}`

    // Routing Information
    template += `${bold('ROUTING INFORMATION')}${newLine}`
    template += `${divider}${newLine}`
    template += `${bold('Origin:')} ${quote.origin.city}, ${quote.origin.country}${newLine}`
    if (quote.origin.street) {
      template += `  ${quote.origin.street}${newLine}`
    }
    template += `${bold('Destination:')} ${quote.destination.city}, ${quote.destination.country}${newLine}`
    if (quote.destination.street) {
      template += `  ${quote.destination.street}${newLine}`
    }
    template += `${bold('Required by:')} ${formatDate(quote.deadline)}${newLine}`
    template += `${newLine}`

    // Shipment Details
    template += `${bold('SHIPMENT DETAILS')}${newLine}`
    template += `${divider}${newLine}`
    template += `${bold('Description:')} ${quote.description}${newLine}`
    template += `${bold('Dimensions:')} ${quote.dimensions.length} x ${quote.dimensions.width} x ${quote.dimensions.height} ${quote.dimensions.unit}${newLine}`
    template += `${bold('Weight:')} ${quote.dimensions.weight} ${quote.dimensions.weightUnit}${newLine}`
    if (quote.specialInstructions) {
      template += `${bold('Special Instructions:')} ${quote.specialInstructions}${newLine}`
    }
    template += `${newLine}`

    // Partner Information (if available)
    if (partnerName) {
      template += `${bold('SERVICE PROVIDER')}${newLine}`
      template += `${divider}${newLine}`
      template += `${bold('Partner:')} ${partnerName}${newLine}`
      template += `${newLine}`
    }

    // Pricing
    template += `${bold('PRICING')}${newLine}`
    template += `${divider}${newLine}`
    if (quote.baseCost) {
      template += `Service Cost: ${formatCurrency(quote.baseCost.amount, quote.baseCost.currency)}${newLine}`
    }
    if (quote.totalPrice) {
      template += `${newLine}${bold('TOTAL PRICE: ' + formatCurrency(quote.totalPrice.amount, quote.totalPrice.currency))}${newLine}`
    }
    template += `${newLine}`

    // Service Details
    template += `${bold('SERVICE DETAILS')}${newLine}`
    template += `${divider}${newLine}`
    template += `• Next available flight service${newLine}`
    template += `• Airport to airport delivery${newLine}`
    template += `• Expedited customs clearance${newLine}`
    template += `• Door delivery available upon request${newLine}`
    template += `${newLine}`

    // Terms & Conditions
    template += `${bold('TERMS & CONDITIONS')}${newLine}`
    template += `${divider}${newLine}`
    template += `• Payment Terms: ${customer.paymentTerms} days${newLine}`
    template += `• Quote valid until: ${formatDate(quote.validUntil)}${newLine}`
    template += `• Flight schedule subject to availability${newLine}`
    template += `• Additional fees may apply for special handling${newLine}`
    template += `${newLine}`

    // Custom Quote Text (if provided)
    if (quote.quoteText) {
      template += `${bold('ADDITIONAL INFORMATION')}${newLine}`
      template += `${divider}${newLine}`
      template += `${quote.quoteText}${newLine}`
      template += `${newLine}`
    }

    // Footer
    if (!isWhatsApp) {
      template += `${newLine}${divider}${newLine}`
      template += `Thank you for your inquiry!${newLine}${newLine}`
      template += `For any questions or to accept this quote, please contact us.${newLine}${newLine}`
      template += `Best regards,${newLine}`
      template += `Your Logistics Team${newLine}`
    } else {
      template += `${newLine}Please let us know if you have any questions or would like to proceed with this quote. ✈️${newLine}`
    }

    return template
  }

  /**
   * Generate Partner Inquiry Template (for NFO Step 1)
   */
  generatePartnerInquiryTemplate(data: PartnerInquiryTemplateData, format: TemplateFormat = 'email'): string {
    const { quote, departureCountry, shipmentType, incoterms, contactPerson } = data

    const isWhatsApp = format === 'whatsapp'
    const newLine = isWhatsApp ? '\n' : '\n'
    const bold = (text: string) => isWhatsApp ? `*${text}*` : text
    const divider = isWhatsApp ? '─'.repeat(30) : '═'.repeat(50)

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    let template = ''

    // Header
    if (!isWhatsApp) {
      template += `Subject: NFO Quote Request - ${quote.origin.city} to ${quote.destination.city} - Ref: ${quote.quoteNumber}${newLine}${newLine}`
      if (contactPerson) {
        template += `Dear ${contactPerson},${newLine}${newLine}`
      } else {
        template += `Dear Partner,${newLine}${newLine}`
      }
      template += `We kindly request a quote for the following Next Flight Out (NFO) shipment:${newLine}${newLine}`
    } else {
      template += `${bold('NFO Quote Request')}${newLine}`
      template += `${divider}${newLine}${newLine}`
    }

    // Reference Information
    template += `${bold('REFERENCE INFORMATION')}${newLine}`
    template += `${divider}${newLine}`
    template += `${bold('Quote Reference:')} ${quote.quoteNumber}${newLine}`
    template += `${bold('Date:')} ${formatDate(Date.now())}${newLine}`
    template += `${bold('Required by:')} ${formatDate(quote.deadline)}${newLine}`
    if (quote.customerReference) {
      template += `${bold('Customer Reference:')} ${quote.customerReference}${newLine}`
    }
    template += `${newLine}`

    // Routing Details
    template += `${bold('ROUTING DETAILS')}${newLine}`
    template += `${divider}${newLine}`
    template += `${bold('Pickup Location:')}${newLine}`
    template += `  ${quote.origin.city}, ${quote.origin.postalCode || ''}${newLine}`
    template += `  ${quote.origin.country}${newLine}`
    if (quote.origin.street) {
      template += `  ${quote.origin.street}${newLine}`
    }
    template += `${newLine}`
    template += `${bold('Delivery Location:')}${newLine}`
    template += `  ${quote.destination.city}, ${quote.destination.postalCode || ''}${newLine}`
    template += `  ${quote.destination.country}${newLine}`
    if (quote.destination.street) {
      template += `  ${quote.destination.street}${newLine}`
    }
    template += `${newLine}`

    // Shipment Details
    template += `${bold('SHIPMENT DETAILS')}${newLine}`
    template += `${divider}${newLine}`
    template += `${bold('Description:')} ${quote.description}${newLine}`
    template += `${bold('Dimensions:')} ${quote.dimensions.length} x ${quote.dimensions.width} x ${quote.dimensions.height} ${quote.dimensions.unit}${newLine}`
    template += `${bold('Weight:')} ${quote.dimensions.weight} ${quote.dimensions.weightUnit}${newLine}`
    template += `${bold('Shipment Type:')} ${shipmentType || 'Door-to-Door'}${newLine}`
    if (incoterms) {
      template += `${bold('Incoterms:')} ${incoterms}${newLine}`
    }
    template += `${bold('Deadline:')} ${formatDate(quote.deadline)}${newLine}`
    if (quote.specialInstructions) {
      template += `${bold('Special Instructions:')} ${quote.specialInstructions}${newLine}`
    }
    template += `${newLine}`

    // Requirements
    template += `${bold('QUOTE REQUIREMENTS')}${newLine}`
    template += `${divider}${newLine}`
    template += `Please provide the following information:${newLine}`
    template += `• Total cost (including all fees)${newLine}`
    template += `• Proposed flight/routing${newLine}`
    template += `• Transit time${newLine}`
    template += `• Latest acceptance time for pickup${newLine}`
    template += `• Any special conditions or restrictions${newLine}`
    template += `${newLine}`

    // Footer
    if (!isWhatsApp) {
      template += `We would appreciate your quote by ${formatDate(Date.now() + (24 * 60 * 60 * 1000))}.${newLine}${newLine}`
      template += `Thank you for your cooperation.${newLine}${newLine}`
      template += `Best regards,${newLine}`
      template += `Logistics Team${newLine}`
    } else {
      template += `Please send your best quote as soon as possible. Thank you! 🙏${newLine}`
    }

    return template
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for older browsers or non-HTTPS contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const result = document.execCommand('copy')
        textArea.remove()
        return result
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  /**
   * Generate shareable WhatsApp link
   */
  generateWhatsAppLink(phoneNumber: string, message: string): string {
    // Remove all non-numeric characters from phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '')

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)

    // Return WhatsApp link
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
  }

  /**
   * Open WhatsApp with pre-filled message
   */
  openWhatsApp(phoneNumber: string, message: string): void {
    const link = this.generateWhatsAppLink(phoneNumber, message)
    window.open(link, '_blank')
  }

  /**
   * Generate mailto link with pre-filled content
   */
  generateMailtoLink(email: string, subject: string, body: string): string {
    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)
    return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`
  }

  /**
   * Open email client with pre-filled content
   */
  openEmailClient(email: string, subject: string, body: string): void {
    const link = this.generateMailtoLink(email, subject, body)
    window.location.href = link
  }
}

// Export singleton instance
export const quoteTemplateService = new QuoteTemplateService()
