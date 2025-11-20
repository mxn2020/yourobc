import React from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  SimpleSelect as Select,
  Checkbox,
  Label
} from '@/components/ui'
import { useAuth } from '@/features/boilerplate/auth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api';
import { useToast } from '@/features/boilerplate/notifications'
import { Settings, User, Bell, Palette, Globe } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel';

export function SettingsPage() {
  const toast = useToast()
  const { auth, isAuthenticated, isAuthLoading } = useAuth()

  const settings = useQuery(
    api.lib.boilerplate.user_settings.queries.getUserSettings,
    isAuthenticated ? {} : "skip"
  )
  const updateSettings = useMutation(api.lib.boilerplate.user_settings.mutations.updateUserSettings)
  const resetSettings = useMutation(api.lib.boilerplate.user_settings.mutations.resetUserSettings)

  const [loading, setLoading] = React.useState(false)
  const [localSettings, setLocalSettings] = React.useState(settings)

  // Update local settings when server settings change
  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSettingChange = (section: 'notificationPreferences' | 'dashboardPreferences', key: string, value: any) => {
    setLocalSettings(prev => prev ? {
      ...prev,
      [section]: {
        ...(prev[section]),
        [key]: value
      }
    } : prev)
  }

  const handleDirectChange = (key: 'theme' | 'language' | 'timezone' | 'dateFormat' | 'layoutPreference', value: any) => {
    setLocalSettings(prev => prev ? {
      ...prev,
      [key]: value
    } : prev)
  }

  const handleSaveSettings = async () => {
    if (!localSettings || !isAuthenticated) return

    setLoading(true)
    try {
      await updateSettings({
        ...localSettings
      })
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetSettings = async () => {
    if (!isAuthenticated) return

    setLoading(true)
    try {
      await resetSettings({})
      toast.success('Settings reset to defaults!')
    } catch (error) {
      toast.error('Failed to reset settings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'System' },
  ]

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ]

  const dateFormatOptions = [
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
  ]

  const layoutOptions = [
    { value: 'header', label: 'Header Navigation' },
    { value: 'sidebar', label: 'Sidebar Navigation' },
  ]

  const itemsPerPageOptions = [
    { value: '10', label: '10 items' },
    { value: '25', label: '25 items' },
    { value: '50', label: '50 items' },
    { value: '100', label: '100 items' },
  ]

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to access your settings.</p>
        </div>
      </div>
    )
  }

  if (!localSettings || !settings) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-lg text-gray-600">
          Customize your experience and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User size={20} />
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                value={auth?.name || ''}
                disabled
                helpText="Name is managed through your authentication provider"
              />
              <Input
                label="Email"
                value={auth?.email || ''}
                disabled
                helpText="Email is managed through your authentication provider"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette size={20} />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Theme"
                value={localSettings.theme}
                onChange={(e) => handleDirectChange('theme', e.target.value)}
                options={themeOptions}
                helpText="Choose your preferred color scheme"
              />
              <Select
                label="Language"
                value={localSettings.language}
                onChange={(e) => handleDirectChange('language', e.target.value)}
                options={languageOptions}
              />
              <Select
                label="Layout"
                value={localSettings.layoutPreferences.layout}
                onChange={(e) => handleDirectChange('layoutPreference', e.target.value)}
                options={layoutOptions}
                helpText="Choose your preferred navigation layout"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell size={20} />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Checkbox
                  checked={localSettings.notificationPreferences.email}
                  onChange={(checked) => handleSettingChange('notificationPreferences', 'email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive browser notifications</p>
                </div>
                <Checkbox
                  checked={localSettings.notificationPreferences.push}
                  onChange={(checked) => handleSettingChange('notificationPreferences', 'push', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Project Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about project changes</p>
                </div>
                <Checkbox
                  checked={localSettings.notificationPreferences.projectUpdates}
                  onChange={(checked) => handleSettingChange('notificationPreferences', 'projectUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Assignments</Label>
                  <p className="text-sm text-gray-500">Get notified when assigned to projects</p>
                </div>
                <Checkbox
                  checked={localSettings.notificationPreferences.assignments}
                  onChange={(checked) => handleSettingChange('notificationPreferences', 'assignments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Deadlines</Label>
                  <p className="text-sm text-gray-500">Get notified about approaching deadlines</p>
                </div>
                <Checkbox
                  checked={localSettings.notificationPreferences.deadlines}
                  onChange={(checked) => handleSettingChange('notificationPreferences', 'deadlines', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings size={20} />
              <h2 className="text-xl font-semibold">Dashboard Preferences</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Default View"
                value={localSettings.dashboardPreferences.defaultView}
                onChange={(e) => handleSettingChange('dashboardPreferences', 'defaultView', e.target.value)}
                options={[
                  { value: 'cards', label: 'Card View' },
                  { value: 'table', label: 'Table View' },
                ]}
              />

              <Select
                label="Items Per Page"
                value={localSettings.dashboardPreferences.itemsPerPage.toString()}
                onChange={(e) => handleSettingChange('dashboardPreferences', 'itemsPerPage', parseInt(e.target.value))}
                options={itemsPerPageOptions}
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showCompleted"
                  checked={localSettings.dashboardPreferences.showCompletedProjects}
                  onChange={(checked) => handleSettingChange('dashboardPreferences', 'showCompletedProjects', checked)}
                />
                <Label htmlFor="showCompleted" className="text-sm font-medium text-gray-900">
                  Show completed projects
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe size={20} />
              <h2 className="text-xl font-semibold">Regional Settings</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Timezone"
                value={localSettings.timezone}
                onChange={(e) => handleDirectChange('timezone', e.target.value)}
                helpText="Your current timezone"
              />

              <Select
                label="Date Format"
                value={localSettings.dateFormat}
                onChange={(e) => handleDirectChange('dateFormat', e.target.value)}
                options={dateFormatOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handleResetSettings}
            variant="outline"
            loading={loading}
            size="lg"
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            loading={loading}
            size="lg"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}