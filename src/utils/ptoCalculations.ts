// WHY: Centralizes all PTO-specific calculations to ensure consistent business logic
// WHAT: Handles calculations for PTO availability, usage, and projections
// NOTE: All calculations account for maximum balances and rollover limits

import { PTOEvent, PTOSettings } from "../types";
import { calculatePayPeriodsBetweenDates } from "./dateCalculations";

// WHY: Need to verify sufficient PTO balance before allowing event creation
// WHAT: Calculates available hours at event start considering accruals and prior usage
// NOTE: Accounts for maximum balance limits if configured
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

  // WHY: Include future accruals up to event start date
  // NOTE: This allows planning future PTO that depends on accruals
  const payPeriodsUntilEvent = calculatePayPeriodsBetweenDates(
    today.toISOString(),
    event.startDate,
    settings.accrualPeriodType
  );

  availableHours += payPeriodsUntilEvent * settings.accrualRate;

  // WHY: Must account for all PTO events that occur before this one
  // NOTE: Uses filter to ensure chronological order of events
  const priorHoursUsed = priorEvents
    .filter((e) => new Date(e.startDate) < eventStart)
    .reduce((total, e) => total + e.totalHours, 0);

  availableHours -= priorHoursUsed;

  // WHY: Some companies cap maximum PTO balance
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

// WHY: Different day types (full/half/holiday) affect total PTO hours differently
// WHAT: Calculates total PTO hours for an event accounting for day types
// NOTE: Weekends and holidays don't consume PTO hours
export const calculateTotalHours = (event: PTOEvent): number => {
  return event.days.reduce((total, day) => {
    if (day.isWeekend || day.type === "holiday") return total;
    return total + (day.type === "full" ? 8 : 4);
  }, 0);
};

// WHY: Need to warn users about potential loss of PTO due to rollover limits
// WHAT: Projects year-end balance and identifies hours at risk of being lost
// NOTE: Accounts for both maximum balance and rollover limits
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

  // WHY: Calculate remaining accruals for the year
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

  // WHY: Apply maximum balance limit if configured
  if (settings.hasMaxBalance) {
    projectedBalance = Math.min(projectedBalance, settings.maxBalance);
  }

  // WHY: Calculate hours that would be lost due to rollover limit
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
