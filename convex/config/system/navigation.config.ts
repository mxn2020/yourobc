// convex/config/system/navigation.config.ts
// ⚠️ BOILERPLATE FILE - DO NOT MODIFY IN YOUR APPS
// This file is part of the system and will be updated with new releases.
// To customize navigation, use convex/config/app/navigation.config.ts instead.

import { BarChart3, FolderOpen, Brain, TestTube, ClipboardList, Settings, Users, Lock, Activity, Shield, ListTodo } from 'lucide-react';
import type { NavigationItem } from '../types';

/**
 * Core dashboard navigation items
 * These appear when user is in the main dashboard view
 */
export const DASHBOARD_NAVIGATION: NavigationItem[] = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'projects', path: '/projects', label: 'Projects', icon: FolderOpen },
  { id: 'ai-models', path: '/ai-models', label: 'AI Models', icon: Brain },
  { id: 'ai-testing', path: '/ai-testing', label: 'AI Testing', icon: TestTube },
  { id: 'ai-logs', path: '/ai-logs', label: 'AI Logs', icon: ClipboardList },
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Admin panel navigation items
 * These appear when user is in the /admin section
 */
export const ADMIN_NAVIGATION: NavigationItem[] = [
  { id: 'admin-dashboard', path: '/admin', label: 'Dashboard', icon: BarChart3 },
  { id: 'admin-users', path: '/admin/users', label: 'Users', icon: Users },
  { id: 'admin-permissions', path: '/admin/permissions', label: 'Permissions', icon: Lock },
  { id: 'admin-audit-logs', path: '/admin/audit-logs', label: 'Audit Logs', icon: Activity },
  { id: 'admin-advanced-audit-logs', path: '/admin/advanced-audit-logs', label: 'Advanced Audit Logs', icon: ClipboardList },
  { id: 'admin-settings', path: '/admin/settings', label: 'Settings', icon: Settings },
];

/**
 * Projects system navigation items
 * These appear when user is in the /projects section
 */
export const PROJECTS_NAVIGATION: NavigationItem[] = [
  { id: 'projects-dashboard', path: '/projects', label: 'Dashboard', icon: BarChart3 },
  { id: 'projects-list', path: '/projects', label: 'All Projects', icon: FolderOpen },
  { id: 'projects-tasks', path: '/projects/tasks', label: 'Tasks', icon: ListTodo },
  { id: 'projects-team', path: '/projects/team', label: 'Team', icon: Users },
];

/**
 * Section indicator configuration
 * Used to show which major section the user is in
 */
export const SECTION_INDICATORS = {
  admin: {
    icon: Shield,
    color: 'red' as const,
    label: 'Admin Panel',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
  },
  projects: {
    icon: FolderOpen,
    color: 'blue' as const,
    label: 'Projects',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
} as const;
