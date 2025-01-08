import React, { useState, useEffect } from "react";
import "./App.css";
import { Analytics } from "@vercel/analytics/react";

import { DashboardHeader } from "./components/dashboard/DashboardHeader";
import { SummaryCards } from "./components/dashboard/SummaryCards";
import { EventsList } from "./components/dashboard/EventsList";
import { SettingsForm } from "./components/settings/SettingsForm";
import { EventForm } from "./components/events/EventForm";

import { usePTOEvents } from "./hooks/usePtoEvents";
import { DEFAULT_SETTINGS } from "./hooks/usePtoSettings";

import { PTOSettings, PTOEvent } from "./types";

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [settings, setSettings] = useState<PTOSettings | null>(null);
  const [editingEvent, setEditingEvent] = useState<PTOEvent | undefined>(
    undefined
  );
  const [startAtDateStep, setStartAtDateStep] = useState(false);

  const { events, addEvent, updateEvent, deleteEvent } = usePTOEvents(
    settings || DEFAULT_SETTINGS
  );

  useEffect(() => {
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
    setStartAtDateStep(false);
  };

  // New handler for inline name editing
  const handleEditName = (event: PTOEvent, newName: string) => {
    const updatedEvent = { ...event, name: newName };
    updateEvent(updatedEvent);
  };

  // Modified handler for date editing
  const handleEditDates = (event: PTOEvent) => {
    setEditingEvent(event);
    setStartAtDateStep(true);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventToDelete: PTOEvent) => {
    deleteEvent(eventToDelete);
  };

  const renderDashboard = () => (
    <>
      <DashboardHeader
        onOpenSettings={() => setShowSettings(true)}
        onAddEvent={() => {
          setEditingEvent(undefined);
          setStartAtDateStep(false);
          setShowEventForm(true);
        }}
      />

      <SummaryCards settings={settings!} />

      <EventsList
        events={events}
        settings={settings!}
        onAddFirst={() => {
          setEditingEvent(undefined);
          setStartAtDateStep(false);
          setShowEventForm(true);
        }}
        onEditName={handleEditName}
        onEditDates={handleEditDates}
        onDelete={handleDeleteEvent}
      />
    </>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!settings ? (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Welcome to OOOly
          </h2>
          <p className="mb-4 text-center">
            Please set up your OOO benefit details to get started.
          </p>
          <SettingsForm onSave={handleSaveSettings} />
        </>
      ) : showSettings ? (
        <SettingsForm onSave={handleSaveSettings} initialSettings={settings} />
      ) : (
        <>
          {renderDashboard()}
          {showEventForm && (
            <EventForm
              isOpen={showEventForm}
              onSubmit={handleSaveEvent}
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(undefined);
                setStartAtDateStep(false);
              }}
              initialEvent={editingEvent}
              existingEvents={events}
              startAtDateStep={startAtDateStep}
            />
          )}
        </>
      )}
      <Analytics />
    </div>
  );
};

export default App;
