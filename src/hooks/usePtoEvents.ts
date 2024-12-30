import { useCallback } from 'react';
import { PTOEvent, PTOSettings } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { calculateAvailableHours } from '../utils/ptoCalculations';

const sortEvents = (events: PTOEvent[]) => 
  [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

export function usePTOEvents(settings: PTOSettings) {
  const [events, setEvents] = useLocalStorage<PTOEvent[]>('timeOffEvents', []);

  const addEvent = useCallback((event: PTOEvent) => {
    setEvents(currentEvents => sortEvents([...currentEvents, event]));
  }, [setEvents]);

  const updateEvent = useCallback((updatedEvent: PTOEvent) => {
    setEvents(currentEvents => 
      sortEvents(currentEvents.map(event => 
        event.created === updatedEvent.created ? updatedEvent : event
      ))
    );
  }, [setEvents]);

  const deleteEvent = useCallback((eventToDelete: PTOEvent) => {
    setEvents(currentEvents => 
      sortEvents(currentEvents.filter(event => event.created !== eventToDelete.created))
    );
  }, [setEvents]);

  const checkEventAvailability = useCallback((event: PTOEvent) => {
    const priorEvents = events.filter(e => 
      new Date(e.startDate) < new Date(event.startDate)
    );

    return calculateAvailableHours(event, settings, priorEvents);
  }, [events, settings]);

  // Return sorted events
  const sortedEvents = sortEvents(events);

  return {
    events: sortedEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    checkEventAvailability
  };
}