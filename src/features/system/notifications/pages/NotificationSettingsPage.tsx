// src/features/notifications/pages/NotificationSettingsPage.tsx
import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui'
import { Switch } from '@/components/ui'
import { Button } from '@/components/ui'
import { Bell, Mail, Globe, Save } from 'lucide-react'
import { useNotificationSettings } from '../hooks/useNotificationSettings'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'

export function NotificationSettingsPage() {
  const toast = useToast()
  const { 
    settings, 
    isLoading, 
    isUpdating,
    updateSingleSetting,
    getSetting
  } = useNotificationSettings()

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateSingleSetting(key as keyof typeof settings, value)
      toast.success('Notification settings updated')
    } catch (error: any) {
      console.error('[UpdateSettings] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[UpdateSettings] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[UpdateSettings] permission denied')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Get current settings with fallback to defaults
  const currentSettings = settings || {
    // In-app notifications
    inAppEnabled: true,
    assignmentNotifications: true,
    completionNotifications: true,
    inviteNotifications: true,
    achievementNotifications: true,
    reminderNotifications: true,
    
    // Email notifications
    emailEnabled: false,
    emailAssignments: false,
    emailCompletions: false,
    emailInvites: true,
    emailReminders: false,
    
    // Browser push notifications
    pushEnabled: false,
    pushAssignments: false,
    pushCompletions: false,
    pushInvites: false,
    pushReminders: false,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Control how you receive notifications
        </p>
      </div>

      {/* In-App Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold">In-App Notifications</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable in-app notifications</p>
              <p className="text-sm text-gray-500">Show notifications in the app</p>
            </div>
            <Switch
              checked={currentSettings.inAppEnabled}
              onChange={(checked) => handleToggle('inAppEnabled', checked)}
            />
          </div>
          
          {currentSettings.inAppEnabled && (
            <>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task assignments</p>
                    <p className="text-sm text-gray-500">When someone assigns you a task</p>
                  </div>
                  <Switch
                    checked={currentSettings.assignmentNotifications}
                    onChange={(checked) => handleToggle('assignmentNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task completions</p>
                    <p className="text-sm text-gray-500">When tasks you created are completed</p>
                  </div>
                  <Switch
                    checked={currentSettings.completionNotifications}
                    onChange={(checked) => handleToggle('completionNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Project invites</p>
                    <p className="text-sm text-gray-500">When you're invited to a project</p>
                  </div>
                  <Switch
                    checked={currentSettings.inviteNotifications}
                    onChange={(checked) => handleToggle('inviteNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Achievements</p>
                    <p className="text-sm text-gray-500">When you unlock achievements</p>
                  </div>
                  <Switch
                    checked={currentSettings.achievementNotifications}
                    onChange={(checked) => handleToggle('achievementNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reminders</p>
                    <p className="text-sm text-gray-500">Task and deadline reminders</p>
                  </div>
                  <Switch
                    checked={currentSettings.reminderNotifications}
                    onChange={(checked) => handleToggle('reminderNotifications', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail size={20} className="text-green-600" />
            <h2 className="text-xl font-semibold">Email Notifications</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable email notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={currentSettings.emailEnabled}
              onChange={(checked) => handleToggle('emailEnabled', checked)}
            />
          </div>
          
          {currentSettings.emailEnabled && (
            <>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task assignments</p>
                    <p className="text-sm text-gray-500">Email when assigned a task</p>
                  </div>
                  <Switch
                    checked={currentSettings.emailAssignments}
                    onChange={(checked) => handleToggle('emailAssignments', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task completions</p>
                    <p className="text-sm text-gray-500">Email when tasks are completed</p>
                  </div>
                  <Switch
                    checked={currentSettings.emailCompletions}
                    onChange={(checked) => handleToggle('emailCompletions', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Project invites</p>
                    <p className="text-sm text-gray-500">Email for project invitations</p>
                  </div>
                  <Switch
                    checked={currentSettings.emailInvites}
                    onChange={(checked) => handleToggle('emailInvites', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reminders</p>
                    <p className="text-sm text-gray-500">Email reminders for tasks</p>
                  </div>
                  <Switch
                    checked={currentSettings.emailReminders}
                    onChange={(checked) => handleToggle('emailReminders', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Browser Push Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe size={20} className="text-purple-600" />
            <h2 className="text-xl font-semibold">Browser Push Notifications</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable browser push notifications</p>
              <p className="text-sm text-gray-500">Get notifications even when the app is closed</p>
            </div>
            <Switch
              checked={currentSettings.pushEnabled}
              onChange={(checked) => handleToggle('pushEnabled', checked)}
            />
          </div>
          
          {currentSettings.pushEnabled && (
            <>
              <div className="border-t pt-4 space-y-3">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Browser push notifications require permission. You'll be prompted to allow notifications when you enable this feature.
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task assignments</p>
                    <p className="text-sm text-gray-500">Push notification for new assignments</p>
                  </div>
                  <Switch
                    checked={currentSettings.pushAssignments}
                    onChange={(checked) => handleToggle('pushAssignments', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task completions</p>
                    <p className="text-sm text-gray-500">Push notification for completions</p>
                  </div>
                  <Switch
                    checked={currentSettings.pushCompletions}
                    onChange={(checked) => handleToggle('pushCompletions', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Project invites</p>
                    <p className="text-sm text-gray-500">Push notification for invites</p>
                  </div>
                  <Switch
                    checked={currentSettings.pushInvites}
                    onChange={(checked) => handleToggle('pushInvites', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reminders</p>
                    <p className="text-sm text-gray-500">Push notification for reminders</p>
                  </div>
                  <Switch
                    checked={currentSettings.pushReminders}
                    onChange={(checked) => handleToggle('pushReminders', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          variant="primary" 
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>Saving...</>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}