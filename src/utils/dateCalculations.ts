// WHY: Need consistent date handling without timezone issues
// WHAT: Provides core date manipulation utilities using YYYY-MM-DD strings
// NOTE: Avoids timezone shifts by working with UTC dates when needed

import { AccrualPeriodType } from "../types";

// WHY: Need to safely create a Date object from YYYY-MM-DD without timezone shift
// WHAT: Creates a Date object set to noon UTC on the specified date
// NOTE: Using noon UTC ensures we avoid any date boundary issues
export const createDateFromYMD = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

// WHY: Need to safely convert a Date back to YYYY-MM-DD
// WHAT: Converts a Date object to YYYY-MM-DD string using UTC
export const toDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// WHY: Many operations need today's date as a reference point
// WHAT: Gets current date in YYYY-MM-DD format
export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// WHY: Dates need to be displayed in user-friendly format
// WHAT: Converts YYYY-MM-DD string to localized date string
export const formatDate = (dateString: string): string => {
  // Use createDateFromYMD to avoid timezone issues
  return createDateFromYMD(dateString).toLocaleDateString();
};

// WHY: Different companies have different accrual schedules
// WHAT: Calculates next accrual date based on last accrual date
export const calculateNextAccrualDate = (
  lastAccrualDate: string,
  accrualPeriodType: AccrualPeriodType
): string => {
  const lastAccrual = createDateFromYMD(lastAccrualDate);
  const nextAccrual = new Date(lastAccrual);

  switch (accrualPeriodType) {
    case "weekly":
      nextAccrual.setDate(lastAccrual.getDate() + 7);
      break;
    case "biweekly":
      nextAccrual.setDate(lastAccrual.getDate() + 14);
      break;
    case "semi-monthly":
      if (lastAccrual.getDate() < 15) {
        nextAccrual.setDate(15);
      } else {
        nextAccrual.setDate(1);
        nextAccrual.setMonth(lastAccrual.getMonth() + 1);
      }
      break;
  }

  return toDateString(nextAccrual);
};

// WHY: Weekend days are handled differently in PTO calculations
// WHAT: Checks if a date falls on Saturday or Sunday
export const isWeekend = (dateString: string): boolean => {
  const date = createDateFromYMD(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

// WHY: Need to calculate business days between dates
// WHAT: Returns array of business days between two dates
export const getBusinessDaysBetweenDates = (
  startDate: string,
  endDate: string
): string[] => {
  const start = createDateFromYMD(startDate);
  const end = createDateFromYMD(endDate);
  const dates: string[] = [];

  const current = new Date(start);
  while (current <= end) {
    const currentString = toDateString(current);
    if (!isWeekend(currentString)) {
      dates.push(currentString);
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// WHY: Need to calculate number of accrual periods between dates
// WHAT: Returns number of complete periods between dates
export const calculatePayPeriodsBetweenDates = (
  startDate: string,
  endDate: string,
  accrualPeriodType: AccrualPeriodType
): number => {
  const start = createDateFromYMD(startDate);
  const end = createDateFromYMD(endDate);
  const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  switch (accrualPeriodType) {
    case "weekly":
      return Math.floor(daysDifference / 7);
    case "biweekly":
      return Math.floor(daysDifference / 14);
    case "semi-monthly":
      return Math.floor(daysDifference / 15.2);
  }
};