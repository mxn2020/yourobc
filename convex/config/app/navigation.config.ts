// convex/config/app/navigation.config.ts
// ✅ APP CUSTOMIZATION FILE - SAFE TO MODIFY
// This file is where you configure your app's addons and their navigation.
// Changes to this file will NOT conflict with boilerplate updates.

import { Bot, Lightbulb, GitBranch, Network, Files, GraduationCap, Swords, Sparkles, BookOpenText, BarChart3, MessageCircle, Layers, Activity, Settings, FileText, BookOpen, Users, ClipboardList, TrendingUp, CalendarDays, Briefcase, Building, DollarSign, Plus, Folder, Gamepad2, Trophy } from 'lucide-react';
import type { AddonConfig, NavigationItem } from '../types';

/**
 * Addon configurations
 * Define all addons available in your app
 *
 * Each addon needs:
 * - id: Unique identifier (used for routing and detection)
 * - name: Display name shown in UI
 * - path: Base URL path (e.g., '/chatbot')
 * - icon: Lucide icon component
 * - color: Tailwind color name for branding
 */
export const APP_ADDONS: AddonConfig[] = [
  { id: 'advanced-workflows', name: 'Advanced Workflow Builder', path: '/advanced-workflows', icon: Network, color: 'cyan' },
  { id: 'ai-academy', name: 'AI Academy', path: '/ai-academy', icon: GraduationCap, color: 'teal' },
  { id: 'chatbot', name: 'AI Chatbot', path: '/chatbot', icon: Bot, color: 'indigo' },
  { id: 'claude-workflows', name: 'Claude Workflow', path: '/claude-workflows', icon: GitBranch, color: 'violet' },
  { id: 'prompts', name: 'Prompts Studio', path: '/prompts', icon: Sparkles, color: 'purple' },
  { id: 'stories', name: 'Stories Studio', path: '/stories', icon: BookOpenText, color: 'emerald' },
  { id: 'geenius', name: 'Geenius AI Builder', path: '/geenius', icon: Lightbulb, color: 'blue' },
  { id: 'content-manager', name: 'Content Manager', path: '/content-manager', icon: Files, color: 'amber' },
  { id: 'wargame', name: 'Wargame', path: '/wargame', icon: Swords, color: 'rose' },
  { id: 'games', name: 'Games', path: '/games', icon: Gamepad2, color: 'green' },
];

/**
 * Navigation items per addon
 * Define the navigation menu items that appear when each addon is active
 */
export const ADDON_NAVIGATION: Record<string, NavigationItem[]> = {
  // Prompts addon navigation
  'prompts': [
    { id: 'prompts-library', path: '/prompts', label: 'Library', icon: FileText },
    { id: 'prompts-components', path: '/prompts/components', label: 'Components', icon: Layers },
    { id: 'prompts-new', path: '/prompts/new', label: 'Create', icon: Sparkles },
  ],

  // Stories addon navigation
  'stories': [
    { id: 'stories-dashboard', path: '/stories', label: 'Dashboard', icon: BarChart3 },
    { id: 'stories-universes', path: '/stories/universes', label: 'Universes', icon: BookOpen },
    { id: 'stories-create-universe', path: '/stories/universes/new', label: 'Create Universe', icon: Sparkles },
  ],

  // Chatbot addon navigation
  'chatbot': [
    { id: 'chatbot-dashboard', path: '/chatbot/dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chatbot-chat', path: '/chatbot/chat', label: 'Chat', icon: MessageCircle },
    { id: 'chatbot-templates', path: '/chatbot/templates', label: 'Templates', icon: Layers },
    { id: 'chatbot-workflows', path: '/chatbot/workflows', label: 'Workflows', icon: GitBranch },
    { id: 'chatbot-settings', path: '/chatbot/settings', label: 'Settings', icon: Settings },
  ],

  // Geenius addon navigation
  'geenius': [
    { id: 'geenius-projects', path: '/geenius', label: 'Projects', icon: Folder },
    { id: 'geenius-new', path: '/geenius/new', label: 'New Project', icon: Plus },
  ],

  // Advanced Workflow Builder addon navigation
  'advanced-workflows': [
    { id: 'advanced-workflows-dashboard', path: '/advanced-workflows', label: 'Dashboard', icon: BarChart3 },
    { id: 'advanced-workflows-workflows', path: '/advanced-workflows/workflows', label: 'Workflows', icon: Network },
    { id: 'advanced-workflows-builder', path: '/advanced-workflows/builder', label: 'Builder', icon: Layers },
    { id: 'advanced-workflows-executions', path: '/advanced-workflows/executions', label: 'Executions', icon: Activity },
    { id: 'advanced-workflows-analytics', path: '/advanced-workflows/analytics', label: 'Analytics', icon: TrendingUp },
  ],

  // Claude Workflow addon navigation
  'claude-workflows': [
    { id: 'claude-workflows-dashboard', path: '/claude-workflows', label: 'Dashboard', icon: BarChart3 },
    { id: 'claude-workflows-workflows', path: '/claude-workflows/workflows', label: 'Workflows', icon: Network },
    { id: 'claude-workflows-templates', path: '/claude-workflows/templates', label: 'Templates', icon: Layers },
    { id: 'claude-workflows-analytics', path: '/claude-workflows/analytics', label: 'Analytics', icon: TrendingUp },
  ],

  // Content Manager addon navigation
  'content-manager': [
    { id: 'content-manager-dashboard', path: '/content-manager', label: 'Dashboard', icon: BarChart3 },
    { id: 'content-manager-series', path: '/content-manager/series', label: 'Series', icon: BookOpen },
    { id: 'content-manager-templates', path: '/content-manager/templates', label: 'Templates', icon: FileText },
    { id: 'content-manager-analytics', path: '/content-manager/analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'content-manager-ai-assistant', path: '/content-manager/ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'content-manager-calendar', path: '/content-manager/calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'content-manager-assets', path: '/content-manager/assets', label: 'Assets', icon: Files },
  ],

  // AI Academy addon navigation
  'ai-academy': [
    { id: 'ai-academy-dashboard', path: '/ai-academy', label: 'Dashboard', icon: BarChart3 },
    { id: 'ai-academy-courses', path: '/ai-academy/courses', label: 'Courses', icon: GraduationCap },
    { id: 'ai-academy-students', path: '/ai-academy/students', label: 'Students', icon: Users },
    { id: 'ai-academy-enrollments', path: '/ai-academy/enrollments', label: 'Enrollments', icon: ClipboardList },
    { id: 'ai-academy-sessions', path: '/ai-academy/sessions', label: 'Sessions', icon: Activity },
    { id: 'ai-academy-instructor', path: '/ai-academy/instructor', label: 'Instructor Portal', icon: Briefcase },
    { id: 'ai-academy-communications', path: '/ai-academy/communications/messages', label: 'Communications', icon: MessageCircle },
    { id: 'ai-academy-parent-portal', path: '/ai-academy/parent-portal', label: 'Parent Portal', icon: Users },
    { id: 'ai-academy-student-portal', path: '/ai-academy/student-portal/kidslab', label: 'Student Portal', icon: BookOpen },
  ],

  // Wargame addon navigation
  'wargame': [
    { id: 'wargame-city', path: '/wargame/city', label: 'City', icon: Building },
    { id: 'wargame-military', path: '/wargame/military', label: 'Military', icon: Swords },
    { id: 'wargame-battles', path: '/wargame/battles', label: 'Battles', icon: Activity },
    { id: 'wargame-market', path: '/wargame/market', label: 'Market', icon: DollarSign },
  ],

  // Games addon navigation
  'games': [
    { id: 'games-lobby', path: '/games', label: 'Game Lobby', icon: Gamepad2 },
    { id: 'games-dino-jump', path: '/games/dino-jump', label: 'Dino Jump', icon: Gamepad2 },
    { id: 'games-leaderboard', path: '/games', label: 'Leaderboards', icon: Trophy },
  ],
};

/**
 * CUSTOMIZATION GUIDE
 *
 * To add a new addon:
 * 1. Add an entry to APP_ADDONS array above
 * 2. Add navigation items to ADDON_NAVIGATION object
 * 3. Import any new icons from 'lucide-react' at the top
 * 4. Update entity types in entities.config.ts if needed
 *
 * To remove an addon:
 * 1. Remove from APP_ADDONS array
 * 2. Remove from ADDON_NAVIGATION object
 * 3. Remove entity types from entities.config.ts if applicable
 *
 * Example - Adding a CRM addon:
 *
 * // 1. Add to APP_ADDONS:
 * { id: 'crm', name: 'CRM', path: '/crm', icon: Briefcase, color: 'green' },
 *
 * // 2. Add to ADDON_NAVIGATION:
 * 'crm': [
 *   { id: 'crm-dashboard', path: '/crm', label: 'Dashboard', icon: BarChart3 },
 *   { id: 'crm-contacts', path: '/crm/contacts', label: 'Contacts', icon: Users },
 *   { id: 'crm-companies', path: '/crm/companies', label: 'Companies', icon: Building },
 * ],
 */
