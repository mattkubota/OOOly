import { PayPeriodType } from '../types';

export const calculateNextAccrualDate = (
  lastAccrualDate: string,
  payPeriodType: PayPeriodType
): Date => {
  const lastAccrual = new Date(lastAccrualDate);
  const nextAccrual = new Date(lastAccrual);
  
  if (payPeriodType === 'biweekly') {
    nextAccrual.setDate(lastAccrual.getDate() + 14);
  } else {
    if (lastAccrual.getDate() < 15) {
      nextAccrual.setDate(15);
    } else {
      nextAccrual.setDate(1);
      nextAccrual.setMonth(nextAccrual.getMonth() + 1);
    }
  }
  
  return nextAccrual;
};

export const calculatePayPeriodsBetweenDates = (
  startDate: string,
  endDate: string,
  payPeriodType: PayPeriodType
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDifference = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  if (payPeriodType === 'biweekly') {
    return Math.floor(daysDifference / 14);
  } else {
    // Semi-monthly: Approximate by dividing total days by 15.2 (365/24)
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