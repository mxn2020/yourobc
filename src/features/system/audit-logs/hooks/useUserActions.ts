// src/features/boilerplate/audit-logs/hooks/useUserActions.ts

import { useAuth } from '@/features/boilerplate/auth'
import { AuditLogHelpers, useMyAuditLogs } from '@/features/boilerplate/audit-logs'

export function useUserActions() {
    const { createAuditLog } = useMyAuditLogs()
    const { user } = useAuth()

    if (!user) {
        throw new Error('Audit logs access requires proper permissions')
    }

    const logUserUpdate = async (updatedFields: string[]) => {
        const logData = AuditLogHelpers.createUserActionLog(
            'user.updated',
            `User updated profile fields: ${updatedFields.join(', ')}`
        )

        await createAuditLog(logData)
    }

    const logRoleChange = async (oldRole: string, newRole: string) => {
        const logData = AuditLogHelpers.createUserActionLog(
            'user.role_changed',
            `Role changed from ${oldRole} to ${newRole}`
        )

        await createAuditLog(logData)
    }

    return { logUserUpdate, logRoleChange }
}

