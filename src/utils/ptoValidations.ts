// WHY: PTO validation is a critical business function that ensures employees can't overdraw their balance
// WHAT: Provides comprehensive validation of PTO requests against current balances, future accruals, and company policies
// NOTE: This module operates independently of the UI to ensure consistent validation across the application

import { PTOEvent, PTOSettings } from "../types";
import { calculatePayPeriodsBetweenDates, getTodayString } from "./dateCalculations";

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

  // WHY: Need to handle date comparisons consistently
  // NOTE: Using YYYY-MM-DD strings for comparison
  const today = getTodayString();

  // WHY: Only include future accruals for future events
  // NOTE: This prevents counting accruals that haven't actually occurred yet
  if (event.startDate > today) {
    // WHY: Calculate how many pay periods occur before the event starts
    // NOTE: This determines how many accruals will occur before PTO begins
    const payPeriods = calculatePayPeriodsBetweenDates(
      today,
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
    (e) => e.startDate < event.startDate && e.created !== event.created
  );

  // WHY: Subtract hours from all prior events to get true available balance
  // NOTE: Use reduce to sum up all previously scheduled PTO hours
  const usedHours = priorEvents.reduce((total, e) => total + e.totalHours, 0);
  availableHours -= usedHours;

  // WHY: Some companies set maximum PTO balance limits
  // NOTE: This prevents accrual beyond company-set maximums
  if (settings.hasMaxBalance) {
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
