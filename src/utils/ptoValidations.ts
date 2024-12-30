import { PTOEvent, PTOSettings } from '../types';
import { calculatePayPeriodsBetweenDates } from './dateCalculations';

export function validateEventBalance(
  event: PTOEvent,
  settings: PTOSettings,
  otherEvents: PTOEvent[]
): {
  availableHours: number;
  hasEnough: boolean;
  difference: number;
} {
  // Start with current balance
  let availableHours = settings.currentBalance;

  // Use the date string directly to avoid timezone issues
  const [eventYear] = event.startDate.split('-').map(Number);
  const currentYear = new Date().getFullYear();

  console.log('Event Date String:', event.startDate);
  console.log('Parsed Event Year:', eventYear);
  console.log('Current Year:', currentYear);

  if (eventYear > currentYear && settings.maxRollover !== undefined) {
    availableHours = Math.min(availableHours, settings.maxRollover);
    console.log('Applied rollover limit:', availableHours);
  }

  // Calculate accruals up to event start date
  const today = new Date();
  const eventStart = new Date(event.startDate);

  // Only calculate future accruals if event is in the future
  if (eventStart > today) {
    const payPeriods = calculatePayPeriodsBetweenDates(
      today.toISOString(),
      event.startDate,
      settings.accrualPeriodType
    );

    const accruedHours = payPeriods * settings.accrualRate;
    availableHours += accruedHours;
  }

  // Subtract hours from events that occur before this one
  const priorEvents = otherEvents.filter(e => 
    new Date(e.startDate) < eventStart && e.created !== event.created
  );

  const usedHours = priorEvents.reduce((total, e) => total + e.totalHours, 0);
  availableHours -= usedHours;

  // Handle maximum balance if set
  if (settings.maxBalance !== undefined) {
    availableHours = Math.min(availableHours, settings.maxBalance);
  }

  // Calculate final numbers
  const difference = availableHours - event.totalHours;
  const hasEnough = difference >= 0;

  return {
    availableHours,
    hasEnough,
    difference
  };
}