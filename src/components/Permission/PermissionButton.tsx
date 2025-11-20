import { Button } from '@/components/ui/Button'
import type { ComponentProps } from 'react'
import { Tooltip } from '@/components/ui/Tooltip'
import { ReactNode } from 'react'

type ButtonProps = ComponentProps<typeof Button>

interface PermissionButtonProps extends Omit<ButtonProps, 'disabled'> {
  /**
   * Whether the user has permission to perform this action
   */
  hasPermission: boolean

  /**
   * Description of the action for tooltip messages
   * Example: "edit this project", "delete tasks", "manage team"
   */
  action?: string

  /**
   * Custom message to show when permission is denied
   * If not provided, a default message will be generated from the action
   */
  deniedMessage?: string

  /**
   * Additional disabled state (unrelated to permissions)
   * Example: loading state, validation errors
   */
  isDisabled?: boolean

  children: ReactNode
}

export function PermissionButton({
  hasPermission,
  action,
  deniedMessage,
  isDisabled = false,
  children,
  onClick,
  ...buttonProps
}: PermissionButtonProps) {
  const isButtonDisabled = !hasPermission || isDisabled

  // Generate tooltip message
  const tooltipMessage = !hasPermission
    ? deniedMessage || `You don't have permission to ${action || 'perform this action'}`
    : undefined

  const button = (
    <Button
      {...buttonProps}
      disabled={isButtonDisabled}
      onClick={hasPermission ? onClick : undefined}
    >
      {children}
    </Button>
  )

  // Only wrap in tooltip if there's a message to show
  if (tooltipMessage) {
    return (
      <Tooltip content={tooltipMessage}>
        {button}
      </Tooltip>
    )
  }

  return button
}
