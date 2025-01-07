// WHY: PTO validation is a critical business function that ensures employees can't overdraw their balance
// WHAT: Provides comprehensive validation of PTO requests against current balances, future accruals, and company policies
// NOTE: This module operates independently of the UI to ensure consistent validation across the application

import { PTOEvent, PTOSettings } from "../types";
import { calculatePayPeriodsBetweenDates } from "./dateCalculations";

// WHY: Companies need to validate PTO requests against both current and projected balances
// WHAT: Determines if an employee has sufficient PTO hours for a requested time off period
// NOTE: This function considers current balance, future accruals, and previously scheduled PTO
export function validateEventBalance(
  event: PTOEvent,
  settings: PTOSettings,
  otherEvents: PTOEvent[]
): {
  availableHours: number; // Total hours available at event start
  hasEnough: boolean; // Whether there are sufficient hours for the request
  difference: number; // Surplus or deficit of hours
} {
  // WHY: Start with current balance as baseline
  // NOTE: This represents immediately available hours
  let availableHours = settings.currentBalance;

  // WHY: Extract year from date string to avoid timezone complications
  // NOTE: Using array destructuring with split() provides clean year extraction
  const [eventYear] = event.startDate.split("-").map(Number);
  const currentYear = new Date().getFullYear();

  // WHY: Need precise dates for accrual calculations
  // NOTE: We create new Date objects here because we need to compare timestamps
  const today = new Date();
  const eventStart = new Date(event.startDate);

  // WHY: Only include future accruals for future events
  // NOTE: This prevents counting accruals that haven't actually occurred yet
  if (eventStart > today) {
    // WHY: Calculate how many pay periods occur before the event starts
    // NOTE: This determines how many accruals will occur before PTO begins
    const payPeriods = calculatePayPeriodsBetweenDates(
      today.toISOString(),
      event.startDate,
      settings.accrualPeriodType
    );

    // WHY: Multiply pay periods by accrual rate to get total future hours
    // NOTE: This represents additional hours that will be available by event start
    const accruedHours = payPeriods * settings.accrualRate;
    availableHours += accruedHours;
  }

  // WHY: Must account for all previously scheduled PTO that occurs before this event
  // NOTE: The created check prevents double-counting when editing an existing event
  const priorEvents = otherEvents.filter(
    (e) => new Date(e.startDate) < eventStart && e.created !== event.created
  );

  // WHY: Subtract hours from all prior events to get true available balance
  // NOTE: Use reduce to sum up all previously scheduled PTO hours
  const usedHours = priorEvents.reduce((total, e) => total + e.totalHours, 0);
  availableHours -= usedHours;

  // WHY: Some companies set maximum PTO balance limits
  // NOTE: This prevents accrual beyond company-set maximums
  if (settings.maxBalance !== undefined) {
    availableHours = Math.min(availableHours, settings.maxBalance);
  }

  // WHY: Need to determine if request can be approved
  // NOTE: Negative difference indicates insufficient hours
  const difference = availableHours - event.totalHours;
  const hasEnough = difference >= 0;

  return {
    availableHours,
    hasEnough,
    difference,
  };
}
