# Calendar Module

A comprehensive calendar module for Next.js applications with drag-and-drop event management, multiple views, and user-specific settings.

## Features

- **Multiple Calendar Views**: Day, Week, Month, Year, and Agenda views
- **Event Management**: Create, edit, and delete calendar events
- **Drag and Drop**: Easily reschedule events by dragging them
- **User-Specific Calendars**: Filter events by user
- **Working Hours**: Configure working hours for each day of the week
- **Customizable Settings**: Set default view, visible hours, and event display style
- **Responsive Design**: Works on all screen sizes

## Directory Structure

```
src/calendar/
├── components/            # UI components
│   ├── agenda-view/       # Agenda view components
│   ├── dialogs/           # Event creation/editing dialogs
│   ├── dnd/               # Drag and drop functionality
│   ├── header/            # Calendar header components
│   ├── month-view/        # Month view components
│   ├── settings/          # Settings forms and UI
│   ├── week-and-day-view/ # Week and day view components
│   ├── year-view/         # Year view components
│   ├── client-container.tsx # Main client component
│   └── loading.tsx        # Skeleton loading components
├── contexts/              # React contexts
│   └── calendar-context.tsx # Calendar state management
├── interfaces.ts          # TypeScript interfaces
├── requests.ts            # API request functions
├── schemas.ts             # Zod validation schemas
└── types.ts               # TypeScript type definitions
```

## Data Schema

The calendar module uses the following database schema:

### Events Table

- `id`: Unique identifier
- `title`: Event title
- `description`: Event description (optional)
- `startDate`: Event start date and time
- `endDate`: Event end date and time
- `userId`: Associated user ID
- `color`: Event color (for visual identification)

### Working Hours Table

- `id`: Unique identifier
- `userId`: Associated user ID
- `dayOfWeek`: Day of the week (0-6, Sunday-Saturday)
- `fromHour`: Start hour (0-23)
- `toHour`: End hour (1-24)
- `enabled`: Whether working hours are enabled for this day

### Calendar Settings Table

- `id`: Unique identifier
- `userId`: Associated user ID
- `defaultView`: Default calendar view (day, week, month, year, agenda)
- `visibleHoursFrom`: First visible hour in day/week view (0-23)
- `visibleHoursTo`: Last visible hour in day/week view (1-24)
- `badgeVariant`: Event display style in month/year view (dot, text)

## Usage

### Basic Usage

```tsx
import { CalendarContent } from "@/calendar/components/client-container"

export default function CalendarPage() {
  return (
    <div className="container py-10">
      <CalendarContent view="month" />
    </div>
  )
}
```

### Settings Example

```tsx
import { CalendarSettingsForm } from "@/calendar/components/settings/calendar-settings-form"
import { WorkingHoursForm } from "@/calendar/components/settings/working-hours-form"

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Calendar Settings</h1>

      <div className="space-y-8">
        <CalendarSettingsForm />
        <WorkingHoursForm />
      </div>
    </div>
  )
}
```

## API Integration

The calendar module uses tRPC for API integration. The main router is defined in `src/server/api/routers/calendar.ts` and includes procedures for:

- Fetching all events for the current user
- Creating new events
- Updating existing events
- Deleting events
- Managing working hours
- Managing calendar settings
- Fetching all users for filtering

## Loading States

Suspense and loading skeletons are used to provide a smooth user experience during data fetching:

```tsx
import { Suspense } from "react"
import { CalendarSkeleton } from "@/calendar/components/loading"
import { CalendarContent } from "@/calendar/components/calendar-content"

export function Calendar({ view }) {
  return (
    <Suspense fallback={<CalendarSkeleton view={view} />}>
      <CalendarContent view={view} />
    </Suspense>
  )
}
```

## Context API

The calendar state is managed using the Calendar Context:

```tsx
const {
  selectedDate,
  selectedUserId,
  events,
  setSelectedDate,
  setSelectedUserId
} = useCalendar()
```

This context provides access to:

- Current selected date
- Currently selected user ID
- Available events
- Working hours
- Calendar settings
- Badge variant

## Customization

The calendar module can be customized by:

1. Modifying the CSS classes in the component files
2. Changing the color schemes in the `types.ts` file
3. Extending the database schema with additional fields
4. Adding custom views by creating new components

## Dependencies

- `date-fns`: Date manipulation utilities
- `react-dnd`: Drag and drop functionality
- `react-hook-form`: Form management for settings
- `zod`: Schema validation
- `tRPC`: API integration

## Browser Compatibility

The calendar module is compatible with all modern browsers:

- Chrome
- Firefox
- Safari
- Edge
