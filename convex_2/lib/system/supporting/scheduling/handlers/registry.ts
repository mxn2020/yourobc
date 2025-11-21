// convex/lib/system/supporting/scheduling/handlers/registry.ts

import type { SchedulingHandler, HandlerRegistration } from './types';
import type { SchedulingHandlerConfig } from '@/shared/types';
import { eventHandler } from './event';
import { blogPostHandler } from './blog';

/**
 * Global handler registry
 * All scheduling handlers must be registered here
 */
const HANDLERS = new Map<string, HandlerRegistration>();

/**
 * Register a scheduling handler
 */
export function registerHandler(handler: SchedulingHandler, enabled: boolean = true): void {
  HANDLERS.set(handler.type, { handler, enabled });
}

/**
 * Get a handler by type
 */
export function getHandler(type: string): SchedulingHandler | undefined {
  const registration = HANDLERS.get(type);
  return registration?.enabled ? registration.handler : undefined;
}

/**
 * Get all registered handlers
 */
export function getAllHandlers(): SchedulingHandler[] {
  return Array.from(HANDLERS.values())
    .filter((registration) => registration.enabled)
    .map((registration) => registration.handler);
}

/**
 * Get all handler configurations (for UI)
 */
export function getHandlerConfigs(): SchedulingHandlerConfig[] {
  return getAllHandlers().map((handler) => ({
    type: handler.type,
    name: handler.name,
    description: handler.description,
    autoProcess: handler.autoProcess,
    icon: handler.icon,
    color: handler.color,
  }));
}

/**
 * Check if a handler type exists and is enabled
 */
export function isHandlerRegistered(type: string): boolean {
  const registration = HANDLERS.get(type);
  return registration !== undefined && registration.enabled;
}

/**
 * Get auto-processable handler types
 */
export function getAutoProcessableHandlers(): SchedulingHandler[] {
  return getAllHandlers().filter((handler) => handler.autoProcess);
}

/**
 * Enable/disable a handler
 */
export function setHandlerEnabled(type: string, enabled: boolean): void {
  const registration = HANDLERS.get(type);
  if (registration) {
    registration.enabled = enabled;
  }
}

// ============================================================================
// REGISTER DEFAULT HANDLERS
// ============================================================================

// Register default event handler (manual events, meetings, etc.)
registerHandler(eventHandler, true);

// Register blog post handler (auto-publish)
registerHandler(blogPostHandler, true);

// Future handlers can be added here:
// registerHandler(socialMediaHandler, true);
// registerHandler(emailCampaignHandler, true);
// etc.
