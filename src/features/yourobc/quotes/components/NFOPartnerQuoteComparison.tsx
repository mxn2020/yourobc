// src/features/yourobc/quotes/components/NFOPartnerQuoteComparison.tsx

import { FC, useState } from 'react'
import { Button, Card, Input, Label, Badge, Alert, AlertDescription, Textarea } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import type { Quote, PartnerId } from '@/convex/lib/yourobc'
import type { PartnerQuote } from '../types'

interface NFOPartnerQuoteComparisonProps {
  quote: Quote
  existingPartnerQuotes?: PartnerQuote[]
  availablePartners?: Array<{
    _id: string
    companyName: string
    shortName?: string
  }>
  onSavePartnerQuotes?: (partnerQuotes: PartnerQuote[], selectedPartnerIds: string[]) => void
  onSelectForCustomer?: (partnerQuotes: PartnerQuote[]) => void
}

interface PartnerQuoteFormData {
  id?: string // Temporary ID for UI tracking
  partnerId: PartnerId
  partnerName: string
  quotedPrice: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
  }
  transitTime?: number
  validUntil?: number
  receivedAt?: number // Make optional for new quotes (will be set on save)
  notes?: string
  isSelected?: boolean
}

export const NFOPartnerQuoteComparison: FC<NFOPartnerQuoteComparisonProps> = ({
  quote,
  existingPartnerQuotes = [],
  availablePartners = [],
  onSavePartnerQuotes,
  onSelectForCustomer,
}) => {
  const toast = useToast()
  const [partnerQuotes, setPartnerQuotes] = useState<PartnerQuoteFormData[]>(
    existingPartnerQuotes.map((pq, idx) => ({ ...pq, id: `existing-${idx}` }))
  )
  const [selectedForCustomer, setSelectedForCustomer] = useState<Set<string>>(
    new Set(existingPartnerQuotes.filter(pq => pq.isSelected).map((_, idx) => `existing-${idx}`))
  )
  const [newQuoteForm, setNewQuoteForm] = useState<Partial<PartnerQuoteFormData>>({
    quotedPrice: {
      amount: 0,
      currency: quote.baseCost?.currency || 'EUR',
    },
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddPartnerQuote = () => {
    if (!newQuoteForm.partnerId || !newQuoteForm.partnerName || !newQuoteForm.quotedPrice?.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    const newQuote: PartnerQuoteFormData = {
      id: `new-${Date.now()}`,
      partnerId: newQuoteForm.partnerId!,
      partnerName: newQuoteForm.partnerName!,
      quotedPrice: newQuoteForm.quotedPrice!,
      transitTime: newQuoteForm.transitTime,
      validUntil: newQuoteForm.validUntil,
      receivedAt: Date.now(),
      notes: newQuoteForm.notes,
      isSelected: false,
    }

    setPartnerQuotes([...partnerQuotes, newQuote])
    setNewQuoteForm({
      quotedPrice: {
        amount: 0,
        currency: quote.baseCost?.currency || 'EUR',
      },
    })
    setShowAddForm(false)
    toast.success(`Added quote from ${newQuote.partnerName}`)
  }

  const handleToggleSelection = (quoteId: string) => {
    const newSelected = new Set(selectedForCustomer)
    if (newSelected.has(quoteId)) {
      newSelected.delete(quoteId)
    } else {
      // Limit to 2 selections as per requirements
      if (newSelected.size >= 2) {
        toast.warning('You can select maximum 2 partner quotes for the customer')
        return
      }
      newSelected.add(quoteId)
    }
    setSelectedForCustomer(newSelected)
  }

  const handleRemoveQuote = (quoteId: string) => {
    setPartnerQuotes(partnerQuotes.filter(pq => pq.id !== quoteId))
    const newSelected = new Set(selectedForCustomer)
    newSelected.delete(quoteId)
    setSelectedForCustomer(newSelected)
    toast.success('Partner quote removed')
  }

  const handleSave = () => {
    const quotesToSave: PartnerQuote[] = partnerQuotes.map(pq => ({
      partnerId: pq.partnerId,
      partnerName: pq.partnerName,
      quotedPrice: pq.quotedPrice,
      transitTime: pq.transitTime,
      validUntil: pq.validUntil,
      receivedAt: pq.receivedAt || Date.now(),
      notes: pq.notes,
      isSelected: selectedForCustomer.has(pq.id!),
    }))

    const selectedPartnerIds = partnerQuotes
      .filter(pq => selectedForCustomer.has(pq.id!))
      .map(pq => pq.partnerId)

    onSavePartnerQuotes?.(quotesToSave, selectedPartnerIds)
    toast.success(`Saved ${quotesToSave.length} partner quote(s), ${selectedForCustomer.size} selected for customer`)
  }

  const handleCreateCustomerQuote = () => {
    const selectedQuotes = partnerQuotes.filter(pq => selectedForCustomer.has(pq.id!))

    if (selectedQuotes.length === 0) {
      toast.error('Please select at least one partner quote')
      return
    }

    onSelectForCustomer?.(selectedQuotes.map(pq => ({
      partnerId: pq.partnerId,
      partnerName: pq.partnerName,
      quotedPrice: pq.quotedPrice,
      transitTime: pq.transitTime,
      validUntil: pq.validUntil,
      receivedAt: pq.receivedAt || Date.now(),
      notes: pq.notes,
      isSelected: true,
    })))

    toast.success(`Selected ${selectedQuotes.length} quote(s) for customer quote`)
  }

  // Calculate statistics
  const lowestQuote = partnerQuotes.length > 0
    ? partnerQuotes.reduce((min, pq) => pq.quotedPrice.amount < min.quotedPrice.amount ? pq : min)
    : null

  const highestQuote = partnerQuotes.length > 0
    ? partnerQuotes.reduce((max, pq) => pq.quotedPrice.amount > max.quotedPrice.amount ? pq : max)
    : null

  const averagePrice = partnerQuotes.length > 0
    ? partnerQuotes.reduce((sum, pq) => sum + pq.quotedPrice.amount, 0) / partnerQuotes.length
    : 0

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : '$'
    return `${symbol}${amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          NFO Partner Quote Comparison (Step 2)
        </h2>
        <p className="text-gray-600 mt-1">
          Compare partner quotes and select the best option(s) for customer quote #{quote.quoteNumber}
        </p>
      </div>

      {/* Statistics */}
      {partnerQuotes.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📊 Quote Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Quotes</div>
                <div className="text-2xl font-bold text-blue-900">{partnerQuotes.length}</div>
              </div>

              <div>
                <div className="text-sm text-green-600 font-medium">Lowest Price</div>
                <div className="text-2xl font-bold text-green-700">
                  {lowestQuote ? formatCurrency(lowestQuote.quotedPrice.amount, lowestQuote.quotedPrice.currency) : 'N/A'}
                </div>
                {lowestQuote && (
                  <div className="text-xs text-green-600 mt-1">{lowestQuote.partnerName}</div>
                )}
              </div>

              <div>
                <div className="text-sm text-red-600 font-medium">Highest Price</div>
                <div className="text-2xl font-bold text-red-700">
                  {highestQuote ? formatCurrency(highestQuote.quotedPrice.amount, highestQuote.quotedPrice.currency) : 'N/A'}
                </div>
                {highestQuote && (
                  <div className="text-xs text-red-600 mt-1">{highestQuote.partnerName}</div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-600 font-medium">Average Price</div>
                <div className="text-2xl font-bold text-gray-900">
                  {averagePrice > 0 ? formatCurrency(averagePrice, quote.baseCost?.currency || 'EUR') : 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded border border-blue-300 text-sm">
              <strong className="text-blue-900">{selectedForCustomer.size}</strong> quote(s) selected for customer
              {selectedForCustomer.size >= 2 && (
                <span className="text-blue-600"> (Maximum reached)</span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Partner Quotes List */}
      {partnerQuotes.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Partner Quotes ({partnerQuotes.length})
            </h3>

            <div className="space-y-3">
              {partnerQuotes
                .sort((a, b) => a.quotedPrice.amount - b.quotedPrice.amount) // Sort by price (lowest first)
                .map((partnerQuote, index) => {
                  const isSelected = selectedForCustomer.has(partnerQuote.id!)
                  const isLowest = lowestQuote?.id === partnerQuote.id
                  const isHighest = highestQuote?.id === partnerQuote.id

                  return (
                    <div
                      key={partnerQuote.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : isLowest
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelection(partnerQuote.id!)}
                              className="w-4 h-4"
                            />
                            <h4 className="font-bold text-gray-900">
                              {partnerQuote.partnerName}
                            </h4>
                            {isLowest && (
                              <Badge variant="success">🏆 Lowest Price</Badge>
                            )}
                            {isHighest && partnerQuotes.length > 1 && (
                              <Badge variant="danger">Highest Price</Badge>
                            )}
                            {isSelected && (
                              <Badge variant="primary">✓ Selected for Customer</Badge>
                            )}
                          </div>

                          {/* Quote Details */}
                          <div className="ml-7 grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-gray-600">Quoted Price</div>
                              <div className="text-lg font-bold text-gray-900">
                                {formatCurrency(partnerQuote.quotedPrice.amount, partnerQuote.quotedPrice.currency)}
                              </div>
                            </div>

                            {partnerQuote.transitTime && (
                              <div>
                                <div className="text-xs text-gray-600">Transit Time</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {partnerQuote.transitTime} hours
                                </div>
                              </div>
                            )}

                            {partnerQuote.validUntil && (
                              <div>
                                <div className="text-xs text-gray-600">Valid Until</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(partnerQuote.validUntil)}
                                </div>
                              </div>
                            )}

                            <div>
                              <div className="text-xs text-gray-600">Received</div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(partnerQuote.receivedAt)}
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {partnerQuote.notes && (
                            <div className="ml-7 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              <strong>Notes:</strong> {partnerQuote.notes}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="ml-4 flex gap-2">
                          <Button
                            variant={isSelected ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleToggleSelection(partnerQuote.id!)}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveQuote(partnerQuote.id!)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </Card>
      )}

      {/* Add New Partner Quote */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Add Partner Quote
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Quote'}
            </Button>
          </div>

          {showAddForm && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label required>Partner</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newQuoteForm.partnerId || ''}
                    onChange={(e) => {
                      const selectedPartner = availablePartners.find(p => p._id === e.target.value)
                      setNewQuoteForm({
                        ...newQuoteForm,
                        partnerId: e.target.value as PartnerId,
                        partnerName: selectedPartner?.companyName || '',
                      })
                    }}
                  >
                    <option value="">Select partner...</option>
                    {availablePartners.map(partner => (
                      <option key={partner._id} value={partner._id}>
                        {partner.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label required>Quoted Price</Label>
                  <div className="flex gap-2">
                    <select
                      className="w-24 p-2 border rounded"
                      value={newQuoteForm.quotedPrice?.currency || 'EUR'}
                      onChange={(e) => setNewQuoteForm({
                        ...newQuoteForm,
                        quotedPrice: {
                          ...newQuoteForm.quotedPrice!,
                          currency: e.target.value as 'EUR' | 'USD',
                        },
                      })}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newQuoteForm.quotedPrice?.amount || ''}
                      onChange={(e) => setNewQuoteForm({
                        ...newQuoteForm,
                        quotedPrice: {
                          ...newQuoteForm.quotedPrice!,
                          amount: parseFloat(e.target.value) || 0,
                        },
                      })}
                      placeholder="0.00"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Transit Time (hours)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newQuoteForm.transitTime || ''}
                    onChange={(e) => setNewQuoteForm({
                      ...newQuoteForm,
                      transitTime: parseInt(e.target.value) || undefined,
                    })}
                    placeholder="e.g., 24"
                  />
                </div>

                <div>
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={newQuoteForm.validUntil ? new Date(newQuoteForm.validUntil).toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewQuoteForm({
                      ...newQuoteForm,
                      validUntil: new Date(e.target.value).getTime(),
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newQuoteForm.notes || ''}
                    onChange={(e) => setNewQuoteForm({
                      ...newQuoteForm,
                      notes: e.target.value,
                    })}
                    placeholder="Any special conditions or notes..."
                    rows={2}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleAddPartnerQuote}
              >
                Add Partner Quote
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={partnerQuotes.length === 0}
              className="w-full"
            >
              💾 Save Partner Quotes
            </Button>

            <Button
              variant="primary"
              onClick={handleCreateCustomerQuote}
              disabled={selectedForCustomer.size === 0}
              className="w-full"
            >
              ✓ Create Customer Quote ({selectedForCustomer.size} selected)
            </Button>
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
              <li>Enter all partner quotes you received from Step 1</li>
              <li>Compare prices and select the best 1-2 options for your customer</li>
              <li>Save the partner quotes for record keeping</li>
              <li>Create customer quote with the selected partner quote(s)</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
