type WeekDay = {
  dayName: string;
  dateNum: number;
  monthName: string;
  year: number;
  count: number;
};

type CalendarDayProps = {
  day: WeekDay;
};

export default function CalendarDay({ day }: CalendarDayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="text-center">{day.dayName[0]}</div>
      <div className="w-[32px] h-[32px] bg-[#A600A9] rounded-sm"></div>
      <div className="text-center">{day.dateNum}</div>
    </div>
  );
}
