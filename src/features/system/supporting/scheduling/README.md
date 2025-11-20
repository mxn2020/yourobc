# Scheduling Module

A comprehensive scheduling system for managing events, appointments, meetings, and time blocks across your application.

## Overview

The scheduling module provides:
- **Event Management**: Create, update, cancel, and complete events
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurrence
- **Attendee Management**: Invite participants and track RSVPs
- **Conflict Detection**: Automatically detect time conflicts
- **Availability Checking**: Find available time slots
- **Multiple Event Types**: Meetings, appointments, tasks, reminders, and more
- **Location Support**: Physical, virtual, phone, or custom locations
- **Reminders**: Automated email, notification, and SMS reminders
- **Time Zones**: Timezone-aware scheduling

## Features

### Event Types

- `meeting` - Team or client meetings
- `appointment` - One-on-one appointments
- `event` - General events
- `task` - Scheduled tasks
- `reminder` - Time-based reminders
- `block` - Time blocking for focus time
- `other` - Custom event types

### Event Properties

```typescript
interface ScheduledEvent {
  // Basic Info
  title: string;
  description?: string;
  type: EventType;

  // Linked Entity
  entityType: string; // e.g., "project", "customer"
  entityId: string;

  // Time
  startTime: number;
  endTime: number;
  timezone?: string;
  allDay: boolean;

  // Recurrence
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;

  // Participants
  organizerId: string;
  attendees?: Attendee[];

  // Location
  location?: Location;

  // Status
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  visibility: 'public' | 'private' | 'internal';

  // Other
  reminders?: Reminder[];
  color?: string;
  tags?: string[];
  attachments?: Attachment[];
}
```

## Installation & Setup

### 1. Frontend Setup (Already Done)

The frontend is complete with:
- Types defined in `types/index.ts`
- Hooks in `hooks/useScheduling.ts`
- Service class in `services/SchedulingService.ts`
- UI components in `components/`

### 2. Backend Setup (REQUIRED - Not Yet Implemented)

You need to create the Convex backend for this module:

#### A. Create Schema

**File:** `convex/schema/boilerplate/supporting.ts`

Add the scheduledEvents table:

```typescript
scheduledEvents: defineTable({
  // Basic info
  title: v.string(),
  description: v.optional(v.string()),
  type: v.union(
    v.literal('meeting'),
    v.literal('appointment'),
    v.literal('event'),
    v.literal('task'),
    v.literal('reminder'),
    v.literal('block'),
    v.literal('other')
  ),

  // Linked entity
  entityType: v.string(),
  entityId: v.string(),

  // Time
  startTime: v.number(),
  endTime: v.number(),
  timezone: v.optional(v.string()),
  allDay: v.boolean(),

  // Recurrence
  isRecurring: v.boolean(),
  recurrencePattern: v.optional(v.object({
    frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'), v.literal('yearly')),
    interval: v.number(),
    daysOfWeek: v.optional(v.array(v.number())),
    dayOfMonth: v.optional(v.number()),
    monthOfYear: v.optional(v.number()),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  })),
  parentEventId: v.optional(v.id('scheduledEvents')),

  // Participants
  organizerId: v.string(),
  attendees: v.optional(v.array(v.object({
    userId: v.id("userProfiles"),
    userName: v.string(),
    email: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined'), v.literal('tentative')),
    responseAt: v.optional(v.number()),
  }))),

  // Location
  location: v.optional(v.object({
    type: v.union(v.literal('physical'), v.literal('virtual'), v.literal('phone'), v.literal('other')),
    address: v.optional(v.string()),
    roomNumber: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    instructions: v.optional(v.string()),
  })),

  // Status
  status: v.union(
    v.literal('scheduled'),
    v.literal('confirmed'),
    v.literal('cancelled'),
    v.literal('completed'),
    v.literal('no_show')
  ),
  visibility: v.union(v.literal('public'), v.literal('private'), v.literal('internal')),
  priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent')),

  // Reminders
  reminders: v.optional(v.array(v.object({
    type: v.union(v.literal('email'), v.literal('notification'), v.literal('sms')),
    minutesBefore: v.number(),
    sent: v.boolean(),
    sentAt: v.optional(v.number()),
  }))),

  // Other
  color: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  attachments: v.optional(v.array(v.object({
    filename: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  }))),
  metadata: v.optional(v.any()),

  // Audit fields
  ...auditFields,
  cancelledBy: v.optional(v.string()),
  cancelledAt: v.optional(v.number()),
  cancellationReason: v.optional(v.string()),
})
.index('by_entity', ['entityType', 'entityId'])
.index('by_organizer', ['organizerId'])
.index('by_time', ['startTime'])
.index('by_status', ['status'])
.index('by_created', ['createdAt']),
```

#### B. Create Backend Module

Create the following files in `convex/lib/boilerplate/supporting/scheduling/`:

**types.ts:**
```typescript
export type ScheduledEvent = Doc<'scheduledEvents'>
export type ScheduledEventId = Id<'scheduledEvents'>
// ... (export all interfaces from frontend types)
```

**queries.ts:**
```typescript
// getEventsByEntity
// getEvent
// getUserEvents
// getEventsInRange
// getUpcomingEvents
// getTodayEvents
// checkAvailability
// findAvailableSlots
// etc.
```

**mutations.ts:**
```typescript
// createEvent
// updateEvent
// cancelEvent
// deleteEvent
// respondToEvent (RSVP)
// rescheduleEvent
// completeEvent
// updateAvailabilityPreferences
```

**utils.ts:**
```typescript
// Validation helpers
// Conflict detection
// Recurrence calculation
// etc.
```

## Usage

### Basic Event Scheduling

```typescript
import { SchedulingSection } from '@/features/boilerplate/supporting';

function ProjectPage({ projectId }) {
  return (
    <div>
      {/* Your content */}

      <SchedulingSection
        entityType="project"
        entityId={projectId}
        title="Project Schedule"
      />
    </div>
  );
}
```

### Using Hooks

```typescript
import {
  useEntityEvents,
  useCreateEvent,
  useCancelEvent,
  useCheckAvailability,
} from '@/features/boilerplate/supporting';

function MyComponent() {
  const { user } = useAuth();

  // Get events for an entity
  const events = useEntityEvents('project', projectId, user?.id);

  // Get user's upcoming events
  const upcoming = useUpcomingEvents(user?.id, 7);

  // Check availability
  const availability = useCheckAvailability(
    userId,
    startTime,
    endTime,
    user?.id
  );

  // Create event
  const createEvent = useCreateEvent();
  const handleCreate = async (data) => {
    await createEvent({
      authUserId: user.id,
      data: {
        title: 'Team Meeting',
        type: 'meeting',
        entityType: 'project',
        entityId: projectId,
        startTime: Date.now() + 3600000,
        endTime: Date.now() + 7200000,
        organizerId: user.id,
      },
    });
  };
}
```

### Using Service Methods

```typescript
import { SchedulingService } from '@/features/boilerplate/supporting';

// Validate event data
const errors = SchedulingService.validateEventData(eventData);

// Check for conflicts
const conflicts = SchedulingService.checkConflicts(newEvent, existingEvents);

// Find available slots
const slots = SchedulingService.findAvailableSlots(
  existingEvents,
  startDate,
  endDate,
  60, // 60-minute slots
  15  // 15-minute buffer
);

// Group events by date
const grouped = SchedulingService.groupEventsByDate(events);

// Get statistics
const stats = SchedulingService.getEventsStats(events);
```

### Individual Components

```typescript
import { EventCard, EventList } from '@/features/boilerplate/supporting';

function Calendar() {
  const events = useUserEvents(user?.id);

  return (
    <EventList
      events={events}
      currentUserId={user?.id}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onRSVP={handleRSVP}
      groupByDate={true}
    />
  );
}
```

## Recurring Events

Create recurring events with flexible patterns:

```typescript
const recurringEvent = {
  title: 'Weekly Team Standup',
  // ... other fields
  isRecurring: true,
  recurrencePattern: {
    frequency: 'weekly',
    interval: 1, // Every week
    daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    endDate: futureTimestamp, // Optional
    maxOccurrences: 52, // Optional - one year
  },
};
```

## Availability Management

### Check User Availability

```typescript
const availability = useCheckAvailability(
  userId,
  proposedStartTime,
  proposedEndTime,
  authUserId
);

if (availability?.hasConflict) {
  console.log('User has conflicts:', availability.conflicts);
}
```

### Find Available Slots

```typescript
const slots = useFindAvailableSlots(
  [userId1, userId2], // Find common availability
  startDate,
  endDate,
  60, // 60-minute slots
  authUserId
);

const availableSlots = slots?.filter(s => s.available);
```

## RSVP & Attendee Management

```typescript
// Respond to event invitation
const respondToEvent = useRespondToEvent();

await respondToEvent({
  authUserId: user.id,
  eventId: event._id,
  response: {
    status: 'accepted', // or 'declined', 'tentative'
    message: 'Looking forward to it!',
  },
});
```

## Integration with Other Features

### Link to Projects

```typescript
<SchedulingSection
  entityType="project"
  entityId={project.id}
/>
```

### Link to Customers

```typescript
<SchedulingSection
  entityType="customer"
  entityId={customer.id}
  title="Customer Appointments"
/>
```

### Link to Tasks

```typescript
<SchedulingSection
  entityType="task"
  entityId={task.id}
  title="Task Schedule"
/>
```

## Configuration

Enable/disable scheduling in your application:

```typescript
import { isFeatureEnabled } from '@/features/boilerplate/supporting';

const schedulingEnabled = isFeatureEnabled('scheduling');
```

Environment variable:
```
VITE_SUPPORTING_FEATURE_SCHEDULING=true
```

## Best Practices

1. **Always validate times**: Use `SchedulingService.validateEventData()` before creating events
2. **Check conflicts**: Use `SchedulingService.checkConflicts()` before scheduling
3. **Use timezones**: Always specify timezone for accurate scheduling
4. **Buffer time**: Add buffer between appointments for preparation
5. **Clear titles**: Use descriptive event titles
6. **Add locations**: Always specify location (physical or virtual)
7. **Set reminders**: Configure appropriate reminders for attendees
8. **Use priorities**: Mark urgent events appropriately

## Future Enhancements

- Calendar view (day/week/month)
- Drag-and-drop rescheduling
- Email invitations with iCal attachments
- SMS reminders
- Availability templates
- Resource booking (rooms, equipment)
- Video conferencing integration
- Time zone converter
- Calendar sync (Google Calendar, Outlook)
- Waitlist management
- Booking pages
- Appointment slots/booking links

## Troubleshooting

### Backend not found errors

If you see TypeScript errors about `api.lib.boilerplate.supporting.scheduling`, you need to implement the Convex backend first (see Setup section above).

### Timezone issues

Always use IANA timezone identifiers (e.g., "America/New_York", "Europe/London")

### Conflict detection not working

Make sure to:
1. Filter out cancelled events
2. Use proper timestamp comparison
3. Account for buffer time

## API Reference

See inline TypeScript documentation in:
- `types/index.ts` - All type definitions
- `hooks/useScheduling.ts` - All hooks
- `services/SchedulingService.ts` - All service methods
- `components/` - Component props and usage
