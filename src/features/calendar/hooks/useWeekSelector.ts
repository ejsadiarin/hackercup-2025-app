"use client";
import { useState } from "react";

type WeekDay = {
  dayName: string;
  dateNum: number;
  monthName: string;
  year: number;
  count: number;
};

type UseWeekSelectorReturn = {
  days: WeekDay[];
  header: string;
  prevWeek: () => void;
  nextWeek: () => void;
};

export function useWeekSelector(
  initialDate: Date = new Date()
): UseWeekSelectorReturn {
  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeek(initialDate));

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    d.setDate(d.getDate() - day);
    return d;
  }

  function getWeekDates(start: Date): WeekDay[] {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dateNum: date.getDate(),
        monthName: date.toLocaleDateString("en-US", { month: "short" }),
        year: date.getFullYear(),
        count: Math.floor(Math.random() * 15) + 5, // placeholder
      };
    });
  }

  const prevWeek = () =>
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });

  const nextWeek = () =>
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });

  const days = getWeekDates(weekStart);

  // Header logic
  const firstDay = days[0];
  const lastDay = days[6];
  const header =
    firstDay.monthName === lastDay.monthName && firstDay.year === lastDay.year
      ? `${firstDay.monthName} ${firstDay.year}`
      : `${firstDay.monthName} ${firstDay.year} – ${lastDay.monthName} ${lastDay.year}`;

  return { days, header, prevWeek, nextWeek };
}
