import { PTOEvent, PTOSettings } from '../types';
import { calculatePayPeriodsBetweenDates } from './dateCalculations';

export const calculateAvailableHours = (
  event: PTOEvent,
  settings: PTOSettings,
  priorEvents: PTOEvent[]
): {
  availableAtStart: number;
  isEnoughHours: boolean;
  shortageAmount: number;
} => {
  let availableHours = settings.currentBalance;
  const eventStart = new Date(event.startDate);
  const today = new Date();
  
  // Calculate accruals until event start
  const payPeriodsUntilEvent = calculatePayPeriodsBetweenDates(
    today.toISOString(),
    event.startDate,
    settings.accrualPeriodType
  );
  
  availableHours += (payPeriodsUntilEvent * settings.accrualRate);
  
  // Subtract hours from any events before this one
  const priorHoursUsed = priorEvents
    .filter(e => new Date(e.startDate) < eventStart)
    .reduce((total, e) => total + e.totalHours, 0);
  
  availableHours -= priorHoursUsed;

  // Handle maximum balance if set
  if (settings.hasMaxBalance) {
    availableHours = Math.min(availableHours, settings.maxBalance);
  }

  const isEnoughHours = availableHours >= event.totalHours;
  const shortageAmount = isEnoughHours ? 0 : event.totalHours - availableHours;

  return {
    availableAtStart: availableHours,
    isEnoughHours,
    shortageAmount
  };
};

export const calculateTotalHours = (event: PTOEvent): number => {
  return event.days.reduce((total, day) => {
    if (day.isWeekend || day.type === 'holiday') return total;
    return total + (day.type === 'full' ? 8 : 4);
  }, 0);
};

export const calculateYearEndProjection = (
  settings: PTOSettings,
  plannedEvents: PTOEvent[]
): {
  projectedBalance: number;
  willExceedRollover: boolean;
  hoursAtRisk: number;
} => {
  const today = new Date();
  const yearEnd = new Date(today.getFullYear(), 11, 31);
  
  const remainingPayPeriods = calculatePayPeriodsBetweenDates(
    today.toISOString(),
    yearEnd.toISOString(),
    settings.accrualPeriodType
  );
  
  const projectedAccrual = remainingPayPeriods * settings.accrualRate;
  const plannedHours = plannedEvents.reduce((total, event) => total + event.totalHours, 0);
  
  let projectedBalance = settings.currentBalance + projectedAccrual - plannedHours;
  
  if (settings.hasMaxBalance) {
    projectedBalance = Math.min(projectedBalance, settings.maxBalance);
  }

  const willExceedRollover = settings.hasMaxRollover && projectedBalance > settings.maxRollover;
  const hoursAtRisk = willExceedRollover ? projectedBalance - settings.maxRollover : 0;

  return {
    projectedBalance,
    willExceedRollover,
    hoursAtRisk
  };
};