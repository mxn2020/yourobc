import { onlineManager } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useToast } from '@/features/system/notifications'

export function useOfflineIndicator() {
  const toast = useToast()
  useEffect(() => {
    return onlineManager.subscribe(() => {
      if (onlineManager.isOnline()) {
        toast.success('You are back online', 'Online')
      } else {
        toast.error('You are offline', 'Offline')
      }
    })
  }, [toast])
}
