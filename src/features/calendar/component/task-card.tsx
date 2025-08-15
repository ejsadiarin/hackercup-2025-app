"use client";

import React, { useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { timeToMinutes } from "../utils/layout-utils";

import type { Task } from "../types/types";
import { MdLocalGroceryStore } from "react-icons/md";

export default function TaskCard({
  task,
  top,
  height,
  leftCalc,
  widthCalc,
  zIndex,
  onResizeMove,
  onResizeEnd,
}: {
  task: Task;
  top: number;
  height: number;
  leftCalc: string;
  widthCalc: string;
  zIndex?: number;
  onResizeMove?: (id: string, newEndY: number) => void;
  onResizeEnd?: (id: string, newEndY: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });
  const transformY = transform?.y ?? 0;
  const snappedY = Math.round((top + transformY) / 15) * 15;

  const displayHeight = height;

  const startRef = useRef<{ startClientY: number; startHeight: number } | null>(
    null
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {}
    startRef.current = { startClientY: e.clientY, startHeight: height };

    const onPointerMove = (ev: PointerEvent) => {
      if (!startRef.current) return;
      const delta = ev.clientY - startRef.current.startClientY;
      const newHeight = Math.max(15, startRef.current.startHeight + delta);
      const snapped = Math.round(newHeight / 15) * 15;
      const newEndY = top + snapped; // absolute y from top of timeline
      if (onResizeMove) onResizeMove(task.id, newEndY);
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (!startRef.current) return;
      const delta = ev.clientY - startRef.current.startClientY;
      const newHeight = Math.max(15, startRef.current.startHeight + delta);
      const snapped = Math.round(newHeight / 15) * 15;
      const newEndY = top + snapped;
      if (onResizeEnd) onResizeEnd(task.id, newEndY);
      startRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-label={`${task.title} from ${task.start} to ${task.end}`}
      className={`absolute rounded p-2 text-sm shadow ${task.color}`}
      style={{
        top: snappedY,
        height: displayHeight,
        left: leftCalc,
        width: widthCalc,
        zIndex: zIndex ?? undefined,
        marginRight: 8,
        boxSizing: "border-box",
      }}
    >
      <div className="flex items-start h-full">
        <div className="w-1 rounded-l mr-2 bg-blue-500" />
        <div className="flex-1">
          {/* <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={() => console.log("hi")}
            className="bg-gray-500 p-4 text-white"
          >
            hi
          </button> */}

          <div className="font-medium text-sm flex items-center gap-2">
            <MdLocalGroceryStore />
            {task.title}
          </div>
          <div className="text-xs text-gray-600">
            {task.start} — {task.end}
          </div>
        </div>
        <div className="ml-2 text-xs text-gray-500">
          {Math.max(
            Math.round(timeToMinutes(task.end) - timeToMinutes(task.start)),
            0
          )}
          m
        </div>
      </div>

      {/* resize handle at bottom - pointer-based */}
      <div
        onPointerDown={handlePointerDown}
        role="button"
        aria-label={`Resize ${task.title}`}
        className="absolute left-0 right-0 h-3 cursor-row-resize flex items-center justify-center"
        style={{ bottom: 0 }}
      >
        <div className="w-6 h-0.5 bg-gray-400 rounded" />
      </div>
    </div>
  );
}
