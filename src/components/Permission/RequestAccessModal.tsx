import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { AlertCircle, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/Alert'

interface RequestAccessModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean

  /**
   * Callback when modal is closed
   */
  onClose: () => void

  /**
   * Callback when access is requested
   * Receives the optional message from the user
   */
  onRequestAccess: (message?: string) => Promise<void> | void

  /**
   * The project name (for display)
   */
  projectName?: string

  /**
   * Custom title for the modal
   */
  title?: string

  /**
   * Custom description for the modal
   */
  description?: string
}

export function RequestAccessModal({
  open,
  onClose,
  onRequestAccess,
  projectName,
  title = 'Request Access',
  description,
}: RequestAccessModalProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await onRequestAccess(message)
      setMessage('') // Clear message on success
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to send access request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {description ||
              `Request access to ${projectName ? `"${projectName}"` : 'this project'}. The project owner will be notified of your request.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="access-message">
              Message (Optional)
            </Label>
            <Textarea
              id="access-message"
              placeholder="Explain why you need access to this project..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent to the project owner
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Request Access'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
