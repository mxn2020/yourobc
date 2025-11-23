# Remaining 5 Modules Lib Refactoring Guide

## Overview

All **schema files** for the remaining 5 modules are now complete:
- ✅ comments (5 files)
- ✅ counters (5 files)
- ✅ documents (5 files)
- ✅ followupReminders (5 files)
- ✅ notifications (5 files)

**Next**: Create lib modules (7 files per module = 35 files total)

---

## Module-by-Module Refactoring Guide

### 1. Comments Module

**Location**: `convex/lib/yourobc/supporting/comments/`

**Files to Create**:

#### constants.ts
```
COMMENTS_CONSTANTS = {
  PERMISSIONS: { VIEW, CREATE, EDIT, DELETE, REACT }
  LIMITS: { MAX_CONTENT_LENGTH, MAX_MENTIONS, MAX_REACTIONS, MAX_ATTACHMENTS, ... }
  DEFAULTS: { IS_INTERNAL, IS_EDITED }
}
COMMENTS_VALUES = { ... }
```

#### types.ts
```
Comment type (Doc<'comments'>)
CreateCommentData interface
UpdateCommentData interface
CommentListResponse interface
CommentFilters interface (entityType, entityId, isInternal, etc.)
CommentWithReplies type (for querying with replies)
```

#### utils.ts
```
trimCommentData(data) - Generic trim function
validateCommentData(data) - Validation returning string[]
buildCommentThread(comments, parentId) - Build nested reply structure
extractMentions(content) - Find @mentions in content
shouldDeleteComment(comment) - Check if deletable
```

#### permissions.ts
```
canViewComment(ctx, resource, user)
canEditComment(ctx, resource, user)
canDeleteComment(ctx, resource, user)
canReactToComment(ctx, resource, user)
filterCommentsByAccess(ctx, resources, user)
```

#### queries.ts (with cursor pagination)
```
getComments(filters) - Get paginated comments for entity
getComment(id) - Get single comment
getCommentThread(parentCommentId) - Get comment and all replies
listCommentsWithReplies(entityType, entityId) - Nested structure
```

#### mutations.ts
```
createComment(data) - Create new comment
updateComment(id, updates) - Edit comment
addCommentReaction(commentId, reaction) - Add emoji reaction
removeCommentReaction(commentId, reactionId) - Remove reaction
deleteComment(id) - Soft delete comment
```

#### index.ts
```
Export all from constants, types, utils, permissions, queries, mutations
```

---

### 2. Counters Module

**Location**: `convex/lib/yourobc/supporting/counters/`

**Unique Features**:
- No pagination (lookup table)
- Year-based counter reset
- Prefix-based ID generation

**Files to Create**:

#### constants.ts
```
COUNTERS_CONSTANTS = {
  PERMISSIONS: { VIEW, CREATE, EDIT }
  DEFAULTS: { STARTING_NUMBER }
  TYPE: { QUOTE, SHIPMENT, INVOICE, ... }
}
```

#### types.ts
```
Counter type
CreateCounterData interface
CounterStats type (for reporting)
```

#### utils.ts
```
formatCounterNumber(prefix, number, year) → 'QT-2025-001'
parseCounterNumber(fullNumber) → { prefix, year, number }
validateCounterPrefix(prefix)
getNextCounter(type, year) → number
```

#### permissions.ts / queries.ts / mutations.ts
```
Similar pattern to other modules
Note: No pagination, getNextCounter is key operation
```

---

### 3. Documents Module

**Location**: `convex/lib/yourobc/supporting/documents/`

**Unique Features**:
- File metadata management
- Confidentiality/public flags
- Uploader tracking
- MIME type validation

**Files to Create**:

#### constants.ts
```
DOCUMENTS_CONSTANTS = {
  PERMISSIONS: { VIEW, UPLOAD, DELETE, SHARE }
  LIMITS: { MAX_FILE_SIZE, MAX_FILENAME_LENGTH, ... }
  DEFAULTS: { IS_PUBLIC, IS_CONFIDENTIAL }
}
ALLOWED_MIME_TYPES = [...]
```

#### types.ts
```
Document type
CreateDocumentData interface
DocumentListResponse interface
DocumentFilters interface (entityType, documentType, uploadedBy, isPublic, isConfidential)
```

#### utils.ts
```
trimDocumentData(data)
validateDocumentData(data)
getFileExtension(filename) → '.pdf'
formatFileSize(bytes) → '2.5 MB'
validateMimeType(mimeType)
```

#### permissions.ts
```
canViewDocument(ctx, resource, user) - Check: public or creator or owner
canUploadDocument(ctx, user) - User permission
canDeleteDocument(ctx, resource, user) - Creator/admin only
canShareDocument(ctx, resource, user) - Share confidential?
```

#### queries.ts
```
getDocuments(filters) - Paginated
getDocument(id)
getDocumentsByEntity(entityType, entityId)
getDocumentsByUploader(userId)
```

#### mutations.ts
```
createDocument(data) - Track uploader
updateDocument(id, updates)
deleteDocument(id) - Soft delete
shareDocument(id, toUser) - Create share record
```

---

### 4. FollowupReminders Module

**Location**: `convex/lib/yourobc/supporting/followup_reminders/`

**Unique Features**:
- Assigned to users (not creators)
- Recurrence patterns
- Snooze functionality
- Overdue detection

**Files to Create**:

#### constants.ts
```
FOLLOWUP_REMINDERS_CONSTANTS = {
  PERMISSIONS: { VIEW, CREATE, COMPLETE, SNOOZE, DELETE }
  LIMITS: { MAX_TITLE, MAX_DESCRIPTION, MAX_COMPLETION_NOTES, ... }
  DEFAULTS: { STATUS, PRIORITY }
  STATUS: { PENDING, COMPLETED, SNOOZED }
}
```

#### types.ts
```
Reminder type
CreateFollowupReminderData interface
UpdateFollowupReminderData interface
SnoozeReminderData interface
CompleteReminderData interface
ReminderFilters interface (assignedTo, status, dueDate, priority, etc.)
```

#### utils.ts
```
trimReminderData(data)
validateReminderData(data)
calculateNextReminderDate(pattern, currentDate) → nextDate
isReminderOverdue(dueDate) → boolean
isReminderSnoozed(snoozeUntil) → boolean
```

#### permissions.ts
```
canViewReminder(ctx, resource, user) - Assignee or creator or admin
canCreateReminder(ctx, user) - Permission check
canCompleteReminder(ctx, resource, user) - Assignee or admin
canSnoozeReminder(ctx, resource, user) - Assignee or admin
canDeleteReminder(ctx, resource, user) - Creator or admin
```

#### queries.ts
```
getReminders(filters) - Paginated
getReminder(id)
getRemindersByAssignee(userId) - User's assigned reminders
getOverdueReminders(userId) - Where dueDate < now and status != completed
getUpcomingReminders(userId) - Where dueDate approaching
```

#### mutations.ts
```
createReminder(data)
updateReminder(id, updates)
completeReminder(id, completionNotes)
snoozeReminder(id, snoozeUntil, reason)
deleteReminder(id)
```

---

### 5. Notifications Module

**Location**: `convex/lib/yourobc/supporting/notifications/`

**Unique Features**:
- Per-user notifications
- Read status tracking
- Action URLs
- Auto-cleanup (90 days)

**Files to Create**:

#### constants.ts
```
NOTIFICATIONS_CONSTANTS = {
  PERMISSIONS: { VIEW, CREATE, MARK_READ, DELETE }
  LIMITS: { MAX_TITLE, MAX_MESSAGE, MAX_ACTION_URL, ... }
  DEFAULTS: { IS_READ, PRIORITY }
  RETENTION_DAYS: 90 (auto-cleanup)
}
```

#### types.ts
```
Notification type
CreateNotificationData interface
NotificationListResponse interface
NotificationFilters interface (userId, isRead, type, priority, etc.)
NotificationStats interface (unreadCount, etc.)
```

#### utils.ts
```
trimNotificationData(data)
validateNotificationData(data)
shouldDeleteNotification(createdAt, now) → older than 90 days?
calculateNotificationPriority(type, content) → auto-priority
buildNotificationMessage(type, data) → formatted message
```

#### permissions.ts
```
canViewNotification(ctx, resource, user) - Only user can view their own
canDeleteNotification(ctx, resource, user) - Only user can delete their own
canMarkAsRead(ctx, resource, user) - Only user can mark their own
```

#### queries.ts
```
getNotifications(userId, filters) - Paginated, cursor-based
getUnreadNotifications(userId) - Count and list
getNotificationStats(userId) - { unreadCount, totalCount }
```

#### mutations.ts
```
createNotification(data) - Usually called by system, not user
markAsRead(notificationId)
markAllAsRead(userId)
deleteNotification(notificationId)
deleteOldNotifications(retentionDays) - Cleanup mutation
```

---

## Implementation Steps

### For Each Module:

1. **Create constants.ts**
   - Extract relevant constants from root supporting/constants.ts
   - Add module-specific PERMISSIONS, LIMITS, DEFAULTS
   - Export MODULE_VALUES for validators

2. **Create types.ts**
   - Define operation interfaces (Create*, Update*, etc.)
   - Define response types (ListResponse, Filters, etc.)
   - Type-safe, matching schema

3. **Create utils.ts**
   - trim{Module}Data(data) with generic typing
   - validate{Module}Data(data) returning string[]
   - Module-specific helpers (formatters, calculators, etc.)

4. **Create permissions.ts**
   - can* functions (boolean checks)
   - require* functions (throw on denial)
   - filter*ByAccess function for lists
   - Follow pattern: view, edit, delete, + module-specific

5. **Create queries.ts**
   - Primary query: get{Module}(filters) with cursor pagination
   - get{Module}(id) - single record
   - List queries by key filters
   - Search/filter capabilities

6. **Create mutations.ts**
   - Trim → Validate → Create pattern
   - create{Module}(data)
   - update{Module}(id, updates)
   - delete{Module}(id) - always soft delete
   - Module-specific mutations (publish, snooze, etc.)
   - Always audit log

7. **Create index.ts**
   - Export all from constants, types, utils, permissions, queries, mutations

---

## Key Patterns to Maintain

✅ **Cursor-based pagination** - Never offset
✅ **Soft delete** - Always use notDeleted filter
✅ **Generic trim** - No `any` types
✅ **Audit logging** - Every mutation
✅ **Permission checks** - All queries/mutations
✅ **Type-safe** - Full TypeScript support
✅ **Index naming** - `by_owner_id`, `by_created_at`, `by_deleted_at`
✅ **Module VALUES** - Export canonical values

---

## Quick Reference: Module Complexity

| Module | Complexity | Key Features |
|--------|-----------|--------------|
| comments | HIGH | Threading, reactions, mentions, edit history |
| counters | LOW | Counter management, format parsing |
| documents | HIGH | File metadata, access control, confidentiality |
| followupReminders | HIGH | Assignment, recurrence, snoozing, overdue |
| notifications | MEDIUM | Per-user, read status, auto-cleanup |

---

## Testing Checklist

Before completion, verify each module:
- [ ] Schema layer complete (5 files per module)
- [ ] Lib layer complete (7 files per module)
- [ ] Indexes updated: `by_created_at`, `by_deleted_at`
- [ ] Cursor pagination implemented
- [ ] Audit logging added to mutations
- [ ] Permission checks in place
- [ ] Generic typing (no `any` types)
- [ ] Root exports updated

---

## Next Steps After Lib Completion

1. Update root supporting files (remove old code, add re-exports)
2. Update lib/yourobc/supporting/index.ts with new module exports
3. Verify all imports work correctly
4. Test all CRUD operations for each module
5. Validate cursor pagination works properly
6. Check audit logs are being created

---

## File Count Summary

**Schema Layer (Complete)**: 40 files
- 3 priority modules: 15 files ✅
- 5 remaining modules: 25 files ✅

**Lib Layer (Pending)**: 35 files
- 3 priority modules: 21 files ✅
- 5 remaining modules: 14 files (comments), 14 files (counters), 14 files (documents), 14 files (followupReminders), 14 files (notifications)

**Total**: 75 files for complete refactoring
