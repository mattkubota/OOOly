// WHY: Complex PTO calculations need to be optimized and centralized
// WHAT: Custom hook that provides memoized PTO calculations
// NOTE: Uses useMemo to prevent unnecessary recalculations

import { useMemo } from "react";
import { PTOEvent, PTOSettings } from "../types";
import { calculateNextAccrualDate } from "../utils/dateCalculations";
import { calculateYearEndProjection } from "../utils/ptoCalculations";

export function usePTOCalculations(settings: PTOSettings, events: PTOEvent[]) {
  // WHY: Need to know when next PTO hours will be added
  // WHAT: Calculates the next accrual date based on settings
  // NOTE: Memoized to prevent recalculation unless inputs change
  const nextAccrual = useMemo(
    () =>
      calculateNextAccrualDate(
        settings.lastAccrualDate,
        settings.accrualPeriodType
      ),
    [settings.lastAccrualDate, settings.accrualPeriodType]
  );

  // WHY: Users need to plan for year-end PTO management
  // WHAT: Projects final balance and identifies potential lost hours
  const yearEndProjection = useMemo(
    () => calculateYearEndProjection(settings, events),
    [settings, events]
  );

  // WHY: Need to warn users before they risk losing PTO
  // WHAT: Triggers warning when balance exceeds 80% of rollover limit
  const shouldWarnAboutRollover = useMemo(() => {
    if (!settings.hasMaxRollover) return false;
    return settings.currentBalance > settings.maxRollover * 0.8;
  }, [settings]);

  // WHY: Users need to see how their balance will change over time
  // WHAT: Calculates projected balances after each planned event
  // NOTE: Events are processed chronologically for accurate projections
  const futureBalances = useMemo(() => {
    const balances = events.map((event) => {
      const date = new Date(event.startDate);
      const priorEvents = events.filter((e) => new Date(e.startDate) < date);

      let balance = settings.currentBalance;
      priorEvents.forEach((e) => {
        balance -= e.totalHours;
      });

      return {
        date,
        event,
        balance,
      };
    });

    return balances.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [settings, events]);

  return {
    nextAccrual,
    yearEndProjection,
    shouldWarnAboutRollover,
    futureBalances,
  };
}
