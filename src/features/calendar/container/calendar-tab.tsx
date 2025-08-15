"use client";
import { useEffect } from "react";
import { useCalendarStore } from "@/features/store/calendarStore";
import CalendarDay from "../component/calendar-day";
import { useWeekSelector } from "../hooks/useWeekSelector";

export default function CalendarTab() {
  const { days, prevWeek, nextWeek } = useWeekSelector(new Date());
  const { selectedDay, setSelectedDay } = useCalendarStore();

  useEffect(() => {
    if (!selectedDay) {
      const now = new Date();
      const today = {
        dateNum: now.getDate(),
        monthName: now.toLocaleDateString("en-US", { month: "short" }),
        year: now.getFullYear(),
        dayName: now.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0, // can be anything; only used in your store
      };

      // Try to find today in the current week
      const found = days.find(
        (d) =>
          d.dateNum === today.dateNum &&
          d.monthName === today.monthName &&
          d.year === today.year
      );

      setSelectedDay(found || days[0]); // fallback to first day if today not in week
    }
  }, [selectedDay, setSelectedDay, days]);

  return (
    <div className="mt-10 flex flex-col items-center gap-6">
      {/* Top row: Date range + navigation */}
      <div className="flex w-full max-w-lg items-center justify-between font-bold">
        <span>
          {days[0].monthName} {days[0].dateNum} - {days[6].monthName}{" "}
          {days[6].dateNum}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ←
          </button>
          <button
            onClick={nextWeek}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            →
          </button>
        </div>
      </div>

      {/* Days row */}
      <div className="flex gap-4">
        {days.map((day, index) => (
          <CalendarDay
            key={index}
            day={day}
            onClick={() => setSelectedDay(day)}
            isSelected={
              selectedDay?.dateNum === day.dateNum &&
              selectedDay?.monthName === day.monthName &&
              selectedDay?.year === day.year
            }
          />
        ))}
      </div>
    </div>
  );
}
