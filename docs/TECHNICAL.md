# OOOly - PTO Tracking Application Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Application Structure](#application-structure)
4. [Core Features](#core-features)
5. [Technical Implementation](#technical-implementation)
6. [Component Reference](#component-reference)
7. [Hooks Reference](#hooks-reference)
8. [Utils Reference](#utils-reference)
9. [Type Definitions](#type-definitions)
10. [Styling Guide](#styling-guide)
11. [Build Configuration](#build-configuration)

## Project Overview

OOOly is a web application for tracking and managing Paid Time Off (PTO). It features:
- Local storage for data persistence
- PTO balance tracking and calculations
- Event planning with conflict detection
- Settings management for PTO policies

## Getting Started

### Prerequisites
- Node.js
- npm or yarn

### Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Application Structure

```
src/
├── components/           # React components
│   ├── Footer.tsx      # Application footer component
│   ├── dashboard/       # Dashboard-related components
│   │   ├── DashboardHeader.tsx
│   │   ├── EventsList.tsx
│   │   └── SummaryCards.tsx
│   ├── events/         # Event management components
│   │   ├── EventCard.tsx
│   │   └── EventForm.tsx
│   └── settings/       # Settings components
│       └── SettingsForm.tsx
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## Core Features

### 1. PTO Settings Management
- Current balance tracking
- Accrual rate configuration
- Maximum rollover settings
- Maximum balance limits

### 2. Event Planning
- Create/edit/delete PTO events
- Date range selection
- Conflict detection
- Day type configuration (full/half/holiday)

### 3. Dashboard
- Current PTO balance display
- Next accrual date calculation
- Upcoming events list
- Balance warnings

## Technical Implementation

### Data Flow
1. **Settings Management**
```typescript
User Input → SettingsForm → LocalStorage → App State → Components
```

2. **Event Management**
```typescript
User Input → EventForm → Validation → LocalStorage → Dashboard Update
```

### State Management
The application uses React's built-in state management with the following pattern:
```typescript
// App.tsx - Main state management
const [settings, setSettings] = useState<PTOSettings | null>(null);
const { events, addEvent, updateEvent, deleteEvent } = usePTOEvents(settings);
```

## Component Reference

### Core Components

#### Footer
**Purpose:** Application-wide footer with attribution and links
**Key Features:**
- Author attribution with website link
- GitHub repository link
- Buy Me a Coffee integration
- Responsive layout with subtle styling

```typescript
// Footer component - no props required
export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 py-4 text-center text-sm text-gray-500">
      {/* Footer content */}
    </footer>
  );
};
```

### Dashboard Components

#### DashboardHeader
**Purpose:** Main navigation and action buttons
```typescript
interface DashboardHeaderProps {
  onOpenSettings: () => void;
  onAddEvent: () => void;
}
```

#### SummaryCards
**Purpose:** Display PTO metrics
```typescript
interface SummaryCardsProps {
  settings: PTOSettings;
}
```

#### EventsList
**Purpose:** Display and manage PTO events
```typescript
interface EventsListProps {
  events: PTOEvent[];
  settings: PTOSettings;
  onAddFirst: () => void;
  onEdit: (event: PTOEvent) => void;
  onDelete: (event: PTOEvent) => void;
}
```

### Form Components

#### EventForm
**Purpose:** Create/edit PTO events
**Key Features:**
- Multi-step form process
- Date validation
- Conflict checking
- Day type configuration

#### SettingsForm
**Purpose:** Configure PTO settings
**Key Features:**
- Input validation
- Maximum limits configuration
- Accrual settings

## Hooks Reference

### useLocalStorage

**Purpose:** Persist data in localStorage with type safety

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void];
```

### usePTOEvents

**Purpose:** Manage PTO events
**Key Features:**

- Event CRUD operations
- Event sorting
- Availability checking

## Utils Reference

### dateCalculations.ts

**Purpose:** Handle date-related operations
**Key Functions:**

```typescript
calculateNextAccrualDate(lastAccrualDate: string, accrualPeriodType: AccrualPeriodType): Date
calculatePayPeriodsBetweenDates(startDate: string, endDate: string, accrualPeriodType: AccrualPeriodType): number
isWeekend(date: Date): boolean
```

### ptoCalculations.ts

**Purpose:** Handle PTO math operations
**Key Functions:**

```typescript
calculateAvailableHours(event: PTOEvent, settings: PTOSettings, priorEvents: PTOEvent[]): {
  availableAtStart: number;
  isEnoughHours: boolean;
  shortageAmount: number;
}
calculateYearEndProjection(settings: PTOSettings, plannedEvents: PTOEvent[]): {
  projectedBalance: number;
  willExceedRollover: boolean;
  hoursAtRisk: number;
} // Currently unused but available for future features
shouldWarnAboutRollover(settings: PTOSettings): boolean // Currently unused but available for future features
```

## Type Definitions

### Core Types

```typescript
type AccrualPeriodType = "weekly" | "biweekly" | "semi-monthly";
type DayType = "full" | "half" | "holiday" | "weekend";

interface PTOSettings {
  currentBalance: number;
  accrualRate: number;
  accrualPeriodType: AccrualPeriodType;
  lastAccrualDate: string;
  hasMaxRollover: boolean;
  maxRollover: number;
  hasMaxBalance: boolean;
  maxBalance: number;
}

interface PTOEvent {
  name: string;
  startDate: string;
  endDate: string;
  days: PTODay[];
  totalHours: number;
  created: string;
}
```

## Styling Guide

### CSS Organization

1. **Tailwind Utilities**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. **Custom Styles**

- Custom scrollbar styling
- Base styles using Tailwind classes
- Transition effects for animations

### Common Patterns

```typescript
// Component layout pattern
<div className="max-w-4xl mx-auto p-6">
  <div className="bg-white rounded-lg shadow">{/* Component content */}</div>
</div>
```

## Build Configuration

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
  },
});
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## Best Practices

### 1. State Updates

Always use the functional update pattern for state:

```typescript
// ✅ Good
setData((prev) => ({ ...prev, newValue }));

// ❌ Avoid
setData({ ...data, newValue });
```

### 2. Type Safety

Use TypeScript interfaces for all props:

```typescript
interface ComponentProps {
  data: PTOSettings;
  onUpdate: (settings: PTOSettings) => void;
}
```

### 3. Error Handling

Always handle potential errors in data operations:

```typescript
try {
  const savedData = localStorage.getItem("key");
  if (savedData) {
    return JSON.parse(savedData);
  }
} catch (error) {
  console.error("Failed to load data:", error);
  return initialValue;
}
```

### 4. Form Validation

Validate all user input before processing:

```typescript
if (value < 0) {
  setErrors((prev) => ({
    ...prev,
    balance: "Value cannot be negative",
  }));
  return;
}
```
