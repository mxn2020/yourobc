// src/features/system/payments/config/plans-config.ts
/**
 * Pricing Plans Configuration
 * 
 * Define your pricing tiers here - works with any provider
 */

import type { PricingPlan } from '../types';

export const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    displayPrice: '$0',
    currency: 'USD',
    interval: 'month',
    intervalDisplay: 'forever',
    features: [
      { key: 'ai_requests', name: 'AI Requests', included: true, limit: 10 },
      { key: 'projects', name: 'Projects', included: true, limit: 1 },
      { key: 'storage', name: 'Storage', included: true, limit: 1 },
      { key: 'team_members', name: 'Team Members', included: false },
      { key: 'priority_support', name: 'Priority Support', included: false },
    ],
    limits: {
      aiRequests: 10,
      projects: 1,
      storage: 1,
      teamMembers: 1,
    },
    isPopular: false,
    trialDays: 0,
    ctaText: 'Get Started',
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals and small teams',
    price: 1900,
    displayPrice: '$19',
    currency: 'USD',
    interval: 'month',
    intervalDisplay: 'per month',
    features: [
      { key: 'ai_requests', name: 'AI Requests', included: true, limit: 100 },
      { key: 'projects', name: 'Projects', included: true, limit: 5 },
      { key: 'storage', name: 'Storage', included: true, limit: 10 },
      { key: 'team_members', name: 'Team Members', included: true, limit: 3 },
      { key: 'priority_support', name: 'Email Support', included: true },
    ],
    limits: {
      aiRequests: 100,
      projects: 5,
      storage: 10,
      teamMembers: 3,
    },
    isPopular: false,
    trialDays: 14,
    ctaText: 'Start Free Trial',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses',
    price: 4900,
    displayPrice: '$49',
    currency: 'USD',
    interval: 'month',
    intervalDisplay: 'per month',
    features: [
      { key: 'ai_requests', name: 'AI Requests', included: true, limit: 500 },
      { key: 'projects', name: 'Projects', included: true, unlimited: true },
      { key: 'storage', name: 'Storage', included: true, limit: 50 },
      { key: 'team_members', name: 'Team Members', included: true, limit: 10 },
      { key: 'priority_support', name: 'Priority Support', included: true },
      { key: 'custom_integrations', name: 'Custom Integrations', included: true },
    ],
    limits: {
      aiRequests: 500,
      projects: 999999,
      storage: 50,
      teamMembers: 10,
    },
    isPopular: true,
    trialDays: 14,
    ctaText: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 19900,
    displayPrice: '$199',
    currency: 'USD',
    interval: 'month',
    intervalDisplay: 'per month',
    features: [
      { key: 'ai_requests', name: 'AI Requests', included: true, unlimited: true },
      { key: 'projects', name: 'Projects', included: true, unlimited: true },
      { key: 'storage', name: 'Storage', included: true, unlimited: true },
      { key: 'team_members', name: 'Team Members', included: true, unlimited: true },
      { key: 'priority_support', name: '24/7 Support', included: true },
      { key: 'custom_integrations', name: 'Custom Integrations', included: true },
      { key: 'advanced_analytics', name: 'Advanced Analytics', included: true },
      { key: 'sso', name: 'SSO & SAML', included: true },
    ],
    limits: {
      aiRequests: 999999,
      projects: 999999,
      storage: 999999,
      teamMembers: 999999,
    },
    isPopular: false,
    trialDays: 30,
    ctaText: 'Contact Sales',
  },
];

export function getPlanById(planId: string): PricingPlan | undefined {
  return DEFAULT_PLANS.find((plan) => plan.id === planId);
}

export function formatPrice(priceInCents: number, currency: string = 'USD'): string {
  const price = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}