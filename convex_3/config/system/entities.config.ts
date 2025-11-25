// convex/config/system/entities.config.ts
// ⚠️ SYSTEM FILE - DO NOT MODIFY IN YOUR APPS
// This file is part of the system and will be updated with new releases.
// To add your own entity types, use convex/config/app/entities.config.ts instead.

/**
 * Entity types are now organized into domain-specific files for better maintainability.
 * See: convex/config/system/entities/
 *
 * Structure:
 * - system.entities.ts - Core system functionality
 * - email.entities.ts - Email system entities
 * - auth.entities.ts - User and team management
 * - projects.entities.ts - Project and task management
 * - supporting.entities.ts - Comments, documents, reminders, wiki
 */

export * from './entities';
