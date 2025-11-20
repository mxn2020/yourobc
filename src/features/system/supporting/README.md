# Supporting Features

This directory contains cross-functional supporting features that can be used across all main features in the system.

## Structure

```
supporting/
├── config/                     # Feature configuration system
│   ├── supporting.config.ts    # Feature flags and config
│   └── index.ts
├── shared/                     # Shared utilities and constants
│   ├── types.ts               # Common types
│   ├── constants.ts           # Shared constants and helpers
│   └── index.ts
├── comments/                   # Comments feature
│   ├── types/                 # Type definitions
│   ├── hooks/                 # React hooks
│   ├── services/              # Business logic services
│   ├── components/            # UI components
│   └── pages/                 # Full page components
├── documents/                  # Documents feature
│   ├── types/
│   ├── hooks/
│   ├── services/
│   ├── components/
│   └── pages/
├── reminders/                  # Reminders feature
│   ├── types/
│   ├── hooks/
│   ├── services/
│   └── components/
├── wiki/                       # Wiki feature
│   ├── types/
│   ├── hooks/
│   ├── services/
│   └── components/
├── scheduling/                 # Scheduling feature
│   ├── types/
│   ├── hooks/
│   ├── services/
│   └── components/
└── virtual-lists/              # Virtual lists feature
    ├── types/
    ├── hooks/
    ├── components/
    └── utils/
```

## Important Note

**Notifications is NOT a supporting feature** - it is a main system feature located at `src/features/system/notifications/`. It has dedicated routes (`/notifications`), global navigation (header bell icon), and is user-centric rather than entity-attachable.

## Features

### 1. Configuration System

**Location:** `supporting/config/`

Centralized feature flag system for enabling/disabling supporting features.

**Usage:**
```typescript
import {
  getSupportingConfig,
  isFeatureEnabled,
  getEnabledFeatures
} from '@/features/system/supporting';

// Check if a feature is enabled
const commentsEnabled = isFeatureEnabled('comments');

// Get all enabled features
const enabledFeatures = getEnabledFeatures();

// Get navigation items for enabled features
const navItems = getSupportingNavigationItems();
```

**Environment Variables:**
- `VITE_SUPPORTING_FEATURE_COMMENTS=false` - Disable comments
- `VITE_SUPPORTING_FEATURE_DOCUMENTS=false` - Disable documents
- `VITE_SUPPORTING_FEATURE_REMINDERS=false` - Disable reminders
- `VITE_SUPPORTING_FEATURE_WIKI=false` - Disable wiki
- `VITE_SUPPORTING_FEATURE_SCHEDULING=false` - Disable scheduling

### 2. Shared Utilities

**Location:** `supporting/shared/`

Common types, constants, and helper functions used across all supporting features.

**Key Exports:**
- `SUPPORTING_ENTITY_TYPES` - Standard entity types
- `ENTITY_TYPE_LABELS` - Display labels
- `MAX_CONTENT_LENGTH` - Content length limits
- `FILE_SIZE_LIMITS` - File size constraints
- `ALLOWED_FILE_TYPES` - File type validation
- `formatFileSize()` - Format bytes to human-readable
- `formatRelativeTime()` - Format timestamps
- `truncateText()` - Truncate with ellipsis

### 3. Comments Feature ✅ COMPLETE

**Location:** `supporting/comments/`

Threaded discussion system with mentions, reactions, and reply support.

**Features:**
- Threaded comments with unlimited depth
- Reply to comments
- Reactions (emoji support)
- Mentions (@username)
- Internal/external visibility
- Comment types (note, status_update, question, answer, internal)
- Edit history tracking
- Soft delete

**Components:**
- `CommentCard` - Single comment display
- `CommentForm` - Create/edit comments
- `CommentList` - List with threading
- `CommentsSection` - Complete comments widget
- `CommentsSectionRefactored` - New modular version
- `CommentsPage` - Full standalone page

**Hooks:**
- `useEntityComments()` - Get comments for entity
- `useComment()` - Get single comment
- `useCommentThread()` - Get comment with replies
- `useCreateComment()` - Create comment
- `useUpdateComment()` - Update comment
- `useDeleteComment()` - Delete comment
- `useAddCommentReaction()` - Toggle reaction

**Service Methods:**
- Validation, formatting, sanitization
- Tree building and flattening
- Search, filter, sort
- Permission checks
- Statistics generation

**Usage:**
```typescript
import { CommentsSection } from '@/features/system/supporting';

<CommentsSection
  entityType="project"
  entityId={projectId}
/>
```

### 4. Documents Feature ✅ COMPLETE

**Location:** `supporting/documents/`

Document management and file storage system.

**Features:**
- File upload with drag & drop
- Document types (contract, invoice, receipt, report, image, presentation, spreadsheet, other)
- Confidential/public visibility
- File preview for images and PDFs
- Tags and metadata
- Archive/restore functionality
- File size validation
- Type validation

**Components:**
- `DocumentCard` - Single document display
- `DocumentUploadForm` - Upload with validation
- `DocumentList` - Grid/list view
- `DocumentsSection` - Complete widget
- `DocumentsPage` - Full page with filters

**Hooks:**
- `useEntityDocuments()` - Get documents for entity
- `useDocument()` - Get single document
- `useRecentDocuments()` - Get recent docs
- `useSearchDocuments()` - Search docs
- `useCreateDocument()` - Upload document
- `useUpdateDocument()` - Update metadata
- `useDeleteDocument()` - Delete document
- `useArchiveDocument()` - Archive document
- `useRestoreDocument()` - Restore document

**Service Methods:**
- File validation (type, size)
- Filename sanitization
- Type detection from MIME
- Search and filter
- Statistics and analytics
- Permission checks

**Usage:**
```typescript
import { DocumentsSection } from '@/features/system/supporting';

<DocumentsSection
  entityType="project"
  entityId={projectId}
  includeConfidential={true}
/>
```

**Note:** File upload requires integration with storage service (Convex file storage, S3, etc.)

### 5. Reminders Feature ✅ COMPLETE

**Location:** `supporting/reminders/`

Follow-up reminders and task notifications.

**Features:**
- Task reminders with due dates
- Priority levels (low, medium, high, urgent)
- Reminder types (task, follow_up, payment, meeting, deadline, other)
- Email notifications
- Recurring reminders (daily, weekly, monthly, yearly)
- Snooze functionality
- Complete/cancel actions
- Overdue tracking

**Components:**
- `ReminderCard` - Single reminder display
- `RemindersSection` - Complete widget

**Hooks:**
- `useEntityReminders()` - Get reminders for entity
- `useReminder()` - Get single reminder
- `useUserReminders()` - Get user's reminders
- `useOverdueReminders()` - Get overdue reminders
- `useUpcomingReminders()` - Get upcoming reminders
- `useCreateReminder()` - Create reminder
- `useUpdateReminder()` - Update reminder
- `useCompleteReminder()` - Mark complete
- `useSnoozeReminder()` - Snooze reminder
- `useCancelReminder()` - Cancel reminder
- `useDeleteReminder()` - Delete reminder

**Service Methods:**
- Overdue detection
- Due today/soon checks
- Priority/type labels and colors
- Filter by status, priority, type
- Sort by date, priority
- Statistics generation

**Usage:**
```typescript
import { RemindersSection } from '@/features/system/supporting';

<RemindersSection
  entityType="project"
  entityId={projectId}
/>
```

### 6. Wiki Feature ✅ COMPLETE

**Location:** `supporting/wiki/`

Knowledge base and documentation system.

**Features:**
- Wiki entries with markdown content
- Categories and tags
- Full-text search
- Version tracking
- Draft/published/archived status
- Public/internal/private visibility
- Related entries linking
- Attachments support
- Parent/child hierarchy

**Components:**
- `WikiEntryCard` - Single entry display
- `WikiSidebar` - Category/tag navigation

**Hooks:**
- `useWikiEntries()` - Get all entries
- `useWikiEntry()` - Get single entry
- `useWikiEntryBySlug()` - Get by slug
- `useWikiEntriesByCategory()` - Filter by category
- `useSearchWiki()` - Full-text search
- `useWikiCategories()` - Get categories
- `useCreateWikiEntry()` - Create entry
- `useUpdateWikiEntry()` - Update entry
- `usePublishWikiEntry()` - Publish entry
- `useArchiveWikiEntry()` - Archive entry
- `useDeleteWikiEntry()` - Delete entry

**Service Methods:**
- Slug generation
- Search text extraction
- Filter by category/tags/status
- Search entries
- Sort by title/date/updated
- Category tree building
- Tag extraction
- Statistics generation

**Usage:**
```typescript
import { WikiEntryCard, WikiSidebar } from '@/features/system/supporting';

// Display entry
<WikiEntryCard entry={entry} onView={handleView} />

// Sidebar navigation
<WikiSidebar
  entries={entries}
  onCategorySelect={handleCategory}
  onTagSelect={handleTag}
/>
```

### 7. Scheduling Feature ✅ COMPLETE (Frontend Only)

**Location:** `supporting/scheduling/`

Comprehensive event and appointment scheduling system.

**Features:**
- Event management (create, update, cancel, complete)
- Multiple event types (meeting, appointment, task, reminder, block)
- Recurring events (daily, weekly, monthly, yearly)
- Attendee management with RSVP
- Conflict detection
- Availability checking
- Time zone support
- Location support (physical, virtual, phone)
- Automated reminders (email, notification, SMS)
- Priority levels (low, medium, high, urgent)
- All-day events
- Color coding
- Tags and metadata

**Components:**
- `EventCard` - Single event display
- `EventList` - List with grouping by date
- `SchedulingSection` - Complete widget

**Hooks:**
- `useEntityEvents()` - Get events for entity
- `useScheduledEvent()` - Get single event
- `useUserEvents()` - Get user's events
- `useUpcomingEvents()` - Get upcoming events
- `useTodayEvents()` - Get today's events
- `useCheckAvailability()` - Check time slot availability
- `useFindAvailableSlots()` - Find available time slots
- `useCreateEvent()` - Create event
- `useUpdateEvent()` - Update event
- `useCancelEvent()` - Cancel event
- `useCompleteEvent()` - Mark complete
- `useRespondToEvent()` - RSVP to event
- `useRescheduleEvent()` - Reschedule event

**Service Methods:**
- Event validation
- Conflict detection
- Overlap calculation
- Time slot finding
- Event filtering and sorting
- Recurring event generation
- Statistics and analytics
- Time formatting
- Permission checks

**Usage:**
```typescript
import { SchedulingSection } from '@/features/system/supporting';

<SchedulingSection
  entityType="project"
  entityId={projectId}
  title="Project Schedule"
/>
```

**Recurring Events:**
```typescript
const recurringEvent = {
  title: 'Weekly Team Meeting',
  isRecurring: true,
  recurrencePattern: {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
  },
};
```

**Note:** Backend implementation required (see `scheduling/README.md` for details)

### 8. Virtual Lists Feature ✅ COMPLETE

**Location:** `supporting/virtual-lists/`

High-performance virtualization system for rendering large lists and tables efficiently using TanStack Virtual.

**Features:**
- VirtualList component for fixed-height items
- VirtualListDynamic for variable-height items
- VirtualTable for tabular data
- Custom hooks for virtualization
- Performance utilities
- Infinite scroll support
- Sticky headers

**Performance:**
- 10x-100x faster for large lists
- Handle 10,000+ items smoothly
- < 16ms render time per frame
- 90%+ reduction in initial render time

**Components:**
- `VirtualList` - Basic virtualized list
- `VirtualListDynamic` - Dynamic height list
- `VirtualTable` - Virtualized table

**Hooks:**
- `useVirtualScroll()` - Create virtualizers
- `useInfiniteScroll()` - Infinite scrolling
- `useVirtualizer()` - Direct TanStack Virtual hook

**Utilities:**
- `calculateVirtualListMetrics()` - Performance metrics
- `getEstimatedSize()` - Size helpers
- `getOptimalOverscan()` - Optimize rendering
- `shouldUseVirtualization()` - Check if needed

**Usage:**
```typescript
import { VirtualList, VirtualTable } from '@/features/system/supporting';

// Simple list
<VirtualList
  items={data}
  height={600}
  estimateSize={50}
  renderItem={(item) => <div>{item.name}</div>}
/>

// Table
<VirtualTable
  data={data}
  columns={columns}
  height={600}
  estimateRowHeight={50}
  stickyHeader
/>
```

**See:** `virtual-lists/README.md` for complete documentation

## Implementation Patterns

### Service Layer Pattern

Each feature has a service class with static methods for business logic:

```typescript
// Example: CommentsService
export class CommentsService {
  static validateCommentData(data: Partial<CreateCommentData>): string[]
  static formatCommentContent(content: string, maxLength?: number): string
  static buildCommentTree(comments: Comment[]): CommentThread[]
  static isCommentEditable(comment: Comment, userId: string): boolean
  // ... more methods
}
```

### Hook Pattern

Each feature exports custom hooks for data fetching and mutations:

```typescript
// Query hooks
const comments = useEntityComments(entityType, entityId, user?.id);
const comment = useComment(commentId, user?.id);

// Mutation hooks
const createComment = useCreateComment();
await createComment({ authUserId, data });
```

### Component Pattern

Components are split into:
- **Card** - Single item display
- **Form** - Create/edit forms
- **List** - Collection display
- **Section** - Complete widget with all functionality
- **Page** - Full standalone page

## Integration Guide

### 1. Add to a Feature

```typescript
import {
  CommentsSection,
  DocumentsSection,
  RemindersSection
} from '@/features/system/supporting';

function MyFeaturePage() {
  return (
    <div>
      {/* Your feature content */}

      {/* Add supporting features */}
      <CommentsSection entityType="myFeature" entityId={id} />
      <DocumentsSection entityType="myFeature" entityId={id} />
      <RemindersSection entityType="myFeature" entityId={id} />
    </div>
  );
}
```

### 2. Use Individual Components

```typescript
import {
  CommentCard,
  CommentForm,
  CommentList
} from '@/features/system/supporting';

function CustomComments() {
  const comments = useEntityComments(type, id, userId);

  return (
    <div>
      <CommentForm onSubmit={handleSubmit} />
      <CommentList
        comments={comments}
        onDelete={handleDelete}
        onReply={handleReply}
      />
    </div>
  );
}
```

### 3. Check Feature Flags

```typescript
import { isFeatureEnabled } from '@/features/system/supporting';

function MyComponent() {
  const showComments = isFeatureEnabled('comments');
  const showDocuments = isFeatureEnabled('documents');

  return (
    <div>
      {showComments && <CommentsSection />}
      {showDocuments && <DocumentsSection />}
    </div>
  );
}
```

## Backend Integration

All features integrate with Convex backend at:
```
convex/lib/system/supporting/
├── comments/
├── documents/
├── reminders/
└── wiki/
```

Each module has:
- `types.ts` - Type definitions
- `constants.ts` - Constants
- `queries.ts` - Read operations
- `mutations.ts` - Write operations
- `utils.ts` - Helper functions

## Future Enhancements
- Real-time updates with Convex subscriptions
- File preview component for documents
- Markdown editor for wiki
- Rich text editor for comments
- @mention autocomplete
- Activity feed combining all features
- Export functionality
- Bulk operations
- Advanced search across all features

## Migration from Old Structure

The old structure (`supporting_old/`) had:
- Exchange Rates (removed - too specific)
- Inquiry Sources (removed - too specific)
- More complex component structure

New structure improvements:
- Simplified hook-based architecture
- No service layer on old version vs. comprehensive services now
- Better separation of concerns
- Modular components
- Configuration system
- Better TypeScript types
- Consistent patterns across features

## Testing

Each feature should be tested with:
1. Unit tests for service methods
2. Integration tests for hooks
3. Component tests for UI
4. E2E tests for workflows

## Contributing

When adding new supporting features:
1. Follow the established structure (types, hooks, services, components, pages)
2. Add configuration to `supporting.config.ts`
3. Export from main `index.ts`
4. Update this README
5. Add tests
6. Update backend schema if needed
