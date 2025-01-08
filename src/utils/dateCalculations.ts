// WHY: Centralizes all date-related calculations to ensure consistent handling of PTO periods
// WHAT: Provides core date manipulation functions for PTO accrual and business day calculations
// NOTE: All dates are passed as strings to avoid timezone issues across the application

import { AccrualPeriodType } from "../types";

// WHY: Different companies have different accrual schedules (weekly, biweekly, or semi-monthly)
// WHAT: Calculates when the next PTO accrual will occur based on the last accrual date
// NOTE: For semi-monthly, accruals occur on the 1st and 15th of each month
export const calculateNextAccrualDate = (
  lastAccrualDate: string,
  accrualPeriodType: AccrualPeriodType
): Date => {
  const lastAccrual = new Date(lastAccrualDate);
  const nextAccrual = new Date(lastAccrual);

  // WHY: Each accrual type requires different date arithmetic
  // NOTE: Semi-monthly requires special handling due to varying month lengths
  switch (accrualPeriodType) {
    case "weekly":
      nextAccrual.setDate(lastAccrual.getDate() + 7);
      break;
    case "biweekly":
      nextAccrual.setDate(lastAccrual.getDate() + 14);
      break;
    case "semi-monthly":
      // WHY: Semi-monthly periods are on 1st and 15th of each month
      // NOTE: Need to handle month boundaries carefully
      if (lastAccrual.getDate() < 15) {
        nextAccrual.setDate(15);
      } else {
        nextAccrual.setDate(1);
        nextAccrual.setMonth(nextAccrual.getMonth() + 1);
      }
      break;
  }

  return nextAccrual;
};

// WHY: Need to calculate how many accrual periods occur between two dates
// WHAT: Returns the number of complete pay periods between start and end dates
// NOTE: Semi-monthly periods use an approximation since months have different lengths
export const calculatePayPeriodsBetweenDates = (
  startDate: string,
  endDate: string,
  accrualPeriodType: AccrualPeriodType
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDifference =
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  // WHY: Different period types require different day-count calculations
  // NOTE: Semi-monthly uses 15.2 days as average (365/24 periods per year)
  switch (accrualPeriodType) {
    case "weekly":
      return Math.floor(daysDifference / 7);
    case "biweekly":
      return Math.floor(daysDifference / 14);
    case "semi-monthly":
      return Math.floor(daysDifference / 15.2);
  }
};

// WHY: Weekend days are handled differently in PTO calculations
// WHAT: Simple helper to check if a date falls on Saturday or Sunday
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// WHY: PTO is typically only counted for business days
// WHAT: Returns an array of business days between two dates
// NOTE: Excludes weekends but does not account for holidays
export const getBusinessDaysBetweenDates = (
  startDate: string,
  endDate: string
): Date[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: Date[] = [];

  const current = new Date(start);
  while (current <= end) {
    if (!isWeekend(current)) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// WHY: Date formatting needs to handle timezone differences consistently
// WHAT: Formats date string to localized date with timezone adjustment
// NOTE: Adjusts for timezone to prevent off-by-one day errors
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString();
};