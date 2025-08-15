"use client";

import React, { useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { timeToMinutes, SNAP_PX } from "../utils/layout-utils";

import type { Task } from "../types/types";
import { MdLocalGroceryStore } from "react-icons/md";

export default function TaskCard({
  task,
  top,
  height,
  leftCalc,
  widthCalc,
  zIndex,
  containerRef,
  onResizeMove,
  onResizeEnd,
}: {
  task: Task;
  top: number;
  height: number;
  leftCalc: string;
  widthCalc: string;
  zIndex?: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onResizeMove?: (id: string, newEndY: number) => void;
  onResizeEnd?: (id: string, newEndY: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });
  const transformY = transform?.y ?? 0;
  const MIN_HEIGHT_PX = SNAP_PX; // enforce a minimum of one snap interval

  const snappedY = Math.round((top + transformY) / SNAP_PX) * SNAP_PX;

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
      // Prefer computing absolute Y from the container rect to avoid scroll/offset issues
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = containerRef.current.scrollTop || 0;
        const absY = ev.clientY - rect.top + scrollTop; // y within timeline content (accounts for scroll)
        let snappedEnd = Math.round(absY / SNAP_PX) * SNAP_PX;
        // clamp within bounds of the timeline content and ensure minimum height
        const maxY =
          containerRef.current.scrollHeight || Number.POSITIVE_INFINITY;
        snappedEnd = Math.min(Math.max(snappedEnd, top + MIN_HEIGHT_PX), maxY);
        if (onResizeMove) onResizeMove(task.id, snappedEnd);
      } else {
        // fallback to relative delta if container not provided
        const delta = ev.clientY - startRef.current.startClientY;
        const newHeight = Math.max(
          MIN_HEIGHT_PX,
          startRef.current.startHeight + delta
        );
        const snapped = Math.round(newHeight / SNAP_PX) * SNAP_PX;
        const newEndY = top + snapped; // absolute y from top of timeline
        if (onResizeMove) onResizeMove(task.id, newEndY);
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (!startRef.current) return;
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = containerRef.current.scrollTop || 0;
        const absY = ev.clientY - rect.top + scrollTop;
        let snappedEnd = Math.round(absY / SNAP_PX) * SNAP_PX;
        const maxY =
          containerRef.current.scrollHeight || Number.POSITIVE_INFINITY;
        snappedEnd = Math.min(Math.max(snappedEnd, top + MIN_HEIGHT_PX), maxY);
        if (onResizeEnd) onResizeEnd(task.id, snappedEnd);
      } else {
        const delta = ev.clientY - startRef.current.startClientY;
        const newHeight = Math.max(
          MIN_HEIGHT_PX,
          startRef.current.startHeight + delta
        );
        const snapped = Math.round(newHeight / SNAP_PX) * SNAP_PX;
        const newEndY = top + snapped;
        if (onResizeEnd) onResizeEnd(task.id, newEndY);
      }
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
      className={`absolute rounded-2xl py-2 px-4 text-sm shadow border-1 border-gray-600/25 ${task.color}`}
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
        {/* allow the flex child to shrink so truncate works */}
        <div className="flex-1 min-w-0">
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

          <div className="font-medium text-md flex items-center gap-2">
            <MdLocalGroceryStore className="text-md" />
            {/* truncate long titles with an ellipsis */}
            <span className="truncate">{task.title}</span>
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
