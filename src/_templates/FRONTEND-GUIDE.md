# Frontend Implementation Guide

> Complete reference for implementing React features with the standardized template system and Convex backend.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Feature Structure](#feature-structure)
3. [Implementation Steps](#implementation-steps)
4. [Service Layer](#service-layer)
5. [Hooks Layer](#hooks-layer)
6. [Component Layer](#component-layer)
7. [Pages Layer](#pages-layer)
8. [Types & Constants](#types--constants)
9. [Consistency Review](#consistency-review)
10. [Best Practices](#best-practices)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Feature File Structure

Every feature follows this standard structure:

```
src/features/{category}/{feature}/
├── types/
│   ├── index.ts              # Main type exports
│   └── {subfeature}.types.ts # Sub-feature types (optional)
│
├── constants/
│   └── index.ts              # UI constants (imports backend constants)
│
├── services/
│   └── {Feature}Service.ts   # Data fetching & mutations
│
├── hooks/
│   ├── use{Feature}.ts       # Main feature hook
│   ├── use{Feature}Permissions.ts  # Permission hooks
│   └── use{Feature}Audit.ts  # Audit logging hooks (optional)
│
├── components/
│   ├── {Feature}Card.tsx     # Card display component
│   ├── {Feature}Form.tsx     # Create/edit form
│   ├── {Feature}Stats.tsx    # Statistics display
│   ├── {Feature}Filters.tsx  # Filter controls
│   ├── {Feature}Table.tsx    # Table view
│   └── index.ts              # Component exports
│
├── pages/
│   ├── {Feature}sPage.tsx    # List/index page
│   ├── {Feature}DetailsPage.tsx  # Details page
│   ├── Create{Feature}Page.tsx   # Creation page
│   └── Edit{Feature}Page.tsx     # Edit page (optional)
│
├── utils/                     # Feature utilities (optional)
│   └── {feature}Helpers.ts
│
└── index.ts                   # Public API exports
```

### Categories

- `boilerplate` - Core system features (auth, users, projects)
- `apps` - Full application features
- `addons` - Reusable feature modules
- `games` - Game-specific features

### Search & Replace Placeholders

| Placeholder | Replace With | Example |
|------------|--------------|---------|
| `{category}` | Category name | `boilerplate`, `apps`, `addons` |
| `{feature}` | Feature name (lowercase) | `projects`, `users`, `tasks` |
| `{Feature}` | PascalCase feature | `Projects`, `Users`, `Tasks` |
| `{FEATURE}` | SCREAMING_SNAKE | `PROJECTS`, `USERS`, `TASKS` |
| `{entity}` | Backend entity name | `projects`, `tasks` |

---

## 📁 Feature Structure

### Types Directory (`src/features/{category}/{feature}/types/`)

```
types/
├── index.ts          # Main type exports from backend + UI-specific types
└── {sub}.types.ts    # Optional sub-feature types (tasks, milestones, etc.)
```

### Constants Directory (`src/features/{category}/{feature}/constants/`)

```
constants/
└── index.ts          # Re-export backend constants + UI-specific constants
```

### Services Directory (`src/features/{category}/{feature}/services/`)

```
services/
└── {Feature}Service.ts   # Service class with query/mutation hooks
```

### Hooks Directory (`src/features/{category}/{feature}/hooks/`)

```
hooks/
├── use{Feature}.ts           # Main feature hook with business logic
├── use{Feature}Permissions.ts # Permission checking hooks
└── use{Feature}Audit.ts       # Audit logging (optional)
```

### Components Directory (`src/features/{category}/{feature}/components/`)

```
components/
├── {Feature}Card.tsx         # Display card
├── {Feature}Form.tsx         # Create/edit form
├── {Feature}Stats.tsx        # Statistics
├── {Feature}Filters.tsx      # Filtering UI
├── {Feature}Table.tsx        # Table view
├── {Feature}PageHeader.tsx   # Page header
└── index.ts                  # Export all components
```

### Pages Directory (`src/features/{category}/{feature}/pages/`)

```
pages/
├── {Feature}sPage.tsx        # List/index page
├── {Feature}DetailsPage.tsx  # Details page
├── Create{Feature}Page.tsx   # Creation page
└── Edit{Feature}Page.tsx     # Edit page (optional)
```

---

## 🔄 Implementation Steps

### Phase 1: Setup Types & Constants

1. Create feature directory structure
2. Define types in `types/index.ts`
3. Import backend constants in `constants/index.ts`
4. Add UI-specific constants

### Phase 2: Service Layer

5. Create service class in `services/{Feature}Service.ts`
6. Implement query option factories
7. Implement query hooks
8. Implement mutation hooks

### Phase 3: Hooks Layer

9. Create permission hooks in `hooks/use{Feature}Permissions.ts`
10. Create audit hooks in `hooks/use{Feature}Audit.ts` (optional)
11. Create main feature hook in `hooks/use{Feature}.ts`
12. Implement action functions with validation & audit logging

### Phase 4: Components

13. Create form component `{Feature}Form.tsx`
14. Create card component `{Feature}Card.tsx`
15. Create stats component `{Feature}Stats.tsx`
16. Create filters component `{Feature}Filters.tsx`
17. Create table component `{Feature}Table.tsx`
18. Export all from `components/index.ts`

### Phase 5: Pages

19. Create list page `{Feature}sPage.tsx`
20. Create details page `{Feature}DetailsPage.tsx`
21. Create creation page `Create{Feature}Page.tsx`
22. Add routes in router configuration

### Phase 6: Testing & Polish

23. Test all CRUD operations
24. Verify permissions work correctly
25. Check SSR/caching behavior
26. Add loading states
27. Add error handling
28. Review consistency checklist

---

## 📋 Service Layer

### Service Class Structure

The service layer handles all data fetching and mutations using TanStack Query and Convex.

**Purpose:**
- Provide query option factories for SSR
- Provide query hooks for components
- Provide mutation hooks for data changes
- Keep query keys consistent

**Key Points:**
- NO business logic here (that goes in hooks)
- NO authentication/authorization (that's in backend)
- Focused on data fetching only
- Must provide both factories and hooks

```typescript
// src/features/{category}/{feature}/services/{Feature}Service.ts
// Data fetching and mutation service for {feature}

import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type {
  Create{Feature}Data,
  Update{Feature}Data,
  {Feature}Id,
  {Feature}sListOptions
} from "../types";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * {Feature} Service
 *
 * Handles data fetching and mutations.
 * ⚠️ NO business logic here - that's in hooks!
 * ⚠️ NO authentication/authorization - that's in the backend!
 */
export class {Feature}Service {
  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options for SSR and hooks
  // ensuring consistent query keys for cache hits
  // ==========================================

  get{Feature}sQueryOptions(options?: {Feature}sListOptions) {
    return convexQuery(api.lib.{category}.{entity}.queries.get{Feature}s, {
      options,
    });
  }

  get{Feature}QueryOptions({feature}Id: {Feature}Id) {
    return convexQuery(api.lib.{category}.{entity}.queries.get{Feature}, {
      {feature}Id,
    });
  }

  get{Feature}ByPublicIdQueryOptions(publicId: string) {
    return convexQuery(api.lib.{category}.{entity}.queries.get{Feature}ByPublicId, {
      publicId,
    });
  }

  get{Feature}StatsQueryOptions(targetUserId?: Id<"userProfiles">) {
    return convexQuery(api.lib.{category}.{entity}.queries.get{Feature}Stats, {
      targetUserId,
    });
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  use{Feature}s(options?: {Feature}sListOptions) {
    return useQuery({
      ...this.get{Feature}sQueryOptions(options),
      staleTime: 30000, // 30 seconds
    });
  }

  use{Feature}({feature}Id?: {Feature}Id) {
    return useQuery({
      ...this.get{Feature}QueryOptions({feature}Id!),
      staleTime: 30000,
      enabled: !!{feature}Id,
    });
  }

  use{Feature}ByPublicId(publicId?: string) {
    return useQuery({
      ...this.get{Feature}ByPublicIdQueryOptions(publicId!),
      staleTime: 30000,
      enabled: !!publicId,
    });
  }

  use{Feature}Stats(targetUserId?: Id<"userProfiles">) {
    return useQuery({
      ...this.get{Feature}StatsQueryOptions(targetUserId),
      staleTime: 60000, // 1 minute
    });
  }

  // ==========================================
  // MUTATION HOOKS
  // ==========================================

  useCreate{Feature}() {
    const mutationFn = useConvexMutation(api.lib.{category}.{entity}.mutations.create{Feature});
    return useMutation({ mutationFn });
  }

  useUpdate{Feature}() {
    const mutationFn = useConvexMutation(api.lib.{category}.{entity}.mutations.update{Feature});
    return useMutation({ mutationFn });
  }

  useDelete{Feature}() {
    const mutationFn = useConvexMutation(api.lib.{category}.{entity}.mutations.delete{Feature});
    return useMutation({ mutationFn });
  }

  // ==========================================
  // UTILITY FUNCTIONS (No Business Logic)
  // ==========================================

  format{Feature}Name({feature}: { title: string; _id?: {Feature}Id }): string {
    return {feature}.title || `{Feature} ${{feature}._id || "Unknown"}`;
  }
}

export const {feature}Service = new {Feature}Service();
```

### Service Key Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `get{Feature}sQueryOptions` | Factory for list query | `getProjectsQueryOptions` |
| `get{Feature}QueryOptions` | Factory for single item | `getProjectQueryOptions` |
| `get{Feature}StatsQueryOptions` | Factory for stats | `getProjectStatsQueryOptions` |
| `use{Feature}s` | Hook for list query | `useProjects` |
| `use{Feature}` | Hook for single item | `useProject` |
| `useCreate{Feature}` | Mutation hook for create | `useCreateProject` |
| `useUpdate{Feature}` | Mutation hook for update | `useUpdateProject` |
| `useDelete{Feature}` | Mutation hook for delete | `useDeleteProject` |

---

## 🪝 Hooks Layer

### Main Feature Hook

**Purpose:**
- Combine service queries with business logic
- Add validation before mutations
- Integrate audit logging
- Provide clean action functions
- Handle error parsing

**Key Points:**
- Import from service layer (no direct Convex calls)
- Validate data before mutations
- Call audit hooks after successful mutations
- Parse errors for display
- Return clean, semantic API

```typescript
// src/features/{category}/{feature}/hooks/use{Feature}.ts
// Main {feature} hook with business logic

import { useCallback, useMemo, useEffect, useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { use{Feature}Audit } from "./use{Feature}Audit";
import { {feature}Service } from "../services/{Feature}Service";
import { parseConvexError } from "@/utils/errorHandling";
import * as {feature}Helpers from "../utils/{feature}Helpers";
import type {
  Create{Feature}Data,
  {Feature}Id,
  {Feature}sListOptions,
  Update{Feature}Data,
} from "../types";
import { Id } from "@/convex/_generated/dataModel";

// Generate unique ID for each hook instance
let instanceCounter = 0;

/**
 * Main {feature} hook
 * Handles data fetching, mutations, validation, and audit logging
 */
export function use{Feature}s(options?: {Feature}sListOptions) {
  // Create unique timer ID for this hook instance
  const instanceId = useRef(++instanceCounter);
  const timerLabel = `use{Feature}s: Data Fetch [${instanceId.current}]`;

  // Track data fetching performance with unique timer ID
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  // Core data queries
  const {
    data: {feature}sQuery,
    isPending,
    error,
    refetch
  } = {feature}Service.use{Feature}s(options);

  // Stats query
  const {
    data: stats,
    isPending: isStatsLoading
  } = {feature}Service.use{Feature}Stats();

  // Log when data is loaded (dev mode only)
  useEffect(() => {
    if (import.meta.env.DEV && !isPending && {feature}sQuery) {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        const source = duration < 10 ? "from SSR cache" : "from WebSocket";
        console.log(
          `${timerLabel}: ${duration.toFixed(2)}ms - Loaded ${
            {feature}sQuery.{feature}s?.length || 0
          } {feature}s ${source}`
        );
        startTimeRef.current = undefined; // Clear to prevent duplicate logs
      }
    }
  }, [isPending, {feature}sQuery, timerLabel]);

  // Audit logging
  const {
    log{Feature}Created,
    log{Feature}Updated,
    log{Feature}Deleted,
    log{Feature}Viewed,
  } = use{Feature}Audit();

  // Mutations
  const create{Feature}Mutation = {feature}Service.useCreate{Feature}();
  const update{Feature}Mutation = {feature}Service.useUpdate{Feature}();
  const delete{Feature}Mutation = {feature}Service.useDelete{Feature}();

  // Parse error
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null;
  }, [error]);

  const isPermissionError = parsedError?.code === "PERMISSION_DENIED";

  // Enhanced action functions with audit logging
  const create{Feature} = useCallback(
    async (data: Create{Feature}Data) => {
      const errors = {feature}Helpers.validate{Feature}Data(data);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      const result = await create{Feature}Mutation.mutateAsync({ data });

      // ✅ No try-catch needed - audit hook handles failures internally
      log{Feature}Created(result._id, data.title, data);

      return result;
    },
    [create{Feature}Mutation, log{Feature}Created]
  );

  const update{Feature} = useCallback(
    async ({feature}Id: {Feature}Id, updates: Update{Feature}Data) => {
      const errors = {feature}Helpers.validate{Feature}Data(updates);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      const current{Feature} = {feature}sQuery?.{feature}s?.find((p) => p._id === {feature}Id);
      if (!current{Feature}) {
        throw new Error("{Feature} not found");
      }

      const result = await update{Feature}Mutation.mutateAsync({
        {feature}Id,
        updates,
      });

      // ✅ Clean - no error handling needed
      log{Feature}Updated({feature}Id, current{Feature}.title, current{Feature}, updates);

      return result;
    },
    [update{Feature}Mutation, log{Feature}Updated, {feature}sQuery]
  );

  const delete{Feature} = useCallback(
    async ({feature}Id: {Feature}Id, hardDelete = false) => {
      const {feature}ToDelete = {feature}sQuery?.{feature}s?.find((p) => p._id === {feature}Id);
      if (!{feature}ToDelete) {
        throw new Error("{Feature} not found");
      }

      const result = await delete{Feature}Mutation.mutateAsync({ {feature}Id, hardDelete });

      // Log deletion
      log{Feature}Deleted({feature}Id, {feature}ToDelete.title, {feature}ToDelete, hardDelete).catch(
        console.warn
      );

      return result;
    },
    [delete{Feature}Mutation, log{Feature}Deleted, {feature}sQuery]
  );

  const view{Feature} = useCallback(
    async ({feature}Id: {Feature}Id) => {
      const {feature} = {feature}sQuery?.{feature}s?.find((p) => p._id === {feature}Id);
      if ({feature} && {feature}.visibility === "private") {
        log{Feature}Viewed({feature}Id, {feature}.title).catch(console.warn);
      }
    },
    [log{Feature}Viewed, {feature}sQuery]
  );

  return {
    // Data
    {feature}s: {feature}sQuery?.{feature}s || [],
    total: {feature}sQuery?.total || 0,
    hasMore: {feature}sQuery?.hasMore || false,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    stats,

    // Actions
    create{Feature},
    update{Feature},
    delete{Feature},
    view{Feature},
    refetch,

    // Loading states
    isUpdating:
      create{Feature}Mutation.isPending ||
      update{Feature}Mutation.isPending ||
      delete{Feature}Mutation.isPending,
    isCreating: create{Feature}Mutation.isPending,
    isDeleting: delete{Feature}Mutation.isPending,

    // Raw mutations
    mutations: {
      create{Feature}: create{Feature}Mutation,
      update{Feature}: update{Feature}Mutation,
      delete{Feature}: delete{Feature}Mutation,
    },
  };
}

// ==========================================
// SUSPENSE QUERY HOOKS
// These hooks use useSuspenseQuery with service-provided query options
// Perfect for components that need guaranteed data (SSR-friendly)
// ==========================================

/**
 * Hook for {feature}s list data using Suspense
 * Uses SSR cache when available, suspends and fetches if not
 *
 * @example
 * const { data: {feature}sData } = use{Feature}sList({ limit: 100 })
 */
export function use{Feature}sList(options?: {Feature}sListOptions) {
  const startTime = performance.now();
  const result = useSuspenseQuery({feature}Service.get{Feature}sQueryOptions(options));

  // Log data access timing
  const duration = performance.now() - startTime;
  const source = duration < 10 ? "SSR cache" : "WebSocket";

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`use{Feature}sList: Accessed data in ${duration.toFixed(2)}ms from ${source}`);
      console.log(`use{Feature}sList: Loaded ${result.data?.{feature}s?.length || 0} {feature}s`);
    }
  }, [duration, source, result.data?.{feature}s?.length]);

  return result;
}

/**
 * Hook for {feature} stats using Suspense
 */
export function use{Feature}Stats(targetUserId?: Id<"userProfiles">) {
  return useSuspenseQuery({feature}Service.get{Feature}StatsQueryOptions(targetUserId));
}

/**
 * Hook for single {feature} data using Suspense
 */
export function use{Feature}Suspense({feature}Id: {Feature}Id) {
  return useSuspenseQuery({feature}Service.get{Feature}QueryOptions({feature}Id));
}

/**
 * Additional convenience hooks
 */
export function use{Feature}({feature}Id: {Feature}Id | undefined) {
  const result = {feature}Service.use{Feature}({feature}Id);
  const { log{Feature}Viewed } = use{Feature}Audit();

  // Auto-log {feature} views for private {feature}s
  useEffect(() => {
    if ({feature}Id && result.data && result.data.visibility === "private") {
      log{Feature}Viewed({feature}Id, result.data.title).catch(console.warn);
    }
  }, [result.data, {feature}Id, log{Feature}Viewed]);

  return result;
}

// Export mutation hooks
export function useCreate{Feature}() {
  return {feature}Service.useCreate{Feature}();
}

export function useUpdate{Feature}() {
  return {feature}Service.useUpdate{Feature}();
}

export function useDelete{Feature}() {
  return {feature}Service.useDelete{Feature}();
}
```

### Permission Hooks

```typescript
// src/features/{category}/{feature}/hooks/use{Feature}Permissions.ts
// Permission checking hooks for {feature}

import { useAuth } from "@/features/boilerplate/auth";
import type { {Feature}, {Feature}Id } from "../types";

/**
 * Check if user can create {feature}s
 */
export function useCanCreate{Feature}s(): boolean {
  const { user } = useAuth();

  if (!user) return false;

  // Admins and superadmins can always create
  if (user.role === "admin" || user.role === "superadmin") return true;

  // Check user has create permission
  // Note: Backend will do the final check
  return true;
}

/**
 * Check if user can edit a specific {feature}
 */
export function useCanEdit{Feature}({feature}?: {Feature}): boolean {
  const { user } = useAuth();

  if (!user || !{feature}) return false;

  // Admins can edit all
  if (user.role === "admin" || user.role === "superadmin") return true;

  // Owner can edit
  if ({feature}.ownerId === user._id) return true;

  // Check if {feature} is locked
  if ({feature}.status === "completed" || {feature}.status === "archived") {
    return false;
  }

  return false;
}

/**
 * Check if user can delete a specific {feature}
 */
export function useCanDelete{Feature}({feature}?: {Feature}): boolean {
  const { user } = useAuth();

  if (!user || !{feature}) return false;

  // Admins can delete all
  if (user.role === "admin" || user.role === "superadmin") return true;

  // Owner can delete
  if ({feature}.ownerId === user._id) return true;

  return false;
}
```

---

## 🎨 Component Layer

### Form Component

**Purpose:** Handle create/edit operations with validation

**Key Points:**
- Support both create and edit modes
- Client-side validation
- Show field errors
- Handle loading states
- Use constants for limits

```typescript
// src/features/{category}/{feature}/components/{Feature}Form.tsx
// Create/edit form for {feature}

import { FC, useState } from 'react'
import { Button, Checkbox, Input, Label, SimpleSelect, Textarea } from '@/components/ui'
import { {FEATURE}_CONSTANTS } from '../constants'
import { useToast } from '@/features/boilerplate/notifications'
import { useTranslation } from '@/features/boilerplate/i18n'
import type { Create{Feature}Data, Update{Feature}Data, {Feature} } from '../types'

interface {Feature}FormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<{Feature}>
  onSubmit: (data: Create{Feature}Data | Update{Feature}Data) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const {Feature}Form: FC<{Feature}FormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation('{feature}s')
  const toast = useToast()

  const submitLabel = mode === 'create'
    ? t('form.buttons.create')
    : t('form.buttons.update')

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || {FEATURE}_CONSTANTS.PRIORITY.MEDIUM,
    visibility: initialData?.visibility || {FEATURE}_CONSTANTS.VISIBILITY.PRIVATE,
    category: initialData?.category || '',
    tags: initialData?.tags?.join(', ') || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = t('form.validation.titleRequired')
    } else if (formData.title.length > {FEATURE}_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      newErrors.title = t('form.validation.titleTooLong')
    }

    if (formData.description.length > {FEATURE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      newErrors.description = t('form.validation.descriptionTooLong')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error(t('form.validation.fixErrors'))
      return
    }

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, {FEATURE}_CONSTANTS.LIMITS.MAX_TAGS)

    if (mode === 'create') {
      const createData: Create{Feature}Data = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        visibility: formData.visibility,
        category: formData.category.trim() || undefined,
        tags,
      }
      onSubmit(createData)
    } else {
      const updateData: Update{Feature}Data = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        visibility: formData.visibility,
        category: formData.category.trim() || undefined,
        tags,
      }
      onSubmit(updateData)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields here */}
      <div>
        <Input
          label={t('form.labels.title')}
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder={t('form.placeholders.title')}
          required
          error={errors.title}
        />
      </div>

      <div>
        <Textarea
          label={t('form.labels.description')}
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          placeholder={t('form.placeholders.description')}
          error={errors.description}
        />
      </div>

      {/* More fields... */}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('form.buttons.cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          loading={isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
```

### Card Component

**Purpose:** Display individual item in grid/list view

**Key Points:**
- Show key information
- Handle click events
- Show status/priority badges
- Support action buttons
- Responsive design

```typescript
// src/features/{category}/{feature}/components/{Feature}Card.tsx
// Display card for {feature} item

import { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { Badge, Card, CardHeader, CardContent } from '@/components/ui';
import { useTranslation } from '@/features/boilerplate/i18n';
import { getCurrentLocale } from '@/features/boilerplate/i18n/utils/path';
import { PRIORITY_COLORS, STATUS_ICONS } from '../constants';
import type { {Feature} } from '../types';

interface {Feature}CardProps {
  {feature}: {Feature};
  onClick?: () => void;
  trackViews?: boolean;
}

export const {Feature}Card: FC<{Feature}CardProps> = ({
  {feature},
  onClick,
  trackViews = false
}) => {
  const { t } = useTranslation('{feature}s');
  const locale = getCurrentLocale();

  return (
    <Link
      to="/${{-$locale}}/{feature}s/${{feature}Id}"
      params={{ locale, {feature}Id: {feature}._id }}
      onClick={onClick}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{feature}.title}</h3>
            <Badge className={PRIORITY_COLORS[{feature}.priority]}>
              {t(`priority.${{feature}.priority}`)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {feature}.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {feature}.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {STATUS_ICONS[{feature}.status]}
              {t(`status.${{feature}.status}`)}
            </span>

            {feature}.tags.length > 0 && (
              <div className="flex gap-1">
                {feature}.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
```

---

## 📄 Pages Layer

### List Page

**Purpose:** Display list/grid of items with filters

**Key Points:**
- Use Suspense hooks for SSR
- Client-side filtering for UX
- Support multiple view modes
- Show stats/summary
- Handle empty states

```typescript
// src/features/{category}/{feature}/pages/{Feature}sPage.tsx
// List/index page for {feature}s

import { FC, useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { {Feature}Card } from "../components/{Feature}Card";
import { {Feature}Stats } from "../components/{Feature}Stats";
import { {Feature}Filters } from "../components/{Feature}Filters";
import { use{Feature}sList, use{Feature}Stats } from "../hooks/use{Feature}s";
import { useCanCreate{Feature}s } from "../hooks/use{Feature}Permissions";
import { useTranslation } from "@/features/boilerplate/i18n";
import { Loading, ErrorState, EmptyState } from "@/components/ui";
import type { {Feature} } from "../types";
import { getCurrentLocale } from "@/features/boilerplate/i18n/utils/path";

export const {Feature}sPage: FC = () => {
  // ✅ Clean hooks using service layer
  // These use useSuspenseQuery internally with service-provided query options
  // SSR cache is automatically utilized when available
  const { data: {feature}sData } = use{Feature}sList({ limit: 100 })
  const { data: stats } = use{Feature}Stats()

  const { t } = useTranslation("{feature}s");
  const navigate = useNavigate();
  const locale = getCurrentLocale();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const canCreate = useCanCreate{Feature}s();

  const {feature}s = {feature}sData?.{feature}s || [];

  // Filter {feature}s (client-side for UX responsiveness)
  const filtered{Feature}s = useMemo(() => {
    return {feature}s.filter(({feature}) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          {feature}.title.toLowerCase().includes(searchLower) ||
          {feature}.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (statusFilter && {feature}.status !== statusFilter) return false;
      if (priorityFilter && {feature}.priority !== priorityFilter) return false;

      return true;
    });
  }, [{feature}s, searchTerm, statusFilter, priorityFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  const hasActiveFilters = Boolean(searchTerm || statusFilter || priorityFilter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('page.title')}</h1>
          {canCreate && (
            <Link to="/${{-$locale}}/{feature}s/new" params={{ locale }}>
              <button className="btn-primary">
                {t('page.createNew')}
              </button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <{Feature}Stats stats={stats} />

        {/* Filters */}
        <{Feature}Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onClearFilters={handleClearFilters}
          showClearButton={hasActiveFilters}
        />

        {/* Results */}
        {filtered{Feature}s.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? t("page.noResultsFound") : t("page.no{Feature}s")}
            description={
              hasActiveFilters
                ? t("page.tryAdjusting")
                : canCreate
                ? t("page.createFirst")
                : t("page.{feature}sWillAppear")
            }
            action={
              hasActiveFilters ? {
                label: t("page.clearFilters"),
                onClick: handleClearFilters,
                variant: "ghost" as const
              } : canCreate ? {
                label: t("page.createNew"),
                onClick: () => navigate({ to: `/${locale}/{feature}s/new` }),
                variant: "primary" as const
              } : undefined
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered{Feature}s.map(({feature}) => (
              <{Feature}Card key={{feature}._id} {feature}={{feature}} trackViews={true} />
            ))}
          </div>
        ) : (
          <{Feature}sTable {feature}s={filtered{Feature}s} />
        )}
      </div>
    </div>
  );
};
```

---

## 📊 Types & Constants

### Types File

```typescript
// src/features/{category}/{feature}/types/index.ts
// Type definitions for {feature}

import type { Doc, Id } from '@/convex/_generated/dataModel'

// Main entity types (from backend)
export type {Feature} = Doc<'{tableName}'>
export type {Feature}Id = Id<'{tableName}'>

// Extract types from backend
export type {Feature}Priority = {Feature}['priority']
export type {Feature}Visibility = {Feature}['visibility']
export type {Feature}Status = {Feature}['status']

// Create/Update interfaces
export interface Create{Feature}Data {
  title: string
  description?: string
  priority?: {Feature}Priority
  visibility?: {Feature}Visibility
  tags?: string[]
  category?: string
}

export interface Update{Feature}Data {
  title?: string
  description?: string
  status?: {Feature}Status
  priority?: {Feature}Priority
  visibility?: {Feature}Visibility
  tags?: string[]
  category?: string
}

// Filter types
export interface {Feature}Filters {
  status?: {Feature}Status[]
  priority?: {Feature}Priority[]
  visibility?: {Feature}Visibility[]
  category?: string
  search?: string
}

// List options
export interface {Feature}sListOptions {
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
  filters?: {Feature}Filters
}
```

### Constants File

```typescript
// src/features/{category}/{feature}/constants/index.ts
// UI constants for {feature}

import { {FEATURE}_CONSTANTS } from '@/convex/lib/{category}/{entity}/constants';

// Re-export backend constants
export { {FEATURE}_CONSTANTS };

// UI-specific constants
export const {FEATURE}_STATUS_COLORS = {
  [{FEATURE}_CONSTANTS.STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [{FEATURE}_CONSTANTS.STATUS.COMPLETED]: 'bg-blue-100 text-blue-800',
  [{FEATURE}_CONSTANTS.STATUS.ARCHIVED]: 'bg-gray-100 text-gray-800',
} as const;

export const PRIORITY_COLORS = {
  [{FEATURE}_CONSTANTS.PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
  [{FEATURE}_CONSTANTS.PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
  [{FEATURE}_CONSTANTS.PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
  [{FEATURE}_CONSTANTS.PRIORITY.URGENT]: 'bg-red-100 text-red-800',
} as const;

export const STATUS_ICONS = {
  [{FEATURE}_CONSTANTS.STATUS.ACTIVE]: '🟢',
  [{FEATURE}_CONSTANTS.STATUS.COMPLETED]: '✅',
  [{FEATURE}_CONSTANTS.STATUS.ARCHIVED]: '📦',
} as const;
```

---

## ✅ Consistency Review

### 1. Service Layer Consistency

- [ ] All query option factories defined
- [ ] All query hooks defined
- [ ] All mutation hooks defined
- [ ] Consistent naming pattern
- [ ] No business logic in service
- [ ] staleTime configured appropriately

### 2. Hooks Layer Consistency

- [ ] Main hook uses service layer
- [ ] Validation before mutations
- [ ] Audit logging after mutations
- [ ] Error parsing implemented
- [ ] Permission hooks created
- [ ] Suspense hooks created

### 3. Component Consistency

- [ ] Form validates all fields
- [ ] Form handles both create/edit
- [ ] Card displays key information
- [ ] Stats component implemented
- [ ] Filters component implemented
- [ ] All components use translations

### 4. Page Consistency

- [ ] List page uses Suspense hooks
- [ ] List page has filters
- [ ] List page handles empty state
- [ ] Details page implemented
- [ ] Create page implemented
- [ ] All pages use translations

### 5. Type Safety

- [ ] Types imported from backend
- [ ] Create/Update interfaces defined
- [ ] Filter interfaces defined
- [ ] No `any` types used
- [ ] Proper type exports

### 6. Constants

- [ ] Backend constants imported
- [ ] UI constants defined
- [ ] Color mappings defined
- [ ] Icon mappings defined

---

## 🎓 Best Practices

### Code Organization

1. **Follow the structure** - Don't deviate from standard layout
2. **Service for data** - All Convex calls in service layer
3. **Hooks for logic** - Business logic in hook layer
4. **Components for UI** - Pure presentation in components
5. **Pages for layout** - Composition in page layer

### Performance

1. **Use Suspense hooks** - Leverage SSR cache
2. **Client-side filtering** - For responsive UX
3. **Lazy load components** - Use React.lazy()
4. **Memoize filters** - Use useMemo for derived state
5. **Debounce search** - Prevent excessive re-renders

### User Experience

1. **Show loading states** - Always indicate progress
2. **Handle errors gracefully** - User-friendly messages
3. **Optimistic updates** - Update UI before backend
4. **Validate early** - Client-side validation first
5. **Empty states** - Guide users with helpful messages

### Accessibility

1. **Semantic HTML** - Use proper elements
2. **ARIA labels** - Add where needed
3. **Keyboard navigation** - Support tab/enter
4. **Focus management** - Handle focus properly
5. **Screen readers** - Test with assistive tech

---

## ⚡ Performance Optimization

### SSR & Caching

```typescript
// ✅ Good - Use query option factories in loaders
export const Route = createFileRoute('/{feature}s')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(
      {feature}Service.get{Feature}sQueryOptions({ limit: 100 })
    )
  },
  component: {Feature}sPage,
})
```

### Client-Side Filtering

```typescript
// ✅ Good - Filter in useMemo
const filtered = useMemo(() => {
  return items.filter(item => {
    if (search && !item.title.includes(search)) return false;
    if (status && item.status !== status) return false;
    return true;
  });
}, [items, search, status]);
```

### Lazy Loading

```typescript
// ✅ Good - Lazy load heavy components
const {Feature}Analytics = lazy(() => import('../components/{Feature}Analytics'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <{Feature}Analytics />
</Suspense>
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Data not found" after SSR

**Problem:** Component shows loading even though data is in SSR cache

**Solution:** Use Suspense hooks instead of regular hooks
```typescript
// ❌ Wrong
const { data, isLoading } = {feature}Service.use{Feature}s()

// ✅ Correct
const { data } = use{Feature}sList() // Uses useSuspenseQuery
```

#### 2. Stale data after mutation

**Problem:** UI doesn't update after create/update/delete

**Solution:** Convex automatically updates queries, check query keys match
```typescript
// Ensure service uses same query key
get{Feature}sQueryOptions(options) {
  return convexQuery(api.lib.{category}.{entity}.queries.get{Feature}s, { options });
}
```

#### 3. Permission errors not caught

**Problem:** Permission errors crash the app

**Solution:** Use error boundaries and parse errors
```typescript
const parsedError = useMemo(() => {
  return error ? parseConvexError(error) : null;
}, [error]);

if (parsedError?.code === "PERMISSION_DENIED") {
  return <PermissionDenied />;
}
```

---

## 📚 Quick Reference

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Service | `{Feature}Service.ts` | `ProjectsService.ts` |
| Hook | `use{Feature}.ts` | `useProjects.ts` |
| Component | `{Feature}{Type}.tsx` | `ProjectCard.tsx` |
| Page | `{Feature}sPage.tsx` | `ProjectsPage.tsx` |
| Types | `index.ts` or `{sub}.types.ts` | `tasks.types.ts` |

### Hook Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `use{Feature}s` | Main hook with logic | `useProjects` |
| `use{Feature}sList` | Suspense list hook | `useProjectsList` |
| `use{Feature}Stats` | Suspense stats hook | `useProjectStats` |
| `useCanCreate{Feature}s` | Permission check | `useCanCreateProjects` |
| `useCanEdit{Feature}` | Permission check | `useCanEditProject` |

---

**🎉 You're ready to build! Follow this guide step-by-step for consistent, high-quality React features.**
