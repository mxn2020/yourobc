// src/features/boilerplate/blog/pages/PostEditorPage.tsx
/**
 * Post Editor Page
 *
 * Create or edit blog posts with markdown editor and SEO optimization
 */

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Eye, Calendar, Send, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Textarea } from '../../../../components/ui/Textarea';
import { Label } from '../../../../components/ui/Label';
import { Card } from '../../../../components/ui/Card';
import { Tabs } from '../../../../components/ui/Tabs';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { useBlog } from '../hooks/useBlog';
import { useCategories } from '../hooks/useCategories';
import { useScheduling } from '../hooks/useScheduling';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTranslation } from '@/features/boilerplate/i18n';
import { generateSlug } from '../utils/slug';
import { calculateSEOScore } from '../utils/seo';
import { validateContent } from '../utils/content';
import type { PostFormData } from '../types';
import type { Id } from '../../../../../convex/_generated/dataModel';

interface PostEditorPageProps {
  postId?: Id<'blogPosts'>;
  initialData?: Partial<PostFormData>;
}

export function PostEditorPage({ postId, initialData }: PostEditorPageProps) {
  const { t } = useTranslation('blog');
  const navigate = useNavigate();
  const { service, isReady } = useBlog();
  const { categories } = useCategories();
  const { schedulePost, isScheduling } = useScheduling();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PostFormData>({
    defaultValues: initialData || {
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      allowComments: true,
      visibility: 'public',
    },
  });

  // Watch form values for auto-features
  const title = watch('title');
  const content = watch('content');
  const seoTitle = watch('seoTitle');
  const seoDescription = watch('seoDescription');
  const seoKeywords = watch('seoKeywords');
  const focusKeyword = watch('focusKeyword');
  const featuredImage = watch('featuredImage');

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title && !postId) {
      setValue('slug', generateSlug(title));
    }
  }, [title, autoSlug, postId, setValue]);

  // Calculate SEO score
  const seoScore = calculateSEOScore({
    title,
    content,
    seoTitle,
    seoDescription,
    seoKeywords,
    focusKeyword,
    featuredImage,
  });

  // Auto-save (every 30 seconds if dirty)
  useEffect(() => {
    if (!isDirty || !postId) return;

    const timer = setTimeout(() => {
      handleSaveDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [isDirty, postId]);

  const handleSaveDraft = async (data?: PostFormData) => {
    if (!isReady || !service) return;

    try {
      setIsSaving(true);
      const formData = data || watch();

      // Validate content
      const validation = validateContent(formData.content);
      if (!validation.valid) {
        toast.error(validation.errors[0]);
        return;
      }

      // Get user ID from auth
      if (!profile?._id) {
        toast.error(t('editor.messages.mustBeAuthenticated'));
        return;
      }

      if (postId) {
        // Update existing post
        await service.updatePost(postId, formData, profile._id);
        toast.success(t('editor.messages.draftSaved'));
      } else {
        // Create new post
        const newPostId = await service.createPost(formData, profile._id);
        toast.success(t('editor.messages.draftCreated'));
        // Navigate to edit page
        navigate({ to: '/{-$locale}/admin/blog/posts/$postId/edit', params: { postId: newPostId } });
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error(t('editor.messages.failedToSaveDraft'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (data: PostFormData) => {
    if (!isReady || !service) return;

    try {
      setIsPublishing(true);

      // Validate content
      const validation = validateContent(data.content);
      if (!validation.valid) {
        toast.error(validation.errors[0]);
        return;
      }

      // Get user ID from auth
      if (!profile?._id) {
        toast.error(t('editor.messages.mustBeAuthenticatedToPublish'));
        return;
      }

      if (postId) {
        // Update and publish
        await service.updatePost(postId, data, profile._id);
        await service.publishPost(postId, profile._id);
        toast.success(t('editor.messages.postPublished'));
      } else {
        // Create and publish
        const newPostId = await service.createPost(data, profile._id);
        await service.publishPost(newPostId, profile._id);
        toast.success(t('editor.messages.postPublished'));
      }

      navigate({ to: '/{-$locale}/admin/blog' });
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast.error(t('editor.messages.failedToPublish'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!isReady || !service || !postId) {
      toast.error(t('editor.messages.saveBeforeScheduling'));
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error(t('editor.messages.selectDateTime'));
      return;
    }

    try {
      // Combine date and time into a Date object
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      // Validate future date
      const now = new Date();
      if (scheduledDateTime <= now) {
        toast.error(t('editor.messages.scheduledTimeMustBeFuture'));
        return;
      }

      await schedulePost(postId, scheduledDateTime);
      toast.success(`${t('editor.messages.postScheduled')} ${scheduledDateTime.toLocaleString()}`);
      setShowScheduleDialog(false);
      navigate({ to: '/{-$locale}/admin/blog' });
    } catch (error) {
      console.error('Failed to schedule post:', error);
      toast.error(t('editor.messages.failedToSchedule'));
    }
  };

  const openScheduleDialog = async () => {
    // First save the post as draft if not already saved
    if (!postId) {
      await handleSubmit(handleSaveDraft)();
      return;
    }

    // Set default to 1 hour from now
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 1);

    const dateStr = defaultDate.toISOString().split('T')[0];
    const timeStr = defaultDate.toTimeString().slice(0, 5);

    setScheduledDate(dateStr);
    setScheduledTime(timeStr);
    setShowScheduleDialog(true);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('editor.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => navigate({ to: '/{-$locale}/admin/blog' })}
              >
                {t('editor.back')}
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {postId ? t('editor.title') : t('editor.newPost')}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => {
                  // TODO: Preview functionality
                  toast(t('editor.previewComingSoon'));
                }}
              >
                {t('editor.preview')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Save className="w-4 h-4" />}
                onClick={handleSubmit(handleSaveDraft)}
                loading={isSaving}
                disabled={isSaving}
              >
                {t('editor.saveDraft')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Clock className="w-4 h-4" />}
                onClick={openScheduleDialog}
                disabled={isSaving || isScheduling}
              >
                {t('editor.schedule')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Send className="w-4 h-4" />}
                onClick={handleSubmit(handlePublish)}
                loading={isPublishing}
                disabled={isPublishing}
              >
                {t('editor.publish')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main editor */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'content'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t('editor.tabs.content')}
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === 'seo'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t('editor.tabs.seo')}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        seoScore.score >= 80
                          ? 'bg-green-100 text-green-800'
                          : seoScore.score >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {seoScore.score}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'settings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t('editor.tabs.settings')}
                  </button>
                </nav>
              </div>
            </div>

            {/* Content tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <Input
                    {...register('title', { required: t('editor.content.titleRequired') })}
                    placeholder={t('editor.content.titlePlaceholder')}
                    className="text-3xl font-bold border-0 focus:ring-0 p-0"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Markdown editor */}
                <MarkdownEditor
                  value={content}
                  onChange={(value) => setValue('content', value, { shouldDirty: true })}
                  height={600}
                  autoFocus={!postId}
                />
              </div>
            )}

            {/* SEO tab */}
            {activeTab === 'seo' && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{t('editor.seo.title')}</h3>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        <span className="text-2xl font-bold text-gray-900">{seoScore.score}</span>
                        <span className="text-sm text-gray-500">{t('editor.seo.score')}</span>
                      </div>
                    </div>

                    {seoScore.recommendations.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">{t('editor.seo.recommendations')}</h4>
                        <ul className="space-y-2">
                          {seoScore.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-800">
                              • {rec.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="seoTitle">{t('editor.seo.seoTitle')}</Label>
                    <Input {...register('seoTitle')} id="seoTitle" placeholder={t('editor.seo.seoTitlePlaceholder')} />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('editor.seo.seoTitleHelp')}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">{t('editor.seo.seoDescription')}</Label>
                    <Textarea
                      {...register('seoDescription')}
                      id="seoDescription"
                      placeholder={t('editor.seo.seoDescriptionPlaceholder')}
                      rows={3}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('editor.seo.seoDescriptionHelp')}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="focusKeyword">{t('editor.seo.focusKeyword')}</Label>
                    <Input
                      {...register('focusKeyword')}
                      id="focusKeyword"
                      placeholder={t('editor.seo.focusKeywordPlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoKeywords">{t('editor.seo.seoKeywords')}</Label>
                    <Input
                      {...register('seoKeywords')}
                      id="seoKeywords"
                      placeholder={t('editor.seo.seoKeywordsPlaceholder')}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('editor.seo.seoKeywordsHelp')}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="excerpt">{t('editor.settings.excerpt')}</Label>
                    <Textarea
                      {...register('excerpt')}
                      id="excerpt"
                      placeholder={t('editor.settings.excerptPlaceholder')}
                      rows={3}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('editor.settings.excerptHelp')}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="slug">{t('editor.settings.slug')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        {...register('slug')}
                        id="slug"
                        placeholder={t('editor.settings.slugPlaceholder')}
                        disabled={autoSlug}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoSlug(!autoSlug)}
                      >
                        {autoSlug ? t('editor.settings.slugManual') : t('editor.settings.slugAuto')}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="visibility">{t('editor.settings.visibility')}</Label>
                      <select
                        {...register('visibility')}
                        id="visibility"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">{t('editor.settings.visibilityPublic')}</option>
                        <option value="private">{t('editor.settings.visibilityPrivate')}</option>
                        <option value="unlisted">{t('editor.settings.visibilityUnlisted')}</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        {...register('allowComments')}
                        id="allowComments"
                        className="rounded"
                      />
                      <Label htmlFor="allowComments" className="cursor-pointer">
                        {t('editor.settings.allowComments')}
                      </Label>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Category */}
              <Card className="p-4">
                <Label htmlFor="categoryId">{t('editor.sidebar.category')}</Label>
                <select
                  {...register('categoryId')}
                  id="categoryId"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('editor.sidebar.noCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Card>

              {/* Tags */}
              <Card className="p-4">
                <Label htmlFor="tags">{t('editor.sidebar.tags')}</Label>
                <Input
                  {...register('tags')}
                  id="tags"
                  placeholder={t('editor.sidebar.tagsPlaceholder')}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('editor.sidebar.tagsHelp')}
                </p>
              </Card>

              {/* Featured Image */}
              <Card className="p-4">
                <Label>{t('editor.sidebar.featuredImage')}</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">
                    {t('editor.sidebar.imageUploadComingSoon')}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{t('editor.schedule.title')}</h2>
                <button
                  onClick={() => setShowScheduleDialog(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="scheduledDate">{t('editor.schedule.date')}</Label>
                  <Input
                    type="date"
                    id="scheduledDate"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledTime">{t('editor.schedule.time')}</Label>
                  <Input
                    type="time"
                    id="scheduledTime"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    {t('editor.schedule.message')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowScheduleDialog(false)}
                  disabled={isScheduling}
                >
                  {t('editor.schedule.cancel')}
                </Button>
                <Button
                  variant="primary"
                  icon={<Clock className="w-4 h-4" />}
                  onClick={handleSchedule}
                  loading={isScheduling}
                  disabled={isScheduling || !scheduledDate || !scheduledTime}
                >
                  {t('editor.schedule.schedulePost')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PostEditorPage;
