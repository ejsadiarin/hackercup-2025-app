type WeekDay = {
  dayName: string;
  dateNum: number;
  monthName: string;
  year: number;
  count: number;
};

type CalendarDayProps = {
  day: WeekDay;
  onClick?: () => void;
  isSelected?: boolean;
};

export default function CalendarDay({
  day,
  onClick,
  isSelected,
}: CalendarDayProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="text-center">{day.dayName[0]}</div>
      <div
        className={`w-[32px] h-[32px] rounded-sm ${
          isSelected ? "bg-[#A600A9]" : "bg-[#AAAAAA]"
        }`}
      ></div>
      <div className="text-center">{day.dateNum}</div>
    </div>
  );
}
