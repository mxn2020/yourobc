// src/features/boilerplate/websites/pages/WebsiteSettingsPage.tsx

import { FC, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useWebsite } from '../hooks/useWebsites'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import { useToast } from '@/features/boilerplate/notifications'
import { useErrorContext } from '@/contexts/ErrorContext'
import { useTranslation } from '@/features/boilerplate/i18n'
import { getCurrentLocale } from '@/features/boilerplate/i18n/utils/path'
import type { WebsiteId } from '../types'

interface WebsiteSettingsPageProps {
  websiteId: WebsiteId
}

export const WebsiteSettingsPage: FC<WebsiteSettingsPageProps> = ({ websiteId }) => {
  const navigate = useNavigate()
  const locale = getCurrentLocale()
  const { t } = useTranslation('websites')
  const toast = useToast()
  const { handleError } = useErrorContext()

  const { website, updateWebsite, isLoading, isUpdating } = useWebsite(websiteId)

  const [seoSettings, setSeoSettings] = useState({
    defaultTitle: '',
    defaultDescription: '',
    defaultKeywords: [] as string[],
    siteName: '',
    twitterHandle: '',
  })

  const [generalSettings, setGeneralSettings] = useState({
    enableBlog: false,
    enableComments: false,
    enableAnalytics: false,
    enableCookieConsent: false,
    customCss: '',
    customJs: '',
  })

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    github: '',
  })

  // Populate form when website loads
  useEffect(() => {
    if (website) {
      setSeoSettings({
        defaultTitle: website.seo?.defaultTitle || '',
        defaultDescription: website.seo?.defaultDescription || '',
        defaultKeywords: website.seo?.defaultKeywords || [],
        siteName: website.seo?.siteName || '',
        twitterHandle: website.seo?.twitterHandle || '',
      })

      setGeneralSettings({
        enableBlog: website.settings?.enableBlog || false,
        enableComments: website.settings?.enableComments || false,
        enableAnalytics: website.settings?.enableAnalytics || false,
        enableCookieConsent: website.settings?.enableCookieConsent || false,
        customCss: website.settings?.customCss || '',
        customJs: website.settings?.customJs || '',
      })

      setSocialLinks({
        facebook: website.socialLinks?.facebook || '',
        twitter: website.socialLinks?.twitter || '',
        linkedin: website.socialLinks?.linkedin || '',
        instagram: website.socialLinks?.instagram || '',
        youtube: website.socialLinks?.youtube || '',
        github: website.socialLinks?.github || '',
      })
    }
  }, [website])

  const handleSaveGeneral = async () => {
    try {
      await updateWebsite({
        settings: generalSettings,
      })
      toast.success(t('messages.updateSuccess'))
    } catch (error: any) {
      handleError(error)
    }
  }

  const handleSaveSEO = async () => {
    try {
      await updateWebsite({
        seo: seoSettings,
      })
      toast.success(t('messages.updateSuccess'))
    } catch (error: any) {
      handleError(error)
    }
  }

  const handleSaveSocial = async () => {
    try {
      await updateWebsite({
        socialLinks,
      })
      toast.success(t('messages.updateSuccess'))
    } catch (error: any) {
      handleError(error)
    }
  }

  if (isLoading || !website) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('loading')}</div>
      </div>
    )
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('breadcrumb.websites'), href: `/${locale}/websites` },
    { label: website.name, href: `/${locale}/websites/${websiteId}` },
    { label: t('settings.title') },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-600 mt-2">{t('settings.description')}</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">{t('settings.tabs.general')}</TabsTrigger>
            <TabsTrigger value="seo">{t('settings.tabs.seo')}</TabsTrigger>
            <TabsTrigger value="social">{t('settings.tabs.social')}</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.general.title')}</CardTitle>
                <CardDescription>{t('settings.general.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Feature Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.general.enableBlog')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.general.enableBlogDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.enableBlog}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, enableBlog: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.general.enableComments')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.general.enableCommentsDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.enableComments}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, enableComments: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.general.enableAnalytics')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.general.enableAnalyticsDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.enableAnalytics}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, enableAnalytics: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.general.enableCookieConsent')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.general.enableCookieConsentDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.enableCookieConsent}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, enableCookieConsent: checked })
                      }
                    />
                  </div>
                </div>

                {/* Custom CSS */}
                <div>
                  <Label htmlFor="customCss">{t('settings.general.customCss')}</Label>
                  <Textarea
                    id="customCss"
                    value={generalSettings.customCss}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, customCss: e.target.value })
                    }
                    placeholder="/* Custom CSS */"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Custom JS */}
                <div>
                  <Label htmlFor="customJs">{t('settings.general.customJs')}</Label>
                  <Textarea
                    id="customJs"
                    value={generalSettings.customJs}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, customJs: e.target.value })
                    }
                    placeholder="// Custom JavaScript"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={isUpdating}>
                    {isUpdating ? t('form.buttons.saving') : t('form.buttons.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.seo.title')}</CardTitle>
                <CardDescription>{t('settings.seo.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">{t('settings.seo.siteName')}</Label>
                  <Input
                    id="siteName"
                    value={seoSettings.siteName}
                    onChange={(e) => setSeoSettings({ ...seoSettings, siteName: e.target.value })}
                    placeholder="My Awesome Site"
                  />
                </div>

                <div>
                  <Label htmlFor="defaultTitle">{t('settings.seo.defaultTitle')}</Label>
                  <Input
                    id="defaultTitle"
                    value={seoSettings.defaultTitle}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, defaultTitle: e.target.value })
                    }
                    placeholder="Home - My Website"
                  />
                </div>

                <div>
                  <Label htmlFor="defaultDescription">{t('settings.seo.defaultDescription')}</Label>
                  <Textarea
                    id="defaultDescription"
                    value={seoSettings.defaultDescription}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, defaultDescription: e.target.value })
                    }
                    placeholder="A brief description of your website"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="twitterHandle">{t('settings.seo.twitterHandle')}</Label>
                  <Input
                    id="twitterHandle"
                    value={seoSettings.twitterHandle}
                    onChange={(e) =>
                      setSeoSettings({ ...seoSettings, twitterHandle: e.target.value })
                    }
                    placeholder="@username"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSEO} disabled={isUpdating}>
                    {isUpdating ? t('form.buttons.saving') : t('form.buttons.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.social.title')}</CardTitle>
                <CardDescription>{t('settings.social.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>

                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSocial} disabled={isUpdating}>
                    {isUpdating ? t('form.buttons.saving') : t('form.buttons.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
