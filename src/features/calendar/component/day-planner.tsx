"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import TaskCard from "./task-card";
import {
  GUTTER,
  PIXELS_PER_MINUTE,
  START_HOUR,
  HOURS,
  hourSlots,
  timeToY,
  yToTime,
  computePositions,
  mapApiTasks,
} from "../utils/layout-utils";
import { useTasksQuery } from "@/features/tasks/hooks/useTasksQuery";
import { useUpdateTaskMutation } from "@/features/tasks/hooks/useUpdateTaskMutation";

type Task = {
  id: string;
  title: string;
  start: string; // HH:MM
  end: string; // HH:MM
  color: string;
};

export default function DayPlanner({ slug }: { slug: string }) {
  const selectedDay = slug;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    data: apiTasks,
    isLoading,
    error,
  } = useTasksQuery(selectedDay ? selectedDay : undefined);

  const timelineHeight = HOURS * 60 * PIXELS_PER_MINUTE; // 1440
  // content width calculation not required; layout uses absolute positioning

  // computePositions provided by layout-utils
  const [tasks, setTasks] = useState<Task[]>([]);
  const positions = useMemo(() => computePositions(tasks), [tasks]);

  const updateTaskMutation = useUpdateTaskMutation();

  useEffect(() => {
    if (apiTasks) {
      setTasks(mapApiTasks(apiTasks));
    }
  }, [apiTasks]);

  // Precompute layout info so JSX only contains expressions and avoid re-calculating on every render
  const layout = useMemo(() => {
    const arr = tasks.map((task) => {
      const top = timeToY(task.start);
      const height = Math.max(timeToY(task.end) - timeToY(task.start), 15);
      const pos = positions[task.id] ?? { index: 0, size: 1 };
      const baseWidth = Math.max(100 - pos.index * 25, 25);
      const widthPercentNum = pos.size === 1 ? 100 : baseWidth;
      // Anchor reduced widths to the right: left% = 100 - width%
      const leftPercentNum = Math.max(0, 100 - widthPercentNum);
      const zIndex = 1000 - Math.round(widthPercentNum); // narrower => larger zIndex
      return { task, top, height, widthPercentNum, leftPercentNum, zIndex };
    });
    // Render wider tasks first so narrower tasks render on top
    arr.sort((a, b) => b.widthPercentNum - a.widthPercentNum);
    return arr;
  }, [tasks, positions]);

  // Handle drag end (move only)
  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const deltaY = (event.delta?.y as number) ?? 0;

    setTasks((prev) =>
      prev.map((task) => {
        // Move only
        if (activeId === task.id) {
          const currentTop = timeToY(task.start);
          const newTop = currentTop + deltaY;
          const clamped = Math.min(
            Math.max(newTop, 0),
            Math.max(
              timelineHeight - (timeToY(task.end) - timeToY(task.start)),
              0
            )
          );
          const newStart = yToTime(clamped);
          const duration = timeToY(task.end) - timeToY(task.start);
          const newEnd = yToTime(clamped + duration);

          const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD
          const isoStart = new Date(`${today}T${newStart}:00`).toISOString();
          const isoEnd = new Date(`${today}T${newEnd}:00`).toISOString();
          updateTaskMutation.mutate({
            id: Number(task.id),
            start_date: isoStart,
            end_date: isoEnd,
          });

          return { ...task, start: newStart, end: newEnd };
        }
        return task;
      })
    );
  };

  // current time indicator
  const [nowY, setNowY] = useState<number | null>(null);
  useEffect(() => {
    const updateNow = () => {
      const d = new Date();
      const totalMinutes = d.getHours() * 60 + d.getMinutes();
      const startMinutes = START_HOUR * 60;
      const y = (totalMinutes - startMinutes) * PIXELS_PER_MINUTE;
      if (y >= 0 && y <= timelineHeight) setNowY(y);
      else setNowY(null);
    };
    updateNow();
    const id = setInterval(updateNow, 60_000);
    return () => clearInterval(id);
  }, [timelineHeight]);

  // Helper to format hour labels: show 0 as 12AM
  const formatHour = (h: number) =>
    h === 0 ? `12AM` : h < 12 ? `${h}AM` : h === 12 ? `12PM` : `${h - 12}PM`;

  // Auto-scroll to earliest task on mount
  useEffect(() => {
    if (tasks.length === 0 || !containerRef.current) return;

    // Find the earliest start time
    const earliestTask = tasks.reduce((earliest, task) => {
      const taskStart = timeToY(task.start);
      const earliestStart = timeToY(earliest.start);
      return taskStart < earliestStart ? task : earliest;
    });

    // Calculate scroll position (with some padding above)
    const scrollToY = Math.max(0, timeToY(earliestTask.start) - 60); // 60px padding above

    // Scroll to position
    containerRef.current.scrollTop = scrollToY;
  }, [tasks]);

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      {/* scrollable viewport */}
      <div
        ref={containerRef}
        className="border bg-white overflow-auto"
        style={{ height: 576, minWidth: 320 }}
      >
        {/* flex row: left gutter (sticky) + right content */}
        <div style={{ display: "flex", minHeight: timelineHeight }}>
          {/* left gutter - sticky so hour labels remain visible while scrolling */}
          <div
            style={{ width: GUTTER, position: "sticky", top: 0 }}
            className="text-xs text-right pr-3"
          >
            {hourSlots.map((h) => (
              <div
                key={h}
                style={{ height: 60 }}
                className="flex items-start justify-end"
              >
                <span className="mt-0.5 text-gray-600">{formatHour(h)}</span>
              </div>
            ))}
          </div>

          {/* right content area - absolutely positioned grid and tasks */}
          <div
            style={{ position: "relative", flex: 1, height: timelineHeight }}
          >
            {/* quarter marks */}
            {Array.from({ length: HOURS * 4 + 1 }, (_, i) => i * 15).map(
              (min) => (
                <div
                  key={min}
                  style={{ top: min, position: "absolute", left: 0, right: 0 }}
                  className={
                    min % 60 === 0
                      ? "h-[1px] bg-gray-300"
                      : "h-[1px] bg-gray-100"
                  }
                />
              )
            )}

            {/* current time line */}
            {nowY !== null && (
              <div
                style={{ position: "absolute", left: 0, right: 0, top: nowY }}
              >
                <div className="relative">
                  <div className="absolute left-0 right-0 h-[2px] bg-red-500" />
                  <div className="absolute -top-3 right-2 px-2 text-xs bg-red-500 text-white rounded">
                    Now
                  </div>
                </div>
              </div>
            )}

            {/* tasks */}
            {layout.map((item) => (
              <TaskCard
                key={item.task.id}
                task={item.task}
                top={item.top}
                height={item.height}
                leftCalc={`${item.leftPercentNum}%`}
                widthCalc={`calc(${item.widthPercentNum}% - 8px)`}
                zIndex={item.zIndex}
                containerRef={containerRef}
                onResizeMove={(id, newEndY) => {
                  setTasks((prev) =>
                    prev.map((t) => {
                      if (t.id !== id) return t;
                      return { ...t, end: yToTime(newEndY) };
                    })
                  );
                }}
                onResizeEnd={(id, newEndY) => {
                  setTasks((prev) =>
                    prev.map((t) => {
                      if (t.id !== id) return t;
                      // Call your existing mutation
                      const newEndTime = yToTime(newEndY);
                      const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD
                      const isoEnd = new Date(
                        `${today}T${newEndTime}:00`
                      ).toISOString();
                      updateTaskMutation.mutate({
                        id: Number(id),
                        end_date: isoEnd,
                      });
                      return { ...t, end: newEndTime };
                    })
                  );
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
