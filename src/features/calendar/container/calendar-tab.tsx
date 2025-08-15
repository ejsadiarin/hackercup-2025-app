"use client";
import CalendarDay from "../component/calendar-day";
import { useWeekSelector } from "../hooks/useWeekSelector";

export default function CalendarTab() {
  const { days, header, prevWeek, nextWeek } = useWeekSelector(new Date());

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
          <CalendarDay key={index} day={day} />
        ))}
      </div>
    </div>
  );
}
