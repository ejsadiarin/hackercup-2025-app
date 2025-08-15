/* Shared layout utilities for the day planner */

export const GUTTER = 72; // px for left gutter
export const PIXELS_PER_MINUTE = 1; // 1px == 1 minute
export const START_HOUR = 0; // 0 == midnight
export const HOURS = 24;

export const SNAP_MINUTES = 15;
export const SNAP_PX = SNAP_MINUTES * PIXELS_PER_MINUTE;

export const hourSlots = Array.from(
  { length: HOURS },
  (_, i) => START_HOUR + i
);

export function parseTime(hm: string) {
  const [hStr, mStr] = hm.split(":");
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return h * 60 + m;
}

export function timeToY(hm: string) {
  const minutes = parseTime(hm);
  const startMinutes = START_HOUR * 60;
  return (minutes - startMinutes) * PIXELS_PER_MINUTE;
}

export function yToTime(y: number) {
  const minutes = Math.round(y / PIXELS_PER_MINUTE);
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function timeToMinutes(hm: string) {
  return parseTime(hm);
}

// computePositions: for each task returns { index, size }
// index = column index (0 = left-most), size = total columns for that task's overlapping group
export function computePositions<
  T extends { id: string; start: string; end: string }
>(tasks: T[]): Record<string, { index: number; size: number }> {
  const positions: Record<string, { index: number; size: number }> = {};

  // Precompute minutes
  const byId = tasks.map((t) => ({
    ...t,
    startM: parseTime(t.start),
    endM: parseTime(t.end),
  }));

  for (const t of byId) {
    const overlaps = byId
      .filter((o) => !(o.endM <= t.startM || o.startM >= t.endM))
      .sort((a, b) => a.startM - b.startM || a.endM - b.endM);

    const size = Math.max(overlaps.length, 1);
    const index = overlaps.findIndex((o) => o.id === t.id);
    positions[t.id] = { index: index >= 0 ? index : 0, size };
  }

  return positions;
}
