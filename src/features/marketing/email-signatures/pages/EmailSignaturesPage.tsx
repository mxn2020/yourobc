// src/features/marketing/email-signatures/pages/EmailSignaturesPage.tsx

import { FC, useState } from 'react'
import { Button, Input, EmptyState, Card } from '@/components/ui'
import { Plus, Search, Mail } from 'lucide-react'
import { useSignatures } from '../hooks/useSignatures'
import type { EmailSignature } from '../types'

export const EmailSignaturesPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: signaturesData } = useSignatures({ limit: 100 })

  const filteredSignatures = (signaturesData?.signatures || []).filter((sig: EmailSignature) =>
    sig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sig.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Mail className="h-8 w-8 text-green-600" />
              Email Signature Generator
            </h1>
            <p className="text-gray-600 mt-2">
              Create professional email signatures for your team
            </p>
          </div>
          <Button onClick={() => console.log('Create signature')} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Signature
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search signatures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredSignatures && filteredSignatures.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSignatures.map((sig: EmailSignature) => (
            <Card key={sig._id} className="p-6">
              <h3 className="text-lg font-semibold mb-2">{sig.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{sig.fullName}</p>
              {sig.jobTitle && <p className="text-sm text-gray-500">{sig.jobTitle}</p>}
              {sig.company && <p className="text-sm text-gray-500">{sig.company}</p>}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Mail}
          title="No signatures found"
          description={searchTerm ? 'Try adjusting your search' : 'Create your first email signature'}
          action={!searchTerm ? {
            label: 'Create Signature',
            onClick: () => console.log('Create'),
            icon: Plus,
          } : undefined}
        />
      )}
    </div>
  )
}
