// WHY: Core PTO calculations need to be centralized and reusable
// WHAT: Provides utility functions for PTO calculations and validations

import { PTOEvent, PTOSettings } from "../types";
import { calculatePayPeriodsBetweenDates } from "./dateCalculations";

// WHY: Need to validate if users have sufficient hours for PTO requests
// WHAT: Calculates available hours and determines if request can be fulfilled
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

  const payPeriodsUntilEvent = calculatePayPeriodsBetweenDates(
    today.toISOString(),
    event.startDate,
    settings.accrualPeriodType
  );

  availableHours += payPeriodsUntilEvent * settings.accrualRate;

  const priorHoursUsed = priorEvents
    .filter((e) => new Date(e.startDate) < eventStart)
    .reduce((total, e) => total + e.totalHours, 0);

  availableHours -= priorHoursUsed;

  if (settings.hasMaxBalance) {
    availableHours = Math.min(availableHours, settings.maxBalance);
  }

  const isEnoughHours = availableHours >= event.totalHours;
  const shortageAmount = isEnoughHours ? 0 : event.totalHours - availableHours;

  return {
    availableAtStart: availableHours,
    isEnoughHours,
    shortageAmount,
  };
};

// WHY: Companies need to project year-end balances to prevent lost PTO
// WHAT: Calculates projected balance and identifies hours at risk of being lost
// NOTE: Currently not used in UI - could be valuable for year-end planning alerts
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
  const plannedHours = plannedEvents.reduce(
    (total, event) => total + event.totalHours,
    0
  );

  let projectedBalance =
    settings.currentBalance + projectedAccrual - plannedHours;

  if (settings.hasMaxBalance) {
    projectedBalance = Math.min(projectedBalance, settings.maxBalance);
  }

  const willExceedRollover =
    settings.hasMaxRollover && projectedBalance > settings.maxRollover;
  const hoursAtRisk = willExceedRollover
    ? projectedBalance - settings.maxRollover
    : 0;

  return {
    projectedBalance,
    willExceedRollover,
    hoursAtRisk,
  };
};

// WHY: Users need warning when approaching rollover limit
// WHAT: Determines if current balance is near rollover limit
// NOTE: Currently not used in UI - could be used for warning banner
export const shouldWarnAboutRollover = (settings: PTOSettings): boolean => {
  if (!settings.hasMaxRollover) return false;
  return settings.currentBalance > settings.maxRollover * 0.8;
};
