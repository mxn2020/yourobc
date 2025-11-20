# Blog Post Scheduling System

## Overview

The blog feature includes a complete scheduling system that allows users to schedule posts for automatic publishing at a specific date and time. The system uses Convex's built-in cron job functionality to check for scheduled posts every minute and automatically publish them when their scheduled time arrives.

## Architecture

### Components

1. **Frontend UI** (`PostEditorPage.tsx`)
   - Schedule button in post editor header
   - Schedule dialog with date/time picker
   - Validation for future dates

2. **React Hook** (`useScheduling.ts`)
   - `schedulePost()` - Schedule a post for future publishing
   - `cancelSchedule()` - Cancel a scheduled post
   - `reschedule()` - Change the scheduled time
   - Error handling and loading states

3. **Backend Tasks** (`scheduled_tasks.ts`)
   - `findPostsToPublish()` - Query for posts ready to publish
   - `publishScheduledPost()` - Publish a single scheduled post
   - `checkAndPublishScheduledPosts()` - Main scheduler function
   - `cancelScheduledPublishing()` - Cancel a scheduled post
   - `reschedulePost()` - Update scheduled time

4. **Cron Job** (`crons.ts`)
   - Runs every minute (`:00`, `:01`, `:02`, etc.)
   - Calls `checkAndPublishScheduledPosts()`
   - Automatically manages execution

## How It Works

### 1. Scheduling a Post

```typescript
import { useScheduling } from '@/features/system/blog';

function MyComponent() {
  const { schedulePost, isScheduling } = useScheduling();

  const handleSchedule = async () => {
    const scheduledDate = new Date('2025-12-31T10:00:00');
    await schedulePost(postId, scheduledDate);
  };
}
```

**Flow:**
1. User clicks "Schedule" button in post editor
2. User selects date and time in dialog
3. System validates date is in the future
4. Post is saved as draft if not already saved
5. Backend mutation updates post:
   - `status: 'scheduled'`
   - `scheduledFor: timestamp`
6. Post appears in dashboard with "Scheduled" status

### 2. Automatic Publishing

**Every minute, the cron job:**
1. Queries for posts where:
   - `status === 'scheduled'`
   - `scheduledFor <= now`
   - `deletedAt === undefined`
2. For each post found:
   - Updates `status` to `'published'`
   - Sets `publishedAt` to current time
   - Clears `scheduledFor` field
   - Logs success/failure
3. Returns summary of results

**Example Log Output:**
```
🔍 Found 3 posts ready to publish
✅ Published scheduled post: "My Article" (abc123)
✅ Published scheduled post: "Tutorial Post" (def456)
✅ Published scheduled post: "News Update" (ghi789)
✅ Successfully published 3/3 posts
```

### 3. Managing Scheduled Posts

#### Cancel Scheduling
```typescript
const { cancelSchedule } = useScheduling();
await cancelSchedule(postId); // Reverts to draft
```

#### Reschedule
```typescript
const { reschedule } = useScheduling();
await reschedule(postId, new Date('2026-01-01T12:00:00'));
```

## Database Schema

The `blogPosts` table includes scheduling fields:

```typescript
{
  status: 'draft' | 'scheduled' | 'published' | 'archived',
  scheduledFor?: number,  // Unix timestamp
  publishedAt?: number,   // Unix timestamp
  updatedAt: number,      // Unix timestamp
}
```

**Indexes:**
- `by_status` - Fast queries for scheduled posts
- Used by: `findPostsToPublish` query

## Error Handling

### Frontend Validation
- ✅ Date must be in the future
- ✅ Both date and time required
- ✅ Post must be saved before scheduling
- ✅ User-friendly error messages via toast

### Backend Protection
- ✅ Post must exist
- ✅ Post must have status 'scheduled'
- ✅ Post must not be deleted
- ✅ Graceful error handling with logging
- ✅ Partial failure handling (continues if one post fails)

## UI/UX Features

### Post Editor
- **Schedule Button**: Located between "Save Draft" and "Publish"
- **Clock Icon**: Visual indicator for scheduling
- **Default Time**: Pre-filled with current time + 1 hour
- **Date Validation**: Cannot select past dates
- **Loading States**: Disabled buttons during operations

### Schedule Dialog
- Clean modal design with backdrop
- Date picker (HTML5 input type="date")
- Time picker (HTML5 input type="time")
- Info message about automatic publishing
- Cancel and Schedule buttons
- Real-time validation feedback

### Status Display
In the blog dashboard, scheduled posts show:
- Badge: "Scheduled"
- Scheduled date/time
- Option to edit/cancel scheduling

## Performance Considerations

### Cron Job Efficiency
- **Frequency**: Runs every minute
- **Query Optimization**: Uses database index `by_status`
- **Filtering**: Additional filters for `deletedAt` and `scheduledFor`
- **Batch Processing**: Processes all ready posts in single execution
- **Silent Success**: Returns quickly if no posts to publish

### Scalability
- Can handle thousands of scheduled posts
- O(n) complexity where n = posts ready to publish
- Typically n = 0-10 per minute
- Each post update is atomic

## Configuration

### Cron Job (`/convex/crons.ts`)
```typescript
crons.interval(
  'publish-scheduled-posts',
  { minutes: 1 },  // Check every minute
  internal.lib.system.blog.scheduled_tasks.checkAndPublishScheduledPosts
);
```

### Custom Intervals
To change the interval (not recommended):
```typescript
{ minutes: 5 }   // Every 5 minutes
{ hours: 1 }     // Every hour
{ days: 1 }      // Every day
```

**Note**: Shorter intervals = more precise publishing but higher resource usage.

## Testing

### Manual Testing
1. Create a post and schedule it for 2 minutes from now
2. Navigate to blog dashboard
3. Wait for the scheduled time
4. Refresh dashboard - post should be published
5. Check post detail page - should be publicly visible

### Testing Cron Job Manually
```typescript
// In Convex dashboard, run:
await ctx.runMutation(
  internal.lib.system.blog.scheduled_tasks.checkAndPublishScheduledPosts,
  {}
);
```

### Edge Cases to Test
- ✅ Scheduling multiple posts for same time
- ✅ Editing a scheduled post
- ✅ Deleting a scheduled post
- ✅ Rescheduling multiple times
- ✅ Scheduling far in the future (months/years)
- ✅ Timezone considerations

## Monitoring

### Convex Dashboard
- View cron job execution history
- See execution logs and errors
- Monitor execution duration
- Check success/failure rates

### Application Logs
- Each published post logs: `✅ Published scheduled post: {title} ({id})`
- Failures log: `Failed to publish post {id}: {error}`
- Summary logs: `✅ Successfully published {n}/{total} posts`

## Troubleshooting

### Post Not Publishing
1. Check post status is `'scheduled'`
2. Verify `scheduledFor` is in the past
3. Check post is not deleted (`deletedAt === undefined`)
4. Review Convex dashboard for cron execution errors
5. Check Convex logs for error messages

### Cron Job Not Running
1. Verify `/convex/crons.ts` is properly configured
2. Check Convex deployment status
3. Review cron job schedule in Convex dashboard
4. Ensure internal mutation path is correct

### Timezone Issues
- All times stored as Unix timestamps (UTC)
- Frontend displays in user's local timezone
- Backend processes in UTC
- Use `Date` objects for consistency

## Best Practices

### For Users
1. ✅ Always schedule at least 5 minutes in the future
2. ✅ Double-check timezone when scheduling
3. ✅ Review scheduled posts before publishing
4. ✅ Use draft status for work-in-progress posts

### For Developers
1. ✅ Always validate dates on both frontend and backend
2. ✅ Use Unix timestamps for database storage
3. ✅ Log all scheduling operations
4. ✅ Handle partial failures gracefully
5. ✅ Keep cron job logic simple and fast
6. ✅ Test with various timezones

## Future Enhancements

Potential improvements:
- 📅 Recurring post scheduling (weekly/monthly)
- 📧 Email notifications before publishing
- 📊 Analytics for scheduled vs immediate posts
- ⏰ Bulk scheduling operations
- 🌍 Timezone selection in UI
- 📱 Mobile push notifications
- 🔄 Automatic rescheduling on failure
- 📈 Scheduling analytics dashboard

## API Reference

### Frontend Hook

```typescript
interface UseSchedulingReturn {
  schedulePost: (postId: Id<'blogPosts'>, scheduledFor: Date) => Promise<void>;
  cancelSchedule: (postId: Id<'blogPosts'>) => Promise<void>;
  reschedule: (postId: Id<'blogPosts'>, newScheduledFor: Date) => Promise<void>;
  isScheduling: boolean;
  error: Error | null;
}
```

### Backend Functions

```typescript
// Find posts ready to publish
internal.lib.system.blog.scheduled_tasks.findPostsToPublish()

// Publish a single post
internal.lib.system.blog.scheduled_tasks.publishScheduledPost({ postId })

// Main scheduler (called by cron)
internal.lib.system.blog.scheduled_tasks.checkAndPublishScheduledPosts()

// Cancel scheduling
internal.lib.system.blog.scheduled_tasks.cancelScheduledPublishing({ postId })

// Reschedule
internal.lib.system.blog.scheduled_tasks.reschedulePost({ postId, newScheduledFor })
```

## Files Modified/Created

### Created
- `/convex/lib/system/blog/scheduled_tasks.ts` - Background task logic
- `/src/features/system/blog/hooks/useScheduling.ts` - React hook

### Modified
- `/convex/crons.ts` - Added cron job registration
- `/src/features/system/blog/pages/PostEditorPage.tsx` - Added scheduling UI
- `/src/features/system/blog/hooks/index.ts` - Export useScheduling
- `/src/features/system/blog/index.ts` - Export useScheduling
- `/src/features/system/blog/README.md` - Added scheduling docs

## Summary

The blog scheduling system provides:
- ✅ **User-friendly UI** for scheduling posts
- ✅ **Reliable automation** via Convex cron jobs
- ✅ **Robust error handling** and logging
- ✅ **Complete API** for programmatic scheduling
- ✅ **Production-ready** implementation
- ✅ **Well-documented** with examples

The system runs automatically with zero configuration needed after deployment. Posts are published precisely (within 1 minute) of their scheduled time with comprehensive logging and error handling.
