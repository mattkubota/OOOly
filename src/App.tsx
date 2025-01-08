// WHY: App.tsx serves as the central component orchestrating the entire PTO tracking application
// WHAT: Manages global state, handles routing between main views, and coordinates data flow
// NOTE: This component follows a local-first architecture pattern, prioritizing browser storage

import React, { useState, useEffect } from "react";
import "./App.css";
import { Analytics } from "@vercel/analytics/react"

// WHY: Separated dashboard components to maintain single responsibility principle
// NOTE: Component structure mirrors the three main functional areas: dashboard, settings, and events
import { DashboardHeader } from "./components/dashboard/DashboardHeader";
import { SummaryCards } from "./components/dashboard/SummaryCards";
import { EventsList } from "./components/dashboard/EventsList";
import { SettingsForm } from "./components/settings/SettingsForm";
import { EventForm } from "./components/events/EventForm";

// WHY: Custom hooks abstract PTO-specific business logic away from the UI component
import { usePTOEvents } from "./hooks/usePtoEvents";
import { DEFAULT_SETTINGS } from "./hooks/usePtoSettings";

import { PTOSettings, PTOEvent } from "./types";

const App: React.FC = () => {
  // WHY: Using modal-style state management for settings and event forms
  // NOTE: This approach simplifies routing while maintaining a clean UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  // WHY: Settings are nullable to handle the first-time user experience
  // NOTE: null settings triggers the onboarding flow
  const [settings, setSettings] = useState<PTOSettings | null>(null);

  // WHY: Separate state for editing vs creating events to handle different UI flows
  const [editingEvent, setEditingEvent] = useState<PTOEvent | undefined>(
    undefined
  );

  // WHY: Events management is delegated to a custom hook for better separation of concerns
  // NOTE: DEFAULT_SETTINGS ensures the hook always has valid settings to work with
  const { events, addEvent, updateEvent, deleteEvent } = usePTOEvents(
    settings || DEFAULT_SETTINGS
  );

  // WHY: Load settings on mount to restore user's previous configuration
  // NOTE: This effect runs only once to initialize the application state
  useEffect(() => {
    const savedSettings = localStorage.getItem("timeOffSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // WHY: Centralizes settings persistence logic and UI state management
  // NOTE: Settings are immediately persisted to ensure data isn't lost
  const handleSaveSettings = (newSettings: PTOSettings) => {
    setSettings(newSettings);
    localStorage.setItem("timeOffSettings", JSON.stringify(newSettings));
    setShowSettings(false);
  };

  // WHY: Single handler for both create and update operations
  // NOTE: Uses presence of editingEvent to determine operation type
  const handleSaveEvent = (event: PTOEvent) => {
    if (editingEvent) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
    setShowEventForm(false);
    setEditingEvent(undefined);
  };

  // WHY: Prepare UI state for event editing
  const handleEditEvent = (eventToEdit: PTOEvent) => {
    setEditingEvent(eventToEdit);
    setShowEventForm(true);
  };

  // WHY: Direct delegation to events hook for consistency
  const handleDeleteEvent = (eventToDelete: PTOEvent) => {
    deleteEvent(eventToDelete);
  };

  // WHY: Conditional rendering pattern handles different application states
  // NOTE: This approach provides a clear hierarchy of views:
  // 1. First-time setup
  // 2. Settings modal
  // 3. Event form modal
  // 4. Main dashboard
  if (!settings) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Welcome to OOOly
        </h2>
        <p className="mb-4 text-center">
          Please set up your OOO benefit details to get started.
        </p>
        <SettingsForm onSave={handleSaveSettings} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <SettingsForm onSave={handleSaveSettings} initialSettings={settings} />
    );
  }

  if (showEventForm) {
    return (
      <EventForm
        onSubmit={handleSaveEvent}
        onCancel={() => {
          setShowEventForm(false);
          setEditingEvent(undefined);
        }}
        initialEvent={editingEvent}
        existingEvents={events}
      />
    );
  }

  // WHY: Main dashboard view combines all primary UI components
  // NOTE: Layout uses Tailwind's max-width and auto margins for responsive design
  return (
    <div className="max-w-4xl mx-auto p-6">
      <DashboardHeader
        onOpenSettings={() => setShowSettings(true)}
        onAddEvent={() => {
          setEditingEvent(undefined);
          setShowEventForm(true);
        }}
      />

      <SummaryCards settings={settings} />

      <EventsList
        events={events}
        settings={settings}
        onAddFirst={() => {
          setEditingEvent(undefined);
          setShowEventForm(true);
        }}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
      <Analytics />
    </div>
  );
};

export default App;
