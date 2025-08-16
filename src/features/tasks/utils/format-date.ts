export const formatDayToDate = (day?: {
  dayName: string;
  dateNum: number;
  monthName: string;
  year: number;
}) => {
  if (!day) return;
  const monthMap: Record<string, number> = {
    Jan: 0,
    January: 0,
    Feb: 1,
    February: 1,
    Mar: 2,
    March: 2,
    Apr: 3,
    April: 3,
    May: 4,
    Jun: 5,
    June: 5,
    Jul: 6,
    July: 6,
    Aug: 7,
    August: 7,
    Sep: 8,
    September: 8,
    Oct: 9,
    October: 9,
    Nov: 10,
    November: 10,
    Dec: 11,
    December: 11,
  };

  const monthNum = monthMap[day.monthName];
  const date = new Date(day.year, monthNum, day.dateNum);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

export function parseSlugToDay(slug: string) {
  const date = new Date(slug);
  return {
    dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
    dateNum: date.getDate(),
    monthName: date.toLocaleDateString("en-US", { month: "long" }),
    year: date.getFullYear(),
    count: 0,
  };
}
