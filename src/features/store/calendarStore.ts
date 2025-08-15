import { create } from "zustand";

type WeekDay = {
  dayName: string;
  dateNum: number;
  monthName: string;
  year: number;
  count: number;
};

type CalendarState = {
  selectedDay: WeekDay | null;
  setSelectedDay: (day: WeekDay) => void;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDay: null,
  setSelectedDay: (day) => set({ selectedDay: day }),
}));
