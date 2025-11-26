// convex/lib/marketing/newsletters/index.ts

export { NEWSLETTER_CONSTANTS } from './constants';
export type { NewsletterStatus, SubscriberStatus } from './constants';
export * from './types';

export { getNewsletters, getNewsletter, getCampaigns, getCampaign, getNewsletterStats } from './queries';
export { createNewsletter, updateNewsletter, deleteNewsletter, createCampaign, updateCampaign, deleteCampaign } from './mutations';
export { validateNewsletterData, validateCampaignData, isCampaignSent, calculateOpenRate, calculateClickRate, getStatusColor } from './utils';
export {
  canViewNewsletter,
  canEditNewsletter,
  canDeleteNewsletter,
  canViewCampaign,
  canEditCampaign,
  canDeleteCampaign,
  requireViewAccessNewsletter,
  requireEditAccessNewsletter,
  requireDeleteAccessNewsletter,
  requireViewAccessCampaign,
  requireEditAccessCampaign,
  requireDeleteAccessCampaign,
} from './permissions';
