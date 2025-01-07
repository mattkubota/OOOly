// WHY: PTO event management needs centralized, consistent handling with persistence
// WHAT: Custom hook that provides CRUD operations for PTO events with automatic sorting
// NOTE: All operations maintain chronological order and handle data persistence

import { useCallback } from "react";
import { PTOEvent, PTOSettings } from "../types";
import { useLocalStorage } from "./useLocalStorage";
import { calculateAvailableHours } from "../utils/ptoCalculations";

// WHY: Events must always be displayed in chronological order
// WHAT: Creates a new sorted array of events based on start date
// NOTE: Creates a new array to ensure React detects the change
const sortEvents = (events: PTOEvent[]) =>
  [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

export function usePTOEvents(settings: PTOSettings) {
  // WHY: Events need to persist across browser sessions
  // WHAT: Uses local storage hook to maintain event data
  // NOTE: Initial state is an empty array if no events exist
  const [events, setEvents] = useLocalStorage<PTOEvent[]>("timeOffEvents", []);

  // WHY: Adding events must maintain chronological order
  // WHAT: Adds a new event and resort the entire list
  // NOTE: useCallback prevents unnecessary recreation of this function
  const addEvent = useCallback(
    (event: PTOEvent) => {
      setEvents((currentEvents) => sortEvents([...currentEvents, event]));
    },
    [setEvents]
  );

  // WHY: Events need to be updated while maintaining their identity
  // WHAT: Updates an existing event by matching the creation timestamp
  // NOTE: The created field serves as a unique identifier
  const updateEvent = useCallback(
    (updatedEvent: PTOEvent) => {
      setEvents((currentEvents) =>
        sortEvents(
          currentEvents.map((event) =>
            event.created === updatedEvent.created ? updatedEvent : event
          )
        )
      );
    },
    [setEvents]
  );

  // WHY: Users need to be able to cancel planned PTO
  // WHAT: Removes an event while maintaining the sort order
  // NOTE: Uses created timestamp for reliable event identification
  const deleteEvent = useCallback(
    (eventToDelete: PTOEvent) => {
      setEvents((currentEvents) =>
        sortEvents(
          currentEvents.filter(
            (event) => event.created !== eventToDelete.created
          )
        )
      );
    },
    [setEvents]
  );

  // WHY: Need to validate PTO requests against available balance
  // WHAT: Calculates if there are sufficient hours for an event
  // NOTE: Only considers events that occur before the requested dates
  const checkEventAvailability = useCallback(
    (event: PTOEvent) => {
      const priorEvents = events.filter(
        (e) => new Date(e.startDate) < new Date(event.startDate)
      );

      return calculateAvailableHours(event, settings, priorEvents);
    },
    [events, settings]
  );

  // WHY: Components need events in chronological order
  // NOTE: Ensures consistent ordering across the application
  const sortedEvents = sortEvents(events);

  return {
    events: sortedEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    checkEventAvailability,
  };
}
