// src/features/admin/pages/AdminSettingsPage.tsx
import React, { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, Input, SimpleSelect, Slider, Switch } from '@/components/ui'
import { useAppSettingsManagement } from '../hooks/useAppSettingsManagement'
import { useAdminPermissions } from '../hooks/useAdmin'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import {
  Settings,
  Brain,
  TestTube,
  Save,
  AlertCircle,
  CheckCircle,
  Shield,
  Bell,
  Loader,
  Settings2
} from 'lucide-react'
import { AdminLayout } from '../components/AdminLayout'
import { AdminGuard } from '../components/AdminGuard'
import { FeatureConfigTab } from '../components/FeatureConfigTab'
import type { AISettings } from '../types/admin.types'
import { useTranslation } from '@/features/system/i18n'

interface AIConfigState {
  defaultModel: string
  defaultProvider: string
  maxTokensDefault: number
  temperatureDefault: number
  enableAILogging: boolean
}

interface GeneralConfigState {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
}

interface SecurityConfigState {
  sessionTimeout: number
  maxLoginAttempts: number
  passwordMinLength: number
  requireTwoFactor: boolean
}

interface NotificationConfigState {
  adminAlerts: boolean
  userWelcomeEmail: boolean
  passwordResetEmail: boolean
  securityNotifications: boolean
}

interface TestResult {
  success: boolean
  message: string
}

export function AdminSettingsPage() {
  const { t } = useTranslation('admin')
  const toast = useToast()
  const { adminProfile } = useAdminPermissions()

  // Early return if admin profile is not loaded yet
  if (!adminProfile) {
    return (
      <AdminGuard requiredPermission="settings.manage">
        <AdminLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">{t('settings.states.loadingProfile')}</p>
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  const {
    aiSettings,
    generalSettings,
    securitySettings,
    notificationSettings,
    isLoading,
    isUpdating,
    updateAISettings,
    updateGeneralSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    testAIConnection,
  } = useAppSettingsManagement()
  
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'security' | 'notifications' | 'feature-config'>('general')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  
  // State for each settings category
  const [aiConfig, setAIConfig] = useState<AIConfigState>({
    defaultModel: 'openai/gpt-4o-mini',
    defaultProvider: 'openai',
    maxTokensDefault: 1000,
    temperatureDefault: 0.7,
    enableAILogging: true,
  })

  const [generalConfig, setGeneralConfig] = useState<GeneralConfigState>({
    siteName: 'Admin Portal',
    siteDescription: 'Project management and AI-powered workspace',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
  })

  const [securityConfig, setSecurityConfig] = useState<SecurityConfigState>({
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
  })

  const [notificationConfig, setNotificationConfig] = useState<NotificationConfigState>({
    adminAlerts: true,
    userWelcomeEmail: true,
    passwordResetEmail: true,
    securityNotifications: true,
  })

  // Available providers and models
  const providers = ['openai', 'anthropic', 'google', 'microsoft']
  
  const modelsByProvider: Record<string, { id: string; name: string }[]> = {
    openai: [
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'openai/gpt-4', name: 'GPT-4' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    anthropic: [
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
    ],
    google: [
      { id: 'google/gemini-pro', name: 'Gemini Pro' },
      { id: 'google/gemini-pro-vision', name: 'Gemini Pro Vision' },
    ],
    microsoft: [
      { id: 'microsoft/phi-3-mini', name: 'Phi-3 Mini' },
      { id: 'microsoft/phi-3-medium', name: 'Phi-3 Medium' },
    ]
  }

  const currentModels = modelsByProvider[aiConfig.defaultProvider] || []

  // Load settings data when it becomes available
  useEffect(() => {
    if (aiSettings) {
      setAIConfig({
        defaultModel: aiSettings.defaultModel || 'openai/gpt-4o-mini',
        defaultProvider: aiSettings.defaultProvider || 'openai',
        maxTokensDefault: aiSettings.maxTokensDefault || 1000,
        temperatureDefault: aiSettings.temperatureDefault || 0.7,
        enableAILogging: aiSettings.enableAILogging !== false,
      })
    }
  }, [aiSettings])

  useEffect(() => {
    if (generalSettings) {
      setGeneralConfig({
        siteName: generalSettings.siteName || 'Admin Portal',
        siteDescription: generalSettings.siteDescription || 'Project management and AI-powered workspace',
        maintenanceMode: generalSettings.maintenanceMode || false,
        registrationEnabled: generalSettings.registrationEnabled !== false,
        emailVerificationRequired: generalSettings.emailVerificationRequired || false,
      })
    }
  }, [generalSettings])

  useEffect(() => {
    if (securitySettings) {
      setSecurityConfig({
        sessionTimeout: securitySettings.sessionTimeout || 3600,
        maxLoginAttempts: securitySettings.maxLoginAttempts || 5,
        passwordMinLength: securitySettings.passwordMinLength || 8,
        requireTwoFactor: securitySettings.requireTwoFactor || false,
      })
    }
  }, [securitySettings])

  useEffect(() => {
    if (notificationSettings) {
      setNotificationConfig({
        adminAlerts: notificationSettings.adminAlerts !== false,
        userWelcomeEmail: notificationSettings.userWelcomeEmail !== false,
        passwordResetEmail: notificationSettings.passwordResetEmail !== false,
        securityNotifications: notificationSettings.securityNotifications !== false,
      })
    }
  }, [notificationSettings])

  // Save handlers
  const handleSaveAISettings = async () => {
    try {
      await updateAISettings(aiConfig)
      toast.success(t('settings.messages.saveSuccess.ai'))
    } catch (error: any) {
      console.error('[SaveAISettings] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[SaveAISettings] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[SaveAISettings] permission denied')
      }
    }
  }

  const handleSaveGeneralSettings = async () => {
    try {
      await updateGeneralSettings(generalConfig)
      toast.success(t('settings.messages.saveSuccess.general'))
    } catch (error: any) {
      console.error('[SaveGeneralSettings] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[SaveGeneralSettings] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[SaveGeneralSettings] permission denied')
      }
    }
  }

  const handleSaveSecuritySettings = async () => {
    try {
      await updateSecuritySettings(securityConfig)
      toast.success(t('settings.messages.saveSuccess.security'))
    } catch (error: any) {
      console.error('[SaveSecuritySettings] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[SaveSecuritySettings] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[SaveSecuritySettings] permission denied')
      }
    }
  }

  const handleSaveNotificationSettings = async () => {
    try {
      await updateNotificationSettings(notificationConfig)
      toast.success(t('settings.messages.saveSuccess.notifications'))
    } catch (error: any) {
      console.error('[SaveNotificationSettings] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[SaveNotificationSettings] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[SaveNotificationSettings] permission denied')
      }
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setTestResult(null)

    try {
      await testAIConnection(aiConfig.defaultModel)
      setTestResult({
        success: true,
        message: t('settings.ai.testConnection.success')
      })
      toast.success(t('settings.ai.testConnection.success'))
    } catch (error: any) {
      console.error('[TestConnection] error:', error)
      const { message, code } = parseConvexError(error)
      setTestResult({
        success: false,
        message: t('settings.ai.testConnection.failed', { message })
      })
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[TestConnection] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[TestConnection] permission denied')
      }
    } finally {
      setIsTestingConnection(false)
    }
  }

  const tabs = [
    { id: 'general', label: t('settings.tabs.general'), icon: Settings },
    { id: 'ai', label: t('settings.tabs.ai'), icon: Brain },
    { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'feature-config', label: t('settings.tabs.featureConfig'), icon: Settings2 },
  ]

  // Show loading state
  if (isLoading) {
    return (
      <AdminGuard requiredPermission="settings.manage">
        <AdminLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">{t('settings.states.loading')}</p>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard requiredPermission="settings.manage">
      <AdminLayout
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <Button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        variant="ghost"
                        className={`w-full flex items-center justify-start space-x-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </Button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-6 w-6 text-gray-600" />
                    <h2 className="text-xl font-semibold">{t('settings.general.title')}</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('settings.general.siteName.label')}
                        </label>
                        <Input
                          value={generalConfig.siteName}
                          onChange={(e) => setGeneralConfig(prev => ({ ...prev, siteName: e.target.value }))}
                          placeholder={t('settings.general.siteName.placeholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('settings.general.siteDescription.label')}
                        </label>
                        <Input
                          value={generalConfig.siteDescription}
                          onChange={(e) => setGeneralConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
                          placeholder={t('settings.general.siteDescription.placeholder')}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Switch
                        label={t('settings.general.maintenanceMode.label')}
                        helpText={t('settings.general.maintenanceMode.help')}
                        checked={generalConfig.maintenanceMode}
                        onChange={(checked) => setGeneralConfig(prev => ({ ...prev, maintenanceMode: checked }))}
                      />

                      <Switch
                        label={t('settings.general.registrationEnabled.label')}
                        helpText={t('settings.general.registrationEnabled.help')}
                        checked={generalConfig.registrationEnabled}
                        onChange={(checked) => setGeneralConfig(prev => ({ ...prev, registrationEnabled: checked }))}
                      />

                      <Switch
                        label={t('settings.general.emailVerificationRequired.label')}
                        helpText={t('settings.general.emailVerificationRequired.help')}
                        checked={generalConfig.emailVerificationRequired}
                        onChange={(checked) => setGeneralConfig(prev => ({ ...prev, emailVerificationRequired: checked }))}
                      />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <Button
                        onClick={handleSaveGeneralSettings}
                        disabled={isUpdating}
                        className="flex items-center space-x-2"
                      >
                        {isUpdating ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{t('settings.general.save')}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Settings Tab */}
            {activeTab === 'ai' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-semibold">{t('settings.ai.title')}</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Provider and Model Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SimpleSelect
                        label={t('settings.ai.provider.label')}
                        value={aiConfig.defaultProvider}
                        onChange={(e) => {
                          const newProvider = e.target.value
                          setAIConfig(prev => ({
                            ...prev,
                            defaultProvider: newProvider,
                            defaultModel: '' // Reset model when provider changes
                          }))
                        }}
                        options={[
                          { value: '', label: t('settings.ai.provider.placeholder') },
                          ...providers.map((provider) => ({
                            value: provider,
                            label: provider.charAt(0).toUpperCase() + provider.slice(1)
                          }))
                        ]}
                        helpText={t('settings.ai.provider.help')}
                      />

                      <SimpleSelect
                        label={t('settings.ai.model.label')}
                        value={aiConfig.defaultModel}
                        onChange={(e) => setAIConfig(prev => ({ ...prev, defaultModel: e.target.value }))}
                        options={[
                          { value: '', label: t('settings.ai.model.placeholder') },
                          ...currentModels.map((model) => ({
                            value: model.id,
                            label: model.name
                          }))
                        ]}
                        disabled={!aiConfig.defaultProvider}
                        helpText={t('settings.ai.model.help')}
                      />
                    </div>

                    {/* Default Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Input
                          type="number"
                          label={t('settings.ai.maxTokens.label')}
                          value={aiConfig.maxTokensDefault}
                          onChange={(e) => setAIConfig(prev => ({
                            ...prev,
                            maxTokensDefault: parseInt(e.target.value) || 1000
                          }))}
                          min={1}
                          max={32000}
                          helpText={t('settings.ai.maxTokens.help')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('settings.ai.temperature.label', { value: aiConfig.temperatureDefault })}
                        </label>
                        <Slider
                          value={[aiConfig.temperatureDefault]}
                          onValueChange={(values) => setAIConfig(prev => ({
                            ...prev,
                            temperatureDefault: values[0]
                          }))}
                          min={0}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{t('settings.ai.temperature.levels.focused')}</span>
                          <span>{t('settings.ai.temperature.levels.balanced')}</span>
                          <span>{t('settings.ai.temperature.levels.creative')}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {t('settings.ai.temperature.help')}
                        </p>
                      </div>
                    </div>

                    {/* Enable AI Logging */}
                    <Switch
                      label={t('settings.ai.logging.label')}
                      helpText={t('settings.ai.logging.help')}
                      checked={aiConfig.enableAILogging}
                      onChange={(checked) => setAIConfig(prev => ({
                        ...prev,
                        enableAILogging: checked
                      }))}
                    />

                    {/* Test Connection */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{t('settings.ai.testConnection.title')}</h3>
                          <p className="text-sm text-gray-500">
                            {t('settings.ai.testConnection.description')}
                          </p>
                        </div>
                        <Button
                          onClick={handleTestConnection}
                          disabled={isTestingConnection || !aiConfig.defaultModel}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          {isTestingConnection ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                          <span>{t('settings.ai.testConnection.button')}</span>
                        </Button>
                      </div>

                      {testResult && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          testResult.success
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {testResult.success ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div>
                              <div className={`text-sm font-medium ${
                                testResult.success ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {testResult.success ? t('settings.ai.testConnection.results.success') : t('settings.ai.testConnection.results.failed')}
                              </div>
                              <div className={`text-sm mt-1 ${
                                testResult.success ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {testResult.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <Button
                        onClick={handleSaveAISettings}
                        disabled={isUpdating}
                        className="flex items-center space-x-2"
                      >
                        {isUpdating ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{t('settings.ai.save')}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-red-600" />
                    <h2 className="text-xl font-semibold">{t('settings.security.title')}</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Input
                          type="number"
                          label={t('settings.security.sessionTimeout.label')}
                          value={securityConfig.sessionTimeout}
                          onChange={(e) => setSecurityConfig(prev => ({
                            ...prev,
                            sessionTimeout: parseInt(e.target.value) || 3600
                          }))}
                          min={300}
                          max={86400}
                          helpText={t('settings.security.sessionTimeout.help')}
                        />
                      </div>

                      <div>
                        <Input
                          type="number"
                          label={t('settings.security.maxLoginAttempts.label')}
                          value={securityConfig.maxLoginAttempts}
                          onChange={(e) => setSecurityConfig(prev => ({
                            ...prev,
                            maxLoginAttempts: parseInt(e.target.value) || 5
                          }))}
                          min={3}
                          max={20}
                          helpText={t('settings.security.maxLoginAttempts.help')}
                        />
                      </div>
                    </div>

                    <div>
                      <Input
                        type="number"
                        label={t('settings.security.passwordMinLength.label')}
                        value={securityConfig.passwordMinLength}
                        onChange={(e) => setSecurityConfig(prev => ({
                          ...prev,
                          passwordMinLength: parseInt(e.target.value) || 8
                        }))}
                        min={6}
                        max={50}
                        className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-600">
                        {t('settings.security.passwordMinLength.help')}
                      </p>
                    </div>

                    <Switch
                      label={t('settings.security.requireTwoFactor.label')}
                      helpText={t('settings.security.requireTwoFactor.help')}
                      checked={securityConfig.requireTwoFactor}
                      onChange={(checked) => setSecurityConfig(prev => ({
                        ...prev,
                        requireTwoFactor: checked
                      }))}
                    />

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <Button
                        onClick={handleSaveSecuritySettings}
                        disabled={isUpdating}
                        className="flex items-center space-x-2"
                      >
                        {isUpdating ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{t('settings.security.save')}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold">{t('settings.notifications.title')}</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Switch
                        label={t('settings.notifications.adminAlerts.label')}
                        helpText={t('settings.notifications.adminAlerts.help')}
                        checked={notificationConfig.adminAlerts}
                        onChange={(checked) => setNotificationConfig(prev => ({
                          ...prev,
                          adminAlerts: checked
                        }))}
                      />

                      <Switch
                        label={t('settings.notifications.userWelcomeEmail.label')}
                        helpText={t('settings.notifications.userWelcomeEmail.help')}
                        checked={notificationConfig.userWelcomeEmail}
                        onChange={(checked) => setNotificationConfig(prev => ({
                          ...prev,
                          userWelcomeEmail: checked
                        }))}
                      />

                      <Switch
                        label={t('settings.notifications.passwordResetEmail.label')}
                        helpText={t('settings.notifications.passwordResetEmail.help')}
                        checked={notificationConfig.passwordResetEmail}
                        onChange={(checked) => setNotificationConfig(prev => ({
                          ...prev,
                          passwordResetEmail: checked
                        }))}
                      />

                      <Switch
                        label={t('settings.notifications.securityNotifications.label')}
                        helpText={t('settings.notifications.securityNotifications.help')}
                        checked={notificationConfig.securityNotifications}
                        onChange={(checked) => setNotificationConfig(prev => ({
                          ...prev,
                          securityNotifications: checked
                        }))}
                      />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <Button
                        onClick={handleSaveNotificationSettings}
                        disabled={isUpdating}
                        className="flex items-center space-x-2"
                      >
                        {isUpdating ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{t('settings.notifications.save')}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature Configuration Tab */}
            {activeTab === 'feature-config' && (
              <FeatureConfigTab />
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}