// Utility functions and constants used by the Day Planner components
export const GUTTER = 56; // px left gutter for time labels
export const PIXELS_PER_MINUTE = 1; // 1 minute == 1px for simplicity
export const START_HOUR = 0;
export const HOURS = 24; // 0:00 - 23:00

export const hourSlots = Array.from(
  { length: HOURS },
  (_, i) => i + START_HOUR
);

export function parseTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
}

export function timeToY(time: string) {
  const { h, m } = parseTime(time);
  return (h - START_HOUR) * 60 * PIXELS_PER_MINUTE + m * PIXELS_PER_MINUTE;
}

export function yToTime(y: number) {
  const totalMinutes = Math.round(y / (15 * PIXELS_PER_MINUTE)) * 15; // snap to 15
  const h = Math.floor(totalMinutes / 60) + START_HOUR;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Compute overlapping group positions: returns { index, size } per task id
export function computePositions(
  tasks: { id: string; start: string; end: string }[]
) {
  type Interval = { id: string; start: number; end: number };
  const intervals: Interval[] = tasks.map((t) => ({
    id: t.id,
    start: timeToY(t.start),
    end: timeToY(t.end),
  }));
  intervals.sort((a, b) => a.start - b.start);

  const groups: Interval[][] = [];
  for (const iv of intervals) {
    let placed = false;
    for (const g of groups) {
      const groupEnd = Math.max(...g.map((x) => x.end));
      if (iv.start < groupEnd) {
        g.push(iv);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([iv]);
  }

  const positions: Record<string, { index: number; size: number }> = {};
  for (const g of groups) {
    const sorted = g.slice().sort((a, b) => a.start - b.start);
    const size = sorted.length;
    sorted.forEach((iv, idx) => {
      positions[iv.id] = { index: idx, size };
    });
  }
  return positions;
}
