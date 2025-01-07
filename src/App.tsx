import React, { useState, useEffect } from "react";
import "./App.css";

// Component imports will go here
import { DashboardHeader } from "./components/dashboard/DashboardHeader";
import { SummaryCards } from "./components/dashboard/SummaryCards";
import { EventsList } from "./components/dashboard/EventsList";
import { SettingsForm } from "./components/settings/SettingsForm";
import { EventForm } from "./components/events/EventForm";

import { usePTOEvents } from "./hooks/usePtoEvents";
import { DEFAULT_SETTINGS } from "./hooks/usePtoSettings";

// Type imports
import { PTOSettings, PTOEvent } from "./types";

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [settings, setSettings] = useState<PTOSettings | null>(null);
  const [editingEvent, setEditingEvent] = useState<PTOEvent | undefined>(
    undefined
  );

  const { events, addEvent, updateEvent, deleteEvent } = usePTOEvents(
    settings || DEFAULT_SETTINGS
  );

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("timeOffSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = (newSettings: PTOSettings) => {
    setSettings(newSettings);
    localStorage.setItem("timeOffSettings", JSON.stringify(newSettings));
    setShowSettings(false);
  };

  const handleSaveEvent = (event: PTOEvent) => {
    if (editingEvent) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
    setShowEventForm(false);
    setEditingEvent(undefined);
  };

  const handleEditEvent = (eventToEdit: PTOEvent) => {
    setEditingEvent(eventToEdit);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventToDelete: PTOEvent) => {
    deleteEvent(eventToDelete);
  };

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
    </div>
  );
};

export default App;
