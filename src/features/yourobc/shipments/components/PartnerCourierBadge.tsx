// src/features/yourobc/shipments/components/PartnerCourierBadge.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Plane, Users } from 'lucide-react'

interface PartnerCourierBadgeProps {
  type: 'OBC' | 'NFO'
  name: string
  role?: 'pickup' | 'delivery' | 'customs' | 'general'
}

export const PartnerCourierBadge: FC<PartnerCourierBadgeProps> = ({ type, name, role }) => {
  const isOBC = type === 'OBC'

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isOBC ? 'primary' : 'secondary'}
        className="flex items-center gap-1"
      >
        {isOBC ? (
          <Plane className="h-3 w-3" />
        ) : (
          <Users className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">
          {isOBC ? 'OBC-Kurier' : 'NFO-Partner'}
        </span>
      </Badge>

      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        {role && (
          <span className="text-xs text-muted-foreground capitalize">
            {role}
          </span>
        )}
      </div>
    </div>
  )
}
