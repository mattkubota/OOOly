import { AccrualPeriodType } from '../types';

export const calculateNextAccrualDate = (
  lastAccrualDate: string,
  accrualPeriodType: AccrualPeriodType
): Date => {
  const lastAccrual = new Date(lastAccrualDate);
  const nextAccrual = new Date(lastAccrual);

  switch (accrualPeriodType) {
    case 'weekly':
      nextAccrual.setDate(lastAccrual.getDate() + 7);
      break;
    case 'biweekly':
      nextAccrual.setDate(lastAccrual.getDate() + 14);
      break;
    case 'semi-monthly':
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

export const calculatePayPeriodsBetweenDates = (
  startDate: string,
  endDate: string,
  accrualPeriodType: AccrualPeriodType
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDifference = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  switch (accrualPeriodType) {
    case 'weekly':
      return Math.floor(daysDifference / 7);
    case 'biweekly':
      return Math.floor(daysDifference / 14);
    case 'semi-monthly':
      // Approximate by dividing total days by 15.2 (365/24)
      return Math.floor(daysDifference / 15.2);
  }
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

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